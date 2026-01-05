import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingNavigator } from './OnboardingNavigator';
import { DrawerNavigator } from './DrawerNavigator';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommunityRecommendationsScreen } from '../screens/CommunityRecommendationsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { InvestmentSimulatorScreen } from '../screens/InvestmentSimulatorScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { ArchivedChatsScreen } from '../screens/ArchivedChatsScreen';
import { EditInterestsScreen } from '../screens/EditInterestsScreen';
import { PendingRequestsScreen } from '../screens/PendingRequestsScreen';
import { ManageModeratorsScreen } from '../screens/ManageModeratorsScreen';
import { BlockedUsersScreen } from '../screens/BlockedUsersScreen';
import { LessonDetailScreen } from '../screens/LessonDetailScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import IRIChatScreen from '../screens/IRIChatScreen';
import AuthCallbackScreen from '../screens/AuthCallbackScreen';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const COMMUNITIES_COMPLETE_KEY = 'communities_complete';

// Create a wrapper component to handle the navigation
const OnboardingScreenWrapper: React.FC<{ route: any }> = ({ route }) => {
  return <OnboardingNavigator onComplete={route.params?.onComplete || (() => {})} />;
};

export function RootStack() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState<boolean>(true);

  // Check onboarding status when authenticated
  useEffect(() => {
    console.log('[RootStack] 🔄 useEffect triggered - isAuthenticated:', isAuthenticated);
    
    const checkOnboardingStatus = async () => {
      try {
        console.log('[RootStack] 🔍 Checking onboarding status...');
        
        if (isAuthenticated) {
          console.log('[RootStack] ✅ Usuario autenticado, verificando onboarding...');
          // OPTIMIZACIÓN: Verificar SOLO onboarding_step primero (consulta rápida)
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Consulta RÁPIDA: Solo onboarding_step
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('onboarding_step')
              .eq('id', user.id)
              .single();

            if (!userError && userData) {
              // DECISIÓN RÁPIDA: Si onboarding_step existe y NO es 'completed', mostrar onboarding
              const isInOnboarding = userData.onboarding_step && userData.onboarding_step !== 'completed';
              
              if (isInOnboarding) {
                console.log('[RootStack] 🔄 Usuario en proceso de onboarding, paso:', userData.onboarding_step);
                await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false');
                setIsOnboarded(false);
                setIsCheckingOnboarding(false); // ⚡ TERMINAR INMEDIATAMENTE
                return;
              }
              
              // Si onboarding_step === 'completed', verificar datos completos en segundo plano
              if (userData.onboarding_step === 'completed') {
                console.log('[RootStack] ✅ Onboarding marcado como completado');
                await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
                setIsOnboarded(true);
                setIsCheckingOnboarding(false); // ⚡ TERMINAR INMEDIATAMENTE
                return;
              }
            }

            // FALLBACK: Usuario antiguo sin onboarding_step - Verificar datos completos
            console.log('[RootStack] 📊 Usuario sin onboarding_step, verificando datos...');
            
            // Consultar datos completos SOLO para usuarios antiguos
            const [userDataComplete, userGoals, userCommunities] = await Promise.all([
              supabase.from('users')
                .select('avatar_url, photo_url, intereses, nivel_finanzas')
                .eq('id', user.id)
                .single(),
              supabase.from('user_goals')
                .select('goal_id')
                .eq('user_id', user.id),
              supabase.from('user_communities')
                .select('community_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
            ]);

            // Validar datos completos para usuarios antiguos
            if (!userDataComplete.error && userDataComplete.data) {
              const avatarUrl = userDataComplete.data.avatar_url || userDataComplete.data.photo_url;
              const goalsCount = userGoals.data?.length || 0;
              const communitiesCount = userCommunities.data?.length || 0;

              console.log('[RootStack] 📊 Datos del usuario antiguo:', {
                user_id: user.id,
                avatar_url: avatarUrl,
                intereses: userDataComplete.data.intereses,
                nivel_finanzas: userDataComplete.data.nivel_finanzas,
                goals_count: goalsCount,
                communities_count: communitiesCount
              });

              // Verificar que el usuario tenga TODOS los datos necesarios
              const hasAvatar = avatarUrl && avatarUrl !== '';
              const hasInterests = userDataComplete.data.intereses && Array.isArray(userDataComplete.data.intereses) && userDataComplete.data.intereses.length > 0;
              const hasKnowledge = userDataComplete.data.nivel_finanzas && userDataComplete.data.nivel_finanzas !== 'none' && userDataComplete.data.nivel_finanzas !== '';
              const hasGoals = goalsCount > 0;
              const hasCommunities = communitiesCount > 0;
              
              // Usuario antiguo con todos los datos = completo
              const hasAllData = hasAvatar && hasInterests && hasKnowledge && hasGoals && hasCommunities;
              const isComplete = hasAllData;
              
              console.log('[RootStack] ✅ Validación de onboarding (usuario antiguo):', {
                hasAvatar,
                hasInterests,
                hasKnowledge,
                hasGoals,
                hasCommunities,
                isComplete
              });
              
              // Si no está completo, verificar en qué paso quedó
              if (!isComplete) {
                console.log('[RootStack] ⚠️ Onboarding incompleto (usuario antiguo)');
                console.log('[RootStack] 📋 Estado actual:', {
                  hasAvatar,
                  hasInterests,
                  hasKnowledge,
                  hasGoals,
                  hasCommunities
                });
                
                // Determinar a qué pantalla redirigir
                if (!hasAvatar) {
                  console.log('[RootStack] 👤 Falta avatar, yendo a UploadAvatar');
                } else if (!hasGoals) {
                  console.log('[RootStack] 🎯 Falta metas, yendo a PickGoals');
                } else if (!hasInterests) {
                  console.log('[RootStack] ❤️ Falta intereses, yendo a PickInterests');
                } else if (!hasKnowledge) {
                  console.log('[RootStack] 📚 Falta conocimiento, yendo a PickKnowledge');
                } else if (!hasCommunities) {
                  console.log('[RootStack] 👥 Falta comunidades, yendo a CommunityRecommendations');
                }
                
                // No marcar como onboarded para que entre al flujo correcto
                await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false');
                setIsOnboarded(false);
                setIsCheckingOnboarding(false);
                return;
              }
              
              // Sincronizar con AsyncStorage
              await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, isComplete ? 'true' : 'false');
              setIsOnboarded(isComplete);
              setIsCheckingOnboarding(false);
              return;
            } else {
              console.error('[RootStack] ❌ Error consultando datos del usuario antiguo');
              // Si hay error, asumir que necesita onboarding
              await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false');
              setIsOnboarded(false);
              setIsCheckingOnboarding(false);
              return;
            }
          }

          // FALLBACK: Si falla la DB, usar AsyncStorage
          const onboarded = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
          setIsOnboarded(onboarded === 'true');
        } else {
          console.log('[RootStack] ❌ Usuario NO autenticado');
          setIsOnboarded(null);
          setIsCheckingOnboarding(false);
        }
      } catch (error) {
        console.error('[RootStack] Error checking onboarding:', error);
        // En caso de error, usar AsyncStorage como fallback
        try {
          const onboarded = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
          setIsOnboarded(onboarded === 'true');
        } catch {
          setIsOnboarded(null);
        }
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated]);
  
  // Log de estado actual para debug
  useEffect(() => {
    console.log('[RootStack] 📊 Estado actual:', {
      isAuthenticated,
      authLoading,
      isOnboarded,
      isCheckingOnboarding,
      showAuthFlow: !isAuthenticated,
      showOnboardingFlow: isAuthenticated && (isCheckingOnboarding || !isOnboarded),
      showMainApp: isAuthenticated && !isCheckingOnboarding && isOnboarded
    });
  }, [isAuthenticated, authLoading, isOnboarded, isCheckingOnboarding]);

  const handleOnboardingComplete = async () => {
    try {
      console.log('[RootStack] Onboarding completed');
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('[RootStack] Error saving onboarding status:', error);
    }
  };

  // Show loading SOLO si está verificando autenticación
  // NO mostrar loading si solo está verificando onboarding (para evitar pantalla blanca)
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2673f3" />
      </View>
    );
  }
  
  // Si está verificando onboarding pero ya sabemos que está autenticado,
  // mostrar el stack apropiado (evita pantalla de carga infinita)
  const showAuthFlow = !isAuthenticated;
  const showOnboardingFlow = isAuthenticated && (isCheckingOnboarding || !isOnboarded);
  const showMainApp = isAuthenticated && !isCheckingOnboarding && isOnboarded;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {showAuthFlow ? (
        <>
          {/* Auth Flow - Solo cuando NO está autenticado */}
          <Stack.Screen 
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerShown: false
            }}
          />
          
          <Stack.Screen 
            name="SignIn"
            component={SignInScreen}
            options={{
              headerShown: false
            }}
          />
          
          <Stack.Screen 
            name="SignUp"
            component={SignUpScreen}
            options={{
              headerShown: false
            }}
          />

          {/* OAuth Callback Handler */}
          <Stack.Screen 
            name="AuthCallback"
            component={AuthCallbackScreen}
            options={{
              headerShown: false
            }}
          />
        </>
      ) : showOnboardingFlow ? (
        <>
          {/* Onboarding Flow - Solo cuando está autenticado pero NO ha completado onboarding */}
          <Stack.Screen 
            name="Onboarding"
            options={{
              headerShown: false
            }}
          >
            {() => <OnboardingScreenWrapper route={{
              params: {
                onComplete: handleOnboardingComplete
              }
            }} />}
          </Stack.Screen>
          
          <Stack.Screen 
            name="CommunityRecommendations" 
            component={CommunityRecommendationsScreen}
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
            initialParams={{
              onComplete: handleOnboardingComplete
            }}
          />
        </>
      ) : showMainApp ? (
        <>
          {/* Main App - Solo cuando está autenticado Y ha completado onboarding */}
          <Stack.Screen 
            name="HomeFeed" 
            component={DrawerNavigator}
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
          />
        </>
      ) : null}
      
      {/* Investment Simulator */}
      <Stack.Screen 
        name="InvestmentSimulator" 
        component={InvestmentSimulatorScreen}
        options={{
          headerShown: true,
          title: 'Simulador de Inversión'
        }}
      />

      {/* Notification Settings */}
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{
          headerShown: true,
          title: 'Configuración de Notificaciones'
        }}
      />

      {/* Archived Chats */}
      <Stack.Screen 
        name="ArchivedChats" 
        component={ArchivedChatsScreen}
        options={{
          headerShown: true,
          title: 'Chats Archivados'
        }}
      />

      {/* Edit Interests */}
      <Stack.Screen 
        name="EditInterests" 
        component={EditInterestsScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Pending Requests */}
      <Stack.Screen 
        name="PendingRequests" 
        component={PendingRequestsScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Manage Moderators */}
      <Stack.Screen 
        name="ManageModerators" 
        component={ManageModeratorsScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Blocked Users */}
      <Stack.Screen 
        name="BlockedUsers" 
        component={BlockedUsersScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Lesson Detail */}
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Missions and Achievements */}
      <Stack.Screen 
        name="Missions" 
        component={MissionsScreen}
        options={{
          headerShown: false
        }}
      />

      {/* AI Assistant */}
      <Stack.Screen 
        name="Iri" 
        component={IRIChatScreen}
        options={{
          headerShown: false
        }}
      />

      {/* Support Ticket - Accessible from Settings */}
      <Stack.Screen 
        name="SupportTicket" 
        component={require('../screens/SupportTicketScreen').SupportTicketScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}
