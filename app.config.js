export default {
  expo: {
    name: 'investi-app',
    slug: 'investi-app',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'investi',
    plugins: [
      "expo-build-properties"
    ],
    android: {
      package: 'com.investi.app',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: 'https://www.investiiapp.com/investi-logo-new-main.png',
        backgroundColor: '#FFFFFF'
      }
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "82b22488-cbbd-45ea-bd0e-dd6ec1f2b7fb"
      }
    },
  },
};
