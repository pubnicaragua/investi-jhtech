"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { 
  Home, 
  GraduationCap, 
  DollarSign, 
  Plane, 
  Car, 
  TrendingUp, 
  Heart, 
  Rocket, 
  BookOpen, 
  PawPrint 
} from "lucide-react-native"
import { getCurrentUserId, updateUser, getInvestmentGoals, saveUserGoals } from "../rest/api"

interface InvestmentGoal {
  id: string
  name: string
  description?: string
  icon?: string
  category: string
  priority?: number
}

// ICONOS LUCIDE - Mapeo por categoría
const GOAL_ICON_COMPONENTS: Record<string, any> = {
  'real_estate': Home,
  'education': GraduationCap,
  'financial_freedom': DollarSign,
  'travel': Plane,
  'vehicle': Car,
  'investment': TrendingUp,
  'health': Heart,
  'business': Rocket,
  'learning': BookOpen,
  'pets': PawPrint
}

const GOAL_ICON_COLORS: Record<string, string> = {
  'real_estate': '#3B82F6',
  'education': '#8B5CF6',
  'financial_freedom': '#10B981',
  'travel': '#06B6D4',
  'vehicle': '#F59E0B',
  'investment': '#EF4444',
  'health': '#EC4899',
  'business': '#6366F1',
  'learning': '#14B8A6',
  'pets': '#F97316'
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
      const goalsData = await getInvestmentGoals()
      
      if (goalsData) {
        setGoals(goalsData)
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

  const getPriorityNumber = (goalId: string): number => {
    return selectedGoals.indexOf(goalId) + 1
  }

  const handleContinue = async () => {
    if (selectedGoals.length === 0) return
    setLoading(true)
    try {
      const uid = await getCurrentUserId()
      if (uid) {
        await saveUserGoals(uid, selectedGoals)
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("UploadAvatar")}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>
            ¿Cuáles son tus <Text style={styles.titleBlue}>metas</Text> al invertir?
          </Text>
          <Text style={styles.subtitle}>
            Puedes elegir a menos una y máximo 3 por orden de prioridad
          </Text>

          <View style={styles.goalsContainer}>
            {goals.map((goal) => {
              const IconComponent = GOAL_ICON_COMPONENTS[goal.category]
              const iconColor = GOAL_ICON_COLORS[goal.category] || '#2673f3'
              const isSelected = selectedGoals.includes(goal.id)
              
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalItem, isSelected && styles.goalItemSelected]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <View style={[styles.iconContainer, isSelected && { backgroundColor: iconColor + '20' }]}>
                    {IconComponent && <IconComponent size={24} color={isSelected ? iconColor : '#6B7280'} />}
                  </View>
                  <Text
                    style={[
                      styles.goalText,
                      isSelected && styles.goalTextSelected,
                    ]}
                  >
                    {goal.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.priorityBadge, { backgroundColor: iconColor }]}>
                      <Text style={styles.priorityNumber}>
                        {getPriorityNumber(goal.id)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

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
  goalsContainer: {},
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 12,
    position: 'relative',
  },
  goalItemSelected: {
    borderColor: "#2673f3",
    backgroundColor: "#f0f7ff",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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