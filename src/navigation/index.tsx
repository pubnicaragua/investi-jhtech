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
    const checkOnboardingStatus = async () => {
      try {
        if (isAuthenticated) {
          // PRIORIDAD 1: Verificar en la base de datos con TODOS los campos necesarios
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Consultar datos del usuario
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('onboarding_step, avatar_url, photo_url, intereses, nivel_finanzas')
              .eq('id', user.id)
              .single();

            // Consultar metas del usuario desde user_goals
            const { data: userGoals, error: goalsError } = await supabase
              .from('user_goals')
              .select('goal_id')
              .eq('user_id', user.id);

            // Consultar comunidades del usuario
            const { data: userCommunities, error: communitiesError } = await supabase
              .from('user_communities')
              .select('community_id')
              .eq('user_id', user.id)
              .eq('status', 'active');

            if (!userError && userData) {
              const avatarUrl = userData.avatar_url || userData.photo_url;
              const goalsCount = userGoals?.length || 0;
              const communitiesCount = userCommunities?.length || 0;

              console.log('[RootStack] 📊 Datos del usuario desde DB:', {
                user_id: user.id,
                onboarding_step: userData.onboarding_step,
                avatar_url: avatarUrl,
                intereses: userData.intereses,
                nivel_finanzas: userData.nivel_finanzas,
                goals_count: goalsCount,
                communities_count: communitiesCount
              });

              // Verificar que el usuario tenga TODOS los datos necesarios
              const hasAvatar = avatarUrl && avatarUrl !== '';
              const hasInterests = userData.intereses && Array.isArray(userData.intereses) && userData.intereses.length > 0;
              const hasKnowledge = userData.nivel_finanzas && userData.nivel_finanzas !== 'none' && userData.nivel_finanzas !== '';
              const hasGoals = goalsCount > 0;
              const hasCommunities = communitiesCount > 0;
              const hasCompletedStep = userData.onboarding_step === 'completed';
              
              // CRÍTICO: Si onboarding_step existe y NO es 'completed', el usuario está en proceso
              const isInOnboarding = userData.onboarding_step && userData.onboarding_step !== 'completed';
              
              // Si está en proceso de onboarding, NO está completo
              if (isInOnboarding) {
                console.log('[RootStack] 🔄 Usuario en proceso de onboarding, paso actual:', userData.onboarding_step);
              }
              
              // SOLO para usuarios antiguos (sin onboarding_step): Si tiene TODOS los datos, considerar completo
              const hasAllData = hasAvatar && hasInterests && hasKnowledge && hasGoals && hasCommunities;
              const isOldUserComplete = !userData.onboarding_step && hasAllData;
              
              // El onboarding está completo SOLO si:
              // 1. Tiene el paso marcado como 'completed', O
              // 2. Es usuario antiguo (sin onboarding_step) con todos los datos
              const isComplete = hasCompletedStep || isOldUserComplete;
              
              console.log('[RootStack] ✅ Validación de onboarding:', {
                onboarding_step: userData.onboarding_step,
                hasAvatar,
                hasInterests,
                hasKnowledge,
                hasGoals,
                hasCommunities,
                hasCompletedStep,
                isComplete
              });
              
              // Si no está completo, verificar en qué paso quedó
              if (!isComplete) {
                console.log('[RootStack] ⚠️ Onboarding incompleto');
                console.log('[RootStack] 📋 Estado actual:', {
                  onboarding_step: userData.onboarding_step,
                  hasAvatar,
                  hasInterests,
                  hasKnowledge,
                  hasGoals,
                  hasCommunities,
                  hasCompletedStep,
                  hasAllData
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
            } else if (userError) {
              console.error('[RootStack] ❌ Error consultando datos del usuario:', userError);
            }
          }

          // FALLBACK: Si falla la DB, usar AsyncStorage
          const onboarded = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
          setIsOnboarded(onboarded === 'true');
        } else {
          setIsOnboarded(null);
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

  const handleOnboardingComplete = async () => {
    try {
      console.log('[RootStack] Onboarding completed');
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('[RootStack] Error saving onboarding status:', error);
    }
  };

  // Show loading while checking auth or onboarding
  if (authLoading || isCheckingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2673f3" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName={
        !isAuthenticated 
          ? 'Welcome' 
          : !isOnboarded 
            ? 'Onboarding' 
            : 'HomeFeed'
      }
    >
      {/* Auth Flow */}
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

      {/* Onboarding Flow - Always render */}
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

      {/* Main App - Always render */}
      <Stack.Screen 
        name="HomeFeed" 
        component={DrawerNavigator}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      
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
    </Stack.Navigator>
  );
}
