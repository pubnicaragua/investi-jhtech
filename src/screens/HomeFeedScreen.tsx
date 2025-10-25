import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  Share,
  StatusBar,
  Platform,
  AppState,
  Alert,
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from "react-i18next"
import { supabase } from "../supabase"
import {
  Search,
  MessageSquare,
  Bell,
  PartyPopper,
  BarChart2,
  Handshake,
  Edit3,
  Home,
  TrendingUp,
  PlusCircle,
  Newspaper,
  BookOpen,
  MoreHorizontal,
  Bookmark,
  X,
} from "lucide-react-native"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import { Sidebar } from "../components/Sidebar"
import { NotificationsModal } from "../components/NotificationsModal"
import { InvestiVideoPlayer } from "../components/InvestiVideoPlayer"
import { 
  getUserFeed, 
  likePost,
  savePost,
  getNotifications,
  getUserConversations,
  getUserProfile,
  followUser,
  unfollowUser,
  sharePost,
} from "../rest/api"
import { getCurrentUserId, request } from "../rest/client"
import { EmptyState } from "../components/EmptyState"
import { useAuthGuard } from "../hooks/useAuthGuard"
import { useOnboardingGuard } from "../hooks/useOnboardingGuard"
import { useAuth } from "../contexts/AuthContext"

const DEFAULT_QUICK_ACTIONS = [
  { key: "celebrate", label: "Celebrar un momento", icon: "party", color: "#FF6B6B" },
  { key: "poll", label: "Crea una encuesta", icon: "chart", color: "#4ECDC4" },
  { key: "partner", label: "Buscar un socio", icon: "handshake", color: "#45B7D1" },
]

export function HomeFeedScreen({ navigation }: any) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [currentRoute, setCurrentRoute] = useState("HomeFeed")
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [quickActions] = useState<any[]>(DEFAULT_QUICK_ACTIONS)

  useAuthGuard()
  const { loading: onboardingLoading } = useOnboardingGuard()

  useEffect(() => {
    initializeScreen()
    
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [])

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active' && userId) {
      loadFeed(userId)
    }
  }

  const initializeScreen = async () => {
    console.log('🔷 [HomeFeed] INICIO')
    const uid = await getCurrentUserId()
    setUserId(uid)
    
    if (uid) {
      await Promise.all([
        loadUserProfile(uid),
        loadFeed(uid),
        loadNotifications(uid),
        loadConversations(uid),
      ])
    }
  }

  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid)
      const avatarUrl = profile?.avatar_url || profile?.photo_url
      
      // Generar nombre para el avatar
      const displayName = profile?.full_name || profile?.nombre || profile?.username || 'User'
      const initials = getInitialsFromName(displayName)
      
      setUserProfile({
        ...profile,
        avatar: avatarUrl,
        initials: initials,
        displayName: displayName
      })
    } catch (err) {
      console.error("Error loading profile:", err)
      setUserProfile({ 
        avatar: null,
        initials: user?.username?.substring(0, 2).toUpperCase() || 'U',
        displayName: user?.username || 'Usuario'
      })
    }
  }

  const getInitialsFromName = (name: string) => {
    if (!name || name === 'Usuario') return user?.username?.substring(0, 2).toUpperCase() || 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const loadFeed = async (uid?: string, resetPage = true) => {
    setError(null)
    try {
      const currentUid = uid || userId
      
      if (currentUid) {
        const data = await getUserFeed(currentUid)
        setPosts(data || [])
        
        if (resetPage) {
          setPage(0)
          setHasMore(true)
        }
        
        const liked = new Set(data?.filter((p: any) => p.is_liked).map((p: any) => p.id) || [])
        const saved = new Set(data?.filter((p: any) => p.is_saved).map((p: any) => p.id) || [])
        const followed = new Set(data?.filter((p: any) => p.is_following).map((p: any) => p.user_id) || [])
        
        setLikedPosts(liked)
        setSavedPosts(saved)
        setFollowedUsers(followed)
      }
    } catch (err) {
      console.error("Error loading feed:", err)
      setError("Error al cargar el feed")
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore || !userId || !hasMore) return
    
    setLoadingMore(true)
    console.log('📄 [HomeFeed] Cargando más posts, página:', page + 1)
    
    try {
      const nextPage = page + 1
      
      // Obtener posts con offset correcto usando range
      const { data: newPosts, error } = await supabase
        .from('posts')
        .select('id,contenido,created_at,likes_count,comment_count,user_id,media_url,shares_count')
        .order('created_at', { ascending: false })
        .range(nextPage * 20, (nextPage + 1) * 20 - 1)
      
      if (error) {
        console.error('❌ [HomeFeed] Error cargando más:', error)
        setLoadingMore(false)
        return
      }
      
      if (!newPosts || newPosts.length === 0) {
        console.log('📄 [HomeFeed] No hay más posts')
        setHasMore(false)
        setLoadingMore(false)
        return
      }
      
      // Obtener datos de usuarios
      const userIds = [...new Set(newPosts.map((p: any) => p.user_id).filter(Boolean))]
      const { data: users } = await supabase
        .from('users')
        .select('id,nombre,full_name,username,photo_url,avatar_url,role')
        .in('id', userIds)
      
      // Función helper para tiempo relativo
      const getTimeAgo = (dateString: string) => {
        const now = new Date()
        const past = new Date(dateString)
        const diffMs = now.getTime() - past.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        if (diffMins < 1) return 'Ahora'
        if (diffMins < 60) return `${diffMins}m`
        if (diffHours < 24) return `${diffHours}h`
        if (diffDays < 7) return `${diffDays}d`
        return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      }
      
      // Mapear posts con usuarios
      const mappedPosts = newPosts.map((post: any) => {
        const user = users?.find((u: any) => u.id === post.user_id)
        return {
          id: post.id,
          user_id: post.user_id,
          user_name: user?.full_name || user?.nombre || 'Usuario',
          user_avatar: user?.avatar_url || user?.photo_url || 'https://ui-avatars.com/api/?name=User',
          user_role: user?.role || 'Usuario',
          content: post.contenido || '',
          image: Array.isArray(post.media_url) && post.media_url.length > 0 ? post.media_url[0] : null,
          time_ago: getTimeAgo(post.created_at),
          likes: post.likes_count || 0,
          comments: post.comment_count || 0,
          shares: post.shares_count || 0,
          is_liked: false,
          is_saved: false,
          is_following: false,
          created_at: post.created_at
        }
      })
      
      console.log('✅ [HomeFeed] Nuevos posts:', mappedPosts.length)
      
      // Filtrar duplicados por ID
      const existingIds = new Set(posts.map((p: any) => p.id));
      const uniqueNewPosts = mappedPosts.filter((p: any) => !existingIds.has(p.id));
      
      console.log('📊 [HomeFeed] Posts únicos después de filtrar:', uniqueNewPosts.length);
      setPosts([...posts, ...uniqueNewPosts])
      setPage(nextPage)
      setHasMore(newPosts.length >= 20)
      
      /* CÓDIGO COMENTADO HASTA QUE SE IMPLEMENTE PAGINACIÓN EN getUserFeed
      const { data: newPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!posts_user_id_fkey(id, nombre, full_name, avatar_url, photo_url, role)
        `)
        .order('created_at', { ascending: false })
        .range(nextPage * 20, (nextPage + 1) * 20 - 1)
      
      if (error) {
        console.error('❌ [HomeFeed] Error cargando más posts:', error)
        setHasMore(false)
        return
      }
      
      if (!newPosts || newPosts.length === 0) {
        console.log('📄 [HomeFeed] No hay más posts')
        setHasMore(false)
        return
      }
      
      console.log('✅ [HomeFeed] Cargados', newPosts.length, 'posts nuevos')
      
      // Mapear correctamente likes y comments
      const mappedPosts = newPosts.map((post: any) => ({
        ...post,
        likes_count: post.likes?.[0]?.count || 0,
        comment_count: post.comments?.[0]?.count || 0
      }))
      
      // Filtrar duplicados por ID
      const existingIds = new Set(posts.map((p: any) => p.id))
      const uniqueNewPosts = mappedPosts.filter((p: any) => !existingIds.has(p.id))
      
      setPosts([...posts, ...uniqueNewPosts])
      setPage(nextPage)
      setHasMore(newPosts.length === 20) // Si trajo menos de 20, no hay más
      */
    } catch (err) {
      console.error("❌ [HomeFeed] Exception:", err)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const loadNotifications = async (uid: string) => {
    try {
      const data = await getNotifications(uid)
      const unread = data?.filter((n: any) => !n.read).length || 0
      setUnreadCount(unread)
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  const loadConversations = async (uid: string) => {
    try {
      const data = await getUserConversations(uid)
      const unread = data?.filter((c: any) => c.unread_count > 0).length || 0
      setUnreadMessagesCount(unread)
    } catch (err) {
      console.error("Error loading conversations:", err)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    navigation.navigate("Promotions", { query: searchQuery })
  }

  const handleLike = async (postId: string) => {
    if (!userId) return
    
    try {
      const isLiked = likedPosts.has(postId)
      
      if (isLiked) {
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes: Math.max((post.likes || 0) - 1, 0) } : post
        ))
      } else {
        setLikedPosts(prev => new Set(prev).add(postId))
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
        ))
        await likePost(postId, userId)
      }
    } catch (err) {
      console.error("Error liking post:", err)
    }
  }

  const handleSave = async (postId: string) => {
    if (!userId) return
    
    try {
      const isSaved = savedPosts.has(postId)
      
      if (isSaved) {
        // Eliminar de guardados
        setSavedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
        // TODO: Llamar API para eliminar (unsavePost)
      } else {
        // Guardar post
        setSavedPosts(prev => new Set(prev).add(postId))
        const result = await savePost(postId, userId)
        
        if (result === null) {
          // Ya estaba guardado, solo actualizar UI
          return
        }
        
        // Mostrar confirmación
        Alert.alert(
          "✓ Post guardado",
          "El post se guardó correctamente",
          [
            { text: "Ver guardados", onPress: () => navigation.navigate('SavedPosts') },
            { text: "OK", style: "cancel" }
          ]
        )
      }
    } catch (err: any) {
      console.error("Error saving post:", err)
      Alert.alert("Error", "No se pudo guardar el post. Intenta de nuevo.")
      // Revertir el estado en caso de error
      if (savedPosts.has(postId)) {
        setSavedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      }
    }
  }

  const handleShare = async (postId: string, postContent?: string) => {
    if (!userId) return
    
    try {
      // Mostrar opciones de compartir
      Alert.alert(
        'Compartir publicación',
        '¿Cómo deseas compartir?',
        [
          {
            text: 'Enviar mensaje',
            onPress: () => {
              // Navegar a ChatList con el post para compartir
              navigation.navigate('ChatList', {
                sharePost: {
                  id: postId,
                  content: postContent || ''
                }
              });
            }
          },
          {
            text: 'Compartir fuera de la app',
            onPress: async () => {
              await Share.share({
                message: postContent ? `${postContent}\n\nMira esta publicación en Investi` : `Mira esta publicación en Investi`,
                url: `https://investi.app/posts/${postId}`,
              });
              
              await sharePost(postId, userId);
              const newCount = posts.find(p => p.id === postId)?.shares_count || 0;
              setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares_count: newCount + 1 } : p));
            }
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  const handlePostOptions = (postId: string, postUserId: string) => {
    const isMyPost = postUserId === userId
    
    const options = isMyPost 
      ? ['Eliminar', 'Editar', 'Cancelar']
      : ['Reportar', 'Ocultar', 'Cancelar']
    
    Alert.alert(
      'Opciones',
      '',
      isMyPost ? [
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleDeletePost(postId),
        },
        {
          text: 'Editar',
          onPress: () => Alert.alert('Próximamente', 'Editar posts estará disponible pronto'),
        },
        { text: 'Cancelar', style: 'cancel' },
      ] : [
        {
          text: 'Reportar',
          onPress: () => Alert.alert('Reportado', 'Hemos recibido tu reporte'),
        },
        {
          text: 'Ocultar',
          onPress: () => {
            setPosts(prev => prev.filter(p => p.id !== postId))
            Alert.alert('Ocultado', 'No volverás a ver esta publicación')
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    )
  }

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      '¿Eliminar publicación?',
      'Esta acción no se puede deshacer',
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
              setPosts(prev => prev.filter(p => p.id !== postId))
              Alert.alert('✅ Eliminado', 'La publicación ha sido eliminada')
            } catch (err) {
              console.error('Error deleting post:', err)
              Alert.alert('Error', 'No se pudo eliminar la publicación')
            }
          },
        },
      ]
    )
  }

  const handleFollow = async (targetUserId: string) => {
    if (!userId || userId === targetUserId) return
    
    try {
      const isFollowing = followedUsers.has(targetUserId)
      
      if (isFollowing) {
        setFollowedUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(targetUserId)
          return newSet
        })
        await unfollowUser(userId, targetUserId)
      } else {
        // Primero actualizar UI optimistamente
        setFollowedUsers(prev => new Set(prev).add(targetUserId))
        
        try {
          await followUser(userId, targetUserId)
        } catch (followError: any) {
          // Si ya existe la relación (duplicate key), ignorar el error
          if (followError?.code === '23505' || followError?.message?.includes('duplicate')) {
            // Ya está siguiendo, mantener el estado
            return
          }
          // Si es otro error, revertir el estado
          setFollowedUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(targetUserId)
            return newSet
          })
          throw followError
        }
      }
    } catch (err: any) {
      console.error("Error following user:", err)
      Alert.alert("Error", "No se pudo seguir al usuario. Intenta de nuevo.")
    }
  }

  const handleQuickAction = (actionKey: string) => {
    navigation.navigate("CreatePost", { type: actionKey })
  }

  const handleComment = (postId: string) => {
    navigation.navigate("PostDetail", { postId })
  }

  const handleSendMessage = (postId: string, targetUserId: string) => {
    // Navegar a la lista de chats (Messages/ChatList)
    navigation.navigate("Messages" as never)
  }

  const handleNavigation = (routeName: string) => {
    setCurrentRoute(routeName)
    navigation.navigate(routeName)
  }

  const getIconForAction = (iconName: string) => {
    const icons: any = {
      'party': PartyPopper,
      'chart': BarChart2,
      'handshake': Handshake,
    }
    return icons[iconName] || PartyPopper
  }

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      {item.shared_by && (
        <View style={styles.sharedHeader}>
          <Image source={{ uri: item.shared_by_avatar }} style={styles.sharedAvatar} />
          <Text style={styles.sharedText}>
            <Text style={styles.sharedName}>{item.shared_by_name || 'Usuario'}</Text> ha compartido esto
          </Text>
          <TouchableOpacity 
            style={styles.moreButtonTop} 
            activeOpacity={0.7}
            onPress={() => handlePostOptions(item.id, item.user_id)}
          >
            <MoreHorizontal size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.postHeader}>
        <TouchableOpacity 
          onPress={() => navigation.navigate("Profile", { userId: item.user_id })}
          activeOpacity={0.7}
        >
          {item.user_avatar ? (
            <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderTextLarge}>
                {item.user_name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.postHeaderCenter}>
          <View style={styles.postHeaderTop}>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Profile", { userId: item.user_id })}
              activeOpacity={0.7}
            >
              <Text style={styles.postUser}>{item.user_name || 'Usuario'}</Text>
            </TouchableOpacity>
            
            {!followedUsers.has(item.user_id) && item.user_id !== userId && (
              <TouchableOpacity 
                onPress={() => handleFollow(item.user_id)}
                activeOpacity={0.7}
              >
                <Text style={styles.followText}>+ Seguir</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.postMeta}>
            <Text style={styles.postRole}>{item.user_role || 'Usuario'}</Text>
            <Text style={styles.postMetaSeparator}> · </Text>
            <Text style={styles.postTime}>{item.time_ago || 'Hace un momento'}</Text>
            {!item.shared_by && (
              <>
                <Text style={styles.postMetaSeparator}> · </Text>
                <Text style={styles.globeIcon}>🌐</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.moreButton} 
            activeOpacity={0.7}
            onPress={() => handlePostOptions(item.id, item.user_id)}
          >
            <MoreHorizontal size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => handleSave(item.id)}
            activeOpacity={0.7}
          >
            <Bookmark 
              size={20} 
              color="#6B7280"
              strokeWidth={2}
              fill={savedPosts.has(item.id) ? "#6B7280" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
        activeOpacity={0.9}
      >
        <Text style={styles.postContent}>
          {item.content || ''}
          {item.content?.length > 150 && (
            <Text style={styles.seeMore}>  ...Ver más</Text>
          )}
        </Text>
      </TouchableOpacity>

      {(item.image || (item.media_url && item.media_url.length > 0)) && (() => {
        const mediaUrl = item.media_url && item.media_url.length > 0 ? item.media_url[0] : item.image
        const isVideo = mediaUrl?.toLowerCase().endsWith('.mp4') || mediaUrl?.toLowerCase().endsWith('.mov')
        
        return isVideo ? (
          <InvestiVideoPlayer uri={mediaUrl} style={styles.videoPlayer} />
        ) : (
          <TouchableOpacity 
            onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
            activeOpacity={0.9}
          >
            <Image source={{ uri: mediaUrl }} style={styles.postImage} />
          </TouchableOpacity>
        )
      })()}

      <View style={styles.postStats}>
        <View style={styles.postStatsLeft}>
          <View style={styles.likeIcon}>
            <Ionicons name="thumbs-up" size={10} color="#FFFFFF" />
          </View>
          <Text style={styles.statText}>{item.likes || 0}</Text>
        </View>
        <View style={styles.postStatsRight}>
          <Text style={styles.statTextRight}>{item.comments || 0} comentarios</Text>
          <Text style={styles.statSeparator}> · </Text>
          <Text style={styles.statTextRight}>{item.shares || 0} compartidos</Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleLike(item.id)}
          activeOpacity={0.6}
        >
          <Ionicons 
            name={likedPosts.has(item.id) ? "thumbs-up" : "thumbs-up-outline"}
            size={26} 
            color={likedPosts.has(item.id) ? "#3B82F6" : "#4B5563"} 
          />
          <Text style={[styles.actionText, likedPosts.has(item.id) && styles.actionTextActive]}>
            Recomendar
          </Text>
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleComment(item.id)}
          activeOpacity={0.6}
        >
          <Ionicons name="chatbubble-outline" size={26} color="#4B5563" />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
          
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleShare(item.id, item.content)}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-redo-outline" size={26} color="#4B5563" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleSendMessage(item.id, item.user_id)}
          activeOpacity={0.6}
        >
          <Ionicons name="paper-plane-outline" size={26} color="#4B5563" />
          <Text style={styles.actionText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (onboardingLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
      <NotificationsModal 
        visible={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        userId={userId} 
        navigation={navigation} 
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setIsSidebarOpen(true)}
            activeOpacity={0.7}
          >
            {userProfile?.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.avatarPlaceholder]}> 
                <Text style={styles.avatarPlaceholderText}>
                  {userProfile?.initials || user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Search size={18} color="#9CA3AF" strokeWidth={2} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Buscar personas, comunidades..." 
              placeholderTextColor="#9CA3AF" 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.headerIconButton} 
            onPress={() => setIsNotificationsOpen(true)}
            activeOpacity={0.7}
          >
            <Bell size={24} color="#1F2937" strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton} 
            onPress={() => navigation.navigate("ChatList")}
            activeOpacity={0.7}
          >
            <MessageSquare size={24} color="#1F2937" strokeWidth={2} />
            {unreadMessagesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.quickActionsContent}
          >
            {quickActions.map((action: any) => {
              const IconComponent = getIconForAction(action.icon)
              return (
                <TouchableOpacity 
                  key={action.key} 
                  style={styles.quickChip} 
                  onPress={() => handleQuickAction(action.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickChipIcon, { backgroundColor: `${action.color}20` }]}>
                    <IconComponent size={16} color={action.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.quickChipLabel}>{action.label}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        <View style={styles.writePostContainer}>
          {userProfile?.avatar ? (
            <Image source={{ uri: userProfile.avatar }} style={styles.writeAvatar} />
          ) : (
            <View style={[styles.writeAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {userProfile?.initials || user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.writeBox} 
            onPress={() => navigation.navigate("CreatePost")}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.writePlaceholder}>Escribe algo…</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : error || posts.length === 0 ? (
            <EmptyState 
              title="No hay publicaciones disponibles" 
              message="Reintentar" 
              onRetry={() => loadFeed()} 
            />
          ) : (
            <FlatList 
              data={posts} 
              keyExtractor={(item) => item.id.toString()} 
              renderItem={renderPost} 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.feedContent} 
              refreshing={loading} 
              onRefresh={() => loadFeed()} 
              onEndReached={loadMorePosts}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingMoreText}>Cargando más...</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </SafeAreaView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("HomeFeed")} 
        >
          <Ionicons 
            name={currentRoute === "HomeFeed" ? "home" : "home-outline"}
            size={26} 
            color={currentRoute === "HomeFeed" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("MarketInfo")} 
        >
          <Ionicons 
            name={currentRoute === "MarketInfo" ? "trending-up" : "trending-up-outline"}
            size={26} 
            color={currentRoute === "MarketInfo" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => handleNavigation("CreatePost")} 
        >
          <View style={styles.fabButton}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("News")} 
        >
          <Ionicons 
            name={currentRoute === "News" ? "newspaper" : "newspaper-outline"}
            size={26} 
            color={currentRoute === "News" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("Educacion")} 
        >
          <Ionicons 
            name={currentRoute === "Educacion" ? "school" : "school-outline"}
            size={26} 
            color={currentRoute === "Educacion" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  avatarPlaceholderTextLarge: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1F2937",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  headerIconButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  quickActionsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    gap: 8,
  },
  quickChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quickChipLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  writePostContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 10,
  },
  writeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  writeBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    gap: 8,
  },
  writePlaceholder: {
    color: "#9CA3AF",
    fontSize: 14,
    flex: 1,
  },
  feedContainer: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 90,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingTop: 16,
    paddingBottom: 12,
  },
  sharedHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 12,
    gap: 8,
  },
  sharedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  sharedText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
  },
  sharedName: {
    fontWeight: "600",
    color: "#374151",
  },
  moreButtonTop: {
    padding: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  postHeaderCenter: {
    flex: 1,
  },
  postHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  postUser: {
    fontWeight: "600",
    fontSize: 15,
    color: "#111827",
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  postRole: {
    fontSize: 12,
    color: "#6B7280",
  },
  postMetaSeparator: {
    fontSize: 12,
    color: "#6B7280",
  },
  postTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  globeIcon: {
    fontSize: 11,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 12,
  },
  seeMore: {
    color: "#6B7280",
    fontWeight: "500",
  },
  postImage: {
    width: "100%",
    height: 300,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  videoPlayer: {
    width: "100%",
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  postStatsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  statText: {
    fontSize: 13,
    color: "#6B7280",
  },
  postStatsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statTextRight: {
    fontSize: 13,
    color: "#6B7280",
  },
  statSeparator: {
    fontSize: 13,
    color: "#6B7280",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionBtn: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  navItem: {
    padding: 12,
  },
  fabContainer: {
    marginTop: -16,
    padding: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2673f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMoreText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
})