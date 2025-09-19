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
import { getCurrentUserId, updateUser, getKnowledgeLevels, saveUserKnowledgeLevel } from "../rest/api"

interface KnowledgeLevel {
  id: string
  name: string
  description: string
  level: string
  requirements: string[]
  next_steps: string[]
}

export function PickKnowledgeScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [knowledgeLevels, setKnowledgeLevels] = useState<KnowledgeLevel[]>([])

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const [uid, levelsData] = await Promise.all([
        getCurrentUserId(),
        getKnowledgeLevels()
      ])
      
      if (levelsData) {
        setKnowledgeLevels(levelsData)
      }
      
      // Skip loading existing knowledge level for now - let user select fresh
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
        // Save to new segmentation system
        await saveUserKnowledgeLevel(uid, selectedLevel)
        // Also update user table for backward compatibility
        await updateUser(uid, { nivel_finanzas: selectedLevel })
        navigation.navigate("InvestmentKnowledge")
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
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Contenido scrollable */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>
            ¿Cuál es tu nivel de <Text style={styles.titleBlue}>conocimientos</Text> financieros?
          </Text>

          <View style={styles.levelsContainer}>
            {knowledgeLevels.map((level) => {
              const getIcon = (levelValue: string) => {
                switch(levelValue) {
                  case 'none': return '🔴'
                  case 'little': return '🟠'
                  case 'basic': return '🟡'
                  case 'expert': return '🟢'
                  default: return '⚪'
                }
              }
              
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelItem,
                    selectedLevel === level.level && styles.levelItemSelected,
                  ]}
                  onPress={() => setSelectedLevel(level.level)}
                >
                  <Text style={styles.levelIcon}>{getIcon(level.level)}</Text>
                  <Text
                    style={[
                      styles.levelText,
                      selectedLevel === level.level && styles.levelTextSelected,
                    ]}
                  >
                    {level.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
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
              Continuar
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
    backgroundColor: "#f7f8fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#111',
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
    fontSize: 20,
    fontWeight: '600',
    color: "#111",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
  },
  titleBlue: {
    color: "#2673f3",
  },
  levelsContainer: {
    // gap: 12, // Removido porque ya está en levelItem
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 12,
  },
  levelItemSelected: {
    borderColor: "#2673f3",
    backgroundColor: "#f0f7ff",
  },
  levelIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  levelText: {
    fontSize: 15,
    color: "#111",
    flex: 1,
    fontWeight: '500',
  },
  levelTextSelected: {
    color: "#2673f3",
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: "white",
  },
  continueButton: {
    backgroundColor: "#2673f3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#C7C7C7",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
  },
})
