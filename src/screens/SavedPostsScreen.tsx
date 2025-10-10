// ============================================================================
// SavedPostsScreen.tsx - Posts Guardados
// ============================================================================
// 100% Backend Driven + UI Ultra Profesional
// Accesible desde: ProfileScreen, MenuScreen
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Eye,
  Clock,
  Users,
  MapPin,
  MoreVertical,
} from 'lucide-react-native'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'

// ============================================================================
// INTERFACES
// ============================================================================

interface SavedPost {
  id: string
  post_id: string
  user_id: string
  created_at: string
  post?: {
    id: string
    contenido: string
    content: string
    image_url: string
    media_url: any[]
    likes_count: number
    comment_count: number
    shares_count: number
    created_at: string
    user?: {
      id: string
      full_name: string
      nombre: string
      username: string
      avatar_url: string
      photo_url: string
    }
    community?: {
      id: string
      name: string
      nombre: string
    }
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SavedPostsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  // Estados
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [user, savedPostsData] = await Promise.all([
        getCurrentUser(),
        fetchSavedPosts(),
      ])
      setCurrentUser(user)
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'No se pudieron cargar los posts guardados')
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedPosts = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return []

      const response = await request('GET', '/post_saves', {
        params: {
          select: `
            *,
            post:posts(
              *,
              user:users!posts_user_id_fkey(id,full_name,nombre,username,avatar_url,photo_url),
              community:communities(id,name,nombre)
            )
          `,
          user_id: `eq.${user.id}`,
          order: 'created_at.desc',
        },
      })

      if (response) {
        setSavedPosts(response)
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching saved posts:', error)
      return []
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [])

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const handleRemove = async (saveId: string, postId: string) => {
    Alert.alert(
      'Remover post guardado',
      '¿Deseas eliminar este post de tus guardados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingId(saveId)

              await request('DELETE', '/post_saves', {
                params: {
                  id: `eq.${saveId}`,
                },
              })

              setSavedPosts((prev) => prev.filter((item) => item.id !== saveId))
              Alert.alert('✓', 'Post removido de guardados')
            } catch (error) {
              console.error('Error removing saved post:', error)
              Alert.alert('Error', 'No se pudo remover el post')
            } finally {
              setRemovingId(null)
            }
          },
        },
      ]
    )
  }

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId })
  }

  // ============================================================================
  // FORMATEAR TIEMPO
  // ============================================================================

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return date.toLocaleDateString('es', { day: '2-digit', month: 'short' })
  }

  // ============================================================================
  // RENDER POST ITEM
  // ============================================================================

  const renderPostItem = ({ item }: { item: SavedPost }) => {
    if (!item.post) return null

    const post = item.post
    const imageUrl = post.image_url || (post.media_url && post.media_url[0])

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handlePostPress(post.id)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <Image
            source={{
              uri:
                post.user?.avatar_url ||
                post.user?.photo_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  post.user?.full_name || post.user?.nombre || 'U'
                )}&background=2673f3&color=fff`,
            }}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {post.user?.full_name || post.user?.nombre}
            </Text>
            <View style={styles.postMeta}>
              <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
              {post.community && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Users size={12} color="#666" />
                  <Text style={styles.metaText}>
                    {post.community.name || post.community.nombre}
                  </Text>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item.id, post.id)}
            disabled={removingId === item.id}
          >
            {removingId === item.id ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Bookmark size={22} color="#2673f3" fill="#2673f3" />
            )}
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <Text style={styles.postContent} numberOfLines={3}>
          {post.contenido || post.content}
        </Text>

        {/* Imagen */}
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.postImage} />
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Heart size={16} color="#ef4444" />
            <Text style={styles.statText}>{post.likes_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={16} color="#666" />
            <Text style={styles.statText}>{post.comment_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Share2 size={16} color="#666" />
            <Text style={styles.statText}>{post.shares_count || 0}</Text>
          </View>
          <View style={styles.savedBadge}>
            <Clock size={12} color="#2673f3" />
            <Text style={styles.savedText}>
              Guardado {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Posts Guardados</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando posts...</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Posts Guardados</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Lista */}
      <FlatList
        data={savedPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
          <View style={styles.emptyContainer}>
            <Bookmark size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No tienes posts guardados</Text>
            <Text style={styles.emptyText}>
              Los posts que guardes aparecerán aquí
            </Text>
          </View>
        }
        ListHeaderComponent={
          savedPosts.length > 0 ? (
            <View style={styles.headerInfo}>
              <Bookmark size={20} color="#2673f3" />
              <Text style={styles.headerInfoText}>
                {savedPosts.length} {savedPosts.length === 1 ? 'post guardado' : 'posts guardados'}
              </Text>
            </View>
          ) : null
        }
      />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#eff6ff',
    marginBottom: 8,
  },
  headerInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2673f3',
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e5e5',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postTime: {
    fontSize: 13,
    color: '#666',
  },
  metaDot: {
    fontSize: 12,
    color: '#ccc',
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e5e5e5',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2673f3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
})

export default SavedPostsScreen