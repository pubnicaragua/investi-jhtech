"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  Modal,
} from "react-native"
import { useTranslation } from "react-i18next"
import { X, Users, Check, ChevronLeft, Lock, Unlock, School, UserPlus } from "lucide-react-native"
import { 
  joinCommunity, 
  getCommunityDetailsComplete, 
  getSuggestedPeople, 
  followUserNew, 
  getRecommendedCommunitiesByGoals 
} from "../rest/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../supabase"

const { width, height } = Dimensions.get("window")

type Community = {
  id: string
  name: string
  description?: string
  image_url?: string
  cover_image_url?: string
  member_count?: number
  post_count?: number
  is_public?: boolean
  tipo?: string
}

type SuggestedPerson = {
  id: string
  name: string
  avatar_url: string
  profession: string
  expertise_areas: string[]
  mutual_connections: number
  compatibility_score: number
  reason: string
}

export function CommunityRecommendationsScreen({ navigation, route }: any) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [joined, setJoined] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([])
  const [followedPeople, setFollowedPeople] = useState<string[]>([])
  const [dismissedPeople, setDismissedPeople] = useState<string[]>([])
  const [showDoorAnimation, setShowDoorAnimation] = useState(false)
  const [joiningCommunity, setJoiningCommunity] = useState<Community | null>(null)
  
  // Animaciones para la puerta épica
  const doorLeftAnim = useRef(new Animated.Value(0)).current
  const doorRightAnim = useRef(new Animated.Value(0)).current
  const doorOpacityAnim = useRef(new Animated.Value(0)).current
  const doorScaleAnim = useRef(new Animated.Value(0.8)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const sparklesAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      setLoading(true)
      
      if (!user?.id) {
        console.error('❌ No user found in AuthContext')
        setLoading(false)
        return
      }

      console.log('👤 Usuario actual:', user.id)
      
      // Obtener comunidades y personas recomendadas
      let recommendedByGoals: any[] = []
      let suggestedPeopleData: any[] = []
      
      try {
        // Usar función definitiva de personas
        suggestedPeopleData = await getSuggestedPeople(user.id, 10)
        console.log('✅ Personas sugeridas:', suggestedPeopleData?.length || 0)
      } catch (peopleError) {
        console.error('❌ Error obteniendo personas:', peopleError)
      }
      
      try {
        // Obtener comunidades recomendadas
        const { data: commData, error: commError } = await supabase
          .rpc('get_recommended_communities', { user_id_param: user.id, limit_param: 10 })
        
        if (commError) {
          console.error('Error getting recommended communities:', commError)
          // Fallback
          recommendedByGoals = await getRecommendedCommunitiesByGoals(user.id, 6)
        } else {
          recommendedByGoals = commData || []
        }
      } catch (commError) {
        console.error('❌ Error obteniendo comunidades:', commError)
        recommendedByGoals = await getRecommendedCommunitiesByGoals(user.id, 6)
      }
      
      console.log('🎯 Comunidades recomendadas:', recommendedByGoals?.length || 0)
      console.log('👥 Personas sugeridas:', suggestedPeopleData?.length || 0)
      
      let finalCommunities: Community[] = []
      
      if (recommendedByGoals && recommendedByGoals.length > 0) {
        const communitiesWithDetails = await Promise.all(
          recommendedByGoals.slice(0, 4).map(async (community: any) => {
            try {
              const communityId = community.community_id || community.id
              const details = await getCommunityDetailsComplete(communityId)
              
              if (details) {
                return {
                  id: details.id,
                  name: details.name,
                  description: details.description,
                  image_url: details.image_url,
                  cover_image_url: details.cover_image_url || details.image_url,
                  member_count: details.member_count || 0,
                  is_public: details.is_public !== false,
                }
              }
              
              return {
                id: communityId,
                name: community.community_name || 'Comunidad',
                description: community.community_description || '',
                image_url: community.community_avatar_url,
                cover_image_url: community.community_avatar_url,
                member_count: community.members_count || 0,
                is_public: true,
              }
            } catch (error) {
              console.error('Error obteniendo detalles de comunidad:', error)
              return null
            }
          })
        )
        
        finalCommunities = communitiesWithDetails.filter(c => c !== null) as Community[]
      }
      
      let finalPeople: SuggestedPerson[] = []
      
      if (suggestedPeopleData && suggestedPeopleData.length > 0) {
        finalPeople = suggestedPeopleData.slice(0, 4).map((person: any) => ({
          id: person.id || person.user_id,
          name: person.full_name || person.name || person.nombre || person.username || 'Usuario',
          avatar_url: person.avatar_url || person.photo_url || 'https://i.pravatar.cc/100',
          profession: person.profession || person.role || person.bio || 'Inversionista',
          expertise_areas: person.expertise_areas || person.interests || ['Inversiones para principiantes'],
          mutual_connections: person.mutual_connections || 0,
          compatibility_score: person.compatibility_score || 75,
          reason: person.reason || 'Intereses similares'
        }))
      } else {
        // NO usar datos mock, dejar vacío si no hay personas reales
        finalPeople = []
        console.log('⚠️ No hay personas sugeridas disponibles')
      }
      
      setCommunities(finalCommunities)
      setSuggestedPeople(finalPeople)
      
    } catch (error) {
      console.error('❌ Error cargando comunidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const playDoorAnimation = () => {
    // Reset animations
    doorLeftAnim.setValue(0)
    doorRightAnim.setValue(0)
    doorOpacityAnim.setValue(0)
    doorScaleAnim.setValue(0.8)
    glowAnim.setValue(0)
    sparklesAnim.setValue(0)

    // Fase 1: Fade in y scale (0-500ms)
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
      // Fase 2: Glow pulsante (500-1500ms)
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

      // Fase 3: Abrir puertas (1000-2500ms)
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
          // Sparkles
          Animated.timing(sparklesAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start()
      }, 1000)
    })
  }

  const handleJoin = async (community: Community) => {
    try {
      console.log('🔵 [handleJoin] INICIO - Intentando unirse a comunidad:', {
        communityId: community.id,
        communityName: community.name
      })

      console.log('🔵 [handleJoin] Usuario obtenido:', {
        userId: user?.id,
        userName: user?.name || user?.username
      })

      if (user?.id) {
        // TODO: Animación de puerta desactivada temporalmente
        // Descomentar cuando se requiera activar la animación
        /*
        setJoiningCommunity(community)
        setShowDoorAnimation(true)
        playDoorAnimation()
        */

        console.log('🔵 [handleJoin] Llamando a joinCommunity API...')
        
        // ✅ Unirse a la comunidad y VALIDAR resultado
        const result = await joinCommunity(user.id, community.id)
        
        console.log('🔵 [handleJoin] Resultado de joinCommunity:', {
          result: result,
          resultType: typeof result,
          isNull: result === null,
          isUndefined: result === undefined,
          isFalsy: !result
        })
        
        // ✅ Verificar que realmente se guardó
        if (result) {
          console.log('✅ [handleJoin] Usuario unido exitosamente a la comunidad:', community.id)
          setJoined((prev) => [...prev, community.id])

          // Navegar directamente sin animación
          console.log('🔵 [handleJoin] Navegando a CommunityDetail...')
          navigation.navigate('CommunityDetail', { communityId: community.id })
          
          /* TODO: Código de animación comentado
          // Cerrar animación y navegar después de 3.5 segundos
          setTimeout(() => {
            setShowDoorAnimation(false)
            setJoiningCommunity(null)
            
            // Navegar a detalle
            setTimeout(() => {
              console.log('🔵 [handleJoin] Navegando a CommunityDetail...')
              navigation.navigate('CommunityDetail', { communityId: community.id })
            }, 300)
          }, 3500)
          */
        } else {
          // ❌ Error: no se pudo unir
          console.error('❌ [handleJoin] Error: No se pudo unir a la comunidad - resultado es falsy:', result)
          setShowDoorAnimation(false)
          setJoiningCommunity(null)
        }
      } else {
        console.error('❌ [handleJoin] Error: No hay usuario logueado')
      }
    } catch (error: any) {
      console.error('❌ [handleJoin] EXCEPCIÓN capturada:', {
        error: error,
        message: error?.message,
        stack: error?.stack
      })
      setShowDoorAnimation(false)
      setJoiningCommunity(null)
    }
  }

  const handleFollowPerson = async (personId: string) => {
    try {
      if (user?.id) {
        const result = await followUserNew(user.id, personId, 'suggestions')
        // Si result es null, significa que ya lo seguía (error 23505)
        // De todas formas, agregarlo a followedPeople para actualizar UI
        setFollowedPeople((prev) => [...prev, personId])
      }
    } catch (error: any) {
      // Solo mostrar error si NO es el error de "ya siguiendo"
      if (error?.code !== '23505') {
        console.error('Error following person:', error)
      }
    }
  }
  const handleDismissPerson = (personId: string) => {
    setDismissedPeople((prev) => [...prev, personId])
  }

  const handleFinish = async () => {
    try {
      console.log('[CommunityRecommendations] Finishing onboarding');
      await AsyncStorage.setItem("onboarding_complete", "true");
      await AsyncStorage.setItem("communities_complete", "true");

      // CRÍTICO: Actualizar onboarding_step en la base de datos
      const userId = await AsyncStorage.getItem('userId')
      if (userId) {
        console.log('✅ Actualizando onboarding_step a completed en DB')
        const { error } = await supabase
          .from('users')
          .update({ onboarding_step: 'completed' })
          .eq('id', userId)
        
        if (error) {
          console.error('❌ Error actualizando onboarding_step:', error)
        } else {
          console.log('✅ Onboarding completado en DB')
        }
      }

      if (route.params?.onComplete) {
        console.log('[CommunityRecommendations] Calling onComplete callback');
        route.params.onComplete();
      } else {
        console.warn('[CommunityRecommendations] No onComplete callback, navigating to HomeFeed');
        // Si no hay callback, intentar navegar directamente
        // @ts-ignore
        navigation.navigate('HomeFeed');
      }
    } catch (error) {
      console.error('[CommunityRecommendations] Error finishing:', error);
    }
  }

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const visiblePeople = suggestedPeople.filter(p => !dismissedPeople.includes(p.id))

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#111" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunidades recomendadas</Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.subtitle}>
          Aquí tienes comunidades recomendadas según tus intereses
        </Text>

        {/* Communities */}
        {communities.length > 0 ? (
          <View style={styles.cardsContainer}>
            {communities.map((community) => {
              const isJoined = joined.includes(community.id)
              
              return (
                <View key={community.id} style={styles.card}>
                  <Image
                    source={{ 
                      uri: community.cover_image_url || community.image_url || "https://via.placeholder.com/400x160/1e3a8a/ffffff?text=Investi" 
                    }}
                    style={styles.cardImage}
                    defaultSource={require('../../assets/assets_logo.png')}
                  />
                  
                  <View style={styles.cardOverlay} />
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <View style={styles.communityAvatarContainer}>
                        <Image
                          source={{ 
                            uri: community.image_url || community.cover_image_url || "https://via.placeholder.com/60/2673f3/ffffff?text=C" 
                          }}
                          style={styles.communityAvatar}
                        />
                      </View>
                      
                      <TouchableOpacity
                        style={[styles.joinBtn, isJoined && styles.joinedBtn]}
                        onPress={() => handleJoin(community)}
                        disabled={isJoined}
                        activeOpacity={0.8}
                      >
                        {isJoined ? (
                          <Check size={14} color="#fff" style={{ marginRight: 6 }} />
                        ) : (
                          <UserPlus size={14} color="#fff" style={{ marginRight: 6 }} />
                        )}
                        <Text style={styles.joinBtnText}>
                          {isJoined ? "Ya eres parte" : "Unirse"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {community.name}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Users size={14} color="#666" style={styles.metaIcon} />
                      <Text style={styles.metaText}>
                        {formatMemberCount(community.member_count || 0)} miembros
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      {community.tipo === 'school' ? (
                        <>
                          <School size={14} color="#666" style={styles.metaIcon} />
                          <Text style={styles.metaText}>Colegio</Text>
                        </>
                      ) : community.tipo === 'private' ? (
                        <>
                          <Lock size={14} color="#666" style={styles.metaIcon} />
                          <Text style={styles.metaText}>Privada</Text>
                        </>
                      ) : (
                        <>
                          <Unlock size={14} color="#666" style={styles.metaIcon} />
                          <Text style={styles.metaText}>Pública</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay comunidades disponibles en este momento</Text>
            <Text style={styles.emptySubtext}>Completa tu perfil para obtener mejores recomendaciones</Text>
          </View>
        )}

        {/* People Section */}
        {visiblePeople.length > 0 && (
          <View style={styles.peopleSection}>
            <Text style={styles.peopleTitle}>Personas que podrías conocer</Text>
            <Text style={styles.peopleSubtitle}>
              También te puede interesar seguir a estas personas basado en tus preferencias
            </Text>

            <View style={styles.peopleGrid}>
              {visiblePeople.map((person) => (
                <View key={person.id} style={styles.personCard}>
                  <TouchableOpacity 
                    style={styles.dismissBtn}
                    onPress={() => handleDismissPerson(person.id)}
                    activeOpacity={0.7}
                  >
                    <X size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                  
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarGradient} />
                    <Image
                      source={{ uri: person.avatar_url }}
                      style={styles.personAvatar}
                    />
                  </View>
                  
                  <Text style={styles.personName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.personRole} numberOfLines={2}>
                    {person.profession}
                  </Text>
                  
                  <View style={styles.expertiseBadge}>
                    <View style={styles.expertiseIcon}>
                      <Users size={10} color="#2673f3" />
                    </View>
                    <Text style={styles.personExpertise} numberOfLines={1}>
                      {person.expertise_areas?.[0] || 'Inversiones'}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.connectBtn, 
                      followedPeople.includes(person.id) && styles.connectedBtn
                    ]}
                    onPress={() => handleFollowPerson(person.id)}
                    disabled={followedPeople.includes(person.id)}
                    activeOpacity={0.8}
                  >
                    {followedPeople.includes(person.id) ? (
                      <Check size={14} color="#fff" style={{ marginRight: 4 }} />
                    ) : (
                      <UserPlus size={14} color="#fff" style={{ marginRight: 4 }} />
                    )}
                    <Text style={styles.connectBtnText}>
                      {followedPeople.includes(person.id) ? "Conectado" : "Conectar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.finishBtn} 
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.finishBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      {/* Door Animation Modal - ÉPICA TIPO TEMU */}
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
            {/* Glow effect pulsante */}
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
                {
                  opacity: sparklesAnim
                }
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
                <View style={[styles.doorHandle, { right: 20, left: 'auto' }]} />
              </View>
            </Animated.View>

            {/* Community Info */}
            {joiningCommunity && (
              <Animated.View 
                style={[
                  styles.doorCommunityInfo,
                  {
                    opacity: sparklesAnim
                  }
                ]}
              >
                <View style={styles.communityAvatarGlow}>
                  <Image
                    source={{ uri: joiningCommunity.image_url || 'https://via.placeholder.com/80' }}
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

const CARD_HEIGHT = 120

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f7f8fa" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: "700", 
    color: "#111" 
  },
  skipText: { 
    color: "#2673f3", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  scrollContent: {
    paddingBottom: 100,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    marginTop: 12,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  cardsContainer: { 
    gap: 16, 
    paddingHorizontal: 16 
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  cardImage: { 
    width: "100%", 
    height: CARD_HEIGHT, 
    resizeMode: "cover",
    backgroundColor: '#1e3a8a'
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: CARD_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardContent: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 16,
    bottom: 16,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  communityAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  communityAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  cardInfo: {
    padding: 16,
    paddingTop: 12,
  },
  cardName: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#111", 
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: { 
    fontSize: 12, 
    color: "#666", 
    fontWeight: '500',
  },
  metaDot: { 
    fontSize: 12, 
    color: "#666", 
    marginHorizontal: 6 
  },
  joinBtn: {
    backgroundColor: "#2673f3",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: "#2673f3",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedBtn: { 
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  joinBtnText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 14,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  peopleSection: { 
    marginTop: 32, 
    paddingHorizontal: 16, 
    paddingBottom: 20 
  },
  peopleTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    textAlign: "center", 
    marginBottom: 8, 
    color: '#111' 
  },
  peopleSubtitle: { 
    fontSize: 14, 
    color: "#666", 
    textAlign: "center", 
    marginBottom: 24, 
    lineHeight: 20, 
    paddingHorizontal: 8 
  },
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  personCard: { 
    width: (width - 48) / 2, 
    alignItems: "center", 
    marginBottom: 16, 
    position: 'relative',
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
  },
  personAvatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#e5e7eb',
    borderWidth: 4,
    borderColor: '#fff',
  },
  personName: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#111", 
    textAlign: 'center', 
    marginBottom: 4 
  },
  personRole: { 
    fontSize: 12, 
    color: "#6B7280", 
    textAlign: 'center', 
    marginBottom: 10,
    lineHeight: 16,
    minHeight: 32,
  },
  expertiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  expertiseIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personExpertise: { 
    fontSize: 11, 
    color: "#2673f3", 
    fontWeight: '700',
    maxWidth: 90,
  },
  dismissBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  connectBtn: {
    backgroundColor: "#2673f3",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: "center",
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: "#2673f3",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  connectedBtn: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  connectBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 0,
    backgroundColor: "#fff",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  finishBtn: {
    backgroundColor: "#2673f3",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2673f3",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  finishBtnText: { 
    color: "#fff", 
    fontSize: 17, 
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  // Door Animation Styles - ÉPICA TIPO TEMU
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