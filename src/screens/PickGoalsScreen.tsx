"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from "react-i18next"
import { 
  ChevronLeft,
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
  icon: string
  category?: string
  priority?: number
}

// Mapeo de emojis a iconos de Lucide con colores profesionales
const ICON_MAP: Record<string, { component: any; color: string }> = {
  '🏠': { component: Home, color: '#FF6B6B' },
  '🎓': { component: GraduationCap, color: '#7B68EE' },
  '💰': { component: DollarSign, color: '#4ECDC4' },
  '✈️': { component: Plane, color: '#95E1D3' },
  '🚗': { component: Car, color: '#FFA07A' },
  '📈': { component: TrendingUp, color: '#007AFF' },
  '🏥': { component: Heart, color: '#FF69B4' },
  '🚀': { component: Rocket, color: '#FF6B9D' },
  '📚': { component: BookOpen, color: '#20B2AA' },
  '🐕': { component: PawPrint, color: '#F4A460' }
}

export function PickGoalsScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [goals, setGoals] = useState<InvestmentGoal[]>([])

  useEffect(() => {
    loadGoalsData()
  }, [])

  const loadGoalsData = async () => {
    try {
      const goalsData = await getInvestmentGoals()
      
      if (goalsData && goalsData.length > 0) {
        setGoals(goalsData)
      }
    } catch (error) {
      console.error("Error loading goals:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        // Deseleccionar
        return prev.filter((id) => id !== goalId)
      }
      // Máximo 3 selecciones
      if (prev.length >= 3) {
        return prev
      }
      // Agregar nueva selección
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
      console.log('🔑 User ID:', uid)
      console.log('🎯 Selected Goals:', selectedGoals)
      
      if (!uid) {
        console.error('❌ No user ID found')
        alert('Error: No se pudo obtener el ID de usuario')
        return
      }
      
      // Guardar metas con prioridad en user_goals
      console.log('💾 Guardando metas...')
      await saveUserGoals(uid, selectedGoals)
      console.log('✅ Metas guardadas exitosamente')
      
      // Actualizar paso de onboarding (sin metas, ya están en user_goals)
      console.log('👤 Actualizando paso de onboarding...')
      await updateUser(uid, { 
        onboarding_step: 'pick_interests'
      })
      console.log('✅ Onboarding actualizado exitosamente')
      
      // Marcar paso como completado en AsyncStorage
      await AsyncStorage.setItem('goals_selected', 'true')
      
      // Navegar a siguiente pantalla
      console.log('🚀 Navegando a PickInterests')
      navigation.navigate("PickInterests")
    } catch (error: any) {
      console.error("❌ Error completo:", error)
      console.error("❌ Error message:", error?.message)
      console.error("❌ Error details:", error?.details)
      console.error("❌ Error hint:", error?.hint)
      alert(`Error al guardar metas: ${error?.message || 'Error desconocido'}`)
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color="#000" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>
            ¿Cuáles son tus <Text style={styles.titleBlue}>metas</Text> al invertir?
          </Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Puedes elegir a menos una y máximo 3 por orden de prioridad
          </Text>

          {/* Goals List */}
          <View style={styles.goalsContainer}>
            {goals.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id)
              const priorityNumber = isSelected ? getPriorityNumber(goal.id) : null
              
              // Obtener el icono y color de Lucide basado en el emoji
              const iconData = ICON_MAP[goal.icon] || { component: Home, color: '#007AFF' }
              const IconComponent = iconData.component
              const iconColor = isSelected ? iconData.color : '#8E8E93'
              
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalItem,
                    isSelected && styles.goalItemSelected
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                  activeOpacity={0.7}
                >
                  {/* Emoji Icon */}
                  <View style={[
                    styles.iconContainer,
                    isSelected && { backgroundColor: iconData.color + '15' }
                  ]}>
                    <Text style={styles.emojiIcon}>{goal.icon}</Text>
                  </View>
                  
                  {/* Goal Name */}
                  <Text
                    style={[
                      styles.goalText,
                      isSelected && styles.goalTextSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {goal.name}
                  </Text>
                  
                  {/* Priority Badge */}
                  {isSelected && priorityNumber && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityNumber}>
                        {priorityNumber}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedGoals.length === 0 && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading || selectedGoals.length === 0}
          activeOpacity={0.8}
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 28,
    paddingHorizontal: 10,
  },
  titleBlue: {
    color: "#007AFF",
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    position: 'relative',
    minHeight: 64,
  },
  goalItemSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
    borderWidth: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalText: {
    fontSize: 15,
    color: "#000000",
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
    paddingRight: 8,
  },
  goalTextSelected: {
    color: "#000000",
    fontWeight: '600',
  },
  priorityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  priorityNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: "white",
    borderTopWidth: 0,
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  continueButtonDisabled: {
    backgroundColor: "#C7C7CC",
    opacity: 0.6,
  },
  continueButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiIcon: {
    fontSize: 28,
    lineHeight: 32,
  },
})