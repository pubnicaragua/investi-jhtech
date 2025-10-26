// CommunityDetailScreen.tsx - Pantalla de Detalle de Comunidad
// ============================================================================
// 100% Pixel Perfect + Backend Driven + Navegación a GroupChatScreen
// ============================================================================

import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StatusBar,
  Alert,
  FlatList,
  Share,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  Image,
  Dimensions
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Image as ImageIcon,
  Video,
  FileText,

  Search,
  MoreHorizontal,
  ThumbsUp,
  Share2,
  Send,
  Bookmark,
  Flag,
  UserX,
  Settings,
  UserCog,
  Edit3
} from "lucide-react-native"
import { Ionicons } from '@expo/vector-icons'

import {
  getCommunityDetails,
  joinCommunity,
  isUserMemberOfCommunity,
  getUserCommunityRole,
  getCommunityChannels
} from "../rest/communities"

import { createChannel } from "../api"

import {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  unlikeCommunityPost,
  deleteCommunityPost
} from "../rest/communityPosts"

import {
  searchUsers
} from "../rest/users"

import { getCurrentUser } from "../rest/api"
import { InvestiVideoPlayer } from "../components/InvestiVideoPlayer"

const { width } = Dimensions.get('window')

// --- Interfaces ---
interface CommunityDetail {
  id: string
  name: string
  description: string
  icono_url: string
  cover_image_url?: string
  type: string
  members_count: number
  created_at: string
}

interface Post {
  id: string
  contenido: string
  user_id: string
  community_id: string
  image_url?: string
  likes_count: number
  comment_count: number
  shares_count?: number
  created_at: string
  users?: {
    id: string
    nombre: string
    full_name?: string
    avatar_url?: string
    photo_url?: string
    role?: string
  }
}

interface Channel {
  id: string
  name: string
  description: string
  type: string
}

interface CommunityUser {
  id: string
  nombre: string
  full_name?: string
  avatar_url?: string
  photo_url?: string
  role: string
  bio?: string
}

export function CommunityDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute()
  const insets = useSafeAreaInsets()
  const { communityId } = route.params as { communityId: string }

  // Estados
  const [community, setCommunity] = useState<CommunityDetail | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [users, setUsers] = useState<CommunityUser[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'userPosts' | 'posts' | 'chats' | 'multimedia' | 'search'>('posts')
  const [activeMultimediaTab, setActiveMultimediaTab] = useState<'photos' | 'videos' | 'files'>('photos')
  const [postContent, setPostContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeUsersCount, setActiveUsersCount] = useState(0)
  const [onlineMembers, setOnlineMembers] = useState(0)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showPostOptions, setShowPostOptions] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')

  // ✅ Avatar predeterminado
  const getDefaultAvatar = (name: string) => {
    const initial = name?.charAt(0)?.toUpperCase() || 'U'
    return `https://ui-avatars.com/api/?name=${initial}&background=2673f3&color=fff&size=200`
  }

  // ✅ Shared avatar resolver: prefers avatar_url -> photo_url -> avatar -> generated ui-avatar
  const getAvatarForUser = (user?: any, fallbackName?: string) => {
    if (!user) return getDefaultAvatar(fallbackName || 'Usuario')
    const name = user.full_name || user.nombre || user.name || fallbackName || 'Usuario'
    const avatar = user.avatar_url || user.photo_url || user.avatar || ''
    if (typeof avatar === 'string' && avatar.trim().length > 0) return avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2673f3&color=fff&size=200`
  }

  // --- Load Data 100% Backend ---
  const loadCommunityData = useCallback(async () => {
    try {
      setLoading(true)

      const [communityData, communityChannels, communityPosts, user] = await Promise.all([
        getCommunityDetails(communityId),
        getCommunityChannels(communityId),
        getCommunityPosts(communityId),
        getCurrentUser()
      ])

      if (communityData) {
        setCommunity({
          id: communityData.id,
          name: communityData.name,
          description: communityData.description,
          icono_url: (communityData as any).icono_url || communityData.image_url,
          cover_image_url: (communityData as any).cover_image_url,
          type: communityData.type,
          members_count: communityData.members_count,
          created_at: communityData.created_at
        })

        // ✅ Normalize posts returned by API into the shape this screen expects
  const normalizedPosts = (communityPosts || []).map((post: any) => {
          // Handle two shapes:
          // 1) communityPosts.ts returns { id, content, created_at, likes, comments, shares, media, author }
          // 2) Raw backend may return { id, contenido, created_at, likes_count, comment_count, shares_count, user_id, users }
          if (post.content || post.author) {
            return {
              id: post.id,
              contenido: post.content || post.contenido || '',
              user_id: post.author?.id || post.user_id || null,
              community_id: post.community_id || communityData.id,
              image_url: Array.isArray(post.media) ? post.media[0] : (post.media || post.image_url || null),
              likes_count: post.likes ?? post.likes_count ?? 0,
              comment_count: post.comments ?? post.comment_count ?? 0,
              shares_count: post.shares ?? post.shares_count ?? 0,
              created_at: post.created_at,
              users: post.author ? {
                id: post.author.id,
                nombre: post.author.name,
                full_name: post.author.name,
                avatar_url: post.author.avatar,
                role: post.author.role,
              } : post.users || null,
            }
          }

          // Fallback mapping for unexpected shapes
          return {
            id: post.id,
            contenido: post.contenido || post.content || '',
            user_id: post.user_id || post.author?.id || null,
            community_id: post.community_id || communityData.id,
            image_url: post.image_url || (Array.isArray(post.media) ? post.media[0] : null) || null,
            likes_count: post.likes_count || post.likes || 0,
            comment_count: post.comment_count || post.comments || 0,
            shares_count: post.shares_count || post.shares || 0,
            created_at: post.created_at,
            users: post.users || (post.author ? {
              id: post.author.id,
              nombre: post.author.name,
              full_name: post.author.name,
              avatar_url: post.author.avatar,
              role: post.author.role,
            } : null),
          }
        })

        setPosts(normalizedPosts)
        setChannels(communityChannels || [])
        setCurrentUser(user)

        // ✅ Verificar membresía del usuario
        if (user) {
          const membership = await isUserMemberOfCommunity(user.id, communityId)
          setIsJoined(membership)

          if (membership) {
            const userRole = await getUserCommunityRole(user.id, communityId)
            setUserRole(userRole)
          }
        }

        // ✅ Datos reales del backend para estadísticas
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const activeUsers = normalizedPosts.filter((p: any) => new Date(p.created_at) > last24h).length + (channels?.length || 0)

        setActiveUsersCount(activeUsers)
        setOnlineMembers(community?.members_count || 0)
      }
    } catch (error) {
      console.error('Error loading community data:', error)
      Alert.alert('Error', 'No se pudo cargar la información de la comunidad')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [communityId])

  const loadTabData = useCallback(async (tab: string) => {
    if (tab === 'search' && searchQuery.trim()) {
      try {
        const results = await searchUsers(searchQuery)
        setUsers(results || [])
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    loadCommunityData()
  }, [loadCommunityData])

  // Reload data when screen gains focus (e.g. after creating a post)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCommunityData()
    })
    return unsubscribe
  }, [navigation, loadCommunityData])

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        loadTabData(activeTab)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, activeTab])

  // ✅ Crear canal general automáticamente cuando se accede a la pestaña chats
  useEffect(() => {
    if (activeTab === 'chats' && channels.length === 0 && isJoined && community && currentUser) {
      const createDefaultChannel = async () => {
        try {
          await createChannel(community.id, currentUser.id, {
            name: "General",
            description: "Canal general de la comunidad",
            type: "text"
          })
          // Recargar canales después de crear
          const newChannels = await getCommunityChannels(communityId)
          setChannels(newChannels || [])
        } catch (error) {
          console.error('Error creando canal general:', error)
        }
      }
      createDefaultChannel()
    }
  }, [activeTab, channels.length, isJoined, community, communityId, currentUser])

  // --- Actions ---
  const handleJoinCommunity = async () => {
    try {
      if (currentUser && community) {
        await joinCommunity(currentUser.id, community.id)
        setIsJoined(true)
        Alert.alert('Éxito', '¡Te has unido a la comunidad!')
        loadCommunityData()
      }
    } catch (error) {
      console.error('Error joining community:', error)
      Alert.alert('Error', 'No se pudo unir a la comunidad')
    }
  }

  const handleCreatePost = async () => {
    if (!postContent.trim() || !currentUser || !community) return

    if (!isJoined) {
      Alert.alert('Atención', 'Debes unirte a la comunidad para publicar')
      return
    }

    try {
      await createCommunityPost({
        user_id: currentUser.id,
        community_id: community.id,
        contenido: postContent,
      })
      setPostContent('')
      loadCommunityData()
      Alert.alert('Éxito', '¡Publicación creada!')
    } catch (error) {
      console.error('Error creating post:', error)
      Alert.alert('Error', 'No se pudo crear la publicación')
    }
  }

  const handleQuickAction = (actionType: string) => {
    if (!isJoined) {
      Alert.alert('Atención', 'Debes unirte a la comunidad para realizar esta acción')
      return
    }
    navigation.navigate('CreateCommunityPost', {
      type: actionType,
      communityId: community?.id
    })
  }

  const handleInvite = async () => {
    if (!community) return
    Alert.alert(
      'Invitar',
      '¿Cómo quieres invitar?',
      [
        {
          text: 'Compartir fuera de la app',
          onPress: async () => {
            try {
              const shareMessage = `Únete a "${community.name}" en Investi\n\n${community.description}\n\nDescarga la app: https://investiiapp.com`
              await Share.share({
                message: shareMessage,
                title: `Invitación a ${community.name}`
              })
            } catch (error) {
              console.error('Error sharing:', error)
            }
          }
        },
        {
          text: 'Invitar conexión',
          onPress: () => navigation.navigate('CommunityMembers', {
            communityId: community.id,
            mode: 'invite'
          })
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  const handleMenuOption = (option: string) => {
    setShowOptionsMenu(false)
    switch (option) {
      case 'settings':
        navigation.navigate('CommunitySettings', { communityId: community?.id })
        break
      case 'edit':
        navigation.navigate('EditCommunity', { communityId: community?.id })
        break
      case 'members':
        navigation.navigate('CommunityMembers', { communityId: community?.id })
        break
      case 'notifications':
        Alert.alert('Notificaciones', 'Configuración de notificaciones')
        break
      case 'report':
        Alert.alert('Reportar', '¿Deseas reportar esta comunidad?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reportar', style: 'destructive', onPress: () => {
            Alert.alert('Reportado', 'Gracias por tu reporte')
          }}
        ])
        break
      case 'leave':
        Alert.alert('Salir', '¿Estás seguro de que quieres salir de esta comunidad?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => {
            setIsJoined(false)
            Alert.alert('Éxito', 'Has salido de la comunidad')
          }}
        ])
        break
    }
  }

  const handlePostOption = (postId: string, option: string) => {
    setShowPostOptions(null)
    switch (option) {
      case 'save':
        Alert.alert('Guardado', 'Publicación guardada')
        break
      case 'report':
        Alert.alert('Reportar', '¿Deseas reportar esta publicación?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reportar', style: 'destructive', onPress: () => {
            Alert.alert('Reportado', 'Gracias por tu reporte')
          }}
        ])
        break
      case 'hide':
        setPosts(posts.filter(p => p.id !== postId))
        Alert.alert('Oculto', 'Publicación ocultada')
        break
      case 'delete':
        // handled by confirmDeletePost
        break
    }
  }

  const confirmDeletePost = (postId: string) => {
    Alert.alert('Eliminar publicación', '¿Estás seguro de que quieres eliminar esta publicación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await deleteCommunityPost(postId)
            setPosts(prev => prev.filter(p => p.id !== postId))
            setShowPostOptions(null)
            Alert.alert('Eliminada', 'La publicación ha sido eliminada')
          } catch (error) {
            console.error('Error deleting post:', error)
            Alert.alert('Error', 'No se pudo eliminar la publicación')
          }
        }
      }
    ])
  }

  const handleLike = async (postId: string) => {
    if (!currentUser) return

    try {
      const isLiked = likedPosts.has(postId)

      if (isLiked) {
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, likes_count: Math.max((post.likes_count || 0) - 1, 0) }
            : post
        ))
        await unlikeCommunityPost(postId, currentUser.id)
      } else {
        setLikedPosts(prev => new Set(prev).add(postId))
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
            : post
        ))
        await likeCommunityPost(postId, currentUser.id)
      }
    } catch (err) {
      console.error("Error liking post:", err)
    }
  }

  const handleComment = (post: Post) => {
    navigation.navigate('CommunityPostDetail', { postId: post.id })
  }

  const handleSharePost = async (post: Post) => {
    try {
      await Share.share({
        message: `${post.contenido}\n\nCompartido desde Investi`,
        title: 'Compartir publicación'
      })
      setPosts(prev => prev.map(p =>
        p.id === post.id
          ? { ...p, shares_count: (p.shares_count || 0) + 1 }
          : p
      ))
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  const handleSendMessage = (userId: string) => {
    navigation.navigate('ChatScreen', { chatId: userId })
  }

  // ✅ NAVEGACIÓN A GROUPCHATSCREEN - Cuando se hace click en chats
  const handleChannelPress = (channel: Channel) => {
    navigation.navigate('GroupChat', {
      channelId: channel.id,
      channelName: channel.name,
      communityId: community?.id
    })
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !currentUser || !community) return

    try {
      await createChannel(community.id, currentUser.id, {
        name: newChannelName.trim(),
        description: newChannelDescription.trim(),
        type: "text"
      })
      setNewChannelName('')
      setNewChannelDescription('')
      setShowCreateChannelModal(false)
      const newChannels = await getCommunityChannels(communityId)
      setChannels(newChannels || [])
      Alert.alert('Éxito', 'Canal creado')
    } catch (error) {
      console.error('Error creating channel:', error)
      Alert.alert('Error', 'No se pudo crear el canal')
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadCommunityData()
  }, [loadCommunityData])

  const getTimeAgo = (dateString: string) => {
    const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60))
    if (hours < 1) return 'Hace un momento'
    if (hours < 24) return `${hours} h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} d`
    const weeks = Math.floor(days / 7)
    return `${weeks} sem`
  }

    // --- PostCard Component (HomeFeed visual parity) ---
    const PostCard = ({ post }: { post: Post }) => {
      if (!post) return null
      const authorData = post.users || (post as any).author || null
      const authorName = authorData?.full_name || authorData?.nombre || authorData?.name || 'Usuario'
      let authorAvatar = getAvatarForUser(authorData, authorName)
      if (post.image_url && authorAvatar && post.image_url === authorAvatar) {
        authorAvatar = getDefaultAvatar(authorName)
      }
      const authorRole = authorData?.role || 'Usuario'

      return (
        <View style={styles.postCard}>
          {/* Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.user_id })} activeOpacity={0.8}>
              <Image source={{ uri: authorAvatar }} style={styles.postAvatar} />
            </TouchableOpacity>

            <View style={styles.postAuthorInfo}>
              <View style={styles.postAuthorRow}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.user_id })} activeOpacity={0.8}>
                  <Text style={styles.postAuthorName}>{authorName}</Text>
                </TouchableOpacity>
                <Text style={styles.postTime}>  {getTimeAgo(post.created_at)}</Text>
              </View>
              <Text style={styles.postAuthorRole}>{authorRole}</Text>
            </View>

            <TouchableOpacity style={styles.postOptionsBtn} onPress={() => setShowPostOptions(post.id)}>
              <MoreHorizontal size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleComment(post)}>
            <Text style={styles.postContent}>{post.contenido}</Text>
            {post.contenido?.length > 150 && <Text style={styles.seeMore}>  ...Ver más</Text>}
          </TouchableOpacity>

          {/* Media */}
          {(post.image_url) && (() => {
            const mediaUrl = post.image_url
            const isVideo = mediaUrl?.toLowerCase().endsWith('.mp4') || mediaUrl?.toLowerCase().endsWith('.mov')
            return isVideo ? (
              <InvestiVideoPlayer uri={mediaUrl} style={styles.videoPlayer} />
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: post.id })} activeOpacity={0.9}>
                <Image source={{ uri: mediaUrl }} style={styles.postImage} />
              </TouchableOpacity>
            )
          })()}

          {/* Stats (left like bubble + counts on right) */}
          <View style={styles.postStats}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.likeIcon}><Ionicons name="thumbs-up" size={10} color="#FFFFFF" /></View>
              <Text style={styles.postStat}>{post.likes_count || 0}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.postStat}>{post.comment_count || 0} comentarios</Text>
              <Text style={styles.postStat}>{post.shares_count || 0} compartidos</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction} onPress={() => handleLike(post.id)}>
              <Ionicons name={likedPosts.has(post.id) ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={likedPosts.has(post.id) ? '#2673f3' : '#4B5563'} />
              <Text style={[styles.postActionText, likedPosts.has(post.id) && { color: '#2673f3' }]}>Recomendar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postAction} onPress={() => handleComment(post)}>
              <Ionicons name="chatbubble-outline" size={18} color="#4B5563" />
              <Text style={styles.postActionText}>Comentar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postAction} onPress={() => handleSharePost(post)}>
              <Ionicons name="arrow-redo-outline" size={18} color="#4B5563" />
              <Text style={styles.postActionText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postAction} onPress={() => handleSendMessage(post.user_id)}>
              <Ionicons name="paper-plane-outline" size={18} color="#4B5563" />
              <Text style={styles.postActionText}>Enviar</Text>
            </TouchableOpacity>
          </View>

          {/* Modal de opciones del post */}
          <Modal visible={showPostOptions === post.id} transparent animationType="fade" onRequestClose={() => setShowPostOptions(null)}>
            <Pressable style={styles.modalOverlay} onPress={() => setShowPostOptions(null)}>
              <View style={styles.optionsMenu}>
                <TouchableOpacity style={styles.optionItem} onPress={() => handlePostOption(post.id, 'save')}>
                  <Bookmark size={20} color="#111" />
                  <Text style={styles.optionText}>Guardar publicación</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => handlePostOption(post.id, 'report')}>
                  <Flag size={20} color="#111" />
                  <Text style={styles.optionText}>Reportar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => handlePostOption(post.id, 'hide')}>
                  <UserX size={20} color="#111" />
                  <Text style={styles.optionText}>Ocultar publicación</Text>
                </TouchableOpacity>

                {(currentUser?.id === post.user_id || isAdmin) && (
                  <TouchableOpacity style={styles.optionItem} onPress={() => confirmDeletePost(post.id)}>
                    <UserX size={20} color="#d9534f" />
                    <Text style={[styles.optionText, { color: '#d9534f' }]}>Eliminar publicación</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          </Modal>
        </View>
      )
    }
  
    const isAdmin = userRole === 'admin' || userRole === 'moderator'
  
    if (loading) {
      return (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      )
    }
  
    if (!community) {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Comunidad no encontrada</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent />
  
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{community.name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setActiveTab('search')}
            >
              <Search size={22} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setShowOptionsMenu(true)}
            >
              <MoreHorizontal size={22} color="#111" />
            </TouchableOpacity>
          </View>
        </View>
  
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2673f3']}
              tintColor="#2673f3"
            />
          }
        >
          {/* Nueva sección con fondo predeterminado */}
          <View style={styles.communitySection}>
            {/* Avatar circular de la comunidad */}
            <Image
              source={{ uri: community.icono_url || getDefaultAvatar(community.name) }}
              style={styles.communityAvatar}
            />

            {/* Detalles de la comunidad */}
            <View style={styles.communityDetails}>
              {/* Nombre de la comunidad */}
              <Text style={styles.communityName}>{community.name}</Text>

              {/* Cantidad de miembros y tipo en una fila */}
              <View style={styles.communityMetaRow}>
                <Text style={styles.communityMetaText}>
                  {community.members_count || 0} miembros
                </Text>
                {community.type === 'public' && (
                  <Text style={styles.communityTypeText}>Comunidad pública</Text>
                )}
                {community.type === 'private' && (
                  <Text style={styles.communityTypeText}>Comunidad privada</Text>
                )}
                {community.type === 'restricted' && (
                  <Text style={styles.communityTypeText}>Comunidad Colegio</Text>
                )}
              </View>

              {/* Botones de unirse e invitar */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.joinButton, isJoined && styles.joinedButton]}
                  onPress={() => {
                    if (isJoined) {
                      navigation.navigate('GroupChat', { communityId: community.id })
                    } else {
                      handleJoinCommunity()
                    }
                  }}
                >
                  <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
                    {isJoined ? 'Ir al chat' : 'Unirse'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={handleInvite}
                >
                  <Text style={styles.inviteButtonText}>Invitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
  
          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollView}
            contentContainerStyle={styles.tabsContainer}
            scrollEnabled={true}
            bounces={true}
            alwaysBounceHorizontal={true}
          >
            
            <Pressable
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Publicaciones</Text>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === 'userPosts' && styles.activeTab]}
              onPress={() => setActiveTab('userPosts')}
            >
              <Text style={[styles.tabText, activeTab === 'userPosts' && styles.activeTabText]}>Tus Publicaciones</Text>
            </Pressable>
            
            <Pressable
              style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
              onPress={() => setActiveTab('chats')}
            >
              <MessageCircle size={16} color={activeTab === 'chats' ? '#2673f3' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Chats</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'multimedia' && styles.activeTab]}
              onPress={() => setActiveTab('multimedia')}
            >
              <ImageIcon size={16} color={activeTab === 'multimedia' ? '#2673f3' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'multimedia' && styles.activeTabText]}>Multimedia</Text>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === 'search' && styles.activeTab]}
              onPress={() => setActiveTab('search')}
            >
              <Search size={16} color={activeTab === 'search' ? '#2673f3' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Buscar inversores</Text>
            </Pressable>
          </ScrollView>
  
          {/* Content based on active tab */}
          {activeTab === 'posts' && (
            <View style={styles.postsContent}>
              {/* Post Creation Input - Solo para miembros cuando hay publicaciones */}
              {isJoined && (
                <TouchableOpacity
                  style={styles.fbComposer}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('CreateCommunityPost', { communityId: community?.id })}
                >
                  <Image
                    source={{ uri: getAvatarForUser(currentUser) }}
                    style={styles.userAvatarSmall}
                  />
                  <View style={styles.fbComposerInput}>
                    <Text style={styles.fbComposerPlaceholder}>¿Qué estás pensando, {currentUser?.nombre || 'Usuario'}?</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Quick Actions */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickActionsScroll}
                contentContainerStyle={styles.quickActionsContainer}
              >
                <TouchableOpacity
                  style={[styles.quickAction, !isJoined && styles.quickActionDisabled]}
                  onPress={() => handleQuickAction('celebrate')}
                  disabled={!isJoined}
                >
                  <Text style={[styles.quickActionText, !isJoined && styles.quickActionTextDisabled]}>Celebrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAction, !isJoined && styles.quickActionDisabled]}
                  onPress={() => handleQuickAction('poll')}
                  disabled={!isJoined}
                >
                  <Text style={[styles.quickActionText, !isJoined && styles.quickActionTextDisabled]}>Crear encuesta</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Posts Filter */}
              <View style={styles.postsFilter}>
                <Text style={styles.filterText}>Más relevantes</Text>
              </View>

              {/* Posts List */}
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No hay publicaciones aún</Text>
                  <Text style={styles.emptyStateSubtext}>Sé el primero en compartir algo</Text>
                  {isJoined && (
                    <TouchableOpacity
                      style={styles.createPostButton}
                      onPress={() => navigation.navigate('CreateCommunityPost', { communityId: community?.id })}
                    >
                      <Text style={styles.createPostButtonText}>Crear publicación</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'userPosts' && (
            <View style={styles.postsContent}>
              {/* Posts Filter */}
              <View style={styles.postsFilter}>
                <Text style={styles.filterText}>Tus publicaciones</Text>
              </View>

              {/* User Posts List */}
              {(currentUser && posts.filter(post => post.user_id === currentUser.id).length > 0) ? (
                posts.filter(post => post.user_id === currentUser.id).map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No has publicado nada aún</Text>
                  <Text style={styles.emptyStateSubtext}>Publica algo por primera vez</Text>
                  <TouchableOpacity
                    style={styles.createPostButton}
                    onPress={() => navigation.navigate('CreateCommunityPost', { communityId: community?.id })}
                  >
                    <Text style={styles.createPostButtonText}>Crear publicación</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
  
          {activeTab === 'chats' && (
            <View style={styles.chatsContent}>
              <View style={styles.chatsHeader}>
                <Text style={styles.chatsTitle}>Mensajes</Text>
                <Text style={styles.chatsSubtitle}>{community.name}</Text>
                <Text style={styles.chatsActive}>{activeUsersCount} activos</Text>
                <Text style={styles.chatsMembersCount}>{community.members_count || 0} miembros</Text>
              </View>
  
              {channels.length > 0 ? (
                channels.map(channel => (
                  <TouchableOpacity
                    key={channel.id}
                    style={styles.channelItem}
                    onPress={() => handleChannelPress(channel)}
                  >
                    <View style={styles.channelIcon}>
                      <MessageCircle size={20} color="#2673f3" />
                    </View>
                    <View style={styles.channelInfo}>
                      <Text style={styles.channelName}>{channel.name}</Text>
                      <Text style={styles.channelDescription}>{channel.description}</Text>
                    </View>
                    <View style={styles.channelJoinBtn}>
                      <Text style={styles.channelJoinText}>Unirse</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No hay canales disponibles</Text>
                  <Text style={styles.emptyStateSubtext}>Los canales aparecerán aquí cuando se creen</Text>
                  
                </View>
              )}
            </View>
          )}
  
          {activeTab === 'multimedia' && (
            <View style={styles.multimediaContent}>
              {/* Multimedia Sub-tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.multimediaTabsScroll}
                contentContainerStyle={styles.multimediaTabsContainer}
              >
                <Pressable
                  style={[styles.multimediaTab, activeMultimediaTab === 'photos' && styles.activeMultimediaTab]}
                  onPress={() => setActiveMultimediaTab('photos')}
                >
                  <ImageIcon size={16} color={activeMultimediaTab === 'photos' ? '#2673f3' : '#666'} />
                  <Text style={[styles.multimediaTabText, activeMultimediaTab === 'photos' && styles.activeMultimediaTabText]}>Fotos</Text>
                </Pressable>
                <Pressable
                  style={[styles.multimediaTab, activeMultimediaTab === 'videos' && styles.activeMultimediaTab]}
                  onPress={() => setActiveMultimediaTab('videos')}
                >
                  <Video size={16} color={activeMultimediaTab === 'videos' ? '#2673f3' : '#666'} />
                  <Text style={[styles.multimediaTabText, activeMultimediaTab === 'videos' && styles.activeMultimediaTabText]}>Videos</Text>
                </Pressable>
                <Pressable
                  style={[styles.multimediaTab, activeMultimediaTab === 'files' && styles.activeMultimediaTab]}
                  onPress={() => setActiveMultimediaTab('files')}
                >
                  <FileText size={16} color={activeMultimediaTab === 'files' ? '#2673f3' : '#666'} />
                  <Text style={[styles.multimediaTabText, activeMultimediaTab === 'files' && styles.activeMultimediaTabText]}>Archivos</Text>
                </Pressable>
              </ScrollView>

              {/* Multimedia Content */}
              {activeMultimediaTab === 'photos' && (
                <View style={styles.photosContent}>
                  {photos.length > 0 ? (
                    <FlatList
                      data={photos}
                      numColumns={3}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.photoItem}>
                          <Image source={{ uri: item.image_url }} style={styles.photoImage} />
                        </TouchableOpacity>
                      )}
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No hay fotos disponibles</Text>
                      <Text style={styles.emptyStateSubtext}>Las fotos compartidas aparecerán aquí</Text>
                    </View>
                  )}
                </View>
              )}

              {activeMultimediaTab === 'videos' && (
                <View style={styles.videosContent}>
                  {videos.length > 0 ? (
                    <FlatList
                      data={videos}
                      numColumns={3}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.videoItem}>
                          <View style={styles.videoThumbnail}>
                            <Video size={24} color="#666" />
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No hay videos disponibles</Text>
                      <Text style={styles.emptyStateSubtext}>Los videos compartidos aparecerán aquí</Text>
                    </View>
                  )}
                </View>
              )}

              {activeMultimediaTab === 'files' && (
                <View style={styles.filesContent}>
                  {files.length > 0 ? (
                    files.map(file => (
                      <View key={file.id} style={styles.fileItem}>
                        <View style={styles.fileIcon}>
                          <FileText size={20} color="#2673f3" />
                        </View>
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName}>{file.name}</Text>
                          <Text style={styles.fileSize}>{file.size}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No hay archivos disponibles</Text>
                      <Text style={styles.emptyStateSubtext}>Los archivos compartidos aparecerán aquí</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
  

  
          {activeTab === 'search' && (
            <View style={styles.searchContent}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#999" />
                <TextInput
                  style={styles.searchInputField}
                  placeholder="Buscar inversores..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
  
              {users.length > 0 ? (
                users.map(user => {
                  const userName = user.full_name || user.nombre || 'Usuario'
                  const userAvatar = getAvatarForUser(user, userName)
  
                  return (
                    <View key={user.id} style={styles.userItem}>
                      <Image
                        source={{ uri: userAvatar }}
                        style={styles.userAvatar}
                      />
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userRole}>{user.role}</Text>
                        {user.bio && (
                          <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>
                        )}
                      </View>
                      <TouchableOpacity style={styles.connectButton}>
                        <Text style={styles.connectButtonText}>Conectar</Text>
                      </TouchableOpacity>
                    </View>
                  )
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Busca inversores</Text>
                  <Text style={styles.emptyStateSubtext}>Encuentra personas con intereses similares</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
  
        {/* Modal de opciones del header */}
        <Modal
          visible={showOptionsMenu}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View style={styles.optionsMenu}>
              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMenuOption('settings')}
                  >
                    <Settings size={20} color="#111" />
                    <Text style={styles.optionText}>Configuración de comunidad</Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMenuOption('edit')}
                  >
                    <Edit3 size={20} color="#111" />
                    <Text style={styles.optionText}>Editar comunidad</Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleMenuOption('members')}
                  >
                    <UserCog size={20} color="#111" />
                    <Text style={styles.optionText}>Gestionar miembros</Text>
                  </TouchableOpacity>
                </>
              )}
  
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleMenuOption('notifications')}
              >
                <MessageCircle size={20} color="#111" />
                <Text style={styles.optionText}>Notificaciones</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleMenuOption('report')}
              >
                <Flag size={20} color="#111" />
                <Text style={styles.optionText}>Reportar comunidad</Text>
              </TouchableOpacity>
  
              {isJoined && (
                <TouchableOpacity
                  style={[styles.optionItem, styles.dangerOption]}
                  onPress={() => handleMenuOption('leave')}
                >
                  <UserX size={20} color="#ef4444" />
                  <Text style={[styles.optionText, styles.dangerText]}>Salir de la comunidad</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: "#666",
      marginBottom: 20,
    },
    backBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: "#2673f3",
      borderRadius: 8,
    },
    backBtnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: "600",
      color: "#111",
      marginHorizontal: 12,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerActionBtn: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    communityHeader: {
      position: "relative",
      height: 250,
      backgroundColor: "#fff",
    },
    coverImage: {
      width: "100%",
      height: 200,
      backgroundColor: "#0f3a5f",
    },
    coverImageFallback: {
      backgroundColor: "#0f3a5f",
    },
    avatarContainer: {
      position: "absolute",
      bottom: 20,
      left: "50%",
      marginLeft: -60,
      backgroundColor: "#fff",
      borderRadius: 60,
      padding: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 5,
    },
    communityAvatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    communitySection: {
      backgroundColor: "#1B2A4A",
      padding: 20,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
    },
    communityDetails: {
      alignItems: "center",
    },
    communityInfo: {
      backgroundColor: "#fff",
      padding: 20,
      paddingTop: 40,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
    },
    communityName: {
      fontSize: 22,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 8,
      textAlign: "center",
      paddingTop: 12,
      letterSpacing: -0.5,
    },
    communityMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 20,
    },
    communityMetaText: {
      fontSize: 14,
      color: "#fff",
      fontWeight: "600",
    },
    communityTypeText: {
      paddingLeft: 14,
      fontSize: 14,
      color: "#fff",
      fontWeight: "600",
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      maxWidth: 300,
    },
    joinButton: {
      flex: 1,
      backgroundColor: "#1877F2",
      paddingVertical: 14,
      borderRadius: 24,
      alignItems: "center",
      shadowColor: "#1877F2",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    joinedButton: {
      backgroundColor: "#1877F2",
    },
    joinButtonText: {
      color: "#F5F5F5",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    joinedButtonText: {
      color: "#F5F5F5",
    },
    inviteButton: {
      flex: 1,
      backgroundColor: "#fff",
      paddingVertical: 14,
      borderRadius: 24,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#2673f3",
      shadowColor: "#2673f3",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
    },
    inviteButtonText: {
      color: "#2673f3",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    tabsScrollView: {
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
      maxHeight: 60,
    },
    tabsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      gap: 8,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginRight: 12,
      gap: 6,
    },
    activeTab: {
      borderBottomWidth: 3,
      borderBottomColor: "#2673f3",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#666",
    },
    activeTabText: {
      color: "#2673f3",
      fontWeight: "600",
    },
    postsContent: {
      backgroundColor: "#f5f5f5",
      padding: 16,
    },
    postCreationCompact: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: "#fff",
      borderRadius: 8,
    },
    fbComposer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    fbComposerInput: {
      flex: 1,
      marginLeft: 10,
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 14,
      justifyContent: 'center',
    },
    fbComposerPlaceholder: {
      color: '#6B7280',
      fontSize: 14,
    },
    userAvatarSmall: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    postInputCompact: {
      flex: 1,
      fontSize: 14,
      color: "#111",
      paddingVertical: 0,
    },
    postButton: {
      backgroundColor: "#2673f3",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    postButtonDisabled: {
      opacity: 0.5,
    },
    postButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    quickActionsScroll: {
      marginBottom: 12,
    },
    quickActionsContainer: {
      paddingHorizontal: 0,
    },
    quickAction: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: "#fff",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#e5e5e5",
      marginRight: 8,
    },
    quickActionDisabled: {
      opacity: 0.5,
    },
    quickActionText: {
      fontSize: 13,
      color: "#555",
    },
    quickActionTextDisabled: {
      color: "#999",
    },
    postsFilter: {
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    filterText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#111",
    },
    postCard: {
      backgroundColor: "#fff",
      marginBottom: 12,
      borderRadius: 8,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    postAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    postAuthorInfo: {
      flex: 1,
      marginLeft: 12,
    },
    postAuthorRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    postAuthorName: {
      fontSize: 15,
      fontWeight: "600",
      color: "#111",
    },
    postTime: {
      fontSize: 13,
      color: "#999",
    },
    postAuthorRole: {
      fontSize: 13,
      color: "#666",
      marginTop: 1,
    },
    postOptionsBtn: {
      padding: 4,
    },
    postContent: {
      fontSize: 14,
      color: "#111",
      lineHeight: 20,
      marginBottom: 8,
    },
    seeMore: {
      fontSize: 13,
      color: "#2673f3",
      fontWeight: "500",
      marginBottom: 8,
    },
    postImage: {
      width: "100%",
      height: 220,
      borderRadius: 6,
      marginVertical: 8,
    },
    postStats: {
      flexDirection: "row",
      gap: 12,
      marginVertical: 8,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
    },
    postStat: {
      fontSize: 13,
      color: "#666",
    },
    postActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 8,
      flexWrap: 'wrap',
      rowGap: 8,
    },
    postAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 6,
      minWidth: '23%',
      justifyContent: 'center',
    },
    postActionText: {
      fontSize: 13,
      color: "#666",
      fontWeight: "500",
    },
    chatsContent: {
      backgroundColor: "#f5f5f5",
      padding: 16,
    },
    chatsHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    chatsTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#111",
      marginBottom: 4,
    },
    chatsSubtitle: {
      fontSize: 15,
      color: "#666",
      marginBottom: 6,
    },
    chatsActive: {
      fontSize: 13,
      color: "#2673f3",
      fontWeight: "500",
      marginBottom: 2,
    },
    chatsMembersCount: {
      fontSize: 13,
      color: '#999',
    },
    channelItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: "#fff",
      marginBottom: 8,
      borderRadius: 8,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    channelIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#f0f7ff",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    channelInfo: {
      flex: 1,
    },
    channelName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#111",
      marginBottom: 4,
    },
    channelDescription: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
    channelMeta: {
      fontSize: 12,
      color: '#999',
      marginTop: 4,
    },
    channelJoinBtn: {
      backgroundColor: '#2673f3',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    channelJoinText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    photosContent: {
      backgroundColor: "#fff",
      padding: 4,
    },
    photoItem: {
      flex: 1/3,
      aspectRatio: 1,
      padding: 2,
    },
    photoImage: {
      width: "100%",
      height: "100%",
      borderRadius: 4,
    },
    filesContent: {
      backgroundColor: "#fff",
      padding: 16,
    },
    fileItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
    },
    fileIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: "#f5f5f5",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontSize: 16,
      fontWeight: "500",
      color: "#111",
      marginBottom: 4,
    },
    fileSize: {
      fontSize: 14,
      color: "#666",
    },
    searchContent: {
      backgroundColor: "#fff",
      padding: 16,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 20,
    },
    searchInputField: {
      flex: 1,
      fontSize: 16,
      color: "#111",
      marginLeft: 8,
    },
    userItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
    },
    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#111",
      marginBottom: 4,
    },
    userRole: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
    userBio: {
      fontSize: 13,
      color: "#999",
    },
    connectButton: {
      backgroundColor: "#2673f3",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    connectButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#666",
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: "#999",
    },
    createPostButton: {
      backgroundColor: "#2673f3",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    createPostButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    optionsMenu: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 12,
    },
    optionText: {
      fontSize: 16,
      color: "#111",
      fontWeight: "500",
    },
    dangerOption: {
      borderTopWidth: 1,
      borderTopColor: "#e5e5e5",
      marginTop: 8,
    },
    dangerText: {
      color: "#ef4444",
    },
    multimediaContent: {
      backgroundColor: "#f5f5f5",
      padding: 16,
    },
    multimediaTabsScroll: {
      marginBottom: 16,
    },
    multimediaTabsContainer: {
      paddingHorizontal: 0,
    },
    multimediaTab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 12,
      gap: 6,
      backgroundColor: "#fff",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#e5e5e5",
    },
    activeMultimediaTab: {
      backgroundColor: "#2673f3",
      borderColor: "#2673f3",
    },
    multimediaTabText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#666",
    },
    activeMultimediaTabText: {
      color: "#fff",
      fontWeight: "600",
    },
    videosContent: {
      backgroundColor: "#fff",
      padding: 4,
    },
    videoItem: {
      flex: 1/3,
      aspectRatio: 1,
      padding: 2,
    },
    videoThumbnail: {
      width: "100%",
      height: "100%",
      borderRadius: 4,
      backgroundColor: "#f5f5f5",
      alignItems: "center",
      justifyContent: "center",
    },
    videoPlayer: {
      width: '100%',
      marginBottom: 12,
    },
    likeIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
    },
  })
  
  export default CommunityDetailScreen