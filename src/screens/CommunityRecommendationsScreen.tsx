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
import { ArrowLeft, Lock, Unlock, DoorOpen, X, Users, TrendingUp } from "lucide-react-native"
import { listCommunities, joinCommunity, getCurrentUser, getCommunityDetailsComplete, getSuggestedPeople, followUserNew } from "../rest/api"
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
  const [doorAnimation] = useState(new Animated.Value(0))

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      const user = await getCurrentUser()
      const [allCommunities, suggestedPeopleData] = await Promise.all([
        listCommunities(),
        user?.id ? getSuggestedPeople(user.id, 4) : []
      ])
      
      let recommendedCommunities = allCommunities
      
      if (user?.intereses && user.intereses.length > 0) {
        // Filtrar comunidades basadas en intereses del usuario
        const userInterests = user.intereses
        recommendedCommunities = allCommunities.filter((community: any) => {
          const communityName = community.name.toLowerCase()
          return userInterests.some((interest: any) => 
            communityName.includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(communityName.split(' ')[0])
          )
        })
        
        // Si no hay suficientes comunidades filtradas, agregar algunas generales
        if (recommendedCommunities.length < 3) {
          const remaining = allCommunities.filter((c: any) => 
            !recommendedCommunities.find((rc: any) => rc.id === c.id)
          ).slice(0, 4 - recommendedCommunities.length)
          recommendedCommunities = [...recommendedCommunities, ...remaining]
        }
      }
      
      // Obtener detalles completos de las comunidades recomendadas
      const communitiesWithDetails = await Promise.all(
        recommendedCommunities.slice(0, 4).map(async (community: any) => {
          const details = await getCommunityDetailsComplete(community.id)
          return details || community
        })
      )
      
      // Add mock data if no communities found
      const finalCommunities = communitiesWithDetails.length > 0 ? communitiesWithDetails : [
        {
          id: '1',
          name: 'Inversiones para principiantes',
          description: 'Aprende los fundamentos de las inversiones',
          image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
          member_count: 12,
          is_public: true
        },
        {
          id: '2', 
          name: 'Criptomonedas para principiantes',
          description: 'Todo sobre Bitcoin y criptomonedas',
          image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop',
          member_count: 2,
          is_public: false
        }
      ]
      
      const finalPeople = suggestedPeopleData?.length > 0 ? suggestedPeopleData : [
        {
          id: '1',
          name: 'Jorge Méndez',
          avatar_url: 'https://i.pravatar.cc/100?img=1',
          profession: 'Mercadólogo y financista',
          expertise_areas: ['Inversiones para principiantes'],
          mutual_connections: 5,
          compatibility_score: 85,
          reason: 'Intereses similares'
        },
        {
          id: '2',
          name: 'Claudio Eslava',
          avatar_url: 'https://i.pravatar.cc/100?img=2', 
          profession: 'Financiero',
          expertise_areas: ['Inversiones para principiantes'],
          mutual_connections: 3,
          compatibility_score: 78,
          reason: 'Conexiones mutuas'
        }
      ]
      
      setCommunities(finalCommunities)
      setSuggestedPeople(finalPeople)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (id: string) => {
    try {
      const user = await getCurrentUser()
      if (user?.id) {
        // Animate door opening
        Animated.sequence([
          Animated.timing(doorAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(doorAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start()
        
        await joinCommunity(user.id, id)
        setJoined((prev) => [...prev, id])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleFollowPerson = async (personId: string) => {
    try {
      const user = await getCurrentUser()
      if (user?.id) {
        await followUserNew(user.id, personId, 'suggestions')
        setFollowedPeople((prev) => [...prev, personId])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleFinish = async () => {
    await AsyncStorage.setItem("@communities_complete", "true")
    if (route.params?.onComplete) {
      route.params.onComplete()
    } else {
      navigation.reset({ index: 0, routes: [{ name: "HomeFeed" }] })
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunidades recomendadas</Text>
        <TouchableOpacity>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Aquí tienes comunidades recomendadas según tus intereses</Text>

        {/* Communities */}
        <View style={styles.cardsContainer}>
          {communities.map((c) => (
            <View key={c.id} style={styles.card}>
              <Image
                source={{ uri: c.cover_image_url || c.image_url || "https://www.investiiapp.com/investi-logo-new-main.png" }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{c.name}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{c.member_count || 12}k miembros</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>Comunidad pública</Text>
                  </View>
                  <View style={styles.lockIcon}>
                    {c.is_public ? (
                      <Unlock size={16} color="#fff" />
                    ) : (
                      <Lock size={16} color="#fff" />
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, joined.includes(c.id) && styles.joined]}
                  onPress={() => handleJoin(c.id)}
                  disabled={joined.includes(c.id)}
                >
                  <View style={styles.joinBtnContent}>
                    {!joined.includes(c.id) && (
                      <Animated.View style={{
                        transform: [{
                          rotateY: doorAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '90deg']
                          })
                        }]
                      }}>
                        <DoorOpen size={14} color="#fff" />
                      </Animated.View>
                    )}
                    <Text style={[styles.joinBtnText, !joined.includes(c.id) && { marginLeft: 6 }]}>
                      {joined.includes(c.id) ? "Unido" : "Unirse"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* People Section - Diseño mejorado */}
        <View style={styles.peopleSection}>
          <Text style={styles.peopleTitle}>Personas que podrías conocer</Text>
          <Text style={styles.peopleSubtitle}>También te puede interesar seguir a estas personas basado en tus preferencias</Text>

          <View style={styles.peopleGrid}>
            {suggestedPeople.map((person) => (
              <View key={person.id} style={styles.personCard}>
                <TouchableOpacity style={styles.dismissBtn}>
                  <X size={16} color="#999" />
                </TouchableOpacity>
                
                <Image
                  source={{ uri: person.avatar_url || "https://i.pravatar.cc/100" }}
                  style={styles.personAvatar}
                />
                
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personRole}>{person.profession}</Text>
                <Text style={styles.personExpertise}>{person.expertise_areas?.[0] || 'Inversiones para principiantes'}</Text>
                
                <TouchableOpacity
                  style={[styles.connectBtn, followedPeople.includes(person.id) && styles.connectedBtn]}
                  onPress={() => handleFollowPerson(person.id)}
                  disabled={followedPeople.includes(person.id)}
                >
                  <Text style={[styles.connectBtnText, followedPeople.includes(person.id) && styles.connectedBtnText]}>
                    {followedPeople.includes(person.id) ? "Conectado" : "Conectar"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const CARD_HEIGHT = 150

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 24, fontWeight: '400', color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  skipText: { color: "#2673f3", fontSize: 15, fontWeight: "500" },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    marginTop: 8,
  },
  cardsContainer: { gap: 16, paddingHorizontal: 16 },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "#fff",
  },
  cardImage: { width: "100%", height: CARD_HEIGHT, resizeMode: "cover" },
  cardContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  cardName: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 4 },
  cardMeta: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8 
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: { fontSize: 13, color: "#eee" },
  metaDot: { fontSize: 13, color: "#eee", marginHorizontal: 4 },
  lockIcon: {
    marginLeft: 8,
  },
  joinBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#2673f3",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  joined: { backgroundColor: "#27AE60" },
  joinBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  peopleSection: { marginTop: 30, paddingHorizontal: 16 },
  peopleTitle: { fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: 6 },
  peopleSubtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 },
  peopleScroll: { paddingHorizontal: 8 },
  personCard: { 
    width: (width - 48) / 2, 
    alignItems: "center", 
    marginBottom: 20, 
    position: 'relative',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  personAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  personName: { fontSize: 14, fontWeight: "600", color: "#111", textAlign: 'center' },
  personRole: { fontSize: 12, color: "#666", textAlign: 'center' },
  personExpertise: { fontSize: 11, color: "#2673f3", marginTop: 2, textAlign: 'center' },
  dismissBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 12,
    color: '#666',
  },
  followBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignItems: "center",
  },
  followedBtn: {
    backgroundColor: "#27AE60",
  },
  followBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  followedBtnText: {
    color: "#fff",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  finishBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  finishBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // Nuevos estilos para el diseño mejorado
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  connectBtn: {
    backgroundColor: "#2673f3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignItems: "center",
    minWidth: 80,
  },
  connectedBtn: {
    backgroundColor: "#27AE60",
  },
  connectBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  connectedBtnText: {
    color: "#fff",
  },
})
