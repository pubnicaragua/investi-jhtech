import React, { useState, useEffect, useCallback } from "react"  
import { useNavigation } from "@react-navigation/native"  
import { useSafeAreaInsets } from 'react-native-safe-area-context'  
import {  
  Search, X, ArrowLeft, Clock, MapPin, Home, TrendingUp,  
  Plus, Newspaper, BookOpen, ThumbsUp, MessageCircle,  
  Share2, Send  
} from 'lucide-react-native'  
import {  
  View, Text, ScrollView, TouchableOpacity, TextInput,  
  Image, StyleSheet, StatusBar, RefreshControl, Alert,  
  ActivityIndicator, Platform  
} from 'react-native'  
import { useAuthGuard } from '../hooks/useAuthGuard'  
import {  
  getPromotions,  
  getSuggestedPeople,  
  getSuggestedCommunities,  
  getRecentPosts,  
  getCurrentUserId,
  joinCommunity,
  connectWithUser
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
  const [searchQuery, setSearchQuery] = useState('')  
  const [selectedTab, setSelectedTab] = useState('Personas')  
  const [selectedPostFilter, setSelectedPostFilter] = useState('De mis contactos')
  const [currentRoute, setCurrentRoute] = useState('Promotions')
  const [userId, setUserId] = useState<string | null>(null)
  const [dismissedPeople, setDismissedPeople] = useState<Set<string>>(new Set())
    
  useAuthGuard()  
  
  const loadData = useCallback(async () => {  
    try {  
      setLoading(true)
        
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
    } catch (err) {  
      console.error("Error loading data:", err)  
    } finally {  
      setLoading(false)  
      setRefreshing(false)  
    }  
  }, [searchQuery, selectedPostFilter])  
  
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

  const filteredPeople = people.filter(p => !dismissedPeople.has(p.id))
  
  return (  
    <View style={styles.container}>  
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />  
        
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>  
        <View style={styles.headerRow}>  
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >  
            <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />  
          </TouchableOpacity>  
            
          <View style={styles.searchContainer}>  
            <Search size={18} color="#9CA3AF" strokeWidth={2} />  
            <TextInput  
              style={styles.searchInput}  
              placeholder={searchQuery || "Inversiones"}  
              placeholderTextColor="#1F2937"  
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
          contentContainerStyle={styles.chipsContainer}
        >  
          {['Personas', 'Comunidades', 'Publicaciones'].map((chip) => (  
            <TouchableOpacity  
              key={chip}  
              style={[styles.chip, selectedTab === chip && styles.chipSelected]}  
              onPress={() => setSelectedTab(chip)}
              activeOpacity={0.7}
            >  
              <Text style={[styles.chipText, selectedTab === chip && styles.chipTextSelected]}>  
                {chip}  
              </Text>  
            </TouchableOpacity>  
          ))}  
        </ScrollView>  
      </View>  
  
      <ScrollView  
        style={styles.scrollView}  
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promotionsScroll}
            >  
              {promotions.map(promo => (  
                <TouchableOpacity  
                  key={promo.id}
                  style={styles.promoCard}  
                  onPress={() => navigation.navigate("PromotionDetail" as never, { promotionId: promo.id } as never)}
                  activeOpacity={0.9}
                >  
                  <View style={styles.promoImageContainer}>
                    <Image   
                      source={{ uri: promo.image_url }}   
                      style={styles.promoImage}  
                    />
                  </View>
                  <View style={styles.promoContent}>  
                    <Text style={styles.promoTitle} numberOfLines={2}>{promo.title}</Text>  
                    <Text style={styles.promoDiscount}>{promo.discount}</Text>  
                    <View style={styles.promoMeta}>  
                      <Clock size={14} color="rgba(255,255,255,0.9)" strokeWidth={2} />  
                      <Text style={styles.promoMetaText}>{promo.valid_until}</Text>  
                      <MapPin size={14} color="rgba(255,255,255,0.9)" strokeWidth={2} />  
                      <Text style={styles.promoMetaText}>{promo.location}</Text>  
                    </View>  
                  </View>  
                </TouchableOpacity>  
              ))}  
            </ScrollView>  
          </View>  
        )}
  
        {/* Personas */}
        {filteredPeople.length > 0 && (  
          <View style={styles.section}>  
            <Text style={styles.sectionTitle}>Personas que podrías conocer</Text>  
            <Text style={styles.sectionSubtitle}>Según tus intereses</Text>  
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.peopleScroll}
            >  
              {filteredPeople.map(person => (  
                <View key={person.id} style={styles.personCard}>  
                  <TouchableOpacity 
                    style={styles.dismissBtn}
                    onPress={() => handleDismissPerson(person.id)}
                    activeOpacity={0.7}
                  >  
                    <X size={16} color="#6B7280" strokeWidth={2} />  
                  </TouchableOpacity>  
                    
                  <TouchableOpacity  
                    style={styles.personContent}  
                    onPress={() => navigation.navigate("Profile" as never, { userId: person.id } as never)}
                    activeOpacity={0.9}
                  >  
                    <Image   
                      source={{ uri: person.avatar_url }}   
                      style={styles.personAvatar}  
                    />  
                    <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>  
                    <Text style={styles.personRole} numberOfLines={2}>{person.role}</Text>  
                      
                    {person.interests?.[0] && (
                      <View style={styles.interestChip}>  
                        <Text style={styles.interestText} numberOfLines={1}>
                          💡 {person.interests[0]}
                        </Text>  
                      </View>  
                    )}
                      
                    <TouchableOpacity 
                      style={styles.connectBtn}
                      onPress={(e) => {
                        e.stopPropagation()
                        handleConnect(person.id)
                      }}
                      activeOpacity={0.8}
                    >  
                      <Text style={styles.connectText}>Conectar</Text>  
                    </TouchableOpacity>  
                  </TouchableOpacity>  
                </View>  
              ))}  
            </ScrollView>  
          </View>  
        )}
  
        {/* Comunidades */}
        {communities.length > 0 && (  
          <View style={styles.section}>  
            <Text style={styles.sectionTitle}>Comunidades que podrían gustarte</Text>  
            <Text style={styles.sectionSubtitle}>Según tus intereses</Text>  
            {communities.map(community => (  
              <TouchableOpacity  
                key={community.id}
                style={styles.communityCard}  
                onPress={() => navigation.navigate("CommunityDetail" as never, { communityId: community.id } as never)}
                activeOpacity={0.9}
              >  
                <Image   
                  source={{ uri: community.image_url }}   
                  style={styles.communityImage}  
                />  
                <View style={styles.communityInfo}>  
                  <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>  
                  <Text style={styles.communityMeta}>  
                    {community.members_count >= 1000 
                      ? `${Math.floor(community.members_count / 1000)}k` 
                      : community.members_count} miembros · {community.type}  
                  </Text>  
                </View>  
                <TouchableOpacity   
                  style={styles.joinBtn}  
                  onPress={(e) => {  
                    e.stopPropagation()  
                    handleJoinCommunity(community.id)  
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
                    styles.postFilterChip, 
                    selectedPostFilter === filter && styles.postFilterSelected
                  ]}  
                  onPress={() => setSelectedPostFilter(filter)}
                  activeOpacity={0.7}
                >  
                  <Text style={[
                    styles.postFilterText, 
                    selectedPostFilter === filter && styles.postFilterTextSelected
                  ]}>  
                    {filter}  
                  </Text>  
                </TouchableOpacity>  
              ))}  
            </ScrollView>  
              
            {posts.map(post => (  
              <TouchableOpacity  
                key={post.id}
                style={styles.postCard}  
                onPress={() => navigation.navigate("PostDetail" as never, { postId: post.id } as never)}
                activeOpacity={0.9}
              >  
                <View style={styles.postHeader}>  
                  <Image  
                    source={{ uri: post.author.avatar }}  
                    style={styles.postAvatar}  
                  />  
                  <View style={styles.postAuthor}>  
                    <Text style={styles.postAuthorName}>{post.author.name}</Text>  
                    <Text style={styles.postAuthorRole}>{post.author.role}</Text>  
                    <Text style={styles.postTime}>2h · 🌐</Text>  
                  </View>  
                  <Text style={styles.followText}>+ Seguir</Text>  
                </View>  

                <Text style={styles.postText} numberOfLines={3}>  
                  {post.content}  
                  {post.content?.length > 120 && (
                    <Text style={styles.seeMore}>  ...Ver más</Text>
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
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>  
                    <ThumbsUp size={18} color="#6B7280" strokeWidth={2} />  
                    <Text style={styles.actionText}>Me gusta</Text>  
                  </TouchableOpacity>  
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>  
                    <MessageCircle size={18} color="#6B7280" strokeWidth={2} />  
                    <Text style={styles.actionText}>Comentar</Text>  
                  </TouchableOpacity>  
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>  
                    <Share2 size={18} color="#6B7280" strokeWidth={2} />  
                    <Text style={styles.actionText}>Compartir</Text>  
                  </TouchableOpacity>  
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>  
                    <Send size={18} color="#6B7280" strokeWidth={2} />  
                    <Text style={styles.actionText}>Enviar</Text>  
                  </TouchableOpacity>  
                </View>  
              </TouchableOpacity>  
            ))}  
          </View>  
        )}
      </ScrollView>  
  
      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>  
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("HomeFeed")}
          activeOpacity={0.7}
        >  
          <Home 
            size={24} 
            color={currentRoute === "HomeFeed" ? "#3B82F6" : "#6B7280"} 
            fill={currentRoute === "HomeFeed" ? "#3B82F6" : "none"}
            strokeWidth={2}
          />  
        </TouchableOpacity>  
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("MarketInfo")}
          activeOpacity={0.7}
        >  
          <TrendingUp 
            size={24} 
            color={currentRoute === "MarketInfo" ? "#3B82F6" : "#6B7280"}
            strokeWidth={2}
          />  
        </TouchableOpacity>  
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={() => handleNavigation("CreatePost")}
          activeOpacity={0.8}
        >  
          <Plus size={28} color="#FFFFFF" strokeWidth={3} />  
        </TouchableOpacity>  
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("News")}
          activeOpacity={0.7}
        >  
          <Newspaper 
            size={24} 
            color={currentRoute === "News" ? "#3B82F6" : "#6B7280"}
            strokeWidth={2}
          />  
        </TouchableOpacity>  
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("Educacion")}
          activeOpacity={0.7}
        >  
          <BookOpen 
            size={24} 
            color={currentRoute === "Educacion" ? "#3B82F6" : "#6B7280"}
            strokeWidth={2}
          />  
        </TouchableOpacity>  
      </View>  
  
      {loading && (  
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
    paddingBottom: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#E5E7EB",  
  },  
  headerRow: {  
    flexDirection: "row",  
    alignItems: "center",  
    marginBottom: 16,  
    gap: 12,
  },  
  searchContainer: {  
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
    color: "#1F2937",  
    fontWeight: "500",
    paddingVertical: 0,  
  },  
    
  chipsContainer: {  
    flexDirection: "row",  
    gap: 12,  
    paddingRight: 16,
  },  
  chip: {  
    paddingVertical: 10,  
    paddingHorizontal: 24,  
    borderRadius: 24,  
    backgroundColor: "#F3F4F6",  
  },  
  chipSelected: {  
    backgroundColor: "#3B82F6",  
  },  
  chipText: {  
    fontSize: 15,  
    color: "#6B7280",  
    fontWeight: "500",  
  },  
  chipTextSelected: {  
    color: "#FFFFFF",  
    fontWeight: "600",  
  },  
    
  scrollView: {  
    flex: 1,  
  },
  scrollContent: {
    paddingBottom: 100,
  },
    
  section: {  
    paddingVertical: 24,  
    paddingHorizontal: 16,  
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 8,
    borderBottomColor: "#F3F4F6",
  },  
  sectionTitle: {  
    fontSize: 20,  
    fontWeight: "700",  
    color: "#111827",  
    marginBottom: 6,  
  },  
  sectionSubtitle: {  
    fontSize: 14,  
    color: "#6B7280",  
    marginBottom: 20,  
  },
  promotionsScroll: {
    paddingRight: 16,
  },
  peopleScroll: {
    paddingRight: 16,
  },
    
  promoCard: {  
    width: 280,  
    marginRight: 16,  
    borderRadius: 16,  
    backgroundColor: "#3B82F6",  
    overflow: "hidden",  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.15,  
    shadowRadius: 8,  
    elevation: 8,  
  },
  promoImageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  promoImage: {  
    width: "100%",  
    height: "100%",  
  },  
  promoContent: {  
    padding: 16,  
  },  
  promoTitle: {  
    fontSize: 16,  
    fontWeight: "700",  
    color: "#FFFFFF",  
    marginBottom: 8,  
    lineHeight: 22,  
  },  
  promoDiscount: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#FFFFFF",  
    marginBottom: 12,  
  },  
  promoMeta: {  
    flexDirection: "row",  
    alignItems: "center",  
    gap: 6,
  },  
  promoMetaText: {  
    fontSize: 13,  
    color: "rgba(255,255,255,0.9)",  
    marginRight: 8,  
  },  
    
  personCard: {  
    width: 200,  
    marginRight: 16,  
    backgroundColor: "#F9FAFB",  
    borderRadius: 16,  
    position: "relative",  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 3,  
  },  
  dismissBtn: {  
    position: "absolute",  
    top: 12,  
    right: 12,  
    zIndex: 1,  
    padding: 6,  
    backgroundColor: "rgba(255,255,255,0.9)",  
    borderRadius: 16,  
  },  
  personContent: {  
    alignItems: "center",  
    padding: 20,  
  },  
  personAvatar: {  
    width: 72,  
    height: 72,  
    borderRadius: 36,  
    marginBottom: 12,  
    backgroundColor: "#E5E7EB",  
  },  
  personName: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111827",  
    textAlign: "center",  
    marginBottom: 4,  
  },  
  personRole: {  
    fontSize: 13,  
    color: "#6B7280",  
    textAlign: "center",  
    marginBottom: 12,  
    lineHeight: 18,
  },  
  interestChip: {  
    backgroundColor: "#EFF6FF",  
    paddingVertical: 6,  
    paddingHorizontal: 12,  
    borderRadius: 16,  
    marginBottom: 14,  
    borderWidth: 1,  
    borderColor: "#DBEAFE",
  },  
  interestText: {  
    fontSize: 12,  
    color: "#3B82F6",  
    fontWeight: "500",  
  },  
  connectBtn: {  
    backgroundColor: "#3B82F6",  
    paddingVertical: 10,  
    paddingHorizontal: 28,  
    borderRadius: 24,  
  },  
  connectText: {  
    color: "#FFFFFF",  
    fontWeight: "600",  
    fontSize: 14,  
  },  
    
  communityCard: {  
    flexDirection: "row",  
    alignItems: "center",  
    backgroundColor: "#FFFFFF",  
    borderRadius: 16,  
    padding: 16,  
    marginBottom: 16,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.08,  
    shadowRadius: 4,  
    elevation: 3,  
    gap: 14,
  },  
  communityImage: {  
    width: 100,  
    height: 64,  
    borderRadius: 12,  
    backgroundColor: "#E5E7EB",  
  },  
  communityInfo: {  
    flex: 1,  
  },  
  communityName: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111827",  
    marginBottom: 6,  
  },  
  communityMeta: {  
    fontSize: 13,  
    color: "#6B7280",  
  },  
  joinBtn: {  
    backgroundColor: "#3B82F6",  
    paddingVertical: 10,  
    paddingHorizontal: 20,  
    borderRadius: 24,  
  },  
  joinText: {  
    color: "#FFFFFF",  
    fontWeight: "600",  
    fontSize: 14,  
  },  
      
  postFilters: {  
    flexDirection: "row",  
    gap: 10,  
    marginBottom: 20,  
    paddingRight: 16,
  },  
  postFilterChip: {  
    paddingVertical: 8,  
    paddingHorizontal: 18,  
    borderRadius: 20,  
    borderWidth: 1,  
    borderColor: "#D1D5DB",  
    backgroundColor: "#FFFFFF",  
  },  
  postFilterSelected: {  
    backgroundColor: "#3B82F6",  
    borderColor: "#3B82F6",  
  },  
  postFilterText: {  
    fontSize: 13,  
    color: "#6B7280",  
    fontWeight: "500",  
  },  
  postFilterTextSelected: {  
    color: "#FFFFFF",  
    fontWeight: "600",  
  },  
      
  postCard: {  
    backgroundColor: "#FFFFFF",  
    borderRadius: 16,  
    padding: 16,  
    marginBottom: 16,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.08,  
    shadowRadius: 4,  
    elevation: 3,  
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
    backgroundColor: "#E5E7EB",  
  },  
  postAuthor: {  
    flex: 1,  
  },  
  postAuthorName: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#111827",  
    marginBottom: 2,  
  },  
  postAuthorRole: {  
    fontSize: 13,  
    color: "#6B7280",  
    marginBottom: 2,  
  },  
  postTime: {  
    fontSize: 12,  
    color: "#9CA3AF",  
  },  
  followText: {  
    color: "#3B82F6",  
    fontWeight: "600",  
    fontSize: 14,  
  },  
  postText: {  
    fontSize: 15,  
    color: "#1F2937",  
    marginBottom: 12,  
    lineHeight: 22,  
  },  
  seeMore: {  
    color: "#3B82F6",  
    fontWeight: "500",  
  },  
  postImage: {  
    width: "100%",  
    height: 200,  
    borderRadius: 12,  
    marginBottom: 12,  
    backgroundColor: "#E5E7EB",  
  },  
  postMetrics: {  
    flexDirection: "row",  
    gap: 16,  
    marginBottom: 12,  
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },  
  metricText: {  
    fontSize: 13,  
    color: "#6B7280",  
  },  
  postActions: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
  },  
  actionBtn: {  
    flexDirection: "column",  
    alignItems: "center",  
    paddingVertical: 6,  
    gap: 4,  
  },  
  actionText: {  
    fontSize: 12,  
    fontWeight: "500",  
    color: "#6B7280",  
  },  
      
  bottomNav: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    alignItems: "center",  
    paddingTop: 10,  
    backgroundColor: "#FFFFFF",  
    borderTopWidth: 1,  
    borderTopColor: "#E5E7EB",  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: -2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 8,  
    elevation: 10,  
  },  
  navItem: {  
    alignItems: "center",  
    justifyContent: "center",  
    paddingVertical: 8,  
    paddingHorizontal: 12,  
  },  
  fabButton: {  
    width: 56,  
    height: 56,  
    borderRadius: 28,  
    backgroundColor: "#3B82F6",  
    justifyContent: "center",  
    alignItems: "center",  
    marginTop: -28,  
    shadowColor: "#3B82F6",  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.3,  
    shadowRadius: 12,  
    elevation: 12,  
  },  
      
  loadingOverlay: {  
    position: "absolute",  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: "rgba(255, 255, 255, 0.9)",  
    justifyContent: "center",  
    alignItems: "center",  
  },  
})