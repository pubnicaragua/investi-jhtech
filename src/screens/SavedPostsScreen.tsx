// ============================================================================
// SavedPostsScreen.tsx - Publicaciones Guardadas
// ============================================================================
// 100% Backend Driven + UI Moderna
// Accesible desde: ProfileScreen o menú principal
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from 'react-native'
import { ArrowLeft, Bookmark, Clock, Eye, MessageCircle, ThumbsUp, Share2, Trash2 } from 'lucide-react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import { getSavedPosts, unsavePost, getCurrentUser } from '../rest/api'

// ============================================================================
// INTERFACES
// ============================================================================

interface SavedPost {
  id: string
  post_id: string
  saved_at: string
  post: {
    id: string
    contenido: string
    created_at: string
    image_url?: string
    likes_count: number
    comment_count: number
    user: {
      id: string
      nombre: string
      full_name: string
      avatar_url: string
      role: string
    }
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SavedPostsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  
  // Estados
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadSavedPosts()
  }, [])

  const loadSavedPosts = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      setCurrentUser(user)
      
      if (user) {
        const posts = await getSavedPosts(user.id)
        setSavedPosts(posts || [])
      }
    } catch (error) {
      console.error('Error loading saved posts:', error)
      Alert.alert('Error', 'No se pudieron cargar las publicaciones guardadas')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadSavedPosts()
  }, [])

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const handleUnsavePost = async (postId: string) => {
    Alert.alert(
      'Quitar de guardados',
      '¿Deseas eliminar esta publicación de tus guardados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (currentUser) {
                await unsavePost(currentUser.id, postId)
                setSavedPosts(prev => prev.filter(item => item.post_id !== postId))
                Alert.alert('Éxito', 'Publicación eliminada de guardados')
              }
            } catch (error) {
              console.error('Error unsaving post:', error)
              Alert.alert('Error', 'No se pudo quitar la publicación')
            }
          }
        }
      ]
    )
  }

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId })
  }

  // ============================================================================
  // FORMATEAR TIEMPO
  // ============================================================================

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    
    return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ============================================================================
  // RENDER POST ITEM
  // ============================================================================

  const renderPostItem = ({ item }: { item: SavedPost }) => {
    const post = item.post
    const author = post.user

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handlePostPress(post.id)}
        activeOpacity={0.7}
      >
        {/* Header del Post */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: author.avatar_url || 'https://i.pravatar.cc/100' }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {author.full_name || author.nombre || 'Usuario'}
            </Text>
            <Text style={styles.postMeta}>
              {author.role || 'Miembro'} • {getTimeAgo(post.created_at)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.unsaveButton}
            onPress={() => handleUnsavePost(post.id)}
          >
            <Bookmark size={20} color="#2673f3" fill="#2673f3" />
          </TouchableOpacity>
        </View>

        {/* Contenido del Post */}
        <Text style={styles.postContent} numberOfLines={4}>
          {post.contenido}
        </Text>

        {/* Imagen del Post */}
        {post.image_url && (
          <Image
            source={{ uri: post.image_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Footer con estadísticas */}
        <View style={styles.postFooter}>
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <ThumbsUp size={16} color="#666" />
              <Text style={styles.statText}>{post.likes_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={16} color="#666" />
              <Text style={styles.statText}>{post.comment_count || 0}</Text>
            </View>
          </View>
          <Text style={styles.savedDate}>
            Guardado {getTimeAgo(item.saved_at)}
          </Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Guardados</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando publicaciones...</Text>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guardados</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Contador */}
      {savedPosts.length > 0 && (
        <View style={styles.counterContainer}>
          <Bookmark size={18} color="#2673f3" />
          <Text style={styles.counterText}>
            {savedPosts.length} {savedPosts.length === 1 ? 'publicación guardada' : 'publicaciones guardadas'}
          </Text>
        </View>
      )}

      {/* Lista de Posts */}
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
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
            <Bookmark size={64} color="#e5e5e5" />
            <Text style={styles.emptyTitle}>No hay publicaciones guardadas</Text>
            <Text style={styles.emptyDescription}>
              Guarda publicaciones interesantes para leerlas más tarde
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('HomeFeed')}
            >
              <Text style={styles.exploreButtonText}>Explorar publicaciones</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
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
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  counterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  postMeta: {
    fontSize: 12,
    color: '#666',
  },
  unsaveButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    color: '#111',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  savedDate: {
    fontSize: 12,
    color: '#999',
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
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#2673f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})

export default SavedPostsScreen