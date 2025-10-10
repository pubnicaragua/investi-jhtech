// CommunityMembersScreen.tsx - UI Premium + CRUD Minimalista
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image,
  ActivityIndicator, RefreshControl, Alert, ScrollView, Platform, Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ArrowLeft, Search, Shield, Crown, UserPlus, MoreVertical, X, Users,
  UserCheck, Star, Send, Clock, MapPin, Zap
} from 'lucide-react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { request } from '../rest/client'
import { getCurrentUser, searchUsers } from '../rest/api'
import { LinearGradient } from 'expo-linear-gradient'

interface Member {
  id: string; user_id: string; community_id: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  status: string; joined_at: string
  user: {
    id: string; nombre: string; full_name: string; username: string
    avatar_url: string; photo_url: string; bio?: string
    location?: string; is_online?: boolean
  }
}

interface SearchResult {
  id: string; nombre: string; full_name?: string; username: string
  avatar_url?: string; photo_url?: string; bio?: string; is_online?: boolean
}

export function CommunityMembersScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute()
  const { communityId, communityName } = route.params as any

  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserRole, setCurrentUserRole] = useState('member')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [inviteSearchQuery, setInviteSearchQuery] = useState('')

  useEffect(() => { loadMembers() }, [])
  useEffect(() => { filterMembers() }, [members, searchQuery, selectedRole])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inviteSearchQuery.trim() && showSearchModal) searchUsersForInvite()
      else setSearchResults([])
    }, 500)
    return () => clearTimeout(timer)
  }, [inviteSearchQuery, showSearchModal])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const [user, data] = await Promise.all([
        getCurrentUser(),
        request("GET", "/user_communities", {
          params: {
            select: "id,user_id,community_id,role,status,joined_at,user:users(id,nombre,full_name,username,photo_url,avatar_url,bio,location,is_online)",
            community_id: `eq.${communityId}`,
            status: 'eq.active',
            order: 'joined_at.desc'
          }
        })
      ])
      setCurrentUser(user)
      setMembers(data || [])
      const membership = data?.find((m: Member) => m.user_id === user?.id)
      setCurrentUserRole(membership?.role || 'member')
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los miembros')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const searchUsersForInvite = async () => {
    if (!inviteSearchQuery.trim()) return
    try {
      setSearchLoading(true)
      const results = await searchUsers(inviteSearchQuery)
      const ids = new Set(members.map(m => m.user_id))
      setSearchResults(results.filter((u: any) => !ids.has(u.id)) || [])
    } catch (error) {
      Alert.alert('Error', 'No se pudieron buscar usuarios')
    } finally {
      setSearchLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(m => 
        (m.user.full_name || m.user.nombre || '').toLowerCase().includes(q) ||
        (m.user.username || '').toLowerCase().includes(q) ||
        (m.user.bio || '').toLowerCase().includes(q)
      )
    }
    if (selectedRole !== 'all') filtered = filtered.filter(m => m.role === selectedRole)
    filtered.sort((a, b) => {
      const order: Record<string, number> = { owner: 0, admin: 1, moderator: 2, member: 3 }
      const diff = (order[a.role] ?? 4) - (order[b.role] ?? 4)
      return diff !== 0 ? diff : new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
    })
    setFilteredMembers(filtered)
  }

  const handleInviteUser = async (user: SearchResult) => {
    try {
      await request("POST", "/community_invitations", {
        body: {
          community_id: communityId, invited_user_id: user.id,
          invited_by_user_id: currentUser?.id, status: 'pending',
          expires_at: new Date(Date.now() + 604800000).toISOString()
        }
      })
      await request("POST", "/notifications", {
        body: {
          user_id: user.id, type: 'community_invitation',
          title: 'Invitación a comunidad',
          message: `${currentUser?.nombre || 'Alguien'} te invitó a ${communityName || 'una comunidad'}`,
          data: { community_id: communityId, community_name: communityName }
        }
      })
      Alert.alert('✅ Invitación enviada')
      setShowSearchModal(false)
      setInviteSearchQuery('')
    } catch { Alert.alert('Error', 'No se pudo enviar') }
  }

  const handleChangeRole = async (id: string, role: string, uid: string, name: string) => {
    if (!canManageMembers() || !canManageMember(role) || uid === currentUser?.id) {
      return Alert.alert('Permiso denegado')
    }
    const roles = currentUserRole === 'owner'
      ? [{ label: 'Miembro', value: 'member', icon: '👤' }, { label: 'Moderador', value: 'moderator', icon: '🛡️' }, { label: 'Admin', value: 'admin', icon: '👑' }]
      : [{ label: 'Miembro', value: 'member', icon: '👤' }, { label: 'Moderador', value: 'moderator', icon: '🛡️' }]
    
    Alert.alert('Cambiar rol', `Rol para ${name}`, [
      ...roles.map(r => ({
        text: `${r.icon} ${r.label}`,
        onPress: async () => {
          if (r.value !== role) {
            try {
              await request("PATCH", "/user_communities", { params: { id: `eq.${id}` }, body: { role: r.value } })
              setMembers(prev => prev.map(m => m.id === id ? { ...m, role: r.value as any } : m))
              Alert.alert('✅ Rol actualizado')
            } catch { Alert.alert('Error') }
          }
        }
      })),
      { text: 'Cancelar', style: 'cancel' }
    ])
  }

  const handleRemoveMember = async (id: string, uid: string, name: string, role: string) => {
    if (!canManageMembers() || !canManageMember(role) || uid === currentUser?.id) {
      return Alert.alert('Permiso denegado')
    }
    Alert.alert('Eliminar', `¿Eliminar a ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await request("DELETE", "/user_communities", { params: { id: `eq.${id}` } })
            setMembers(prev => prev.filter(m => m.id !== id))
            Alert.alert('✅ Eliminado')
          } catch { Alert.alert('Error') }
        }
      }
    ])
  }

  const canManageMembers = () => ['owner', 'admin'].includes(currentUserRole)
  const canManageMember = (role: string) => 
    currentUserRole === 'owner' || (currentUserRole === 'admin' && !['owner', 'admin'].includes(role))

  const getTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    if (diff < 1) return 'Hoy'
    if (diff === 1) return 'Ayer'
    if (diff < 7) return `${diff}d`
    if (diff < 30) return `${Math.floor(diff / 7)}sem`
    if (diff < 365) return `${Math.floor(diff / 30)}m`
    return `${Math.floor(diff / 365)}a`
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { icon: any; label: string; colors: string[] }> = {
      owner: { icon: Star, label: 'Owner', colors: ['#FF6B00', '#FF8C00'] },
      admin: { icon: Crown, label: 'Admin', colors: ['#FFD700', '#FFA500'] },
      moderator: { icon: Shield, label: 'Mod', colors: ['#2673f3', '#1e5fd9'] }
    }
    return badges[role] || null
  }

  const stats = {
    total: members.length,
    admins: members.filter(m => ['admin', 'owner'].includes(m.role)).length,
    mods: members.filter(m => m.role === 'moderator').length,
    online: members.filter(m => m.user.is_online).length
  }

  const renderMember = ({ item }: { item: Member }) => {
    const badge = getRoleBadge(item.role)
    const name = item.user.full_name || item.user.nombre || item.user.username || 'Usuario'
    const online = item.user.is_online
    const canManage = canManageMember(item.role) && item.user_id !== currentUser?.id

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Profile', { userId: item.user_id })}
      >
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarBorder, online && styles.avatarBorderOn]}>
            <Image
              source={{ uri: item.user.avatar_url || item.user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&bold=true` }}
              style={styles.avatar}
            />
            {online && <View style={styles.onlineDot} />}
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {online && (
              <View style={styles.onlineChip}>
                <View style={styles.dot} />
                <Text style={styles.onlineText}>Activo</Text>
              </View>
            )}
          </View>
          {item.user.username && <Text style={styles.username}>@{item.user.username}</Text>}
          {item.user.bio && <Text style={styles.bio} numberOfLines={2}>{item.user.bio}</Text>}
          <View style={styles.meta}>
            <Clock size={11} color="#999" />
            <Text style={styles.metaText}>{getTimeAgo(item.joined_at)}</Text>
            {item.user.location && (
              <>
                <MapPin size={11} color="#999" />
                <Text style={styles.metaText} numberOfLines={1}>{item.user.location}</Text>
              </>
            )}
          </View>
        </View>

        {badge && (
          <LinearGradient colors={badge.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
            <badge.icon size={12} color="#fff" />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </LinearGradient>
        )}

        {canManage && canManageMembers() && (
          <TouchableOpacity
            style={styles.menu}
            onPress={() => Alert.alert('Gestionar', name, [
              { text: '👑 Cambiar rol', onPress: () => handleChangeRole(item.id, item.role, item.user_id, name) },
              { text: '❌ Eliminar', style: 'destructive', onPress: () => handleRemoveMember(item.id, item.user_id, name, item.role) },
              { text: 'Cancelar', style: 'cancel' }
            ])}
          >
            <MoreVertical size={18} color="#666" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LinearGradient colors={['#2673f3', '#1e5fd9']} style={styles.headerGrad}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
            <Text style={styles.headerTitle}>Miembros</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient colors={['#2673f3', '#1e5fd9']} style={styles.headerGrad}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Miembros</Text>
            {communityName && <Text style={styles.headerSub} numberOfLines={1}>{communityName}</Text>}
          </View>
          {canManageMembers() && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowSearchModal(true)}>
              <UserPlus size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.stats}>
          {[
            { icon: Users, num: stats.total, label: 'Total', color: '#fff' },
            { icon: Crown, num: stats.admins, label: 'Admins', color: '#FFD700' },
            { icon: Shield, num: stats.mods, label: 'Mods', color: '#fff' },
            { icon: Zap, num: stats.online, label: 'Activos', color: '#10b981' }
          ].map((s, i) => (
            <View key={i} style={styles.stat}>
              <s.icon size={14} color={s.color} />
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.search}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}><X size={20} color="#999" /></TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {[
          { key: 'all', icon: Users, label: 'Todos', count: members.length, color: '#666' },
          { key: 'admin', icon: Crown, label: 'Admins', count: stats.admins, color: '#FFD700' },
          { key: 'moderator', icon: Shield, label: 'Mods', count: stats.mods, color: '#2673f3' },
          { key: 'member', icon: UserCheck, label: 'Miembros', count: members.filter(m => m.role === 'member').length, color: '#666' }
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filter, selectedRole === f.key && styles.filterActive]}
            onPress={() => setSelectedRole(f.key)}
          >
            <f.icon size={14} color={selectedRole === f.key ? '#2673f3' : f.color} />
            <Text style={[styles.filterText, selectedRole === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
            <View style={[styles.filterBadge, selectedRole === f.key && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, selectedRole === f.key && styles.filterBadgeTextActive]}>
                {f.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredMembers}
        keyExtractor={i => i.id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMembers() }} colors={['#2673f3']} tintColor="#2673f3" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search size={64} color="#e5e5e5" />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>{searchQuery ? 'Intenta otro término' : 'No hay miembros'}</Text>
          </View>
        }
      />

      <Modal visible={showSearchModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <LinearGradient colors={['#2673f3', '#1e5fd9']} style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Invitar</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          <View style={styles.modalSearch}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar usuarios..."
              placeholderTextColor="#999"
              value={inviteSearchQuery}
              onChangeText={setInviteSearchQuery}
              autoFocus
            />
            {inviteSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setInviteSearchQuery('')}><X size={20} color="#999" /></TouchableOpacity>
            )}
          </View>

          {searchLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#2673f3" />
              <Text>Buscando...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.result} onPress={() => handleInviteUser(item)}>
                  <Image
                    source={{ uri: item.avatar_url || item.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nombre || item.username)}&background=random` }}
                    style={styles.resultAvatar}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.full_name || item.nombre || item.username}</Text>
                    <Text style={styles.resultUsername}>@{item.username}</Text>
                    {item.bio && <Text style={styles.resultBio} numberOfLines={2}>{item.bio}</Text>}
                  </View>
                  <TouchableOpacity style={styles.inviteBtn} onPress={() => handleInviteUser(item)}>
                    <Send size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ padding: 16 }}
            />
          ) : (
            <View style={styles.modalEmpty}>
              {inviteSearchQuery ? <Search size={48} color="#e5e5e5" /> : <UserPlus size={48} color="#e5e5e5" />}
              <Text style={styles.modalEmptyText}>{inviteSearchQuery ? 'Sin resultados' : 'Busca usuarios'}</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerGrad: { paddingTop: 12, paddingBottom: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 }, android: { elevation: 8 } }) },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '500' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 },
  stat: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchInput: { flex: 1, fontSize: 15, color: '#111', padding: 0 },
  filters: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 12 },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', marginRight: 6 },
  filterActive: { backgroundColor: '#e6f0ff' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#2673f3' },
  filterBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, backgroundColor: '#e5e7eb', minWidth: 20, alignItems: 'center' },
  filterBadgeActive: { backgroundColor: '#2673f3' },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#666' },
  filterBadgeTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }, android: { elevation: 2 } }) },
  avatarWrap: { marginRight: 12 },
  avatarBorder: { position: 'relative', padding: 2, borderRadius: 30, borderWidth: 2, borderColor: 'transparent' },
  avatarBorderOn: { borderColor: '#10b981' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },
  info: { flex: 1, gap: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', color: '#111', flex: 1 },
  onlineChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#d1fae5' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  onlineText: { fontSize: 10, fontWeight: '600', color: '#059669' },
  username: { fontSize: 13, color: '#666', fontWeight: '500' },
  bio: { fontSize: 12, color: '#999', lineHeight: 16, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText: { fontSize: 11, color: '#999' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  menu: { padding: 8, marginLeft: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#666', marginTop: 4, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalSearch: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalSearchInput: { flex: 1, fontSize: 15, color: '#111', padding: 0 },
  modalLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  modalEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalEmptyText: { fontSize: 16, fontWeight: '600', color: '#999', marginTop: 16 },
  result: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  resultAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  resultInfo: { flex: 1 },
    resultName: { fontSize: 16, fontWeight: '600', color: '#111' },
  resultUsername: { fontSize: 13, color: '#666', marginTop: 2 },
  resultBio: { fontSize: 12, color: '#999', marginTop: 2, lineHeight: 16 },
  inviteBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2673f3', alignItems: 'center', justifyContent: 'center' }
})

export default CommunityMembersScreen