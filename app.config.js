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
      fallbackToCacheTimeout: 0
    },
    newArchEnabled: false,
    splash: {
      image: './assets/investi-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    icon: './assets/investi-logo.png',
    assetBundlePatterns: ['**/*'],
    scheme: 'investi-community',
    plugins: [
      'expo-localization',
      'expo-secure-store',
      'expo-router',
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
            gradleVersion: '8.8',
            androidGradlePluginVersion: '8.7.0',
            kotlinVersion: '1.9.24',
            newArchEnabled: false,
            enableProguardInReleaseBuilds: false,
            enableHermes: true
          },
          ios: {
            newArchEnabled: false
          }
        }
      ]
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
