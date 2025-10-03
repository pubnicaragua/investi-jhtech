import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native'
import { getCurrentUserId, getUserConversations, searchUsers } from '../rest/api'
import { startConversationWithUser } from '../api'
import { useAuthGuard } from '../hooks/useAuthGuard'

export function NewMessageScreen({ navigation }: any) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useAuthGuard()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const uid = await getCurrentUserId()
      // Obtener conversaciones para listar participantes conocidos
      const convs: any[] = await getUserConversations(uid || '')
      const participants: any[] = []
      convs.forEach(c => {
        (c.participants || []).forEach((p: any) => {
          if (p && p.id !== uid && !participants.find(u => u.id === p.id)) participants.push(p)
        })
      })

      if (participants.length === 0) {
        // Fallback: si no hay conversaciones, listar usuarios activos/recientes usando searchUsers('')
        try {
          const results: any[] = await searchUsers('')
          const filtered = (results || []).filter(u => u.id !== uid)
          setUsers(filtered)
        } catch (e) {
          console.error('Error buscando usuarios de fallback:', e)
          setUsers([])
        }
      } else {
        setUsers(participants)
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
      if (conv && conv.id) {
        navigation.replace('ChatScreen', { conversationId: conv.id, type: 'direct', participant: { id: userId } })
      } else if (conv) {
        // If RPC returned full conv
        navigation.replace('ChatScreen', { conversationId: conv.id || conv, type: 'direct', participant: { id: userId } })
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

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2673f3" />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nuevo mensaje</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput placeholder="Buscar" value={query} onChangeText={setQuery} style={styles.search} />
      </View>
      <FlatList data={users.filter(u => (query ? (u.nombre||u.username||'').toLowerCase().includes(query.toLowerCase()) : true))} keyExtractor={u => u.id} renderItem={renderItem} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '600' ,paddingTop: 25, textAlign: 'center'},
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, color: '#666' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  search: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8 }
})

export default NewMessageScreen
