import React, { useState, useEffect, useCallback, useRef } from "react"  
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native"  
import { useSafeAreaInsets } from 'react-native-safe-area-context'  
import {  
  Search, X, ArrowLeft, Clock, MapPin, Home, TrendingUp,  
  PlusCircle, Newspaper, BookOpen, Users, Heart, MessageCircle,  
  Share2, Bookmark, MoreHorizontal, User, Building  
} from 'lucide-react-native'  
import {  
  View, Text, ScrollView, TouchableOpacity, TextInput,  
  Image, StyleSheet, StatusBar, RefreshControl, Alert,  
  ActivityIndicator, Dimensions  
} from 'react-native'  
import { useTranslation } from 'react-i18next'  
import { useAuthGuard } from '../hooks/useAuthGuard'  
import { EmptyState } from '../components/EmptyState'  
import {  
  fetchPromotions,  
  getUserFeed,  
  listCommunities,  
  getCurrentUser  
} from "../rest/api"  
  
// --- Interfaces ---  
interface Promotion {  
  id: string  
  title: string  
  description: string  
  category: string  
  discount: string  
  image_url: string  
  valid_until: string  
  location: string  
  terms: string  
  updated_at?: string  
  contact_required?: boolean  
}  
  
interface Person {  
  id: string  
  nombre: string  
  photo_url: string  
  role: string  
  intereses: string[]  
}  
  
interface Community {  
  id: string  
  name: string  
  image_url: string  
  members_count?: number  
  type: string  
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
}  
  
// --- Fetch functions optimizadas ---  
const fetchPromotionsData = async ({ page, limit }: { page: number; limit: number }) => {  
  try {  
    return await fetchPromotions({ page, limit })  
  } catch (error) {  
    console.error('Error fetching promotions:', error)  
    return { data: [], meta: { hasMore: false } }  
  }  
}  
  
const fetchPeople = async (): Promise<Person[]> => {  
  try {  
    const response = await fetch('https://paoliakwfoczcallnecf.supabase.co/rest/v1/users?select=id,nombre,photo_url,role,intereses&limit=10', {  
      headers: {  
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o',  
        'Content-Type': 'application/json'  
      }  
    })  
      
    const data = await response.json()  
    return (data || []).map((person: any) => ({  
      ...person,  
      photo_url: person.photo_url || 'https://i.pravatar.cc/100'  
    }))  
  } catch (error) {  
    console.error('Error fetching people:', error)  
    return []  
  }  
}  
  
const fetchCommunitiesData = async (): Promise<Community[]> => {  
  try {  
    const communities = await listCommunities()  
    return communities || []  
  } catch (error) {  
    console.error('Error fetching communities:', error)  
    return []  
  }  
}  
  
const fetchPosts = async (uid: string): Promise<Post[]> => {  
  try {  
    const feedData = await getUserFeed(uid, 5)  
    return (feedData || []).map((post: any) => ({  
      id: post.id,  
      content: post.contenido || post.content,  
      created_at: post.created_at,  
      image: post.image_url || undefined,  
      author: {  
        id: post.user_id || post.author?.id,  
        name: post.user_data?.name || post.author?.name || 'Usuario',  
        avatar: post.user_data?.avatar || post.author?.avatar || 'https://i.pravatar.cc/100',  
        role: post.user_data?.role || post.author?.role || 'Usuario'  
      }  
    }))  
  } catch (error) {  
    console.error('Error fetching posts:', error)  
    return []  
  }  
}  
  
// --- Componente principal ---  
interface PromotionsScreenProps {
  route?: {
    params?: any
  }
}

export function PromotionsScreen({ route }: PromotionsScreenProps) {  
  const { t } = useTranslation()  
  const navigation = useNavigation()  
  const insets = useSafeAreaInsets()  
    
  // Estados  
  const [promotions, setPromotions] = useState<Promotion[]>([])  
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [people, setPeople] = useState<Person[]>([])  
  const [communities, setCommunities] = useState<Community[]>([])  
  const [posts, setPosts] = useState<Post[]>([])  
  const [loading, setLoading] = useState(true)  
  const [refreshing, setRefreshing] = useState(false)  
  const [error, setError] = useState<string | null>(null)  
  const [searchQuery, setSearchQuery] = useState('Inversiones')  
  const [isSearchFocused, setIsSearchFocused] = useState(false)  
  const [selectedTab, setSelectedTab] = useState('Personas')  
  const [selectedPostFilter, setSelectedPostFilter] = useState('De mis contactos')
  const [currentPage, setCurrentPage] = useState(1)  
    
  const searchInputRef = useRef<TextInput>(null)  
  useAuthGuard()  
  
  // --- Load Data ---  
  const loadData = useCallback(async (isRefreshing = false) => {  
    try {  
      if (!isRefreshing) setLoading(true)  
      setError(null)  
        
      const user = await getCurrentUser()  
        
      const [promos, peopleRes, commRes, postsRes] = await Promise.all([  
        fetchPromotionsData({ page: isRefreshing ? 1 : currentPage, limit: 10 }),  
        fetchPeople(),  
        fetchCommunitiesData(),  
        fetchPosts(user?.id || "")  
      ])  
  
      if (isRefreshing) {  
        setPromotions(promos.data)  
        setCurrentPage(2)  
      } else {  
        setPromotions(prev => [...prev, ...promos.data])  
        setCurrentPage(prev => prev + 1)  
      }  
  
      setPeople(peopleRes)  
      setCommunities(commRes)  
      setPosts(postsRes)  
      setHasMore(promos.meta.hasMore)  
    } catch (err: any) {  
      console.error("Error loading data:", err)  
      setError("Error al cargar datos")  
    } finally {  
      setLoading(false)  
      setRefreshing(false)  
    }  
  }, [currentPage])  
  
  useEffect(() => {  
    loadData()  
  }, [])  
  
  // --- Filtros ---  
  const applyFilters = useCallback(() => {  
    let result = [...promotions]  
    if (searchQuery.trim() !== '') {  
      const q = searchQuery.toLowerCase()  
      result = result.filter(p =>  
        p.title.toLowerCase().includes(q) ||  
        p.description.toLowerCase().includes(q) ||  
        p.category.toLowerCase().includes(q)  
      )  
    }  
    setFilteredPromotions(result)  
  }, [promotions, searchQuery])  
  
  useEffect(() => {  
    applyFilters()  
  }, [applyFilters])  
  
  // --- Refresh ---  
  const onRefresh = useCallback(() => {  
    setRefreshing(true)  
    loadData(true)  
  }, [])  
  
  // --- Navegación ---  
  const currentRoute = route?.name || 'PromotionsScreen'  
  const handleNavigation = (screen: string) => {  
    if (navigation && navigation.navigate) {
      navigation.navigate(screen as never)  
    }
  }  
  
  const showEmptyState = !loading && !refreshing &&   
    (filteredPromotions?.length || 0) === 0 &&   
    (people?.length || 0) === 0 &&   
    (communities?.length || 0) === 0 &&   
    (posts?.length || 0) === 0  
  
  return (  
    <View style={[styles.container, { paddingTop: insets.top }]}>  
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent />  
        
      {/* Header con SafeArea correcta */}  
      <View style={styles.header}>  
        <View style={styles.headerTop}>  
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>  
            <ArrowLeft size={24} color="#111" />  
          </TouchableOpacity>  
            
          <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>  
            <Search size={20} color="#999" />  
            <TextInput  
              ref={searchInputRef}  
              style={styles.searchInput}  
              placeholder="Inversiones"  
              placeholderTextColor="#999"  
              value={searchQuery}  
              onChangeText={setSearchQuery}  
              onFocus={() => setIsSearchFocused(true)}  
              onBlur={() => setIsSearchFocused(false)}  
              returnKeyType="search"  
            />  
            {searchQuery ? (  
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>  
                <X size={18} color="#666" />  
              </TouchableOpacity>  
            ) : null}  
          </View>  
        </View>  
          
        {/* Chips de filtro pixel perfect */}  
        <View style={styles.chipsContainer}>  
          {['Personas', 'Comunidades', 'Publicaciones'].map((chip) => (  
            <TouchableOpacity  
              key={chip}  
              style={[styles.chip, selectedTab === chip && styles.chipSelected]}  
              onPress={() => setSelectedTab(chip)}  
            >  
              <Text style={[styles.chipText, selectedTab === chip && styles.chipTextSelected]}>  
                {chip}  
              </Text>  
            </TouchableOpacity>  
          ))}  
        </View>  
      </View>  
  
      {/* ScrollView principal */}  
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
        {showEmptyState ? (  
          <EmptyState  
            title="No hay contenido disponible"  
            subtitle="Intenta refrescar la página o verifica tu conexión"  
            actionText="Reintentar"  
            onAction={() => loadData(true)}  
          />  
        ) : (  
          <>  
            {/* Promociones */}  
            {filteredPromotions?.length > 0 && (  
              <Section   
                title="Promociones para ti"   
                subtitle="Ofertas únicas que podrían interesarte ver"  
              >  
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>  
                  {filteredPromotions.map(promo => (  
                    <PromotionCard key={promo.id} promo={promo} navigation={navigation} />  
                  ))}  
                </ScrollView>  
              </Section>  
            )}  
  
            {/* Personas */}  
            {people?.length > 0 && (  
              <Section   
                title="Personas que podrías conocer"   
                subtitle="Según tus intereses"  
              >  
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>  
                  {people.map(p => <PersonCard key={p.id} person={p} navigation={navigation} />)}  
                </ScrollView>  
              </Section>  
            )}  
  
            {/* Comunidades */}  
            {communities?.length > 0 && (  
              <Section   
                title="Comunidades que podrían gustarte"   
                subtitle="Según tus intereses"  
              >  
                {communities.map(c => <CommunityCard key={c.id} community={c} navigation={navigation} />)}  
              </Section>  
            )}  
  
            {/* Posts */}  
            {posts?.length > 0 && (  
              <View style={styles.section}>  
                <Text style={styles.sectionTitle}>Publicaciones recientes</Text>  
                  
                <View style={styles.postFiltersContainer}>  
                  {['De mis contactos', 'Últimas 24 horas', 'Semanal'].map((filter) => (  
                    <TouchableOpacity  
                      key={filter}  
                      style={[styles.postFilterChip, selectedPostFilter === filter && styles.postFilterChipSelected]}  
                      onPress={() => setSelectedPostFilter(filter)}  
                    >  
                      <Text style={[styles.postFilterText, selectedPostFilter === filter && styles.postFilterTextSelected]}>  
                        {filter}  
                      </Text>  
                    </TouchableOpacity>  
                  ))}  
                </View>  
                  
                {posts.map(post => (  
                  <PostCard key={post.id} post={post} navigation={navigation} />  
                ))}  
              </View>  
            )}  
          </>  
        )}  
      </ScrollView>  
  
      {/* Navbar inferior */}  
      <View style={[styles.bottomNavigation, { paddingBottom: insets.bottom + 10 }]}>  
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("HomeFeed")}>  
          <Home size={24} color={currentRoute === "HomeFeed" ? "#2673f3" : "#999"} />  
        </TouchableOpacity>  
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("MarketInfo")}>  
          <TrendingUp size={24} color={currentRoute === "MarketInfo" ? "#2673f3" : "#999"} />  
        </TouchableOpacity>  
        <TouchableOpacity style={styles.fabContainer} onPress={() => handleNavigation("CreatePost")}>  
          <View style={styles.fab}>  
            <PlusCircle size={24} color="#fff" />  
          </View>  
        </TouchableOpacity>  
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("News")}>  
          <Newspaper size={24} color={currentRoute === "News" ? "#2673f3" : "#999"} />  
        </TouchableOpacity>  
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("Educacion")}>  
          <BookOpen size={24} color={currentRoute === "Educacion" ? "#2673f3" : "#999"} />  
        </TouchableOpacity>  
      </View>  
  
      {/* Loading overlay */}  
      {loading && !refreshing && (  
        <View style={styles.loadingOverlay}>  
        <ActivityIndicator size="large" color="#2673f3" />  
      </View>  
    )}  
  </View>  
)  
}  

// 🔹 Sección reutilizable  
const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (  
<View style={styles.section}>  
  <Text style={styles.sectionTitle}>{title}</Text>  
  {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}  
  {children}  
</View>  
)  

// 🔹 Card de promoción PIXEL PERFECT  
const PromotionCard: React.FC<{ promo: Promotion; navigation?: any }> = ({ promo, navigation }) => (  
<TouchableOpacity  
  style={styles.promotionCard}  
  onPress={() => navigation?.navigate("PromotionDetail", { promotionId: promo.id })}  
>  
  <Image   
    source={{ uri: promo.image_url || 'https://picsum.photos/200x100/2673f3/ffffff?text=Software+Nicaragua' }}   
    style={styles.promoImage}  
    defaultSource={{ uri: 'https://picsum.photos/200x100/2673f3/ffffff?text=Software+Nicaragua' }}  
  />  
  <View style={styles.promoContent}>  
    <Text style={styles.promoTitle} numberOfLines={2}>{promo.title || 'Software Nicaragua'}</Text>  
    <Text style={styles.promoDiscount}>{promo.discount || '20% OFF'}</Text>  
    <View style={styles.promoDetails}>  
      <Clock size={12} color="#666" />  
      <Text style={styles.promoDetailText}>{promo.valid_until || 'Hasta 31 Dic'}</Text>  
      <MapPin size={12} color="#666" style={{ marginLeft: 6 }} />  
      <Text style={styles.promoDetailText}>{promo.location || 'Nicaragua'}</Text>  
    </View>  
  </View>  
</TouchableOpacity>  
)  

// 🔹 Card de persona PIXEL PERFECT  
const PersonCard: React.FC<{ person: Person; navigation?: any }> = ({ person, navigation }) => (  
<View style={styles.personCard}>  
  {/* Botón de cierre */}  
  <TouchableOpacity style={styles.dismissBtn}>  
    <X size={16} color="#999" />  
  </TouchableOpacity>  
    
  <TouchableOpacity  
    style={styles.personCardContent}  
    onPress={() => navigation?.navigate("Profile", { userId: person.id })}  
  >  
    <Image   
      source={{ uri: person.photo_url || 'https://i.pravatar.cc/100' }}   
      style={styles.personAvatar}  
      defaultSource={{ uri: 'https://i.pravatar.cc/100' }}  
    />  
    <Text style={styles.personName}>{person.nombre || 'Alexey Makova'}</Text>  
    <Text style={styles.personRole}>{person.role || 'Mercadólogo y financista'}</Text>  
      
    {/* Chip de intereses */}  
    <View style={styles.interestChip}>  
      <Text style={styles.interestText}>💡 {person.intereses?.[0] || 'Inversiones para principiantes'}</Text>  
    </View>  
      
    <TouchableOpacity style={styles.connectBtn}>  
      <Text style={styles.connectText}>Conectar</Text>  
    </TouchableOpacity>  
  </TouchableOpacity>  
</View>  
)  

// 🔹 Card de comunidad PIXEL PERFECT  
// 🔹 Card de comunidad PIXEL PERFECT - CON NAVEGACIÓN  
const CommunityCard: React.FC<{ community?: Community; navigation?: any }> = ({ community, navigation }) => {  
  // Return null if community is not defined
  if (!community) {
    return null;
  }
  
  return (
    <TouchableOpacity  
      style={styles.communityCard}  
      onPress={() => navigation?.navigate("CommunityDetail", { communityId: community?.id })}  
    >  
      <Image   
        source={{ uri: community?.image_url || 'https://picsum.photos/100x60/2673f3/ffffff?text=Comunidad' }}   
        style={styles.communityBanner}  
        defaultSource={{ uri: 'https://picsum.photos/100x60/2673f3/ffffff?text=Comunidad' }}  
      />  
      <View style={styles.communityContent}>  
        <Text style={styles.communityName}>{community?.name || 'Inversiones para principiantes'}</Text>  
        <Text style={styles.communityMeta}>  
          {community?.members_count || 12}k miembros · Comunidad pública  
        </Text>  
      </View>  
      <TouchableOpacity   
        style={styles.joinBtn}  
        onPress={(e) => {  
          e.stopPropagation() // Evitar que se active el onPress del card  
          if (community?.id) {
            handleJoinCommunity(community.id)  
          }
        }}  
      >  
        <Text style={styles.joinText}>Unirse</Text>  
      </TouchableOpacity>  
    </TouchableOpacity>  
  );
}
  
// Función para manejar unirse a comunidad  
const handleJoinCommunity = async (communityId: string) => {  
  try {  
    const user = await getCurrentUser()  
    if (user) {  
      await joinCommunity(user.id, communityId)  
      // Opcional: mostrar mensaje de éxito  
      Alert.alert("Éxito", "Te has unido a la comunidad")  
    }  
  } catch (error) {  
    console.error('Error joining community:', error)  
    Alert.alert("Error", "No se pudo unir a la comunidad")  
  }  
} 

// 🔹 Post card PIXEL PERFECT  
const PostCard: React.FC<{ post: Post; navigation?: any }> = ({ post, navigation }) => (  
<TouchableOpacity  
  style={styles.postCard}  
  onPress={() => navigation?.navigate("PostDetail", { postId: post.id })}  
>  
  {/* Header completo */}  
  <View style={styles.postHeader}>  
    <Image  
      source={{ uri: post.author.avatar }}  
      style={styles.postAvatar}  
      defaultSource={{ uri: 'https://i.pravatar.cc/100' }}  
    />  
    <View style={styles.postAuthorInfo}>  
      <Text style={styles.postAuthor}>{post.author.name || 'Usuario'}</Text>  
      <Text style={styles.postRole}>{post.author.role || 'Mercadólogo y financista'}</Text>  
      <Text style={styles.postTime}>2h · 🌐</Text>  
    </View>  
    <Text style={styles.followText}>Seguir</Text>  
  </View>  

  {/* Contenido truncado */}  
  <Text style={styles.postContent} numberOfLines={3}>  
    {post.content}  
    {post.content && post.content.length > 150 && <Text style={styles.seeMore}>...Ver más</Text>}  
  </Text>  
    
  {post.image && (  
    <Image source={{ uri: post.image }} style={styles.postImage} />  
  )}  

  {/* Métricas alineadas */}  
  <View style={styles.metricsRow}>  
    <Text style={styles.metricText}>👍 100</Text>  
    <Text style={styles.metricText}>💬 25 comentarios</Text>  
    <Text style={styles.metricText}>↗ 5 compartidos</Text>  
  </View>  

  {/* Acciones con íconos bien espaciados */}  
  <View style={styles.actionsRow}>  
    <TouchableOpacity style={styles.actionBtn}>  
      <ThumbsUp size={18} color="#666" />  
      <Text style={styles.actionText}>Me gusta</Text>  
    </TouchableOpacity>  
    <TouchableOpacity style={styles.actionBtn}>  
      <MessageCircle size={18} color="#666" />  
      <Text style={styles.actionText}>Comentar</Text>  
    </TouchableOpacity>  
    <TouchableOpacity style={styles.actionBtn}>  
      <Share2 size={18} color="#666" />  
      <Text style={styles.actionText}>Compartir</Text>  
    </TouchableOpacity>  
    <TouchableOpacity style={styles.actionBtn}>  
      <Send size={18} color="#666" />  
      <Text style={styles.actionText}>Enviar</Text>  
    </TouchableOpacity>  
  </View>  
</TouchableOpacity>  
)  

// --- Estilos PIXEL PERFECT ---  
const styles = StyleSheet.create({  
container: {  
  flex: 1,  
  backgroundColor: "#f7f8fa",  
},  
  
// Header PIXEL PERFECT - Sin pegarse al status bar  
header: {  
  backgroundColor: "white",  
  paddingTop: 16,  
  paddingHorizontal: 16,  
  paddingBottom: 12,  
  borderBottomWidth: 1,  
  borderBottomColor: "#e5e5e5",  
  shadowColor: "#000",  
  shadowOffset: { width: 0, height: 1 },  
  shadowOpacity: 0.05,  
  shadowRadius: 2,  
  elevation: 2,  
},  
headerTop: {  
  flexDirection: "row",  
  alignItems: "center",  
  marginBottom: 12,  
},  
backButton: {  
  padding: 4,  
  marginRight: 8,  
},  
searchContainer: {  
  flex: 1,  
  flexDirection: "row",  
  alignItems: "center",  
  backgroundColor: "#f8f9fa",  
  borderRadius: 25, // Completamente redondeado  
  paddingHorizontal: 16,  
  paddingVertical: 10,  
  borderWidth: 1,  
  borderColor: "#e9ecef",  
},  
searchContainerFocused: {  
  backgroundColor: "#fff",  
  borderColor: "#2673f3",  
  shadowColor: "#2673f3",  
  shadowOffset: { width: 0, height: 0 },  
  shadowOpacity: 0.1,  
  shadowRadius: 4,  
  elevation: 2,  
},  
searchInput: {  
  flex: 1,  
  marginLeft: 8,  
  fontSize: 16,  
  color: "#111",  
  padding: 0,  
},  
clearButton: {  
  padding: 4,  
  marginLeft: 8,  
},  
  
// Chips de filtro con sombra  
chipsContainer: {  
  flexDirection: "row",  
  gap: 12,  
  paddingVertical: 4,
},  
chip: {  
  paddingVertical: 8,  
  paddingHorizontal: 20,  
  borderRadius: 25,  
  borderWidth: 1,  
  borderColor: "#e9ecef",  
  backgroundColor: "#f8f9fa",  
  shadowColor: "#000",  
  shadowOffset: { width: 0, height: 1 },  
  shadowOpacity: 0.05,  
  shadowRadius: 2,  
  elevation: 1,  
},  
chipSelected: {  
  backgroundColor: "#2673f3",  
  borderColor: "#2673f3",  
  shadowColor: "#2673f3",  
  shadowOffset: { width: 0, height: 2 },  
  shadowOpacity: 0.2,  
  shadowRadius: 4,  
  elevation: 3,  
},  
chipText: {  
  fontSize: 14,  
  color: "#666",  
  fontWeight: "500",  
},  
chipTextSelected: {  
  color: "#fff",  
  fontWeight: "600",  
},  
  
scrollView: {  
  flex: 1,  
},  
  
// Secciones  
section: {  
  backgroundColor: "white",  
  paddingVertical: 20,  
  paddingHorizontal: 16,  
  marginBottom: 8,  
},  
sectionTitle: {  
  fontSize: 18,  
  fontWeight: "700",  
  color: "#111",  
  marginBottom: 4,  
},  
sectionSubtitle: {  
  fontSize: 14,  
  color: "#666",  
  marginBottom: 16,  
},  
  
// Cards de promoción PIXEL PERFECT  
promotionCard: {  
  width: 280,  
  marginRight: 16,  
  borderRadius: 16,  
  backgroundColor: "#2673f3",  
  shadowColor: "#000",  
  shadowOffset: { width: 0, height: 4 },  
  shadowOpacity: 0.15,  
  shadowRadius: 8,  
  elevation: 6,  
  overflow: "hidden",  
},  
promoImage: {  
  width: "100%",  
  height: 120,  
  backgroundColor: "rgba(255,255,255,0.1)",  
},  
promoContent: {  
  padding: 16,  
},  
promoTitle: {  
  fontSize: 16,  
  fontWeight: "700",  
  color: "#fff",  
  marginBottom: 6,  
  lineHeight: 22,  
},  
promoDiscount: {  
  fontSize: 14,  
  fontWeight: "600",  
  color: "#fff",  
  marginBottom: 12,  
},  
promoDetails: {  
  flexDirection: "row",  
  alignItems: "center",  
},  
promoDetailText: {  
  fontSize: 12,  
  color: "#fff",  
  marginLeft: 4,  
  marginRight: 8,  
  opacity: 0.9,
},  
  
// Cards de persona PIXEL PERFECT  
personCard: {  
  width: 200,  
  marginRight: 16,  
  backgroundColor: "#f8f9fa",  
  borderRadius: 16,  
  shadowColor: "#000",  
  shadowOffset: { width: 0, height: 2 },  
  shadowOpacity: 0.08,  
  shadowRadius: 4,  
  elevation: 2,  
  position: "relative",  
},  
dismissBtn: {  
  position: "absolute",  
  top: 8,  
  right: 8,  
  zIndex: 1,  
  padding: 4,  
  backgroundColor: "rgba(255,255,255,0.8)",  
  borderRadius: 12,  
},  
personCardContent: {  
  alignItems: "center",  
  padding: 16,  
},  
personAvatar: {  
  width: 60,  
  height: 60,  
  borderRadius: 30,  
  marginBottom: 12,  
  backgroundColor: "#f0f0f0",  
},  
personName: {  
  fontSize: 14,  
  fontWeight: "600",  
  color: "#111",  
  textAlign: "center",  
  marginBottom: 4,  
},  
personRole: {  
  fontSize: 12,  
  color: "#666",  
  textAlign: "center",  
  marginBottom: 8,  
},  
interestChip: {  
  backgroundColor: "#f0f7ff",  
  paddingVertical: 4,  
  paddingHorizontal: 8,  
  borderRadius: 12,  
  marginBottom: 12,  
  borderWidth: 1,  
  borderColor: "#e3f2fd",  
},  
interestText: {  
  fontSize: 11,  
  color: "#2673f3",  
  fontWeight: "500",  
},  
connectBtn: {  
  backgroundColor: "#2673f3",  
  paddingVertical: 8,  
  paddingHorizontal: 20,  
  borderRadius: 20,  
  shadowColor: "#2673f3",  
  shadowOffset: { width: 0, height: 2 },  
  shadowOpacity: 0.2,  
  shadowRadius: 3,  
  elevation: 2,  
},  
connectText: {  
  color: "#fff",  
  fontWeight: "600",  
  fontSize: 13,  
},  
  
// Cards de comunidad PIXEL PERFECT  
communityCard: {  
  flexDirection: "row",  
  alignItems: "center",  
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
communityBanner: {  
  width: 100,  
  height: 60,  
  borderRadius: 8,  
    backgroundColor: "#f0f0f0",  
    marginRight: 16,  
  },  
  communityContent: {  
    flex: 1,  
  },  
  communityName: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111",  
    marginBottom: 4,  
  },  
  communityMeta: {  
    fontSize: 13,  
    color: "#666",  
  },  
  joinBtn: {  
    backgroundColor: "#f0f7ff",  
    paddingVertical: 8,  
    paddingHorizontal: 16,  
    borderRadius: 20,  
    borderWidth: 1,  
    borderColor: "#e3f2fd",  
  },  
  joinText: {  
    color: "#2673f3",  
    fontWeight: "600",  
    fontSize: 13,  
  },  
    
  // Filtros de posts  
  postFiltersContainer: {  
    flexDirection: "row",  
    gap: 8,  
    marginBottom: 16,  
  },  
  postFilterChip: {  
    paddingVertical: 6,  
    paddingHorizontal: 12,  
    borderRadius: 16,  
    borderWidth: 1,  
    borderColor: "#e9ecef",  
    backgroundColor: "#fff",  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 1 },  
    shadowOpacity: 0.03,  
    shadowRadius: 1,  
    elevation: 1,  
  },  
  postFilterChipSelected: {  
    backgroundColor: "#2673f3",  
    borderColor: "#2673f3",  
  },  
  postFilterText: {  
    fontSize: 12,  
    color: "#666",  
    fontWeight: "500",  
  },  
  postFilterTextSelected: {  
    color: "#fff",  
    fontWeight: "600",  
  },  
    
  // Post Card PIXEL PERFECT  
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
    backgroundColor: "#f0f0f0",  
  },  
  postAuthorInfo: {  
    flex: 1,  
  },  
  postAuthor: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#111",  
    marginBottom: 2,  
  },  
  postRole: {  
    fontSize: 12,  
    color: "#666",  
    marginBottom: 2,  
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
    marginBottom: 12,  
    lineHeight: 20,  
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
  metricsRow: {  
    flexDirection: "row",  
    justifyContent: "space-between",  
    marginBottom: 12,  
    paddingHorizontal: 4,  
  },  
  metricText: {  
    fontSize: 12,  
    color: "#666",  
  },  
  actionsRow: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    borderTopWidth: 1,  
    borderTopColor: "#f0f0f0",  
    paddingTop: 12,  
  },  
  actionBtn: {  
    alignItems: "center",  
    flex: 1,  
    flexDirection: "row",  
    justifyContent: "center",  
    gap: 6,  
    paddingVertical: 8,  
  },  
  actionText: {  
    fontSize: 13,  
    fontWeight: "500",  
    color: "#666",  
  },  
    
  // Navbar PIXEL PERFECT  
  bottomNavigation: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    alignItems: "center",  
    paddingVertical: 12,  
    borderTopWidth: 1,  
    borderTopColor: "#f0f0f0",  
    backgroundColor: "#fff",  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: -2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 3,  
    elevation: 5,  
  },  
  navItem: {  
    flex: 1,  
    alignItems: "center",  
    paddingVertical: 8,  
  },  
  fabContainer: {  
    alignItems: "center",  
    justifyContent: "center",  
    marginTop: -25,  
  },  
  fab: {  
    backgroundColor: "#2673f3",  
    borderRadius: 30,  
    width: 60,  
    height: 60,  
    alignItems: "center",  
    justifyContent: "center",  
    shadowColor: "#2673f3",  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.3,  
    shadowRadius: 8,  
    elevation: 8,  
    borderWidth: 4,  
    borderColor: "#fff",  
  },  
    
  // Loading overlay  
  loadingOverlay: {  
    position: "absolute",  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: "rgba(255, 255, 255, 0.8)",  
    justifyContent: "center",  
    alignItems: "center",  
  },  
})