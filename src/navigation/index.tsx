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
          // PRIORIDAD 1: Verificar en la base de datos
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userData, error } = await supabase
              .from('users')
              .select('onboarding_step')
              .eq('id', user.id)
              .single();

            if (!error && userData) {
              const isComplete = userData.onboarding_step === 'completed';
              console.log('[RootStack] Onboarding status from DB:', userData.onboarding_step);
              
              // Sincronizar con AsyncStorage
              await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, isComplete ? 'true' : 'false');
              setIsOnboarded(isComplete);
              setIsCheckingOnboarding(false);
              return;
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
    </Stack.Navigator>
  );
}
