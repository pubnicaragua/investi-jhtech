import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from './OnboardingNavigator';
import { DrawerNavigator } from './DrawerNavigator';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommunityRecommendationsScreen } from '../screens/CommunityRecommendationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';
const COMMUNITIES_COMPLETE_KEY = '@communities_complete';

// Create a wrapper component to handle the navigation
const OnboardingScreenWrapper = ({ onComplete }: { onComplete: () => void }) => {
  return <OnboardingNavigator onComplete={onComplete} />;
};

export function RootStack() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [communitiesCompleted, setCommunitiesCompleted] = useState<boolean | null>(null);

  // Check if onboarding and communities steps are complete
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [onboarded, communities] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
          AsyncStorage.getItem(COMMUNITIES_COMPLETE_KEY)
        ]);
        
        setIsOnboarded(onboarded === 'true');
        setCommunitiesCompleted(communities === 'true');
      } catch (error) {
        console.error('Error checking status:', error);
        setIsOnboarded(false);
        setCommunitiesCompleted(false);
      }
    };

    checkStatus();
  }, []);

  // Show loading state while checking status
  if (isOnboarded === null || communitiesCompleted === null) {
    return null; // Or a loading spinner
  }

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleCommunitiesComplete = async () => {
    try {
      await AsyncStorage.setItem(COMMUNITIES_COMPLETE_KEY, 'true');
      setCommunitiesCompleted(true);
    } catch (error) {
      console.error('Error saving communities status:', error);
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isOnboarded ? (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreenWrapper onComplete={handleOnboardingComplete} />}
        </Stack.Screen>
      ) : !communitiesCompleted ? (
        <Stack.Screen 
          name="CommunityRecommendations" 
          component={CommunityRecommendationsScreen}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
          initialParams={{
            onComplete: handleCommunitiesComplete
          }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Home" 
            component={DrawerNavigator} 
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="HomeFeed" 
            component={DrawerNavigator}
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
