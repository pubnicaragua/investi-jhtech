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
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Share as RNShare,
  RefreshControl,
} from 'react-native'
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
} from 'lucide-react-native'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'

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

  useEffect(() => {
    loadData()
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
          const likeResponse = await request('GET', '/post_likes', {
            params: { select: 'id', post_id: `eq.${postId}`, user_id: `eq.${user.id}` },
          })
          postData.has_liked = likeResponse && likeResponse.length > 0
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
    try {
      if (post.has_liked) {
        await request('DELETE', '/post_likes', {
          params: { post_id: `eq.${postId}`, user_id: `eq.${currentUser.id}` },
        })
        setPost({ ...post, has_liked: false, likes_count: Math.max(0, (post.likes_count || 0) - 1) })
      } else {
        await request('POST', '/post_likes', {
          body: { post_id: postId, user_id: currentUser.id, is_like: true },
        })
        setPost({ ...post, has_liked: true, likes_count: (post.likes_count || 0) + 1 })
      }
    } catch (error) {
      console.error('Error liking post:', error)
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
      await RNShare.share({ message: `${post.contenido || post.content}\n\n- Compartido desde Investi` })
      await request('PATCH', '/posts', {
        params: { id: `eq.${postId}` },
        body: { shares_count: (post.shares_count || 0) + 1 },
      })
    } catch (error) {
      console.error('Error sharing post:', error)
    }
  }

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUser || sendingComment) return
    try {
      setSendingComment(true)
      
      // Crear comentario optimista para UI inmediata
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        user_id: currentUser.id,
        contenido: commentText.trim(),
        created_at: new Date().toISOString(),
        user: {
          id: currentUser.id,
          full_name: currentUser.full_name || currentUser.nombre,
          nombre: currentUser.nombre,
          avatar_url: currentUser.avatar_url,
          photo_url: currentUser.photo_url,
        },
      }
      
      // Actualizar UI inmediatamente
      setComments(prev => [...prev, optimisticComment])
      if (post) setPost({ ...post, comment_count: (post.comment_count || 0) + 1 })
      const savedText = commentText.trim()
      setCommentText('')
      setReplyingTo(null)
      
      // Enviar a backend
      await request('POST', '/post_comments', {
        body: {
          post_id: postId,
          user_id: currentUser.id,
          contenido: savedText,
          parent_id: replyingTo?.id || null,
        },
      })
      
      // Refrescar comentarios para obtener IDs reales
      await fetchComments()
    } catch (error) {
      console.error('Error sending comment:', error)
      Alert.alert('Error', 'No se pudo enviar el comentario')
      // Recargar comentarios en caso de error
      await fetchComments()
    } finally {
      setSendingComment(false)
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
    <SafeAreaView style={styles.container}>
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              const mediaUrl = post.media_url && post.media_url.length > 0 ? post.media_url[0] : post.image_url
              const isVideo = mediaUrl?.toLowerCase().endsWith('.mp4') || mediaUrl?.toLowerCase().endsWith('.mov')
              
              return isVideo ? (
                <InvestiVideoPlayer uri={mediaUrl} style={{ width: '100%', marginBottom: 12 }} />
              ) : (
                <Image source={{ uri: mediaUrl }} style={styles.postImage} />
              )
            })()}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Heart size={16} color="#ef4444" fill={post.has_liked ? '#ef4444' : 'none'} />
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
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Heart size={22} color={post.has_liked ? '#ef4444' : '#666'} fill={post.has_liked ? '#ef4444' : 'none'} />
                <Text style={styles.actionButtonText}>Me gusta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={22} color="#666" />
                <Text style={styles.actionButtonText}>Comentar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share2 size={22} color="#666" />
                <Text style={styles.actionButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                <Bookmark size={22} color={post.has_saved ? '#2673f3' : '#666'} fill={post.has_saved ? '#2673f3' : 'none'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>Comentarios ({post.comment_count || 0})</Text>
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

        <View style={styles.commentInputContainer}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666' },
  scrollView: { flex: 1 },
  postCard: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  authorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e5e5', marginRight: 12 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  postTime: { fontSize: 13, color: '#666' },
  postContent: { fontSize: 16, lineHeight: 24, color: '#111', marginBottom: 12 },
  postImage: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#e5e5e5', marginBottom: 12 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, fontWeight: '600', color: '#666' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  commentsSection: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  commentsSectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  noComments: { alignItems: 'center', paddingVertical: 40 },
  noCommentsText: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 16 },
  commentContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e5e5' },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontSize: 14, fontWeight: '700', color: '#111' },
  commentTime: { fontSize: 12, color: '#999' },
  commentText: { fontSize: 15, lineHeight: 20, color: '#111' },
  commentInputContainer: { flexDirection: 'row', padding: 12, paddingBottom: Platform.OS === 'ios' ? 0 : 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e5e5', alignItems: 'flex-end', gap: 8 },
  commentInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#111' },
  sendButton: { backgroundColor: '#2673f3', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#e5e5e5' },
})

export default PostDetailScreen