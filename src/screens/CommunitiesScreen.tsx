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
} from "react-native"
import { useTranslation } from "react-i18next"
import { Users } from "lucide-react-native"
import { listCommunities, joinCommunity } from "../rest/api"
import { getCurrentUserId } from "../rest/client"
import { LanguageToggle } from "../components/LanguageToggle"
import { EmptyState } from "../components/EmptyState"
import { useAuthGuard } from "../hooks/useAuthGuard"

export function CommunitiesScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [communities, setCommunities] = useState([])
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useAuthGuard()

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listCommunities()
      setCommunities(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        await joinCommunity(uid, communityId)
        setJoinedCommunities((prev) => [...prev, communityId])
      }
    } catch (error) {
      console.error("Error joining community:", error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("communities.title")}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  if (error || communities.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("communities.title")}</Text>
          <LanguageToggle />
        </View>
        <EmptyState
          title={t("communities.noCommunitiesAvailable")}
          message={t("common.retry")}
          onRetry={loadCommunities}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("communities.title")}</Text>
        <LanguageToggle />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {communities.map((community: any) => (
            <View key={community.id} style={styles.communityCard}>
              <View style={styles.communityHeader}>
                <Image
                  source={{
                    uri:
                      community.image_url ||
                      "https://www.investiiapp.com/investi-logo-new-main.png",
                  }}
                  style={styles.communityImage}
                />
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName}>{community.name}</Text>
                  <View style={styles.communityMeta}>
                    <Users size={14} color="#667" />
                    <Text style={styles.communityMembers}>
                      {community.member_count || 0} {t("communities.members")}
                    </Text>
                    <Text style={styles.communityDot}>•</Text>
                    <Text style={styles.communityType}>{t("communities.publicCommunity")}</Text>
                  </View>
                </View>
              </View>

              {community.description && <Text style={styles.communityDescription}>{community.description}</Text>}

              <TouchableOpacity
                style={[styles.joinButton, joinedCommunities.includes(community.id) && styles.joinButtonJoined]}
                onPress={() => handleJoinCommunity(community.id)}
                disabled={joinedCommunities.includes(community.id)}
              >
                <Text
                  style={[
                    styles.joinButtonText,
                    joinedCommunities.includes(community.id) && styles.joinButtonTextJoined,
                  ]}
                >
                  {joinedCommunities.includes(community.id) ? t("communities.joined") : t("communities.join")}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  communityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  communityHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  communityImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  communityMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  communityMembers: {
    fontSize: 14,
    color: "#667",
    marginLeft: 4,
  },
  communityDot: {
    fontSize: 14,
    color: "#667",
    marginHorizontal: 8,
  },
  communityType: {
    fontSize: 14,
    color: "#667",
  },
  communityDescription: {
    fontSize: 14,
    color: "#667",
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: "#2673f3",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonJoined: {
    backgroundColor: "#27AE60",
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  joinButtonTextJoined: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})


