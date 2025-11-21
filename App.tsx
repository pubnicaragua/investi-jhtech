import { useState } from "react"
import { I18nextProvider } from "react-i18next"  
import { SafeAreaProvider } from 'react-native-safe-area-context'  
import { NavigationContainer } from '@react-navigation/native';
import { RootStack } from "./navigation"
import * as Linking from "expo-linking"  
import i18n from "./src/i18n/i18n"
import { AuthProvider, useAuth } from "./src/contexts/AuthContext"
import { LanguageProvider } from "./src/contexts/LanguageContext"
import { SplashScreen } from "./src/components/SplashScreen"
import { useOnlineStatus } from "./src/hooks/useOnlineStatus"
// DESHABILITADO: Causa error TurboModuleRegistry al cargar todas las pantallas
// import { TESTING_CONFIG, TestingScreen } from "./src/utils/screenTesting"  

// Configuración de Deep Linking para OAuth
const linking = {
  prefixes: [
    'investi-community://', 
    'https://investi.app',
    'https://paoliakwfoczcallnecf.supabase.co',
    'http://localhost:19006'
  ],
  config: {
    screens: {
      SignIn: 'auth/signin',
      SignUp: 'auth/signup',
      AuthCallback: 'auth/callback',
      Welcome: '',
    },
  },
};

// Componente interno que usa useAuth
function AppContent() {
  const { user } = useAuth();
  
  // Hook para actualizar estado online/offline automáticamente
  useOnlineStatus(user?.id || null);
  
  return (
    <NavigationContainer linking={linking}>
      <RootStack />
    </NavigationContainer>
  );
}

export default function App() {  
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  // 🚀 Modo producción normal (Testing deshabilitado para evitar error TurboModuleRegistry)
  return (  
    <SafeAreaProvider>  
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>  
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </I18nextProvider>
      </LanguageProvider>
    </SafeAreaProvider>  
  )  
}