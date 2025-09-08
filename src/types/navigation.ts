import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: { onComplete: () => void };
  CommunityRecommendations: { onComplete: () => void };
  Home: undefined;
  HomeFeed: undefined;
  Profile: undefined;
  Settings: undefined;
  Auth: undefined;
};

export type OnboardingStackParamList = {
  CommunityRecommendations: undefined;
  InvestmentGoals: undefined;
  InvestmentKnowledge: {
    selectedGoals?: string[];
  };
  InvestmentInterests: {
    selectedGoals?: string[];
    knowledgeLevel?: string;
  };
  OnboardingComplete: {
    selectedGoals?: string[];
    knowledgeLevel?: string;
    selectedInterests?: string[];
    onComplete?: () => void;
  };
};

export type MainTabParamList = {
  HomeFeed: undefined;
  Market: undefined;
  Create: undefined;
  Communities: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  CommunityRecommendations: { onComplete: () => void };
  HomeFeed: undefined;
  Profile: { userId?: string };
  Settings: undefined;
  Auth: undefined;
};
