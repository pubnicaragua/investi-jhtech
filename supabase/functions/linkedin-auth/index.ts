import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// LinkedIn OAuth Configuration
const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Redirect URIs
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/linkedin-auth/callback`
const APP_REDIRECT_URI = 'investi-community://auth/callback'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Step 1: Initiate OAuth flow
    if (pathname.endsWith('/linkedin-auth')) {
      const state = crypto.randomUUID()
      const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
      
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID!)
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('scope', 'openid profile email')

      return Response.redirect(authUrl.toString(), 302)
    }

    // Step 2: Handle OAuth callback
    if (pathname.endsWith('/callback')) {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')

      if (error) {
        console.error('LinkedIn OAuth error:', error)
        return Response.redirect(
          `${APP_REDIRECT_URI}?error=${encodeURIComponent(error)}`,
          302
        )
      }

      if (!code) {
        return new Response(
          JSON.stringify({ error: 'No authorization code provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: LINKEDIN_CLIENT_ID!,
          client_secret: LINKEDIN_CLIENT_SECRET!,
          redirect_uri: REDIRECT_URI,
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed:', errorData)
        return Response.redirect(
          `${APP_REDIRECT_URI}?error=token_exchange_failed`,
          302
        )
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Get user profile from LinkedIn
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.text()
        console.error('Profile fetch failed:', errorData)
        return Response.redirect(
          `${APP_REDIRECT_URI}?error=profile_fetch_failed`,
          302
        )
      }

      const profileData = await profileResponse.json()

      // Create Supabase client with service role key
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', profileData.email)
        .single()

      let userId: string

      if (existingUser) {
        // User exists, update profile
        userId = existingUser.id
        await supabase
          .from('users')
          .update({
            full_name: profileData.name,
            nombre: profileData.name,
            photo_url: profileData.picture,
            avatar_url: profileData.picture,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      } else {
        // Create new user in auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: profileData.email,
          email_confirm: true,
          user_metadata: {
            full_name: profileData.name,
            avatar_url: profileData.picture,
            provider: 'linkedin',
          },
        })

        if (authError || !authUser.user) {
          console.error('Auth user creation failed:', authError)
          return Response.redirect(
            `${APP_REDIRECT_URI}?error=user_creation_failed`,
            302
          )
        }

        userId = authUser.user.id

        // Create user profile in public.users
        const username = profileData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
        
        await supabase
          .from('users')
          .insert({
            id: userId,
            email: profileData.email,
            full_name: profileData.name,
            nombre: profileData.name,
            username: username,
            photo_url: profileData.picture,
            avatar_url: profileData.picture,
          })
      }

      // Generate session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: profileData.email,
      })

      if (sessionError || !sessionData) {
        console.error('Session generation failed:', sessionError)
        return Response.redirect(
          `${APP_REDIRECT_URI}?error=session_generation_failed`,
          302
        )
      }

      // Redirect back to app with success
      const redirectUrl = new URL(APP_REDIRECT_URI)
      redirectUrl.searchParams.set('access_token', sessionData.properties.hashed_token)
      redirectUrl.searchParams.set('refresh_token', sessionData.properties.hashed_token)
      redirectUrl.searchParams.set('provider', 'linkedin')
      redirectUrl.searchParams.set('type', 'signup')

      return Response.redirect(redirectUrl.toString(), 302)
    }

    // Default response
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('LinkedIn auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
