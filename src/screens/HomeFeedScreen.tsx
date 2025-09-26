import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Keyboard,
  FlatList,
  Share,
  Alert,
} from "react-native"
import { useTranslation } from "react-i18next"
import {
  Search,
  MessageSquare,
  Bell,
  PartyPopper,
  BarChart2,
  Handshake,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  Edit3,
  Home,
  TrendingUp,
  PlusCircle,
  Newspaper,
  BookOpen,
} from "lucide-react-native"

import { Sidebar } from "../components/Sidebar"
import { NotificationsModal } from "../components/NotificationsModal"
import { 
  getUserFeed, 
  likePost, 
  globalSearch,
  getCurrentUser
} from "../rest/api"
import { getCurrentUserId } from "../rest/client"
import { EmptyState } from "../components/EmptyState"
import { useAuthGuard } from "../hooks/useAuthGuard"
import { useOnboardingGuard } from "../hooks/useOnboardingGuard"

export function HomeFeedScreen({ navigation }: any) {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [currentRoute, setCurrentRoute] = useState("HomeFeed")
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversations, setConversations] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<TextInput>(null)

  useAuthGuard()
  const { loading: onboardingLoading } = useOnboardingGuard()

  useEffect(() => {
    loadFeed()
    loadNotifications()
    loadConversations()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch()
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchQuery])

  const loadFeed = async () => {
    setError(null)
    try {
      const uid = await getCurrentUserId()
      setUserId(uid)
      if (uid) {
        const data = await getUserFeed(uid)
        setPosts(data || [])
      }
    } catch (err) {
      console.error("Error loading feed:", err)
      setError("Error al cargar el feed")
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      // Mock notifications for now
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  const loadConversations = async () => {
    try {
      // Mock conversations for now
      setConversations([])
    } catch (err) {
      console.error("Error loading conversations:", err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await globalSearch(searchQuery, userId || '')
      setSearchResults(results || [])
    } catch (err) {
      console.error("Search error:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = () => {
    Keyboard.dismiss()
    handleSearch()
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setIsSearchFocused(false)
    searchInputRef.current?.blur()
  }

  const handleLike = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId)
      if (isLiked) {
        // Unlike
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
        // Update post likes count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: Math.max((post.likes || 0) - 1, 0) }
            : post
        ))
      } else {
        // Like
        setLikedPosts(prev => new Set(prev).add(postId))
        // Update post likes count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: (post.likes || 0) + 1 }
            : post
        ))
        // Call API
        if (userId) {
          await likePost(postId, userId)
        }
      }
    } catch (err) {
      console.error("Error liking post:", err)
    }
  }

  const handleShare = async (postId: string, content: string) => {
    try {
      await Share.share({
        message: `${content}\n\nCompartido desde Investi App`,
        title: 'Compartir publicación'
      })
      
      // Update shares count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: (post.shares || 0) + 1 }
          : post
      ))
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  const handleReportPost = async (postId: string, reason: string) => {
    if (!userId) return
    
    try {
      Alert.alert("Reporte enviado", "Gracias por reportar este contenido")
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el reporte")
    }
  }

  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case "celebrate":
        navigation.navigate("CreatePost", { type: "celebration" })
        break
      case "poll":
        navigation.navigate("CreatePost", { type: "poll" })
        break
      case "partner":
        navigation.navigate("CreatePost", { type: "partnership" })
        break
    }
  }

  const handleComment = (postId: string) => {
    navigation.navigate("PostDetail", { postId })
  }

  const handleFollow = (userId: string) => {
    // Navigate to user profile
    navigation.navigate("Profile", { userId })
  }

  const handleSendMessage = (postId: string) => {
    navigation.navigate("ChatScreen", { postId })
  }

  const handleLanguageToggle = () => {
    const newLanguage = i18n.language === "es" ? "en" : "es"
    i18n.changeLanguage(newLanguage)
  }

  const handleNavigation = (routeName: string) => {
    setCurrentRoute(routeName)
    navigation.navigate(routeName)
  }


  const quickActions = [
    { 
      key: "celebrate", 
      label: "Celebrar un momento", 
      icon: PartyPopper, 
      color: "#FF6B6B" 
    },
    { 
      key: "poll", 
      label: "Crear una encuesta", 
      icon: BarChart2, 
      color: "#4ECDC4" 
    },
    { 
      key: "partner", 
      label: "Buscar un socio", 
      icon: Handshake, 
      color: "#45B7D1" 
    },
  ]

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      {/* HEADER */}
      <View style={styles.postHeader}>
        <TouchableOpacity 
          onPress={() => navigation.navigate("Profile", { userId: item.user_id })}
        >
          <Image 
            source={{ uri: item.user_data?.avatar || item.user_avatar || 'https://i.pravatar.cc/100?img=1' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Profile", { userId: item.user_id })}
          >
            <Text style={styles.postUser}>
              {item.user_data?.name || item.user_name || 'Usuario'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.postRole}>
            {item.user_data?.role || item.role || 'Usuario'} ·{" "} 
            {item.post_time || new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleFollow(item.user_id)}>
          <Text style={styles.followText}>+ Seguir</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <TouchableOpacity 
        onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
      >
        <Text style={styles.postContent}>
          {item.content || item.contenido}
        </Text>
      </TouchableOpacity>

      {item.image && (
        <TouchableOpacity 
          onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.postImage} />
        </TouchableOpacity>
      )}

      {/* STATS */}
      <View style={styles.postStats}>
        <Text style={styles.statText}>{item.likes || 0} me gusta</Text>
        <Text style={styles.statText}>{item.comments || 0} comentarios</Text>
        <Text style={styles.statText}>{item.shares || 0} compartidos</Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, likedPosts.has(item.id) && styles.actionBtnLiked]}
          onPress={() => handleLike(item.id)}
        >
          <ThumbsUp 
            size={18} 
            color={likedPosts.has(item.id) ? "#2673f3" : "#666"} 
          />
          <Text style={[styles.actionText, likedPosts.has(item.id) && styles.actionTextLiked]}>
            Me gusta
          </Text>
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleComment(item.id)}
        >
          <MessageCircle size={18} color="#666" />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
          
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleShare(item.id, item.content || item.contenido)}
        >
          <Share2 size={18} color="#666" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleSendMessage(item.id)}
        >
          <Send size={18} color="#666" />
          <Text style={styles.actionText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (onboardingLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
      <NotificationsModal 
        visible={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        userId={userId} 
        navigation={navigation} 
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
          <Image 
            source={{ 
              uri: "https://www.investiiapp.com/investi-logo-new-main.png", 
            }} 
            style={styles.headerAvatar} 
          />
        </TouchableOpacity>

        <View 
          style={[
            styles.searchContainer, 
            isSearchFocused && styles.searchContainerFocused, 
          ]}
        >
          <Search size={20} color="#667" />
          <TextInput 
            ref={searchInputRef} 
            style={styles.searchInput} 
            placeholder="Buscar" 
            placeholderTextColor="#999" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            onFocus={() => setIsSearchFocused(true)} 
            onBlur={() => !searchQuery && setIsSearchFocused(false)} 
            returnKeyType="search" 
            onSubmitEditing={handleSearchSubmit} 
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={{ fontSize: 16, color: "#666" }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity 
          style={styles.headerIcon} 
          onPress={() => setIsNotificationsOpen(true)}
        >
          <View>
            <Bell size={24} color="#111" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerIcon} 
          onPress={() => navigation.navigate("ChatList", { conversations })}
        >
          <View>
            <MessageSquare size={24} color="#111" />
            {conversations.filter(c => c.unread_count > 0).length > 0 && (
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>
                  {conversations.filter(c => c.unread_count > 0).length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActionsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.quickActionsContent} 
          decelerationRate="fast" 
          snapToInterval={140} 
          snapToAlignment="start" 
        >
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.key} 
              style={styles.quickChip} 
              onPress={() => handleQuickAction(action.key)} 
            >
              <View style={[styles.quickChipIconContainer, { backgroundColor: `${action.color}15` }]}>
                <action.icon size={14} color={action.color} />
              </View>
              <Text style={styles.quickChipLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* WRITE POST */}
      <View style={styles.writePostContainer}>
        <Image 
          source={{ 
            uri: "https://www.investiiapp.com/investi-logo-new-main.png", 
          }} 
          style={styles.writeAvatar} 
        />
        <TouchableOpacity 
          style={styles.writeBox} 
          onPress={() => navigation.navigate("CreatePost")} 
        >
          <Edit3 size={16} color="#999" style={styles.writeIcon} />
          <Text style={styles.writePlaceholder}>Escribe algo…</Text>
        </TouchableOpacity>
      </View>

      {/* FEED */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2673f3" />
          </View>
        ) : error || posts.length === 0 ? (
          <EmptyState 
            title="No hay publicaciones disponibles" 
            message="Reintentar" 
            onRetry={loadFeed} 
          />
        ) : (
          <FlatList 
            data={posts} 
            keyExtractor={(item) => item.id.toString()} 
            renderItem={renderPost} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.feedContent} 
            refreshing={loading} 
            onRefresh={loadFeed} 
            style={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* NAVBAR INFERIOR - Orden correcto con iconos profesionales */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("HomeFeed")} 
        >
          <Home size={24} color={currentRoute === "HomeFeed" ? "#2673f3" : "#999"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("MarketInfo")} 
        >
          <TrendingUp size={24} color={currentRoute === "MarketInfo" ? "#2673f3" : "#999"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => handleNavigation("CreatePost")} 
        >
          <PlusCircle size={34} color="#2673f3" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("News")} 
        >
          <Newspaper size={24} color={currentRoute === "News" ? "#2673f3" : "#999"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("Educacion")} 
        >
          <BookOpen size={24} color={currentRoute === "Educacion" ? "#2673f3" : "#999"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  
  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  headerIcon: {
    marginHorizontal: 8,
    padding: 4,
  },
  langToggle: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f7ff",
    borderWidth: 1,
    borderColor: "#e0f0ff",
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2673f3",
  },
  
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  searchContainerFocused: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#2673f3",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#111"
  },
  clearButton: {
    paddingHorizontal: 8
  },
  
  // NOTIFICATION BADGES
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2673f3',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  messageBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // QUICK ACTIONS
  quickActionsContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickChipIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  quickChipLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  
  // WRITE POST
  writePostContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 6,
    borderBottomColor: "#f7f8fa",
  },
  writeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  writeBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0,
  },
  writeIcon: {
    marginRight: 8,
  },
  writePlaceholder: {
    color: "#999",
    fontSize: 14,
    flex: 1,
  },
  
  // FEED
  feedContainer: {
    flex: 1,
    paddingBottom: 70,
  },
  feedContent: {
    paddingVertical: 8,
  },
  
  // POSTS
  postCard: {
    backgroundColor: "white",
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    padding: 16,
    borderBottomWidth: 6,
    borderBottomColor: "#f7f8fa",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12
  },
  postUser: {
    fontWeight: "600",
    fontSize: 15,
    color: "#111",
    marginBottom: 2,
  },
  postRole: {
    fontSize: 13,
    color: "#666"
  },
  followText: {
    color: "#2673f3",
    fontSize: 13,
    fontWeight: "600",
  },
  postContent: {
    fontSize: 15,
    color: "#111",
    marginBottom: 12,
    lineHeight: 22,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  actionBtnLiked: {
    backgroundColor: "#f0f7ff",
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginLeft: 6,
  },
  actionTextLiked: {
    color: "#2673f3",
    fontWeight: "600",
  },
  
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
})
