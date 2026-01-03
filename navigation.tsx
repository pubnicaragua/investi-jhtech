"use client"

import { useEffect, useState } from "react"
import { NavigationContainer, type LinkingOptions } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import * as Linking from "expo-linking"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, View, Text, Image } from "react-native"
import { useAuth } from "./src/contexts/AuthContext"
import { useNavigation, NavigationProp } from "@react-navigation/native"

// Import screens normalmente (sin lazy loading por ahora)
import { WelcomeScreen } from "./src/screens/WelcomeScreen"
import { LanguageSelectionScreen } from "./src/screens/LanguageSelectionScreen"
import { SignInScreen } from "./src/screens/SignInScreen"
import { SignUpScreen } from "./src/screens/SignUpScreen"
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen"
import AuthCallbackScreen from "./src/screens/AuthCallbackScreen"
import { HomeFeedScreen } from "./src/screens/HomeFeedScreen"
import { UploadAvatarScreen } from "./src/screens/UploadAvatarScreen"
import { PickGoalsScreen } from "./src/screens/PickGoalsScreen"
import { PickInterestsScreen } from "./src/screens/PickInterestsScreen"
import { PickKnowledgeScreen } from "./src/screens/PickKnowledgeScreen"
import { CommunityRecommendationsScreen } from "./src/screens/CommunityRecommendationsScreen"
import { CreatePostScreen } from "./src/screens/CreatePostScreen"
import { CreateCommunityPostScreen } from "./src/screens/CreateCommunityPostScreen"
import { PostDetailScreen } from "./src/screens/PostDetailScreen"
import { CommunitiesScreen } from "./src/screens/CommunitiesScreen"  
import { ProfileScreen } from "./src/screens/ProfileScreen"  
import { SettingsScreen } from "./src/screens/SettingsScreen"  
import CommunityPostDetailScreen from './src/screens/CommunityPostDetailScreen'
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
import DevMenuScreen from "./src/screens/DevMenuScreen"  
import PaymentScreen from "./src/screens/PaymentScreen"
import CourseDetailScreen from "./src/screens/CourseDetailScreen"  
import LearningPathsScreen from "./src/screens/LearningPathsScreen"  
import GroupChatScreen from "./src/screens/GroupChatScreen"  
import SharePostScreen from "./src/screens/SharePostScreen"  
import SavedPostsScreen from "./src/screens/SavedPostsScreen"
import { NewMessageScreen } from "./src/screens/NewMessageScreen"
import { InvestmentKnowledgeScreen } from "./src/screens/InvestmentKnowledgeScreen"
import { OnboardingCompleteScreen } from "./src/screens/OnboardingCompleteScreen"
import IRIChatScreen from "./src/screens/IRIChatScreen"
import { PlanificadorFinancieroScreen } from './src/screens/PlanificadorFinancieroScreen';
import { CazaHormigasScreen } from './src/screens/CazaHormigasScreen';
import { ReportesAvanzadosScreen } from './src/screens/ReportesAvanzadosScreen';
import { VideoPlayerScreen } from './src/screens/VideoPlayerScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { NewsDetailScreen } from './src/screens/NewsDetailScreen';
import { DebugStorageScreen } from './src/screens/DebugStorageScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import FollowersScreen from './src/screens/FollowersScreen';
import FollowingScreen from './src/screens/FollowingScreen';
import { CalculadoraInteresScreen } from './src/screens/CalculadoraInteresScreen';
import { SimuladorJubilacionScreen } from './src/screens/SimuladorJubilacionScreen';
import { ComparadorInversionesScreen } from './src/screens/ComparadorInversionesScreen';
import { InvestmentSimulatorScreen } from './src/screens/InvestmentSimulatorScreen';

import { getCurrentUser, getMe } from "./src/rest/api"
import { supabase } from "./src/supabase"
import CreateCommunityScreen from "./src/screens/CreateCommunityScreen"
import CommunitySettingsScreen from "./src/screens/CommunitySettingsScreen"
import CommunityMembersScreen from "./src/screens/CommunityMembersScreen"
import EditCommunityScreen from "./src/screens/EditCommunityScreen"
  
// Check if we're in development mode  
const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__  
  
// Placeholder screens for missing navigation targets  
const MessagesScreen = () => (  
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>  
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Mensajes</Text>  
    <Text style={{ color: '#666' }}>Sistema de mensajería en desarrollo</Text>  
  </View>  
)  
  
const Stack = createStackNavigator()
  
const prefix = Linking.createURL("/")  
  
const linking: LinkingOptions<any> = {  
  prefixes: [prefix],  
  config: {  
    screens: {  
      Welcome: "/welcome",  
      LanguageSelection: "/language-selection",
      SignIn: "/signin",  
  SignUp: "/signup",
  ForgotPassword: "/forgot-password",
  AuthCallback: "/auth/callback",
      UploadAvatar: "/upload-avatar",  
      PickGoals: "/pick-goals",  
      PickInterests: "/pick-interests",  
      PickKnowledge: "/pick-knowledge",  
      CommunityRecommendations: "/community-recommendations",  
      HomeFeed: "/home",  
      CreatePost: "/create-post",  
      PostDetail: "/post/:postId",  
      Profile: "/profile/:userId?",  
      EditProfile: "/profile/edit",
      Followers: "/profile/:userId/followers",
      Following: "/profile/:userId/following",
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
      CourseDetail: "/course/:courseId",  
      LearningPaths: "/learning-paths",  
      GroupChat: "/group-chat/:groupId",  
      SharePost: "/share-post",  
      SavedPosts: "/saved-posts",  
      CommunityDetail: "/community/:communityId",
      CommunitySettings: "/community/:communityId/settings",
      CommunityMembers: "/community/:communityId/members",
      EditCommunity: "/community/:communityId/edit",
      CreateCommunity: "/create-community",
      PlanificadorFinanciero: "/planificador-financiero",
      CazaHormigas: "/caza-hormigas",
    },  
  },  
}  
  
export function RootStack() {  
  const [initialRoute, setInitialRoute] = useState<string | null>(null)  
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  // 🔧 Detectar si estamos en una ruta específica (deep link)
  const [hasDeepLink, setHasDeepLink] = useState(false)
  
  useEffect(() => {
    // Verificar si hay una ruta específica en la URL (solo en web)
    const checkDeepLink = async () => {
      try {
        const url = await Linking.getInitialURL()
        const isDeepLink = url && url !== prefix && !url.includes('/welcome') && !url.includes('/signin')
        
        console.log('🔗 Navigation: Initial URL:', url)
        console.log('🔗 Navigation: Is deep link:', isDeepLink)
        setHasDeepLink(!!isDeepLink)
      } catch (error) {
        console.log('🔗 Navigation: Error checking deep link:', error)
        setHasDeepLink(false)
      }
    }
    
    checkDeepLink()
  }, [])
  
  useEffect(() => {
    if (!loading && !authLoading) {
      determineInitialRoute()
    }
  }, [isAuthenticated, loading, authLoading])
  
  const determineInitialRoute = async () => {
    try {
      console.log('🚀 Navigation: Determinando ruta inicial...')
      console.log('🔐 Navigation: isAuthenticated:', isAuthenticated)
      
      setLoading(true) // Asegurar que loading está activo
      
      // 🚩 CRÍTICO: Verificar si estamos en proceso de SignUp
      const signupInProgress = await AsyncStorage.getItem('signup_in_progress')
      if (signupInProgress === 'true') {
        console.log('🚩 SignUp en progreso - Saltando navegación automática')
        await AsyncStorage.removeItem('signup_in_progress')
        setLoading(false)
        return // NO hacer navegación automática
      }
      
      // 🔧 Verificar token en AsyncStorage (más confiable que el contexto)
      const authToken = await AsyncStorage.getItem('auth_token')
      let userId = await AsyncStorage.getItem('userId')
      
      // CRÍTICO: Si userId es string "null", convertir a null real
      if (userId === 'null' || userId === 'undefined') {
        userId = null
      }
      
      console.log('🔑 Navigation: Auth token exists:', !!authToken)
      console.log('👤 Navigation: UserId:', userId)
      
      // Considerar autenticado si hay token O si el contexto dice que sí
      const isActuallyAuthenticated = isAuthenticated || !!authToken
      console.log('✅ Navigation: Actually authenticated:', isActuallyAuthenticated)
      
      // If we have an initial deep link pointing to the OAuth callback, navigate there first
      try {
        // On web sometimes Linking.getInitialURL() is not populated; check window.location
        let initialUrl = null
        try {
          if (typeof window !== 'undefined' && window.location && window.location.href) {
            initialUrl = window.location.href
          }
        } catch (err) {
          // ignore
        }

        if (!initialUrl) {
          initialUrl = await Linking.getInitialURL()
        }

        console.log(`url: ${initialUrl}`);
        
        if (initialUrl && initialUrl.includes('/auth/callback')) {
          console.log('🔗 Navigation: Initial URL is auth callback, routing to AuthCallback')
          setInitialRoute('AuthCallback')
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('🔗 Navigation: Error reading initial URL for auth callback check', err)
      }

      // Si ya está autenticado, verificar si completó onboarding
      if (isActuallyAuthenticated) {
        // CRÍTICO: Verificar que tenemos userId válido
        if (!userId) {
          console.error('❌ Navigation: No userId disponible, obteniendo de sesión...')
          // Intentar obtener userId de la sesión de Supabase
          const { data: { session } } = await supabase.auth.getSession()
          userId = session?.user?.id || null
          
          if (userId) {
            // Guardar en AsyncStorage para próximas veces
            await AsyncStorage.setItem('userId', userId)
            console.log('✅ Navigation: UserId obtenido de sesión:', userId)
          } else {
            console.error('❌ Navigation: No se pudo obtener userId')
            setInitialRoute("Welcome")
            setLoading(false)
            return
          }
        }
        
        // VERIFICAR ONBOARDING DESDE BASE DE DATOS (ÚNICA FUENTE DE VERDAD)
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('onboarding_step, avatar_url, photo_url, intereses, nivel_finanzas')
            .eq('id', userId)
            .single()
          
          if (userError) {
            console.error('❌ Navigation: Error obteniendo usuario:', userError)
            setInitialRoute("UploadAvatar")
            setLoading(false)
            return
          }
          
          // VALIDAR DATOS REALES (no confiar solo en onboarding_step)
          const hasAvatar = !!(userData?.avatar_url || userData?.photo_url)
          const hasInterests = userData?.intereses && userData.intereses.length > 0
          const hasKnowledge = userData?.nivel_finanzas && userData.nivel_finanzas !== 'none' && userData.nivel_finanzas !== null
          
          console.log('📋 Navigation: Usuario desde DB:', {
            onboarding_step: userData?.onboarding_step,
            avatar: hasAvatar,
            intereses: userData?.intereses?.length || 0,
            nivel_finanzas: userData?.nivel_finanzas,
            hasAvatar,
            hasInterests,
            hasKnowledge
          })
          
          // CASO 1: onboarding_step === 'completed' → HomeFeed
          if (userData?.onboarding_step === 'completed') {
            console.log('✅ Navigation: onboarding_step=completed → HomeFeed')
            await AsyncStorage.setItem('onboarding_complete', 'true')
            setLoading(false)
            setInitialRoute("HomeFeed")
            return
          }
          
          // CASO 2: Usuario tiene TODOS los datos (avatar, intereses, knowledge) → HomeFeed
          // Esto cubre usuarios viejos Y usuarios que completaron pero onboarding_step no se actualizó
          if (hasAvatar && hasInterests && hasKnowledge) {
            console.log('✅ Navigation: Usuario con datos completos → HomeFeed + marcar completed')
            // Marcar como completado en BD
            await supabase
              .from('users')
              .update({ onboarding_step: 'completed' })
              .eq('id', userId)
            await AsyncStorage.setItem('onboarding_complete', 'true')
            setLoading(false)
            setInitialRoute("HomeFeed")
            return
          }
          
          // CASO 3: Usuario incompleto → Continuar desde donde quedó
          console.log('⚠️ Navigation: Usuario incompleto, determinando paso...')
          
          if (!hasAvatar) {
            console.log('📸 Navigation: Falta avatar → UploadAvatar')
            setInitialRoute("UploadAvatar")
          } else if (!hasInterests) {
            console.log('❤️ Navigation: Falta interests → PickInterests')
            setInitialRoute("PickInterests")
          } else if (!hasKnowledge) {
            console.log('📚 Navigation: Falta knowledge → PickKnowledge')
            setInitialRoute("PickKnowledge")
          } else {
            // Tiene todo pero onboarding_step no es 'completed' → Ir a HomeFeed
            console.log('✅ Navigation: Tiene todo, yendo a HomeFeed')
            await supabase
              .from('users')
              .update({ onboarding_step: 'completed' })
              .eq('id', userId)
            setInitialRoute("HomeFeed")
          }
        } catch (dbError) {
          console.error('❌ Navigation: Error checking onboarding:', dbError)
          setInitialRoute("UploadAvatar")
          setLoading(false)
        }
        setLoading(false)
      } else {
        // Usuario NO autenticado - ir directo a Welcome (sin LanguageSelection)
        console.log('🌍 Navigation: No autenticado, yendo a Welcome')
        setInitialRoute("Welcome")
      }
    } catch (error) {
      console.error("❌ Navigation: Error determining initial route:", error)
      setInitialRoute("LanguageSelection")
    } finally {
      setLoading(false)
    }
  }
  
  // Mensajes motivacionales aleatorios
  const motivationalMessages = [
    '💰 Cada peso ahorrado es un paso hacia tus metas',
    '🎯 Tus sueños financieros están más cerca de lo que crees',
    '📈 Invierte en ti, invierte en tu futuro',
    '🌟 Pequeños ahorros, grandes logros',
    '💪 Tu disciplina financiera te llevará lejos',
    '🚀 El camino a la libertad financiera empieza hoy',
    '✨ Cada meta cumplida es una victoria',
    '🎓 Aprender sobre finanzas es invertir en ti'
  ];
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  // Mostrar indicador pequeño en esquina mientras carga
  if (loading || authLoading || !initialRoute) {
    console.log('🔄 Navigation: Showing loading - loading:', loading, 'authLoading:', authLoading, 'initialRoute:', initialRoute);
    return (  
      <View style={{ flex: 1, backgroundColor: '#f7f8fa' }}>  
        {/* Indicador pequeño en esquina superior derecha */}
        <View style={{ 
          position: 'absolute', 
          top: 20, 
          right: 20, 
          backgroundColor: 'rgba(255,255,255,0.95)', 
          padding: 12,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 9999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}>  
          <ActivityIndicator size="small" color="#2673f3" />  
          <Text style={{ fontSize: 11, color: '#666', fontWeight: '500' }}>v1.0.7</Text>
        </View>
        {/* Mensaje motivacional centrado */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Image  
            source={require('./assets/investi-logo.png')}  
            style={{ width: 100, height: 100, marginBottom: 16 }}  
            resizeMode="contain"  
          />  
          <Text style={{ fontSize: 15, color: '#2673f3', textAlign: 'center', fontWeight: '600' }}>
            {randomMessage}
          </Text>
        </View>
      </View>  
    )  
  }  
  
  // Stack Navigator sin NavigationContainer (ya está en App.tsx)
  return (  
    <Stack.Navigator  
        initialRouteName={initialRoute}  
        screenOptions={{  
          headerShown: false,  
          gestureEnabled: true,
          // ⚡ OPTIMIZACIÓN: Animación más rápida y suave
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 200, // Reducido de 300ms default
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 150, // Más rápido al cerrar
              },
            },
          },
          cardStyleInterpolator: ({ current }: any) => {
            return {
              cardStyle: {
                opacity: current.progress,
              },
            }
          },
        }}  
      >  
        {/* Authentication Flow */}  
        <Stack.Screen  
          name="LanguageSelection"  
          component={LanguageSelectionScreen}
          options={{ 
            gestureEnabled: false,
            headerShown: false
          }}  
        />
        <Stack.Screen  
          name="Welcome"  
          component={WelcomeScreen}
          options={{ 
            gestureEnabled: false,
            headerShown: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop'
          }}
        />  
        <Stack.Screen  
          name="SignIn"  
          component={SignInScreen}  
          options={{ 
            gestureEnabled: false,
            headerShown: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop' 
          }}  
        />  
        <Stack.Screen  
          name="SignUp"  
          component={SignUpScreen}  
          options={{ 
            gestureEnabled: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop' 
          }}  
        />
        <Stack.Screen  
          name="ForgotPassword"  
          component={ForgotPasswordScreen}  
          options={{ 
            gestureEnabled: true,
            headerShown: false
          }}  
        />

        {/* OAuth callback handler (deep link target) */}
        <Stack.Screen
          name="AuthCallback"
          component={AuthCallbackScreen}
          options={{ headerShown: false }}
        />
  
        {/* Onboarding Flow */}  
        <Stack.Screen  
          name="UploadAvatar"  
          component={UploadAvatarScreen}  
          options={{ 
            gestureEnabled: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop' 
          }}  
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
          name="InvestmentKnowledge"  
          component={InvestmentKnowledgeScreen}  
          options={{ gestureEnabled: false }}  
        />  
        <Stack.Screen
          name="OnboardingComplete"
          component={OnboardingCompleteScreen}
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
          name="CreateCommunityPost"
          component={CreateCommunityPostScreen}
          options={{
            presentation: "modal",
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
        />
          <Stack.Screen name="CommunityPostDetail" component={CommunityPostDetailScreen} />
        <Stack.Screen  
          name="VideoPlayer"  
          component={VideoPlayerScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: 'card',
          }}  
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
          name="CommunitySettings"  
          component={CommunitySettingsScreen}  
          options={{ headerShown: false }}  
        />  
        <Stack.Screen  
          name="CommunityMembers"  
          component={CommunityMembersScreen}  
          options={{ headerShown: false }}  
        />  
        <Stack.Screen  
          name="EditCommunity"  
          component={EditCommunityScreen}  
          options={{ headerShown: false }}  
        />  
        <Stack.Screen  
          name="Profile"  
          component={ProfileScreen}  
        />  
        <Stack.Screen  
          name="EditProfile"  
          component={EditProfileScreen}  
          options={{ headerShown: false }}  
        />  
        <Stack.Screen  
          name="Followers"  
          component={FollowersScreen}  
          options={{ headerShown: false }}  
        />  
        <Stack.Screen  
          name="Following"  
          component={FollowingScreen}  
          options={{ headerShown: false }}  
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
          name="NewMessageScreen"
          component={NewMessageScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="CreateCommunity"
          component={CreateCommunityScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
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

        {/* IRI Chat with AI */}
        <Stack.Screen name="IRIChatScreen" component={IRIChatScreen} />

        {/* Financial Tools */}
        <Stack.Screen name="PlanificadorFinanciero" component={PlanificadorFinancieroScreen} />
        <Stack.Screen name="CazaHormigas" component={CazaHormigasScreen} />
        <Stack.Screen name="ReportesAvanzados" component={ReportesAvanzadosScreen} />
        <Stack.Screen name="CalculadoraInteres" component={CalculadoraInteresScreen} />
        <Stack.Screen name="SimuladorJubilacion" component={SimuladorJubilacionScreen} />
        <Stack.Screen name="ComparadorInversiones" component={ComparadorInversionesScreen} />
        <Stack.Screen name="InvestmentSimulator" component={InvestmentSimulatorScreen} />
  
        {/* Development Menu */}  
        {isDevelopment && (  
          <Stack.Screen  
            name="DevMenu"  
            component={DevMenuScreen}  
          />  
        )}  
        
        {/* Debug Tools */}
        {isDevelopment && (  
          <Stack.Screen  
            name="DebugStorage"  
            component={DebugStorageScreen}
            options={{
              title: "🧪 Debug AsyncStorage",
              headerShown: true,
            }}  
          />  
        )}
      </Stack.Navigator>  
  )  
}