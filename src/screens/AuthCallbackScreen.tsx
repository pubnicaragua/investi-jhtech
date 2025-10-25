"use client"

import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Alert, Platform } from 'react-native'
import * as Linking from 'expo-linking'
import { supabase } from '../supabase'
import { useNavigation } from '@react-navigation/native'

export default function AuthCallbackScreen() {
  const navigation: any = useNavigation()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    let mounted = true

    const handle = async () => {
      try {
        console.log('[AuthCallback] Handling auth callback...')
        // Get initial URL that opened this screen / app
        let initialUrl: string | null = null
        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location && window.location.href) {
            initialUrl = window.location.href
          } else {
            initialUrl = await Linking.getInitialURL()
          }
        } catch (err) {
          console.warn('[AuthCallback] Error getting initial URL:', err)
        }

        // Check if this is a LinkedIn OAuth callback
        const isLinkedInCallback = initialUrl && (
          initialUrl.includes('linkedin-auth') ||
          initialUrl.includes('access_token') ||
          initialUrl.includes('provider=linkedin')
        )

        if (isLinkedInCallback) {
          console.log('[AuthCallback] Detected LinkedIn OAuth callback')

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
            console.log('[AuthCallback] LinkedIn tokens received, setting session...')

            // Set the session with the tokens from LinkedIn Edge Function
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || accessToken, // Use access token as fallback
            })

            if (sessionError) {
              console.error('[AuthCallback] Error setting LinkedIn session:', sessionError)
              Alert.alert('Error', 'No se pudo establecer la sesión de LinkedIn')
              navigation.navigate('SignIn')
              return
            }

            console.log('[AuthCallback] LinkedIn session set successfully')

            // Navigate to UploadAvatar to continue onboarding
            if (mounted) {
              navigation.reset({ index: 0, routes: [{ name: 'UploadAvatar' }] })
            }
            return
          }
        }

        // Handle standard OAuth providers (Google, Facebook)
        // First, try to let supabase parse session from the URL if available
        if (initialUrl) {
          console.log('[AuthCallback] initialUrl:', initialUrl)
          try {
            // @ts-ignore - getSessionFromUrl may or may not exist depending on platform/version
            if (typeof supabase.auth.getSessionFromUrl === 'function') {
              // Pass the URL explicitly (works on web and can work on native)
              // storeSession=true => supabase will persist the session
              // @ts-ignore
              const result = await supabase.auth.getSessionFromUrl({ url: initialUrl, storeSession: true })
              if (result?.data?.session) {
                console.log('[AuthCallback] Session obtained from URL via getSessionFromUrl')
              } else {
                console.log('[AuthCallback] getSessionFromUrl did not return a session')
              }
            } else {
              console.log('[AuthCallback] getSessionFromUrl not available on this client')
            }
          } catch (err) {
            console.warn('[AuthCallback] getSessionFromUrl call failed:', err)
          }
        } else {
          console.log('[AuthCallback] No initial URL available to parse')
        }

        // Re-fetch session after attempting URL handling
        const { data: refreshed, error: refreshedErr } = await supabase.auth.getSession()
        if (refreshedErr) console.warn('[AuthCallback] getSession (refreshed) error:', refreshedErr)

        const finalSession = refreshed?.session || null

        if (!finalSession) {
          Alert.alert('Error', 'No se pudo recuperar la sesión después del retorno del proveedor')
          navigation.navigate('SignIn')
          return
        }

        const user = finalSession.user
        console.log('[AuthCallback] OAuth user id:', user.id)

        // Ensure there's a row in public.users (profile)
        const { data: existing, error: selectErr } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (selectErr && selectErr.code !== 'PGRST116') {
          // PGRST116 may be returned when no rows found depending on PostgREST settings; ignore
          console.warn('[AuthCallback] select users error (ignored if no rows):', selectErr)
        }

        if (!existing) {
          const payload: any = {
            id: user.id,
            email: user.email || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Try to fill common fields from user.user_metadata
          try {
            // @ts-ignore
            const meta = user.user_metadata || user.userMeta || {}
            if (meta.full_name || meta.name) payload.full_name = (meta.full_name || meta.name)
            if (meta.username) payload.username = meta.username
          } catch (err) {
            // ignore
          }

          const { error: insertErr } = await supabase.from('users').insert(payload)
          if (insertErr) {
            console.error('[AuthCallback] Error inserting profile:', insertErr)
          } else {
            console.log('[AuthCallback] Profile row created for user:', user.id)
          }
        } else {
          console.log('[AuthCallback] Profile already exists for user:', user.id)
        }

        // Navigate to UploadAvatar to continue onboarding
        if (mounted) {
          navigation.reset({ index: 0, routes: [{ name: 'UploadAvatar' }] })
        }
      } catch (error: any) {
        console.error('[AuthCallback] Error handling callback:', error)
        Alert.alert('Error', error?.message || 'Error durante el proceso de autenticación')
        navigation.navigate('SignIn')
      } finally {
        if (mounted) setProcessing(false)
      }
    }

    handle()

    return () => { mounted = false }
  }, [navigation])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12 }}>{processing ? 'Procesando inicio de sesión...' : 'Redirigiendo...'}</Text>
    </View>
  )
}
