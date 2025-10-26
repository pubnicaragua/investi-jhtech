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
import { ArrowLeft, Check, X } from 'lucide-react-native'
import { useRoute } from '@react-navigation/native'
import { request } from '../rest/client'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface PendingRequest {
  id: string
  user_id: string
  community_id: string
  status: string
  created_at: string
  user?: {
    id: string
    nombre: string
    avatar_url: string
  }
}

export function PendingRequestsScreen({ navigation }: any) {
  const route = useRoute()
  const { communityId } = route.params as { communityId: string }
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useAuthGuard()

  useEffect(() => {
    loadPendingRequests()
  }, [communityId])

  const loadPendingRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await request('GET', '/community_join_requests', {
        params: {
          community_id: `eq.${communityId}`,
          status: `eq.pending`,
        }
      })
      if (!error && data) {
        setRequests(data)
      }
    } catch (error) {
      console.error('Error loading pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string, userId: string) => {
    try {
      setProcessing(requestId)
      await request('PATCH', '/community_join_requests', {
        params: { id: `eq.${requestId}` },
        body: { status: 'approved' }
      })
      
      // Add user to community
      await request('POST', '/community_members', {
        body: {
          community_id: communityId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
        }
      })
      
      setRequests(prev => prev.filter(r => r.id !== requestId))
      Alert.alert('Éxito', 'Solicitud aprobada')
    } catch (error) {
      console.error('Error approving request:', error)
      Alert.alert('Error', 'No se pudo aprobar la solicitud')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId)
      await request('PATCH', '/community_join_requests', {
        params: { id: `eq.${requestId}` },
        body: { status: 'rejected' }
      })
      setRequests(prev => prev.filter(r => r.id !== requestId))
      Alert.alert('Éxito', 'Solicitud rechazada')
    } catch (error) {
      console.error('Error rejecting request:', error)
      Alert.alert('Error', 'No se pudo rechazar la solicitud')
    } finally {
      setProcessing(null)
    }
  }

  const renderItem = ({ item }: { item: PendingRequest }) => (
    <View style={styles.requestItem}>
      <Image
        source={{ uri: item.user?.avatar_url || 'https://i.pravatar.cc/100' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user?.nombre || 'Usuario'}</Text>
        <Text style={styles.requestDate}>
          Solicitado hace {Math.floor((Date.now() - new Date(item.created_at).getTime()) / 60000)} min
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(item.id, item.user_id)}
          disabled={processing === item.id}
        >
          <Check size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleReject(item.id)}
          disabled={processing === item.id}
        >
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
        <Text style={styles.title}>Solicitudes Pendientes</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay solicitudes pendientes</Text>
          </View>
        }
        contentContainerStyle={requests.length === 0 ? { flex: 1 } : {}}
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
  requestItem: {
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
  requestDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
