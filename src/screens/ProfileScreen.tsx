import React, { useState, useEffect } from "react"  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  StyleSheet,  
  SafeAreaView,  
  ScrollView,  
  Image,  
  ActivityIndicator,  
  Alert,  
  RefreshControl,
  Dimensions,
  Modal,
} from "react-native"  
import { 
  ArrowLeft, 
  Settings, 
  Edit2, 
  Plus, 
  Check, 
  MessageSquare, 
  MoreHorizontal,
  Users as UsersIcon,
  Share2,
  X,
  ThumbsUp,
  MessageCircle,
  Send,
} from "lucide-react-native"  
import { getUserComplete, followUser, unfollowUser, getCurrentUserId, getSuggestedPeople, connectWithUser, dismissPersonSuggestion } from "../api"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type TabType = 'posts' | 'communities';  

interface SuggestedPerson {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  commonInterest: string;
}
  
interface Community {  
  id: string;  
  name: string;  
  imageUrl?: string;  
  memberCount: number;  
  isMember: boolean;  
}  
  
interface ProfileUser {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isVerified?: boolean;
  stats?: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  username?: string;
  role?: string;
  learningTag?: string;
}
  
interface ProfileScreenProps {  
  navigation: any;  
  route?: {  
    params?: {  
      userId?: string;  
    };  
  };  
}

const getInitials = (name: string) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
};
  
export function ProfileScreen({ navigation, route }: ProfileScreenProps) {  
  const { top } = useSafeAreaInsets()  
  const [isLoading, setIsLoading] = useState(true)  
  const [refreshing, setRefreshing] = useState(false)  
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)  
  const [isOwnProfile, setIsOwnProfile] = useState(false)  
  const [isFollowing, setIsFollowing] = useState(false)  
  const [activeTab, setActiveTab] = useState<TabType>('posts')  
  const [feed, setFeed] = useState<any[]>([])  
  const [communities, setCommunities] = useState<Community[]>([])  
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([])
    
  const targetUserId = route?.params?.userId || ''
  
  useEffect(() => {  
    loadProfile()  
  }, [targetUserId])  
  
  const loadProfile = async () => {  
    try {  
      setIsLoading(true)  
      
      const currentUserId = await getCurrentUserId()  
      const userId = targetUserId || currentUserId  
  
      if (!userId) {  
        Alert.alert("Error", "No se pudo identificar el usuario")  
        return  
      }  
  
      const userData = await getUserComplete(userId)  
      
      if (userData) {
        setProfileUser(userData)
        setIsOwnProfile(userId === currentUserId)

        // Obtener personas sugeridas del backend
        try {
          const suggestedUsers = await getSuggestedPeople(userId)
          const mappedSuggestedPeople = suggestedUsers.map((user: any) => ({
            id: user.id,
            name: user.full_name || user.nombre || user.username,
            title: user.role || 'Usuario',
            avatarUrl: user.avatar_url || user.photo_url,
            commonInterest: user.intereses?.[0] || 'Intereses compartidos'
          }))
          setSuggestedPeople(mappedSuggestedPeople)
        } catch (error) {
          console.error('Error loading suggested people:', error)
          setSuggestedPeople([])
        }
      } else {
        Alert.alert("Error", "No se pudo cargar el perfil del usuario")  
      }  
    } catch (error: any) {  
      Alert.alert(  
        "Error",   
        error?.message || "No se pudo cargar el perfil. Por favor, intenta de nuevo."  
      )  
    } finally {  
      setIsLoading(false)  
      setRefreshing(false)  
    }  
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadProfile()
  }  
  
  const handleFollow = async () => {  
    if (!profileUser) return  
      
    try {  
      const currentUserId = await getCurrentUserId()  
      if (!currentUserId) return  
  
      if (isFollowing) {  
        await unfollowUser(currentUserId, profileUser.id)  
      } else {  
        await followUser(currentUserId, profileUser.id)  
      }  
      setIsFollowing(!isFollowing)
      
      if (profileUser.stats) {
        setProfileUser({
          ...profileUser,
          stats: {
            ...profileUser.stats,
            followersCount: isFollowing 
              ? profileUser.stats.followersCount - 1 
              : profileUser.stats.followersCount + 1
          }
        })
      }
    } catch (error) {  
      Alert.alert("Error", "No se pudo realizar la acción")  
    }  
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen')
  }

  const handleMessage = () => {
    if (!profileUser) return
    navigation.navigate('Chat', { userId: profileUser.id, userName: profileUser.name })
  }

  const handleShare = async () => {
    Alert.alert('Compartir perfil', `Compartir perfil de ${profileUser?.name}`)
  }

  const handleMoreOptions = () => {
    setShowMoreMenu(true)
  }

  const handleConnectPerson = async (personId: string) => {
    try {
      const currentUserId = await getCurrentUserId()
      if (!currentUserId) return

      await connectWithUser(currentUserId, personId)
      Alert.alert('Conectar', 'Solicitud de conexión enviada')
      // Remove from suggestions after connecting
      setSuggestedPeople(prev => prev.filter(p => p.id !== personId))
    } catch (error) {
      console.error('Error connecting with user:', error)
      Alert.alert('Error', 'No se pudo enviar la solicitud de conexión')
    }
  }

  const handleDismissPerson = async (personId: string) => {
    try {
      const currentUserId = await getCurrentUserId()
      if (!currentUserId) return

      await dismissPersonSuggestion(currentUserId, personId)
      setSuggestedPeople(prev => prev.filter(p => p.id !== personId))
    } catch (error) {
      console.error('Error dismissing person suggestion:', error)
      // Still remove from UI even if API call fails
      setSuggestedPeople(prev => prev.filter(p => p.id !== personId))
    }
  }
  
  const renderPostCard = (post: any, index: number) => (  
    <View key={index} style={styles.postCard}>  
      <View style={styles.postHeader}>  
        <View style={styles.postAuthorRow}>
          {post.user?.avatar_url ? (
            <Image source={{ uri: post.user.avatar_url }} style={styles.postAvatar} />
          ) : (
            <View style={[styles.postAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>
                {getInitials(post.user?.nombre || 'U')}
              </Text>
            </View>
          )}
          <View style={styles.postAuthorInfo}>  
            <Text style={styles.postAuthor}>{post.user?.nombre || 'Usuario'} ha compartido esto</Text>  
            <Text style={styles.postTime}>
              {new Date(post.created_at).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric' 
              })}
            </Text>  
          </View>
        </View>
        <TouchableOpacity style={styles.postMoreButton}>
          <MoreHorizontal size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>  
      
      <Text style={styles.postText} numberOfLines={3}>{post.contenido}</Text>
      
      {post.media_url && post.media_url.length > 0 && (
        <Image 
          source={{ uri: post.media_url[0] }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.postFooter}>
        <View style={styles.postStats}>  
          <View style={styles.postStatsLeft}>
            <ThumbsUp size={14} color="#6B7280" fill="#6B7280" />
            <Text style={styles.postStatNumber}>{post.likes_count || 0}</Text>
          </View>
          <Text style={styles.postStatsRight}>
            {post.comment_count || 0} comentarios • {post.shares_count || 0} compartidos
          </Text>  
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}>
            <ThumbsUp size={20} color="#6B7280" />
            <Text style={styles.postActionText}>Me gusta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <MessageCircle size={20} color="#6B7280" />
            <Text style={styles.postActionText}>Comentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Share2 size={20} color="#6B7280" />
            <Text style={styles.postActionText}>Compartir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Send size={20} color="#6B7280" />
            <Text style={styles.postActionText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>  
  )

  const renderSuggestedPerson = (person: SuggestedPerson, index: number) => (
    <View key={index} style={styles.personCard}>
      <TouchableOpacity 
        style={styles.dismissButton}
        onPress={() => handleDismissPerson(person.id)}
      >
        <X size={20} color="#fff" />
      </TouchableOpacity>
      
      {person.avatarUrl ? (
        <Image source={{ uri: person.avatarUrl }} style={styles.personAvatar} />
      ) : (
        <View style={[styles.personAvatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitialsLarge}>
            {getInitials(person.name)}
          </Text>
        </View>
      )}
      
      <Text style={styles.personName}>{person.name}</Text>
      <Text style={styles.personTitle}>{person.title}</Text>
      
      <View style={styles.personInterest}>
        <View style={styles.interestIcon}>
          <UsersIcon size={14} color="#0A66C2" />
        </View>
        <Text style={styles.personInterestText}>{person.commonInterest}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.connectButton}
        onPress={() => handleConnectPerson(person.id)}
      >
        <Text style={styles.connectButtonText}>Conectar</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCommunityCard = (community: Community, index: number) => (
    <View key={index} style={styles.communityCard}>
      <View style={styles.communityCardContent}>
        {community.imageUrl ? (
          <Image
            source={{ uri: community.imageUrl }}
            style={styles.communityBanner}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.communityBanner, styles.communityBannerPlaceholder]} />
        )}
        
        <View style={styles.communityCardBody}>
          {community.imageUrl ? (
            <Image
              source={{ uri: community.imageUrl }}
              style={styles.communityLogo}
            />
          ) : (
            <View style={[styles.communityLogo, styles.communityLogoPlaceholder]}>
              <Text style={styles.communityInitials}>
                {getInitials(community.name)}
              </Text>
            </View>
          )}
          
          <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
          <View style={styles.communityMeta}>
            <UsersIcon size={14} color="#6B7280" />
            <Text style={styles.communityMembers}>
              {community.memberCount}k miembros
            </Text>
            <Text style={styles.communityDot}>•</Text>
            <Text style={styles.communityType}>Comunidad pública</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.communityJoinButton, community.isMember && styles.communityJoinedButton]}
            onPress={() => {
              Alert.alert('Comunidad', community.isMember ? 'Salir de la comunidad' : 'Unirse a la comunidad')
            }}
          >
            <Text style={[styles.communityJoinButtonText, community.isMember && styles.communityJoinedButtonText]}>
              {community.isMember ? 'Unido' : 'Unirse'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
  
  const renderContent = () => {  
    if (isLoading) {  
      return (  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#0A66C2" />  
        </View>  
      );  
    }  
  
    if (!profileUser) {  
      return (  
        <View style={styles.errorContainer}>  
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>  
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>  
            <Text style={styles.retryButtonText}>Reintentar</Text>  
          </TouchableOpacity>  
        </View>  
      );  
    }  
  
    return (  
      <>  
        {/* Banner */}  
        <View style={styles.bannerContainer}>
          {profileUser.bannerUrl ? (
            <Image source={{ uri: profileUser.bannerUrl }} style={styles.banner} />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}
          {isOwnProfile && (
            <TouchableOpacity style={styles.editBannerButton} onPress={handleEditProfile}>
              <Edit2 size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
  
        {/* Profile Header */}  
        <View style={styles.profileHeader}>  
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>  
              {profileUser.avatarUrl ? (
                <Image  
                  source={{ uri: profileUser.avatarUrl }}  
                  style={styles.avatar}  
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitialsLarge}>
                    {getInitials(profileUser.name)}
                  </Text>
                </View>
              )}
            </View>
            
            {profileUser.learningTag && (
              <View style={styles.learningTag}>
                <Text style={styles.learningTagText}>{profileUser.learningTag}</Text>
              </View>
            )}
          </View>
            
          <View style={styles.userInfo}>  
            <View style={styles.nameRow}>  
              <Text style={styles.userName} numberOfLines={1}>  
                {profileUser.name}  
              </Text>  
              {profileUser.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Check size={16} color="#fff" strokeWidth={3} />
                </View>
              )}  
            </View>  
            
            {profileUser.bio && (  
              <Text style={styles.userBio} numberOfLines={2}>  
                {profileUser.bio}  
              </Text>  
            )}  
            
            {profileUser.location && (  
              <Text style={styles.userLocation}>  
                {profileUser.location}  
              </Text>  
            )}
            
            <TouchableOpacity 
              style={styles.contactsLink}
              onPress={() => navigation.navigate('Followers', { userId: targetUserId })}
            >
              <Text style={styles.contactsLinkText}>
                {profileUser.stats?.followersCount || 0} contactos
              </Text>
            </TouchableOpacity>
          </View>  
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isOwnProfile ? (  
            <>
              <TouchableOpacity  
                style={styles.primaryButton}  
                onPress={() => Alert.alert('Cambiar intereses', 'Función próximamente')}
              >  
                <Text style={styles.primaryButtonText}>Cambiar mis intereses</Text>  
              </TouchableOpacity>
              <TouchableOpacity  
                style={styles.primaryButtonOutline}  
                onPress={handleEditProfile}  
              >  
                <Text style={styles.primaryButtonOutlineText}>Editar perfil</Text>  
              </TouchableOpacity>
              <TouchableOpacity  
                style={styles.iconButton}  
                onPress={handleMoreOptions}  
              >  
                <MoreHorizontal size={20} color="#6B7280" />
              </TouchableOpacity>
            </>
          ) : (  
            <>
              <TouchableOpacity  
                style={[styles.primaryButton, isFollowing && styles.followingButton]}  
                onPress={handleFollow}  
              >  
                {isFollowing ? (
                  <Check size={18} color="#0A66C2" strokeWidth={2.5} />  
                ) : (  
                  <Plus size={18} color="#fff" strokeWidth={2.5} />  
                )}  
                <Text style={[styles.primaryButtonText, isFollowing && styles.followingButtonText]}>  
                  {isFollowing ? 'Siguiendo' : 'Conectar'}  
                </Text>  
              </TouchableOpacity>
              <TouchableOpacity  
                style={styles.secondaryButton}  
                onPress={handleMessage}  
              >  
                <MessageSquare size={18} color="#6B7280" />
                <Text style={styles.secondaryButtonText}>Mensaje</Text>
              </TouchableOpacity>
              <TouchableOpacity  
                style={styles.iconButton}  
                onPress={handleMoreOptions}  
              >  
                <MoreHorizontal size={20} color="#6B7280" />
              </TouchableOpacity>
            </>
          )}  
        </View>
        
        {/* About Section */}
        {profileUser.bio && (
          <View style={styles.aboutSection}>
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>Acerca de</Text>
              {isOwnProfile && (
                <TouchableOpacity onPress={handleEditProfile}>
                  <Edit2 size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.aboutText} numberOfLines={3}>
              {profileUser.bio}
            </Text>
            <TouchableOpacity onPress={() => setShowAboutModal(true)}>
              <Text style={styles.seeMoreText}>...ver más</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Actividad</Text>
            <TouchableOpacity onPress={handleMoreOptions}>
              <MoreHorizontal size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.connectionsRow}>
            <TouchableOpacity
              style={styles.connectionLink}
              onPress={() => navigation.navigate('Followers', { userId: targetUserId })}
            >
              <Text style={styles.connectionLinkText}>
                {profileUser.stats?.followersCount || 0} seguidores
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.connectionLink}
              onPress={() => navigation.navigate('Following', { userId: targetUserId })}
            >
              <Text style={styles.connectionLinkText}>
                {profileUser.stats?.followingCount || 0} siguiendo
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityButtons}>
            <TouchableOpacity 
              style={[styles.activityButton, activeTab === 'posts' && styles.activityButtonActive]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.activityButtonText, activeTab === 'posts' && styles.activityButtonTextActive]}>
                Publicaciones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityButton}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Text style={styles.activityButtonText}>
                Hacer una publicación
              </Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Content */}  
        <View style={styles.contentContainer}>  
          {activeTab === 'posts' && (  
            feed.length > 0 ? (  
              feed.map((post, index) => renderPostCard(post, index))  
            ) : (  
              <View style={styles.emptyState}>  
                <Text style={styles.emptyStateText}>  
                  {isOwnProfile ? 'Aún no has publicado nada' : 'Este usuario no tiene publicaciones'}  
                </Text>  
                {isOwnProfile && (  
                  <TouchableOpacity  
                    style={styles.createPostButton}  
                    onPress={() => navigation.navigate('CreatePost')}  
                  >  
                    <Text style={styles.createPostButtonText}>  
                      Crear primera publicación  
                    </Text>  
                  </TouchableOpacity>  
                )}  
              </View>  
            )  
          )}  
        </View>
        
        {/* Personas que podrías conocer */}
        {suggestedPeople.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Personas que podrías conocer</Text>
            <Text style={styles.sectionSubtitle}>Según tus intereses</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              decelerationRate="fast"
            >
              {suggestedPeople.map((person, index) => (
                <View key={index} style={styles.personCardWrapper}>
                  {renderSuggestedPerson(person, index)}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Communities Section */}
        {communities.length > 0 && (
          <View style={styles.communitiesSection}>
            <Text style={styles.sectionTitle}>Comunidades que podrían gustarte</Text>
            <Text style={styles.sectionSubtitle}>Según tus intereses</Text>
            {communities.slice(0, 2).map((community, index) => renderCommunityCard(community, index))}
          </View>
        )}
      </>  
    );  
  };  
  
  return (  
    <SafeAreaView style={styles.container}>  
      {/* Header */}
      <View style={[styles.topHeader, { paddingTop: top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        {!isOwnProfile && (
          <View style={styles.searchBar}>
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              {profileUser?.name || 'Perfil'}
            </Text>
          </View>
        )}
        {isOwnProfile && <View style={{ flex: 1 }} />}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => isOwnProfile ? navigation.navigate('Settings') : handleMoreOptions()}
        >
          {isOwnProfile ? (
            <Settings size={24} color="#000" />
          ) : (
            <MoreHorizontal size={24} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView  
        style={styles.scrollView}  
        showsVerticalScrollIndicator={false}  
        refreshControl={  
          <RefreshControl  
            refreshing={refreshing}  
            onRefresh={onRefresh}  
            colors={['#0A66C2']}  
            tintColor="#0A66C2"  
          />  
        }  
      >  
        {renderContent()}
      </ScrollView>
      
      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Acerca de</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>{profileUser?.bio}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMoreMenu(false)
              handleShare()
            }}>
              <Share2 size={20} color="#374151" />
              <Text style={styles.menuItemText}>Compartir perfil</Text>
            </TouchableOpacity>
            {!isOwnProfile && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setShowMoreMenu(false)
                  Alert.alert('Reportar', 'Reportar este perfil')
                }}>
                  <Text style={styles.menuItemText}>Reportar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setShowMoreMenu(false)
                  Alert.alert('Bloquear', 'Bloquear este usuario')
                }}>
                  <Text style={[styles.menuItemText, styles.menuItemDanger]}>Bloquear</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemCancel]} 
              onPress={() => setShowMoreMenu(false)}
            >
              <Text style={styles.menuItemText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>  
  );  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#F3F2EF',  
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#EDF3F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {  
    flex: 1,  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    minHeight: 300,  
  },  
  errorContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    padding: 20,  
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  retryButton: {  
    paddingVertical: 10,
    paddingHorizontal: 20,  
    backgroundColor: '#0A66C2',  
    borderRadius: 20,  
  },  
  retryButtonText: {  
    color: '#fff',  
    fontWeight: '600',
    fontSize: 15,
  },
  bannerContainer: {
    position: 'relative',
  },
  banner: {  
    width: '100%',  
    height: 140,  
  },
  bannerPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#1E3A5F',
  },
  editBannerButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {  
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -50,
    marginBottom: 8,
    gap: 12,
  },
  avatarContainer: {  
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 68,
    backgroundColor: '#fff',
  },  
  avatar: {  
    width: 128,  
    height: 128,  
    borderRadius: 64,  
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsLarge: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  learningTag: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'center',
  },
  learningTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  userInfo: {  
    marginTop: 12,
  },  
  nameRow: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 4,
    gap: 6,
  },  
  userName: {  
    fontSize: 22,  
    fontWeight: '700',  
    color: '#000',
    maxWidth: SCREEN_WIDTH - 100,
  },  
  verifiedBadge: {
    backgroundColor: '#0A66C2',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBio: {  
    fontSize: 15,  
    color: '#000',  
    marginBottom: 6,  
    lineHeight: 22,  
  },  
  userLocation: {  
    fontSize: 14,  
    color: '#6B7280',
    marginBottom: 4,
  },
  contactsLink: {
    marginTop: 4,
  },
  contactsLinkText: {
    fontSize: 14,
    color: '#0A66C2',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A66C2',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  primaryButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0A66C2',
    gap: 4,
  },
  primaryButtonOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A66C2',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  followingButtonText: {
    color: '#0A66C2',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6B7280',
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  aboutSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  aboutText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  activitySection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  connectionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  connectionLink: {
    flex: 1,
  },
  connectionLinkText: {
    fontSize: 14,
    color: '#0A66C2',
    fontWeight: '600',
  },
  followersLink: {
    marginBottom: 12,
  },
  followersLinkText: {
    fontSize: 14,
    color: '#0A66C2',
    fontWeight: '600',
  },
  activityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  activityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6B7280',
    alignItems: 'center',
  },
  activityButtonActive: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  activityButtonText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#6B7280',
  },
  activityButtonTextActive: {
    color: '#fff',
  },
  contentContainer: {  
    marginTop: 8,
  },  
  postCard: {  
    backgroundColor: '#fff',  
    marginBottom: 8,
    paddingTop: 12,
  },  
  postHeader: {  
    flexDirection: 'row',  
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,  
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {  
    width: 48,  
    height: 48,  
    borderRadius: 24,  
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },  
  postAuthorInfo: {  
    flex: 1,  
  },  
  postAuthor: {  
    fontSize: 14,  
    fontWeight: '600',  
    color: '#000',  
  },  
  postTime: {  
    fontSize: 12,  
    color: '#6B7280',
    marginTop: 2,
  },
  postMoreButton: {
    padding: 4,
  },
  postText: {  
    fontSize: 14,  
    lineHeight: 20,  
    color: '#000',  
    paddingHorizontal: 16,
    marginBottom: 12,  
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  postStats: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  postStatsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  postStatsRight: {
    fontSize: 12,  
    color: '#6B7280',
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  postAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  suggestionsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
  },
  personCardWrapper: {
    marginRight: 12,
  },
  personCard: {
    width: 180,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0A66C2',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  personAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  personTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  personInterest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  interestIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EDF3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInterestText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  connectButton: {
    width: '100%',
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A66C2',
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A66C2',
  },
  communitiesSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  communityCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  communityCardContent: {
    backgroundColor: '#fff',
  },
  communityBanner: {
    width: '100%',
    height: 60,
    backgroundColor: '#1E3A5F',
  },
  communityBannerPlaceholder: {
    backgroundColor: '#1E3A5F',
  },
  communityCardBody: {
    padding: 12,
    alignItems: 'center',
  },
  communityLogo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginTop: -40,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
  },
  communityLogoPlaceholder: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    color: '#000',
    textAlign: 'center',
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  communityMembers: {
    fontSize: 12,
    color: '#6B7280',
  },
  communityDot: {
    fontSize: 12,
    color: '#6B7280',
  },
  communityType: {
    fontSize: 12,
    color: '#6B7280',
  },
  communityJoinButton: {
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  communityJoinedButton: {
    backgroundColor: '#fff',
  },
  communityJoinButtonText: {
    color: '#0A66C2',
    fontSize: 14,
    fontWeight: '600',
  },
  communityJoinedButtonText: {
    color: '#6B7280',
  },
  emptyState: {  
    paddingVertical: 60,  
    alignItems: 'center',  
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
  },  
  emptyStateText: {  
    fontSize: 15,  
    color: '#6B7280',  
    textAlign: 'center',  
    marginBottom: 20,  
    paddingHorizontal: 30,
  },  
  createPostButton: {  
    backgroundColor: '#0A66C2',  
    paddingVertical: 10,  
    paddingHorizontal: 24,  
    borderRadius: 20,  
  },  
  createPostButtonText: {  
    color: '#fff',  
    fontWeight: '600',  
    fontSize: 15,  
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuItemDanger: {
    color: '#DC2626',
  },
  menuItemCancel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
});