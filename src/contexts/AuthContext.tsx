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
        
        // 🔧 PRIMERO: Verificar si hay token guardado en AsyncStorage
        const savedToken = await storage.getItem('@auth_token');
        const savedUserId = await storage.getItem('userId');
        console.log('[AuthProvider] Saved token exists:', !!savedToken);
        console.log('[AuthProvider] Saved userId exists:', !!savedUserId);
        
        // Set up auth state listener
        const { data: authData } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            if (!mounted) return;
            
            console.log('[AuthProvider] Auth event:', event, 'Session:', !!session);
            try {
              if (session) {
                console.log('[AuthProvider] ✅ Session active, saving...');
                setSession(session);
                setUser(session.user as unknown as User);
                setIsAuthenticated(true);
                
                // Guardar en múltiples formatos para compatibilidad
                await storage.setItem('access_token', session.access_token);
                await storage.setItem('@auth_token', session.access_token);
                await storage.setItem('userToken', session.access_token);
                await storage.setItem('userId', session.user.id);
                
                if (session.refresh_token) {
                  await storage.setItem('refresh_token', session.refresh_token);
                }
                
                console.log('[AuthProvider] ✅ Tokens saved to AsyncStorage');
              } else {
                console.log('[AuthProvider] ❌ No session, clearing...');
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                
                // Limpiar todos los tokens
                await storage.removeItem('access_token');
                await storage.removeItem('refresh_token');
                await storage.removeItem('@auth_token');
                await storage.removeItem('userToken');
                await storage.removeItem('userId');
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
        console.log('[AuthProvider] Checking existing session from Supabase...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthProvider] ❌ Error getting session:', sessionError);
        }
        
        if (mounted && sessionData?.session) {
          console.log('[AuthProvider] ✅ Found existing session');
          setSession(sessionData.session);
          setUser(sessionData.session.user as unknown as User);
          setIsAuthenticated(true);
          
          // Guardar tokens
          await storage.setItem('@auth_token', sessionData.session.access_token);
          await storage.setItem('userToken', sessionData.session.access_token);
          await storage.setItem('userId', sessionData.session.user.id);
        } else if (savedToken && savedUserId) {
          // Si no hay sesión en Supabase pero hay token guardado, intentar restaurar
          console.log('[AuthProvider] 🔄 No Supabase session but found saved token, attempting restore...');
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser(savedToken);
            if (!userError && userData?.user) {
              console.log('[AuthProvider] ✅ Restored session from saved token');
              setUser(userData.user as unknown as User);
              setIsAuthenticated(true);
            } else {
              console.log('[AuthProvider] ⚠️ Could not restore session, clearing tokens');
              await storage.removeItem('@auth_token');
              await storage.removeItem('userToken');
              await storage.removeItem('userId');
            }
          } catch (restoreError) {
            console.error('[AuthProvider] ❌ Error restoring session:', restoreError);
          }
        } else {
          console.log('[AuthProvider] ❌ No session found anywhere');
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
      console.log('[AuthContext] Attempting sign in for:', email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        // Mejorar mensajes de error
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Correo o contraseña incorrectos. Verifica tus credenciales.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Debes confirmar tu correo electrónico antes de iniciar sesión.');
        } else {
          throw new Error(error.message || 'Error al iniciar sesión');
        }
      }
      
      console.log('[AuthContext] ✅ Sign in successful');
      
      // Guardar TODOS los tokens inmediatamente (no esperar al listener)
      if (data?.session) {
        console.log('[AuthContext] 💾 Saving session tokens...');
        await storage.setItem('@auth_token', data.session.access_token);
        await storage.setItem('userToken', data.session.access_token);
        await storage.setItem('access_token', data.session.access_token);
        await storage.setItem('userId', data.user.id);
        
        if (data.session.refresh_token) {
          await storage.setItem('refresh_token', data.session.refresh_token);
        }
        
        // Actualizar estado inmediatamente
        setSession(data.session);
        setUser(data.user as unknown as User);
        setIsAuthenticated(true);
        
        console.log('[AuthContext] ✅ All tokens saved and state updated');
      }
      
      return data;
    } catch (error: any) {
      console.error('[AuthContext] Error signing in:', error);
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
