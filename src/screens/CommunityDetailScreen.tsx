import React, { useState, useEffect, useCallback } from "react"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ArrowLeft, Users, MessageCircle, Image as ImageIcon,
  FileText, Search, MoreHorizontal, ThumbsUp,
  Share2, Send, Bookmark, Flag, UserX, Settings, UserCog, Edit3
} from "lucide-react-native"
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, RefreshControl, TextInput,
  StatusBar, Alert, FlatList, Share, Modal, Pressable
} from "react-native"
import { useTranslation } from "react-i18next"
import { useAuthGuard } from "../hooks/useAuthGuard"
import {
  getCommunityDetails,
  joinCommunity,
  getCurrentUser,
  getCommunityChannels,
  getCommunityPosts,
  createPost,
  searchUsers,
  likePost,
  isUserMemberOfCommunity,
  getUserCommunityRole
} from "../rest/api"

// --- Interfaces ---
interface CommunityDetail {
  id: string
  name: string
  description: string
  image_url: string
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
  const { t } = useTranslation()
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
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'chats' | 'photos' | 'files' | 'search'>('posts')
  const [postContent, setPostContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showPostOptions, setShowPostOptions] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useAuthGuard()

  // ✅ Avatar predeterminado
  const getDefaultAvatar = (name: string) => {
    const initial = name?.charAt(0)?.toUpperCase() || 'U'
    return `https://ui-avatars.com/api/?name=${initial}&background=2673f3&color=fff&size=200`
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
        setCommunity(communityData)
        
        // ✅ Transformar posts del backend
        const transformedPosts = (communityPosts || []).map((post: any) => ({
          id: post.id,
          contenido: post.contenido,
          user_id: post.user_id,
          community_id: post.community_id,
          image_url: post.image_url,
          likes_count: post.likes_count || 0,
          comment_count: post.comment_count || 0,
          shares_count: post.shares_count || 0,
          created_at: post.created_at,
          users: post.users
        }))
        
        setPosts(transformedPosts)
        setChannels(communityChannels || [])
        setCurrentUser(user)

        // ✅ Verificar membresía REAL y rol
        if (user) {
          const isMember = await isUserMemberOfCommunity(user.id, communityId)
          setIsJoined(isMember)
          
          if (isMember) {
            const role = await getUserCommunityRole(user.id, communityId)
            setUserRole(role)
            console.log('🔐 User role:', role)
          }
        }
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        loadTabData(activeTab)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, activeTab])

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
      await createPost({
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
    navigation.navigate('CreatePost', { 
      type: actionType,
      communityId: community?.id 
    })
  }

  const handleInvite = async () => {
    if (!community) return
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
    }
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
      } else {
        setLikedPosts(prev => new Set(prev).add(postId))
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
            : post
        ))
        await likePost(postId, currentUser.id)
      }
    } catch (err) {
      console.error("Error liking post:", err)
    }
  }

  const handleComment = (postId: string) => {
    navigation.navigate('PostDetail', { postId })
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

  const handleChannelPress = (channel: Channel) => {
    navigation.navigate('GroupChat', { 
      channelId: channel.id,
      channelName: channel.name,
      communityId: community?.id
    })
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

  // --- PostCard Component ---
  const PostCard = ({ post }: { post: Post }) => {
    const author = post.users
    const authorName = author?.full_name || author?.nombre || 'Usuario'
    const authorAvatar = author?.avatar_url || author?.photo_url || getDefaultAvatar(authorName)
    const authorRole = author?.role || 'Usuario'

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: authorAvatar }} 
            style={styles.postAvatar} 
          />
          <View style={styles.postAuthorInfo}>
            <View style={styles.postAuthorRow}>
              <Text style={styles.postAuthorName}>{authorName}</Text>
              <Text style={styles.postTime}> • {getTimeAgo(post.created_at)}</Text>
            </View>
            <Text style={styles.postAuthorRole}>{authorRole}</Text>
          </View>
          <TouchableOpacity
            style={styles.postOptionsBtn}
            onPress={() => setShowPostOptions(post.id)}
          >
            <MoreHorizontal size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>
          {post.contenido}
        </Text>
        {post.contenido?.length > 150 && (
          <TouchableOpacity onPress={() => handleComment(post.id)}>
            <Text style={styles.seeMore}>...Ver más</Text>
          </TouchableOpacity>
        )}

        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        )}

        <View style={styles.postStats}>
          <Text style={styles.postStat}>👍 {post.likes_count}</Text>
          <Text style={styles.postStat}>{post.comment_count} comentarios</Text>
          <Text style={styles.postStat}>{post.shares_count || 0} compartidos</Text>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleLike(post.id)}
          >
            <ThumbsUp
              size={20}
              color={likedPosts.has(post.id) ? "#2673f3" : "#666"}
              fill={likedPosts.has(post.id) ? "#2673f3" : "none"}
            />
            <Text style={[
              styles.postActionText,
              likedPosts.has(post.id) && { color: "#2673f3" }
            ]}>Me gusta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleComment(post.id)}
          >
            <MessageCircle size={20} color="#666" />
            <Text style={styles.postActionText}>Comentar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleSharePost(post)}
          >
            <Share2 size={20} color="#666" />
            <Text style={styles.postActionText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleSendMessage(post.user_id)}
          >
            <Send size={20} color="#666" />
            <Text style={styles.postActionText}>Enviar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de opciones del post */}
        <Modal
          visible={showPostOptions === post.id}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPostOptions(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPostOptions(null)}
          >
            <View style={styles.optionsMenu}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handlePostOption(post.id, 'save')}
              >
                <Bookmark size={20} color="#111" />
                <Text style={styles.optionText}>Guardar publicación</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handlePostOption(post.id, 'report')}
              >
                <Flag size={20} color="#111" />
                <Text style={styles.optionText}>Reportar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handlePostOption(post.id, 'hide')}
              >
                <UserX size={20} color="#111" />
                <Text style={styles.optionText}>Ocultar publicación</Text>
              </TouchableOpacity>
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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent />

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
            <Search size={24} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setShowOptionsMenu(true)}
          >
            <MoreHorizontal size={24} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2673f3']}
            tintColor="#2673f3"
          />
        }
      >
        {/* Community Header con imagen de portada */}
        <View style={styles.communityHeader}>
          {community.cover_image_url ? (
            <Image
              source={{ uri: community.cover_image_url }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, styles.coverImageFallback]} />
          )}

          {/* Avatar circular encima */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: community.image_url || getDefaultAvatar(community.name) }}
              style={styles.communityAvatar}
            />
          </View>
        </View>

        {/* Community Info */}
        <View style={styles.communityInfo}>
          <Text style={styles.communityName}>{community.name}</Text>
          <View style={styles.communityMeta}>
            <Users size={16} color="#666" />
            <Text style={styles.communityMetaText}>
              {community.members_count || 0}k miembros · Comunidad pública
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.joinButton, isJoined && styles.joinedButton]}
              onPress={handleJoinCommunity}
              disabled={isJoined}
            >
              <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
                {isJoined ? 'Unido' : 'Unirse'}
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

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Tú</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
            onPress={() => setActiveTab('chats')}
          >
            <MessageCircle size={16} color={activeTab === 'chats' ? '#2673f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
            onPress={() => setActiveTab('photos')}
          >
            <ImageIcon size={16} color={activeTab === 'photos' ? '#2673f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Fotos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'files' && styles.activeTab]}
            onPress={() => setActiveTab('files')}
          >
            <FileText size={16} color={activeTab === 'files' ? '#2673f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'files' && styles.activeTabText]}>Archivos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Search size={16} color={activeTab === 'search' ? '#2673f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Buscar inversores</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content based on active tab */}
        {activeTab === 'posts' && (
          <View style={styles.postsContent}>
            {/* Post Creation */}
            <View style={styles.postCreationCompact}>
              <Image
                source={{ uri: currentUser?.avatar_url || currentUser?.photo_url || getDefaultAvatar(currentUser?.nombre || 'Usuario') }}
                style={styles.userAvatarSmall}
              />
              <TextInput
                style={styles.postInputCompact}
                placeholder={isJoined ? "Escribe algo..." : "Únete para publicar..."}
                placeholderTextColor="#999"
                value={postContent}
                onChangeText={setPostContent}
                multiline
                editable={isJoined}
              />
              {postContent.trim() && (
                <TouchableOpacity onPress={handleCreatePost} style={styles.postButton}>
                  <Text style={styles.postButtonText}>Publicar</Text>
                </TouchableOpacity>
              )}
            </View>

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
                <Text style={[styles.quickActionText, !isJoined && styles.quickActionTextDisabled]}>
                  🎉 Celebrar un momento
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, !isJoined && styles.quickActionDisabled]}
                onPress={() => handleQuickAction('poll')}
                disabled={!isJoined}
              >
                <Text style={[styles.quickActionText, !isJoined && styles.quickActionTextDisabled]}>
                  📊 Crear una encuesta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, !isJoined && styles.quickActionDisabled]}
                onPress={() => handleQuickAction('partner')}
                disabled={!isJoined}
              >
                <Text style={[styles.quickActionText, !isJoined && styles.quickActionTextDisabled]}>
                  🤝 Buscar un socio
                </Text>
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
              </View>
            )}
          </View>
        )}

        {activeTab === 'chats' && (
          <View style={styles.chatsContent}>
            <View style={styles.chatsHeader}>
              <Text style={styles.chatsTitle}>Mensajes</Text>
              <Text style={styles.chatsSubtitle}>{community.name}</Text>
              <Text style={styles.chatsActive}>1,098 activos</Text>
              <Text style={styles.chatsMembersCount}>{community.members_count || 0}k miembros</Text>
            </View>

            {channels.length > 0 ? (
              channels.map(channel => (
                <TouchableOpacity 
                  key={channel.id} 
                  style={styles.channelItem}
                  onPress={() => handleChannelPress(channel)}
                >
                  <View style={styles.channelIcon}>
                    <MessageCircle size={20} color="#666" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{channel.name}</Text>
                    <Text style={styles.channelDescription}>{channel.description}</Text>
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

        {activeTab === 'photos' && (
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

        {activeTab === 'files' && (
          <View style={styles.filesContent}>
            {files.length > 0 ? (
              files.map(file => (
                <TouchableOpacity key={file.id} style={styles.fileItem}>
                  <View style={styles.fileIcon}>
                    <FileText size={24} color="#666" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.file_name}</Text>
                    <Text style={styles.fileSize}>{file.file_size} KB</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay archivos disponibles</Text>
                <Text style={styles.emptyStateSubtext}>Los documentos compartidos aparecerán aquí</Text>
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
                const userAvatar = user.avatar_url || user.photo_url || getDefaultAvatar(userName)
                
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
    fontSize: 18,
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
    height: 200,
    backgroundColor: "#fff",
  },
  coverImage: {
    width: "100%",
    height: 150,
  },
  coverImageFallback: {
    backgroundColor: "#2673f3",
  },
  avatarContainer: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -50,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  communityInfo: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  communityName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  communityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  communityMetaText: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 400,
  },
  joinButton: {
    flex: 1,
    backgroundColor: "#2673f3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  joinedButton: {
    backgroundColor: "#e5e5e5",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  joinedButtonText: {
    color: "#666",
  },
  inviteButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2673f3",
  },
  inviteButtonText: {
    color: "#2673f3",
    fontSize: 16,
    fontWeight: "600",
  },
  tabsScrollView: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
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
    backgroundColor: "#fff",
    padding: 16,
  },
  postCreationCompact: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  userAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postInputCompact: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    minHeight: 40,
  },
  postButton: {
    backgroundColor: "#2673f3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsScroll: {
    marginBottom: 16,
  },
  quickActionsContainer: {
    paddingRight: 16,
  },
  quickAction: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  quickActionTextDisabled: {
    color: "#999",
  },
  postsFilter: {
    marginBottom: 16,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  postCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  postTime: {
    fontSize: 14,
    color: "#999",
  },
  postAuthorRole: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  postOptionsBtn: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    color: "#111",
    lineHeight: 22,
    marginBottom: 8,
  },
  seeMore: {
    fontSize: 14,
    color: "#2673f3",
    fontWeight: "500",
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  postStat: {
    fontSize: 14,
    color: "#666",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  postActionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  chatsContent: {
    backgroundColor: "#fff",
    padding: 16,
  },
  chatsHeader: {
    marginBottom: 20,
  },
  chatsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  chatsSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  chatsActive: {
    fontSize: 14,
    color: "#2673f3",
    fontWeight: "500",
  },
  chatsMembersCount: {
    fontSize: 14,
    color: "#999",
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
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
})