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
  Image,
  ActivityIndicator,
} from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native"
import { signIn, getCurrentUser } from "../api"
import { supabase } from "../supabase"
import { useAuth } from "../contexts/AuthContext"

export function SignInScreen({ navigation }: any) {
  const { t } = useTranslation()
  const { signIn: authSignIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(t("common.error"), t("auth.enterEmailForReset") || "Ingresa tu correo para restablecer la contraseña")
      return
    }
    try {
      setLoading(true)
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : 'https://investi.app'}/auth/callback`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      Alert.alert(t("common.success") || "Éxito", t("auth.resetEmailSent") || "Te enviamos un correo para restablecer la contraseña")
    } catch (err: any) {
      Alert.alert("Error", err.message || "No fue posible enviar el correo de restablecimiento")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple' | 'facebook' | 'linkedin_oidc') => {
    try {
      setLoading(true)
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : 'https://investi.app'}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (error) throw error
      // En RN, supabase abrirá un navegador; el flujo volverá por deep link
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo iniciar con el proveedor seleccionado")
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
      const authData = await signIn(email, password)
      
      if (authData.session) {
        // Get or create user profile data
        const userData = await getCurrentUser()
        
        if (userData) {
          // Use AuthContext to properly set authentication state
          await authSignIn(
            authData.session.access_token,
            authData.session.refresh_token,
            {
              id: userData.id,
              email: userData.email,
              name: userData.full_name || userData.nombre,
              username: userData.username,
              photo_url: userData.avatar_url || userData.photo_url,
              created_at: userData.fecha_registro
            }
          )
          // Navigate after successful authentication
          navigation.navigate("HomeFeed")
        } else {
          throw new Error("No se pudo obtener o crear el perfil del usuario")
        }
      } else {
        throw new Error("No se pudo obtener la sesión de autenticación")
      }
    } catch (error: any) {
      console.error("SignIn error:", error)
      Alert.alert("Error", error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("auth.signIn")}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://www.investiiapp.com/investi-logo-new-main.png",
            }}
            style={styles.illustration}
            resizeMode="contain"
          />

          <View style={styles.brandContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>i</Text>
            </View>
            <Text style={styles.brandText}>Investí</Text>
            <Text style={styles.brandSubtext}>community</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t("auth.password")}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signInButtonText}>{t("auth.signIn")}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>{t("auth.forgotPassword")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={[styles.socialButton, styles.linkedinButton]} onPress={() => handleOAuth('linkedin_oidc')}>
            <Text style={styles.socialButtonText}>
              {t("auth.signInWith")} {t("auth.linkedin")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => handleOAuth('google')}>
            <Text style={[styles.socialButtonText, { color: "#333" }]}>
              {t("auth.signInWith")} {t("auth.google")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={() => handleOAuth('apple')}>
            <Text style={styles.socialButtonText}>
              {t("auth.signInWith")} {t("auth.apple")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={() => handleOAuth('facebook')}>
            <Text style={styles.socialButtonText}>
              {t("auth.signInWith")} {t("auth.facebook")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  illustration: {
    width: 200,
    height: 150,
    marginBottom: 20,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  brandText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginRight: 4,
  },
  brandSubtext: {
    fontSize: 28,
    fontWeight: "300",
    color: "#667",
  },
  formContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  signInButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  dividerContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: "#ddd",
    borderRadius: 1,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  socialButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  linkedinButton: {
    backgroundColor: "#0A66C2",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
})
