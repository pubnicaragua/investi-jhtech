 # ENDPOINTS COMPLETOS USADOS EN PANTALLAS DE CHAT Y COMUNIDADES

## ✅ ENDPOINTS QUE YA TIENES IMPLEMENTADOS

### ChatListScreen
- **getCurrentUserId()** - Obtiene el ID del usuario actual
  - Location: `src/rest/client.ts`
- **getUserConversations(userId)** - Obtiene conversaciones del usuario
  - GET /api/conversations
  - Response incluye: id, type, last_message, last_message_at, unread_count, participants
- **countUnreadMessagesForConversation(conversationId, userId)** - Cuenta mensajes no leídos
  - GET /api/message_reads + GET /api/messages
- **markConversationAsRead(conversationId, userId)** - Marca conversación como leída
  - POST/PATCH /api/message_reads

### ChatScreen
- **getCurrentUserId()** - Obtiene el ID del usuario actual
- **getConversationMessages(conversationId, limit)** - Obtiene mensajes de conversación
  - GET /api/messages
  - Response: [{ id, content, sender_id, created_at, sender: {...} }]
- **sendMessage(conversationId, userId, content)** - Envía mensaje
  - POST /api/messages
- **markMessagesAsRead(conversationId, userId)** - Marca mensajes como leídos
  - POST /rpc/mark_messages_as_read
- **getCurrentUser()** - Obtiene datos completos del usuario actual

### NewMessageScreen
- **getCurrentUserId()** - Obtiene el ID del usuario actual
- **getUserConversations(userId)** - Obtiene conversaciones para mostrar participantes recientes
- **searchUsers(query)** - Busca usuarios por nombre/username
  - GET /api/users con filtros ilike
- **getSuggestedPeople(userId, limit)** - Obtiene personas sugeridas
  - POST /rpc/get_suggested_people_v2
- **startConversationWithUser(currentUserId, targetUserId)** - Inicia conversación
  - POST /rpc/start_conversation_with_user

### CreateCommunityScreen
- **createCommunity(data)** - Crea nueva comunidad
  - POST /api/communities
  - Body: { nombre, descripcion, tipo, icono_url, created_by }
- **joinCommunity(userId, communityId)** - Une usuario a comunidad
  - POST /api/user_communities
- **getSuggestedPeople(userId, limit)** - Obtiene personas para invitar
- **getCurrentUserId()** - Obtiene ID del creador

## ❌ ENDPOINTS NUEVOS QUE NECESITAS CREAR

### Autenticación Social
- **authWithGoogle()** - Login/Registro con Google
  - POST /auth/google
- **authWithFacebook()** - Login/Registro con Facebook
  - POST /auth/facebook
- **authWithLinkedIn()** - Login/Registro con LinkedIn
  - POST /auth/linkedin
- **authWithApple()** - Login/Registro con Apple
  - POST /auth/apple
- **linkSocialAccount(provider, accessToken)** - Vincular cuenta social existente
  - POST /auth/link/{provider}

## 📊 CAMPOS REQUERIDOS EN LOS RESPONSES

### getUserConversations Response:
```typescript
[{
  id: string
  type: "direct" | "community"
  last_message: string
  last_message_at: string
  unread_count: number
  participants: [{
    id: string
    nombre: string
    avatar_url: string
  }]
  community?: {
    id: string
    nombre: string
    icono_url: string
    members_count: number
  }
}]
```

### getConversationMessages Response:
```typescript
[{
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: {
    id: string
    nombre: string
    avatar_url: string
  }
}]
```

### searchUsers Response:
```typescript
[{
  id: string
  nombre: string
  username: string
  avatar_url: string
  bio: string
  is_online?: boolean
}]
```

### getSuggestedPeople Response:
```typescript
[{
  id: string
  nombre: string
  avatar_url: string
  username?: string
  bio?: string
  intereses?: string[]
  mutual_connections?: number
}]
```

### createCommunity Response:
```typescript
{
  id: string
  nombre: string
  descripcion: string
  tipo: "public" | "private" | "restricted"
  icono_url?: string
  created_by: string
  created_at: string
}
```

## 🔧 IMPLEMENTACIÓN EN rest/api.ts

### Endpoints de Chat ya implementados:
```typescript
export async function getUserConversations(userId: string) {
  try {
    const response = await request("GET", "/conversations", {
      params: {
        or: `(participant_one.eq.${userId},participant_two.eq.${userId})`,
        select: "id,type,last_message,updated_at,participant_one:users!participant_one(id,nombre,avatar_url),participant_two:users!participant_two(id,nombre,avatar_url)",
        order: "updated_at.desc"
      }
    })

    return (response || []).map((conv: any) => ({
      ...conv,
      unread_count: conv.unread_count || 0,
      participants: [
        conv.participant_one,
        conv.participant_two
      ].filter(p => p.id !== userId)
    }))
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

export async function getConversationMessages(conversationId: string, limit = 50) {
  try {
    const response = await request("GET", "/messages", {
      params: {
        conversation_id: `eq.${conversationId}`,
        select: "id,content,sender_id,created_at,sender:users!sender_id(id,nombre,avatar_url)",
        order: "created_at.asc",
        limit: String(limit)
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(conversationId: string, userId: string, content: string) {
  try {
    const response = await request("POST", "/messages", {
      body: {
        conversation_id: conversationId,
        sender_id: userId,
        content: content
      }
    })

    // Marcar mensajes como leídos
    await request("POST", "/rpc/mark_messages_as_read", {
      body: {
        p_conversation_id: conversationId,
        p_user_id: userId
      }
    })

    return response
  } catch (error: any) {
    console.error('Error sending message:', error)
    throw error
  }
}
```

### Nuevos Endpoints de Autenticación Social a implementar:
```typescript
// Login/Registro con Google
export async function authWithGoogle(idToken: string) {
  try {
    const response = await request("POST", "/auth/google", {
      body: { id_token: idToken }
    })

    // Guardar tokens en SecureStore
    if (response.access_token) {
      await SecureStore.setItemAsync("access_token", response.access_token)
      await SecureStore.setItemAsync("refresh_token", response.refresh_token)
    }

    return response.user
  } catch (error: any) {
    console.error('Error authenticating with Google:', error)
    throw error
  }
}

// Login/Registro con Facebook
export async function authWithFacebook(accessToken: string) {
  try {
    const response = await request("POST", "/auth/facebook", {
      body: { access_token: accessToken }
    })

    if (response.access_token) {
      await SecureStore.setItemAsync("access_token", response.access_token)
      await SecureStore.setItemAsync("refresh_token", response.refresh_token)
    }

    return response.user
  } catch (error: any) {
    console.error('Error authenticating with Facebook:', error)
    throw error
  }
}

// Login/Registro con LinkedIn
export async function authWithLinkedIn(accessToken: string) {
  try {
    const response = await request("POST", "/auth/linkedin", {
      body: { access_token: accessToken }
    })

    if (response.access_token) {
      await SecureStore.setItemAsync("access_token", response.access_token)
      await SecureStore.setItemAsync("refresh_token", response.refresh_token)
    }

    return response.user
  } catch (error: any) {
    console.error('Error authenticating with LinkedIn:', error)
    throw error
  }
}

// Login/Registro con Apple
export async function authWithApple(identityToken: string, authorizationCode: string) {
  try {
    const response = await request("POST", "/auth/apple", {
      body: {
        identity_token: identityToken,
        authorization_code: authorizationCode
      }
    })

    if (response.access_token) {
      await SecureStore.setItemAsync("access_token", response.access_token)
      await SecureStore.setItemAsync("refresh_token", response.refresh_token)
    }

    return response.user
  } catch (error: any) {
    console.error('Error authenticating with Apple:', error)
    throw error
  }
}

// Vincular cuenta social a usuario existente
export async function linkSocialAccount(provider: 'google' | 'facebook' | 'linkedin' | 'apple', accessToken: string) {
  try {
    const response = await request("POST", `/auth/link/${provider}`, {
      body: { access_token: accessToken }
    })
    return response
  } catch (error: any) {
    console.error(`Error linking ${provider} account:`, error)
    throw error
  }
}
```

## 🔑 IMPLEMENTACIÓN DE AUTENTICACIÓN SOCIAL

### 1. Configuración de Proveedores
```typescript
// En app.config.js o configuración de Expo
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.investiapp.auth"
        }
      ],
      [
        "expo-auth-session",
        {
          "facebookAppId": "TU_FACEBOOK_APP_ID",
          "facebookScheme": "fbTU_FACEBOOK_APP_ID"
        }
      ],
      [
        "expo-auth-session",
        {
          "linkedinClientId": "TU_LINKEDIN_CLIENT_ID"
        }
      ],
      "expo-apple-authentication"
    ]
  }
}
```

### 2. Pantalla de Login con Botones Sociales
```typescript
// LoginScreen.tsx
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Facebook from 'expo-auth-session/providers/facebook'
import * as AuthSession from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'

export function LoginScreen() {
  // Configurar Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'TU_WEB_CLIENT_ID',
      iosClientId: 'TU_IOS_CLIENT_ID',
      offlineAccess: true
    })
  }, [])

  // Configurar Facebook Auth
  const [fbRequest, fbResponse, promptAsyncFB] = Facebook.useAuthRequest({
    clientId: 'TU_FACEBOOK_APP_ID',
  })

  // Configurar LinkedIn Auth
  const [liRequest, liResponse, promptAsyncLI] = AuthSession.useAuthRequest({
    clientId: 'TU_LINKEDIN_CLIENT_ID',
    scopes: ['r_liteprofile', 'r_emailaddress'],
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
  }, {
    authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
  })

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      const tokens = await GoogleSignin.getTokens()

      const user = await authWithGoogle(tokens.idToken)
      // Redirigir al home o onboarding
    } catch (error) {
      console.error('Google sign in error:', error)
    }
  }

  const handleFacebookSignIn = async () => {
    const result = await promptAsyncFB()
    if (result.type === 'success') {
      const user = await authWithFacebook(result.params.access_token)
      // Redirigir al home o onboarding
    }
  }

  const handleLinkedInSignIn = async () => {
    const result = await promptAsyncLI()
    if (result.type === 'success') {
      const user = await authWithLinkedIn(result.params.access_token)
      // Redirigir al home o onboarding
    }
  }

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      const user = await authWithApple(
        credential.identityToken!,
        credential.authorizationCode!
      )
      // Redirigir al home o onboarding
    } catch (error) {
      console.error('Apple sign in error:', error)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGoogleSignIn}>
        <Text>Continuar con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFacebookSignIn}>
        <Text>Continuar con Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLinkedInSignIn}>
        <Text>Continuar con LinkedIn</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAppleSignIn}>
        <Text>Continuar con Apple</Text>
      </TouchableOpacity>
    </View>
  )
}
```

### 3. Backend Endpoints Requeridos
```sql
-- Función para autenticación con Google
CREATE OR REPLACE FUNCTION auth_with_google(id_token text)
RETURNS json AS $$
-- Implementar verificación del token de Google
-- Crear/actualizar usuario
-- Retornar access_token y refresh_token
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para autenticación con Facebook
CREATE OR REPLACE FUNCTION auth_with_facebook(access_token text)
RETURNS json AS $$
-- Implementar verificación del token de Facebook
-- Crear/actualizar usuario
-- Retornar access_token y refresh_token
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para autenticación con LinkedIn
CREATE OR REPLACE FUNCTION auth_with_linkedin(access_token text)
RETURNS json AS $$
-- Implementar verificación del token de LinkedIn
-- Crear/actualizar usuario
-- Retornar access_token y refresh_token
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para autenticación con Apple
CREATE OR REPLACE FUNCTION auth_with_apple(identity_token text, authorization_code text)
RETURNS json AS $$
-- Implementar verificación del token de Apple
-- Crear/actualizar usuario
-- Retornar access_token y refresh_token
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Endpoints de Chat Completados:
- [x] getUserConversations
- [x] getConversationMessages
- [x] sendMessage
- [x] countUnreadMessagesForConversation
- [x] markConversationAsRead
- [x] markMessagesAsRead
- [x] searchUsers
- [x] getSuggestedPeople
- [x] startConversationWithUser
- [x] createCommunity
- [x] joinCommunity

### ❌ Endpoints Nuevos Pendientes:
- [ ] authWithGoogle
- [ ] authWithFacebook
- [ ] authWithLinkedIn
- [ ] authWithApple
- [ ] linkSocialAccount

### 🔧 Configuración Pendiente:
- [ ] Configurar Google Sign-In
- [ ] Configurar Facebook Auth
- [ ] Configurar LinkedIn Auth
- [ ] Configurar Apple Authentication
- [ ] Crear pantalla de login con botones sociales
- [ ] Implementar funciones de backend para auth social
