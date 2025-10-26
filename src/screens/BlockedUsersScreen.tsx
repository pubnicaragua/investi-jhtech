import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { ArrowLeft, Unlock } from 'lucide-react-native'
import { useRoute } from '@react-navigation/native'
import { request } from '../rest/client'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface BlockedUser {
  id: string
  user_id: string
  blocked_user_id: string
  community_id: string
  created_at: string
  blocked_user?: {
    id: string
    nombre: string
    avatar_url: string
  }
}

export function BlockedUsersScreen({ navigation }: any) {
  const route = useRoute()
  const { communityId } = route.params as { communityId: string }
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useAuthGuard()

  useEffect(() => {
    loadBlockedUsers()
  }, [communityId])

  const loadBlockedUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await request('GET', '/community_blocked_users', {
        params: {
          community_id: `eq.${communityId}`,
        }
      })
      if (!error && data) {
        setBlockedUsers(data)
      }
    } catch (error) {
      console.error('Error loading blocked users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (blockId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas desbloquear este usuario?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Desbloquear',
          onPress: async () => {
            try {
              setProcessing(blockId)
              await request('DELETE', '/community_blocked_users', {
                params: { id: `eq.${blockId}` }
              })
              setBlockedUsers(prev => prev.filter(b => b.id !== blockId))
              Alert.alert('Éxito', 'Usuario desbloqueado')
            } catch (error) {
              console.error('Error unblocking user:', error)
              Alert.alert('Error', 'No se pudo desbloquear el usuario')
            } finally {
              setProcessing(null)
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.blockedUserItem}>
      <Image
        source={{ uri: item.blocked_user?.avatar_url || 'https://i.pravatar.cc/100' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.blocked_user?.nombre || 'Usuario'}</Text>
        <Text style={styles.blockedDate}>
          Bloqueado hace {Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)} días
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.id)}
        disabled={processing === item.id}
      >
        <Unlock size={20} color="#2673f3" />
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
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
        <Text style={styles.title}>Usuarios Bloqueados</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={blockedUsers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay usuarios bloqueados</Text>
          </View>
        }
        contentContainerStyle={blockedUsers.length === 0 ? { flex: 1 } : {}}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  blockedDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  unblockButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
})
