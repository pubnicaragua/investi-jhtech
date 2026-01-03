export default {
  expo: {
    name: 'Investi App',
    slug: 'investi-app',
    version: '1.0.7',
    orientation: 'portrait',
    jsEngine: 'hermes',
    userInterfaceStyle: 'light',
    updates: {
      url: 'https://u.expo.dev/82b22488-cbbd-45ea-bd0e-dd6ec1f2b7fb'
    },
    icon: './assets/investi-logo.png',
    assetBundlePatterns: [
      'assets/**/*'
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
      './plugins/withKotlinVersion',
      './plugins/withNoSplash'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.investi.app',
      jsEngine: 'hermes',
      runtimeVersion: {
        policy: 'appVersion'
      },
      // Associated Domains for Universal Links (OAuth callbacks)
      associatedDomains: [
        'applinks:investiiapp.com',
        'applinks:*.investiiapp.com'
      ]
    },
    android: {
      package: 'com.investi.app',
      versionCode: 10,
      runtimeVersion: '1.0.7',
      adaptiveIcon: {
        foregroundImage: './assets/investi-logo.png',
        backgroundColor: '#FFFFFF',
        monochromeImage: './assets/investi-logo.png'
      },
      jsEngine: 'hermes',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'NOTIFICATIONS',
        'RECORD_AUDIO'
      ]
    },
    web: {
      bundler: 'metro',
      favicon: './assets/investi-logo.png',
      name: 'Investí - Educación Financiera',
      shortName: 'Investí',
      description: 'Plataforma de educación financiera y comunidad para jóvenes',
      themeColor: '#2673f3',
      backgroundColor: '#ffffff'
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_GROK_API_KEY: process.env.EXPO_PUBLIC_GROK_API_KEY,
      eas: {
        projectId: '82b22488-cbbd-45ea-bd0e-dd6ec1f2b7fb'
      }
    },
    sdkVersion: '53.0.0',
  },
};
