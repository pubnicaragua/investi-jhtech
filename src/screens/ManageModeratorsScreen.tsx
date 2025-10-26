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
import { ArrowLeft, Shield, Trash2 } from 'lucide-react-native'
import { useRoute } from '@react-navigation/native'
import { request } from '../rest/client'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface Moderator {
  id: string
  user_id: string
  community_id: string
  role: string
  created_at: string
  user?: {
    id: string
    nombre: string
    avatar_url: string
  }
}

export function ManageModeratorsScreen({ navigation }: any) {
  const route = useRoute()
  const { communityId } = route.params as { communityId: string }
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useAuthGuard()

  useEffect(() => {
    loadModerators()
  }, [communityId])

  const loadModerators = async () => {
    try {
      setLoading(true)
      const { data, error } = await request('GET', '/community_members', {
        params: {
          community_id: `eq.${communityId}`,
          role: `in.(moderator,owner)`,
        }
      })
      if (!error && data) {
        setModerators(data)
      }
    } catch (error) {
      console.error('Error loading moderators:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveModerator = async (memberId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas remover este moderador?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Remover',
          onPress: async () => {
            try {
              setProcessing(memberId)
              await request('PATCH', '/community_members', {
                params: { id: `eq.${memberId}` },
                body: { role: 'member' }
              })
              setModerators(prev => prev.filter(m => m.id !== memberId))
              Alert.alert('Éxito', 'Moderador removido')
            } catch (error) {
              console.error('Error removing moderator:', error)
              Alert.alert('Error', 'No se pudo remover el moderador')
            } finally {
              setProcessing(null)
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  const renderItem = ({ item }: { item: Moderator }) => (
    <View style={styles.moderatorItem}>
      <Image
        source={{ uri: item.user?.avatar_url || 'https://i.pravatar.cc/100' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user?.nombre || 'Usuario'}</Text>
        <View style={styles.roleContainer}>
          <Shield size={14} color="#2673f3" />
          <Text style={styles.roleText}>
            {item.role === 'owner' ? 'Propietario' : 'Moderador'}
          </Text>
        </View>
      </View>
      {item.role !== 'owner' && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveModerator(item.id)}
          disabled={processing === item.id}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
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
        <Text style={styles.title}>Gestionar Moderadores</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={moderators}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay moderadores</Text>
          </View>
        }
        contentContainerStyle={moderators.length === 0 ? { flex: 1 } : {}}
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
  moderatorItem: {
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 13,
    color: '#2673f3',
    fontWeight: '500',
  },
  removeButton: {
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
