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
import { Eye, EyeOff, User, Lock } from "lucide-react-native"
import { FacebookIcon, GoogleIcon, LinkedInIcon } from '../components/SocialIcons'
import { useAuth } from "../contexts/AuthContext"
import { supabase, supabaseAnonKey } from "../supabase"

export function SignInScreen({ navigation }: any) {
  const { t } = useTranslation()
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthProvider, setOauthProvider] = useState<string | null>(null)

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword')
  }

  const handleOAuth = async (provider: "google" | "apple" | "facebook" | "linkedin_oidc") => {
    try {
      setLoading(true)
      setOauthProvider(provider === 'linkedin_oidc' ? 'LinkedIn' : provider === 'google' ? 'Google' : 'Facebook')
      console.log('[SignInScreen] 🔐 Initiating OAuth for provider:', provider)

      if (provider === "linkedin_oidc") {
        // Use custom LinkedIn OAuth flow via Edge Function
        try {
          const linkedInAuthUrl = `${supabase.supabaseUrl}/functions/v1/linkedin-auth`
          console.log('[SignInScreen] LinkedIn auth URL:', linkedInAuthUrl)

          // For Edge Functions, we need to make a request with proper authorization
          const response = await fetch(linkedInAuthUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            // Let fetch follow redirects by default. We'll also check response.url and headers.
          })

          if (!response.ok && response.status !== 0) {
            const errorData = await response.text()
            console.error('LinkedIn auth error (non-OK):', response.status, errorData)
            throw new Error(`HTTP ${response.status}: ${errorData}`)
          }

          // The function may return the redirect URL in several places:
          // - Location header (if the function did a redirect and we received it)
          // - response.url (if the fetch followed redirects or the function responded with a redirect)
          // - a JSON body with a field like { redirectUrl }
          let redirectUrl = response.headers.get('location') || response.url || null

          if (!redirectUrl) {
            try {
              const json = await response.json()
              redirectUrl = json?.redirectUrl || json?.url || null
            } catch (e) {
              // ignore parse errors
              console.warn('[SignInScreen] Could not parse JSON body from LinkedIn auth function:', e)
            }
          }

          if (redirectUrl) {
            console.log('[SignInScreen] Opening LinkedIn redirect URL:', redirectUrl)
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.location.href = redirectUrl
            } else {
              await Linking.openURL(redirectUrl)
            }
          } else {
            console.error('[SignInScreen] No redirect URL received from LinkedIn auth function (headers, url, or body)')
            throw new Error('No redirect URL received from LinkedIn auth function')
          }
        } catch (error: any) {
          console.error('LinkedIn OAuth initiation error:', error)
          Alert.alert("Error", error?.message || "No se pudo iniciar LinkedIn OAuth")
        }
        return
      }

      // For mobile: use app scheme. For web: use window origin
      let redirectTo = ''
      let skipBrowserRedirect = false
      
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
        redirectTo = `${window.location.origin}/auth/callback`
      } else {
        // Mobile: use custom scheme that matches app.config.js
        redirectTo = 'investi-community://auth/callback'
        // En mobile, no redirigir automáticamente para tener más control
        skipBrowserRedirect = false
      }
      console.log('[SignInScreen] OAuth redirectTo:', redirectTo, 'Platform:', Platform.OS)

      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider, 
        options: { 
          redirectTo,
          skipBrowserRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        } 
      })
      if (error) {
        console.error('[SignInScreen] ❌ OAuth error:', error)
        throw error
      }

      const url = (data && (data.url || data?.providerUrl || data?.redirectTo)) || null
      console.log('[SignInScreen] ✅ OAuth URL received:', url ? 'Yes' : 'No')
      
      if (url) {
        console.log('[SignInScreen] 🚀 Redirecting to OAuth provider...')
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = url
        } else {
          await Linking.openURL(url)
        }
      } else {
        console.error('[SignInScreen] ❌ No OAuth URL received from Supabase')
        throw new Error('No se recibió URL de autenticación')
      }
    } catch (err: any) {
      console.error('[SignInScreen] ❌ OAuth error:', err)
      Alert.alert("Error", err?.message || "No se pudo iniciar con el proveedor seleccionado")
    } finally {
      setLoading(false)
      setOauthProvider(null)
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
      console.log("[SignInScreen] ✅ SignIn successful - RootStack will handle navigation based on user state")
      // NO navegamos manualmente - el RootStack detectará isAuthenticated=true
      // y navegará automáticamente a Onboarding o HomeFeed según el estado del usuario
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Bienvenido</Text>
            <Text style={styles.welcomeSubtitle}>Inicia sesión en tu cuenta</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
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
                <Text style={styles.signInButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login Section */}
          <View style={styles.socialLoginSection}>
            <Text style={styles.socialLoginText}>¿No tienes cuenta? <Text style={styles.createLink} onPress={() => navigation.navigate('SignUp')}>Regístrate</Text></Text>

            {/* OAuth Loading Indicator */}
            {oauthProvider && (
              <View style={styles.oauthLoadingContainer}>
                <ActivityIndicator color="#2673f3" size="small" />
                <Text style={styles.oauthLoadingText}>
                  Conectando con {oauthProvider}...
                </Text>
                <Text style={styles.oauthLoadingSubtext}>
                  Por favor espera, esto puede tardar unos segundos
                </Text>
              </View>
            )}

            {/* Social Icons Row */}
            <View style={styles.socialIconsRow}>
              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("facebook")}
                disabled={loading || isLoading}
                activeOpacity={0.7}
              >
                <FacebookIcon size={56} />
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("google")}
                disabled={loading || isLoading}
                activeOpacity={0.7}
              >
                <GoogleIcon size={56} />
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("linkedin_oidc")}
                disabled={loading || isLoading}
                activeOpacity={0.7}
              >
                <LinkedInIcon size={56} />
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
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    color: '#2563EB',
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
    shadowRadius: 4,
    elevation: 3,
  },
  oauthLoadingContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  oauthLoadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginTop: 8,
    textAlign: 'center',
  },
  oauthLoadingSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
})