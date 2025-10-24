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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from "../supabase"
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

      if (authError) throw authError
      
      if (!authData.user) {
        throw new Error("No se pudo crear el usuario")
      }

      // 2. Verificar si el perfil ya existe, si no, crearlo
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (!existingUser) {
        // Solo insertar si no existe
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            nombre: fullName.trim(),
            username: username.trim().toLowerCase(),
          })

        if (profileError) {
          console.error("Error creating profile:", profileError)
          // No lanzar error aquí, el usuario ya fue creado en auth
        }
      } else {
        console.log("✅ User profile already exists, skipping insert")
      }

      // 3. Limpiar flags de onboarding anteriores
      await AsyncStorage.multiRemove([
        'onboarding_complete',
        'avatar_uploaded',
        'goals_selected',
        'interests_selected',
        'knowledge_selected'
      ])

      // 4. Auto-login después del registro
      await authSignIn(email.trim().toLowerCase(), password)

      Alert.alert(
        "¡Cuenta creada!",
        "Tu cuenta ha sido creada exitosamente. Ahora completa tu perfil.",
        [{ text: "Continuar", onPress: () => navigation.navigate("UploadAvatar") }]
      )

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
                <View style={[styles.socialIcon, styles.facebookIconBg]}>
                  <Text style={styles.facebookIcon}>f</Text>
                </View>
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("google")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleOAuth("linkedin_oidc")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={[styles.socialIcon, styles.linkedinIconBg]}>
                  <Text style={styles.linkedinIcon}>in</Text>
                </View>
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
  linkedinIconBg: {
    backgroundColor: '#0A66C2',
  },
  facebookIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkedinIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4285F4',
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