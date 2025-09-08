"use client"

import { useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import * as SecureStore from "expo-secure-store"

export function useAuthGuard() {
  const navigation = useNavigation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token")
        if (!token) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        }
      } catch (error) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        })
      }
    }

    checkAuth()
  }, [navigation])
}
