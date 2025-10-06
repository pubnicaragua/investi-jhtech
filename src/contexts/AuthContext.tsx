import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { storage } from '../utils/storage';

export type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
};

type AuthContextData = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupAuth = async () => {
      try {
        console.log('[AuthProvider] Setting up auth listener');
        
        // Set up auth state listener
        const { data: authData } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            if (!mounted) return;
            
            console.log('[AuthProvider] Auth event:', event);
            try {
              if (session) {
                setSession(session);
                setUser(session.user as unknown as User);
                setIsAuthenticated(true);
                await storage.setItem('access_token', session.access_token);
                await storage.setItem('@auth_token', session.access_token);
                if (session.refresh_token) {
                  await storage.setItem('refresh_token', session.refresh_token);
                }
              } else {
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                await storage.removeItem('access_token');
                await storage.removeItem('refresh_token');
                await storage.removeItem('@auth_token');
              }
            } catch (error) {
              console.error('[AuthProvider] Error in auth state change:', error);
            }
          }
        );

        // Store the unsubscribe function
        if (authData?.subscription?.unsubscribe) {
          unsubscribe = () => authData.subscription.unsubscribe();
        }

        // Check for existing session
        console.log('[AuthProvider] Checking existing session');
        const { data: sessionData } = await supabase.auth.getSession();
        if (mounted && sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user as unknown as User);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('[AuthProvider] Error in setupAuth:', error);
      }
    };

    setupAuth().catch(console.error);

    // Cleanup
    return () => {
      console.log('[AuthProvider] Cleaning up');
      mounted = false;
      try {
        if (unsubscribe) {
          unsubscribe();
        }
      } catch (error) {
        console.error('[AuthProvider] Error during cleanup:', error);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Save auth token for navigation
      if (data?.session?.access_token) {
        await storage.setItem('@auth_token', data.session.access_token);
      }
      
      // El listener de onAuthStateChange manejará el resto
      return data;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear auth token
      await storage.removeItem('@auth_token');
      
      // El listener de onAuthStateChange manejará la limpieza
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signIn,
        signOut,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
