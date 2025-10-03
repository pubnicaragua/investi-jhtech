import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput, RefreshControl } from 'react-native'
import { getCurrentUserId, getUserConversations, searchUsers, getSuggestedPeople } from '../rest/api'
import { startConversationWithUser } from '../api'
import { useAuthGuard } from '../hooks/useAuthGuard'

export function NewMessageScreen({ navigation }: any) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useAuthGuard()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const uid = await getCurrentUserId()
      const convs: any[] = await getUserConversations(uid || '')
      const participants: any[] = []
      convs.forEach(c => {
        (c.participants || []).forEach((p: any) => {
          if (p && p.id !== uid && !participants.find(u => u.id === p.id)) participants.push(p)
        })
      })

      try {
        const recs: any[] = await getSuggestedPeople(uid || '', 12)
        const normalizedRecs = (recs || []).map((u: any) => ({
          id: u.id,
          nombre: u.nombre || u.name || u.full_name || u.username || '',
          avatar_url: u.avatar_url || u.avatar || u.photo_url || null,
          username: u.username || null,
          bio: u.bio || null,
          intereses: u.intereses || []
        }))

        const combined = [...participants]
        normalizedRecs.forEach((r: any) => {
          if (r.id && r.id !== uid && !combined.find((c: any) => c.id === r.id)) combined.push(r)
        })

        if (combined.length === 0) {
          const results: any[] = await searchUsers('')
          setUsers((results || []).filter(u => u.id !== uid))
        } else {
          setUsers(combined)
        }
      } catch (e) {
        console.error('Error fetching suggested people:', e)
        try {
          const results: any[] = await searchUsers('')
          const filtered = (results || []).filter(u => u.id !== uid)
          const combined = [...participants]
          filtered.forEach((r: any) => {
            if (!combined.find((c: any) => c.id === r.id)) combined.push(r)
          })
          setUsers(combined)
        } catch (e2) {
          console.error('Fallback search failed:', e2)
          setUsers(participants)
        }
      }
    } catch (err) {
      console.error('Error loading users for new message:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStartConversation(userId: string) {
    try {
      const currentUserId = await getCurrentUserId()
      if (!currentUserId) return
      const conv = await startConversationWithUser(currentUserId, userId)
      // Try to find participant info from loaded users so ChatScreen can show avatar immediately
      const participantInfo = users.find(u => u.id === userId) || { id: userId }

      if (conv && conv.id) {
        navigation.replace('ChatScreen', { conversationId: conv.id, type: 'direct', participant: { id: participantInfo.id, nombre: participantInfo.nombre, avatar_url: participantInfo.avatar_url } })
      } else if (conv) {
        // If RPC returned full conv
        const convId = conv.id || conv
        navigation.replace('ChatScreen', { conversationId: convId, type: 'direct', participant: { id: participantInfo.id, nombre: participantInfo.nombre, avatar_url: participantInfo.avatar_url } })
      }
    } catch (err) {
      console.error('Error starting conversation:', err)
    }
  }

  function renderItem({ item }: { item: any }) {
    return (
      <TouchableOpacity style={styles.item} onPress={() => handleStartConversation(item.id)}>
        <Image source={{ uri: item.avatar_url || item.avatar || 'https://i.pravatar.cc/100' }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{item.nombre || item.full_name || item.username || 'Usuario'}</Text>
          <Text style={styles.subtitle}>{item.email || item.username || ''}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  // Handler para pull-to-refresh desde la UI
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadUsers()
    } catch (e) {
      console.error('Refresh error:', e)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2673f3" />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado con botón para regresar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Volver">
          <Text style={styles.backCaret}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo mensaje</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.searchContainer}>
        <TextInput placeholder="Buscar" value={query} onChangeText={setQuery} style={styles.search} />
      </View>
      <FlatList
        data={users.filter(u => (query ? (u.nombre||u.username||'').toLowerCase().includes(query.toLowerCase()) : true))}
        keyExtractor={u => u.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2673f3']}
            tintColor="#2673f3"
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '600' , textAlign: 'center'},
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, color: '#666' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  search: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8 },
  backButton: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backCaret: {
    fontSize: 30,
    color: '#666',
    fontWeight: '600',
    paddingTop: 50,
  }
  ,
  /* FAB styles removed */
})


// Not merging styles to keep TypeScript types intact; use extraStyles directly where needed.

export default NewMessageScreen
