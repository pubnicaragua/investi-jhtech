"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowLeft } from "lucide-react-native"
import { getCurrentUserId, saveUserKnowledgeLevel } from "../rest/api"

const knowledgeLevels = [
  {
    id: "no_knowledge",
    title: "No tengo conocimiento",
    color: "#FF6B6B",
    icon: "🔴"
  },
  {
    id: "basic",
    title: "Tengo un poco de conocimiento", 
    color: "#FFA726",
    icon: "🟠"
  },
  {
    id: "intermediate",
    title: "Tengo conocimiento",
    color: "#FFEB3B", 
    icon: "🟡"
  },
  {
    id: "expert",
    title: "Soy experto",
    color: "#4CAF50",
    icon: "🟢"
  }
]

export function PickKnowledgeScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selectedLevel) {
      return
    }

    setLoading(true)
    try {
      const uid = await getCurrentUserId()
      if (!uid) {
        console.error("No user ID found")
        return
      }

      await saveUserKnowledgeLevel(uid, selectedLevel)
      navigation.navigate("PickInterests")
    } catch (error) {
      console.error("Error saving knowledge level:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          ¿Cuál es tu nivel de <Text style={styles.titleHighlight}>conocimientos</Text> financieros?
        </Text>

        <View style={styles.optionsContainer}>
          {knowledgeLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionButton,
                selectedLevel === level.id && styles.optionButtonSelected,
                { borderColor: level.color }
              ]}
              onPress={() => setSelectedLevel(level.id)}
            >
              <View style={[styles.optionIcon, { backgroundColor: level.color }]}>
                <Text style={styles.optionIconText}>{level.icon}</Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedLevel === level.id && styles.optionTextSelected
              ]}>
                {level.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLevel && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedLevel || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.continueButtonText}>Continuar</Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 60,
    lineHeight: 36,
  },
  titleHighlight: {
    color: "#2673f3",
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionButtonSelected: {
    borderWidth: 2,
    backgroundColor: "#f8f9ff",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    color: "#2673f3",
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    backgroundColor: "#2673f3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
