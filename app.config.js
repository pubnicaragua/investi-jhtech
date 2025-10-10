export default {
  expo: {
    name: 'Investi App',
    slug: 'investi-app',
    version: '1.0.0',
    orientation: 'portrait',
    jsEngine: 'hermes',
    userInterfaceStyle: 'light',
    updates: {
      enabled: false,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'never',
      url: undefined
    },
    splash: {
      image: './assets/investi-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    icon: './assets/investi-logo.png',
    assetBundlePatterns: [
      'assets/*.png',
      'assets/*.jpg',
      'assets/*.jpeg'
    ],
    scheme: 'investi-community',
    plugins: [
      'expo-localization',
      'expo-secure-store',
      'expo-router',
      'expo-dev-client',
      './plugins/withKotlinVersion'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.investi.app',
      jsEngine: 'hermes'
    },
    android: {
      package: 'com.investi.app',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/investi-logo.png',
        backgroundColor: '#FFFFFF'
      },
      jsEngine: 'hermes'
    },
    web: {
      bundler: 'metro',
      favicon: './assets/investi-logo.png'
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '82b22488-cbbd-45ea-bd0e-dd6ec1f2b7fb'
      }
    },
    sdkVersion: '53.0.0',
  },
};
