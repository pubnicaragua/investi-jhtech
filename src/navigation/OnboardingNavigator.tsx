import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PickGoalsScreen } from '../screens/PickGoalsScreen';
import { InvestmentKnowledgeScreen } from '../screens/InvestmentKnowledgeScreen';
import { PickInterestsScreen } from '../screens/PickInterestsScreen';
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
        component={PickGoalsScreen} 
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
        component={PickInterestsScreen} 
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
