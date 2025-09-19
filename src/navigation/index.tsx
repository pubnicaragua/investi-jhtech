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

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';
const COMMUNITIES_COMPLETE_KEY = '@communities_complete';

// Create a wrapper component to handle the navigation
const OnboardingScreenWrapper: React.FC<{ route: any }> = ({ route }) => {
  return <OnboardingNavigator onComplete={route.params?.onComplete || (() => {})} />;
};

export function RootStack() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication and onboarding status
  useEffect(() => {
    const checkAuthAndStatus = async () => {
      try {
        // Check if user is authenticated (you might want to implement actual auth check)
        const token = await AsyncStorage.getItem('@auth_token');
        setIsAuthenticated(!!token);

        if (token) {
          const [onboarded] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
          ]);
          setIsOnboarded(onboarded === 'true');
        }
      } catch (error) {
        console.error('Error checking auth and status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleSignIn = async () => {
    // Implement your sign-in logic here
    // For now, just set authenticated to true
    setIsAuthenticated(true);
    // Check if onboarding is needed
    const onboarded = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    setIsOnboarded(onboarded === 'true');
  };

  const handleSignUp = async () => {
    // Set authenticated but not onboarded
    setIsAuthenticated(true);
    setIsOnboarded(false);
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      setIsAuthenticated(false);
      setIsOnboarded(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
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
      <Stack.Screen name="Welcome">
        {() => (
          <WelcomeScreen 
            onSignIn={() => navigation.navigate('SignIn', {
              onSignInSuccess: handleSignIn,
              onBack: () => navigation.goBack()
            })}
            onSignUp={() => navigation.navigate('SignUp', {
              onSignUpSuccess: handleSignUp,
              onBack: () => navigation.goBack()
            })}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen 
        name="SignIn"
        options={{
          headerShown: false
        }}
      >
        {() => (
          <SignInScreen 
            onSignInSuccess={handleSignIn}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen 
        name="SignUp"
        options={{
          headerShown: false
        }}
      >
        {() => (
          <SignUpScreen 
            onSignUpSuccess={handleSignUp}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      {/* Onboarding Flow */}
      {isAuthenticated && !isOnboarded && (
        <>
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
      )}

      {/* Main App */}
      {isAuthenticated && isOnboarded && (
        <Stack.Screen 
          name="HomeFeed" 
          component={DrawerNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
      )}
    </Stack.Navigator>
  );
}
