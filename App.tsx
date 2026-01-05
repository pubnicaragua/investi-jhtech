import { useState, useEffect } from "react"
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

// Aplicar estilos globales para web en tiempo de ejecución
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    html, body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      position: fixed;
      top: 0;
      left: 0;
    }
    
    #root {
      height: 100vh;
      width: 100vw;
      overflow-y: auto;
      overflow-x: hidden;
      position: fixed;
      top: 0;
      left: 0;
    }
    
    /* Permitir scroll cuando el drawer está abierto */
    body.drawer-open {
      overflow: hidden;
    }
    
    body.drawer-open #root {
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}  

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