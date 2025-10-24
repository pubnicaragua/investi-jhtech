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
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    icon: './assets/investi-logo.png',
    assetBundlePatterns: [
      'assets/*.png',
      'assets/*.jpg',
      'assets/*.jpeg',
      'assets/*.mp4',
      'assets/*.gif'
    ],
    scheme: 'investi-community',
    // Deep linking configuration for OAuth callbacks
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: '*.investi.app',
            pathPrefix: '/auth/callback'
          },
          {
            scheme: 'investi-community',
            host: 'auth',
            pathPrefix: '/callback'
          }
        ],
        category: ['BROWSABLE', 'DEFAULT']
      }
    ],
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
      jsEngine: 'hermes',
      // Associated Domains for Universal Links (OAuth callbacks)
      associatedDomains: [
        'applinks:investi.app',
        'applinks:*.investi.app'
      ]
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
