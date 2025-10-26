// ============================================================================
// CommunityPostDetailScreen.tsx - Detalle de Post de Comunidad con Comentarios
// ============================================================================
// Similar a PostDetailScreen pero para posts de comunidad
// Muestra post arriba, lista de comentarios y composer anclado al teclado
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Share as RNShare,
  RefreshControl,
  Keyboard,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
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
  CornerUpRight,
} from 'lucide-react-native'
import {
  getCommunityPostDetail,
  likeCommunityPost,
  unlikeCommunityPost,
  commentCommunityPost,
  shareCommunityPost,
  saveCommunityPost,
  unsaveCommunityPost,
  deleteCommunityPost,
} from '../rest/communityPosts'
import { getCurrentUser } from '../rest/api'

export function CommunityPostDetailScreen() {
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
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [user, postData] = await Promise.all([
        getCurrentUser(),
        getCommunityPostDetail(postId),
      ])
      setCurrentUser(user)
      if (postData) {
        setPost(postData)
        setComments(postData.comments || [])
      }
    } catch (err) {
      console.error('Error loading community post detail:', err)
      Alert.alert('Error', 'No se pudo cargar la publicación')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [postId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadData()
  }, [loadData])

  const handleLike = async () => {
    if (!currentUser || !post) return
    try {
      if (post.has_liked) {
        await unlikeCommunityPost(post.id, currentUser.id)
        setPost((p:any)=> ({ ...p, has_liked: false, likes: Math.max((p.likes||0)-1, 0) }))
      } else {
        await likeCommunityPost(post.id, currentUser.id)
        setPost((p:any)=> ({ ...p, has_liked: true, likes: (p.likes||0)+1 }))
      }
    } catch (err) {
      console.error('Error liking:', err)
    }
  }

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUser || !post) return
    try {
      setSending(true)
      const created = await commentCommunityPost(post.id, currentUser.id, commentText.trim())
      // If API returns the created comment, append; otherwise, reload
      if (created && created.id) {
        // Normalize to the shape used in comments list
        const newComment = {
          ...created,
          author: {
            username: currentUser.full_name || currentUser.nombre || 'Usuario',
            photo_url: currentUser.photo_url || currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name||currentUser.nombre||'U')}`,
          }
        }
        setComments(prev => [...prev, newComment])
        setCommentText('')
        // Scroll to bottom
        setTimeout(()=>flatListRef.current?.scrollToEnd?.({ animated: true }), 200)
      } else {
        await loadData()
        setCommentText('')
      }
    } catch (err) {
      console.error('Error sending comment:', err)
      Alert.alert('Error', 'No se pudo enviar el comentario')
    } finally {
      setSending(false)
      Keyboard.dismiss()
    }
  }

  const renderComment = ({ item }: { item: any }) => {
    const author = item.author || {}
    const isCurrentUser = currentUser && (item.author_id === currentUser.id || item.user_id === currentUser.id)

    return (
      <View style={[styles.commentItem, isCurrentUser ? styles.commentItemRight : styles.commentItemLeft]}>
        {!isCurrentUser && (
          <Image source={{ uri: author.photo_url }} style={styles.commentAvatar} />
        )}
        <View style={[styles.commentBody, isCurrentUser ? styles.commentBodyRight : styles.commentBodyLeft]}>
          {!isCurrentUser && (
            <Text style={styles.commentAuthor}>{author.username || 'Usuario'}</Text>
          )}
          <Text style={[styles.commentText, isCurrentUser ? styles.commentTextRight : styles.commentTextLeft]}>{item.contenido}</Text>
          <Text style={[styles.commentTime, isCurrentUser ? styles.commentTimeRight : styles.commentTimeLeft]}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        {isCurrentUser && (
          <Image source={{ uri: author.photo_url }} style={styles.commentAvatar} />
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2673f3" /></View>
      </SafeAreaView>
    )
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}><Text>No se encontró la publicación</Text></View>
      </SafeAreaView>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient colors={['#2673f3', '#1e5fd9']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 24 }} />
        </LinearGradient>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image source={{ uri: post.author.photo_url }} style={styles.postAvatar} />
              <View style={styles.postAuthorInfo}>
                <Text style={styles.postAuthorName}>{post.author.username}</Text>
                <Text style={styles.postTime}>{new Date(post.created_at).toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            {post.media && post.media.length > 0 && (
              <Image source={{ uri: post.media[0] }} style={styles.postImage} />
            )}
            <View style={styles.postStats}>
              <Text style={styles.postStat}>👍 {post.likes || 0}</Text>
              <Text style={styles.postStat}>{post.comment_count || comments.length} comentarios</Text>
            </View>
          </View>

          <View style={styles.commentsContainer}>
            {comments.map((item) => (
              <View key={item.id}>
                {renderComment({ item })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.commentComposer}>
          <Image source={{ uri: currentUser?.photo_url || currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name||currentUser?.nombre||'U')}` }} style={styles.commentComposerAvatar} />
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe un comentario..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity onPress={handleSendComment} style={styles.sendButton} disabled={sending || commentText.trim().length===0}>
            {sending ? <ActivityIndicator color="#fff" /> : <Send size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex:1, justifyContent:'center', alignItems:'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  backButton: { padding: 4 },
  headerTitle: { fontSize:18, fontWeight:'700', color:'#fff', letterSpacing:0.3 },
  contentContainer: { flex: 1 },
  flatList: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  commentsContainer: { marginTop: 16 },
  postCard: { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:12 },
  postHeader: { flexDirection:'row', alignItems:'center', marginBottom:8 },
  postAvatar: { width:44, height:44, borderRadius:22, marginRight:12 },
  postAuthorInfo: { flex:1 },
  postAuthorName: { fontSize:15, fontWeight:'600' },
  postTime: { fontSize:12, color:'#777' },
  postContent: { fontSize:15, color:'#111', marginVertical:8 },
  postImage: { width:'100%', height:220, borderRadius:8, marginVertical:8 },
  postStats: { flexDirection:'row', gap:12, marginVertical:8 },
  postStat: { fontSize:13, color:'#666' },
  postActions: { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:8 },
  postAction: { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:8, paddingHorizontal:6 },
  postActionText: { fontSize:13, color:'#666' },
  commentItem: { flexDirection:'row', paddingVertical:10, alignItems:'flex-start' },
  commentItemLeft: { justifyContent: 'flex-start' },
  commentItemRight: { justifyContent: 'flex-end' },
  commentAvatar: { width:40, height:40, borderRadius:20, marginRight:10 },
  commentBody: { flex:1 },
  commentBodyLeft: { maxWidth: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginRight: 10 },
  commentBodyRight: { maxWidth: '70%', backgroundColor: '#2673f3', borderRadius: 12, padding: 10, marginLeft: 10 },
  commentAuthor: { fontSize:14, fontWeight:'600' },
  commentText: { fontSize:14, color:'#111', marginVertical:4 },
  commentTextLeft: { color: '#111' },
  commentTextRight: { color: '#fff' },
  commentTime: { fontSize:12, color:'#999' },
  commentTimeLeft: { color: '#999' },
  commentTimeRight: { color: '#e0e0e0' },
  commentComposer: { position:'absolute', left:0, right:0, bottom:0, flexDirection:'row', alignItems:'center', padding:8, backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#eee', paddingBottom: Platform.OS === 'ios' ? 20 : 8 },
  commentComposerAvatar: { width:36, height:36, borderRadius:18, marginRight:8 },
  commentInput: { flex:1, minHeight:36, maxHeight:120, paddingHorizontal:12, paddingVertical:8, backgroundColor:'#f3f4f6', borderRadius:18 },
  sendButton: { marginLeft:8, backgroundColor:'#2673f3', padding:10, borderRadius:18, alignItems:'center', justifyContent:'center' },
})

export default CommunityPostDetailScreen
