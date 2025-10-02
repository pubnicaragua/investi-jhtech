import { I18nextProvider } from "react-i18next"  
import { SafeAreaProvider } from 'react-native-safe-area-context'  
import { NavigationContainer } from '@react-navigation/native';
import { RootStack } from "./navigation"
import * as Linking from "expo-linking"  
import i18n from "./src/i18n/i18n"
import { AuthProvider } from "./src/contexts/AuthContext"
import { LanguageProvider } from "./src/contexts/LanguageContext"
import { TESTING_CONFIG, TestingScreen } from "./src/utils/screenTesting"  

const prefix = Linking.createURL("/")  

const linking = {  
  prefixes: [prefix],  
  config: {  
    screens: {  
      Welcome: "/welcome",  
      LanguageSelection: "/language-selection",
      SignIn: "/signin",  
      SignUp: "/signup",  
      UploadAvatar: "/upload-avatar",  
      PickGoals: "/pick-goals",  
      PickInterests: "/pick-interests",  
      PickKnowledge: "/pick-knowledge",  
      CommunityRecommendations: "/community-recommendations",  
      HomeFeed: "/home",  
      CreatePost: "/create-post",  
      PostDetail: "/post/:postId",  
      Profile: "/profile/:userId?",  
      Communities: "/communities",  
      Settings: "/settings",  
      MarketInfo: "/market-info",  
      Educacion: "/educacion",  
      Promotions: "/promotions",  
      PromotionDetail: "/promotion/:promotionId",  
      Inversiones: "/inversiones",  
      Inversionista: "/inversionista",  
      ChatList: "/chats",  
      ChatScreen: "/chat/:chatId?",  
      Messages: "/messages",  
      Notifications: "/notifications",  
      News: "/news",  
      NewsDetail: "/news/:newsId",  
      DevMenu: "/dev-menu",  
      Payment: "/payment",  
      CourseDetail: "/course/:courseId",  
      LearningPaths: "/learning-paths",  
      GroupChat: "/group-chat/:groupId",  
      SharePost: "/share-post",  
      SavedPosts: "/saved-posts",  
      CommunityDetail: "/community/:communityId",
      PlanificadorFinanciero: "/planificador-financiero",
      CazaHormigas: "/caza-hormigas",
    },  
  },  
}

export default function App() {  
  // 🧪 Modo testing activado
  if (TESTING_CONFIG.ENABLED) {
    return (
      <SafeAreaProvider>  
        <LanguageProvider>
          <I18nextProvider i18n={i18n}>  
            <AuthProvider>
              <NavigationContainer linking={linking}>
                <TestingScreen />
              </NavigationContainer>
            </AuthProvider>
          </I18nextProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    );
  }

  // 🚀 Modo producción normal
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