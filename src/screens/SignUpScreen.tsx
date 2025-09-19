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
  Image,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react-native"
// import { signUpWithEmail } from "../rest/api"
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

  const handleOAuth = async (provider: 'google' | 'apple' | 'facebook' | 'linkedin_oidc') => {
    try {
      setLoading(true)
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : 'https://investi.app'}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (error) throw error
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo continuar con el proveedor seleccionado")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !username) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      // For now, just navigate to upload avatar
      console.log("SignUp successful - proceeding to onboarding")
      navigation.navigate("UploadAvatar")
    } catch (error: any) {
      console.error("SignUp error:", error)
      Alert.alert("Error", error.message || "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regístrate</Text>
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

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>Crear cuenta</Text>
            )}
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
            <Text style={styles.linkedinText}>Regístrate con LinkedIn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => handleOAuth('google')}>
            <View style={styles.socialIcon}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleText}>Regístrate con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={() => handleOAuth('apple')}>
            <View style={styles.socialIcon}>
              <Text style={styles.appleIcon}>🍎</Text>
            </View>
            <Text style={styles.appleText}>Regístrate con Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={() => handleOAuth('facebook')}>
            <View style={styles.socialIcon}>
              <Text style={styles.facebookIcon}>f</Text>
            </View>
            <Text style={styles.facebookText}>Regístrate con Facebook</Text>
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
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
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
  scrollView: { 
    flex: 1, 
  }, 
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  formContainer: { 
    paddingTop: 20, 
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
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginBottom: 16,
    borderWidth: 0,
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
  signUpButton: {
    backgroundColor: "#2673f3",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  }, 
  signUpButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600", 
  }, 
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  }, 
  dividerLine: { 
    flex: 1,
    height: 1, 
    backgroundColor: "#e5e5e5", 
  }, 
  dividerText: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 16,
  },
  socialButtons: { 
    gap: 12, 
    marginBottom: 24, 
  }, 
  socialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
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
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  }, 
  termsText: { 
    fontSize: 12, 
    color: "#666", 
    textAlign: "center", 
    lineHeight: 18, 
    marginTop: 20,
    marginBottom: 20, 
  }, 
  linkedinIcon: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0A66C2",
  },
  linkedinText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  appleIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  appleText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  facebookIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1877F2",
  },
  facebookText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  // logoContainer y logo ya están definidos arriba
})