import { I18nextProvider } from "react-i18next"  
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"  
import { SafeAreaProvider } from 'react-native-safe-area-context'  
import { NavigationContainer } from '@react-navigation/native';
import { RootStack } from "./navigation"  
import i18n from "./src/i18n/i18n"
import { AuthProvider } from "./src/contexts/AuthContext"
import { LanguageProvider } from "./src/contexts/LanguageContext"
import { TESTING_CONFIG, TestingScreen } from "./src/utils/screenTesting"
import { View, Text } from "react-native";
  
const queryClient = new QueryClient({  
  defaultOptions: {  
    queries: {  
      retry: 1,  
      staleTime: 5 * 60 * 1000,  
    },  
  },  
})  
  
export default function App() {  
  // 🧪 Modo testing activado
  if (TESTING_CONFIG.ENABLED) {
    return (
      <SafeAreaProvider>  
        <QueryClientProvider client={queryClient}>  
          <LanguageProvider>
            <I18nextProvider i18n={i18n}>  
              <AuthProvider>
                <NavigationContainer>
                  <TestingScreen />
                </NavigationContainer>
              </AuthProvider>
            </I18nextProvider>
          </LanguageProvider>
        </QueryClientProvider>  
      </SafeAreaProvider>
    );
  }

  // 🚀 Modo producción normal
  return (  
    <SafeAreaProvider>  
      <QueryClientProvider client={queryClient}>  
        <LanguageProvider>
          <I18nextProvider i18n={i18n}>  
            <AuthProvider>
              <NavigationContainer>
                <RootStack />
              </NavigationContainer>
            </AuthProvider>
          </I18nextProvider>
        </LanguageProvider>
      </QueryClientProvider>  
    </SafeAreaProvider>  
  )  
}