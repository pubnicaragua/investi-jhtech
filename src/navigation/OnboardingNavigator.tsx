import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvestmentGoalsScreen } from '../screens/InvestmentGoalsScreen';
import { InvestmentKnowledgeScreen } from '../screens/InvestmentKnowledgeScreen';
import { InvestmentInterestsScreen } from '../screens/InvestmentInterestsScreen';
import { OnboardingCompleteScreen } from '../screens/OnboardingCompleteScreen';
import { CommunityRecommendationsScreen } from '../screens/CommunityRecommendationsScreen';
import type { OnboardingStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type OnboardingNavigatorProps = {
  onComplete: () => void;
};

export function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="CommunityRecommendations" 
        component={CommunityRecommendationsScreen} 
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="InvestmentGoals" 
        component={InvestmentGoalsScreen} 
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="InvestmentKnowledge" 
        component={InvestmentKnowledgeScreen} 
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="InvestmentInterests" 
        component={InvestmentInterestsScreen} 
        options={{
          gestureEnabled: true,
        }}
      />
<Stack.Screen 
        name="OnboardingComplete" 
        options={{
          gestureEnabled: false,
        }}
      >
        {() => <OnboardingCompleteScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
