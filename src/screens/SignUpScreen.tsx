"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native"
import { useTranslation } from "react-i18next"
import * as Linking from 'expo-linking'
import { Eye, EyeOff, User, Lock, Mail, UserCircle } from "lucide-react-native"
import { FacebookIcon, GoogleIcon, LinkedInIcon } from '../components/SocialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase, supabaseAnonKey } from "../supabase"
import { useAuth } from "../contexts/AuthContext"

export function SignUpScreen({ navigation }: any) {
  const { t } = useTranslation()
  const { signIn: authSignIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOAuth = async (provider: "google" | "apple" | "facebook" | "linkedin_oidc") => {
    try {
      setLoading(true)
      console.log('[SignUpScreen] 🔐 Initiating OAuth for provider:', provider)

      if (provider === "linkedin_oidc") {
        // Use custom LinkedIn OAuth flow via Edge Function
        try {
          const linkedInAuthUrl = `${supabase.supabaseUrl}/functions/v1/linkedin-auth`
          console.log('[SignUpScreen] LinkedIn auth URL:', linkedInAuthUrl)

          // For Edge Functions, we need to make a request with proper authorization
          const response = await fetch(linkedInAuthUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok && response.status !== 0) {
            const errorData = await response.text()
            console.error('LinkedIn auth error (non-OK):', response.status, errorData)
            throw new Error(`HTTP ${response.status}: ${errorData}`)
          }

          // The function may put the redirect URL in several places. Try headers, response.url, or JSON body.
          let redirectUrl = response.headers.get('location') || response.url || null
          if (!redirectUrl) {
            try {
              const json = await response.json()
              redirectUrl = json?.redirectUrl || json?.url || null
            } catch (e) {
              console.warn('[SignUpScreen] Could not parse JSON body from LinkedIn auth function:', e)
            }
          }

          if (redirectUrl) {
            console.log('[SignUpScreen] Opening LinkedIn redirect URL:', redirectUrl)
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.location.href = redirectUrl
            } else {
              await Linking.openURL(redirectUrl)
            }
          } else {
            console.error('[SignUpScreen] No redirect URL received from LinkedIn auth function (headers, url, or body)')
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
        redirectTo = 'investi-community://auth/callback'
        skipBrowserRedirect = false
      }
      console.log('[SignUpScreen] OAuth redirectTo:', redirectTo, 'Platform:', Platform.OS)

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
        console.error('[SignUpScreen] ❌ OAuth error:', error)
        throw error
      }

      const url = (data && (data.url || data?.providerUrl || data?.redirectTo)) || null
      console.log('[SignUpScreen] ✅ OAuth URL received:', url ? 'Yes' : 'No')
      
      if (url) {
        console.log('[SignUpScreen] 🚀 Redirecting to OAuth provider...')
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = url
        } else {
          await Linking.openURL(url)
        }
      } else {
        console.error('[SignUpScreen] ❌ No OAuth URL received from Supabase')
        throw new Error('No se recibió URL de autenticación')
      }
    } catch (err: any) {
      console.error('[SignUpScreen] ❌ OAuth error:', err)
      Alert.alert("Error", err?.message || "No se pudo continuar con el proveedor seleccionado")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !username) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      // 0. VALIDAR si el email ya existe en la base de datos
      const { data: existingUserByEmail } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (existingUserByEmail) {
        Alert.alert(
          "Cuenta existente",
          "Este correo ya está registrado. Por favor inicia sesión.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ir a Iniciar Sesión", onPress: () => navigation.navigate("SignIn") }
          ]
        )
        return
      }

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim().toLowerCase(),
          }
        }
      })

      if (authError) {
        // Verificar si es error de email duplicado
        if (authError.message?.includes("already") || authError.message?.includes("registered")) {
          Alert.alert(
            "Cuenta existente",
            "Este correo ya está registrado. Por favor inicia sesión.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Ir a Iniciar Sesión", onPress: () => navigation.navigate("SignIn") }
            ]
          )
          return
        }
        throw authError
      }
      
      if (!authData.user) {
        throw new Error("No se pudo crear el usuario")
      }

      // 2. Verificar si el perfil ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, onboarding_step')
        .eq('id', authData.user.id)
        .single()

      if (existingUser) {
        // Usuario YA EXISTE en BD
        console.log("⚠️ Usuario ya existe en BD:", existingUser.email)
        console.log("📊 onboarding_step actual:", existingUser.onboarding_step)
        
        // CASO 1: Usuario completó onboarding → Rechazar
        if (existingUser.onboarding_step === 'completed') {
          console.error("❌ Usuario ya completó onboarding")
          Alert.alert(
            "Cuenta existente",
            "Este correo ya está registrado y completó el onboarding. Por favor inicia sesión.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Ir a Iniciar Sesión", onPress: () => navigation.navigate("SignIn") }
            ]
          )
          return
        }
        
        // CASO 2: Usuario NO completó onboarding → CONTINUAR
        console.log("✅ Usuario existe pero NO completó onboarding → Continuar")
        console.log("🔄 Reseteando onboarding_step a 'upload_avatar'")
        
        // FORZAR onboarding_step a 'upload_avatar' para empezar desde el inicio
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: fullName.trim(),
            nombre: fullName.trim(),
            username: username.trim().toLowerCase(),
            onboarding_step: 'upload_avatar' // ✅ FORZAR inicio de onboarding
          })
          .eq('id', authData.user.id)
        
        if (updateError) {
          console.error("❌ Error actualizando usuario:", updateError)
          Alert.alert("Error", "No se pudo actualizar el perfil")
          return
        }
        
        console.log("✅ onboarding_step actualizado a 'upload_avatar'")
      } else {
        // 3. Crear perfil de usuario (usuario nuevo)
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            nombre: fullName.trim(),
            username: username.trim().toLowerCase(),
            onboarding_step: 'upload_avatar', // CRÍTICO: Establecer paso inicial
          })

        if (profileError) {
          console.error("❌ Error creating profile:", profileError)
          Alert.alert("Error", "No se pudo crear el perfil de usuario")
          return
        }
        
        console.log("✅ Nuevo usuario creado, iniciará onboarding")
      }

      // 3. Limpiar flags de onboarding anteriores para forzar onboarding completo
      await AsyncStorage.multiRemove([
        'onboarding_complete',
        'avatar_uploaded',
        'goals_selected',
        'interests_selected',
        'knowledge_selected'
      ])
      
      // 4. Pequeño delay para asegurar que BD se actualice
      console.log("⏳ Esperando propagación de BD...")
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log("✅ BD actualizada, procediendo con auto-login")

      // 5. NO hacer auto-login, navegar directamente
      // El usuario ya está autenticado por el signUp de Supabase
      console.log('✅ SignUp exitoso - Navegando DIRECTAMENTE a UploadAvatar')
      
      // 6. RESETEAR stack de navegación INMEDIATAMENTE
      console.log('📸 RESETEANDO navegación a UploadAvatar')
      navigation.reset({
        index: 0,
        routes: [{ name: 'UploadAvatar' }],
      })

    } catch (error: any) {
      console.error("SignUp error:", error)
      
      let errorMessage = "Error al crear la cuenta"
      if (error.message?.includes("already registered")) {
        errorMessage = "Este correo ya está registrado"
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Correo electrónico inválido"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      Alert.alert("Error", errorMessage)
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
            <Text style={styles.welcomeTitle}>Crear Cuenta</Text>
            <Text style={styles.welcomeSubtitle}>Únete a Investi hoy</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <UserCircle size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de usuario"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
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
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login Section */}
          <View style={styles.socialLoginSection}>
            <Text style={styles.socialLoginText}>¿Ya tienes cuenta? <Text style={styles.signInLink} onPress={() => navigation.navigate('SignIn')}>Inicia sesión</Text></Text>
            
            {/* Social Icons Row */}
            <View style={styles.socialIconsRow}>
              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("facebook")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <FacebookIcon size={56} />
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("google")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <GoogleIcon size={56} />
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("linkedin_oidc")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <LinkedInIcon size={56} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Al registrarte en Investi, aceptas nuestros Términos y Políticas de Privacidad.
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
  signUpButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
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
  signInLink: {
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
  termsContainer: {
    marginTop: 24,
    paddingBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
})