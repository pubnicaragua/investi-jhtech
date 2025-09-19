import React from 'react'
import * as SecureStore from 'expo-secure-store'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
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

  const handleLanguageSelect = async (lang: string) => {
    try {
      await setLanguage(lang)
      // Guardar en SecureStore que ya se seleccionó el idioma
      await SecureStore.setItemAsync('@user_language', lang)
      
      // Navegar a Welcome
      if (onLanguageSelected) {
        onLanguageSelected()
      } else if (navigation) {
        navigation.navigate('Welcome')
      }
    } catch (error) {
      console.error('Error al guardar el idioma:', error)
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
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('es')}
          >
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇪🇸</Text>
            </View>
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>Español</Text>
              <Text style={styles.languageNative}>Spanish</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('en')}
          >
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇺🇸</Text>
            </View>
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>English</Text>
              <Text style={styles.languageNative}>Inglés</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo-investi.jpeg")}
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
})
