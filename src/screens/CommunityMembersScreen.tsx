// ============================================================================
// CommunityMembersScreen.tsx - Gestión de Miembros de Comunidad
// ============================================================================
// 100% Backend Driven + UI Profesional Moderna
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
  ScrollView,
  Platform
} from 'react-native'
import { 
  ArrowLeft, 
  Search, 
  Shield, 
  Crown, 
  UserPlus, 
  MoreVertical, 
  X,
  Users,
  UserCheck,
  UserX,
  Star
} from 'lucide-react-native'
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'

// ============================================================================
// INTERFACES
// ============================================================================

interface Member {
  id: string
  user_id: string
  community_id: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  status: 'active' | 'banned' | 'left' | 'pending'
  joined_at: string
  user: {
    id: string
    nombre: string
    full_name: string
    username: string
    avatar_url: string
    photo_url: string
    bio?: string
    role?: string
    location?: string
  }
}

interface MemberStats {
  total: number
  admins: number
  moderators: number
  members: number
  online: number
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CommunityMembersScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { communityId, communityName } = route.params as { 
    communityId: string
    communityName?: string 
  }

  // Estados
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | 'owner' | 'admin' | 'moderator' | 'member'>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('member')
  const [stats, setStats] = useState<MemberStats>({
    total: 0,
    admins: 0,
    moderators: 0,
    members: 0,
    online: 0
  })

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
      
      // Obtener usuario actual y miembros en paralelo
      const [user, membersData] = await Promise.all([
        getCurrentUser(),
        fetchCommunityMembers(communityId)
      ])

      setCurrentUser(user)
      setMembers(membersData || [])

      // Verificar rol del usuario actual
      const userMembership = membersData?.find((m: Member) => m.user_id === user?.id)
      const userRole = userMembership?.role || 'member'
      setCurrentUserRole(userRole)

      // Calcular estadísticas
      calculateStats(membersData || [])

    } catch (error) {
      console.error('Error loading members:', error)
      Alert.alert('Error', 'No se pudieron cargar los miembros')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchCommunityMembers = async (communityId: string): Promise<Member[]> => {
    try {
      const response = await request("GET", "/user_communities", {
        params: {
          select: "id,user_id,community_id,role,status,joined_at,user:users(id,nombre,full_name,username,photo_url,avatar_url,bio,role,location,is_online)",
          community_id: `eq.${communityId}`,
          status: 'eq.active',
          order: 'joined_at.desc'
        }
      })

      return response || []
    } catch (error) {
      console.error('Error fetching community members:', error)
      return []
    }
  }

  const calculateStats = (membersData: Member[]) => {
    const newStats: MemberStats = {
      total: membersData.length,
      admins: membersData.filter(m => m.role === 'admin' || m.role === 'owner').length,
      moderators: membersData.filter(m => m.role === 'moderator').length,
      members: membersData.filter(m => m.role === 'member').length,
      online: membersData.filter(m => (m.user as any).is_online).length
    }
    setStats(newStats)
  }

  const filterMembers = () => {
    let filtered = members

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member => {
        const name = (member.user.full_name || member.user.nombre || '').toLowerCase()
        const username = (member.user.username || '').toLowerCase()
        const bio = (member.user.bio || '').toLowerCase()
        return name.includes(query) || username.includes(query) || bio.includes(query)
      })
    }

    // Filtrar por rol
    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole)
    }

    // Ordenar: owners/admins primero, luego por fecha
    filtered.sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 }
      const roleA = roleOrder[a.role] ?? 4
      const roleB = roleOrder[b.role] ?? 4
      
      if (roleA !== roleB) return roleA - roleB
      return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
    })

    setFilteredMembers(filtered)
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadMembers()
  }, [])

  // ============================================================================
  // PERMISOS
  // ============================================================================

  const canManageMembers = () => {
    return currentUserRole === 'owner' || currentUserRole === 'admin'
  }

  const canManageMember = (memberRole: string) => {
    if (currentUserRole === 'owner') return true
    if (currentUserRole === 'admin') {
      return memberRole !== 'owner' && memberRole !== 'admin'
    }
    return false
  }

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const handleRemoveMember = async (memberId: string, userId: string, memberName: string, memberRole: string) => {
    if (!canManageMembers()) {
      Alert.alert('Permiso denegado', 'No tienes permisos para eliminar miembros')
      return
    }

    if (!canManageMember(memberRole)) {
      Alert.alert('Permiso denegado', 'No puedes eliminar a este miembro')
      return
    }

    if (userId === currentUser?.id) {
      Alert.alert('Error', 'No puedes eliminarte a ti mismo')
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
              await request("DELETE", "/user_communities", {
                params: {
                  id: `eq.${memberId}`
                }
              })
              
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

  const handleChangeRole = async (memberId: string, currentRole: string, userId: string, memberName: string) => {
    if (!canManageMembers()) {
      Alert.alert('Permiso denegado', 'No tienes permisos para cambiar roles')
      return
    }

    if (!canManageMember(currentRole)) {
      Alert.alert('Permiso denegado', 'No puedes cambiar el rol de este miembro')
      return
    }

    if (userId === currentUser?.id) {
      Alert.alert('Error', 'No puedes cambiar tu propio rol')
      return
    }

    const availableRoles = currentUserRole === 'owner' 
      ? [
          { label: 'Miembro', value: 'member', icon: '👤' },
          { label: 'Moderador', value: 'moderator', icon: '🛡️' },
          { label: 'Administrador', value: 'admin', icon: '👑' }
        ]
      : [
          { label: 'Miembro', value: 'member', icon: '👤' },
          { label: 'Moderador', value: 'moderator', icon: '🛡️' }
        ]

    Alert.alert(
      'Cambiar rol',
      `Selecciona el nuevo rol para ${memberName}`,
      [
        ...availableRoles.map(role => ({
          text: `${role.icon} ${role.label}`,
          onPress: async () => {
            if (role.value !== currentRole) {
              try {
                await request("PATCH", "/user_communities", {
                  params: { id: `eq.${memberId}` },
                  body: { role: role.value }
                })
                
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

  const handleBanMember = async (memberId: string, userId: string, memberName: string, memberRole: string) => {
    if (!canManageMembers()) {
      Alert.alert('Permiso denegado', 'No tienes permisos para banear miembros')
      return
    }

    if (!canManageMember(memberRole)) {
      Alert.alert('Permiso denegado', 'No puedes banear a este miembro')
      return
    }

    Alert.alert(
      'Banear miembro',
      `¿Estás seguro de que deseas banear a ${memberName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Banear',
          style: 'destructive',
          onPress: async () => {
            try {
              await request("PATCH", "/user_communities", {
                params: { id: `eq.${memberId}` },
                body: { status: 'banned' }
              })
              
              setMembers(prev => prev.filter(m => m.id !== memberId))
              Alert.alert('Éxito', 'Miembro baneado de la comunidad')
            } catch (error) {
              console.error('Error banning member:', error)
              Alert.alert('Error', 'No se pudo banear al miembro')
            }
          }
        }
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
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays}d`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)}sem`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)}m`
    
    return date.toLocaleDateString('es', { month: 'short', year: 'numeric' })
  }

  // ============================================================================
  // RENDER ROLE BADGE
  // ============================================================================

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return { 
          icon: <Star size={12} color="#FF6B00" fill="#FF6B00" />, 
          label: 'Owner', 
          color: '#FF6B00',
          bg: '#FFF3E0'
        }
      case 'admin':
        return { 
          icon: <Crown size={12} color="#FFD700" />, 
          label: 'Admin', 
          color: '#FFD700',
          bg: '#FFFBEA'
        }
      case 'moderator':
        return { 
          icon: <Shield size={12} color="#2673f3" />, 
          label: 'Mod', 
          color: '#2673f3',
          bg: '#EBF4FF'
        }
      default:
        return null
    }
  }

  // ============================================================================
  // RENDER MEMBER ITEM
  // ============================================================================

  const renderMemberItem = ({ item }: { item: Member }) => {
    const roleBadge = getRoleBadge(item.role)
    const memberName = item.user.full_name || item.user.nombre || item.user.username || 'Usuario'
    const isOnline = (item.user as any).is_online
    const canManage = canManageMember(item.role) && item.user_id !== currentUser?.id

    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => navigation.navigate('Profile', { userId: item.user_id })}
        activeOpacity={0.7}
      >
        {/* Avatar con indicador online */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: item.user.avatar_url || item.user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=2673f3&color=fff`
            }}
            style={styles.memberAvatar}
          />
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName} numberOfLines={1}>
              {memberName}
            </Text>
            {roleBadge && (
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                {roleBadge.icon}
                <Text style={[styles.roleText, { color: roleBadge.color }]}>
                  {roleBadge.label}
                </Text>
              </View>
            )}
          </View>
          
          {item.user.username && (
            <Text style={styles.memberUsername}>@{item.user.username}</Text>
          )}
          
          <View style={styles.memberMetaRow}>
            <Text style={styles.memberMeta}>
              Miembro desde {getTimeAgo(item.joined_at)}
            </Text>
            {item.user.location && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.memberMeta} numberOfLines={1}>
                  {item.user.location}
                </Text>
              </>
            )}
          </View>
          
          {item.user.bio && (
            <Text style={styles.memberBio} numberOfLines={2}>
              {item.user.bio}
            </Text>
          )}
        </View>

        {canManage && canManageMembers() && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Gestionar miembro',
                `Opciones para ${memberName}`,
                [
                  {
                    text: '👑 Cambiar rol',
                    onPress: () => handleChangeRole(item.id, item.role, item.user_id, memberName)
                  },
                  {
                    text: '🚫 Banear',
                    onPress: () => handleBanMember(item.id, item.user_id, memberName, item.role)
                  },
                  {
                    text: '❌ Eliminar',
                    style: 'destructive',
                    onPress: () => handleRemoveMember(item.id, item.user_id, memberName, item.role)
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
  // RENDER STATS CARD
  // ============================================================================

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statItem}>
        <Users size={20} color="#2673f3" />
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Crown size={20} color="#FFD700" />
        <Text style={styles.statValue}>{stats.admins}</Text>
        <Text style={styles.statLabel}>Admins</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Shield size={20} color="#2673f3" />
        <Text style={styles.statValue}>{stats.moderators}</Text>
        <Text style={styles.statLabel}>Mods</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <UserCheck size={20} color="#10b981" />
        <Text style={styles.statValue}>{stats.online}</Text>
        <Text style={styles.statLabel}>Online</Text>
      </View>
    </View>
  )

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
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {communityName}
            </Text>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, usuario o bio..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Estadísticas */}
      {renderStatsCard()}

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
          <Users size={14} color={selectedRole === 'all' ? '#fff' : '#666'} />
          <Text style={[styles.filterChipText, selectedRole === 'all' && styles.filterChipTextActive]}>
            Todos ({members.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'admin' && styles.filterChipActive]}
          onPress={() => setSelectedRole('admin')}
        >
          <Crown size={14} color={selectedRole === 'admin' ? '#fff' : '#FFD700'} />
          <Text style={[styles.filterChipText, selectedRole === 'admin' && styles.filterChipTextActive]}>
            Admins ({members.filter(m => m.role === 'admin' || m.role === 'owner').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'moderator' && styles.filterChipActive]}
          onPress={() => setSelectedRole('moderator')}
        >
          <Shield size={14} color={selectedRole === 'moderator' ? '#fff' : '#2673f3'} />
          <Text style={[styles.filterChipText, selectedRole === 'moderator' && styles.filterChipTextActive]}>
            Mods ({members.filter(m => m.role === 'moderator').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedRole === 'member' && styles.filterChipActive]}
          onPress={() => setSelectedRole('member')}
        >
          <UserCheck size={14} color={selectedRole === 'member' ? '#fff' : '#666'} />
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
              {searchQuery 
                ? 'Intenta con otro término de búsqueda' 
                : 'No hay miembros con este rol'}
            </Text>
          </View>
        }
      />

      {/* Botón Invitar (solo para admins) */}
      {canManageMembers() && (
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => {
            Alert.alert(
              'Invitar miembros',
              'Esta función estará disponible próximamente',
              [{ text: 'OK' }]
            )
          }}
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 32,
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
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e5e5',
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2673f3',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
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
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5e5e5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  memberUsername: {
    fontSize: 13,
    color: '#666',
    marginTop: -2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  memberMeta: {
    fontSize: 12,
    color: '#999',
  },
  metaDot: {
    fontSize: 12,
    color: '#ccc',
  },
  memberBio: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
    marginLeft: 4,
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
    lineHeight: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2673f3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#2673f3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})

export default CommunityMembersScreen