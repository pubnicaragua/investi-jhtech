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

// ⚠️ IMPORTACIONES DESHABILITADAS - Causaban error TurboModuleRegistry
// Las importaciones se cargan dinámicamente solo cuando TESTING_CONFIG.ENABLED = true

// Mapa de componentes de pantalla (lazy loading)
const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {};

export const TESTING_CONFIG = {
  ENABLED: false, // ⚠️ MANTENER EN FALSE - Causa error TurboModuleRegistry si se activa
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

// Obtener el componente de pantalla (deshabilitado)
export function getScreenComponent(screenName: string): React.ComponentType<any> {
  console.warn('⚠️ screenTesting está deshabilitado para evitar error TurboModuleRegistry');
  return () => null;
}

// Validar pantalla segura
export function isSafeScreen(screenName: string): boolean {
  return TESTING_CONFIG.SAFE_SCREENS.includes(screenName);
}

// Obtener parámetros para pantalla
export function getScreenParams(screenName: string): any {
  return TESTING_CONFIG.UNSAFE_SCREENS[screenName] || {};
}

// Componente de Testing (deshabilitado)
export function TestingScreen() {
  const errorMessage = `⚠️ TESTING DESHABILITADO\n\nscreenTesting causa error TurboModuleRegistry.\nUsa el flujo normal de navegación.`;
  
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
