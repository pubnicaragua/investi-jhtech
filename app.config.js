export default {
  expo: {
    name: 'Investi App',
    slug: 'investi-app',
    version: '1.0.0',
    orientation: 'portrait',
    jsEngine: 'hermes',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    icon: 'https://www.investiiapp.com/investi-logo-new-main.png',
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
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
            gradleVersion: '8.10.2',
            androidGradlePluginVersion: '8.2.1',
            kotlinVersion: '1.8.22'
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
        foregroundImage: 'https://www.investiiapp.com/investi-logo-new-main.png',
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
    sdkVersion: '51.0.0'
  },
};
