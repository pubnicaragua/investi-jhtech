import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth Flow
  Welcome: {
    onSignIn?: () => void;
    onSignUp?: () => void;
  };
  SignIn: {
    onSignInSuccess: () => void;
    onBack: () => void;
  };
  SignUp: {
    onSignUpSuccess: () => void;
    onBack: () => void;
  };
  AuthCallback: undefined;
  
  // Onboarding Flow
  Onboarding: undefined;
  UploadAvatar: undefined;
  PickGoals: undefined;
  PickInterests: undefined;
  PickKnowledge: undefined;
  InvestmentKnowledge: undefined;
  CommunityRecommendations: {
    onComplete: () => void;
  };
  
  // Main App
  MainApp: undefined;
  Home: undefined;
  HomeFeed: undefined;
  CreatePost: undefined;
  PostDetail: { postId: string };
  Communities: undefined;
  CommunityDetail: { communityId: string };
  CommunityMembers: { communityId: string };
  CommunitySettings: { communityId: string };
  CreateCommunity: undefined;
  EditCommunity: { communityId: string };
  
  // Profile & Settings
  Profile: { userId?: string };
  EditProfile: undefined;
  Followers: { userId: string };
  Following: { userId: string };
  Settings: undefined;
  LanguageSelection: undefined;
  SavedPosts: undefined;
  
  // Market & Investments
  Market: undefined;
  MarketInfo: undefined;
  Inversiones: undefined;
  Inversionista: undefined;
  PlanificadorFinanciero: undefined;
  CazaHormigas: undefined;
  ReportesAvanzados: undefined;
  
  // Education
  Educacion: undefined;
  CourseDetail: { courseId: string };
  LearningPaths: undefined;
  
  // Chat & Messages
  ChatList: undefined;
  ChatScreen: { chatId?: string };
  GroupChat: { groupId: string };
  Messages: undefined;
  NewMessageScreen: undefined;
  SharePost: { postId: string; content: string };
  
  // Media
  VideoPlayer: { videoId: string };
  
  // Notifications
  Notifications: undefined;
  
  // Debug
  DebugStorage: undefined;
  
  // News & Promotions
  News: undefined;
  NewsDetail: { newsId: string };
  Promotions: undefined;
  PromotionDetail: { promotionId: string };
  
  // Payments
  Payment: undefined;
  
  // Development
  DevMenu: undefined;
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
