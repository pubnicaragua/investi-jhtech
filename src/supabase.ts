import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log('Supabase client initialized');
  } catch (error) {
    console.warn('Failed to initialize Supabase:', error);
  }
} else {
  console.warn('Supabase URL or Anon Key is missing. Using mock client.');
}

export { supabase };
