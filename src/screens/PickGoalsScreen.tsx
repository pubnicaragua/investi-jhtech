"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowLeft } from "lucide-react-native"
import { getCurrentUserId, updateUser } from "../api"

// Metas disponibles
const GOALS = [
  { id: "house", icon: "🏠", text: "Comprar una casa o departamento" },
  { id: "education", icon: "🎓", text: "Pagar estudios" },
  { id: "freedom", icon: "💰", text: "Lograr libertad financiera" },
  { id: "travel", icon: "✈️", text: "Viajar por el mundo" },
  { id: "car", icon: "🚗", text: "Comprar un auto" },
  { id: "investment", icon: "📈", text: "Hacer crecer mi dinero a largo plazo" },
  { id: "health", icon: "⚕️", text: "Prepararme para mi salud" },
  { id: "personal", icon: "💖", text: "Proyectos personales" },
  { id: "learn", icon: "🧠", text: "Aprender financieramente" },
  { id: "pet", icon: "🐶", text: "Bienestar de mi mascota" },
]

export function PickGoalsScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        // Skip loading existing goals for now - let user select fresh
        // const user = await getUser(uid)
        // if (user?.metas) {
        //   setSelectedGoals(user.metas)
        // }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, goalId]
    })
  }

  const handleContinue = async () => {
    if (selectedGoals.length === 0) return
    setLoading(true)
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        await updateUser(uid, { metas: selectedGoals })
        navigation.navigate("PickKnowledge")
      }
    } catch (error) {
      console.error("Error updating goals:", error)
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Contenido */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>
            ¿Cuáles son tus <Text style={styles.titleBlue}>metas</Text> al invertir?
          </Text>
          <Text style={styles.subtitle}>
            Puedes elegir al menos una y máximo 3 por orden de prioridad
          </Text>

          <View style={styles.goalsContainer}>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalItem, selectedGoals.includes(goal.id) && styles.goalItemSelected]}
                onPress={() => toggleGoal(goal.id)}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text
                  style={[
                    styles.goalText,
                    selectedGoals.includes(goal.id) && styles.goalTextSelected,
                  ]}
                >
                  {goal.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, selectedGoals.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={loading || selectedGoals.length === 0}
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

// 🎨 Estilos ajustados al 100% Figma
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
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
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 8,
    lineHeight: 28,
  },
  titleBlue: {
    color: "#007AFF",
  },
  subtitle: {
    fontFamily: "Figtree-Regular",
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
  },
  goalItemSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
  },
  goalIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  goalText: {
    fontFamily: "Figtree-Regular",
    fontSize: 15,
    color: "#111",
    flex: 1,
  },
  goalTextSelected: {
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
  },
})
