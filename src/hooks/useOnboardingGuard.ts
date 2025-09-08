"use client"

import { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../types/navigation"
import { getMe } from "../rest/api"
import { getCurrentUserId } from "../rest/client"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function useOnboardingGuard() {
  const navigation = useNavigation<NavigationProp>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const uid = await getCurrentUserId()
        if (!uid) return

        const user = await getMe(uid)
        if (!user) return

        const hasGoals = user.metas && user.metas.length > 0
        const hasInterests = user.intereses && user.intereses.length > 0
        const hasKnowledge = user.nivel_finanzas && user.nivel_finanzas !== "none"

        if (!hasGoals) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Onboarding", params: { screen: "InvestmentInterests" } }],
          })
          return
        }

        if (!hasInterests) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Onboarding", params: { screen: "InvestmentInterests" } }],
          })
          return
        }

        if (!hasKnowledge) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Onboarding", params: { screen: "InvestmentKnowledge" } }],
          })
          return
        }
      } catch (error) {
        console.error("Error checking onboarding:", error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [navigation])

  return { loading }
}
