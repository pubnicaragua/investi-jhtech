"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native"
import { useTranslation } from "react-i18next"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Users, BookOpen, TrendingUp } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLanguage } from "../contexts/LanguageContext"

interface WelcomeScreenProps {
  navigation?: any
}

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const { t } = useTranslation()
  const { isLanguageSelected } = useLanguage()
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()

  const nav = navigation || useNavigation<StackNavigationProp<any>>()

  const handleSignIn = () => {
    setLoading(true)
    setTimeout(() => {
      nav.navigate("SignIn")
      setLoading(false)
    }, 300)
  }

  const handleSignUp = () => {
    setLoading(true)
    setTimeout(() => {
      nav.navigate("SignUp")
      setLoading(false)
    }, 300)
  }

  useEffect(() => {
    // Language selection is handled by the navigation flow
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={require("../../assets/Frame1.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/investi-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          {t(
            "welcome.description",
            "¡Únete a la primera red social de educación financiera y de inversionistas en el mundo!"
          )}
        </Text>

        {/* Branding Icons */}
        <View style={styles.brandingContainer}>
          <View style={styles.brandingItem}>
            <Users size={20} color="#2563EB" />
            <Text style={styles.brandingText}>Conecta</Text>
          </View>
          <View style={styles.brandingItem}>
            <BookOpen size={20} color="#2563EB" />
            <Text style={styles.brandingText}>Aprende</Text>
          </View>
          <View style={styles.brandingItem}>
            <TrendingUp size={20} color="#2563EB" />
            <Text style={styles.brandingText}>Crece</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Empezar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Ya tengo una cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  heroImage: {
    width: 280,
    height: 200,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 160,
    height: 45,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "400",
  },
  brandingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  brandingItem: {
    alignItems: "center",
    gap: 8,
  },
  brandingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
    letterSpacing: -0.2,
  },
  buttonsContainer: {
    width: "100%",
    paddingHorizontal: 0,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
})