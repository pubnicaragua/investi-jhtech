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
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react-native"
// import { signInWithEmail, getCurrentUser } from "../rest/api"
import { useNavigation } from "@react-navigation/native"
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
      await signIn(email, password);
      // La navegación se manejará automáticamente por el AuthProvider
      console.log("SignIn successful - user authenticated");
    } catch (error: any) {
      console.error("SignIn error:", error);
      Alert.alert(
        "Error",
        error.message || "Error al iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar sesión</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Formulario */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading || isLoading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signInButtonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botones Sociales */}
        <View style={styles.socialButtons}>
          <TouchableOpacity style={[styles.socialButton, styles.linkedinButton]} onPress={() => handleOAuth('linkedin_oidc')}>
            <View style={styles.socialIcon}>
              <Text style={styles.linkedinIcon}>in</Text>
            </View>
            <Text style={styles.linkedinText}>Inicia sesión con LinkedIn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => handleOAuth('google')}>
            <View style={styles.socialIcon}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleText}>Inicia sesión con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={() => handleOAuth('apple')}>
            <View style={styles.socialIcon}>
              <Text style={styles.appleIcon}>🍎</Text>
            </View>
            <Text style={styles.appleText}>Inicia sesión con Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={() => handleOAuth('facebook')}>
            <View style={styles.socialIcon}>
              <Text style={styles.facebookIcon}>f</Text>
            </View>
            <Text style={styles.facebookText}>Inicia sesión con Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          Al registrarte en Investi, tu aceptas nuestros Términos y{"\n"}
          Políticas de Privacidad.
        </Text>
      </ScrollView>
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
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#111',
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  // logoContainer movido más abajo para evitar duplicados
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
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 0,
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: "#2673f3",
    paddingVertical: 18,
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
    color: "#2673f3",
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  socialButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  linkedinButton: {
    backgroundColor: "#f5f5f5",
  },
  googleButton: {
    backgroundColor: "#f5f5f5",
  },
  appleButton: {
    backgroundColor: "#f5f5f5",
  },
  facebookButton: {
    backgroundColor: "#f5f5f5",
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  scrollView: {
    flex: 1,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5e5",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#999",
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4285F4",
  },
  googleText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  linkedinIcon: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0A66C2",
  },
  linkedinText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appleIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  appleText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  facebookIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1877F2",
  },
  facebookText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 18,
  },
})
