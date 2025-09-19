"use client"

import { useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { storage } from "../utils/storage"

export function useAuthGuard() {
  const navigation = useNavigation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getItem("access_token")
        if (!token) {
          (navigation as any).reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        }
      } catch (error) {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        })
      }
    }

    checkAuth()
  }, [navigation])
}
