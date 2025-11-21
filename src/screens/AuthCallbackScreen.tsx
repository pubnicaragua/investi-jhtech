"use client"

import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Alert, Platform } from 'react-native'
import * as Linking from 'expo-linking'
import { supabase } from '../supabase'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallbackScreen() {
  const navigation: any = useNavigation()
  const { refreshUser } = useAuth()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Iniciando...')

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const handle = async () => {
      try {
        console.log('[AuthCallback] 🔐 Handling auth callback...')
        
        // Timeout de seguridad: si tarda más de 10 segundos, mostrar error
        timeoutId = setTimeout(() => {
          if (mounted && processing) {
            console.error('[AuthCallback] ⏱️ Timeout: El proceso tardó demasiado')
            setError('El proceso de autenticación tardó demasiado. Por favor, intenta de nuevo.')
            setProcessing(false)
            setTimeout(() => {
              if (mounted) navigation.navigate('SignIn')
            }, 2000)
          }
        }, 10000)
        // Get initial URL that opened this screen / app
        setStatus('Obteniendo datos de autenticación...')
        let initialUrl: string | null = null
        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location && window.location.href) {
            initialUrl = window.location.href
            console.log('[AuthCallback] 🌐 Web URL:', initialUrl)
          } else {
            // En mobile, intentar obtener la URL de múltiples formas
            initialUrl = await Linking.getInitialURL()
            console.log('[AuthCallback] 📱 Mobile URL (getInitialURL):', initialUrl)
            
            // Si no hay URL inicial, esperar por el evento de URL
            if (!initialUrl) {
              console.log('[AuthCallback] ⏳ Esperando evento de URL...')
              const urlListener = Linking.addEventListener('url', (event) => {
                console.log('[AuthCallback] 📱 URL recibida via evento:', event.url)
                initialUrl = event.url
              })
              
              // Esperar máximo 1 segundo por el evento (reducido para ser más rápido)
              await new Promise(resolve => setTimeout(resolve, 1000))
              urlListener.remove()
            }
          }
        } catch (err) {
          console.warn('[AuthCallback] ⚠️ Error getting initial URL:', err)
        }
        
        if (!initialUrl) {
          console.error('[AuthCallback] ❌ No se pudo obtener la URL de callback')
          throw new Error('No se pudo obtener la URL de autenticación. Por favor, intenta de nuevo.')
        }

        // Check if this is a LinkedIn OAuth callback
        const isLinkedInCallback = initialUrl && (
          initialUrl.includes('linkedin-auth') ||
          (initialUrl.includes('access_token') && initialUrl.includes('provider=linkedin')) ||
          initialUrl.includes('/auth/callback?access_token')
        )

        if (isLinkedInCallback) {
          console.log('[AuthCallback] 🔵 Detected LinkedIn OAuth callback')

          // For LinkedIn, the Edge Function handles the OAuth flow and redirects back
          // with tokens in the URL. We need to extract and use them.
          const urlParams = new URLSearchParams(initialUrl!.split('?')[1] || '')
          const accessToken = urlParams.get('access_token')
          const refreshToken = urlParams.get('refresh_token')
          const provider = urlParams.get('provider')
          const error = urlParams.get('error')

          if (error) {
            console.error('[AuthCallback] LinkedIn OAuth error:', error)
            Alert.alert('Error', `Error en autenticación LinkedIn: ${error}`)
            navigation.navigate('SignIn')
            return
          }

          if (accessToken && provider === 'linkedin') {
            console.log('[AuthCallback] 🔵 LinkedIn tokens received, setting session...')

            // Set the session with the tokens from LinkedIn Edge Function
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || accessToken, // Use access token as fallback
            })

            if (sessionError) {
              console.error('[AuthCallback] ❌ Error setting LinkedIn session:', sessionError)
              Alert.alert('Error', 'No se pudo establecer la sesión de LinkedIn')
              if (mounted) navigation.navigate('SignIn')
              return
            }

            console.log('[AuthCallback] ✅ LinkedIn session set successfully')

            // Get the user from the session
            const user = sessionData?.session?.user
            if (!user) {
              console.error('[AuthCallback] ❌ No user in LinkedIn session')
              Alert.alert('Error', 'No se pudo obtener el usuario de LinkedIn')
              if (mounted) navigation.navigate('SignIn')
              return
            }

            // Ensure profile exists in public.users
            await ensureUserProfile(user)

            // Navigate to Onboarding to continue the flow
            if (mounted) {
              console.log('[AuthCallback] 🔵 LinkedIn: Redirecting to Onboarding')
              navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
            }
            return
          }
        }

        // Handle standard OAuth providers (Google, Facebook)
        setStatus('Verificando sesión...')
        console.log('[AuthCallback] 🔄 Processing standard OAuth (Google/Facebook)...')
        
        // First, try to let supabase parse session from the URL if available
        if (initialUrl) {
          console.log('[AuthCallback] 📍 Processing URL:', initialUrl.substring(0, 100) + '...')
          try {
            // @ts-ignore - getSessionFromUrl may or may not exist depending on platform/version
            if (typeof supabase.auth.getSessionFromUrl === 'function') {
              // Pass the URL explicitly (works on web and can work on native)
              // storeSession=true => supabase will persist the session
              // @ts-ignore
              const result = await supabase.auth.getSessionFromUrl({ url: initialUrl, storeSession: true })
              if (result?.data?.session) {
                console.log('[AuthCallback] ✅ Session obtained from URL via getSessionFromUrl')
              } else {
                console.log('[AuthCallback] ⚠️ getSessionFromUrl did not return a session')
              }
            } else {
              console.log('[AuthCallback] ℹ️ getSessionFromUrl not available on this client')
            }
          } catch (err) {
            console.warn('[AuthCallback] ⚠️ getSessionFromUrl call failed:', err)
          }
        } else {
          console.log('[AuthCallback] ⚠️ No initial URL available to parse')
        }

        // Re-fetch session after attempting URL handling
        setStatus('Validando credenciales...')
        const { data: refreshed, error: refreshedErr } = await supabase.auth.getSession()
        if (refreshedErr) console.warn('[AuthCallback] ⚠️ getSession (refreshed) error:', refreshedErr)

        const finalSession = refreshed?.session || null

        if (!finalSession) {
          console.error('[AuthCallback] ❌ No session found after OAuth callback')
          Alert.alert('Error', 'No se pudo recuperar la sesión después del retorno del proveedor')
          if (mounted) navigation.navigate('SignIn')
          return
        }

        const user = finalSession.user
        const provider = user.app_metadata?.provider || 'unknown'
        console.log('[AuthCallback] ✅ OAuth user authenticated:', {
          id: user.id,
          email: user.email,
          provider: provider
        })

        // Ensure profile exists in public.users
        setStatus('Configurando perfil...')
        await ensureUserProfile(user)

        // Refresh user data in AuthContext to update Sidebar
        setStatus('Actualizando datos...')
        await refreshUser()

        // Navigate to Onboarding to continue the flow
        if (mounted) {
          setStatus('¡Listo! Redirigiendo...')
          console.log('[AuthCallback] ✅ Redirecting to Onboarding flow')
          await new Promise(resolve => setTimeout(resolve, 200)) // Pausa mínima para mostrar el mensaje
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
        }
      } catch (error: any) {
        console.error('[AuthCallback] ❌ Error handling callback:', error)
        Alert.alert('Error', error?.message || 'Error durante el proceso de autenticación')
        if (mounted) navigation.navigate('SignIn')
      } finally {
        if (mounted) setProcessing(false)
      }
    }

    // Helper function to ensure user profile exists
    const ensureUserProfile = async (user: any) => {
      try {
        console.log('[AuthCallback] 🔍 Checking if profile exists for user:', user.id)
        
        const { data: existing, error: selectErr } = await supabase
          .from('users')
          .select('id, onboarding_step')
          .eq('id', user.id)
          .single()

        if (selectErr && selectErr.code !== 'PGRST116') {
          console.warn('[AuthCallback] ⚠️ select users error (ignored if no rows):', selectErr)
        }

        if (!existing) {
          console.log('[AuthCallback] 📝 Creating new profile for user:', user.id)
          
          const meta = user.user_metadata || {}
          const provider = user.app_metadata?.provider || 'unknown'
          
          const payload: any = {
            id: user.id,
            email: user.email || null,
            full_name: meta.full_name || meta.name || null,
            nombre: meta.full_name || meta.name || null,
            username: meta.username || user.email?.split('@')[0] || null,
            avatar_url: meta.avatar_url || meta.picture || null,
            photo_url: meta.avatar_url || meta.picture || null,
            onboarding_step: 'upload_avatar', // Start onboarding from avatar
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: insertErr } = await supabase.from('users').insert(payload)
          if (insertErr) {
            console.error('[AuthCallback] ❌ Error inserting profile:', insertErr)
          } else {
            console.log('[AuthCallback] ✅ Profile created for', provider, 'user:', user.id)
          }
        } else {
          console.log('[AuthCallback] ✅ Profile already exists, onboarding_step:', existing.onboarding_step)
        }
      } catch (err) {
        console.error('[AuthCallback] ❌ Error in ensureUserProfile:', err)
      }
    }

    handle()

    return () => { 
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [navigation])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
      {processing && <ActivityIndicator size="large" color="#2673f3" />}
      <Text style={{ marginTop: 12, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
        {error || status}
      </Text>
      {error && (
        <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }}>
          Serás redirigido a la pantalla de inicio de sesión...
        </Text>
      )}
    </View>
  )
}
