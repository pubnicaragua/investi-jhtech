import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => Promise<void>
  isLanguageSelected: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState<string>('es')
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false)

  useEffect(() => {
    loadLanguagePreference()
  }, [])

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user_language')
      const languageSelected = await AsyncStorage.getItem('language_selected')
      
      if (savedLanguage) {
        setLanguageState(savedLanguage)
        await i18n.changeLanguage(savedLanguage)
      }
      
      if (languageSelected === 'true') {
        setIsLanguageSelected(true)
      }
    } catch (error) {
      console.error('Error loading language preference:', error)
    }
  }

  const setLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('user_language', lang)
      await AsyncStorage.setItem('language_selected', 'true')
      setLanguageState(lang)
      setIsLanguageSelected(true)
      await i18n.changeLanguage(lang)
    } catch (error) {
      console.error('Error saving language preference:', error)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageSelected }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
