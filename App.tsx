import { I18nextProvider } from "react-i18next"  
import { SafeAreaProvider } from 'react-native-safe-area-context'  
import { NavigationContainer } from '@react-navigation/native';
import { RootStack } from "./navigation"
import * as Linking from "expo-linking"  
import i18n from "./src/i18n/i18n"
import { AuthProvider } from "./src/contexts/AuthContext"
import { LanguageProvider } from "./src/contexts/LanguageContext"
// DESHABILITADO: Causa error TurboModuleRegistry al cargar todas las pantallas
// import { TESTING_CONFIG, TestingScreen } from "./src/utils/screenTesting"  

// Deshabilitar linking temporalmente para Expo Go
const linking = undefined;

export default function App() {  
  // 🚀 Modo producción normal (Testing deshabilitado para evitar error TurboModuleRegistry)
  return (  
    <SafeAreaProvider>  
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>  
          <AuthProvider>
            <NavigationContainer linking={linking}>
              <RootStack />
            </NavigationContainer>
          </AuthProvider>
        </I18nextProvider>
      </LanguageProvider>
    </SafeAreaProvider>  
  )  
}