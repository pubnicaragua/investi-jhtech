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
  ActivityIndicator, FlatList, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('Todo')
  const [selectedPostFilter, setSelectedPostFilter] = useState('De mis contactos')
  const [currentRoute, setCurrentRoute] = useState('Promotions')
  const [userId, setUserId] = useState<string | null>(null)
  const [dismissedPeople, setDismissedPeople] = useState<Set<string>>(new Set())
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  
  useAuthGuard()

  // Función backend-driven para cargar promociones con búsqueda
  const loadPromotions = async (uid: string, query: string) => {
    try {
      console.log('🎁 [PromotionsScreen] Cargando promociones...', { uid, query })
      const { data, error } = await supabase
        .rpc('get_promotions', {
          p_user_id: uid,
          p_search: query || ''
        })
      
      if (error) {
        console.error('❌ [PromotionsScreen] Error fetching promotions:', error)
        return []
      }
      
      console.log('✅ [PromotionsScreen] Promociones cargadas:', data?.length || 0)
      return (data || []).map((promo: any) => ({
        ...promo,
        valid_until: promo.valid_until 
          ? new Date(promo.valid_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
          : 'Sin fecha'
      }))
    } catch (error) {
      console.error('❌ [PromotionsScreen] Exception in loadPromotions:', error)
      return []
    }
  }

  // Carga optimizada de datos en paralelo
  const loadData = useCallback(async () => {
    try {
      console.log('📊 [PromotionsScreen] Iniciando carga de datos...')
      if (!refreshing) setLoading(true)
      
      const uid = await getCurrentUserId()
      if (!uid) {
        console.warn('⚠️ [PromotionsScreen] No hay userId')
        setLoading(false)
        return
      }
      console.log('✅ [PromotionsScreen] UserId obtenido:', uid)
      setUserId(uid)
      
      // Cargar todo en paralelo para mejor rendimiento
      console.log('🔄 [PromotionsScreen] Cargando datos en paralelo...')
      const [promosRes, peopleRes, commRes, postsRes] = await Promise.all([
        loadPromotions(uid, searchQuery),
        getSuggestedPeople(uid, 10),
        getSuggestedCommunities(uid, 5),
        getRecentPosts(uid, selectedPostFilter, 10)
      ])

      console.log('📦 [PromotionsScreen] Resultados:', {
        promotions: promosRes?.length || 0,
        people: peopleRes?.length || 0,
        communities: commRes?.length || 0,
        posts: postsRes?.length || 0
      })

      setPromotions(promosRes || [])
      setPeople(peopleRes || [])
      
      // Filtrar comunidades por búsqueda si hay query
      let filteredCommunities = commRes || []
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        filteredCommunities = filteredCommunities.filter((comm: any) => 
          (comm.nombre || comm.name || '').toLowerCase().includes(query) ||
          (comm.descripcion || comm.description || '').toLowerCase().includes(query)
        )
        console.log(`🔍 Comunidades filtradas por "${searchQuery}": ${filteredCommunities.length}/${(commRes || []).length}`)
      }
      setCommunities(filteredCommunities)
      
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

  const handleSavePost = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
        Alert.alert('Publicación eliminada', 'Se eliminó de guardados')
      } else {
        newSet.add(postId)
        Alert.alert('Publicación guardada', 'Se guardó correctamente')
      }
      return newSet
    })
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
      ...(Platform.OS === 'web' ? { overflow: 'auto' as any } : {}),
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
      paddingRight: 16,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: "#F3F4F6",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      marginRight: 8,
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
      paddingBottom: 80,
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
      width: 280,
      marginRight: 16,
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      position: "relative",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
    },
    personCardHeader: {
      height: 100,
      backgroundColor: "#B8C5D6",
    },
    personCoverPhoto: {
      width: "100%",
      height: "100%",
    },
    closeBtn: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 10,
      padding: 8,
      backgroundColor: "#1382EF",
      borderRadius: 20,
    },
    personContent: {
      alignItems: "center",
      padding: 20,
      paddingTop: 0,
      marginTop: -50,
    },
    personAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      backgroundColor: "#E5E7EB",
      borderWidth: 3,
      borderColor: "#FFFFFF",
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
      fontSize: 18,
      fontWeight: "700",
      color: "#111827",
      textAlign: "center",
      marginBottom: 6,
    },
    personRole: {
      fontSize: 14,
      color: "#6B7280",
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 18,
    },
    interestBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#EFF6FF",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#DBEAFE",
      gap: 8,
    },
    interestIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
    },
    interestText: {
      fontSize: 13,
      color: "#3B82F6",
      fontWeight: "600",
      flex: 1,
    },
    connectBtn: {
      backgroundColor: "#1382EF",
      paddingVertical: 14,
      paddingHorizontal: 48,
      borderRadius: 28,
      width: "85%",
      alignItems: "center",
    },
    connectText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
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
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24,
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#D1D5DB",
      marginRight: 12,
    },
    filterChipActive: {
      backgroundColor: "#111827",
      borderColor: "#111827",
    },
    filterText: {
      fontSize: 14,
      color: "#4B5563",
      fontWeight: "600",
    },
    filterTextActive: {
      color: "#FFFFFF",
      fontWeight: "700",
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
      justifyContent: "space-around",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "#F3F4F6",
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingVertical: 6,
      paddingHorizontal: 2,
      flex: 1,
      justifyContent: "center",
    },
    actionText: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: "500",
    },
    actionTextActive: {
      color: "#1382EF",
      fontWeight: "600",
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
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
    },
    communityImgContainer: {
      position: "relative",
      height: 160,
      backgroundColor: "#1F2937",
    },
    communityImg: {
      width: "100%",
      height: "100%",
      opacity: 0.6,
    },
    communityIcon: {
      position: "absolute",
      top: 20,
      left: 20,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#E0F2FE",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: "#FFFFFF",
      overflow: "hidden",
    },
    communityIconImg: {
      width: "100%",
      height: "100%",
    },
    communityJoinBtn: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: "#3B82F6",
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 24,
    },
    communityJoinText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    communityInfo: {
      padding: 20,
      backgroundColor: "#FFFFFF",
    },
    communityName: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 12,
    },
    communityMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    communityMembers: {
      fontSize: 14,
      color: "#6B7280",
      fontWeight: "500",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    communityType: {
      fontSize: 14,
    },
    bottomNavigation: {
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
          {['Todo', 'Personas', 'Comunidades', 'Posts', 'Promociones'].map(tab => (
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
        {selectedTab === 'Todo' && (
          <>
            {/* Mostrar todas las secciones */}
            {filteredPromotions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Promociones</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                  {filteredPromotions.map((promo) => (
                    <TouchableOpacity 
                      key={promo.id} 
                      style={styles.promoCard}
                      onPress={() => (navigation as any).navigate('PromotionDetail', { promotionId: promo.id })}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: promo.image_url || 'https://via.placeholder.com/260x120' }} style={styles.promoImg} resizeMode="cover" />
                      <View style={styles.promoInfo}>
                        <Text style={styles.promoTitle} numberOfLines={2}>{promo.title || 'Promoción'}</Text>
                        <Text style={styles.promoDiscount}>{promo.discount || 'Oferta especial'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {filteredPeople.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personas que podrías conocer</Text>
                <Text style={styles.sectionSubtitle}>{filteredPeople.length} personas</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.carousel}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  bounces={true}
                >
                  {filteredPeople.map((person) => (
                    <View key={person.id} style={styles.personCard}>
                      <View style={styles.personCardHeader}>
                        {person.cover_photo_url ? (
                          <Image source={{ uri: person.cover_photo_url }} style={styles.personCoverPhoto} resizeMode="cover" />
                        ) : null}
                      </View>
                      <TouchableOpacity style={styles.closeBtn} onPress={() => handleDismissPerson(person.id)}>
                        <X size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.personContent}>
                        <Image 
                          source={{ uri: person.avatar_url || person.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(person.full_name || person.nombre || 'User') + '&background=1382EF&color=fff&size=240' }} 
                          style={styles.personAvatar}
                          resizeMode="cover"
                        />
                        <Text style={styles.personName} numberOfLines={1}>{person.full_name || person.nombre || person.username || 'Usuario'}</Text>
                        <Text style={styles.personRole} numberOfLines={1}>{person.role || 'Mercadólogo y financista'}</Text>
                        <View style={styles.interestBadge}>
                          <View style={styles.interestIcon}>
                            <TrendingUp size={18} color="#FFFFFF" />
                          </View>
                          <Text style={styles.interestText} numberOfLines={1}>Inversiones para principiantes</Text>
                        </View>
                        <TouchableOpacity style={styles.connectBtn} onPress={() => handleConnect(person.id)}>
                          <Text style={styles.connectText}>Conectar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {filteredCommunities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comunidades que podrían gustarte</Text>
                <Text style={styles.sectionSubtitle}>Según tus intereses</Text>
                {filteredCommunities.map((community) => (
                  <TouchableOpacity 
                    key={community.id} 
                    style={styles.communityCard}
                    onPress={() => (navigation as any).navigate('CommunityDetail', { communityId: community.id })}
                    activeOpacity={0.9}
                  >
                    <View style={styles.communityImgContainer}>
                      <Image source={{ uri: community.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800' }} style={styles.communityImg} resizeMode="cover" />
                      <View style={styles.communityIcon}>
                        {community.icono_url || community.photo_url ? (
                          <Image source={{ uri: community.icono_url || community.photo_url }} style={styles.communityIconImg} resizeMode="cover" />
                        ) : (
                          <TrendingUp size={36} color="#3B82F6" />
                        )}
                      </View>
                      <TouchableOpacity style={styles.communityJoinBtn} onPress={() => handleJoinCommunity(community.id)}>
                        <Text style={styles.communityJoinText}>Unirse</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.communityInfo}>
                      <Text style={styles.communityName} numberOfLines={2}>{community.name || community.nombre || 'Inversiones para principiantes'}</Text>
                      <View style={styles.communityMeta}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Users size={16} color="#6B7280" />
                          <Text style={styles.communityMembers}>{community.member_count || '12k'} miembros</Text>
                        </View>
                        <Text style={styles.communityType}>• Comunidad pública</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {filteredPosts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Publicaciones</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {['De mis contactos', 'Últimas 24 horas', 'Semana pasada'].map(filter => (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterChip, selectedPostFilter === filter && styles.filterChipActive]}
                      onPress={() => setSelectedPostFilter(filter)}
                    >
                      <Text style={[styles.filterText, selectedPostFilter === filter && styles.filterTextActive]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {filteredPosts.map((post) => (
                  <View key={post.id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <Image source={{ uri: post.user?.avatar_url || post.user?.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.user?.nombre || post.user?.full_name || 'User') + '&background=1382EF&color=fff&size=96' }} style={styles.postAvatar} />
                      <View style={styles.postAuthorInfo}>
                        <Text style={styles.postAuthor}>{post.user?.nombre || post.user?.full_name || 'Usuario'}</Text>
                        <Text style={styles.postRole}>{post.user?.role || 'Financiero'}</Text>
                        <Text style={styles.postTime}>16h • 🌍</Text>
                      </View>
                      <View style={{ marginLeft: 'auto', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <TouchableOpacity 
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} 
                          onPress={() => handleSavePost(post.id)}
                        >
                          <Text style={{ fontSize: 13, color: savedPosts.has(post.id) ? '#1382EF' : '#6B7280', fontWeight: savedPosts.has(post.id) ? '600' : '400' }}>
                            {savedPosts.has(post.id) ? 'Guardado' : 'Guardar publicación'}
                          </Text>
                          <Users size={14} color={savedPosts.has(post.id) ? '#1382EF' : '#6B7280'} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Text style={{ fontSize: 14, color: '#1382EF', fontWeight: '600' }}>+ Seguir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.postContent} numberOfLines={3}>{post.contenido || post.content || 'Invertir en la bolsa puede ser una excelente manera de aumentar su patrimonio con el tiempo. Sin embargo, es importante comprender los riesgos y tomar decisiones informadas. Aquí tiene algunos'}</Text>
                    <Text style={{ fontSize: 14, color: '#1382EF', fontWeight: '600', marginBottom: 12 }}>...Ver más</Text>
                    {post.media_url && post.media_url.length > 0 && (
                      <Image source={{ uri: Array.isArray(post.media_url) ? post.media_url[0] : post.media_url }} style={styles.postImg} resizeMode="cover" />
                    )}
                    <View style={styles.postStats}>
                      <Text style={styles.statText}>👍 {post.likes_count || 100}</Text>
                      <Text style={styles.statText}>{post.comment_count || 100} comentarios • {post.shares_count || 10} compartidos</Text>
                    </View>
                    <View style={styles.postActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                        <ThumbsUp size={18} color={likedPosts.has(post.id) ? '#1382EF' : '#6B7280'} fill={likedPosts.has(post.id) ? '#1382EF' : 'none'} />
                        <Text style={[styles.actionText, likedPosts.has(post.id) && styles.actionTextActive]}>Me gusta</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleComment(post.id)}>
                        <MessageCircle size={18} color="#6B7280" />
                        <Text style={styles.actionText}>Comentar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(post.id, post.contenido || post.content)}>
                        <Share2 size={18} color="#6B7280" />
                        <Text style={styles.actionText}>Compartir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleSend(post.id)}>
                        <Send size={18} color="#6B7280" />
                        <Text style={styles.actionText}>Enviar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        
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

      {/* Bottom Navigation */}
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
          onPress={() => handleNavigation("Promotions")} 
        >
          <Ionicons 
            name={currentRoute === "Promotions" ? "trending-up" : "trending-up-outline"}
            size={26} 
            color={currentRoute === "Promotions" ? "#2673f3" : "#9CA3AF"} 
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