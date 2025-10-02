import React, { useState, useEffect, useCallback } from "react"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Search, X, ArrowLeft, Clock, MapPin, Home, TrendingUp,
  Plus, Newspaper, BookOpen, ThumbsUp, MessageCircle,
  Share2, Send, Users, MoreHorizontal
} from 'lucide-react-native'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, StatusBar, RefreshControl, Alert,
  ActivityIndicator, FlatList
} from 'react-native'
import { useAuthGuard } from '../hooks/useAuthGuard'
import {
  getPromotions,
  getSuggestedPeople,
  getSuggestedCommunities,
  getRecentPosts,
  getCurrentUserId,
  joinCommunity,
  connectWithUser,
  likePost,
  unlikePost
} from "../rest/api"

export function PromotionsScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  
  const [promotions, setPromotions] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('Inversiones')
  const [selectedTab, setSelectedTab] = useState('Personas')
  const [selectedPostFilter, setSelectedPostFilter] = useState('De mis contactos')
  const [currentRoute, setCurrentRoute] = useState('Promotions')
  const [userId, setUserId] = useState<string | null>(null)
  const [dismissedPeople, setDismissedPeople] = useState<Set<string>>(new Set())
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  
  useAuthGuard()

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true)
      
      const uid = await getCurrentUserId()
      setUserId(uid)
      
      const [promos, peopleRes, commRes, postsRes] = await Promise.all([
        getPromotions(uid, searchQuery),
        getSuggestedPeople(uid),
        getSuggestedCommunities(uid),
        getRecentPosts(uid, selectedPostFilter)
      ])

      setPromotions(promos || [])
      setPeople(peopleRes || [])
      setCommunities(commRes || [])
      setPosts(postsRes || [])
      
      const liked = new Set((postsRes || []).filter((p: any) => p.is_liked).map((p: any) => p.id))
      setLikedPosts(liked)
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [searchQuery, selectedPostFilter, refreshing])

  useEffect(() => {
    loadData()
  }, [searchQuery, selectedPostFilter])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleNavigation = (screen: string) => {
    setCurrentRoute(screen)
    navigation.navigate(screen as never)
  }

  const handleDismissPerson = (personId: string) => {
    setDismissedPeople(prev => new Set(prev).add(personId))
  }

  const handleConnect = async (personId: string) => {
    if (!userId) return
    try {
      await connectWithUser(userId, personId)
      Alert.alert("Éxito", "Solicitud enviada")
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la solicitud")
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!userId) return
    try {
      await joinCommunity(userId, communityId)
      Alert.alert("Éxito", "Te has unido a la comunidad")
      loadData()
    } catch (error) {
      Alert.alert("Error", "No se pudo unir a la comunidad")
    }
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
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: Math.max((p.likes || 0) - 1, 0) } : p
        ))
        await unlikePost(postId, userId)
      } else {
        setLikedPosts(prev => new Set(prev).add(postId))
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
        ))
        await likePost(postId, userId)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = (postId: string) => {
    navigation.navigate("PostDetail" as never, { postId } as never)
  }

  const handleShare = async (postId: string, content: string) => {
    navigation.navigate("SharePost" as never, { postId, content } as never)
  }

  const handleSend = (postId: string) => {
    navigation.navigate("ChatScreen" as never, { postId } as never)
  }

  const filteredPeople = people.filter(p => !dismissedPeople.has(p.id))

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.searchBox}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Inversiones"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery && (
              <TouchableOpacity 
                onPress={() => setSearchQuery("")}
                activeOpacity={0.7}
              >
                <X size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {['Personas', 'Comunidades', 'Publicaciones'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Promociones */}
        {promotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promociones para ti</Text>
            <Text style={styles.sectionSubtitle}>Ofertas únicas que podrían interesarte ver</Text>
            <FlatList
              horizontal
              data={promotions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.promoCard}
                  onPress={() => navigation.navigate("PromotionDetail" as never, { promotionId: item.id } as never)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.image_url }} style={styles.promoImg} />
                  <View style={styles.promoInfo}>
                    <Text style={styles.promoTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.promoDiscount}>{item.discount}</Text>
                    <View style={styles.promoMeta}>
                      <Clock size={14} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                      <Text style={styles.promoMetaText}>{item.valid_until}</Text>
                      <MapPin size={14} color="rgba(255,255,255,0.9)" strokeWidth={2} style={{ marginLeft: 8 }} />
                      <Text style={styles.promoMetaText}>{item.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            />
          </View>
        )}

        {/* Personas */}
        {filteredPeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personas que podrías conocer</Text>
            <Text style={styles.sectionSubtitle}>Según tus intereses</Text>
            <FlatList
              horizontal
              data={filteredPeople}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.personCard}>
                  <TouchableOpacity 
                    style={styles.closeBtn}
                    onPress={() => handleDismissPerson(item.id)}
                    activeOpacity={0.7}
                  >
                    <X size={16} color="#6B7280" strokeWidth={2} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Profile" as never, { userId: item.id } as never)}
                    activeOpacity={0.9}
                    style={styles.personContent}
                  >
                    <Image source={{ uri: item.avatar_url }} style={styles.personAvatar} />
                    <Text style={styles.personName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.personRole} numberOfLines={2}>{item.role}</Text>
                    
                    {item.interests?.[0] && (
                      <View style={styles.interestBadge}>
                        <Text style={styles.interestText} numberOfLines={1}>
                          💡 {item.interests[0]}
                        </Text>
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.connectBtn}
                      onPress={(e) => {
                        e.stopPropagation()
                        handleConnect(item.id)
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.connectText}>Conectar</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            />
          </View>
        )}

        {/* Comunidades */}
        {communities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comunidades que podrían gustarte</Text>
            <Text style={styles.sectionSubtitle}>Según tus intereses</Text>
            {communities.map(comm => (
              <TouchableOpacity
                key={comm.id}
                style={styles.commCard}
                onPress={() => navigation.navigate("CommunityDetail" as never, { communityId: comm.id } as never)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: comm.image_url }} style={styles.commImg} />
                <View style={styles.commInfo}>
                  <Text style={styles.commName} numberOfLines={1}>{comm.name}</Text>
                  <View style={styles.commMeta}>
                    <Users size={14} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.commMetaText}>
                      {comm.members_count >= 1000 
                        ? `${Math.floor(comm.members_count / 1000)}k` 
                        : comm.members_count} miembros · {comm.type}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={(e) => {
                    e.stopPropagation()
                    handleJoinCommunity(comm.id)
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.joinText}>Unirse</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Publicaciones */}
        {posts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Publicaciones</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.postFilters}
            >
              {['De mis contactos', 'Últimas 24 horas', 'Semanal'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip, 
                    selectedPostFilter === filter && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedPostFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterText, 
                    selectedPostFilter === filter && styles.filterTextActive
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {posts.map(post => (
              <View key={post.id} style={styles.postCard}>
                {/* Shared header */}
                {post.shared_by && (
                  <View style={styles.sharedHeader}>
                    <Image source={{ uri: post.shared_by.avatar }} style={styles.sharedAvatar} />
                    <Text style={styles.sharedText}>
                      <Text style={styles.sharedName}>{post.shared_by.name}</Text> ha compartido esto
                    </Text>
                    <TouchableOpacity activeOpacity={0.7}>
                      <MoreHorizontal size={20} color="#6B7280" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Post header */}
                <TouchableOpacity
                  onPress={() => navigation.navigate("PostDetail" as never, { postId: post.id } as never)}
                  activeOpacity={0.9}
                >
                  <View style={styles.postHeader}>
                    <Image source={{ uri: post.author.avatar }} style={styles.postAvatar} />
                    <View style={styles.postAuthorInfo}>
                      <Text style={styles.postAuthor}>{post.author.name}</Text>
                      <Text style={styles.postRole}>{post.author.role}</Text>
                      <Text style={styles.postTime}>2h · 🌐</Text>
                    </View>
                    <Text style={styles.followBtn}>+ Seguir</Text>
                  </View>

                  <Text style={styles.postContent} numberOfLines={3}>
                    {post.content}
                    {post.content?.length > 120 && (
                      <Text style={styles.seeMore}>  ...Ver más</Text>
                    )}
                  </Text>
                  
                  {post.image && (
                    <Image source={{ uri: post.image }} style={styles.postImg} />
                  )}

                  <View style={styles.postStats}>
                    <Text style={styles.statText}>👍 {post.likes}</Text>
                    <Text style={styles.statText}>💬 {post.comments} comentarios</Text>
                    <Text style={styles.statText}>↗ {post.shares} compartidos</Text>
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleLike(post.id)}
                    activeOpacity={0.7}
                  >
                    <ThumbsUp 
                      size={20} 
                      color={likedPosts.has(post.id) ? "#3B82F6" : "#6B7280"} 
                      fill={likedPosts.has(post.id) ? "#3B82F6" : "none"}
                      strokeWidth={2} 
                    />
                    <Text style={[
                      styles.actionText,
                      likedPosts.has(post.id) && styles.actionTextActive
                    ]}>Me gusta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleComment(post.id)}
                    activeOpacity={0.7}
                  >
                    <MessageCircle size={20} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.actionText}>Comentar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleShare(post.id, post.content)}
                    activeOpacity={0.7}
                  >
                    <Share2 size={20} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.actionText}>Compartir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleSend(post.id)}
                    activeOpacity={0.7}
                  >
                    <Send size={20} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.actionText}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => handleNavigation("HomeFeed")}
          activeOpacity={0.7}
        >
          <Home 
            size={24} 
            color={currentRoute === "HomeFeed" ? "#3B82F6" : "#9CA3AF"} 
            fill={currentRoute === "HomeFeed" ? "#3B82F6" : "none"}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => handleNavigation("MarketInfo")}
          activeOpacity={0.7}
        >
          <TrendingUp 
            size={24} 
            color={currentRoute === "MarketInfo" ? "#3B82F6" : "#9CA3AF"}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.fabBtn} 
          onPress={() => handleNavigation("CreatePost")}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => handleNavigation("News")}
          activeOpacity={0.7}
        >
          <Newspaper 
            size={24} 
            color={currentRoute === "News" ? "#3B82F6" : "#9CA3AF"}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => handleNavigation("Educacion")}
          activeOpacity={0.7}
        >
          <BookOpen 
            size={24} 
            color={currentRoute === "Educacion" ? "#3B82F6" : "#9CA3AF"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0,
  },
  
  tabs: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  section: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 8,
    borderBottomColor: "#F9FAFB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  carousel: {
    paddingRight: 16,
  },
  
  promoCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoImg: {
    width: "100%",
    height: 120,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  promoInfo: {
    padding: 16,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 20,
  },
  promoDiscount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  promoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  promoMetaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  
  personCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
  },
  personContent: {
    alignItems: "center",
    padding: 16,
  },
  personAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
    backgroundColor: "#E5E7EB",
  },
  personName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  personRole: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 16,
  },
  interestBadge: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  interestText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "500",
  },
  connectBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  connectText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  
  commCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  commImg: {
    width: 90,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  commInfo: {
    flex: 1,
  },
  commName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  commMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  joinBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  
  postFilters: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    paddingRight: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sharedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 8,
  },
  sharedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  sharedText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
  },
  sharedName: {
    fontWeight: "600",
    color: "#111827",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  postRole: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  followBtn: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  postContent: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    marginBottom: 12,
  },
  seeMore: {
    color: "#6B7280",
    fontWeight: "500",
  },
  postImg: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navBtn: {
    padding: 8,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
})