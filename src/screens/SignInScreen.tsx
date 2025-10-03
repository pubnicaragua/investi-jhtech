"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native"
import { useTranslation } from "react-i18next"
import * as Linking from 'expo-linking'
import { Eye, EyeOff } from "lucide-react-native"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../supabase"

export function SignInScreen({ navigation }: any) {
  const { t } = useTranslation()
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        t("common.error"),
        t("auth.enterEmailForReset") || "Ingresa tu correo para restablecer la contraseña"
      )
      return
    }
    try {
      setLoading(true)
      const redirectTo = `${
        typeof window !== "undefined" ? window.location.origin : "https://investi.app"
      }/auth/callback`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      Alert.alert(
        t("common.success") || "Éxito",
        t("auth.resetEmailSent") || "Te enviamos un correo para restablecer la contraseña"
      )
    } catch (err: any) {
      Alert.alert("Error", err.message || "No fue posible enviar el correo de restablecimiento")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: "google" | "apple" | "facebook" | "linkedin_oidc") => {
    try {
      setLoading(true)
      const redirectTo = (typeof window !== 'undefined' && window.location && window.location.origin)
        ? `${window.location.origin}/auth/callback`
        : Linking.createURL('auth/callback')

      const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (error) throw error

      const url = (data && (data.url || data?.providerUrl || data?.redirectTo)) || null
      if (url) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = url
        } else {
          await Linking.openURL(url)
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "No se pudo iniciar con el proveedor seleccionado")
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.completeAllFields"))
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      console.log("SignIn successful - user authenticated")
    } catch (error: any) {
      console.error("SignIn error:", error)
      Alert.alert("Error", error.message || "Error al iniciar sesión. Verifica tus credenciales.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Iniciar sesión</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Correo"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading && !isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, (loading || isLoading) && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading || isLoading}
              activeOpacity={0.8}
            >
              {loading || isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialButtons}>
            {/* LinkedIn */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOAuth("linkedin_oidc")}
              disabled={loading || isLoading}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconContainer, styles.linkedinIconBg]}>
                <Text style={styles.linkedinIcon}>in</Text>
              </View>
              <Text style={styles.socialButtonText}>Inicia sesión con LinkedIn</Text>
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOAuth("google")}
              disabled={loading || isLoading}
              activeOpacity={0.7}
            >
              <View style={styles.socialIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Inicia sesión con Google</Text>
            </TouchableOpacity>

            {/* Apple */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOAuth("apple")}
              disabled={loading || isLoading}
              activeOpacity={0.7}
            >
              <View style={styles.socialIconContainer}>
                <Text style={styles.appleIcon}></Text>
              </View>
              <Text style={styles.socialButtonText}>Inicia sesión con Apple</Text>
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOAuth("facebook")}
              disabled={loading || isLoading}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconContainer, styles.facebookIconBg]}>
                <Text style={styles.facebookIcon}>f</Text>
              </View>
              <Text style={styles.socialButtonText}>Inicia sesión con Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Al registrarte en Investi, tu aceptas nuestros Términos y{"\n"}Políticas de Privacidad.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButtonText: {
    fontSize: 34,
    fontWeight: "300",
    color: "#111827",
    marginTop: -6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.4,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
    fontSize: 16,
    color: "#111827",
    fontWeight: "400",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    fontWeight: "400",
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  signInButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  forgotPassword: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  socialButtons: {
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  socialIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkedinIconBg: {
    backgroundColor: "#0A66C2",
  },
  facebookIconBg: {
    backgroundColor: "#1877F2",
  },
  linkedinIcon: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285F4",
  },
  appleIcon: {
    fontSize: 22,
    color: "#000000",
  },
  facebookIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  socialButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
    letterSpacing: -0.2,
  },
  termsContainer: {
    paddingBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
})