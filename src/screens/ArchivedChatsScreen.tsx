import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { ArrowLeft, Search, Trash2, Archive } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../supabase'
import { getCurrentUserId } from '../rest/client'

export function ArchivedChatsScreen() {
  const navigation = useNavigation()
  const [archivedChats, setArchivedChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadArchivedChats()
  }, [])

  const loadArchivedChats = async () => {
    try {
      setLoading(true)
      const userId = await getCurrentUserId()
      if (!userId) return

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setArchivedChats(data || [])
    } catch (error) {
      console.error('Error loading archived chats:', error)
      Alert.alert('Error', 'No se pudieron cargar los chats archivados')
    } finally {
      setLoading(false)
    }
  }

  const handleUnarchive = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: false })
        .eq('id', conversationId)

      if (error) throw error
      
      setArchivedChats(prev => prev.filter(chat => chat.id !== conversationId))
      Alert.alert('✓', 'Chat desarchivado')
    } catch (error) {
      console.error('Error unarchiving chat:', error)
      Alert.alert('Error', 'No se pudo desarchiver el chat')
    }
  }

  const handleDelete = async (conversationId: string) => {
    Alert.alert(
      'Eliminar Chat',
      '¿Estás seguro de que deseas eliminar este chat?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', conversationId)

              if (error) throw error
              
              setArchivedChats(prev => prev.filter(chat => chat.id !== conversationId))
              Alert.alert('✓', 'Chat eliminado')
            } catch (error) {
              console.error('Error deleting chat:', error)
              Alert.alert('Error', 'No se pudo eliminar el chat')
            }
          }
        }
      ]
    )
  }

  const filteredChats = archivedChats.filter(chat =>
    (chat.participant_name || chat.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderChatItem = ({ item }: { item: any }) => (
    <View style={styles.chatItem}>
      <Image
        source={{
          uri: item.participant_avatar || item.avatar_url || 'https://ui-avatars.com/api/?name=User&background=1382EF&color=fff'
        }}
        style={styles.avatar}
      />
      
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.participant_name || item.name || 'Chat'}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Sin mensajes'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleUnarchive(item.id)}
        >
          <Archive size={20} color="#1382EF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Chats Archivados</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1382EF" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Chats Archivados</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <Text style={styles.searchPlaceholder}>Buscar chats archivados...</Text>
      </View>

      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Archive size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No hay chats archivados</Text>
          <Text style={styles.emptySubtext}>Los chats que archives aparecerán aquí</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
})
