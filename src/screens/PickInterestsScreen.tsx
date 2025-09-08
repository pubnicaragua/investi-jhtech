import React, { useState, useEffect } from "react"  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  SafeAreaView,  
  StyleSheet,  
  ScrollView,  
  ActivityIndicator,  
  Alert,  
} from "react-native"  
import { ArrowLeft } from "lucide-react-native"  
import { getCurrentUserId } from "../api"  
import { supabase } from "../supabase"  
  
const INTERESTS = [  
  { id: "local", icon: "🇨🇱", text: "Acciones Locales" },  
  { id: "crypto", icon: "₿", text: "Criptomonedas" },  
  { id: "foreign", icon: "🌍", text: "Acciones Extranjeras" },  
  { id: "deposit", icon: "🏦", text: "Depósitos a plazo" },  
  { id: "realestate", icon: "🏢", text: "Inversión Inmobiliaria" },  
  { id: "education", icon: "🎓", text: "Educación Financiera" },  
  { id: "funds", icon: "📊", text: "Fondos Mutuos" },  
  { id: "startups", icon: "🚀", text: "Startups" },  
]  
  
export const PickInterestsScreen = ({ navigation }: any) => {  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])  
  const [loading, setLoading] = useState(false)  
  const [initialLoading, setInitialLoading] = useState(true)  
  
  useEffect(() => {  
    loadUserData()  
  }, [])  
  
  const loadUserData = async () => {  
    try {  
      const uid = await getCurrentUserId()  
      if (uid) {  
        // Intentar cargar datos existentes, pero no fallar si no existen  
        try {  
          const { data: user, error } = await supabase  
            .from("users")  
            .select("intereses")  
            .eq("id", uid)  
            .maybeSingle() // Usar maybeSingle en lugar de single para evitar error si no existe  
  
          if (user?.intereses && Array.isArray(user.intereses)) {  
            setSelectedInterests(user.intereses)  
          }  
        } catch (loadError) {  
          console.log("No existing interests found, starting fresh")  
        }  
      }  
    } catch (error) {  
      console.error("Error loading user data:", error)  
    } finally {  
      setInitialLoading(false)  
    }  
  }  
  
  const toggleInterest = (id: string) => {  
    setSelectedInterests((prev) => {  
      if (prev.includes(id)) {  
        return prev.filter((item) => item !== id)  
      }  
      return [...prev, id]  
    })  
  }  
  
  // Función que usa RPC para evitar completamente el cache de PostgREST  
  const updateUserInterestsViaRPC = async (userId: string, interests: string[]) => {  
    try {  
      // Crear una función RPC en Supabase si no existe  
      const { data, error } = await supabase.rpc('update_user_interests', {  
        user_id: userId,  
        new_interests: interests  
      })  
  
      if (error) {  
        // Si la función RPC no existe, usar SQL directo  
        throw error  
      }  
  
      return data  
    } catch (rpcError) {  
      console.log("RPC not available, using direct SQL update")  
        
      // Fallback: usar SQL directo con upsert  
      const { data, error } = await supabase  
        .from("users")  
        .upsert({   
          id: userId,   
          intereses: interests   
        }, {   
          onConflict: 'id',  
          ignoreDuplicates: false   
        })  
        .select()  
  
      if (error) {  
        console.error("Direct SQL update error:", error)  
        throw error  
      }  
  
      return data  
    }  
  }  
  
  const handleContinue = async () => {  
    if (selectedInterests.length < 3) {  
      Alert.alert("Error", "Selecciona al menos 3 intereses para continuar")  
      return  
    }  
  
    setLoading(true)  
    try {  
      const uid = await getCurrentUserId()  
      if (uid) {  
        await updateUserInterestsViaRPC(uid, selectedInterests)  
        console.log("Interests updated successfully")  
          
        // Navegar a la siguiente pantalla disponible  
        // Cambiar "PickKnowledgeLevel" por una pantalla que exista  
        navigation.navigate("PickGoals")  
      }  
    } catch (error: any) {  
      console.error("Error updating interests:", error)  
      Alert.alert(  
        "Error",   
        "No se pudieron guardar tus intereses. ¿Deseas continuar de todas formas?",  
        [  
          { text: "Reintentar", onPress: () => handleContinue() },  
          { text: "Continuar", onPress: () => navigation.navigate("PickGoals") }  
        ]  
      )  
    } finally {  
      setLoading(false)  
    }  
  }  
  
  if (initialLoading) {  
    return (  
      <SafeAreaView style={styles.container}>  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#007AFF" />  
        </View>  
      </SafeAreaView>  
    )  
  }  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <View style={styles.headerRight} />  
      </View>  
  
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>  
        <View style={styles.content}>  
          <Text style={styles.title}>  
            ¿Cuáles son tus <Text style={styles.titleBlue}>intereses</Text>?  
          </Text>  
          <Text style={styles.subtitle}>Selecciona al menos 3 temas para comenzar</Text>  
  
          <View style={styles.interestsContainer}>  
            {INTERESTS.map((item) => (  
              <TouchableOpacity  
                key={item.id}  
                style={[  
                  styles.interestItem,  
                  selectedInterests.includes(item.id) && styles.interestItemSelected,  
                ]}  
                onPress={() => toggleInterest(item.id)}  
              >  
                <Text style={styles.interestIcon}>{item.icon}</Text>  
                <Text  
                  style={[  
                    styles.interestText,  
                    selectedInterests.includes(item.id) && styles.interestTextSelected,  
                  ]}  
                >  
                  {item.text}  
                </Text>  
              </TouchableOpacity>  
            ))}  
          </View>  
  
          <View style={styles.progressContainer}>  
            <Text style={styles.progressText}>  
              {selectedInterests.length}/3 seleccionados  
            </Text>  
          </View>  
        </View>  
      </ScrollView>  
  
      <View style={styles.footer}>  
        <TouchableOpacity  
          style={[  
            styles.continueButton,  
            (selectedInterests.length < 3 || loading) && styles.continueButtonDisabled,  
          ]}  
          onPress={handleContinue}  
          disabled={selectedInterests.length < 3 || loading}  
        >  
          {loading ? (  
            <ActivityIndicator color="white" />  
          ) : (  
            <Text style={styles.continueButtonText}>Continuar</Text>  
          )}  
        </TouchableOpacity>  
      </View>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "#FFFFFF",  
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
  headerRight: {  
    width: 40,  
  },  
  scrollView: {  
    flex: 1,  
  },  
  content: {  
    paddingHorizontal: 24,  
    paddingBottom: 100,  
  },  
  title: {  
    fontFamily: "Figtree-Bold",  
    fontSize: 22,  
    color: "#111",  
    textAlign: "center",  
    marginBottom: 8,  
    lineHeight: 28,  
  },  
  titleBlue: {  
    color: "#007AFF",  
  },  
  subtitle: {  
    fontFamily: "Figtree-Regular",  
    fontSize: 15,  
    color: "#666",  
    textAlign: "center",  
    marginBottom: 32,  
    lineHeight: 22,  
  },  
  interestsContainer: {  
    gap: 12,  
  },  
  interestItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    backgroundColor: "white",  
    paddingHorizontal: 20,  
    paddingVertical: 14,  
    borderRadius: 12,  
    borderWidth: 1.5,  
    borderColor: "#E5E5E5",  
  },  
  interestItemSelected: {  
    borderColor: "#007AFF",  
    backgroundColor: "#F0F7FF",  
  },  
  interestIcon: {  
    fontSize: 20,  
    marginRight: 14,  
  },  
  interestText: {  
    fontFamily: "Figtree-Regular",  
    fontSize: 15,  
    color: "#111",  
    flex: 1,  
  },  
  interestTextSelected: {  
    color: "#007AFF",  
    fontFamily: "Figtree-Medium",  
  },  
  progressContainer: {  
    alignItems: "center",  
    marginTop: 20,  
  },  
  progressText: {  
    fontSize: 14,  
    color: "#666",  
    fontFamily: "Figtree-Regular",  
  },  
  footer: {  
    paddingHorizontal: 24,  
    paddingBottom: 30,  
    paddingTop: 16,  
    backgroundColor: "white",  
  },  
  continueButton: {  
    backgroundColor: "#007AFF",  
    paddingVertical: 14,  
    borderRadius: 12,  
    alignItems: "center",  
  },  
  continueButtonDisabled: {  
    backgroundColor: "#C7C7C7",  
  },  
  continueButtonText: {  
    color: "white",  
    fontSize: 15,  
    fontFamily: "Figtree-SemiBold",  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: "center",  
    alignItems: "center",  
  },  
})