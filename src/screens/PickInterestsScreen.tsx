import React, { useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from "react-i18next"  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  StyleSheet,  
  ScrollView,  
  ActivityIndicator,  
  Alert,
  Image,
  Modal,
} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'  
import { 
  Flag, 
  Bitcoin, 
  Globe, 
  Building2, 
  Home, 
  GraduationCap, 
  TrendingUp, 
  Rocket,
  Info,
  X
} from "lucide-react-native"
  
import { getCurrentUserId, getInvestmentInterests, saveUserInterests } from "../rest/api"  

interface InvestmentInterest {
  id: string
  name: string
  description?: string
  icon?: string
  category: string
  risk_level?: string
  popularity_score?: number
}

// Descripciones detalladas por tipo de inversión
const INTEREST_DESCRIPTIONS: Record<string, { description: string, risk: string }> = {
  'Acciones Internacionales': {
    description: 'Invierte en empresas de alto potencial en otros mercados.',
    risk: 'Medio-Alto'
  },
  'Acciones Locales': {
    description: 'Invierte en las principales empresas de tu país.',
    risk: 'Medio-Alto'
  },
  'Criptomonedas': {
    description: 'Invierte en activos digitales descentralizados como Bitcoin y Ethereum.',
    risk: 'Muy Alto'
  },
  'Depósitos a Plazo': {
    description: 'Inversión segura con rentabilidad fija garantizada.',
    risk: 'Bajo'
  },
  'Depósitos a plazo': {
    description: 'Inversión segura con rentabilidad fija garantizada.',
    risk: 'Bajo'
  },
  'Fondos Mutuos': {
    description: 'Accede a múltiples activos (acciones, bonos, inmobiliario) con una sola inversión.',
    risk: 'Medio-Alto'
  },
  'Crowdfunding Inmobiliario': {
    description: 'Invierte en proyectos inmobiliarios con montos accesibles.',
    risk: 'Medio-Alto'
  },
  'Inversión Inmobiliaria': {
    description: 'Invierte en propiedades para generar ingresos por arriendo o plusvalía.',
    risk: 'Medio-Alto'
  },
  'Educación Financiera': {
    description: 'Invierte en tu conocimiento financiero para tomar mejores decisiones.',
    risk: 'Rentabilidad Alta'
  },
  'Startups': {
    description: 'Invierte en empresas emergentes con alto potencial de crecimiento.',
    risk: 'Muy Alto'
  }
}

// ICONOS LUCIDE - Mapeo por categoría
const INTEREST_ICON_COMPONENTS: Record<string, any> = {
  'stocks': Flag,
  'crypto': Bitcoin,
  'international_stocks': Globe,
  'deposits': Building2,
  'real_estate': Home,
  'education': GraduationCap,
  'mutual_funds': TrendingUp,
  'startups': Rocket
}

const INTEREST_ICON_COLORS: Record<string, string> = {
  'stocks': '#EF4444',
  'crypto': '#F59E0B',
  'international_stocks': '#3B82F6',
  'deposits': '#10B981',
  'real_estate': '#8B5CF6',
  'education': '#EC4899',
  'mutual_funds': '#06B6D4',
  'startups': '#6366F1'
}

export const PickInterestsScreen = ({ navigation }: any) => {  
  const { t } = useTranslation()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])  
  const [loading, setLoading] = useState(false)  
  const [initialLoading, setInitialLoading] = useState(true)
  const [interests, setInterests] = useState<InvestmentInterest[]>([])  
  
  useEffect(() => {  
    loadUserData()  
  }, [])  
  
  const loadUserData = async () => {  
    try {  
      const interestsData = await getInvestmentInterests()
      
      if (interestsData) {
        console.log('⚠️ NOMBRES EXACTOS DE INTERESES:', interestsData.map((i: any) => i.name))
        setInterests(interestsData)
      }
    } catch (error) {  
      console.error("Error loading user data:", error)  
    } finally {
      setInitialLoading(false)
    }
  }

  const [selectedInterestInfo, setSelectedInterestInfo] = useState<InvestmentInterest | null>(null)
  const [showInterestModal, setShowInterestModal] = useState(false)

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {  
      if (prev.includes(id)) {  
        return prev.filter((item) => item !== id)  
      } else {  
        if (prev.length >= 3) {
          Alert.alert(
            "Límite alcanzado",
            "Puedes seleccionar un máximo de 3 intereses. Deselecciona uno para elegir otro.",
            [{ text: "Entendido" }]
          )
          return prev
        }
        return [...prev, id]  
      }  
    })  
  }

  const showInterestInfo = (interest: InvestmentInterest) => {
    setSelectedInterestInfo(interest)
    setShowInterestModal(true)
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
        await saveUserInterests(uid, selectedInterests, 'beginner')
        console.log("Interests updated successfully")  
        
        // Marcar paso como completado
        await AsyncStorage.setItem('interests_selected', 'true')
          
        navigation.navigate("PickKnowledge")  
      }  
    } catch (error: any) {  
      console.error("Error updating interests:", error)  
      Alert.alert(  
        "Error",   
        "No se pudieron guardar tus intereses. ¿Deseas continuar de todas formas?",  
        [  
          { text: "Reintentar", onPress: () => handleContinue() },  
          { text: "Continuar", onPress: () => navigation.navigate("PickKnowledge") }  
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>  
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>  
          <Text style={styles.backButtonText}>{"<"}</Text>  
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
            {interests.map((item) => {
              const iconColor = INTEREST_ICON_COLORS[item.category] || '#2673f3'
              const isSelected = selectedInterests.includes(item.id)
              
              return (
                <TouchableOpacity  
                  key={item.id}
                  style={[  
                    styles.interestItem,  
                    isSelected && styles.interestItemSelected,  
                  ]}  
                  onPress={() => toggleInterest(item.id)}  
                >  
                  <View style={[styles.iconContainer, isSelected && { backgroundColor: iconColor + '20' }]}>  
                    {item.name.toLowerCase().includes('cripto') ? (
                      <Image 
                        source={require('../../assets/logos_bitcoin.png')}
                        style={styles.bitcoinIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.emojiIcon}>
                        {item.name.toLowerCase().includes('acciones locales') || item.name.toLowerCase().includes('local') 
                          ? '🇨🇱' 
                          : item.icon || '📊'}
                      </Text>
                    )}
                  </View>  
                  <Text  
                    style={[  
                      styles.interestText,  
                      isSelected && styles.interestTextSelected,  
                    ]}  
                  >  
                    {item.name}  
                  </Text>
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      showInterestInfo(item)
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Info size={18} color="#6B7280" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}  
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

      {/* Modal de información de interés */}
      <Modal
        visible={showInterestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInterestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedInterestInfo?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowInterestModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                {INTEREST_DESCRIPTIONS[selectedInterestInfo?.name || '']?.description || 
                  selectedInterestInfo?.description || 
                  "Información detallada sobre este tipo de inversión."}
              </Text>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Nivel de riesgo:</Text>
                <Text style={[styles.modalInfoValue, {
                  color: INTEREST_DESCRIPTIONS[selectedInterestInfo?.name || '']?.risk === 'Muy Alto' ? '#EF4444' :
                         INTEREST_DESCRIPTIONS[selectedInterestInfo?.name || '']?.risk === 'Alto' ? '#F59E0B' :
                         INTEREST_DESCRIPTIONS[selectedInterestInfo?.name || '']?.risk === 'Medio-Alto' ? '#FBBF24' :
                         INTEREST_DESCRIPTIONS[selectedInterestInfo?.name || '']?.risk === 'Medio' ? '#3B82F6' :
                         '#10B981'
                }]}>
                  {INTEREST_DESCRIPTIONS[selectedInterestInfo?.name || '']?.risk || 
                   selectedInterestInfo?.risk_level || 'No especificado'}
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowInterestModal(false)}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,  
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
    fontSize: 20,  
    fontWeight: '600',
    color: "#111",  
    textAlign: "center",  
    marginBottom: 8,  
    lineHeight: 28,  
  },  
  titleBlue: {  
    color: "#2673f3",  
  },  
  subtitle: {  
    fontSize: 14,  
    color: "#666",  
    textAlign: "center",  
    marginBottom: 32,  
    lineHeight: 20,  
  },  
  interestsContainer: {},
  interestItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    padding: 16,  
    backgroundColor: "white",  
    borderRadius: 12,  
    marginBottom: 12,
    borderWidth: 1,  
    borderColor: "#E5E5E5",
    position: 'relative',
  },
  infoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },  
  interestItemSelected: {  
    borderColor: "#2673f3",  
    backgroundColor: "#f0f7ff",  
  },  
  iconContainer: {  
    width: 44,  
    height: 44,  
    borderRadius: 10,  
    backgroundColor: '#F3F4F6',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginRight: 12,  
  },  
  interestText: {  
    fontSize: 15,  
    color: "#111",  
    flex: 1,
    fontWeight: '500',
  },  
  interestTextSelected: {  
    color: "#2673f3",  
    fontWeight: '600',
  },  
  progressContainer: {  
    alignItems: "center",  
    marginTop: 20,  
  },  
  progressText: {  
    fontSize: 14,  
    color: "#666",  
  },  
  footer: {  
    paddingHorizontal: 24,  
    paddingBottom: 30,  
    paddingTop: 16,  
    backgroundColor: "white",  
  },  
  continueButton: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 16,  
    borderRadius: 12,  
    alignItems: "center",  
  },  
  continueButtonDisabled: {  
    backgroundColor: "#C7C7C7",  
  },  
  continueButtonText: {  
    color: "white",  
    fontSize: 16,  
    fontWeight: '600',
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: "center",  
    alignItems: "center",  
  },
  emojiIcon: {
    fontSize: 32,
  },
  bitcoinIcon: {
    width: 32,
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#2673f3',
    paddingVertical: 14,
    alignItems: 'center',
    margin: 20,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})