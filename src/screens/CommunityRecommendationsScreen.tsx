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
} from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowLeft } from "lucide-react-native"
import { listCommunities, joinCommunity, getCurrentUser } from "../rest/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

type Community = {
  id: string
  name: string
  description?: string
  image_url?: string
  member_count?: number
}

export function CommunityRecommendationsScreen({ navigation, route }: any) {
  const { t } = useTranslation()
  const [communities, setCommunities] = useState<Community[]>([])
  const [joined, setJoined] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      // Obtener datos del usuario para personalizar recomendaciones
      const user = await getCurrentUser()
      const allCommunities = await listCommunities()
      
      let recommendedCommunities = allCommunities
      
      if (user?.intereses && user.intereses.length > 0) {
        // Filtrar comunidades basadas en intereses del usuario
        const userInterests = user.intereses
        recommendedCommunities = allCommunities.filter(community => {
          const communityName = community.name.toLowerCase()
          return userInterests.some(interest => 
            communityName.includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(communityName.split(' ')[0])
          )
        })
        
        // Si no hay suficientes comunidades filtradas, agregar algunas generales
        if (recommendedCommunities.length < 3) {
          const remaining = allCommunities.filter(c => 
            !recommendedCommunities.find(rc => rc.id === c.id)
          ).slice(0, 4 - recommendedCommunities.length)
          recommendedCommunities = [...recommendedCommunities, ...remaining]
        }
      }
      
      setCommunities(recommendedCommunities.slice(0, 4))
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
        await joinCommunity(user.id, id)
        setJoined((prev) => [...prev, id])
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
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("communities.recommended")}</Text>
        <TouchableOpacity>
          <Text style={styles.skipText}>{t("common.skip")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t("communities.recommendedSubtitle")}</Text>

        {/* Communities */}
        <View style={styles.cardsContainer}>
          {communities.map((c) => (
            <View key={c.id} style={styles.card}>
              <Image
                source={{ uri: c.image_url || "https://www.investiiapp.com/investi-logo-new-main.png" }}
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardName}>{c.name}</Text>
                <Text style={styles.cardMeta}>
                  {c.member_count || 0} {t("communities.members")} • {t("communities.publicCommunity")}
                </Text>
                <TouchableOpacity
                  style={[styles.joinBtn, joined.includes(c.id) && styles.joined]}
                  onPress={() => handleJoin(c.id)}
                  disabled={joined.includes(c.id)}
                >
                  <Text style={styles.joinBtnText}>
                    {joined.includes(c.id) ? t("communities.joined") : t("communities.join")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* People Section */}
        <View style={styles.peopleSection}>
          <Text style={styles.peopleTitle}>{t("communities.peopleTitle")}</Text>
          <Text style={styles.peopleSubtitle}>{t("communities.peopleSubtitle")}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.peopleScroll}>
            <View style={styles.personCard}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/men/11.jpg" }}
                style={styles.personAvatar}
              />
              <Text style={styles.personName}>Jorge Méndez</Text>
              <Text style={styles.personRole}>Finanzas</Text>
            </View>
            <View style={styles.personCard}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/32.jpg" }}
                style={styles.personAvatar}
              />
              <Text style={styles.personName}>Claudio Eslava</Text>
              <Text style={styles.personRole}>Inversiones</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>{t("communities.finish")}</Text>
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
  backBtn: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  skipText: { color: "#007AFF", fontSize: 15, fontWeight: "500" },
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
  cardOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  cardName: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 4 },
  cardMeta: { fontSize: 13, color: "#eee", marginBottom: 8 },
  joinBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  joined: { backgroundColor: "#27AE60" },
  joinBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  peopleSection: { marginTop: 30, paddingHorizontal: 16 },
  peopleTitle: { fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: 6 },
  peopleSubtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 },
  peopleScroll: { paddingHorizontal: 8 },
  personCard: { width: 120, alignItems: "center", marginRight: 16 },
  personAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  personName: { fontSize: 14, fontWeight: "600", color: "#111" },
  personRole: { fontSize: 12, color: "#666" },
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
})
