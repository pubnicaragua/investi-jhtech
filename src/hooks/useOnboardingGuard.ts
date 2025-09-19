"use client"

import { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../types/navigation"
import { getMe } from "../rest/api"
import { getCurrentUserId } from "../rest/client"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function useOnboardingGuard(shouldCheck: boolean = true) {
  const navigation = useNavigation<NavigationProp>()
  const [loading, setLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!shouldCheck) {
      setLoading(false)
      return
    }

    const checkOnboarding = async () => {
      try {
        const uid = await getCurrentUserId()
        if (!uid) {
          setLoading(false)
          return
        }

        const user = await getMe(uid)
        if (!user) {
          setLoading(false)
          return
        }

        const hasGoals = user.metas && user.metas.length > 0
        const hasInterests = user.intereses && user.intereses.length > 0
        const hasKnowledge = user.nivel_finanzas && user.nivel_finanzas !== "none"

        // NO redirigir automáticamente después del login
        // Solo verificar completitud del onboarding

        setIsComplete(hasGoals && hasInterests && hasKnowledge)
      } catch (error) {
        console.error("Error checking onboarding:", error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [navigation, shouldCheck])

  return { loading, isComplete }
}
