import { I18nextProvider } from "react-i18next"  
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"  
import { SafeAreaProvider } from 'react-native-safe-area-context'  
import { RootStack } from "./navigation"  
import i18n from "./src/i18n/i18n"
import { AuthProvider } from "./src/contexts/AuthContext"  
  
const queryClient = new QueryClient({  
  defaultOptions: {  
    queries: {  
      retry: 1,  
      staleTime: 5 * 60 * 1000,  
    },  
  },  
})  
  
export default function App() {  
  return (  
    <SafeAreaProvider>  
      <QueryClientProvider client={queryClient}>  
        <I18nextProvider i18n={i18n}>  
          <AuthProvider>
            <RootStack />  
          </AuthProvider>
        </I18nextProvider>  
      </QueryClientProvider>  
    </SafeAreaProvider>  
  )  
}