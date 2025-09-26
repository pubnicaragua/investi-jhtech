import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useLanguage } from '../contexts/LanguageContext'
import { Globe } from 'lucide-react-native'

interface LanguageSelectionScreenProps {
  navigation: any
  onLanguageSelected?: () => void
}

export function LanguageSelectionScreen({ navigation: navProp, onLanguageSelected }: LanguageSelectionScreenProps) {
  const navigation = useNavigation<StackNavigationProp<any>>()
  const { setLanguage } = useLanguage()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLanguageSelect = async (lang: string) => {
    console.log('🔥 BOTÓN PRESIONADO! Idioma:', lang)
    
    // Alert para confirmar que el touch funciona
    // alert(`Botón ${lang} presionado!`) // Descomenta si necesitas confirmar touch
    
    if (isLoading) {
      console.log('⏳ Ya está cargando, ignorando clic')
      return // Prevenir múltiples clics
    }
    
    try {
      setIsLoading(true)
      console.log('🌍 LanguageSelectionScreen: Iniciando selección de idioma:', lang)
      
      // Guardar idioma usando el contexto
      await setLanguage(lang)
      console.log('✅ LanguageSelectionScreen: Idioma guardado exitosamente')
      
      // Verificar que se guardó correctamente
      const savedLang = await AsyncStorage.getItem('user_language')
      const langSelected = await AsyncStorage.getItem('language_selected')
      console.log('🔍 LanguageSelectionScreen: Verificación - idioma guardado:', savedLang)
      console.log('🔍 LanguageSelectionScreen: Verificación - flag seleccionado:', langSelected)
      
      // Pequeña pausa para mostrar feedback visual
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // NAVEGACIÓN DIRECTA Y SIMPLE
      console.log('🧭 LanguageSelectionScreen: Iniciando navegación a Welcome...')
      
      try {
        // Método 1: Hook de navegación
        if (navigation && typeof navigation.replace === 'function') {
          console.log('🚀 Método 1: navigation.replace("Welcome")')
          navigation.replace('Welcome')
        } 
        // Método 2: Prop de navegación
        else if (navProp && typeof navProp.replace === 'function') {
          console.log('🚀 Método 2: navProp.replace("Welcome")')
          navProp.replace('Welcome')
        }
        // Método 3: Navigate normal
        else if (navigation && typeof navigation.navigate === 'function') {
          console.log('🚀 Método 3: navigation.navigate("Welcome")')
          navigation.navigate('Welcome')
        }
        // Método 4: NavProp navigate
        else if (navProp && typeof navProp.navigate === 'function') {
          console.log('🚀 Método 4: navProp.navigate("Welcome")')
          navProp.navigate('Welcome')
        }
        // Método 5: Callback
        else if (onLanguageSelected) {
          console.log('🚀 Método 5: onLanguageSelected callback')
          onLanguageSelected()
        }
        else {
          console.error('❌ NO HAY NAVEGACIÓN DISPONIBLE!')
          console.log('navigation:', navigation)
          console.log('navProp:', navProp)
          console.log('onLanguageSelected:', onLanguageSelected)
        }
      } catch (navError) {
        console.error('❌ ERROR EN NAVEGACIÓN:', navError)
      }
    } catch (error) {
      console.error('❌ LanguageSelectionScreen: Error al guardar el idioma:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Globe size={48} color="#2673f3" />
          </View>
          
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.titleSpanish}>Elige tu idioma</Text>
          <Text style={styles.subtitle}>
            Select your preferred language to continue
          </Text>
          <Text style={styles.subtitleSpanish}>
            Selecciona tu idioma preferido para continuar
          </Text>
        </View>

        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.languageButton, isLoading && styles.languageButtonDisabled]}
            onPress={() => handleLanguageSelect('es')}
            disabled={isLoading}
          >
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇪🇸</Text>
            </View>
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>Español</Text>
              <Text style={styles.languageNative}>Spanish</Text>
            </View>
            {isLoading && (
              <ActivityIndicator size="small" color="#2673f3" style={styles.loadingIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageButton, isLoading && styles.languageButtonDisabled]}
            onPress={() => handleLanguageSelect('en')}
            disabled={isLoading}
          >
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇺🇸</Text>
            </View>
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>English</Text>
              <Text style={styles.languageNative}>Inglés</Text>
            </View>
            {isLoading && (
              <ActivityIndicator size="small" color="#2673f3" style={styles.loadingIndicator} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/investi-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(38, 115, 243, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleSpanish: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleSpanish: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  languageContainer: {
    gap: 16,
    marginTop: 40,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flagContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flag: {
    fontSize: 32,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
    color: '#666',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 50,
    opacity: 0.7,
  },
  languageButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  loadingIndicator: {
    marginLeft: 12,
  },
})
