// ============================================================================
// CommunityMembersScreen.tsx - Miembros de la Comunidad
// ============================================================================
// 100% Backend Driven + UI Moderna
// Accesible desde: CommunityDetailScreen (menú ...)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView
} from 'react-native'
import { ArrowLeft, Search, Shield, Crown, UserPlus, MoreVertical, X } from 'lucide-react-native'
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import { getCommunityMembers, removeCommunityMember, updateMemberRole, getCurrentUser } from '../rest/api'

// ============================================================================
// INTERFACES
// ============================================================================

interface Member {
  id: string
  user_id: string
  community_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  user: {
    id: string
    nombre: string
    full_name: string
    avatar_url: string
    photo_url: string
    bio?: string
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CommunityMembersScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { communityId, communityName } = route.params as { communityId: string; communityName?: string }

  // Estados
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'moderator' | 'member'>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchQuery, selectedRole])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const [membersData, user] = await Promise.all([
        getCommunityMembers(communityId),
        getCurrentUser()
      ])

      setMembers(membersData || [])
      setCurrentUser(user)

      // Verificar si el usuario actual es admin
      const userMembership = membersData?.find((m: Member) => m.user_id === user?.id)
      setIsAdmin(userMembership?.role === 'admin')

    } catch (error) {
      console.error('Error loading members:', error)
      Alert.alert('Error', 'No se pudieron cargar los miembros')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(member =>
        (member.user.full_name || member.user.nombre || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    }

    // Filtrar por rol
    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole)
    }

    setFilteredMembers(filtered)
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadMembers()
  }, [])

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!isAdmin) {
      Alert.alert('Permiso denegado', 'Solo los administradores pueden eliminar miembros')
      return
    }

    Alert.alert(
      'Eliminar miembro',
      `¿Estás seguro de que deseas eliminar a ${memberName} de la comunidad?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCommunityMember(communityId, memberId)
              setMembers(prev => prev.filter(m => m.id !== memberId))
              Alert.alert('Éxito', 'Miembro eliminado de la comunidad')
            } catch (error) {
              console.error('Error removing member:', error)
              Alert.alert('Error', 'No se pudo eliminar el miembro')
            }
          }
        }
      ]
    )
  }

  const handleChangeRole = async (memberId: string, currentRole: string, memberName: string) => {
    if (!isAdmin) {
      Alert.alert('Permiso denegado', 'Solo los administradores pueden cambiar roles')
      return
    }

    const roles = [
      { label: 'Miembro', value: 'member' },
      { label: 'Moderador', value: 'moderator' },
      { label: 'Administrador', value: 'admin' }
    ]

    Alert.alert(
      'Cambiar rol',
      `Selecciona el nuevo rol para ${memberName}`,
      [
        ...roles.map(role => ({
          text: role.label,
          onPress: async () => {
            if (role.value !== currentRole) {
              try {
                await updateMemberRole(communityId, memberId, role.value)
                setMembers(prev =>
                  prev.map(m =>
                    m.id === memberId ? { ...m, role: role.value as any } : m
                  )
                )
                Alert.alert('Éxito', `Rol actualizado a ${role.label}`)
              } catch (error) {
                console.error('Error updating role:', error)
                Alert.alert('Error', 'No se pudo actualizar el rol')
              }
            }
          }
        })),
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  // ============================================================================
  // FORMATEAR TIEMPO
  // ============================================================================

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays < 1) return 'Hoy'
    if (diffDays < 7) return `Hace ${diffDays}d`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
    
    return date.toLocaleDateString('es', { month: 'short', year: 'numeric' })
  }

  // ============================================================================
  // RENDER ROLE BADGE
  // ============================================================================

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { icon: <Crown size={14} color="#FFD700" />, label: 'Admin', color: '#FFD700' }
      case 'moderator':
        return { icon: <Shield size={14} color="#2673f3" />, label: 'Mod', color: '#2673f3' }
      default:
        return null
    }
  }

  // ============================================================================
  // RENDER MEMBER ITEM
  // ============================================================================

  const renderMemberItem = ({ item }: { item: Member }) => {
    const roleBadge = getRoleBadge(item.role)
    const memberName = item.user.full_name || item.user.nombre || 'Usuario'

    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => navigation.navigate('Profile', { userId: item.user_id })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.user.avatar_url || item.user.photo_url || 'https://i.pravatar.cc/100' }}
          style={styles.memberAvatar}
        />
        
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{memberName}</Text>
            {roleBadge && (
              <View style={[styles.roleBadge, { borderColor: roleBadge.color }]}>
                {roleBadge.icon}
                <Text style={[styles.roleText, { color: roleBadge.color }]}>
                  {roleBadge.label}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.memberMeta}>
            Miembro desde {getTimeAgo(item.joined_at)}
          </Text>
          {item.user.bio && (
            <Text style={styles.memberBio} numberOfLines={1}>
              {item.user.bio}
            </Text>
          )}
        </View>

        {isAdmin && item.user_id !== currentUser?.id && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Opciones',
                `Gestionar a ${memberName}`,
                [
                  {
                    text: 'Cambiar rol',
                    onPress: () => handleChangeRole(item.id, item.role, memberName)
                  },
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleRemoveMember(item.id, memberName)
                  },
                  { text: 'Cancelar', style: 'cancel' }
                ]
              )
            }}
          >
            <MoreVertical size={20} color="#666" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  // ============================================================================
  // RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Miembros</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando miembros...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Miembros</Text>
          {communityName && (
            <Text style={styles.headerSubtitle}>{communityName}</Text>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar miembros..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de Rol */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedRole('all')}
        >
          <Text style={[styles.filterChipText, selectedRole === 'all' && styles.filterChipTextActive]}>
            Todos ({members.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'admin' && styles.filterChipActive]}
          onPress={() => setSelectedRole('admin')}
        >
          <Crown size={14} color={selectedRole === 'admin' ? '#fff' : '#666'} />
          <Text style={[styles.filterChipText, selectedRole === 'admin' && styles.filterChipTextActive]}>
            Admins ({members.filter(m => m.role === 'admin').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'moderator' && styles.filterChipActive]}
          onPress={() => setSelectedRole('moderator')}
        >
          <Shield size={14} color={selectedRole === 'moderator' ? '#fff' : '#666'} />
          <Text style={[styles.filterChipText, selectedRole === 'moderator' && styles.filterChipTextActive]}>
            Mods ({members.filter(m => m.role === 'moderator').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'member' && styles.filterChipActive]}
          onPress={() => setSelectedRole('member')}
        >
          <Text style={[styles.filterChipText, selectedRole === 'member' && styles.filterChipTextActive]}>
            Miembros ({members.filter(m => m.role === 'member').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de Miembros */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2673f3']}
            tintColor="#2673f3"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Search size={64} color="#e5e5e5" />
            <Text style={styles.emptyTitle}>No se encontraron miembros</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay miembros en esta comunidad'}
            </Text>
          </View>
        }
      />

      {/* Botón Invitar (solo para admins) */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => Alert.alert('Invitar', 'Función de invitación próximamente')}
        >
          <UserPlus size={20} color="#fff" />
          <Text style={styles.inviteButtonText}>Invitar miembros</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    padding: 0,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2673f3',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  memberBio: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2673f3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default CommunityMembersScreen