# Corrección ProfileScreen - Error "fetching complete user profile"

## Fecha: 2025-10-02

## Problema Identificado

La pantalla de Profile mostraba el error: **"error fetching complete user profile"** tanto para el perfil propio como para el perfil de otros usuarios.

## Causa Raíz

1. **Error en la llamada RPC**: La función `getUserComplete` en `api.ts` estaba usando `GET` para llamar a `/rpc/get_user_stats`, cuando las funciones RPC en Supabase requieren el método `POST`.

   ```typescript
   // ❌ INCORRECTO
   request("GET", "/rpc/get_user_stats", {
     body: { user_id: userId }
   })
   ```

2. **Falta de manejo de errores granular**: Si cualquier parte del `Promise.all` fallaba, toda la función fallaba sin información específica.

3. **Falta de logs detallados**: No había suficiente información para diagnosticar dónde ocurría el error.

## Soluciones Implementadas

### 1. Corrección en `src/rest/api.ts` - Función `getUserComplete`

#### Cambios principales:

- ✅ **Cambio de GET a POST** para la llamada RPC de `get_user_stats`
- ✅ **Manejo de errores individual** para cada request (user, stats, posts, communities)
- ✅ **Logs detallados** en cada paso del proceso
- ✅ **Valores por defecto** si alguna parte falla (no bloquea toda la carga)
- ✅ **Mapeo correcto de comunidades** con todos los campos necesarios

#### Código actualizado:

```typescript
export async function getUserComplete(userId: string) {
  try {
    console.log('[getUserComplete] Fetching profile for userId:', userId)
    
    // Fetch user data with individual error handling
    let userResponse, statsResponse, postsResponse, communitiesResponse
    
    // 1. Fetch user (crítico - si falla, se lanza error)
    try {
      userResponse = await request("GET", "/users", {
        params: {
          id: `eq.${userId}`,
          select: "id,nombre,bio,location,avatar_url,banner_url,is_verified,created_at"
        }
      })
      console.log('[getUserComplete] User data fetched:', userResponse?.[0]?.nombre)
    } catch (error: any) {
      console.error('[getUserComplete] Error fetching user:', error)
      throw error
    }
    
    const user = userResponse?.[0]
    if (!user) {
      console.error('[getUserComplete] User not found for ID:', userId)
      return null
    }
    
    // 2. Fetch stats with RPC (POST method) - no crítico
    try {
      statsResponse = await request("POST", "/rpc/get_user_stats", {
        body: { user_id: userId }
      })
      console.log('[getUserComplete] Stats fetched:', statsResponse)
    } catch (error: any) {
      console.error('[getUserComplete] Error fetching stats, using defaults:', error)
      statsResponse = { followers_count: 0, following_count: 0, posts_count: 0 }
    }
    
    // 3. Fetch posts - no crítico
    try {
      postsResponse = await request("GET", "/posts", {
        params: {
          user_id: `eq.${userId}`,
          select: "id,contenido,created_at,likes_count,comment_count,user:users!posts_user_id_fkey(id,nombre,avatar_url)",
          order: "created_at.desc",
          limit: "10"
        }
      })
      console.log('[getUserComplete] Posts fetched:', postsResponse?.length || 0)
    } catch (error: any) {
      console.error('[getUserComplete] Error fetching posts:', error)
      postsResponse = []
    }
    
    // 4. Fetch communities - no crítico
    try {
      communitiesResponse = await request("GET", "/user_communities", {
        params: {
          user_id: `eq.${userId}`,
          status: `eq.active`,
          select: "role,status,joined_at,community:communities(id,nombre,name,descripcion,avatar_url,icono_url,image_url,member_count,type,category,is_verified)",
          order: "joined_at.desc",
          limit: "20"
        }
      })
      console.log('[getUserComplete] Communities fetched:', communitiesResponse?.length || 0)
    } catch (error: any) {
      console.error('[getUserComplete] Error fetching communities:', error)
      communitiesResponse = []
    }
    
    // Construir resultado con todos los datos disponibles
    const result = {
      id: user.id,
      name: user.nombre,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatar_url,
      bannerUrl: user.banner_url,
      isVerified: user.is_verified,
      stats: {
        postsCount: statsResponse?.posts_count || postsResponse?.length || 0,
        followersCount: statsResponse?.followers_count || 0,
        followingCount: statsResponse?.following_count || 0
      },
      posts: postsResponse || [],
      communities: communitiesResponse?.map((uc: any) => ({
        id: uc.community?.id,
        name: uc.community?.nombre || uc.community?.name,
        imageUrl: uc.community?.avatar_url || uc.community?.icono_url || uc.community?.image_url,
        memberCount: uc.community?.member_count || 0,
        isMember: true
      })) || []
    }
    
    console.log('[getUserComplete] Profile complete:', result.name, 'with', result.posts.length, 'posts')
    return result
  } catch (error: any) {
    console.error('[getUserComplete] Critical error fetching complete user profile:', error)
    console.error('[getUserComplete] Error details:', JSON.stringify(error, null, 2))
    return null
  }
}
```

### 2. Mejoras en `src/screens/ProfileScreen.tsx` - Función `loadProfile`

#### Cambios principales:

- ✅ **Logs detallados** en cada paso
- ✅ **Manejo de errores específico** para saved posts y recommended communities
- ✅ **Mensajes de error más descriptivos** para el usuario
- ✅ **No bloquear la carga** si fallan datos secundarios

#### Código actualizado:

```typescript
const loadProfile = async () => {
  try {
    setIsLoading(true)
    console.log('[ProfileScreen] Starting loadProfile...')
    
    const currentUserId = await getCurrentUserId()
    console.log('[ProfileScreen] Current user ID:', currentUserId)
    
    const userId = targetUserId || currentUserId
    console.log('[ProfileScreen] Target user ID:', userId)

    if (!userId) {
      console.error("[ProfileScreen] No user ID available")
      Alert.alert("Error", "No se pudo identificar el usuario")
      return
    }

    const userData = await getUserComplete(userId)
    console.log('[ProfileScreen] User data received:', userData ? 'Success' : 'Failed')
    
    if (userData) {
      setProfileUser(userData)
      setIsOwnProfile(userId === currentUserId)
      setFeed(userData.posts || [])
      console.log('[ProfileScreen] Profile set with', userData.posts?.length || 0, 'posts')

      if (userId === currentUserId) {
        console.log('[ProfileScreen] Loading own profile data...')
        try {
          const [saved, recommended] = await Promise.all([
            getSavedPosts(userId),
            getRecommendedCommunities(userId)
          ])
          setSavedPosts(saved || [])
          setRecommendedCommunities(recommended || [])
          console.log('[ProfileScreen] Saved posts:', saved?.length || 0, 'Recommended:', recommended?.length || 0)
        } catch (error) {
          console.error('[ProfileScreen] Error loading saved/recommended:', error)
          // No bloqueamos la carga del perfil por esto
          setSavedPosts([])
          setRecommendedCommunities([])
        }
      } else {
        console.log('[ProfileScreen] Loading other user profile, communities:', userData.communities?.length || 0)
        setRecommendedCommunities(userData.communities || [])
      }
    } else {
      console.error('[ProfileScreen] getUserComplete returned null')
      Alert.alert("Error", "No se pudo cargar el perfil del usuario")
    }
  } catch (error: any) {
    console.error("[ProfileScreen] Error loading profile:", error)
    console.error("[ProfileScreen] Error details:", JSON.stringify(error, null, 2))
    Alert.alert(
      "Error", 
      error?.message || "No se pudo cargar el perfil. Por favor, intenta de nuevo."
    )
  } finally {
    setIsLoading(false)
    setRefreshing(false)
    console.log('[ProfileScreen] loadProfile finished')
  }
}
```

## Beneficios de los Cambios

### 1. **Resiliencia**
- Si falla la carga de stats, posts o communities, el perfil básico se muestra igual
- Solo falla completamente si no se encuentra el usuario

### 2. **Debugging**
- Logs detallados en cada paso permiten identificar exactamente dónde ocurre un problema
- Los errores incluyen información completa del problema

### 3. **Experiencia de Usuario**
- Mensajes de error más claros y específicos
- El perfil se carga parcialmente incluso si algunos datos fallan
- Función de refresh para reintentar

### 4. **Mantenibilidad**
- Código más legible con manejo de errores explícito
- Fácil identificar qué parte está fallando
- Valores por defecto claros

## Casos de Uso Soportados

### ✅ Caso 1: Mi Propio Perfil
- Carga datos del usuario actual
- Muestra posts propios
- Muestra posts guardados
- Muestra comunidades recomendadas

### ✅ Caso 2: Perfil de Otro Usuario
- Carga datos del usuario especificado
- Muestra posts del usuario
- Muestra comunidades del usuario
- Permite seguir/dejar de seguir
- Permite enviar mensaje

## Verificación

Para verificar que funciona correctamente, revisa los logs en la consola:

```
[ProfileScreen] Starting loadProfile...
[ProfileScreen] Current user ID: <uuid>
[ProfileScreen] Target user ID: <uuid>
[getUserComplete] Fetching profile for userId: <uuid>
[getUserComplete] User data fetched: <nombre>
[getUserComplete] Stats fetched: { followers_count: X, following_count: Y, posts_count: Z }
[getUserComplete] Posts fetched: X
[getUserComplete] Communities fetched: Y
[getUserComplete] Profile complete: <nombre> with X posts
[ProfileScreen] User data received: Success
[ProfileScreen] Profile set with X posts
[ProfileScreen] loadProfile finished
```

## Próximos Pasos Recomendados

1. **Verificar función RPC en base de datos**: Asegurarse de que `get_user_stats` existe y funciona correctamente
2. **Agregar caché**: Considerar cachear los datos del perfil para mejorar performance
3. **Optimizar queries**: Revisar si se pueden combinar algunas queries para reducir latencia
4. **Testing**: Agregar tests unitarios para `getUserComplete` y `loadProfile`

## Archivos Modificados

- ✅ `src/rest/api.ts` - Función `getUserComplete`
- ✅ `src/screens/ProfileScreen.tsx` - Función `loadProfile` y `onRefresh`
