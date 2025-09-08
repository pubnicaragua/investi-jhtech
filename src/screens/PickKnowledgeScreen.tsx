"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { useTranslation } from "react-i18next"
import { getCurrentUserId, updateUser } from "../api"

// Niveles de conocimiento (se traducen vía i18n con keys del backend)
const KNOWLEDGE_LEVELS = [
  { id: "none", textKey: "knowledge.none", color: "🔴" },
  { id: "little", textKey: "knowledge.little", color: "🟠" },
  { id: "some", textKey: "knowledge.some", color: "🟡" },
  { id: "expert", textKey: "knowledge.expert", color: "🟢" },
]

export function PickKnowledgeScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        // Skip loading existing knowledge level for now - let user select fresh
        // const user = await getUser(uid)
        // if (user?.nivel_finanzas) {
        //   setSelectedLevel(user.nivel_finanzas)
        // }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedLevel) return

    setLoading(true)
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        await updateUser(uid, { nivel_finanzas: selectedLevel })
        navigation.navigate("InvestmentGoals")
      }
    } catch (error) {
      console.error("Error updating knowledge level:", error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
      {/* Header con chevron pegado arriba */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.chevron}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Contenido scrollable */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {t("knowledge.question1")}{" "}
            <Text style={styles.titleBlue}>{t("knowledge.highlight")}</Text>{" "}
            {t("knowledge.question2")}
          </Text>

          <View style={styles.levelsContainer}>
            {KNOWLEDGE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelItem,
                  selectedLevel === level.id && styles.levelItemSelected,
                ]}
                onPress={() => setSelectedLevel(level.id)}
              >
                <Text style={styles.levelIcon}>{level.color}</Text>
                <Text
                  style={[
                    styles.levelText,
                    selectedLevel === level.id && styles.levelTextSelected,
                  ]}
                >
                  {t(level.textKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedLevel || loading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={loading || !selectedLevel}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.continueButtonText}>
              {t("knowledge.continue")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 6, // pegado al borde del notch
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
  },
  chevron: {
    fontSize: 30,
    color: "#111",
    lineHeight: 30,
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "Figtree-Bold",
    fontSize: 22,
    color: "#111",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
  },
  titleBlue: {
    color: "#007AFF",
  },
  levelsContainer: {
    gap: 12,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
  },
  levelItemSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
  },
  levelIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  levelText: {
    fontFamily: "Figtree-Regular",
    fontSize: 15,
    color: "#111",
    flex: 1,
  },
  levelTextSelected: {
    color: "#007AFF",
    fontFamily: "Figtree-Medium",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: "white",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#C7C7C7",
  },
  continueButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Figtree-SemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
})
