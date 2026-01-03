// ============================================================================
// PostDetailScreen.tsx - Detalle de Post
// ============================================================================
// 100% Backend Driven + UI Ultra Profesional
// Accesible desde: HomeFeedScreen, CommunityDetailScreen, ProfileScreen
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Share as RNShare,
  RefreshControl,
  FlatList,
  Dimensions,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native'
import { InvestiVideoPlayer } from '../components/InvestiVideoPlayer'
import type { RootStackParamList } from '../types/navigation'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Send,
  Trash2,
  Flag,
  MapPin,
  Users,
  Eye,
  CornerUpRight,
  ThumbsUp,
} from 'lucide-react-native'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'
import { supabase } from '../supabase'

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PostDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { postId } = route.params as { postId: string }

  // Estados
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [sendingComment, setSendingComment] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    loadData()

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height)
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0)
    })

    // Suscripción realtime para comentarios
    const commentsSubscription = supabase
      .channel(`post-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload: any) => {
          console.log('💬 Comentario realtime:', payload)

          if (payload.eventType === 'INSERT') {
            // Obtener datos completos del comentario con usuario
            const { data: newComment } = await supabase
              .from('post_comments')
              .select('*, user:users(id, full_name, nombre, username, avatar_url, photo_url)')
              .eq('id', payload.new.id)
              .single()

            if (newComment) {
              setComments(prev => {
                const exists = prev.some(c => c.id === newComment.id)
                if (!exists) {
                  setPost((prevPost: any) => prevPost ? { ...prevPost, comment_count: (prevPost.comment_count || 0) + 1 } : null)
                  return [newComment, ...prev]
                }
                return prev
              })
            }
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id))
            // Actualizar contador
            setPost((prevPost: any) => prevPost ? { ...prevPost, comment_count: Math.max(0, (prevPost.comment_count || 0) - 1) } : null)
          }
        }
      )
      .subscribe()

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
      commentsSubscription.unsubscribe()
    }
  }, [postId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [user, postData, commentsData] = await Promise.all([
        getCurrentUser(),
        fetchPost(),
        fetchComments(),
      ])
      setCurrentUser(user)
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'No se pudo cargar el post')
    } finally {
      setLoading(false)
    }
  }

  const fetchPost = async () => {
    try {
      const response = await request('GET', '/posts', {
        params: {
          select: '*,user:users!posts_user_id_fkey(id,full_name,nombre,username,avatar_url,photo_url)',
          id: `eq.${postId}`,
        },
      })
      if (response && response.length > 0) {
        const postData = response[0]
        const user = await getCurrentUser()
        if (user) {
          // Verificar like del usuario
          const likeResponse = await request('GET', '/post_likes', {
            params: { select: 'id', post_id: `eq.${postId}`, user_id: `eq.${user.id}` },
          })
          postData.has_liked = likeResponse && likeResponse.length > 0

          // Recalcular contador real de likes desde la tabla
          const likesCountResponse = await request('GET', '/post_likes', {
            params: { select: 'id', post_id: `eq.${postId}` },
          })
          postData.likes_count = likesCountResponse ? likesCountResponse.length : 0

          const saveResponse = await request('GET', '/post_saves', {
            params: { select: 'id', post_id: `eq.${postId}`, user_id: `eq.${user.id}` },
          })
          postData.has_saved = saveResponse && saveResponse.length > 0
        }
        setPost(postData)
        return postData
      }
      return null
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
  }

  const fetchComments = async () => {
    try {
      const response = await request('GET', '/post_comments', {
        params: {
          select: '*,user:users!post_comments_user_id_fkey(id,full_name,nombre,username,avatar_url,photo_url)',
          post_id: `eq.${postId}`,
          order: 'created_at.asc',
        },
      })
      if (response) {
        setComments(response)
        return response
      }
      return []
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  const handleLike = async () => {
    if (!post || !currentUser) return
    
    // Actualización optimista
    const wasLiked = post.has_liked
    const previousCount = post.likes_count || 0
    
    try {
      if (wasLiked) {
        // Actualizar UI inmediatamente
        setPost({ ...post, has_liked: false, likes_count: Math.max(0, previousCount - 1) })
        
        // Eliminar like
        await request('DELETE', '/post_likes', {
          params: { post_id: `eq.${postId}`, user_id: `eq.${currentUser.id}` },
        })
      } else {
        // Actualizar UI inmediatamente
        setPost({ ...post, has_liked: true, likes_count: previousCount + 1 })
        
        // Agregar like
        await request('POST', '/post_likes', {
          body: { post_id: postId, user_id: currentUser.id, is_like: true },
        })
      }
    } catch (error) {
      console.error('Error liking post:', error)
      // Revertir en caso de error
      setPost({ ...post, has_liked: wasLiked, likes_count: previousCount })
      Alert.alert('Error', 'No se pudo actualizar la recomendación')
    }
  }

  const handleSave = async () => {
    if (!post || !currentUser) return
    const wasSaved = post.has_saved
    try {
      if (post.has_saved) {
        setPost({ ...post, has_saved: false })
        await request('DELETE', '/post_saves', {
          params: { post_id: `eq.${postId}`, user_id: `eq.${currentUser.id}` },
        })
        Alert.alert('✓', 'Post removido de guardados')
      } else {
        setPost({ ...post, has_saved: true })
        await request('POST', '/post_saves', {
          body: { post_id: postId, user_id: currentUser.id },
        })
        Alert.alert(
          '✓ Post guardado',
          'Puedes ver tus posts guardados en tu perfil',
          [
            { text: 'OK' },
            { text: 'Ver guardados', onPress: () => navigation.navigate('SavedPosts') }
          ]
        )
      }
    } catch (error) {
      console.error('Error saving post:', error)
      setPost({ ...post, has_saved: wasSaved })
      Alert.alert('Error', 'No se pudo guardar el post')
    }
  }

  const handleShare = async () => {
    if (!post) return
    try {
      await RNShare.share({ 
        message: `${post.contenido || post.content}\n\n- Compartido desde Investi` 
      });
      // Incrementar contador de shares
      setPost({ ...post, shares_count: (post.shares_count || 0) + 1 });
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleSendToUser = () => {
    if (!post) return
    // Navegar a SharePost screen para seleccionar destinatarios
    (navigation as any).navigate('SharePost', {
      postId: post.id,
      postContent: post.contenido || post.content || ''
    });
  }

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUser || sendingComment) return
    try {
      setSendingComment(true)

      // Enviar comentario al backend
      const response = await request('POST', '/post_comments', {
        body: {
          post_id: postId,
          user_id: currentUser.id,
          contenido: commentText.trim(),
        },
      })

      // If API returns the created comment, append; otherwise, reload
      if (response && response.id) {
        // Normalize to the shape used in comments list
        const newComment = {
          ...response,
          user: {
            id: currentUser.id,
            full_name: currentUser.full_name || currentUser.nombre || currentUser.username,
            nombre: currentUser.nombre || currentUser.full_name || currentUser.username,
            username: currentUser.username,
            avatar_url: currentUser.avatar_url || currentUser.photo_url,
            photo_url: currentUser.photo_url || currentUser.avatar_url
          },
        }
        setComments(prev => [...prev, newComment])
        setPost((prevPost: any) => prevPost ? { ...prevPost, comment_count: (prevPost.comment_count || 0) + 1 } : null)
        console.log('✅ Comentario agregado a la lista:', newComment)
      } else {
        // If API doesn't return the comment, reload data
        await loadData()
      }
      setCommentText('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error sending comment:', error)
      Alert.alert('Error', 'No se pudo enviar el comentario')
    } finally {
      setSendingComment(false)
      Keyboard.dismiss()
    }
  }

  const handleMoreOptions = () => {
    const isOwnPost = currentUser && post && post.user?.id === currentUser.id
    
    const options = isOwnPost 
      ? ['Editar', 'Eliminar', 'Cancelar']
      : ['Reportar', 'Ocultar', 'Cancelar']
    
    Alert.alert(
      'Opciones',
      'Selecciona una opción',
      options.map((option, index) => ({
        text: option,
        style: option === 'Cancelar' ? 'cancel' : option === 'Eliminar' || option === 'Reportar' ? 'destructive' : 'default',
        onPress: () => {
          if (option === 'Eliminar') handleDeletePost()
          else if (option === 'Reportar') handleReportPost()
          else if (option === 'Ocultar') handleHidePost()
          else if (option === 'Editar') Alert.alert('Próximamente', 'Función de edición en desarrollo')
        }
      }))
    )
  }

  const handleDeletePost = async () => {
    Alert.alert(
      'Eliminar post',
      '¿Estás seguro de que deseas eliminar este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await request('DELETE', '/posts', {
                params: { id: `eq.${postId}` },
              })
              Alert.alert('✓', 'Post eliminado')
              navigation.goBack()
            } catch (error) {
              console.error('Error deleting post:', error)
              Alert.alert('Error', 'No se pudo eliminar el post')
            }
          },
        },
      ]
    )
  }

  const handleReportPost = () => {
    Alert.alert(
      'Reportar post',
      'Selecciona el motivo',
      [
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Contenido inapropiado', onPress: () => submitReport('inappropriate') },
        { text: 'Acoso', onPress: () => submitReport('harassment') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    )
  }

  const submitReport = async (reason: string) => {
    try {
      await request('POST', '/reports', {
        body: {
          post_id: postId,
          user_id: currentUser?.id,
          reason,
          status: 'pending',
        },
      })
      Alert.alert('✓', 'Reporte enviado. Lo revisaremos pronto.')
    } catch (error) {
      console.error('Error reporting post:', error)
      Alert.alert('Error', 'No se pudo enviar el reporte')
    }
  }

  const handleHidePost = () => {
    Alert.alert('✓', 'Post ocultado. No volverás a verlo en tu feed.')
    navigation.goBack()
  }

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Post no encontrado</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity onPress={handleMoreOptions}>
          <MoreVertical size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: keyboardOffset + 120 }}
        >
          <View style={styles.postCard}>
            <TouchableOpacity style={styles.authorContainer}>
              <Image
                source={{
                  uri: post.user?.avatar_url || post.user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.full_name || post.user?.nombre || 'U')}&background=2673f3&color=fff`,
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.user?.full_name || post.user?.nombre}</Text>
                <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.postContent}>{post.contenido || post.content}</Text>

            {(post.image_url || (post.media_url && post.media_url.length > 0)) && (() => {
              // Obtener todas las URLs de medios
              const mediaUrls = post.media_url && Array.isArray(post.media_url) && post.media_url.length > 0 
                ? post.media_url 
                : post.image_url 
                  ? [post.image_url] 
                  : []
              
              if (mediaUrls.length === 0) return null
              
              // Si solo hay un medio, mostrar directamente
              if (mediaUrls.length === 1) {
                const mediaUrl = mediaUrls[0]
                const isVideo = mediaUrl?.toLowerCase().endsWith('.mp4') || mediaUrl?.toLowerCase().endsWith('.mov')
                
                return isVideo ? (
                  <InvestiVideoPlayer uri={mediaUrl} style={{ width: '100%', marginBottom: 12 }} />
                ) : (
                  <Image source={{ uri: mediaUrl }} style={styles.postImage} />
                )
              }
              
              // Si hay múltiples medios, mostrar carrusel
              return (
                <View style={styles.carouselContainer}>
                  <FlatList
                    data={mediaUrls}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width)
                      setCurrentImageIndex(index)
                    }}
                    renderItem={({ item }) => {
                      const isVideo = item?.toLowerCase().endsWith('.mp4') || item?.toLowerCase().endsWith('.mov')
                      return isVideo ? (
                        <InvestiVideoPlayer uri={item} style={styles.carouselImage} />
                      ) : (
                        <Image source={{ uri: item }} style={styles.carouselImage} />
                      )
                    }}
                    keyExtractor={(item, index) => `media-${index}`}
                  />
                  
                  {/* Indicadores de página */}
                  <View style={styles.paginationDots}>
                    {mediaUrls.map((_: any, index: number) => (
                      <View
                        key={`dot-${index}`}
                        style={[
                          styles.dot,
                          index === currentImageIndex && styles.activeDot
                        ]}
                      />
                    ))}
                  </View>
                  
                  {/* Contador de imágenes */}
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {currentImageIndex + 1}/{mediaUrls.length}
                    </Text>
                  </View>
                </View>
              )
            })()}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThumbsUp size={16} color={post.has_liked ? '#2673f3' : '#666'} />
                <Text style={styles.statText}>{post.likes_count || 0} recomendaciones</Text>
              </View>
              <View style={styles.statItem}>
                <MessageCircle size={16} color="#666" />
                <Text style={styles.statText}>{comments.length || 0} comentarios</Text>
              </View>
              <View style={styles.statItem}>
                <Share2 size={16} color="#666" />
                <Text style={styles.statText}>{post.shares_count || 0} compartidos</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share2 size={20} color="#666" />
                <Text style={styles.actionButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleSendToUser}>
                <Send size={16} color="#666" />
                <Text style={styles.actionButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>Comentarios ({comments.length || 0})</Text>
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <MessageCircle size={48} color="#ccc" />
                <Text style={styles.noCommentsText}>No hay comentarios aún</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentContainer}>
                  <Image
                    source={{
                      uri: comment.user?.avatar_url || comment.user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.full_name || comment.user?.nombre || 'U')}&background=2673f3&color=fff`,
                    }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.user?.full_name || comment.user?.nombre}</Text>
                      <Text style={styles.commentTime}>{formatTime(comment.created_at)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.contenido}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.commentInputContainer, { bottom: keyboardOffset }]}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Escribe un comentario..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!sendingComment}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!commentText.trim() || sendingComment) && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || sendingComment}
          >
            {sendingComment ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111', flex: 1, textAlign: 'center', letterSpacing: -0.3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666' },
  scrollView: { flex: 1 },
  postCard: { backgroundColor: '#fff', padding: 20, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  authorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  authorAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e5e5e5', marginRight: 14, borderWidth: 2, borderColor: '#f5f5f5' },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 17, fontWeight: '800', color: '#111', marginBottom: 4, letterSpacing: -0.2 },
  postTime: { fontSize: 14, color: '#666', fontWeight: '500' },
  postContent: { fontSize: 17, lineHeight: 26, color: '#111', marginBottom: 16, letterSpacing: -0.1 },
  postImage: { width: '100%', height: 320, borderRadius: 16, backgroundColor: '#e5e5e5', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText: { fontSize: 15, fontWeight: '700', color: '#666' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e5e5', minWidth: 70, justifyContent: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '700', color: '#666' },
  actionButtonTextActive: { color: '#2673f3' },
  commentsSection: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
  commentsSectionTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 20, letterSpacing: -0.3 },
  noComments: { alignItems: 'center', paddingVertical: 40 },
  noCommentsText: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 16 },
  commentContainer: { flexDirection: 'row', gap: 14, marginBottom: 20, backgroundColor: '#f9fafb', padding: 14, borderRadius: 16 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e5e5', borderWidth: 2, borderColor: '#fff' },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  commentAuthor: { fontSize: 15, fontWeight: '800', color: '#111', letterSpacing: -0.2 },
  commentTime: { fontSize: 13, color: '#999', fontWeight: '500' },
  commentText: { fontSize: 15, lineHeight: 22, color: '#111', letterSpacing: -0.1 },
  commentInputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e5e5', alignItems: 'flex-end', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
  commentInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, maxHeight: 100, color: '#111' },
  sendButton: { backgroundColor: '#2673f3', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#2673f3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  sendButtonDisabled: { backgroundColor: '#e5e5e5', shadowOpacity: 0 },
  carouselContainer: { marginBottom: 16, position: 'relative' },
  carouselImage: { width: Dimensions.get('window').width - 40, height: 320, borderRadius: 16, backgroundColor: '#e5e5e5' },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, position: 'absolute', bottom: 16, left: 0, right: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)' },
  activeDot: { backgroundColor: '#fff', width: 24, borderColor: 'rgba(0, 0, 0, 0.2)' },
  imageCounter: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  imageCounterText: { color: '#fff', fontSize: 13, fontWeight: '700' },
})

export default PostDetailScreen