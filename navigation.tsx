"use client"  
  
import { useEffect, useState } from "react"  
import { NavigationContainer, type LinkingOptions } from "@react-navigation/native"  
import { createStackNavigator } from "@react-navigation/stack"  
import * as Linking from "expo-linking"  
import * as SecureStore from "expo-secure-store"  
import { ActivityIndicator, View, Text } from "react-native"  
  
// Import screens  
import { WelcomeScreen } from "./src/screens/WelcomeScreen"  
import { SignInScreen } from "./src/screens/SignInScreen"  
import { SignUpScreen } from "./src/screens/SignUpScreen"  
import { UploadAvatarScreen } from "./src/screens/UploadAvatarScreen"  
import { PickGoalsScreen } from "./src/screens/PickGoalsScreen"  
import { PickInterestsScreen } from "./src/screens/PickInterestsScreen"  
import { PickKnowledgeScreen } from "./src/screens/PickKnowledgeScreen"  
import { CommunityRecommendationsScreen } from "./src/screens/CommunityRecommendationsScreen"  
import { HomeFeedScreen } from "./src/screens/HomeFeedScreen"  
import { CreatePostScreen } from "./src/screens/CreatePostScreen"  
import { PostDetailScreen } from "./src/screens/PostDetailScreen"  
import { CommunitiesScreen } from "./src/screens/CommunitiesScreen"  
import { ProfileScreen } from "./src/screens/ProfileScreen"  
import { SettingsScreen } from "./src/screens/SettingsScreen"  
import { MarketInfoScreen } from "./src/screens/MarketInfoScreen"  
import { EducacionScreen } from "./src/screens/EducacionScreen"  
import { PromotionsScreen } from "./src/screens/PromotionsScreen"  
import { CommunityDetailScreen } from "./src/screens/CommunityDetailScreen"  
import { PromotionDetailScreen } from "./src/screens/PromotionDetailScreen"  
import { InversionesScreen } from "./src/screens/InversionesScreen"  
import InversionistaScreen from "./src/screens/InversionistaScreen"  
import { ChatListScreen } from "./src/screens/ChatListScreen"  
import { ChatScreen } from "./src/screens/ChatScreen"  
import { NewsScreen } from "./src/screens/NewsScreen"  
import { getCurrentUser, getMe } from "./src/rest/api"  
import DevMenuScreen from "./src/screens/DevMenuScreen"  
import PaymentScreen from "./src/screens/PaymentScreen"  
import CourseDetailScreen from "./src/screens/CourseDetailScreen"  
import LearningPathsScreen from "./src/screens/LearningPathsScreen"  
import GroupChatScreen from "./src/screens/GroupChatScreen"  
import SharePostScreen from "./src/screens/SharePostScreen"  
import SavedPostsScreen from "./src/screens/SavedPostsScreen"
import { InvestmentGoalsScreen } from "./src/screens/InvestmentGoalsScreen"
import { InvestmentInterestsScreen } from "./src/screens/InvestmentInterestsScreen"
import { InvestmentKnowledgeScreen } from "./src/screens/InvestmentKnowledgeScreen"  
  
// Check if we're in development mode  
const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__  
  
// Placeholder screens for missing navigation targets  
const MessagesScreen = () => (  
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>  
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Mensajes</Text>  
    <Text style={{ color: '#666' }}>Sistema de mensajería en desarrollo</Text>  
  </View>  
)  
  
const NotificationsScreen = () => (  
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>  
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Notificaciones</Text>  
    <Text style={{ color: '#666' }}>Centro de notificaciones en desarrollo</Text>  
  </View>  
)  
  
const NewsDetailScreen = ({ route }: any) => (  
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>  
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Detalle de Noticia</Text>  
    <Text style={{ color: '#666' }}>ID: {route?.params?.newsId || 'No especificado'}</Text>  
  </View>  
)  
  
const Stack = createStackNavigator()  
  
const prefix = Linking.createURL("/")  
  
const linking: LinkingOptions<any> = {  
  prefixes: [prefix],  
  config: {  
    screens: {  
      Welcome: "/welcome",  
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
    },  
  },  
}  
  
export function RootStack() {  
  const [initialRoute, setInitialRoute] = useState<string | null>(null)  
  const [loading, setLoading] = useState(true)  
  
  useEffect(() => {  
    determineInitialRoute()  
  }, [])  
  
  const determineInitialRoute = async () => {
    try {
      // Siempre empezar con WelcomeScreen para evitar errores de SecureStore en web
      setInitialRoute("Welcome")
    } catch (error) {
      console.error("Error determining initial route:", error)
      setInitialRoute("Welcome")
    } finally {
      setLoading(false)
    }
  }  
  
  // Mostrar estado de carga mientras se determina la ruta  
  if (loading || !initialRoute) {  
    return (  
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f8fa' }}>  
        <ActivityIndicator size="large" color="#007AFF" />  
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando aplicación...</Text>  
      </View>  
    )  
  }  
  
  // Contenedor principal de navegación  
  return (  
    <NavigationContainer   
      linking={linking}   
      fallback={  
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>  
          <ActivityIndicator size="large" color="#007AFF" />  
        </View>  
      }  
    >  
      <Stack.Navigator  
        initialRouteName={initialRoute}  
        screenOptions={{  
          headerShown: false,  
          gestureEnabled: true,  
          cardStyleInterpolator: ({ current, layouts }) => {  
            return {  
              cardStyle: {  
                transform: [  
                  {  
                    translateX: current.progress.interpolate({  
                      inputRange: [0, 1],  
                      outputRange: [layouts.screen.width, 0],  
                    }),  
                  },  
                ],  
              },  
            }  
          },  
        }}  
      >  
        {/* Authentication Flow */}  
        <Stack.Screen  
          name="Welcome"  
          component={WelcomeScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="SignIn"  
          component={SignInScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="SignUp"  
          component={SignUpScreen}  
          options={{ gestureEnabled: false }}  
        />  
  
        {/* Onboarding Flow */}  
        <Stack.Screen  
          name="UploadAvatar"  
          component={UploadAvatarScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="PickGoals"  
          component={PickGoalsScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="PickInterests"  
          component={PickInterestsScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="PickKnowledge"  
          component={PickKnowledgeScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="InvestmentGoals"  
          component={InvestmentGoalsScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="InvestmentInterests"  
          component={InvestmentInterestsScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="InvestmentKnowledge"  
          component={InvestmentKnowledgeScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="CommunityRecommendations"  
          component={CommunityRecommendationsScreen}  
          options={{ gestureEnabled: false }}  
        />  
  
        {/* Main App Flow */}  
        <Stack.Screen  
          name="HomeFeed"  
          component={HomeFeedScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen  
          name="CreatePost"  
          component={CreatePostScreen}  
          options={{  
            presentation: "modal",  
            gestureDirection: "vertical",  
          }}  
        />  
        <Stack.Screen  
          name="PostDetail"  
          component={PostDetailScreen}  
        />  
        <Stack.Screen  
          name="Communities"  
          component={CommunitiesScreen}  
        />  
        <Stack.Screen  
          name="CommunityDetail"  
          component={CommunityDetailScreen}  
          options={{ headerShown: false }}  
        />  
        <Stack.Screen  
          name="Profile"  
          component={ProfileScreen}  
        />  
        <Stack.Screen  
          name="Settings"  
          component={SettingsScreen}  
        />  
  
        {/* Feature Screens */}  
        <Stack.Screen  
          name="MarketInfo"  
          component={MarketInfoScreen}  
        />  
        <Stack.Screen  
          name="Educacion"  
          component={EducacionScreen}  
        />  
        <Stack.Screen  
          name="Promotions"  
          component={PromotionsScreen}  
        />  
        <Stack.Screen  
          name="PromotionDetail"  
          component={PromotionDetailScreen}  
        />  
        <Stack.Screen  
          name="Inversiones"  
          component={InversionesScreen}  
        />  
        <Stack.Screen  
          name="Inversionista"  
          component={InversionistaScreen}  
        />  
  
        {/* News */}  
        <Stack.Screen  
          name="News"  
          component={NewsScreen}  
          options={{  
            headerShown: false,  
          }}  
        />  
        <Stack.Screen  
          name="NewsDetail"  
          component={NewsDetailScreen}  
          options={{  
            headerShown: false,  
          }}  
        />  
  
        {/* Chat & Communication */}  
        <Stack.Screen  
          name="ChatList"  
          component={ChatListScreen}  
          options={{  
            gestureDirection: "horizontal",  
          }}  
        />  
        <Stack.Screen  
          name="ChatScreen"  
          component={ChatScreen}  
          options={{  
            gestureDirection: "horizontal",  
          }}  
        />  
        <Stack.Screen  
          name="Messages"  
          component={MessagesScreen}  
          options={{  
            gestureDirection: "horizontal",  
          }}  
        />  
        <Stack.Screen  
          name="Notifications"  
          component={NotificationsScreen}  
          options={{  
            headerShown: false,  
          }}  
        />  
  
        {/* Additional Feature Screens */}  
        <Stack.Screen  
          name="Payment"  
          component={PaymentScreen}  
        />  
        <Stack.Screen  
          name="CourseDetail"  
          component={CourseDetailScreen}  
        />  
        <Stack.Screen  
          name="LearningPaths"  
          component={LearningPathsScreen}  
        />  
        <Stack.Screen  
          name="GroupChat"  
          component={GroupChatScreen}  
        />  
        <Stack.Screen  
          name="SharePost"  
          component={SharePostScreen}  
        />  
        <Stack.Screen  
          name="SavedPosts"  
          component={SavedPostsScreen}  
        />  
  
        {/* Development Menu */}  
        {isDevelopment && (  
          <Stack.Screen  
            name="DevMenu"  
            component={DevMenuScreen}  
          />  
        )}  
      </Stack.Navigator>  
    </NavigationContainer>  
  )  
}