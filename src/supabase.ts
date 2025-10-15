import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables with fallbacks
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock Supabase client that won't fail on initialization
let supabase: any = {
  auth: {
    signIn: () => Promise.resolve({ error: 'Supabase not properly initialized' }),
    signOut: () => Promise.resolve({ error: 'Supabase not properly initialized' }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not properly initialized' } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
  },
  from: () => ({
    select: () => ({
      data: [],
      error: 'Supabase not properly initialized',
    }),
    insert: () => Promise.resolve({ error: 'Supabase not properly initialized' }),
    update: () => Promise.resolve({ error: 'Supabase not properly initialized' }),
    delete: () => Promise.resolve({ error: 'Supabase not properly initialized' }),
  }),
};

// Only initialize the real client if we have the required config
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Allow the client to detect session in URL when running on web so
        // OAuth redirects containing access_token in the URL are processed.
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
    console.log('✅ Supabase client initialized successfully');
    console.log('📍 Supabase URL:', supabaseUrl);
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
  }
} else {
  console.error('❌ Supabase URL or Anon Key is missing. Using mock client.');
  console.log('URL:', supabaseUrl ? '✓' : '✗');
  console.log('Key:', supabaseAnonKey ? '✓' : '✗');
}

export { supabase, supabaseUrl, supabaseAnonKey };
