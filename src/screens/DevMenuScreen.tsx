import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

type Screen = {
  name: string;
  component: string;
  category: string;
};

export default function DevMenuScreen() {
  const navigation = useNavigation();

  const screens: Screen[] = [
    // Auth & Onboarding
    { name: "Welcome", component: "WelcomeScreen", category: "Auth" },
    { name: "Sign In", component: "SignInScreen", category: "Auth" },
    { name: "Sign Up", component: "SignUpScreen", category: "Auth" },
    { name: "Upload Avatar", component: "UploadAvatarScreen", category: "Onboarding" },
    { name: "Pick Goals", component: "PickGoalsScreen", category: "Onboarding" },
    { name: "Pick Interests", component: "PickInterestsScreen", category: "Onboarding" },
    { name: "Pick Knowledge", component: "PickKnowledgeScreen", category: "Onboarding" },
    
    // Main App
    { name: "Home Feed", component: "HomeFeedScreen", category: "Main" },
    { name: "Create Post", component: "CreatePostScreen", category: "Main" },
    { name: "Post Detail", component: "PostDetailScreen", category: "Main" },
    
    // Communities
    { name: "Communities", component: "CommunitiesScreen", category: "Communities" },
    { name: "Community Detail", component: "CommunityDetailScreen", category: "Communities" },
    { name: "Community Recommendations", component: "CommunityRecommendationsScreen", category: "Communities" },
    
    // Profile & Settings
    { name: "Profile", component: "ProfileScreen", category: "Profile" },
    { name: "Settings", component: "SettingsScreen", category: "Profile" },
    
    // Market & Education
    { name: "Market Info", component: "MarketInfoScreen", category: "Market" },
    { name: "Education", component: "EducacionScreen", category: "Education" },
    { name: "Investments", component: "InversionesScreen", category: "Market" },
    { name: "Investor Profile", component: "InversionistaScreen", category: "Profile" },
    
    // Chat & Social
    { name: "Chat List", component: "ChatListScreen", category: "Chat" },
    { name: "Chat", component: "ChatScreen", category: "Chat" },
    { name: "Messages", component: "MessagesScreen", category: "Chat" },
    
    // Other
    { name: "Promotions", component: "PromotionsScreen", category: "Other" },
    { name: "Promotion Detail", component: "PromotionDetailScreen", category: "Other" },
    { name: "News", component: "NewsScreen", category: "Other" },
    { name: "Notifications", component: "NotificationsScreen", category: "Other" },
  ];

  const categories = [...new Set(screens.map(screen => screen.category))];

  const navigateToScreen = (screenName: string) => {
    // @ts-ignore
    navigation.navigate(screenName);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Screens</Text>
      <Text style={styles.subtitle}>Total: {screens.length} screens</Text>
      
      {categories.map(category => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {screens
            .filter(screen => screen.category === category)
            .map((screen, index) => (
              <TouchableOpacity
                key={`${category}-${index}`}
                style={styles.screenButton}
                onPress={() => navigateToScreen(screen.component.replace('Screen', ''))}
              >
                <Text style={styles.screenName}>{screen.name}</Text>
                <Text style={styles.screenComponent}>{screen.component}</Text>
              </TouchableOpacity>
            ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  categoryContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  screenButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  screenName: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  screenComponent: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
});
