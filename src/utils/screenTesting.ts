/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧪 SISTEMA DE TESTING DE PANTALLAS
 * 
 * Para probar pantallas individualmente:
 * 1. Cambia ENABLED a true
 * 2. Cambia SCREEN al nombre de la pantalla que quieres probar
 * 3. Si la pantalla necesita parámetros, agrégala a UNSAFE_SCREENS
 * 
 * Pantallas disponibles:
 * 
 * 🔐 AUTENTICACIÓN:
 * - SignInScreen, SignUpScreen, WelcomeScreen, LanguageSelectionScreen
 * 
 * 🎯 ONBOARDING:
 * - UploadAvatarScreen, PickInterestsScreen, PickGoalsScreen, PickKnowledgeScreen, OnboardingCompleteScreen
 * 
 * 🏠 PRINCIPALES:
 * - HomeFeedScreen, ProfileScreen, SettingsScreen, CreatePostScreen
 * 
 * 📰 CONTENIDO:
 * - NewsScreen, EducacionScreen, InversionesScreen, CommunitiesScreen
 * - MarketInfoScreen, LearningPathsScreen, SavedPostsScreen
 * 
 * 💬 COMUNICACIÓN:
 * - MessagesScreen, NotificationsScreen, ChatListScreen
 * 
 * 🔧 UTILIDADES:
 * - DevMenuScreen, InversionistaScreen
 * 
 * ⚠️ REQUIEREN PARÁMETROS:
 * - PostDetailScreen, ChatScreen, CommunityDetailScreen, PromotionDetailScreen
 * - NewsDetailScreen, PaymentScreen, CourseDetailScreen, GroupChatScreen, SharePostScreen
 */
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Importa todas las pantallas de tu aplicación
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LanguageSelectionScreen } from '../screens/LanguageSelectionScreen';
import { HomeFeedScreen } from '../screens/HomeFeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { EducacionScreen } from '../screens/EducacionScreen';
import { InversionesScreen } from '../screens/InversionesScreen';
import { CommunitiesScreen } from '../screens/CommunitiesScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { ChatScreen } from '../screens/ChatScreen';
import DevMenuScreen from '../screens/DevMenuScreen';
import { UploadAvatarScreen } from '../screens/UploadAvatarScreen';
import { PickInterestsScreen } from '../screens/PickInterestsScreen';
import { PickGoalsScreen } from '../screens/PickGoalsScreen';
import { PickKnowledgeScreen } from '../screens/PickKnowledgeScreen';
import { OnboardingCompleteScreen } from '../screens/OnboardingCompleteScreen';
import { CommunityDetailScreen } from '../screens/CommunityDetailScreen';
import CommunityMembersScreen from '../screens/CommunityMembersScreen';
import EditCommunityScreen from '../screens/EditCommunityScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
import { MarketInfoScreen } from '../screens/MarketInfoScreen';
import { PromotionDetailScreen } from '../screens/PromotionDetailScreen';
import InversionistaScreen from '../screens/InversionistaScreen';
import { NewsDetailScreen } from '../screens/NewsDetailScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { LearningPathsScreen } from '../screens/LearningPathsScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';
import { SharePostScreen } from '../screens/SharePostScreen';
import { SavedPostsScreen } from '../screens/SavedPostsScreen';
import { CommunityRecommendationsScreen } from '../screens/CommunityRecommendationsScreen';
import { PromotionsScreen } from '../screens/PromotionsScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { CazaHormigasScreen } from '../screens/CazaHormigasScreen';
import { ReportesAvanzadosScreen } from '../screens/ReportesAvanzadosScreen';
import { PlanificadorFinancieroScreen } from '../screens/PlanificadorFinancieroScreen';
import { InvestmentKnowledgeScreen } from '../screens/InvestmentKnowledgeScreen';
// Removed non-existent community screens

// Mapa de componentes de pantalla
const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  SignInScreen,
  SignUpScreen,
  WelcomeScreen,
  LanguageSelectionScreen,
  HomeFeedScreen,
  ProfileScreen,
  SettingsScreen,
  NotificationsScreen,
  NewsScreen,
  EducacionScreen,
  InversionesScreen,
  CommunitiesScreen,
  MessagesScreen,
  CreatePostScreen,
  PostDetailScreen,
  ChatScreen,
  DevMenuScreen,
  UploadAvatarScreen,
  PickInterestsScreen,
  PickGoalsScreen,
  PickKnowledgeScreen,
  OnboardingCompleteScreen,
  CommunityDetailScreen,
  CommunityMembersScreen,
  EditCommunityScreen,
  CreateCommunityScreen,
  MarketInfoScreen,
  PromotionDetailScreen,
  InversionistaScreen,
  NewsDetailScreen,
  ChatListScreen,
  PaymentScreen: PaymentScreen,
  CourseDetailScreen,
  LearningPathsScreen,
  GroupChatScreen,
  SharePostScreen,
  SavedPostsScreen,
  CommunityRecommendationsScreen,
  PromotionsScreen,
  VideoPlayerScreen,
  CazaHormigasScreen,
  ReportesAvanzadosScreen,
  PlanificadorFinancieroScreen,
  InvestmentKnowledgeScreen,
  CommunitiesScreen,
};

export const TESTING_CONFIG = {
  ENABLED: false, // ← Deshabilitado - Usar flujo normal de navegación
  SCREEN: 'HomeFeedScreen',
  // Only include screens that actually exist in the codebase
  SAFE_SCREENS: [
    'SignInScreen',
    'SignUpScreen',
    'WelcomeScreen',
    'LanguageSelectionScreen',
    'HomeFeedScreen',
    'ProfileScreen',
    'SettingsScreen',
    'NotificationsScreen',
    'NewsScreen',
    'EducacionScreen',
    'InversionesScreen',
    'CommunitiesScreen',
    'MessagesScreen',
    'CreatePostScreen',
    'DevMenuScreen',
    'UploadAvatarScreen',
    'PickInterestsScreen',
    'PickGoalsScreen',
    'PickKnowledgeScreen',
    'OnboardingCompleteScreen',
    'MarketInfoScreen',
    'InversionistaScreen',
    'ChatListScreen',
    'LearningPathsScreen',
    'SavedPostsScreen',
    'CommunityRecommendationsScreen',
    'PromotionsScreen',
    'VideoPlayerScreen',
    'CazaHormigasScreen',
    'ReportesAvanzadosScreen',
    'PlanificadorFinancieroScreen',
    'InvestmentKnowledgeScreen',
    'CommunitiesScreen',
  ],
  UNSAFE_SCREENS: {
    // Pantallas de Publicaciones
    'PostDetailScreen': { route: { params: { postId: '1' } } },
    'SharePostScreen': { route: { params: { postId: '1' } } },
    
    // Chat y Comunicación
    'ChatScreen': { route: { params: { chatId: '1', userId: '1' } } },
    'GroupChatScreen': { route: { params: { groupId: '1', groupName: 'Grupo Test' } } },
    
    // Comunidades
    'CommunitiesListScreen': { route: { params: { category: 'all' } } },
    'CommunityDetailScreen': { route: { params: { communityId: '1' } } },
    'CommunityMembersScreen': { route: { params: { communityId: '1', communityName: 'Comunidad Test' } } },
    'CommunityRecommendationsScreen': { route: { params: { userId: '1' } } },
    'EditCommunityScreen': { route: { params: { communityId: '1' } } },
    'CreateCommunityScreen': { route: { params: {} } },
    
    // Contenido y Promociones
    'PromotionDetailScreen': { 
      route: { 
        params: { 
          promotion: {
            id: '1',
            title: 'Descuento Especial en Software Nicaragua',
            description: 'Obtén un 25% de descuento en todos nuestros servicios de desarrollo de software. Válido hasta fin de mes.',
            category: 'Tecnología',
            discount: '25% OFF',
            imageUrl: 'https://picsum.photos/400x200/2673f3/ffffff?text=Software+Nicaragua',
            validUntil: '31 de Diciembre 2024',
            location: 'Nicaragua',
            requirements: [
              'Ser miembro de la comunidad',
              'Presentar documento de identidad',
              'Válido hasta el 31 de diciembre 2024'
            ]
          }
        } 
      } 
    },
    'NewsDetailScreen': { route: { params: { newsId: '1', title: 'Noticia Test', content: 'Contenido de prueba', imageUrl: 'https://via.placeholder.com/300x200' } } },
    
    // Pagos y Cursos
    'PaymentScreen': { route: { params: { amount: '100', currency: 'USD', description: 'Pago de prueba' } } },
    'CourseDetailScreen': { route: { params: { courseId: '1' } } },
    'VideoPlayerScreen': { route: { params: { videoId: '1', title: 'Video de prueba' } } },
    
    // Pantalla de Comunidades
    'CommunitiesScreen': { route: { params: { category: 'all' } } },
    
    // Pantallas de Herramientas Financieras
    'CazaHormigasScreen': { route: { params: {} } },
    'ReportesAvanzadosScreen': { route: { params: {} } },
    'PlanificadorFinancieroScreen': { route: { params: {} } },
    'InvestmentKnowledgeScreen': { route: { params: {} } },
  } as Record<string, any>
};

// Obtener el componente de pantalla
export function getScreenComponent(screenName: string): React.ComponentType<any> {
  const ScreenComponent = SCREEN_COMPONENTS[screenName];
  if (!ScreenComponent) {
    console.warn(`No se encontró el componente para la pantalla: ${screenName}`);
    return () => null;
  }
  return ScreenComponent;
}

// Validar pantalla segura
export function isSafeScreen(screenName: string): boolean {
  return TESTING_CONFIG.SAFE_SCREENS.includes(screenName);
}

// Obtener parámetros para pantalla
export function getScreenParams(screenName: string): any {
  return TESTING_CONFIG.UNSAFE_SCREENS[screenName] || {};
}

// Componente de Testing
export function TestingScreen() {
  const TestScreen = getScreenComponent(TESTING_CONFIG.SCREEN);
  const screenParams = getScreenParams(TESTING_CONFIG.SCREEN);

  if (isSafeScreen(TESTING_CONFIG.SCREEN) || Object.keys(screenParams).length > 0) {
    const ScreenComponent = TestScreen as React.ComponentType<any>;
    return React.createElement(ScreenComponent, screenParams);
  }

  const errorMessage = `La pantalla "${TESTING_CONFIG.SCREEN}" necesita parámetros.\n\nAgrega los parámetros necesarios en TESTING_CONFIG.UNSAFE_SCREENS`;
  
  return React.createElement(
    View,
    { style: styles.errorContainer },
    React.createElement(
      Text,
      { style: styles.errorText },
      errorMessage
    )
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20
  },
  errorText: {
    color: 'red', 
    fontSize: 18, 
    textAlign: 'center',
    lineHeight: 24
  }
});

export default TestingScreen;
