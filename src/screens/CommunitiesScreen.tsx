// ============================================================================
// CommunitiesScreen.tsx - Lista de Comunidades (UI PROFESIONAL)
// ============================================================================
// 100% Backend Driven + Animación de Puerta Épica + Diseño Premium
// ============================================================================

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Modal,
  Alert,
  Platform,
  LinearGradient,
} from "react-native"
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient'
import { useTranslation } from "react-i18next"
import { 
  Users, 
  Search, 
  X, 
  Check, 
  Globe, 
  Lock,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Plus,
} from "lucide-react-native"
import { getCommunitiesWithDetails, joinCommunityOptimized, getUserJoinedCommunities, type CommunityListItem } from "../rest/communitiesList"
import { getCurrentUserId } from "../rest/client"
import { LanguageToggle } from "../components/LanguageToggle"
import { EmptyState } from "../components/EmptyState"
import { useAuthGuard } from "../hooks/useAuthGuard"
import { useAuth } from "../contexts/AuthContext"

const { width, height } = Dimensions.get("window")

// Usar el tipo desde el archivo API
type Community = CommunityListItem

export function CommunitiesScreen({ navigation }: any) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([])
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Door Animation States
  const [showDoorAnimation, setShowDoorAnimation] = useState(false)
  const [joiningCommunity, setJoiningCommunity] = useState<Community | null>(null)
  
  // Animations
  const doorLeftAnim = useRef(new Animated.Value(0)).current
  const doorRightAnim = useRef(new Animated.Value(0)).current
  const doorOpacityAnim = useRef(new Animated.Value(0)).current
  const doorScaleAnim = useRef(new Animated.Value(0.8)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const sparklesAnim = useRef(new Animated.Value(0)).current

  useAuthGuard()

  useEffect(() => {
    loadCommunities()
  }, [])

  useEffect(() => {
    filterCommunities()
  }, [searchQuery, communities])


  const loadCommunities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener comunidades con todos los detalles desde el backend
      const data = await getCommunitiesWithDetails()
      setCommunities(data)
      
      // Si hay usuario, cargar sus membresías
      if (user?.id) {
        const joinedIds = await getUserJoinedCommunities(user.id)
        setJoinedCommunities(joinedIds)
      }
    } catch (error: any) {
      console.error('Error loading communities:', error)
      setError(error.message || 'Error al cargar comunidades')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCommunities()
    setRefreshing(false)
  }

  const filterCommunities = () => {
    if (!searchQuery.trim()) {
      setFilteredCommunities(communities)
      return
    }
    
    const query = searchQuery.toLowerCase()
    const filtered = communities.filter(community => 
      community.name.toLowerCase().includes(query) ||
      community.description?.toLowerCase().includes(query) ||
      community.category?.toLowerCase().includes(query)
    )
    setFilteredCommunities(filtered)
  }

  // ============================================================================
  // DOOR ANIMATION - ÉPICA TIPO TEMU
  // ============================================================================

  const playDoorAnimation = () => {
    doorLeftAnim.setValue(0)
    doorRightAnim.setValue(0)
    doorOpacityAnim.setValue(0)
    doorScaleAnim.setValue(0.8)
    glowAnim.setValue(0)
    sparklesAnim.setValue(0)

    // Fase 1: Fade in y scale
    Animated.parallel([
      Animated.timing(doorOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(doorScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fase 2: Glow pulsante
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Fase 3: Abrir puertas
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(doorLeftAnim, {
            toValue: 1,
            tension: 35,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(doorRightAnim, {
            toValue: 1,
            tension: 35,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(sparklesAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start()
      }, 1000)
    })
  }

  const handleJoinCommunity = async (community: Community) => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Debes iniciar sesión para unirte a una comunidad')
        return
      }

      // Mostrar animación de puerta
      setJoiningCommunity(community)
      setShowDoorAnimation(true)
      playDoorAnimation()

      // Unirse a la comunidad
      const result = await joinCommunityOptimized(user.id, community.id)
      
      if (result) {
        setJoinedCommunities((prev) => [...prev, community.id])

        // Cerrar animación y navegar
        setTimeout(() => {
          setShowDoorAnimation(false)
          setJoiningCommunity(null)
          
          setTimeout(() => {
            navigation.navigate('CommunityDetail', { communityId: community.id })
          }, 300)
        }, 3500)
      } else {
        setShowDoorAnimation(false)
        setJoiningCommunity(null)
        Alert.alert('Error', 'No se pudo unir a la comunidad')
      }
    } catch (error: any) {
      console.error('Error joining community:', error)
      setShowDoorAnimation(false)
      setJoiningCommunity(null)
      Alert.alert('Error', error.message || 'No se pudo unir a la comunidad')
    }
  }

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const renderCommunityCard = ({ item }: { item: Community }) => {
    const isJoined = joinedCommunities.includes(item.id)
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id })}
        activeOpacity={0.95}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ 
              uri: item.cover_image_url || item.image_url || 'https://www.investiiapp.com/investi-logo-new-main.png'
            }}
            style={styles.coverImage}
          />
          <View style={styles.coverOverlay} />
          
          {/* Category Badge */}
          {item.category && (
            <View style={styles.categoryBadge}>
              <TrendingUp size={12} color="#2673f3" />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Avatar + Join Button Row */}
          <View style={styles.topRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: item.image_url || 'https://www.investiiapp.com/investi-logo-new-main.png'
                }}
                style={styles.communityAvatar}
              />
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, isJoined && styles.joinedBtn]}
              onPress={() => handleJoinCommunity(item)}
              disabled={isJoined}
              activeOpacity={0.8}
            >
              {isJoined && (
                <Check size={14} color="#fff" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.joinBtnText}>
                {isJoined ? "Ya eres parte" : "Unirse"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Community Info */}
          <View style={styles.infoSection}>
            <Text style={styles.communityName} numberOfLines={1}>
              {item.name}
            </Text>
            
            {item.description && (
              <Text style={styles.communityDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Users size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {formatMemberCount(item.member_count || 0)}
                </Text>
              </View>
              
              <View style={styles.metaDivider} />
              
              <View style={styles.metaItem}>
                {item.is_public ? (
                  <Globe size={14} color="#10B981" />
                ) : (
                  <Lock size={14} color="#F59E0B" />
                )}
                <Text style={styles.metaText}>
                  {item.is_public ? 'Pública' : 'Privada'}
                </Text>
              </View>

              {item.post_count !== undefined && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>
                      {item.post_count} posts
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* View Details Arrow */}
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>Ver detalles</Text>
            <ChevronRight size={16} color="#2673f3" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <ExpoLinearGradient
        colors={['#EEF2FF', '#E0E7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <Text style={styles.welcomeEmoji}>🌟</Text>
        <Text style={styles.sectionTitle}>Descubre Comunidades</Text>
        <Text style={styles.sectionSubtitle}>
          Únete a comunidades de inversión y finanzas
        </Text>
      </ExpoLinearGradient>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("communities.title")}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando comunidades...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("communities.title")}</Text>
          <LanguageToggle />
        </View>
        <EmptyState
          title="Error al cargar comunidades"
          message={error}
          onRetry={loadCommunities}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con Gradiente */}
      <ExpoLinearGradient
        colors={['#2563EB', '#1D4ED8', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{t("communities.title")}</Text>
              <Text style={styles.headerSubtitle}>
                {filteredCommunities.length} {filteredCommunities.length === 1 ? 'comunidad disponible' : 'comunidades disponibles'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateCommunity')}
            style={styles.createButton}
            activeOpacity={0.7}
          >
            <ExpoLinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createButtonGradient}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={3} />
            </ExpoLinearGradient>
          </TouchableOpacity>
        </View>
      </ExpoLinearGradient>

      {/* Communities List */}
      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2673f3"
            colors={['#2673f3']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No hay comunidades</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No se encontraron resultados' : 'Aún no hay comunidades disponibles'}
            </Text>
          </View>
        }
      />

      {/* Door Animation Modal */}
      <Modal
        visible={showDoorAnimation}
        transparent
        animationType="none"
      >
        <View style={styles.doorModalContainer}>
          <Animated.View 
            style={[
              styles.doorAnimationContainer,
              {
                opacity: doorOpacityAnim,
                transform: [{ scale: doorScaleAnim }]
              }
            ]}
          >
            {/* Glow effect */}
            <Animated.View 
              style={[
                styles.doorGlow,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0.9]
                  }),
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })
                  }]
                }
              ]}
            />

            {/* Sparkles */}
            <Animated.View 
              style={[
                styles.sparklesContainer,
                { opacity: sparklesAnim }
              ]}
            >
              {[...Array(8)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.sparkle,
                    {
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }
                  ]} 
                />
              ))}
            </Animated.View>

            {/* Door Left */}
            <Animated.View 
              style={[
                styles.doorLeft,
                {
                  transform: [{
                    translateX: doorLeftAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -width * 0.45]
                    })
                  }, {
                    rotateY: doorLeftAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-15deg']
                    })
                  }]
                }
              ]}
            >
              <View style={styles.doorPanel}>
                <View style={styles.doorDecoration} />
                <View style={styles.doorHandle} />
              </View>
            </Animated.View>

            {/* Door Right */}
            <Animated.View 
              style={[
                styles.doorRight,
                {
                  transform: [{
                    translateX: doorRightAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width * 0.45]
                    })
                  }, {
                    rotateY: doorRightAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '15deg']
                    })
                  }]
                }
              ]}
            >
              <View style={styles.doorPanel}>
                <View style={styles.doorDecoration} />
                <View style={[styles.doorHandle, { right: 20, left: undefined }]} />
              </View>
            </Animated.View>

            {/* Community Info */}
            {joiningCommunity && (
              <Animated.View 
                style={[
                  styles.doorCommunityInfo,
                  { opacity: sparklesAnim }
                ]}
              >
                <View style={styles.communityAvatarGlow}>
                  <Image
                    source={{ uri: joiningCommunity.image_url || 'https://www.investiiapp.com/investi-logo-new-main.png' }}
                    style={styles.doorCommunityAvatar}
                  />
                </View>
                <Text style={styles.doorCommunityName}>{joiningCommunity.name}</Text>
                <Text style={styles.doorWelcomeText}>¡Bienvenido a la comunidad!</Text>
                <View style={styles.doorCheckmark}>
                  <Check size={32} color="#fff" strokeWidth={3} />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E40AF',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#4338CA',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  coverContainer: {
    position: 'relative',
    height: 160,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#1e3a8a',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    marginTop: -36,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  communityAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  joinedBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  infoSection: {
    marginBottom: 12,
  },
  communityName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  communityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ============================================================================
  // DOOR ANIMATION STYLES
  // ============================================================================
  
  doorModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorAnimationContainer: {
    width: width * 0.9,
    height: height * 0.7,
    position: 'relative',
  },
  doorGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 350,
    height: 350,
    marginLeft: -175,
    marginTop: -175,
    borderRadius: 175,
    backgroundColor: '#2673f3',
    shadowColor: '#2673f3',
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 20,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  doorLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  doorRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  doorPanel: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderWidth: 4,
    borderColor: '#654321',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  doorDecoration: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    height: '40%',
    borderWidth: 3,
    borderColor: '#654321',
    borderRadius: 8,
  },
  doorHandle: {
    position: 'absolute',
    left: 20,
    top: '50%',
    width: 50,
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    marginTop: -8,
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  doorCommunityInfo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -120,
    marginTop: -120,
    width: 240,
    alignItems: 'center',
    zIndex: 10,
  },
  communityAvatarGlow: {
    padding: 8,
    borderRadius: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  doorCommunityAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  doorCommunityName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  doorWelcomeText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  doorCheckmark: {
    marginTop: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
})