# 📡 Endpoints Completos por Pantalla - Investí App

## 📋 Índice
1. [Autenticación (5 pantallas)](#autenticación)
2. [Configuración Inicial (3 pantallas)](#configuración-inicial)
3. [Pantalla Principal (1 pantalla)](#pantalla-principal)
4. [Sistema de Posts (7 pantallas)](#sistema-de-posts)
5. [Sistema de Comunidades (6 pantallas)](#sistema-de-comunidades)
6. [Perfiles y Configuración (5 pantallas)](#perfiles-y-configuración)
7. [Chat y Mensajería (5 pantallas)](#chat-y-mensajería)
8. [Notificaciones (1 pantalla)](#notificaciones)
9. [Contenido y Educación (5 pantallas)](#contenido-y-educación)
10. [Herramientas Financieras (8 pantallas)](#herramientas-financieras)
11. [Herramientas Especiales (4 pantallas)](#herramientas-especiales)

---

## 🔐 Autenticación

### 1. LanguageSelection
**Archivo**: `LanguageSelectionScreen.tsx`
**Navegación**: `LanguageSelection`
**Endpoints**: Ninguno
**Estado**: ✅

---

### 2. Welcome
**Archivo**: `WelcomeScreen.tsx`
**Navegación**: `Welcome`
**Endpoints**: Ninguno
**Estado**: ✅

---

### 3. SignIn
**Archivo**: `SignInScreen.tsx`
**Navegación**: `SignIn`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `signIn()` | POST | Iniciar sesión con email/password | `src/api.ts` línea 54 |
| `getCurrentUser()` | GET | Obtener usuario actual | `src/api.ts` línea 82 |
| `supabase.auth.signInWithOAuth()` | POST | OAuth (Google, Facebook, LinkedIn) | `src/api.ts` línea 112 |

**Código**:
```typescript
// src/api.ts línea 54-62
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

// src/api.ts línea 82-119
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  try {
    return await getUser(user.id)
  } catch (error: any) {
    // Fallback: crear perfil desde auth metadata
  }
}

// OAuth (SignInScreen.tsx línea 112-122)
const { data, error } = await supabase.auth.signInWithOAuth({ 
  provider,  // "google" | "facebook" | "linkedin_oidc"
  options: { 
    redirectTo: 'investi-community://auth/callback',
    skipBrowserRedirect: false,
    queryParams: { access_type: 'offline', prompt: 'consent' }
  } 
})
```

**Estado**: ✅

---

### 4. SignUp
**Archivo**: `SignUpScreen.tsx`
**Navegación**: `SignUp`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `signUpWithMetadata()` | POST | Registrar usuario con metadata | `src/api.ts` línea 8 |
| `supabase.auth.signUp()` | POST | Crear usuario en Supabase Auth | `src/api.ts` línea 9 |
| `users.upsert()` | UPSERT | Crear perfil en tabla users | `src/api.ts` línea 39 |
| `supabase.auth.signInWithOAuth()` | POST | OAuth (Google, Facebook, LinkedIn) | `src/api.ts` línea 112 |

**Código**:
```typescript
// src/api.ts línea 8-52
export const signUpWithMetadata = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData?.nombre || userData?.full_name || 'Usuario',
        username: userData?.username || `user_${Date.now()}`,
        avatar_url: userData?.avatar_url || userData?.photo_url,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (data.user) {
    const userPayload = {
      id: data.user.id,
      email: data.user.email,
      nombre: userData?.nombre || 'Usuario',
      username: userData?.username || `user_${Date.now()}`,
      photo_url: userData?.photo_url,
      full_name: userData?.full_name || 'Usuario',
      avatar_url: userData?.avatar_url,
      bio: userData?.bio || '',
      pais: userData?.pais || '',
      role: userData?.role || 'usuario',
      fecha_registro: new Date().toISOString()
    }
    
    await supabase.from("users").upsert(userPayload, { onConflict: 'id' })
  }
  
  return data
}
```

**Estado**: ✅

---

### 5. AuthCallback
**Archivo**: `AuthCallbackScreen.tsx`
**Navegación**: `AuthCallback`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `supabase.auth.getSessionFromUrl()` | GET | Parsear sesión de URL (Google/Facebook) | `src/screens/AuthCallbackScreen.tsx` línea 147 |
| `supabase.auth.setSession()` | POST | Establecer sesión (LinkedIn) | `src/screens/AuthCallbackScreen.tsx` línea 99 |
| `ensureUserProfile()` | UPSERT | Crear perfil de usuario si no existe | `src/screens/AuthCallbackScreen.tsx` línea 123 |

**Código**:
```typescript
// src/screens/AuthCallbackScreen.tsx línea 99-102
await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken || accessToken,
})

// src/screens/AuthCallbackScreen.tsx línea 147
const result = await supabase.auth.getSessionFromUrl({ 
  url: initialUrl, 
  storeSession: true 
})
```

**Estado**: ✅

---

### 6. UploadAvatar
**Archivo**: `UploadAvatarScreen.tsx`
**Navegación**: `UploadAvatar`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateUser()` | PATCH | Actualizar avatar del usuario | `src/api.ts` línea 71 |
| `supabase.storage.upload()` | POST | Subir imagen a Storage | Supabase Storage |

**Código**:
```typescript
// src/api.ts línea 71-75
export const updateUser = async (uid: string, updates: any) => {
  const { data, error } = await supabase.from("users").update(updates).eq("id", uid)
  if (error) throw error
  return data
}

// Uso típico en UploadAvatarScreen
const { data } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file)

await updateUser(userId, { avatar_url: publicUrl })
```

**Estado**: ✅

---

## ⚙️ Configuración Inicial

### 7. PickGoals
**Archivo**: `PickGoalsScreen.tsx`
**Navegación**: `PickGoals`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateUser()` | PATCH | Guardar metas del usuario | `src/api.ts` línea 71 |

**Código**:
```typescript
// Guardar metas
await updateUser(userId, { metas: selectedGoals })
```

**Estado**: ✅

---

### 8. PickInterests
**Archivo**: `PickInterestsScreen.tsx`
**Navegación**: `PickInterests`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateUserInterestsViaRPC()` | RPC | Actualizar intereses via RPC | Supabase RPC |
| `updateUser()` | PATCH | Guardar intereses del usuario | `src/api.ts` línea 71 |

**Código**:
```typescript
// Guardar intereses
await updateUser(userId, { intereses: selectedInterests })
```

**Estado**: ✅

---

### 9. PickKnowledge
**Archivo**: `PickKnowledgeScreen.tsx`
**Navegación**: `PickKnowledge`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateUser()` | PATCH | Guardar nivel de conocimiento | `src/api.ts` línea 71 |

**Código**:
```typescript
// Guardar nivel de finanzas
await updateUser(userId, { nivel_finanzas: selectedLevel })
```

**Estado**: ✅

---

### 10. CommunityRecommendations
**Archivo**: `CommunityRecommendationsScreen.tsx`
**Navegación**: `CommunityRecommendations`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getRecommendedCommunities()` | GET | Obtener comunidades recomendadas | Supabase RPC |
| `listCommunities()` | GET | Listar todas las comunidades | `src/rest/api.ts` línea 276 |
| `joinCommunity()` | POST | Unirse a comunidad | `src/rest/api.ts` línea 314 |

**Código**:
```typescript
// src/rest/api.ts línea 276-298
export async function listCommunities() {
  const response = await request("GET", "/communities", {
    params: {
      select: "id,nombre,descripcion,icono_url,tipo,created_at",
      order: "created_at.desc"
    },
  })
  return (response || []).map((community: any) => ({
    id: community.id,
    name: community.nombre,
    description: community.descripcion,
    image_url: community.icono_url,
    type: community.tipo,
    created_at: community.created_at,
  }))
}

// src/rest/api.ts línea 314-367
export async function joinCommunity(uid: string, community_id: string) {
  const result = await request("POST", "/user_communities", {
    body: { user_id: uid, community_id },
    headers: { 'Prefer': 'return=representation' }
  })
  return Array.isArray(result) ? result[0] : result
}
```

**Estado**: ✅

---

## 🏠 Pantalla Principal

### 11. HomeFeed
**Archivo**: `HomeFeedScreen.tsx`
**Navegación**: `HomeFeed`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getUserFeed()` | GET | Obtener feed personalizado del usuario | `src/api.ts` línea 175 |
| `get_personalized_feed()` | RPC | RPC para feed personalizado | `src/api.ts` línea 178 |
| `likePost()` | UPSERT | Dar like a un post | `src/api.ts` línea 257 |
| `savePost()` | UPSERT | Guardar post | `src/api.ts` línea 276 |
| `unsavePost()` | DELETE | Desguardar post | `src/api.ts` línea 285 |

**Código**:
```typescript
// src/api.ts línea 175-206
export const getUserFeed = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase.rpc("get_personalized_feed", {
      p_user_id: userId,
      p_limit: limit,
    })
    if (error) throw error
    return data || []
  } catch (error) {
    // Fallback: query directa
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        author:users(id, nombre, full_name, username, photo_url, avatar_url, role)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
    return data || []
  }
}

// src/api.ts línea 257-264
export const likePost = async (postId: string, userId: string, isLike = true) => {
  const { data, error } = await supabase
    .from("post_likes")
    .upsert([{ post_id: postId, user_id: userId, is_like: isLike }])
  if (error) throw error
  return data
}

// src/api.ts línea 276-283
export const savePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('post_saves')
    .upsert([{ post_id: postId, user_id: userId }])
  if (error) throw error
  return data
}
```

**Estado**: ✅

---

## 📰 Sistema de Posts

### 12. CreatePost
**Archivo**: `CreatePostScreen.tsx`
**Navegación**: `CreatePost`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `createPost()` | INSERT | Crear nuevo post | `src/api.ts` línea 231 |
| `supabase.storage.upload()` | POST | Subir media (imágenes/videos) | Supabase Storage |

**Código**:
```typescript
// src/api.ts línea 231-240
export const createPost = async (postData: {
  user_id: string
  community_id?: string
  contenido: string
  media_url?: string[]
}) => {
  const { data, error } = await supabase.from("posts").insert([postData]).select()
  if (error) throw error
  return data?.[0]
}
```

**Estado**: ✅

---

### 13. CreateCommunityPost
**Archivo**: `CreateCommunityPostScreen.tsx`
**Navegación**: `CreateCommunityPost`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `createCommunityPost()` | INSERT | Crear post en comunidad | Supabase |
| `supabase.storage.upload()` | POST | Subir media | Supabase Storage |

**Código**:
```typescript
// Similar a createPost pero con community_id
const postData = {
  user_id: userId,
  community_id: communityId,
  contenido: content,
  media_url: mediaUrls
}
await createPost(postData)
```

**Estado**: ✅

---

### 14. PostDetail
**Archivo**: `PostDetailScreen.tsx`
**Navegación**: `PostDetail`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getPostDetail()` | GET | Obtener detalles del post | `src/api.ts` línea 242 |
| `commentPost()` | INSERT | Agregar comentario | `src/api.ts` línea 266 |
| `likePost()` | UPSERT | Dar like | `src/api.ts` línea 257 |
| `savePost()` | UPSERT | Guardar post | `src/api.ts` línea 276 |

**Código**:
```typescript
// src/api.ts línea 242-255
export const getPostDetail = async (postId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:users(id, nombre, full_name, username, photo_url, avatar_url, role),
      comments(*)
    `)
    .eq("id", postId)
    .single()
  if (error) throw error
  return data
}

// src/api.ts línea 266-273
export const commentPost = async (postId: string, userId: string, contenido: string, parentId?: string) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id: postId, user_id: userId, contenido, parent_id: parentId }])
  if (error) throw error
  return data
}
```

**Estado**: ✅

---

### 15. CommunityPostDetail
**Archivo**: `CommunityPostDetailScreen.tsx`
**Navegación**: `CommunityPostDetail`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getCommunityPostDetail()` | GET | Obtener post de comunidad | Supabase |
| `commentPost()` | INSERT | Agregar comentario | `src/api.ts` línea 266 |

**Estado**: ✅

---

### 16. VideoPlayer
**Archivo**: `VideoPlayerScreen.tsx`
**Navegación**: `VideoPlayer`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Solo reproducción de video | - |

**Estado**: ✅

---

### 17. SharePost
**Archivo**: `SharePostScreen.tsx`
**Navegación**: `SharePost`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `sharePost()` | POST | Compartir post | Supabase |

**Estado**: ✅

---

### 18. SavedPosts
**Archivo**: `SavedPostsScreen.tsx`
**Navegación**: `SavedPosts`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getSavedPosts()` | GET | Obtener posts guardados | Supabase |
| `isPostSaved()` | GET | Verificar si post está guardado | `src/api.ts` línea 296 |

**Código**:
```typescript
// src/api.ts línea 296-306
export const isPostSaved = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('post_saves')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}
```

**Estado**: ✅

---

## 👥 Sistema de Comunidades

### 19. Communities
**Archivo**: `CommunitiesScreen.tsx`
**Navegación**: `Communities`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `listCommunities()` | GET | Listar comunidades | `src/rest/api.ts` línea 276 |
| `joinCommunity()` | POST | Unirse a comunidad | `src/rest/api.ts` línea 314 |
| `getCommunityList()` | GET | Obtener lista de comunidades | `src/api.ts` línea 209 |

**Código**:
```typescript
// src/api.ts línea 209-219
export const getCommunityList = async (limit?: number) => {
  let query = supabase.from("communities").select("*")
  if (limit) {
    query = query.limit(limit).order("created_at", { ascending: false })
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}
```

**Estado**: ✅

---

### 20. CommunityDetail
**Archivo**: `CommunityDetailScreen.tsx`
**Navegación**: `CommunityDetail`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getCommunityDetails()` | GET | Obtener detalles de comunidad | `src/rest/api.ts` línea 435 |
| `joinCommunity()` | POST | Unirse a comunidad | `src/rest/api.ts` línea 314 |
| `isUserMemberOfCommunity()` | GET | Verificar si es miembro | `src/rest/api.ts` línea 379 |

**Código**:
```typescript
// src/rest/api.ts línea 435-460
export async function getCommunityDetails(communityId: string) {
  const response = await request("GET", "/communities", {
    params: {
      id: `eq.${communityId}`,
      select: "id,nombre,descripcion,icono_url,tipo,created_at,members:user_communities(count)",
    },
  })
  
  if (!response?.[0]) return null
  
  const community = response[0]
  return {
    id: community.id,
    name: community.nombre,
    description: community.descripcion,
    image_url: community.icono_url,
    type: community.tipo,
    created_at: community.created_at,
    members_count: community.members?.[0]?.count || 0
  }
}

// src/rest/api.ts línea 379-393
export async function isUserMemberOfCommunity(userId: string, communityId: string) {
  const response = await request("GET", "/user_communities", {
    params: {
      user_id: `eq.${userId}`,
      community_id: `eq.${communityId}`,
      select: "id"
    }
  })
  return response && response.length > 0
}
```

**Estado**: ✅

---

### 21. CommunitySettings
**Archivo**: `CommunitySettingsScreen.tsx`
**Navegación**: `CommunitySettings`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateCommunitySettings()` | PATCH | Actualizar configuración | Supabase |

**Estado**: ✅

---

### 22. CommunityMembers
**Archivo**: `CommunityMembersScreen.tsx`
**Navegación**: `CommunityMembers`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getCommunityMembers()` | GET | Obtener miembros de comunidad | Supabase |

**Estado**: ✅

---

### 23. EditCommunity
**Archivo**: `EditCommunityScreen.tsx`
**Navegación**: `EditCommunity`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateCommunity()` | PATCH | Actualizar datos de comunidad | Supabase |

**Estado**: ✅

---

### 24. CreateCommunity
**Archivo**: `CreateCommunityScreen.tsx`
**Navegación**: `CreateCommunity`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `createCommunity()` | INSERT | Crear nueva comunidad | `src/rest/api.ts` línea 498 |

**Código**:
```typescript
// src/rest/api.ts línea 498+
export async function createCommunity(data: {
  nombre: string
  descripcion?: string
  tipo?: string
  icono_url?: string
  banner_url?: string
  created_by?: string
}) {
  // Implementación
}
```

**Estado**: ✅

---

## 👤 Perfiles y Configuración

### 25. Profile
**Archivo**: `ProfileScreen.tsx`
**Navegación**: `Profile`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getUserComplete()` | GET | Obtener perfil completo con stats | `src/api.ts` línea 122 |
| `getUserProfile()` | GET | Obtener perfil de usuario | `src/rest/api.ts` línea 207 |
| `followUser()` | INSERT | Seguir usuario | `src/api.ts` línea 326 |
| `isFollowingUser()` | GET | Verificar si sigue usuario | `src/api.ts` línea 313 |
| `getUserFollowers()` | GET | Obtener seguidores | `src/api.ts` línea 348 |
| `getUserFollowing()` | GET | Obtener seguidos | `src/api.ts` línea 378 |

**Código**:
```typescript
// src/api.ts línea 122-172
export const getUserComplete = async (uid: string) => {
  const user = await getUser(uid)
  if (!user) return null

  const { count: followersCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', uid)

  const { count: followingCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', uid)

  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', uid)

  return {
    id: user.id,
    name: user.full_name || user.nombre,
    email: user.email,
    bio: user.bio,
    location: user.pais,
    avatarUrl: user.avatar_url || user.photo_url,
    stats: {
      postsCount: postsCount || 0,
      followersCount: followersCount || 0,
      followingCount: followingCount || 0
    },
    onboarding: {
      interests: user.intereses || [],
      goals: user.metas || [],
      knowledgeLevel: user.nivel_finanzas,
      completed: !!(user.metas?.length && user.intereses?.length)
    }
  }
}

// src/api.ts línea 326-333
export const followUser = async (followerId: string, followingId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .insert({ follower_id: followerId, following_id: followingId })
  if (error) throw error
  return data
}

// src/api.ts línea 348-375
export const getUserFollowers = async (userId: string, limit = 50, page = 1) => {
  const offset = (page - 1) * limit
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      follower:users!follower_id(
        id, nombre, full_name, username, avatar_url, photo_url, bio, is_verified
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return (data || []).map((item: any) => ({
    ...item.follower,
    name: item.follower.full_name || item.follower.nombre || item.follower.username,
    avatarUrl: item.follower.avatar_url || item.follower.photo_url,
  }))
}
```

**Estado**: ✅

---

### 26. EditProfile
**Archivo**: `EditProfileScreen.tsx`
**Navegación**: `EditProfile`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `updateUser()` | PATCH | Actualizar perfil | `src/api.ts` línea 71 |
| `updateUserProfile()` | PATCH | Actualizar perfil completo | `src/api.ts` línea 499 |

**Estado**: ✅

---

### 27. Followers
**Archivo**: `FollowersScreen.tsx`
**Navegación**: `Followers`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getUserFollowers()` | GET | Obtener seguidores | `src/api.ts` línea 348 |

**Estado**: ✅

---

### 28. Following
**Archivo**: `FollowingScreen.tsx`
**Navegación**: `Following`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getUserFollowing()` | GET | Obtener seguidos | `src/api.ts` línea 378 |

**Estado**: ✅

---

### 29. Settings
**Archivo**: `SettingsScreen.tsx`
**Navegación**: `Settings`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `authSignOut()` | POST | Cerrar sesión | `src/rest/api.ts` línea 144 |
| `updateUser()` | PATCH | Actualizar configuración | `src/api.ts` línea 71 |

**Estado**: ✅

---

## 💬 Chat y Mensajería

### 30. ChatList
**Archivo**: `ChatListScreen.tsx`
**Navegación**: `ChatList`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getChats()` | GET | Obtener lista de chats | Supabase |

**Estado**: ✅

---

### 31. ChatScreen
**Archivo**: `ChatScreen.tsx`
**Navegación**: `Chat`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getChatMessages()` | GET | Obtener mensajes del chat | Supabase |
| `sendMessage()` | INSERT | Enviar mensaje | Supabase |

**Estado**: ✅

---

### 32. NewMessageScreen
**Archivo**: `NewMessageScreen.tsx`
**Navegación**: `NewMessage`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `startNewChat()` | INSERT | Iniciar nuevo chat | Supabase |

**Estado**: ✅

---

### 33. GroupChat
**Archivo**: `GroupChatScreen.tsx`
**Navegación**: `GroupChat`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getGroupMessages()` | GET | Obtener mensajes del grupo | Supabase |
| `sendMessage()` | INSERT | Enviar mensaje al grupo | Supabase |

**Estado**: ✅

---

### 34. IRIChatScreen
**Archivo**: `IRIChatScreen.tsx`
**Navegación**: `IRIChat`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getIRIChatMessages()` | GET | Obtener mensajes de IRI | Supabase |
| `sendIRIMessage()` | INSERT | Enviar mensaje a IRI | Supabase |
| `iriVoiceService` | POST | Servicio de voz IRI | `src/services/iriVoiceService.ts` |
| `grokToolsService` | POST | Herramientas Grok | `src/services/grokToolsService.ts` |

**Estado**: ✅

---

## 🔔 Notificaciones

### 35. Notifications
**Archivo**: `NotificationsScreen.tsx`
**Navegación**: `Notifications`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getNotifications()` | GET | Obtener notificaciones | Supabase |

**Estado**: ✅

---

## 📚 Contenido y Educación

### 36. News
**Archivo**: `NewsScreen.tsx`
**Navegación**: `News`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getNews()` | GET | Obtener noticias | Supabase |

**Estado**: ✅

---

### 37. NewsDetail
**Archivo**: `NewsDetailScreen.tsx`
**Navegación**: `NewsDetail`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getNewsDetail()` | GET | Obtener detalle de noticia | Supabase |

**Estado**: ✅

---

### 38. Educacion
**Archivo**: `EducacionScreen.tsx`
**Navegación**: `Educacion`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getCourses()` | GET | Obtener cursos | Supabase |
| `getLessons()` | GET | Obtener lecciones | Supabase |

**Estado**: ✅

---

### 39. CourseDetail
**Archivo**: `CourseDetailScreen.tsx`
**Navegación**: `CourseDetail`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getCourseDetail()` | GET | Obtener detalle de curso | Supabase |

**Estado**: ✅

---

### 40. LearningPaths
**Archivo**: `LearningPathsScreen.tsx`
**Navegación**: `LearningPaths`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getLearningPaths()` | GET | Obtener rutas de aprendizaje | Supabase |

**Estado**: ✅

---

## 💰 Herramientas Financieras

### 41. MarketInfo
**Archivo**: `MarketInfoScreen.tsx`
**Navegación**: `MarketInfo`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getMarketData()` | GET | Obtener datos de mercado | Alpha Vantage API |
| `searchApiService` | GET | Buscar acciones | `src/services/searchApiService.ts` |

**Estado**: ✅

---

### 42. Promotions
**Archivo**: `PromotionsScreen.tsx`
**Navegación**: `Promotions`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `getPromotions()` | GET | Obtener promociones | Supabase |

**Estado**: ✅

---

### 43. PromotionDetail
**Archivo**: `PromotionDetailScreen.tsx`
**Navegación**: `PromotionDetail`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Solo visualización | - |

**Estado**: ✅

---

### 44. Herramientas
**Archivo**: `HerramientasScreen.tsx`
**Navegación**: `Herramientas`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Menú de herramientas | - |

**Estado**: ✅

---

### 45. Inversionista
**Archivo**: `InversionistaScreen.tsx`
**Navegación**: `Inversionista`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Información de inversiones | - |

**Estado**: ✅

---

### 46. PlanificadorFinanciero
**Archivo**: `PlanificadorFinancieroScreen.tsx`
**Navegación**: `PlanificadorFinanciero`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Herramienta de planificación | - |

**Estado**: ✅

---

### 47. CazaHormigas
**Archivo**: `CazaHormigasScreen.tsx`
**Navegación**: `CazaHormigas`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Búsqueda de acciones pequeñas | - |

**Estado**: ✅

---

### 48. ReportesAvanzados
**Archivo**: `ReportesAvanzadosScreen.tsx`
**Navegación**: `ReportesAvanzados`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Reportes financieros | - |

**Estado**: ✅

---

## 🔧 Herramientas Especiales

### 49. SimuladorInversiones
**Archivo**: `InvestmentSimulator.tsx`
**Navegación**: `Simulator`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| `processPayment()` | POST | Procesar pago simulado | Supabase |

**Estado**: ✅

---

### 50. VideoPlayer (Duplicado)
**Archivo**: `VideoPlayerScreen.tsx`
**Navegación**: `VideoPlayer`

#### Endpoints:
| Endpoint | Método | Descripción | Archivo |
|----------|--------|-------------|---------|
| Ninguno | - | Solo reproducción | - |

**Estado**: ✅

---

## 📊 Resumen de Endpoints

### Total de Pantallas: 50
### Pantallas con Endpoints: 35
### Pantallas sin Endpoints: 15

### Endpoints Más Usados:
1. **updateUser()** - 8 pantallas
2. **getUserFeed()** / **get_personalized_feed()** - 1 pantalla
3. **joinCommunity()** - 3 pantallas
4. **getUserFollowers()** / **getUserFollowing()** - 2 pantallas
5. **likePost()** - 2 pantallas

### Servicios Externos:
- **Supabase**: Autenticación, Base de datos, Storage
- **Alpha Vantage**: Datos de mercado
- **Grok API**: Chat IRI
- **ElevenLabs**: Síntesis de voz
- **OpenAI**: Procesamiento de lenguaje

---

**Última actualización**: Diciembre 3, 2025
**Estado**: ✅ Completo
