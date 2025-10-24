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
import { LinearGradient } from 'expo-linear-gradient'
import { useTranslation } from "react-i18next"
import * as Linking from 'expo-linking'
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react-native"
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
    // Validar campos
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.completeAllFields") || "Por favor completa todos los campos")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido")
      return
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      console.log("[SignInScreen] Attempting sign in...")
      await signIn(email.trim(), password)
      console.log("[SignInScreen] SignIn successful - user authenticated")
    } catch (error: any) {
      console.error("[SignInScreen] SignIn error:", error)
      Alert.alert(
        "Error de autenticación",
        error.message || "Error al iniciar sesión. Verifica tus credenciales."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Decorative Gradient Header */}
        <LinearGradient
          colors={['#EC4899', '#8B5CF6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Hello</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading && !isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

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
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <View style={styles.signInIconContainer}>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login Section */}
          <View style={styles.socialLoginSection}>
            <Text style={styles.socialLoginText}>Don't have an account? <Text style={styles.createLink} onPress={() => navigation.navigate('SignUp')}>Create</Text></Text>

            {/* Social Icons Row */}
            <View style={styles.socialIconsRow}>
              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("facebook")}
                disabled={loading || isLoading}
                activeOpacity={0.7}
              >
                <View style={[styles.socialIcon, styles.facebookIconBg]}>
                  <Text style={styles.facebookIcon}>f</Text>
                </View>
              </TouchableOpacity>

              {/* Twitter/X */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => Alert.alert('Info', 'Twitter OAuth próximamente')}
                disabled={loading || isLoading}
                activeOpacity={0.7}
              >
                <View style={[styles.socialIcon, styles.twitterIconBg]}>
                  <Text style={styles.twitterIcon}>𝕏</Text>
                </View>
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("google")}
                disabled={loading || isLoading}
                activeOpacity={0.7}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  gradientHeader: {
    height: 120,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '400',
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  signInIconContainer: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 8,
  },
  socialLoginSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  createLink: {
    color: '#8B5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  socialIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookIconBg: {
    backgroundColor: '#1877F2',
  },
  twitterIconBg: {
    backgroundColor: '#1DA1F2',
  },
  facebookIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  twitterIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4285F4',
  },
})