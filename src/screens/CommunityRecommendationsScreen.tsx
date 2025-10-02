"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import { useTranslation } from "react-i18next"
import { Lock, Unlock, X, Users } from "lucide-react-native"
import { 
  joinCommunity, 
  getCurrentUser, 
  getCommunityDetailsComplete, 
  getSuggestedPeople, 
  followUserNew, 
  getRecommendedCommunitiesByGoals 
} from "../rest/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

type Community = {
  id: string
  name: string
  description?: string
  image_url?: string
  cover_image_url?: string
  member_count?: number
  post_count?: number
  is_public?: boolean
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
  const [communities, setCommunities] = useState<Community[]>([])
  const [joined, setJoined] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([])
  const [followedPeople, setFollowedPeople] = useState<string[]>([])
  const [dismissedPeople, setDismissedPeople] = useState<string[]>([])

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      
      if (!user?.id) {
        console.error('❌ No user found')
        setLoading(false)
        return
      }

      console.log('👤 Usuario actual:', user.id)
      
      // 🎯 BACKEND-DRIVEN: Usar algoritmo de recomendaciones por metas
      const [recommendedByGoals, suggestedPeopleData] = await Promise.all([
        getRecommendedCommunitiesByGoals(user.id, 6),
        getSuggestedPeople(user.id, 6)
      ])
      
      console.log('🎯 Comunidades recomendadas por algoritmo:', recommendedByGoals?.length || 0)
      
      let finalCommunities: Community[] = []
      
      if (recommendedByGoals && recommendedByGoals.length > 0) {
        // Obtener detalles completos de cada comunidad
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
              
              // Fallback si no hay detalles
              return {
                id: communityId,
                name: community.community_name || 'Comunidad',
                description: community.community_description || '',
                image_url: null,
                cover_image_url: null,
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
      
      // Si no hay comunidades del algoritmo, usar datos mock
      if (finalCommunities.length === 0) {
        console.log('⚠️ No hay comunidades del algoritmo, usando mock data')
        finalCommunities = [
          {
            id: 'mock-1',
            name: 'Inversiones para principiantes',
            description: 'Aprende los fundamentos de las inversiones',
            image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
            cover_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
            member_count: 12000,
            is_public: true
          },
          {
            id: 'mock-2',
            name: 'Criptomonedas para principiantes',
            description: 'Todo sobre Bitcoin y criptomonedas',
            image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop',
            cover_image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop',
            member_count: 2000,
            is_public: true
          }
        ]
      }
      
      // Procesar personas sugeridas
      let finalPeople: SuggestedPerson[] = []
      
      if (suggestedPeopleData && suggestedPeopleData.length > 0) {
        finalPeople = suggestedPeopleData.slice(0, 4).map((person: any) => ({
          id: person.id || person.user_id,
          name: person.name || person.nombre || 'Usuario',
          avatar_url: person.avatar_url || 'https://i.pravatar.cc/100',
          profession: person.profession || person.bio || 'Inversionista',
          expertise_areas: person.expertise_areas || ['Inversiones'],
          mutual_connections: person.mutual_connections || 0,
          compatibility_score: person.compatibility_score || 75,
          reason: person.reason || 'Intereses similares'
        }))
      } else {
        // Mock data para personas
        finalPeople = [
          {
            id: 'person-1',
            name: 'Jorge Méndez',
            avatar_url: 'https://i.pravatar.cc/100?img=1',
            profession: 'Mercadólogo y financista',
            expertise_areas: ['Inversiones para principiantes'],
            mutual_connections: 5,
            compatibility_score: 85,
            reason: 'Intereses similares'
          },
          {
            id: 'person-2',
            name: 'Claudio Eslava',
            avatar_url: 'https://i.pravatar.cc/100?img=2',
            profession: 'Financiero',
            expertise_areas: ['Inversiones para principiantes'],
            mutual_connections: 3,
            compatibility_score: 78,
            reason: 'Conexiones mutuas'
          }
        ]
      }
      
      setCommunities(finalCommunities)
      setSuggestedPeople(finalPeople)
      
    } catch (error) {
      console.error('❌ Error cargando comunidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (id: string) => {
    try {
      const user = await getCurrentUser()
      if (user?.id) {
        await joinCommunity(user.id, id)
        setJoined((prev) => [...prev, id])
      }
    } catch (error) {
      console.error('Error joining community:', error)
    }
  }

  const handleFollowPerson = async (personId: string) => {
    try {
      const user = await getCurrentUser()
      if (user?.id) {
        await followUserNew(user.id, personId, 'suggestions')
        setFollowedPeople((prev) => [...prev, personId])
      }
    } catch (error) {
      console.error('Error following person:', error)
    }
  }

  const handleDismissPerson = (personId: string) => {
    setDismissedPeople((prev) => [...prev, personId])
  }

  const handleFinish = async () => {
    await AsyncStorage.setItem("@communities_complete", "true")
    if (route.params?.onComplete) {
      route.params.onComplete()
    } else {
      navigation.reset({ index: 0, routes: [{ name: "HomeFeed" }] })
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const visiblePeople = suggestedPeople.filter(p => !dismissedPeople.includes(p.id))

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunidades recomendadas</Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Aquí tienes comunidades recomendadas según tus intereses
        </Text>

        {/* Communities */}
        <View style={styles.cardsContainer}>
          {communities.map((community) => (
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
                <Text style={styles.cardName} numberOfLines={1}>
                  {community.name}
                </Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaRow}>
                    <Users size={14} color="#fff" style={styles.metaIcon} />
                    <Text style={styles.metaText}>
                      {formatMemberCount(community.member_count || 0)} miembros
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>Comunidad pública</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, joined.includes(community.id) && styles.joinedBtn]}
                  onPress={() => handleJoin(community.id)}
                  disabled={joined.includes(community.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.joinBtnText}>
                    {joined.includes(community.id) ? "✓ Unido" : "Unirse"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

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
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <Image
                    source={{ uri: person.avatar_url }}
                    style={styles.personAvatar}
                  />
                  
                  <Text style={styles.personName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.personRole} numberOfLines={1}>
                    {person.profession}
                  </Text>
                  <Text style={styles.personExpertise} numberOfLines={1}>
                    {person.expertise_areas?.[0] || 'Inversiones'}
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.connectBtn, 
                      followedPeople.includes(person.id) && styles.connectedBtn
                    ]}
                    onPress={() => handleFollowPerson(person.id)}
                    disabled={followedPeople.includes(person.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.connectBtnText}>
                      {followedPeople.includes(person.id) ? "✓ Conectado" : "Conectar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.finishBtn} 
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.finishBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const CARD_HEIGHT = 160

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f7f8fa" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'flex-start' 
  },
  backButtonText: { 
    fontSize: 28, 
    fontWeight: '300', 
    color: '#111' 
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: "600", 
    color: "#111" 
  },
  skipText: { 
    color: "#2673f3", 
    fontSize: 16, 
    fontWeight: "400" 
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
    gap: 12, 
    paddingHorizontal: 16 
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    backgroundColor: "#fff",
    marginBottom: 4,
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
    bottom: 0,
    height: CARD_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  cardName: { 
    fontSize: 17, 
    fontWeight: "700", 
    color: "#fff", 
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardMeta: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: { 
    fontSize: 12, 
    color: "#fff", 
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaDot: { 
    fontSize: 12, 
    color: "#fff", 
    marginHorizontal: 6 
  },
  joinBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#2673f3",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: "#2673f3",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  joinedBtn: { 
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  joinBtnText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 13 
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
    paddingTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  personAvatar: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    marginBottom: 10, 
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  personName: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#111", 
    textAlign: 'center', 
    marginBottom: 2 
  },
  personRole: { 
    fontSize: 12, 
    color: "#6B7280", 
    textAlign: 'center', 
    marginBottom: 4 
  },
  personExpertise: { 
    fontSize: 11, 
    color: "#2673f3", 
    marginTop: 2, 
    textAlign: 'center', 
    fontWeight: '500' 
  },
  dismissBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtn: {
    backgroundColor: "#2673f3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 12,
    alignItems: "center",
    minWidth: 90,
  },
  connectedBtn: {
    backgroundColor: "#10B981",
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
    paddingBottom: 30,
    borderTopWidth: 0,
    backgroundColor: "#fff",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  finishBtn: {
    backgroundColor: "#2673f3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2673f3",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  finishBtnText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700" 
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
})