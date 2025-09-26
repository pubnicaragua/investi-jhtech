"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { getCurrentUserId, updateUser, getInvestmentGoals, saveUserGoals } from "../rest/api"

interface InvestmentGoal {
  id: string
  name: string
  description: string
  icon: string
  category: string
  priority: number
}

export function PickGoalsScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [goals, setGoals] = useState<InvestmentGoal[]>([])

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const [uid, goalsData] = await Promise.all([
        getCurrentUserId(),
        getInvestmentGoals()
      ])
      
      if (goalsData) {
        setGoals(goalsData)
      }
      
      // Skip loading existing goals for now - let user select fresh
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        // Si ya está seleccionado, lo removemos
        return prev.filter((id) => id !== goalId)
      }
      if (prev.length >= 3) {
        // Si ya hay 3 seleccionados, no permitir más
        return prev
      }
      // Agregar nuevo goal al final (manteniendo orden de selección)
      return [...prev, goalId]
    })
  }

  // Función para obtener el número de prioridad (1, 2, 3)
  const getPriorityNumber = (goalId: string): number => {
    return selectedGoals.indexOf(goalId) + 1
  }

  const handleContinue = async () => {
    if (selectedGoals.length === 0) return
    setLoading(true)
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        // Save to new segmentation system
        await saveUserGoals(uid, selectedGoals)
        // Also update user table for backward compatibility
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("UploadAvatar")}>
          <Text style={styles.backButtonText}>{"<"}</Text>
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
            Puedes elegir a menos una y máximo 3 por orden de prioridad
          </Text>

          <View style={styles.goalsContainer}>
            {goals.map((goal) => (
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
                  {goal.name}
                </Text>
                {/* Número de prioridad en la esquina superior derecha */}
                {selectedGoals.includes(goal.id) && (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityNumber}>
                      {getPriorityNumber(goal.id)}
                    </Text>
                  </View>
                )}
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
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#111',
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
    fontSize: 20,
    fontWeight: '600',
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 28,
  },
  titleBlue: {
    color: "#2673f3",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  goalsContainer: {
    // gap: 12, // Removido porque ya está en goalItem
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB", // Color gris más visible como en la imagen
    marginBottom: 12,
    position: 'relative', // Para posicionar el badge
  },
  goalItemSelected: {
    borderColor: "#2673f3",
    backgroundColor: "#f0f7ff",
  },
  goalIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  goalText: {
    fontSize: 15,
    color: "#111",
    flex: 1,
    fontWeight: '500',
  },
  goalTextSelected: {
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
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2673f3',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
})
