import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UploadAvatarScreen } from '../screens/UploadAvatarScreen';
import { PickGoalsScreen } from '../screens/PickGoalsScreen';
import { InvestmentKnowledgeScreen } from '../screens/InvestmentKnowledgeScreen';
import { PickInterestsScreen } from '../screens/PickInterestsScreen';
import { OnboardingCompleteScreen } from '../screens/OnboardingCompleteScreen';
import { CreateCommunityPostScreen } from '../screens/CreateCommunityPostScreen';
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
      initialRouteName="UploadAvatar"
    >
      {/* PASO 0: Subir Avatar (SOLO para usuarios nuevos desde SignUp) */}
      <Stack.Screen 
        name="UploadAvatar" 
        component={UploadAvatarScreen} 
        options={{
          gestureEnabled: false,
        }}
      />

      {/* PASO 1: Seleccionar Metas */}
      <Stack.Screen 
        name="InvestmentGoals" 
        component={PickGoalsScreen} 
        options={{
          gestureEnabled: false,
        }}
      />
      
      {/* PASO 2: Seleccionar Intereses */}
      <Stack.Screen 
        name="InvestmentInterests" 
        component={PickInterestsScreen} 
        options={{
          gestureEnabled: false,
        }}
      />
      
      {/* PASO 3: Nivel de Conocimiento */}
      <Stack.Screen 
        name="InvestmentKnowledge" 
        component={InvestmentKnowledgeScreen} 
        options={{
          gestureEnabled: false,
        }}
      />
      
      {/* PASO 4: Recomendaciones de Comunidades */}
      <Stack.Screen 
        name="CommunityRecommendations" 
        component={CommunityRecommendationsScreen} 
        options={{
          gestureEnabled: false,
        }}
      />

      {/* OPCIONAL: Crear Post en Comunidad */}
      <Stack.Screen 
        name="CreateCommunityPost" 
        component={CreateCommunityPostScreen} 
        options={{
          gestureEnabled: true,
        }}
      />
      
      {/* FINAL: Onboarding Completo */}
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
