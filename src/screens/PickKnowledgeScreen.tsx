"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from "react-i18next"
import { ArrowLeft, HelpCircle, X } from "lucide-react-native"
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
  const [showHelpModal, setShowHelpModal] = useState(false)

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
      
      // Marcar paso como completado
      await AsyncStorage.setItem('knowledge_selected', 'true')
      
      navigation.navigate("CommunityRecommendations")
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton} onPress={() => setShowHelpModal(true)}>
          <HelpCircle size={24} color="#2673f3" />
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
        <Text style={styles.disclaimer}>
          💡 Tranquilo, podrás ajustar tu nivel de conocimiento más adelante en tu perfil
        </Text>
      </View>

      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Guía de Niveles</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.levelGuide}>
                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>🔴</Text>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideTitle}>No tengo conocimiento</Text>
                    <Text style={styles.guideDescription}>
                      • Nunca has invertido{"\n"}
                      • No conoces términos financieros básicos{"\n"}
                      • Quieres aprender desde cero
                    </Text>
                  </View>
                </View>

                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>🟠</Text>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideTitle}>Tengo un poco de conocimiento</Text>
                    <Text style={styles.guideDescription}>
                      • Conoces conceptos básicos (ahorro, interés){"\n"}
                      • Has leído sobre inversiones{"\n"}
                      • Aún no has invertido o muy poco
                    </Text>
                  </View>
                </View>

                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>🟡</Text>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideTitle}>Tengo conocimiento</Text>
                    <Text style={styles.guideDescription}>
                      • Has invertido en acciones o fondos{"\n"}
                      • Entiendes riesgo y diversificación{"\n"}
                      • Sigues el mercado regularmente
                    </Text>
                  </View>
                </View>

                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>🟢</Text>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideTitle}>Soy experto</Text>
                    <Text style={styles.guideDescription}>
                      • Inviertes activamente hace años{"\n"}
                      • Conoces análisis técnico y fundamental{"\n"}
                      • Manejas portafolio diversificado
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    borderWidth: 3,
    borderColor: "#2673f3",
    backgroundColor: "#EEF2FF",
    shadowColor: "#2673f3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  disclaimer: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  modalScroll: {
    padding: 20,
  },
  levelGuide: {
    gap: 20,
  },
  guideItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  guideEmoji: {
    fontSize: 32,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  guideDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})
