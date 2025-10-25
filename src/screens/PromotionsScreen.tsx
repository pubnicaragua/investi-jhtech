import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
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
  getSuggestedPeople,
  getSuggestedCommunities,
  getRecentPosts,
  getCurrentUserId,
  joinCommunity,
  connectWithUser,
  likePost,
  unlikePost
} from "../rest/api"
import { supabase } from "../supabase"

export function PromotionsScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()
  
  // Obtener query de búsqueda desde HomeFeedScreen
  const initialQuery = (route.params as any)?.query || ''
  
  const [promotions, setPromotions] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedTab, setSelectedTab] = useState('Personas')
  const [selectedPostFilter, setSelectedPostFilter] = useState('De mis contactos')
  const [currentRoute, setCurrentRoute] = useState('Promotions')
  const [userId, setUserId] = useState<string | null>(null)
  const [dismissedPeople, setDismissedPeople] = useState<Set<string>>(new Set())
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  
  useAuthGuard()

  // Función backend-driven para cargar promociones con búsqueda
  const loadPromotions = async (uid: string, query: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_promotions', {
          p_user_id: uid,
          p_search: query || ''
        })
      
      if (error) {
        console.error('Error fetching promotions:', error)
        return []
      }
      
      return (data || []).map((promo: any) => ({
        ...promo,
        valid_until: promo.valid_until 
          ? new Date(promo.valid_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
          : 'Sin fecha'
      }))
    } catch (error) {
      console.error('Error in loadPromotions:', error)
      return []
    }
  }

  // Carga optimizada de datos en paralelo
  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true)
      
      const uid = await getCurrentUserId()
      if (!uid) {
        setLoading(false)
        return
      }
      setUserId(uid)
      
      // Cargar todo en paralelo para mejor rendimiento
      const [promosRes, peopleRes, commRes, postsRes] = await Promise.all([
        loadPromotions(uid, searchQuery),
        getSuggestedPeople(uid, 10),
        getSuggestedCommunities(uid, 5),
        getRecentPosts(uid, selectedPostFilter, 10)
      ])

      setPromotions(promosRes || [])
      setPeople(peopleRes || [])
      setCommunities(commRes || [])
      setPosts(postsRes || [])
      
      // Extraer posts con like
      const liked = new Set<string>(
        (postsRes || []).filter((p: any) => p.is_liked).map((p: any) => p.id as string)
      )
      setLikedPosts(liked)
      
    } catch (error) {
      console.error("Error loading data:", error)
      Alert.alert('Error', 'No se pudo cargar la información')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [searchQuery, selectedPostFilter, refreshing])
  
  // Carga inicial
  useEffect(() => {
    loadData()
  }, [])
  
  // Recargar cuando cambia la búsqueda (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userId) {
        loadData()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])
  
  // Recargar cuando cambia el filtro
  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [selectedPostFilter])
  
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadData()
  }, [loadData])
  
  const handleNavigation = (route: string) => {
    setCurrentRoute(route)
    ;(navigation as any).navigate(route)
  }
  
  const handleDismissPerson = (personId: string) => {
    setDismissedPeople(prev => new Set(prev).add(personId))
  }
  
  const handleConnect = async (targetUserId: string) => {
    if (!userId) return
    try {
      await connectWithUser(userId, targetUserId)
      Alert.alert('Éxito', 'Solicitud de conexión enviada')
      handleDismissPerson(targetUserId)
    } catch (error) {
      console.error("Error connecting:", error)
      Alert.alert('Error', 'No se pudo enviar la solicitud')
    }
  }
  
  const handleJoinCommunity = async (communityId: string) => {
    if (!userId) return
    try {
      await joinCommunity(userId, communityId)
      Alert.alert('Éxito', 'Te has unido a la comunidad')
      setCommunities(prev => prev.filter(c => c.id !== communityId))
    } catch (error) {
      console.error("Error joining community:", error)
      Alert.alert('Error', 'No se pudo unir a la comunidad')
    }
  }
  
  const handleLike = async (postId: string) => {
    if (!userId) return
    try {
      const isLiked = likedPosts.has(postId)
      
      if (isLiked) {
        await unlikePost(postId, userId)
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: Math.max((p.likes || 0) - 1, 0) } : p
        ))
      } else {
        await likePost(postId, userId)
        setLikedPosts(prev => new Set(prev).add(postId))
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
        ))
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = (postId: string) => {
    (navigation as any).navigate("PostDetail", { postId })
  }

  const handleShare = async (postId: string, content: string) => {
    (navigation as any).navigate("SharePost", { postId, content })
  }

  const handleSend = (postId: string) => {
    (navigation as any).navigate("ChatScreen", { postId })
  }

  // Datos filtrados memoizados para mejor rendimiento CON BÚSQUEDA REAL
  const filteredPeople = useMemo(() => {
    const visible = people.filter(p => !dismissedPeople.has(p.id))
    
    if (!searchQuery.trim()) return visible
    
    const query = searchQuery.toLowerCase().trim()
    return visible.filter(person => {
      const name = (person.full_name || person.nombre || person.username || '').toLowerCase()
      const role = (person.role || '').toLowerCase()
      const bio = (person.bio || '').toLowerCase()
      
      return name.includes(query) || role.includes(query) || bio.includes(query)
    })
  }, [people, dismissedPeople, searchQuery])
  
  const filteredPromotions = useMemo(() => {
    if (!searchQuery.trim()) return promotions
    
    const query = searchQuery.toLowerCase().trim()
    return promotions.filter(promo => {
      const title = (promo.title || '').toLowerCase()
      const desc = (promo.description || '').toLowerCase()
      
      return title.includes(query) || desc.includes(query)
    })
  }, [promotions, searchQuery])
  
  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) return communities
    
    const query = searchQuery.toLowerCase().trim()
    return communities.filter(comm => {
      const name = (comm.name || comm.nombre || '').toLowerCase()
      const desc = (comm.description || comm.descripcion || '').toLowerCase()
      const category = (comm.category || '').toLowerCase()
      
      return name.includes(query) || desc.includes(query) || category.includes(query)
    })
  }, [communities, searchQuery])
  
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    
    const query = searchQuery.toLowerCase().trim()
    return posts.filter(post => {
      const content = (post.contenido || post.content || '').toLowerCase()
      const userName = (post.user?.nombre || post.user?.full_name || '').toLowerCase()
      
      return content.includes(query) || userName.includes(query)
    })
  }, [posts, searchQuery])

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
    promoImgPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(59,130,246,0.2)',
    },
    promoPlaceholderText: {
      fontSize: 40,
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
    avatarPlaceholder: {
      backgroundColor: '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '700',
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
    commImgPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
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
    
    communityCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    communityImg: {
      width: "100%",
      height: 150,
      borderRadius: 12,
      backgroundColor: "#E5E7EB",
    },
    communityInfo: {
      padding: 16,
    },
    communityName: {
      fontSize: 16,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 4,
    },
    communityMembers: {
      fontSize: 13,
      color: "#6B7280",
      marginBottom: 12,
    },
  })

  // REEMPLAZA TODO EL RETURN (línea 752 aprox) CON ESTO:

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A66C2" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>
          {searchQuery ? `Buscando "${searchQuery}"...` : 'Cargando...'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          
          <View style={styles.searchBox}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar personas, comunidades, posts..."
              placeholderTextColor="#9CA3AF"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={() => setSearchQuery(searchInput)}
              returnKeyType="search"
              autoFocus={!!initialQuery}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchInput('')
                setSearchQuery('')
              }}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {['Personas', 'Comunidades', 'Posts', 'Promociones'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A66C2']} />}
      >
        {selectedTab === 'Personas' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `"${searchQuery}"` : 'Personas sugeridas'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredPeople.length} personas
            </Text>
            
            {filteredPeople.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Users size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>
                  No se encontraron personas
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {filteredPeople.map((person) => (
                  <View key={person.id} style={styles.personCard}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => handleDismissPerson(person.id)}>
                      <X size={16} color="#6B7280" />
                    </TouchableOpacity>
                    
                    <View style={styles.personContent}>
                      <Image 
                        source={{ uri: person.avatar_url || person.photo_url || 'https://i.pravatar.cc/100' }} 
                        style={styles.personAvatar} 
                      />
                      <Text style={styles.personName} numberOfLines={2}>
                        {person.full_name || person.nombre || person.username || 'Usuario'}
                      </Text>
                      <Text style={styles.personRole} numberOfLines={2}>
                        {person.role || 'Inversionista'}
                      </Text>
                      
                      <TouchableOpacity 
                        style={styles.connectBtn}
                        onPress={() => handleConnect(person.id)}
                      >
                        <Text style={styles.connectText}>Conectar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
        
        {selectedTab === 'Comunidades' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `"${searchQuery}"` : 'Comunidades'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredCommunities.length} comunidades
            </Text>
            
            {filteredCommunities.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Users size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>
                  No se encontraron comunidades
                </Text>
              </View>
            ) : (
              filteredCommunities.map((community) => (
                <View key={community.id} style={styles.communityCard}>
                  <Image 
                    source={{ uri: community.image_url || community.icono_url || 'https://via.placeholder.com/300' }} 
                    style={styles.communityImg}
                    resizeMode="cover"
                  />
                  <View style={styles.communityInfo}>
                    <Text style={styles.communityName} numberOfLines={2}>
                      {community.name || community.nombre || 'Comunidad'}
                    </Text>
                    <Text style={styles.communityMembers}>
                      {community.member_count || 0} miembros
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.joinBtn}
                      onPress={() => handleJoinCommunity(community.id)}
                    >
                      <Text style={styles.joinText}>Unirse</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
        {selectedTab === 'Posts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `"${searchQuery}"` : 'Publicaciones'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredPosts.length} posts
            </Text>
            
            {filteredPosts.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Newspaper size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>
                  No se encontraron publicaciones
                </Text>
              </View>
            ) : (
              filteredPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <Image 
                      source={{ uri: post.user?.avatar_url || 'https://i.pravatar.cc/100' }} 
                      style={styles.postAvatar}
                    />
                    <View style={styles.postAuthorInfo}>
                      <Text style={styles.postAuthor}>
                        {post.user?.nombre || post.user?.full_name || 'Usuario'}
                      </Text>
                      <Text style={styles.postTime}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.postContent} numberOfLines={4}>
                    {post.contenido || post.content || ''}
                  </Text>
                  
                  {post.media_url && post.media_url.length > 0 && (
                    <Image 
                      source={{ uri: Array.isArray(post.media_url) ? post.media_url[0] : post.media_url }} 
                      style={styles.postImg}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                      <ThumbsUp 
                        size={20} 
                        color={likedPosts.has(post.id) ? '#0A66C2' : '#6B7280'}
                        fill={likedPosts.has(post.id) ? '#0A66C2' : 'none'}
                      />
                      <Text style={[styles.actionText, likedPosts.has(post.id) && styles.actionTextActive]}>
                        {post.likes_count || 0}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleComment(post.id)}>
                      <MessageCircle size={20} color="#6B7280" />
                      <Text style={styles.actionText}>{post.comment_count || 0}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(post.id, post.contenido || post.content)}>
                      <Share2 size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
        {selectedTab === 'Promociones' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `"${searchQuery}"` : 'Promociones'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredPromotions.length} promociones
            </Text>
            
            {filteredPromotions.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <TrendingUp size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>
                  No hay promociones
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {filteredPromotions.map((promo) => (
                  <View key={promo.id} style={styles.promoCard}>
                    <Image 
                      source={{ uri: promo.image_url || 'https://via.placeholder.com/260x120' }} 
                      style={styles.promoImg}
                      resizeMode="cover"
                    />
                    <View style={styles.promoInfo}>
                      <Text style={styles.promoTitle} numberOfLines={2}>
                        {promo.title || 'Promoción'}
                      </Text>
                      <Text style={styles.promoDiscount}>
                        {promo.discount || 'Oferta especial'}
                      </Text>
                      <View style={styles.promoMeta}>
                        <Clock size={12} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.promoMetaText}>
                          {promo.valid_until || 'Sin fecha'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}