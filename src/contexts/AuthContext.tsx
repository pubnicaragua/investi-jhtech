import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { storage } from '../utils/storage';
import { migrateStorageKeys } from '../utils/storageMigration';
import { setupNotificationChannel, showWelcomeNotification } from '../utils/notifications';
import { FeedbackModal } from '../components/FeedbackModal';

// Helper function to load complete user data from public.users
async function loadCompleteUserData(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, full_name, username, photo_url, avatar_url, bio, role, pais, email')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('[loadCompleteUserData] Error:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('[loadCompleteUserData] Exception:', error);
    return null;
  }
}

export type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  photo_url?: string;
  avatar_url?: string;
  full_name?: string;
  nombre?: string;
  bio?: string;
  role?: string;
  pais?: string;
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
  refreshUser: () => Promise<void>;
  showFeedbackModal: (type: 'periodic' | 'logout') => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Start as false para mostrar UI inmediatamente
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'periodic' | 'logout'>('periodic');

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupAuth = async () => {
      try {
        console.log('[AuthProvider] Setting up auth listener');

        // 🚀 Ejecutar migración y notificaciones en paralelo (no bloquean UI)
        Promise.all([
          migrateStorageKeys(),
          setupNotificationChannel()
        ]).catch(err => console.warn('[AuthProvider] Background tasks error:', err));
        
        // 🔧 Cargar tokens en paralelo
        const [savedToken, savedUserId] = await Promise.all([
          storage.getItem('auth_token'),
          storage.getItem('userId')
        ]);
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
                
                // OPTIMIZACIÓN: Actualizar estado INMEDIATAMENTE (no esperar nada)
                setSession(session);
                setUser(session.user as unknown as User);
                setIsAuthenticated(true);
                setIsLoading(false); // ⚡ CRÍTICO: Terminar loading AHORA
                
                console.log('[AuthProvider] ⚡ Estado actualizado instantáneamente');
                
                // OPTIMIZACIÓN: Guardar tokens en paralelo (no bloquea UI)
                Promise.all([
                  storage.setItem('access_token', session.access_token),
                  storage.setItem('auth_token', session.access_token),
                  storage.setItem('userToken', session.access_token),
                  storage.setItem('userId', session.user.id),
                  session.refresh_token ? storage.setItem('refresh_token', session.refresh_token) : Promise.resolve(),
                ]).catch(err => console.warn('[AuthProvider] Error saving tokens:', err));
                
                // OPTIMIZACIÓN: Cargar datos completos en segundo plano (no bloquea)
                loadCompleteUserData(session.user.id).then(completeUserData => {
                  if (mounted && completeUserData) {
                    setUser(completeUserData);
                    console.log('[AuthProvider] ✅ Datos completos cargados');
                  }
                }).catch(err => console.warn('[AuthProvider] Error loading complete data:', err));
              } else {
                console.log('[AuthProvider] ❌ No session, clearing...');
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                setIsLoading(false);
                
                // OPTIMIZACIÓN: Limpiar tokens en paralelo (no bloquea)
                Promise.all([
                  storage.removeItem('access_token'),
                  storage.removeItem('refresh_token'),
                  storage.removeItem('auth_token'),
                  storage.removeItem('userToken'),
                  storage.removeItem('userId'),
                ]).catch(err => console.warn('[AuthProvider] Error clearing tokens:', err));
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

        // Check for existing session con timeout reducido a 1 segundo
        console.log('[AuthProvider] Checking existing session from Supabase...');
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve({ data: { session: null }, error: null }), 1000)
        );
        
        const { data: sessionData, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error('[AuthProvider] ❌ Error getting session:', sessionError);
        }
        
        if (mounted && sessionData?.session) {
          console.log('[AuthProvider] ✅ Found existing session');
          setSession(sessionData.session);
          setIsAuthenticated(true);
          
          // Cargar datos de usuario en segundo plano (no bloquea)
          loadCompleteUserData(sessionData.session.user.id).then(completeUserData => {
            if (mounted && completeUserData) {
              setUser(completeUserData);
            } else if (mounted) {
              setUser(sessionData.session.user as unknown as User);
            }
          });
          
          // Guardar tokens en paralelo (no bloquea)
          Promise.all([
            storage.setItem('auth_token', sessionData.session.access_token),
            storage.setItem('userToken', sessionData.session.access_token),
            storage.setItem('userId', sessionData.session.user.id)
          ]).catch(err => console.warn('[AuthProvider] Error saving tokens:', err));
        } else if (savedToken && savedUserId) {
          // Si no hay sesión en Supabase pero hay token guardado, intentar restaurar en segundo plano
          console.log('[AuthProvider] 🔄 No Supabase session but found saved token, attempting restore...');
          supabase.auth.getUser(savedToken).then(({ data: userData, error: userError }: any) => {
            if (!mounted) return;
            
            if (!userError && userData?.user) {
              console.log('[AuthProvider] ✅ Restored session from saved token');
              setIsAuthenticated(true);
              
              // Cargar datos completos en segundo plano
              loadCompleteUserData(userData.user.id).then(completeUserData => {
                if (mounted && completeUserData) {
                  setUser(completeUserData);
                } else if (mounted) {
                  setUser(userData.user as unknown as User);
                }
              });
            } else {
              console.log('[AuthProvider] ⚠️ Could not restore session, clearing tokens');
              Promise.all([
                storage.removeItem('auth_token'),
                storage.removeItem('userToken'),
                storage.removeItem('userId')
              ]).catch(err => console.warn('[AuthProvider] Error clearing tokens:', err));
            }
          }).catch((restoreError: any) => {
            console.error('[AuthProvider] ❌ Error restoring session:', restoreError);
          });
        } else {
          console.log('[AuthProvider] ℹ️ No existing session found, showing auth screens');
        }
        
        // Marcar que ya se hizo la verificación inicial
        setInitialCheckDone(true);
        // IMPORTANTE: Terminar el estado de carga para que la navegación funcione
        setIsLoading(false);
      } catch (error) {
        console.error('[AuthProvider] Error in setupAuth:', error);
        setInitialCheckDone(true);
        // IMPORTANTE: Terminar el estado de carga incluso si hay error
        setIsLoading(false);
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
      
      // ⚡ OPTIMIZACIÓN CRÍTICA: Actualizar estado INMEDIATAMENTE
      if (data?.session) {
        // 1. Actualizar estado PRIMERO (instantáneo)
        setSession(data.session);
        setUser(data.user as unknown as User);
        setIsAuthenticated(true);
        setIsLoading(false); // ⚡ Terminar loading AHORA para que navegue
        
        console.log('[AuthContext] ⚡ Estado actualizado instantáneamente - Usuario puede navegar');
        
        // 2. Guardar tokens en paralelo (no bloquea UI)
        Promise.all([
          storage.setItem('auth_token', data.session.access_token),
          storage.setItem('userToken', data.session.access_token),
          storage.setItem('access_token', data.session.access_token),
          storage.setItem('userId', data.user.id),
          storage.setItem('user_language', 'es'),
          data.session.refresh_token ? storage.setItem('refresh_token', data.session.refresh_token) : Promise.resolve(),
        ]).then(() => {
          console.log('[AuthContext] ✅ Tokens guardados');
        }).catch(err => console.warn('[AuthContext] Error saving tokens:', err));
        
        // 3. Cargar datos completos en segundo plano (no bloquea)
        loadCompleteUserData(data.user.id).then(completeUserData => {
          if (completeUserData) {
            setUser(completeUserData);
            console.log('[AuthContext] ✅ Datos completos cargados');
          }
        }).catch(err => console.warn('[AuthContext] Error loading complete data:', err));
        
        // 4. Notificación en segundo plano (no bloquea)
        showWelcomeNotification().catch(err => console.warn('[AuthContext] Error showing notification:', err));
      }

      return data;
    } catch (error: any) {
      console.error('[AuthContext] Error signing in:', error);
      throw error;
    } finally {
      // No hacer nada aquí - el loading ya se terminó arriba para ser más rápido
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
      await storage.removeItem('auth_token');
      
      // El listener de onAuthStateChange manejará la limpieza
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('[AuthContext] 🔄 Refreshing user data...');
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        const completeUserData = await loadCompleteUserData(sessionData.session.user.id);
        if (completeUserData) {
          console.log('[AuthContext] ✅ User data refreshed:', completeUserData.username || completeUserData.full_name);
          setUser(completeUserData);
        }
      }
    } catch (error) {
      console.error('[AuthContext] ❌ Error refreshing user:', error);
    }
  };

  const showFeedbackModal = useCallback((type: 'periodic' | 'logout') => {
    setFeedbackType(type);
    setFeedbackModalVisible(true);
  }, []);

  // Timer para mostrar feedback cada 10 minutos
  useEffect(() => {
    if (!isAuthenticated) return;

    const FEEDBACK_INTERVAL = 10 * 60 * 1000; // 10 minutos
    const timer = setInterval(() => {
      console.log('[AuthContext] 📝 Mostrando feedback periódico');
      showFeedbackModal('periodic');
    }, FEEDBACK_INTERVAL);

    return () => clearInterval(timer);
  }, [isAuthenticated, showFeedbackModal]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signIn,
        signOut,
        updateUser,
        refreshUser,
        showFeedbackModal,
      }}>
      {children}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        type={feedbackType}
      />
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
