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
  useWindowDimensions,  
  Alert,  
  RefreshControl,  
} from "react-native"  
import { useTranslation } from "react-i18next"  
import { ArrowLeft, Settings, Bookmark, Users, MessageCircle, Sliders, Edit, Plus, Check, MessageSquare, MapPin, Search, MoreHorizontal } from "lucide-react-native"  
import { getUserComplete, followUser, unfollowUser, getUserPosts, getSavedPosts, getRecommendedCommunities, getCurrentUserId } from "../rest/api"  
import { LanguageToggle } from "../components/LanguageToggle"  
import { useAuthGuard } from "../hooks/useAuthGuard"  
import { useSafeAreaInsets } from "react-native-safe-area-context"  
  
type TabType = 'posts' | 'saved' | 'communities';  
  
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
  posts?: any[];  
  communities?: any[];  
}  
  
interface ProfileScreenProps {  
  navigation: any;  
  route?: {  
    params?: {  
      userId?: string;  
    };  
  };  
}  
  
export function ProfileScreen({ navigation, route }: ProfileScreenProps) {  
  const { t } = useTranslation()  
  const { top } = useSafeAreaInsets()  
  const { width } = useWindowDimensions()  
  const [isLoading, setIsLoading] = useState(true)  
  const [refreshing, setRefreshing] = useState(false)  
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)  
  const [isOwnProfile, setIsOwnProfile] = useState(false)  
  const [isFollowing, setIsFollowing] = useState(false)  
  const [activeTab, setActiveTab] = useState<TabType>('posts')  
  const [feed, setFeed] = useState<any[]>([])  
  const [savedPosts, setSavedPosts] = useState<any[]>([])  
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([])  
    
  const targetUserId = route?.params?.userId || ''
  
  useEffect(() => {  
    loadProfile()  
  }, [targetUserId])  
  
  const loadProfile = async () => {  
    try {  
      setIsLoading(true)  
      console.log('[ProfileScreen] Starting loadProfile...')  
      
      const currentUserId = await getCurrentUserId()  
      console.log('[ProfileScreen] Current user ID:', currentUserId)  
      
      const userId = targetUserId || currentUserId  
      console.log('[ProfileScreen] Target user ID:', userId)  
  
      if (!userId) {  
        console.error("[ProfileScreen] No user ID available")  
        Alert.alert("Error", "No se pudo identificar el usuario")  
        return  
      }  
  
      const userData = await getUserComplete(userId)  
      console.log('[ProfileScreen] User data received:', userData ? 'Success' : 'Failed')  
      
      if (userData) {  
        setProfileUser(userData)  
        setIsOwnProfile(userId === currentUserId)  
        setFeed(userData.posts || [])  
        console.log('[ProfileScreen] Profile set with', userData.posts?.length || 0, 'posts')  
  
        if (userId === currentUserId) {  
          console.log('[ProfileScreen] Loading own profile data...')  
          try {  
            const [saved, recommended] = await Promise.all([  
              getSavedPosts(userId),  
              getRecommendedCommunities(userId)  
            ])  
            setSavedPosts(saved || [])  
            setRecommendedCommunities(recommended || [])  
            console.log('[ProfileScreen] Saved posts:', saved?.length || 0, 'Recommended:', recommended?.length || 0)  
          } catch (error) {  
            console.error('[ProfileScreen] Error loading saved/recommended:', error)  
            // No bloqueamos la carga del perfil por esto  
            setSavedPosts([])  
            setRecommendedCommunities([])  
          }  
        } else {  
          console.log('[ProfileScreen] Loading other user profile, communities:', userData.communities?.length || 0)  
          setRecommendedCommunities(userData.communities || [])  
        }  
      } else {  
        console.error('[ProfileScreen] getUserComplete returned null')  
        Alert.alert("Error", "No se pudo cargar el perfil del usuario")  
      }  
    } catch (error: any) {  
      console.error("[ProfileScreen] Error loading profile:", error)  
      console.error("[ProfileScreen] Error details:", JSON.stringify(error, null, 2))  
      Alert.alert(  
        "Error",   
        error?.message || "No se pudo cargar el perfil. Por favor, intenta de nuevo."  
      )  
    } finally {  
      setIsLoading(false)  
      setRefreshing(false)  
      console.log('[ProfileScreen] loadProfile finished')  
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
    } catch (error) {  
      console.error('Error following/unfollowing user:', error)  
      Alert.alert("Error", "No se pudo realizar la acción")  
    }  
  }  
  
  const renderPostCard = (post: any, index: number) => (  
    <TouchableOpacity key={index} style={styles.postCard}>  
      <View style={styles.postHeader}>  
        <Image source={{ uri: post.user?.avatar_url || 'https://i.pravatar.cc/100' }} style={styles.postAvatar} />  
        <View style={styles.postAuthorInfo}>  
          <Text style={styles.postAuthor}>{post.user?.nombre}</Text>  
          <Text style={styles.postTime}>{new Date(post.created_at).toLocaleDateString()}</Text>  
        </View>  
      </View>  
      <Text style={styles.postText}>{post.contenido}</Text>  
      <View style={styles.postStats}>  
        <Text style={styles.postStat}>👍 {post.likes_count || 0}</Text>  
        <Text style={styles.postStat}>💬 {post.comment_count || 0}</Text>  
      </View>  
    </TouchableOpacity>  
  )  
  
  const renderContent = () => {  
    if (isLoading) {  
      return (  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#2673f3" />  
        </View>  
      );  
    }  
  
    if (!profileUser) {  
      return (  
        <View style={styles.errorContainer}>  
          <Text>{t('common.errorLoading')}</Text>  
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>  
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>  
          </TouchableOpacity>  
        </View>  
      );  
    }  
  
    return (  
      <>  
        {/* Header con búsqueda */}  
        <View style={styles.searchHeader}>  
          <TouchableOpacity onPress={() => navigation.goBack()}>  
            <ArrowLeft size={24} color="#111" />  
          </TouchableOpacity>  
          <View style={styles.searchBar}>  
            <Search size={20} color="#999" />  
            <Text style={styles.searchPlaceholder}>Buscar usuario por nombre</Text>  
          </View>  
          {isOwnProfile ? (  
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>  
              <Settings size={24} color="#111" />  
            </TouchableOpacity>  
          ) : (  
            <TouchableOpacity>  
              <MoreHorizontal size={24} color="#111" />  
            </TouchableOpacity>  
          )}  
        </View>  
  
        {/* Banner */}  
        {profileUser.bannerUrl && (  
          <Image source={{ uri: profileUser.bannerUrl }} style={styles.banner} />  
        )}  
  
        {/* Profile Header */}  
        <View style={styles.header}>  
          <View style={styles.avatarContainer}>  
            <Image  
              source={{ uri: profileUser.avatarUrl || 'https://randomuser.me/api/portraits/men/1.jpg' }}  
              style={styles.avatar}  
            />  
            {isOwnProfile && (  
              <TouchableOpacity style={styles.editAvatarButton}>  
                <Edit size={16} color="#fff" />  
              </TouchableOpacity>  
            )}  
          </View>  
            
          <View style={styles.userInfo}>  
            <View style={styles.nameContainer}>  
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">  
                {profileUser.name}  
              </Text>  
              {profileUser.isVerified && (  
                <Check size={16} color="#2673f3" style={styles.verifiedIcon} />  
              )}  
            </View>  
            {profileUser.bio && (  
              <Text style={styles.userBio} numberOfLines={2} ellipsizeMode="tail">  
                {profileUser.bio}  
              </Text>  
            )}  
            {profileUser.location && (  
              <View style={styles.locationContainer}>  
                <MapPin size={14} color="#666" />  
                <Text style={styles.userLocation} numberOfLines={1} ellipsizeMode="tail">  
                  {profileUser.location}  
                </Text>  
              </View>  
            )}  
          </View>  
  
          {isOwnProfile ? (  
            <TouchableOpacity  
              style={styles.editButton}  
              onPress={() => navigation.navigate('EditProfile')}  
            >  
              <Text style={styles.editButtonText}>{t('profile.edit')}</Text>  
            </TouchableOpacity>  
          ) : (  
            <View style={styles.followButtonsContainer}>  
              <TouchableOpacity  
                style={[styles.followButton, isFollowing && styles.followingButton]}  
                onPress={handleFollow}  
              >  
                {isFollowing ? (  
                  <Check size={14} color="#2673f3" />  
                ) : (  
                  <Plus size={14} color="#fff" />  
                )}  
                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>  
                  {isFollowing ? t('profile.following') : t('profile.follow')}  
                </Text>  
              </TouchableOpacity>  
              <TouchableOpacity style={styles.messageButton}>  
                <MessageSquare size={14} color="#2673f3" />  
              </TouchableOpacity>  
            </View>  
          )}  
        </View>  
  
        {/* Stats Container */}  
        <View style={styles.statsContainer}>  
          <View style={styles.statItem}>  
            <Text style={styles.statNumber}>{profileUser.stats?.postsCount || 0}</Text>  
            <Text style={styles.statLabel}>{t('profile.posts')}</Text>  
          </View>  
          <TouchableOpacity  
            style={styles.statItem}  
            onPress={() => navigation.navigate('Followers', { userId: targetUserId })}  
          >  
            <Text style={styles.statNumber}>{profileUser.stats?.followersCount || 0}</Text>  
            <Text style={styles.statLabel}>{t('profile.followers')}</Text>  
          </TouchableOpacity>  
          <TouchableOpacity  
            style={styles.statItem}  
            onPress={() => navigation.navigate('Following', { userId: targetUserId })}  
          >  
            <Text style={styles.statNumber}>{profileUser.stats?.followingCount || 0}</Text>  
            <Text style={styles.statLabel}>{t('profile.following')}</Text>  
          </TouchableOpacity>  
        </View>  
  
        {/* Tabs Container */}  
        <View style={styles.tabsContainer}>  
          <TouchableOpacity  
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}  
            onPress={() => setActiveTab('posts')}  
          >  
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>  
              {t('profile.posts')}  
            </Text>  
          </TouchableOpacity>  
          <TouchableOpacity  
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}  
            onPress={() => setActiveTab('saved')}  
          >  
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>  
              {t('profile.saved')}  
            </Text>  
          </TouchableOpacity>  
          <TouchableOpacity  
            style={[styles.tab, activeTab === 'communities' && styles.activeTab]}  
            onPress={() => setActiveTab('communities')}  
          >  
            <Text style={[styles.tabText, activeTab === 'communities' && styles.activeTabText]}>  
              {t('profile.communities')}  
            </Text>  
          </TouchableOpacity>  
        </View>  
  
        {/* Content Container */}  
        <View style={styles.contentContainer}>  
          {activeTab === 'posts' && (  
            feed.length > 0 ? (  
              feed.map((post, index) => renderPostCard(post, index))  
            ) : (  
              <View style={styles.emptyState}>  
                <Text style={styles.emptyStateText}>  
                  {isOwnProfile ? t('profile.noPostsSelf') : t('profile.noPostsUser')}  
                </Text>  
                {isOwnProfile && (  
                  <TouchableOpacity  
                    style={styles.createPostButton}  
                    onPress={() => navigation.navigate('CreatePost')}  
                  >  
                    <Text style={styles.createPostButtonText}>  
                      {t('profile.createFirstPost')}  
                    </Text>  
                  </TouchableOpacity>  
                )}  
              </View>  
            )  
          )}  
  
          {activeTab === 'saved' && (  
            savedPosts.length > 0 ? (  
              savedPosts.map((post, index) => renderPostCard(post, index))  
            ) : (  
              <View style={styles.emptyState}>  
                <Text style={styles.emptyStateText}>{t('profile.noSavedPosts')}</Text>  
              </View>  
            )  
          )}  
  
          {activeTab === 'communities' && (  
            <View style={styles.communitiesContainer}>  
              {recommendedCommunities.length > 0 ? (  
                recommendedCommunities.map((community, index) => (  
                  <TouchableOpacity  
                    key={index}  
                    style={styles.communityCard}  
                    onPress={() => navigation.navigate('Community', { id: community.id })}  
                  >  
                    <Image  
                      source={{ uri: community.imageUrl || 'https://via.placeholder.com/60' }}  
                      style={styles.communityImage}  
                    />  
                    <View style={styles.communityInfo}>  
                      <Text style={styles.communityName}>{community.name}</Text>  
                      <Text style={styles.communityMembers}>  
                        {community.memberCount} {community.memberCount === 1 ? t('community.member') : t('community.members')}  
                      </Text>  
                    </View>  
                    <TouchableOpacity style={styles.joinButton}>  
                      <Text style={styles.joinButtonText}>  
                        {community.isMember ? t('community.joined') : t('community.join')}  
                      </Text>  
                    </TouchableOpacity>  
                  </TouchableOpacity>  
                ))  
              ) : (  
                <View style={styles.emptyState}>  
                  <Text style={styles.emptyStateText}>{t('profile.noCommunities')}</Text>  
                </View>  
              )}  
            </View>  
          )}  
        </View>  
      </>  
    );  
  };  
  
  return (  
    <View style={styles.container}>  
      <ScrollView  
        style={styles.scrollView}  
        showsVerticalScrollIndicator={false}  
        contentContainerStyle={[styles.scrollViewContent, { paddingTop: top + 10 }]}  
        refreshControl={  
          <RefreshControl  
            refreshing={refreshing}  
            onRefresh={onRefresh}  
            colors={['#2673f3']}  
            tintColor="#2673f3"  
          />  
        }  
      >  
        {renderContent()}  
      </ScrollView>  
  
      <View style={[styles.languageToggleContainer, { top: top + 10 }]}>  
        <LanguageToggle />  
      </View>  
    </View>  
  );  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#fff',  
  },  
  scrollView: {  
    flex: 1,  
  },  
  scrollViewContent: {  
    paddingBottom: 20,  
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
  retryButton: {  
    marginTop: 15,  
    padding: 10,  
    backgroundColor: '#2673f3',  
    borderRadius: 5,  
  },  
  retryButtonText: {  
    color: '#fff',  
    fontWeight: '600',  
  },  
  searchHeader: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    paddingHorizontal: 16,  
    paddingVertical: 12,  
    backgroundColor: '#fff',  
    borderBottomWidth: 1,  
    borderBottomColor: '#e5e5e5',  
  },  
  searchBar: {  
    flex: 1,  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: '#f0f0f0',  
    borderRadius: 20,  
    paddingHorizontal: 16,  
    paddingVertical: 8,  
    marginHorizontal: 16,  
  },  
  searchPlaceholder: {  
    marginLeft: 8,  
    fontSize: 16,  
    color: '#999',  
  },  
  banner: {  
    width: '100%',  
    height: 120,  
    backgroundColor: '#f0f0f0',  
  },  
  header: {  
    padding: 20,  
    flexDirection: 'row',  
    alignItems: 'flex-start',  
    marginBottom: 10,  
    backgroundColor: '#fff',  
  },  
  avatarContainer: {  
    marginRight: 15,  
    position: 'relative',  
  },  
  avatar: {  
    width: 80,  
    height: 80,  
    borderRadius: 40,  
    borderWidth: 1,  
    borderColor: '#f0f0f0',  
  },  
  editAvatarButton: {  
    position: 'absolute',  
    bottom: 0,  
    right: 0,  
    backgroundColor: '#2673f3',  
    width: 30,  
    height: 30,  
    borderRadius: 15,  
    justifyContent: 'center',  
    alignItems: 'center',  
    borderWidth: 2,  
    borderColor: '#fff',  
  },  
  userInfo: {  
    flex: 1,  
    marginRight: 10,  
  },  
  nameContainer: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 4,  
  },  
  userName: {  
    fontSize: 18,  
    fontWeight: 'bold',  
    color: '#000',  
  },  
  verifiedIcon: {  
    marginLeft: 4,  
  },  
  userBio: {  
    fontSize: 14,  
    color: '#666',  
    marginBottom: 4,  
    lineHeight: 18,  
  },  
  locationContainer: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginTop: 2,  
  },  
  userLocation: {  
    fontSize: 13,  
    color: '#666',  
    marginLeft: 4,  
    flex: 1,  
  },  
  editButton: {  
    backgroundColor: '#f0f0f0',  
    paddingVertical: 6,  
    paddingHorizontal: 12,  
    borderRadius: 15,  
    marginLeft: 10,  
    minWidth: 80,  
    alignItems: 'center',  
  },  
  editButtonText: {  
    fontSize: 12,  
    fontWeight: '600',  
    color: '#000',  
  },  
  followButtonsContainer: {  
    alignItems: 'center',  
    marginLeft: 10,  
  },  
  followButton: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'center',  
    backgroundColor: '#2673f3',  
    paddingVertical: 6,  
    paddingHorizontal: 12,  
    borderRadius: 15,  
    marginBottom: 8,  
    minWidth: 100,  
  },  
  followingButton: {  
    backgroundColor: '#f0f0f0',  
    borderWidth: 1,  
    borderColor: '#ddd',  
  },  
  followButtonText: {  
    fontSize: 12,  
    fontWeight: '600',  
    color: '#fff',  
    marginLeft: 4,  
  },  
  followingButtonText: {  
    color: '#000',  
  },  
  messageButton: {  
    width: 36,  
    height: 36,  
    borderRadius: 18,  
    borderWidth: 1.5,  
    borderColor: '#2673f3',  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  statsContainer: {  
    flexDirection: 'row',  
    justifyContent: 'space-around',  
    paddingVertical: 15,  
    borderTopWidth: 1,  
    borderBottomWidth: 1,  
    borderColor: '#f0f0f0',  
    marginBottom: 15,  
    backgroundColor: '#fff',  
  },  
  statItem: {  
    alignItems: 'center',  
    flex: 1,  
  },  
  statNumber: {  
    fontSize: 18,  
    fontWeight: 'bold',  
    marginBottom: 4,  
    color: '#000',  
  },  
  statLabel: {  
    fontSize: 12,  
    color: '#666',  
  },  
  tabsContainer: {  
    flexDirection: 'row',  
    borderBottomWidth: 1,  
    borderColor: '#f0f0f0',  
    marginBottom: 15,  
    backgroundColor: '#fff',  
  },  
  tab: {  
    flex: 1,  
    paddingVertical: 12,  
    alignItems: 'center',  
    borderBottomWidth: 2,  
    borderBottomColor: 'transparent',  
  },  
  activeTab: {  
    borderBottomColor: '#2673f3',  
  },  
  tabText: {  
    fontSize: 14,  
    fontWeight: '600',  
    color: '#666',  
  },  
  activeTabText: {  
    color: '#2673f3',  
  },  
  contentContainer: {  
    paddingHorizontal: 15,  
  },  
  postCard: {  
    backgroundColor: '#fff',  
    borderRadius: 10,  
    padding: 15,  
    marginBottom: 10,  
    borderWidth: 1,  
    borderColor: '#f0f0f0',  
  },  
  postHeader: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 10,  
  },  
  postAvatar: {  
    width: 40,  
    height: 40,  
    borderRadius: 20,  
    marginRight: 10,  
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
    color: '#666',  
  },  
  postText: {  
    fontSize: 15,  
    lineHeight: 20,  
    color: '#333',  
    marginBottom: 10,  
  },  
  postStats: {  
    flexDirection: 'row',  
    gap: 16,  
  },  
  postStat: {  
    fontSize: 12,  
    color: '#666',  
  },  
  emptyState: {  
    paddingVertical: 40,  
    alignItems: 'center',  
    justifyContent: 'center',  
  },  
  emptyStateText: {  
    fontSize: 15,  
    color: '#666',  
    textAlign: 'center',  
    marginBottom: 15,  
    paddingHorizontal: 30    },  
    createPostButton: {  
      backgroundColor: '#2673f3',  
      paddingVertical: 10,  
      paddingHorizontal: 20,  
      borderRadius: 20,  
    },  
    createPostButtonText: {  
      color: '#fff',  
      fontWeight: '600',  
      fontSize: 14,  
    },  
    communitiesContainer: {  
      paddingBottom: 20,  
    },  
    communityCard: {  
      flexDirection: 'row',  
      alignItems: 'center',  
      padding: 12,  
      backgroundColor: '#fff',  
      borderRadius: 10,  
      marginBottom: 10,  
      borderWidth: 1,  
      borderColor: '#f0f0f0',  
    },  
    communityImage: {  
      width: 50,  
      height: 50,  
      borderRadius: 8,  
      marginRight: 12,  
    },  
    communityInfo: {  
      flex: 1,  
    },  
    communityName: {  
      fontSize: 15,  
      fontWeight: '600',  
      marginBottom: 3,  
      color: '#000',  
    },  
    communityMembers: {  
      fontSize: 13,  
      color: '#666',  
    },  
    joinButton: {  
      paddingVertical: 6,  
      paddingHorizontal: 12,  
      borderRadius: 15,  
      backgroundColor: 'white',  
      marginTop: 8,  
      borderWidth: 1,  
      borderColor: '#ddd',  
    },  
    joinButtonText: {  
      color: '#2673f3',  
      fontSize: 12,  
      fontWeight: '600',  
    },  
    languageToggleContainer: {  
      position: 'absolute',  
      top: 60,  
      right: 20,  
    },  
  })