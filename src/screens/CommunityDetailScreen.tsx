import React, { useState, useEffect, useCallback } from "react"  
import { useRoute, useNavigation } from "@react-navigation/native"  
import { useSafeAreaInsets } from 'react-native-safe-area-context'  
import {  
  ArrowLeft, Users, MessageCircle, Image as ImageIcon,   
  FileText, Search, MoreHorizontal, ThumbsUp,   
  Share2, Send, User, MessageSquare  
} from "lucide-react-native"  
import {  
  View, Text, TouchableOpacity, StyleSheet, ScrollView,   
  Image, ActivityIndicator, RefreshControl, TextInput,  
  StatusBar, Alert, FlatList, Share  
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
  commentPost,
  isUserMemberOfCommunity
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
  content: string  
  author: {  
    id: string  
    name: string  
    avatar: string  
    role: string  
  }  
  created_at: string  
  image?: string  
  likes: number  
  comments: number  
  shares: number  
}  
  
interface Channel {  
  id: string  
  name: string  
  description: string  
  type: string  
}  
  
interface CommunityUser {  
  id: string  
  name: string  
  avatar: string  
  role: string  
  bio?: string  
}  
  
export function CommunityDetailScreen() {  
  const { t } = useTranslation()  
  const navigation = useNavigation()  
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
  const [activeTab, setActiveTab] = useState<'posts' | 'chats' | 'photos' | 'files' | 'search'>('posts')  
  const [postContent, setPostContent] = useState('')  
  const [searchQuery, setSearchQuery] = useState('')  
  const [currentUser, setCurrentUser] = useState<any>(null)  
    
  useAuthGuard()  
  
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
        setPosts(communityPosts || [])  
        setChannels(communityChannels || [])  
        setCurrentUser(user)  
          
        // ✅ Verificar membresía REAL  
        if (user) {  
          const isMember = await isUserMemberOfCommunity(user.id, communityId)
          setIsJoined(isMember)  
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
  
  // Cargar datos específicos por tab  
  const loadTabData = useCallback(async (tab: string) => {  
    if (!community) return  
      
    try {  
      switch (tab) {  
        case 'search':  
          if (searchQuery.trim()) {  
            const searchResults = await searchUsers(searchQuery)  
            setUsers(searchResults || [])  
          }  
          break  
        case 'photos':  
          // Implementar getCommunityPhotos cuando esté disponible  
          setPhotos([])  
          break  
        case 'files':  
          // Implementar getCommunityFiles cuando esté disponible  
          setFiles([])  
          break  
      }  
    } catch (error) {  
      console.error(`Error loading ${tab} data:`, error)  
    }  
  }, [community, searchQuery])  
  
  useEffect(() => {  
    loadCommunityData()  
  }, [loadCommunityData])  
  
  useEffect(() => {  
    loadTabData(activeTab)  
  }, [activeTab, loadTabData])  
  
  // --- Actions ---  
  const handleJoinCommunity = async () => {  
    try {  
      if (currentUser && community) {  
        const result = await joinCommunity(currentUser.id, community.id)  
        if (result === null) {
          // Ya estaba unido
          Alert.alert('Info', 'Ya eres miembro de esta comunidad')
          setIsJoined(true)
        } else {
          setIsJoined(true)  
          Alert.alert('Éxito', '¡Te has unido a la comunidad!')
          // Recargar para actualizar contador de miembros
          loadCommunityData()  
        }
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
      loadCommunityData() // Recargar posts  
      Alert.alert('Éxito', '¡Publicación creada!')
    } catch (error) {  
      console.error('Error creating post:', error)  
      Alert.alert('Error', 'No se pudo crear la publicación')  
    }  
  }

  // ✅ Quick Actions (igual que HomeFeedScreen)
  const handleQuickAction = (actionType: string) => {
    if (!isJoined) {
      Alert.alert('Atención', 'Debes unirte a la comunidad para realizar esta acción')
      return
    }
    ;(navigation as any).navigate('CreatePost', { 
      type: actionType,
      communityId: community?.id 
    })
  }

  // ✅ Invitar a la comunidad
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
  
  const onRefresh = useCallback(() => {  
    setRefreshing(true)  
    loadCommunityData()  
  }, [loadCommunityData])  
  
  const getTimeAgo = (dateString: string) => {  
    const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60))  
    return `${hours} h`  
  }  
  
  // --- Loading/Error States ---  
  if (loading && !community) {  
    return (  
      <View style={[styles.container, { paddingTop: insets.top }]}>  
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent />  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#2673f3" />  
        </View>  
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
        
      {/* Header CORREGIDO con Search */}  
      <View style={styles.header}>  
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>{community.name}</Text>  
        <View style={styles.headerActions}>  
          <TouchableOpacity style={styles.headerActionBtn}>  
            <Search size={24} color="#111" />  
          </TouchableOpacity>  
          <TouchableOpacity style={styles.headerActionBtn}>  
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
          {/* Imagen de fondo o color azul Investi */}
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
              source={{ uri: community.image_url || 'https://via.placeholder.com/100x100/2673f3/ffffff?text=C' }}  
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
  
        {/* Tabs CORREGIDOS - Desplazables horizontalmente */}  
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
            <User size={16} color={activeTab === 'search' ? '#2673f3' : '#666'} />  
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Buscar inversores</Text>  
          </TouchableOpacity>  
        </ScrollView>  
  
        {/* Content based on active tab */}  
        {activeTab === 'posts' && (  
          <View style={styles.postsContent}>  
            {/* Post Creation CORREGIDO - Compacto */}  
            <View style={styles.postCreationCompact}>  
              <Image   
                source={{ uri: currentUser?.avatar || 'https://i.pravatar.cc/100' }}  
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
  
            {/* Acciones rápidas - Igual que HomeFeedScreen */}  
            <View style={styles.quickActions}>  
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
            </View>  
  
            {/* Posts Filter */}  
            <View style={styles.postsFilter}>  
              <Text style={styles.filterText}>Más relevantes</Text>  
            </View>  
  
            {/* Posts List - 100% Backend */}  
            {posts.length > 0 ? (  
              posts.map(post => (  
                <PostCard key={post.id} post={post} getTimeAgo={getTimeAgo} />  
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
              <Text style={styles.chatsMembersCount}>{community.members_count || 0} miembros</Text>  
            </View>  
              
            {/* Channels - 100% Backend */}  
            {channels.length > 0 ? (  
              channels.map(channel => (  
                <TouchableOpacity 
                  key={channel.id} 
                  style={styles.channelItem}
                  onPress={() => {
                    if (!isJoined) {
                      Alert.alert('Atención', 'Debes unirte a la comunidad para acceder a los chats')
                      return
                    }
                    ;(navigation as any).navigate('GroupChat', {
                      channelId: channel.id,
                      communityId: community?.id,
                      channelName: channel.name
                    })
                  }}
                >  
                  <View style={styles.channelIcon}>  
                    <MessageSquare size={20} color="#2673f3" />
                  </View>  
                  <View style={styles.channelInfo}>  
                    <Text style={styles.channelName}>{channel.name}</Text>  
                    <Text style={styles.channelDescription}>{channel.description}</Text>  
                  </View>
                  <View style={styles.channelBadge}>
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>•</Text>
                    </View>
                  </View>
                </TouchableOpacity>  
              ))  
            ) : (  
              <View style={styles.emptyState}>  
                <Text style={styles.emptyStateText}>No hay canales disponibles</Text>  
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
              users.map(user => (  
                <TouchableOpacity key={user.id} style={styles.userItem}>  
                  <Image source={{ uri: user.avatar }} style={styles.userAvatar} />  
                  <View style={styles.userInfo}>  
                    <Text style={styles.userName}>{user.name}</Text>  
                    <Text style={styles.userRole}>{user.role}</Text>  
                    {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}  
                  </View>  
                  <TouchableOpacity style={styles.connectButton}>  
                    <Text style={styles.connectButtonText}>Conectar</Text>  
                  </TouchableOpacity>  
                </TouchableOpacity>  
              ))  
            ) : searchQuery.trim() ? (  
              <View style={styles.emptyState}>  
                <Text style={styles.emptyStateText}>No se encontraron usuarios</Text>  
                <Text style={styles.emptyStateSubtext}>Intenta con otros términos de búsqueda</Text>  
              </View>  
            ) : (  
              <View style={styles.emptyState}>  
                <Text style={styles.emptyStateText}>Busca inversores</Text>  
                <Text style={styles.emptyStateSubtext}>Encuentra personas con intereses similares</Text>  
              </View>  
            )}  
          </View>  
        )}  
      </ScrollView>  
    </View>  
  )  
}  
  
// --- Post Card Component ---  
const PostCard: React.FC<{ post: Post; getTimeAgo: (date: string) => string }> = ({ post, getTimeAgo }) => (  
  <View style={styles.postCard}>  
    <View style={styles.postHeader}>  
      <Image source={{ uri: post.author.avatar }} style={styles.postAvatar} />  
      <View style={styles.postAuthorInfo}>  
        <Text style={styles.postAuthor}>{post.author.name}</Text>  
        <Text style={styles.postRole}>{post.author.role}</Text>  
        <Text style={styles.postTime}>{getTimeAgo(post.created_at)}</Text>  
      </View>  
      <Text style={styles.followText}>+ Seguir</Text>  
    </View>  
      
    <Text style={styles.postContent} numberOfLines={3}>  
      {post.content}  
      {post.content && post.content.length > 150 && (  
        <Text style={styles.seeMore}>...Ver más</Text>  
      )}  
    </Text>  
      
    {post.image && (  
      <Image source={{ uri: post.image }} style={styles.postImage} />  
    )}  
  
    <View style={styles.postMetrics}>  
      <Text style={styles.metricText}>👍 {post.likes}</Text>  
      <Text style={styles.metricText}>💬 {post.comments} comentarios</Text>  
      <Text style={styles.metricText}>↗ {post.shares} compartidos</Text>  
    </View>  
      
    <View style={styles.postActions}>  
      <TouchableOpacity style={styles.actionButton}>  
        <ThumbsUp size={18} color="#666" />  
        <Text style={styles.actionText}>Me gusta</Text>  
      </TouchableOpacity>  
      <TouchableOpacity style={styles.actionButton}>  
        <MessageCircle size={18} color="#666" />  
        <Text style={styles.actionText}>Comentar</Text>  
      </TouchableOpacity>  
      <TouchableOpacity style={styles.actionButton}>  
        <Share2 size={18} color="#666" />  
        <Text style={styles.actionText}>Compartir</Text>  
      </TouchableOpacity>  
      <TouchableOpacity style={styles.actionButton}>  
        <Send size={18} color="#666" />  
        <Text style={styles.actionText}>Enviar</Text>  
      </TouchableOpacity>  
    </View>  
  </View>  
)  
  
// --- Estilos Completos ---  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "#f7f8fa",  
  },  
  loadingContainer: {  
    flex: 1,  
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
    fontSize: 16,  
    color: "#666",  
    marginBottom: 20,  
  },  
  backBtn: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 12,  
    paddingHorizontal: 24,  
    borderRadius: 8,  
  },  
  backBtnText: {  
    color: "#fff",  
    fontWeight: "600",  
  },  
    
  // Header CORREGIDO con Search y More  
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
    fontSize: 18,  
    fontWeight: "600",  
    color: "#111",  
    flex: 1,  
    textAlign: "center",  
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
  // Community Header con portada
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
  communityImage: {  
    width: 80,  
    height: 80,  
    borderRadius: 40,  
    marginBottom: 12,  
  },  
  communityName: {  
    fontSize: 20,  
    fontWeight: "700",  
    color: "#111",  
    marginBottom: 8,  
  },  
  communityMeta: {  
    flexDirection: "row",  
    alignItems: "center",  
    marginBottom: 20,  
  },  
  communityMetaText: {  
    fontSize: 14,  
    color: "#666",  
    marginLeft: 6,  
  },  
  actionButtons: {  
    flexDirection: "row",  
    gap: 12,  
  },  
  joinButton: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 10,  
    paddingHorizontal: 24,  
    borderRadius: 20,  
  },  
  joinedButton: {  
    backgroundColor: "#e5e5e5",  
  },  
  joinButtonText: {  
    color: "#fff",  
    fontWeight: "600",  
    fontSize: 14,  
  },  
  joinedButtonText: {  
    color: "#666",  
  },  
  inviteButton: {  
    backgroundColor: "#f0f7ff",  
    paddingVertical: 10,  
    paddingHorizontal: 24,  
    borderRadius: 20,  
    borderWidth: 1,  
    borderColor: "#2673f3",  
  },  
  inviteButtonText: {  
    color: "#2673f3",  
    fontWeight: "600",  
    fontSize: 14,  
  },  
    
  // Tabs CORREGIDOS - Desplazables horizontalmente  
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
    
  // Posts Content CORREGIDO  
  postsContent: {  
    backgroundColor: "#fff",  
    padding: 16,  
  },  
    
  // Post Creation COMPACTO  
  postCreationCompact: {  
    flexDirection: "row",  
    alignItems: "center",  
    backgroundColor: "#f8f9fa",  
    borderRadius: 25,  
    paddingHorizontal: 16,  
    paddingVertical: 12,  
    marginBottom: 16,  
    gap: 12,  
  },  
  userAvatarSmall: {  
    width: 32,  
    height: 32,  
    borderRadius: 16,  
  },  
  postInputCompact: {  
    flex: 1,  
    fontSize: 16,  
    color: "#111",  
    padding: 0,  
  },  
  postButton: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 6,  
    paddingHorizontal: 12,  
    borderRadius: 15,  
  },  
  postButtonText: {  
    color: "#fff",  
    fontWeight: "600",  
    fontSize: 12,  
  },  
    
  // Acciones rápidas  
  quickActions: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    marginBottom: 16,  
    paddingVertical: 8,  
  },  
  quickAction: {  
    alignItems: "center",  
    paddingVertical: 8,  
    paddingHorizontal: 12,  
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
    
  // Post Card  
  postCard: {  
    backgroundColor: "#fff",  
    borderRadius: 12,  
    padding: 16,  
    marginBottom: 12,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.08,  
    shadowRadius: 4,  
    elevation: 2,  
  },  
  postHeader: {  
    flexDirection: "row",  
    alignItems: "center",  
    marginBottom: 12,  
  },  
  postAvatar: {  
    width: 48,  
    height: 48,  
    borderRadius: 24,  
    marginRight: 12,  
  },  
  postAuthorInfo: {  
    flex: 1,  
  },  
  postAuthor: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#111",  
  },  
  postRole: {  
    fontSize: 12,  
    color: "#666",  
  },  
  postTime: {  
    fontSize: 12,  
    color: "#999",  
  },  
  followText: {  
    color: "#2673f3",  
    fontWeight: "600",  
    fontSize: 13,  
  },  
  postContent: {  
    fontSize: 14,  
    color: "#111",  
    lineHeight: 20,  
    marginBottom: 12,  
  },  
  seeMore: {  
    color: "#2673f3",  
    fontWeight: "500",  
  },  
  postImage: {  
    width: "100%",  
    height: 200,  
    borderRadius: 8,  
    marginBottom: 12,  
    backgroundColor: "#f0f0f0",  
  },  
  postMetrics: {  
    flexDirection: "row",  
    justifyContent: "space-between",  
    marginBottom: 12,  
    paddingHorizontal: 4,  
  },  
  metricText: {  
    fontSize: 12,  
    color: "#666",  
  },  
  postActions: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    borderTopWidth: 1,  
    borderTopColor: "#f0f0f0",  
    paddingTop: 12,  
  },  
  actionButton: {  
    flexDirection: "row",  
    alignItems: "center",  
    gap: 6,  
  },  
  actionText: {  
    fontSize: 13,  
    fontWeight: "500",  
    color: "#666",  
  },  
    
  // Chats Content  
  chatsContent: {  
    backgroundColor: "#fff",  
    padding: 16,  
  },  
  chatsHeader: {  
    marginBottom: 20,  
  },  
  chatsTitle: {  
    fontSize: 18,  
    fontWeight: "700",  
    color: "#111",  
    marginBottom: 4,  
  },  
  chatsSubtitle: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111",  
    marginBottom: 4,  
  },  
  chatsActive: {  
    fontSize: 14,  
    color: "#666",  
    marginBottom: 4,  
  },  
  chatsMembersCount: {  
    fontSize: 14,  
    color: "#666",  
  },  
  channelItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  channelIcon: {  
    width: 32,  
    height: 32,  
    borderRadius: 6,  
    backgroundColor: "#f0f0f0",  
    alignItems: "center",  
    justifyContent: "center",  
    marginRight: 12,  
  },  
  channelIconText: {  
    fontSize: 10,  
    fontWeight: "600",  
    color: "#666",  
  },  
  channelInfo: {  
    flex: 1,  
  },  
  channelName: {  
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,  
  },  
  channelDescription: {  
    fontSize: 13,  
    color: "#666",  
  },
  channelBadge: {
    marginLeft: 8,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2673f3",
  },
  unreadBadgeText: {
    fontSize: 0,
  },
    
  // Photos Content  
  photosContent: {  
    backgroundColor: "#fff",  
    padding: 16,  
  },
  photoItem: {
    flex: 1,  
    margin: 2,  
    aspectRatio: 1,  
  },  
  photoImage: {  
    width: "100%",  
    height: "100%",  
    borderRadius: 8,  
  },  
    
  // Files Content  
  filesContent: {  
    backgroundColor: "#fff",  
    padding: 16,  
  },  
  fileItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  fileIcon: {  
    width: 40,  
    height: 40,  
    borderRadius: 8,  
    backgroundColor: "#f0f0f0",  
    alignItems: "center",  
    justifyContent: "center",  
    marginRight: 12,  
  },  
  fileInfo: {  
    flex: 1,  
  },  
  fileName: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#111",  
    marginBottom: 2,  
  },  
  fileSize: {  
    fontSize: 13,  
    color: "#666",  
  },  
    
  // Search Content  
  searchContent: {  
    backgroundColor: "#fff",  
    padding: 16,  
  },  
  searchInputContainer: {  
    flexDirection: "row",  
    alignItems: "center",  
    backgroundColor: "#f8f9fa",  
    borderRadius: 20,  
    paddingHorizontal: 16,  
    paddingVertical: 10,  
    marginBottom: 16,  
  },  
  searchInputField: {  
    flex: 1,  
    marginLeft: 8,  
    fontSize: 16,  
    color: "#111",  
  },  
  userItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  userAvatar: {  
    width: 48,  
    height: 48,  
    borderRadius: 24,  
    marginRight: 12,  
  },  
  userInfo: {  
    flex: 1,  
  },  
  userName: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#111",  
    marginBottom: 2,  
  },  
  userRole: {  
    fontSize: 13,  
    color: "#666",  
    marginBottom: 2,  
  },  
  userBio: {  
    fontSize: 12,  
    color: "#999",  
  },  
  connectButton: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 6,  
    paddingHorizontal: 16,  
    borderRadius: 15,  
  },  
  connectButtonText: {  
    color: "#fff",  
    fontWeight: "600",  
    fontSize: 12,  
  },  
    
  // Empty State  
  emptyState: {  
    alignItems: "center",  
    paddingVertical: 40,  
  },  
  emptyStateText: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#666",  
    marginBottom: 8,  
  },  
  emptyStateSubtext: {  
    fontSize: 14,  
    color: "#999",  
    textAlign: "center",  
  },  
})