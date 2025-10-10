/**
 * ============================================================================
 * API.TS - CAPA DE ACCESO A DATOS
 * ============================================================================
 * 
 * Este archivo centraliza TODAS las llamadas a la API de Supabase.
 * 
 * ⚠️ IMPORTANTE - RELACIONES MÚLTIPLES EN SUPABASE:
 * ============================================================================
 * Supabase usa PostgREST que tiene reglas estrictas para relaciones.
 * 
 * PROBLEMA COMÚN: Error PGRST201
 * - Ocurre cuando hay múltiples foreign keys entre dos tablas
 * - Ejemplo: tabla 'posts' tiene 2 FKs hacia 'users':
 *   1. posts_user_id_fkey (autor del post)
 *   2. posts_pinned_by_fkey (usuario que fijó el post)
 * 
 * SOLUCIÓN:
 * - Especificar EXPLÍCITAMENTE qué foreign key usar
 * - Formato: tabla!nombre_del_foreign_key(campos)
 * - Ejemplo: users!posts_user_id_fkey(nombre,avatar_url)
 * 
 * ALTERNATIVA:
 * - Hacer queries separadas (posts sin users, luego users por IDs)
 * - Mapear manualmente los datos
 * - Ver getUserFeed() como ejemplo
 * 
 * ============================================================================
 * CONVENCIONES DE CÓDIGO:
 * ============================================================================
 * - Todas las funciones son async
 * - Retornan null en caso de error no crítico
 * - Lanzan error en casos críticos
 * - Mapean nombres de columnas español → inglés cuando es necesario
 * - Cada función documenta DÓNDE se usa
 * 
 * ============================================================================
 * HISTORIAL DE CAMBIOS CRÍTICOS:
 * ============================================================================
 * 2025-10-02:
 * - getCommunityPosts(): Agregado users!posts_user_id_fkey para evitar PGRST201
 * - getUserFeed(): Implementada estrategia de queries separadas
 * - Documentación exhaustiva agregada a todas las funciones
 * 
 * ⚠️ ANTES DE MODIFICAR:
 * - Lee los comentarios de la función
 * - Verifica si usa relaciones múltiples
 * - Prueba en TODAS las pantallas que la usan
 * - Actualiza la documentación
 * 
 * ÚLTIMA ACTUALIZACIÓN: 2025-10-02
 * ============================================================================
 */

import {  
  request,  
  authSignIn as clientSignIn,  
  authSignUp as clientSignUp,  
  authSignOut as clientSignOut,  
  urls,  
} from "./client"  
import * as SecureStore from "expo-secure-store"
import { supabase } from "../supabase"  
  
/**
 * ANON_KEY: Clave pública de Supabase para autenticación
 * Se usa para operaciones de storage y autenticación
 */
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o"  
  
// ============================================================================
// INTERFACES - TIPOS DE DATOS
// ============================================================================  
export interface Promotion {  
  id: string  
  title: string  
  description: string  
  image_url: string  
  discount: string  
  valid_until: string  
  location: string  
  terms: string  
  category: string  
  created_at: string  
  updated_at: string  
}  
  
export interface Course {  
  id: string  
  title: string  
  description: string  
  duration: string  
  level: string  
  lessons: number  
  progress: number  
  image_url: string  
  created_at: string  
  updated_at: string  
}  
  
export interface Article {  
  id: string  
  title: string  
  content: string  
  read_time: string  
  category: string  
  image_url: string  
  created_at: string  
  updated_at: string  
}  
  
export interface EducationalContent {  
  id: string  
  title: string  
  description: string  
  content_type: 'video' | 'article' | 'course'  
  duration?: string  
  level?: string  
  image_url: string  
  created_at: string  
  updated_at: string  
}  
  
export interface News {  
  id: string  
  title: string  
  content: string  
  excerpt?: string  
  image_url?: string  
  author_id: string  
  category: string  
  published_at: string  
  created_at: string  
}  
  
// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Re-exportación de funciones de autenticación del cliente
 * Estas funciones manejan login, registro y logout
 */
export const authSignIn = clientSignIn  
export const authSignUp = clientSignUp  
export const authSignOut = clientSignOut  
  
// ============================================================================
// USUARIOS
// ============================================================================

/**
 * Obtiene los datos del usuario actual por su ID
 * 
 * @param uid - ID del usuario
 * @returns Objeto con datos del usuario o null si no existe
 * 
 * USADO EN:
 * - ProfileScreen
 * - HomeScreen
 * - Cualquier pantalla que necesite datos del usuario actual
 */
export async function getMe(uid: string) {  
  try {  
    const response = await request("GET", "/users", {  
      params: { select: "*", id: `eq.${uid}` },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    if (error.code === "42P01") return null // Tabla no existe  
    throw error  
  }  
}  
  
/**
 * Actualiza los datos de un usuario
 * 
 * @param uid - ID del usuario a actualizar
 * @param data - Objeto con los campos a actualizar
 * @returns Usuario actualizado o null
 * 
 * USADO EN:
 * - ProfileEditScreen
 * - SettingsScreen
 */
export async function updateUser(uid: string, data: any) {  
  try {  
    return await request("PATCH", "/users", {  
      params: { id: `eq.${uid}` },  
      body: data,  
      headers: { Prefer: "return=representation" },  
    })  
  } catch (error: any) {  
    if (error.code === "42P01") return null  
    throw error  
  }  
}  
  
/**
 * Obtiene el perfil completo de un usuario con estadísticas
 * Incluye: posts count, followers count, following count
 * 
 * @param userId - ID del usuario
 * @returns Perfil del usuario con estadísticas o null
 * 
 * USADO EN:
 * - UserProfileScreen
 * - Cuando se hace clic en un usuario
 */
export async function getUserProfile(userId: string) {  
  try {  
    // Paso 1: Obtener datos básicos del usuario
    const response = await request("GET", "/users", {  
      params: {  
        id: `eq.${userId}`,  
        select: "*"  
      },  
    })
    
    if (!response || response.length === 0) return null
    
    const user = response[0]
    
    // Paso 2: Contar posts del usuario (especificando FK correcto)
    const postsResponse = await request("GET", "/posts", {
      params: {
        user_id: `eq.${userId}`,
        select: "id"
      }
    })
    
    // Paso 3: Contar followers
    const followersResponse = await request("GET", "/user_followers", {
      params: {
        following_id: `eq.${userId}`,
        select: "follower_id"
      }
    })
    
    // Paso 4: Contar following
    const followingResponse = await request("GET", "/user_followers", {
      params: {
        follower_id: `eq.${userId}`,
        select: "following_id"
      }
    })
    
    return {
      ...user,
      posts: postsResponse?.length || 0,
      followers: followersResponse?.length || 0,
      following: followingResponse?.length || 0
    }
  } catch (error: any) {  
    console.error('Error fetching user profile:', error)  
    return null  
  }  
}  
  
// ============================================================================
// COMUNIDADES
// ============================================================================

/**
 * Lista todas las comunidades disponibles
 * 
 * @returns Array de comunidades con datos básicos
 * 
 * MAPEO DE CAMPOS:
 * - nombre → name
 * - descripcion → description
 * - icono_url → image_url
 * - tipo → type
 * 
 * USADO EN:
 * - CommunitiesScreen
 * - HomeScreen (sección de comunidades)
 */
export async function listCommunities() {  
  try {  
    const response = await request("GET", "/communities", {  
      params: {   
        select: "id,nombre,descripcion,icono_url,tipo,created_at",   
        order: "created_at.desc"   
      },  
    })  
    // Mapear los nombres de columna españoles a ingleses para compatibilidad con el frontend  
    return (response || []).map((community: any) => ({  
      id: community.id,  
      name: community.nombre,  
      description: community.descripcion,  
      image_url: community.icono_url,  
      type: community.tipo,  
      created_at: community.created_at,  
      members_count: 0 // Esto se calculará con una query separada si es necesario  
    }))  
  } catch (error: any) {  
    if (error.code === "42P01") return []  
    throw error  
  }  
}  


  
/**
 * Permite a un usuario unirse a una comunidad
 * 
 * @param uid - ID del usuario
 * @param community_id - ID de la comunidad
 * @returns Relación creada o null si ya está unido
 * 
 * NOTA: El error 23505 indica que ya existe la relación (usuario ya unido)
 * 
 * USADO EN:
 * - CommunityDetailScreen (botón "Unirse")
 */
export async function joinCommunity(uid: string, community_id: string) {  
  console.log('🟢 [joinCommunity API] INICIO:', { uid, community_id })
  
  try {  
    console.log('🟢 [joinCommunity API] Intentando POST a /user_communities...')
    
    // ✅ IMPORTANTE: Agregar header Prefer para que Supabase devuelva el registro creado
    const result = await request("POST", "/user_communities", {  
      body: { user_id: uid, community_id },
      headers: { 'Prefer': 'return=representation' }
    })
    
    console.log('🟢 [joinCommunity API] POST exitoso, resultado:', {
      result: result,
      resultType: typeof result,
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : 'N/A'
    })
    
    // ✅ Supabase devuelve un array, tomamos el primer elemento
    return Array.isArray(result) ? result[0] : result
  } catch (error: any) {  
    console.log('🟠 [joinCommunity API] Error capturado:', {
      error: error,
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details
    })
    
    // conflicto: ya está unido -> devolver el registro existente
    if (error.code === "23505") {
      console.log('🟠 [joinCommunity API] Código 23505 - Usuario ya unido, buscando registro existente...')
      
      try {
        const existing = await request('GET', '/user_communities', { 
          params: { 
            user_id: `eq.${uid}`, 
            community_id: `eq.${community_id}`, 
            select: '*' 
          } 
        })
        
        console.log('🟠 [joinCommunity API] Registro existente encontrado:', existing)
        return existing?.[0] || { id: 'existing', user_id: uid, community_id }
      } catch (e) {
        console.error('❌ [joinCommunity API] Error al buscar registro existente:', e)
        return { id: 'existing', user_id: uid, community_id }
      }
    }
    
    console.error('❌ [joinCommunity API] Error no manejado, lanzando excepción:', error)
    throw error
  }  
}

/**
 * Verifica si un usuario es miembro de una comunidad
 * 
 * @param userId - ID del usuario
 * @param communityId - ID de la comunidad
 * @returns true si es miembro, false si no
 * 
 * USADO EN:
 * - CommunityDetailScreen (verificar estado del botón "Unirse")
 */
export async function isUserMemberOfCommunity(userId: string, communityId: string) {
  try {
    const response = await request("GET", "/user_communities", {
      params: {
        user_id: `eq.${userId}`,
        community_id: `eq.${communityId}`,
        select: "id"
      }
    })
    return response && response.length > 0
  } catch (error) {
    console.error('Error checking membership:', error)
    return false
  }
}

/**
 * Obtiene el rol del usuario en una comunidad
 * 
 * @param userId - ID del usuario
 * @param communityId - ID de la comunidad
 * @returns 'admin' | 'moderator' | 'member' | null
 */
export async function getUserCommunityRole(userId: string, communityId: string): Promise<string | null> {
  try {
    const response = await request("GET", "/user_communities", {
      params: {
        user_id: `eq.${userId}`,
        community_id: `eq.${communityId}`,
        select: "role"
      }
    })
    return response?.[0]?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}  
  
/**
 * Obtiene los detalles completos de una comunidad específica
 * Incluye el conteo de miembros
 * 
 * @param communityId - ID de la comunidad
 * @returns Objeto con detalles de la comunidad o null
 * 
 * MAPEO DE CAMPOS:
 * - nombre → name
 * - descripcion → description
 * - icono_url → image_url
 * - tipo → type
 * - members count → members_count
 * 
 * USADO EN:
 * - CommunityDetailScreen
 */
export async function getCommunityDetails(communityId: string) {  
  try {  
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
      name: community.nombre,           // Mapear español → inglés  
      description: community.descripcion,  
      image_url: community.icono_url,  
      type: community.tipo,  
      created_at: community.created_at,  
      members_count: community.members?.[0]?.count || 0  
    }  
  } catch (error: any) {  
    console.error('Error fetching community details:', error)  
    return null  
  }  
}
  


/**
 * Obtiene las comunidades a las que pertenece un usuario
 * 
 * @param userId - ID del usuario
 * @returns Array de comunidades del usuario
 * 
 * USADO EN:
 * - ProfileScreen
 * - HomeScreen (mis comunidades)
 */
export async function getUserCommunities(userId: string) {  
  try {  
    const response = await request("GET", "/user_communities", {  
      params: {   
        user_id: `eq.${userId}`,  
        select: "community:communities(id,nombre,icono_url,descripcion)",  
      },  
    })  
      
    return (response || []).map((uc: any) => ({  
      id: uc.community?.id,  
      name: uc.community?.nombre,  
      nombre: uc.community?.nombre,  
      image_url: uc.community?.icono_url,  
      icono_url: uc.community?.icono_url,  
      descripcion: uc.community?.descripcion  
    })).filter((c: { id: string | undefined }) => c.id)  
  } catch (error: any) {  
    console.error('Error fetching user communities:', error)  
    return []  
  }  
}  

// Crear comunidad
export async function createCommunity(data: { nombre: string; descripcion?: string; tipo?: string; icono_url?: string; banner_url?: string; created_by?: string }) {
  try {
    const body = {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      tipo: data.tipo || 'public',
      icono_url: data.icono_url || null,
      banner_url: data.banner_url || null,
      created_by: data.created_by || null,
    }
    const response = await request('POST', '/communities', { body })
    return (response && response[0]) ? response[0] : response
  } catch (error: any) {
    console.error('Error creating community:', error)
    throw error
  }
}
  
/**
 * Obtiene los canales (chats) de una comunidad
 * 
 * @param communityId - ID de la comunidad
 * @returns Array de canales ordenados por fecha de creación
 * 
 * USADO EN:
 * - CommunityDetailScreen (tab "Chats")
 */
export async function getCommunityChannels(communityId: string) {  
  try {  
    const response = await request("GET", "/community_channels", {  
      params: {  
        community_id: `eq.${communityId}`,  
        select: "id,name,description,type,created_at",  
        order: "created_at.asc"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching community channels:', error)  
    return []  
  }  
}

/**
 * ⚠️ FUNCIÓN CRÍTICA - Obtiene posts de una comunidad
 * 
 * @param communityId - ID de la comunidad
 * @param limit - Número máximo de posts a retornar (default: 20)
 * @returns Array de posts con datos del autor
 * 
 * ⚠️ IMPORTANTE - RELACIONES MÚLTIPLES:
 * La tabla 'posts' tiene DOS foreign keys hacia 'users':
 * 1. posts_user_id_fkey (autor del post) ← ESTA ES LA QUE USAMOS
 * 2. posts_pinned_by_fkey (usuario que fijó el post)
 * 
 * Por eso DEBEMOS especificar: users!posts_user_id_fkey(...)
 * Si no lo especificamos, Supabase retorna error PGRST201
 * 
 * MAPEO DE CAMPOS:
 * - contenido → content
 * - likes_count → likes
 * - comment_count → comments
 * - image_url → image
 * - users.nombre/full_name/username → author.name
 * - users.photo_url/avatar_url → author.avatar
 * 
 * USADO EN:
 * - CommunityDetailScreen (tab "Tú" - posts principales)
 * 
 * ÚLTIMA MODIFICACIÓN: 2025-10-02 - Corregido error PGRST201
 */
export async function getCommunityPosts(communityId: string, limit = 20) {  
  try {  
    // ⚠️ IMPORTANTE: Especificar la relación correcta usando users!posts_user_id_fkey
    // Esto evita el error PGRST201 de múltiples relaciones
    const response = await request("GET", "/posts", {  
      params: {  
        community_id: `eq.${communityId}`,  
        select: "id,contenido,created_at,likes_count,comment_count,user_id,image_url,users!posts_user_id_fkey(id,nombre,full_name,username,photo_url,avatar_url,role)",  
        order: "created_at.desc",  
        limit: String(limit),  
      },  
    })  
      
    return (response || []).map((post: any) => ({  
      id: post.id,  
      content: post.contenido,  
      created_at: post.created_at,  
      likes: post.likes_count || 0,  
      comments: post.comment_count || 0,  
      shares: 0,  
      image: post.image_url || null,
      author: {  
        id: post.user_id,  
        name: post.users?.full_name || post.users?.nombre || post.users?.username || 'Usuario',  
        avatar: post.users?.avatar_url || post.users?.photo_url || 'https://i.pravatar.cc/100',  
        role: post.users?.role || 'Financiero'  
      }  
    }))  
  } catch (error: any) {  
    console.error('Error fetching community posts:', error)  
    return []  
  }  
}  

  
/**
 * Obtiene los mensajes de un canal/chat específico
 * 
 * @param chatId - ID del chat/canal
 * @param limit - Número máximo de mensajes (default: 50)
 * @returns Array de mensajes ordenados cronológicamente
 * 
 * USADO EN:
 * - ChatScreen
 * - ChannelScreen
 */
export async function getChannelMessages(chatId: string, limit = 50) {  
  try {  
    const response = await request("GET", "/chat_messages", {  
      params: {  
        chat_id: `eq.${chatId}`,  
        select: "id,content,created_at,user:users!sender_id(id,nombre,avatar_url)",  
        order: "created_at.asc",  
        limit: String(limit),  
      },  
    })  
    return (response || []).map((msg: any) => ({  
      id: msg.id,  
      content: msg.content,  
      created_at: msg.created_at,  
      user: {  
        id: msg.user?.id || '',  
        nombre: msg.user?.nombre || 'Usuario',  
        avatar: msg.user?.avatar_url || 'https://i.pravatar.cc/100'  
      }  
    }))  
  } catch (error: any) {  
    console.error('Error fetching messages:', error)  
    return []  
  }  
}
  
/**
 * Envía un mensaje a un chat/canal
 * Actualiza automáticamente el último mensaje del chat
 * 
 * @param chatId - ID del chat
 * @param userId - ID del usuario que envía
 * @param content - Contenido del mensaje
 * @returns Mensaje creado
 * 
 * USADO EN:
 * - ChatScreen
 * - ChannelScreen
 */
export async function sendMessage(chatId: string, userId: string, content: string) {  
  try {  
    const response = await request("POST", "/chat_messages", {  
      body: {  
        chat_id: chatId,  
        sender_id: userId,  
        content: content  
      }  
    })  
      
    // Actualizar el último mensaje del chat
    await request("PATCH", "/chats", {  
      params: { id: `eq.${chatId}` },  
      body: {  
        last_message: content,  
        last_message_at: new Date().toISOString()  
      }  
    })  
      
    return response  
  } catch (error: any) {  
    console.error('Error sending message:', error)  
    throw error  
  }  
}  


// ============================================================================
// FEED / POSTS
// ============================================================================

/**
 * ⚠️ FUNCIÓN CRÍTICA - Obtiene el feed de posts del usuario
 * 
 * @param uid - ID del usuario
 * @param limit - Número máximo de posts (default: 20)
 * @returns Array de posts con datos del autor
 * 
 * ESTRATEGIA PARA EVITAR ERROR PGRST201:
 * 1. Primero obtenemos los posts SIN relaciones
 * 2. Luego obtenemos los usuarios por separado
 * 3. Finalmente mapeamos los datos
 * 
 * Esto evita el problema de múltiples foreign keys entre posts y users
 * 
 * USADO EN:
 * - HomeScreen (feed principal)
 * - FeedScreen
 * 
 * NOTA: Esta función tiene un fallback por si la query principal falla
 */
export async function getUserFeed(uid: string, limit = 20) {  
  try {  
    // Paso 1: Obtener posts sin relaciones (evita conflictos)
    const response = await request("GET", "/posts", {
      params: {
        select: "id,contenido,created_at,likes_count,comment_count,user_id,media_url,shares_count",
        order: "created_at.desc",
        limit: limit.toString()
      }
    })
    
    if (!response || response.length === 0) return []
    
    // Paso 2: Obtener datos de usuarios por separado
    const userIds = [...new Set(response.map((post: any) => post.user_id).filter(Boolean))]
    
    let usersResponse = []
    if (userIds.length > 0) {
      usersResponse = await request("GET", "/users", {
        params: {
          select: "id,nombre,full_name,username,photo_url,avatar_url,role",
          id: `in.(${userIds.join(',')})`
        }
      })
    }
    
    // Paso 3: Obtener likes del usuario actual
    const postIds = response.map((p: any) => p.id).filter(Boolean)
    let likedPostIds = new Set()
    let savedPostIds = new Set()
    
    if (postIds.length > 0) {
      const likesResponse = await request("GET", "/post_likes", {
        params: {
          select: "post_id",
          user_id: `eq.${uid}`,
          post_id: `in.(${postIds.join(',')})`
        }
      })
      likedPostIds = new Set(likesResponse?.map((l: any) => l.post_id) || [])
      
      // Paso 4: Obtener posts guardados del usuario
      const savedResponse = await request("GET", "/saved_posts", {
        params: {
          select: "post_id",
          user_id: `eq.${uid}`,
          post_id: `in.(${postIds.join(',')})`
        }
      })
      savedPostIds = new Set(savedResponse?.map((s: any) => s.post_id) || [])
    }
    
    // Paso 5: Calcular tiempo relativo
    const getTimeAgo = (dateString: string) => {
      const now = new Date()
      const past = new Date(dateString)
      const diffMs = now.getTime() - past.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'Ahora'
      if (diffMins < 60) return `${diffMins}m`
      if (diffHours < 24) return `${diffHours}h`
      if (diffDays < 7) return `${diffDays}d`
      return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
    
    // Paso 6: Mapear datos completos
    return response.map((post: any) => {
      const user = usersResponse?.find((u: any) => u.id === post.user_id)
      const mediaUrls = post.media_url || []
      const firstImage = Array.isArray(mediaUrls) && mediaUrls.length > 0 ? mediaUrls[0] : null
      
      return {
        id: post.id,
        user_id: post.user_id,
        user_name: user?.full_name || user?.nombre || user?.username || 'Usuario',
        user_avatar: user?.avatar_url || user?.photo_url || 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff',
        user_role: user?.role || 'Usuario',
        content: post.contenido || '',
        image: firstImage,
        time_ago: getTimeAgo(post.created_at),
        likes: post.likes_count || 0,
        comments: post.comment_count || 0,
        shares: post.shares_count || 0,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
        is_following: false, // TODO: Implementar lógica de seguimiento
        created_at: post.created_at
      }
    })
  } catch (error: any) {  
    console.error("getUserFeed error:", error)  
    return []  
  }  
}  
  
/**
 * Crea un nuevo post
 * 
 * @param data - Datos del post
 * @param data.user_id - ID del usuario autor
 * @param data.community_id - ID de la comunidad (opcional)
 * @param data.contenido - Contenido del post
 * @param data.media_url - URLs de medios adjuntos (opcional)
 * @returns Post creado
 * 
 * USADO EN:
 * - CreatePostScreen
 * - CommunityDetailScreen
 * - HomeScreen
 */
export async function createPost(data: {  
  user_id: string  
  community_id?: string  
  contenido: string  
  media_url?: string[]  
}) {  
  return await request("POST", "/posts", { body: data })  
}  
  
/**
 * Obtiene los detalles de un post específico
 * Incluye datos del autor y comentarios
 * 
 * @param postId - ID del post
 * @returns Post con detalles completos o null
 * 
 * NOTA: Esta función usa users!inner sin especificar FK
 * Si da error PGRST201, cambiar a: users!posts_user_id_fkey(...)
 * 
 * USADO EN:
 * - PostDetailScreen
 */
export async function getPostDetail(postId: string) {  
  try {  
    // Paso 1: Obtener el post sin relaciones
    const response = await request("GET", "/posts", {  
      params: {  
        id: `eq.${postId}`,  
        select: "id,contenido,created_at,likes_count,comment_count,user_id,media_url",  
      },  
    })
    
    if (!response || response.length === 0) return null
    
    const post = response[0]
    
    // Paso 2: Obtener datos del usuario
    const userResponse = await request("GET", "/users", {
      params: {
        id: `eq.${post.user_id}`,
        select: "id,nombre,full_name,username,photo_url,avatar_url,role"
      }
    })
    
    // Paso 3: Obtener comentarios con sus autores
    const commentsResponse = await request("GET", "/comments", {
      params: {
        post_id: `eq.${postId}`,
        select: "id,contenido,created_at,user_id",
        order: "created_at.asc"
      }
    })
    
    // Paso 4: Obtener usuarios de los comentarios
    let commentsWithUsers = []
    if (commentsResponse && commentsResponse.length > 0) {
      const commentUserIds = [...new Set(commentsResponse.map((c: any) => c.user_id))]
      const commentUsersResponse = await request("GET", "/users", {
        params: {
          id: `in.(${commentUserIds.join(',')})`,
          select: "id,nombre,full_name,username,photo_url,avatar_url"
        }
      })
      
      commentsWithUsers = commentsResponse.map((comment: any) => {
        const user = commentUsersResponse?.find((u: any) => u.id === comment.user_id)
        return {
          ...comment,
          author: {
            username: user?.username || user?.full_name || user?.nombre || 'Usuario',
            photo_url: user?.photo_url || user?.avatar_url || 'https://ui-avatars.com/api/?name=User'
          }
        }
      })
    }
    
    const user = userResponse?.[0]
    return {
      ...post,
      author: {
        username: user?.username || user?.full_name || user?.nombre || 'Usuario',
        photo_url: user?.photo_url || user?.avatar_url || 'https://ui-avatars.com/api/?name=User',
        role: user?.role || 'Usuario'
      },
      comments: commentsWithUsers
    }
  } catch (error) {  
    console.error('getPostDetail error:', error)
    return null  
  }  
}  
  
/**
 * Da like/dislike a un post
 * 
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @param is_like - true para like, false para dislike (default: true)
 * @returns Like creado o null si ya existía
 * 
 * NOTA: El error 23505 indica que el usuario ya dio like
 * 
 * USADO EN:
 * - PostCard component
 * - PostDetailScreen
 * - CommunityDetailScreen
 */
export async function likePost(post_id: string, user_id: string, is_like = true) {  
  try {  
    return await request("POST", "/post_likes", {  
      body: { post_id, user_id, is_like },  
    })  
  } catch (error: any) {  
    if (error.code === "23505") return null // Ya dio like  
    return null  
  }  
}  
  
/**
 * Crea un comentario en un post
 * Soporta comentarios anidados (respuestas)
 * 
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @param contenido - Contenido del comentario
 * @param parent_id - ID del comentario padre (para respuestas)
 * @returns Comentario creado
 * 
 * USADO EN:
 * - PostDetailScreen
 * - CommentSection component
 */
export async function commentPost(post_id: string, user_id: string, contenido: string, parent_id?: string) {  
  return await request("POST", "/comments", {  
    body: { post_id, user_id, contenido, parent_id: parent_id || null },  
  })  
}  
  
// ===== PROMOCIONES =====  
export async function fetchPromotions(params: { page: number; limit: number }) {  
  try {  
    const { page = 1, limit = 10 } = params  
    const response = await request("GET", "/promotions", {  
      params: {  
        select: "*",  
        order: "created_at.desc",  
        offset: String((page - 1) * limit),  
        limit: String(limit),  
      },  
    })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching promotions:', error)  
    throw new Error(error.message || 'Error al cargar las promociones')  
  }  
}  
  
// ===== CURSOS =====  
export async function fetchCourses(userId: string, params: { page: number; limit: number }) {  
  try {  
    const { page = 1, limit = 10 } = params  
    const response = await request("POST", "/rpc/get_user_courses", {  
      body: {  
        p_user_id: userId,  
        p_page: page,  
        p_limit: limit,  
      },  
    })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching courses:', error)  
    throw new Error(error.message || 'Error al cargar los cursos')  
  }  
}  
  
// ===== ARTÍCULOS =====  
export async function fetchArticles(params: {  
  page: number;  
  limit: number;  
  category?: string  
}) {  
  try {  
    const { page = 1, limit = 10, category } = params  
    const query: Record<string, string> = {  
      select: "*",  
      order: "created_at.desc",  
      offset: String((page - 1) * limit),  
      limit: String(limit),  
    }  
    if (category) {  
      query.category = `eq.${category}`  
    }  
    const response = await request("GET", "/articles", { params: query })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching articles:', error)  
    throw new Error(error.message || 'Error al cargar los artículos')  
  }  
}  
  
// ===== CONTENIDO EDUCATIVO =====  
export async function fetchEducationalContent(params: {  
  page: number;  
  limit: number;  
  contentType?: 'video' | 'article' | 'course'  
}) {  
  try {  
    const { page = 1, limit = 10, contentType } = params  
    const query: Record<string, string> = {  
      select: "*",  
      order: "created_at.desc",  
      offset: String((page - 1) * limit),  
      limit: String(limit),  
    }  
    if (contentType) {  
      query.content_type = `eq.${contentType}`  
    }  
    const response = await request("GET", "/educational_content", {  
      params: query  
    })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching educational content:', error)  
    throw new Error(error.message || 'Error al cargar el contenido educativo')  
  }  
}  
  
// ===== NOTICIAS =====  
export async function getNewsList(category?: string) {  
  try {  
    const query: Record<string, string> = {  
      select: "*,author:users(id,nombre,full_name,username,photo_url,avatar_url)",  
      order: "published_at.desc"  
    }  
    if (category) {  
      query.category = `eq.${category}`  
    }  
    const response = await request("GET", "/news", { params: query })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching news:', error)  
    return []  
  }  
}  
  
export async function getNewsDetail(newsId: string) {  
  try {  
    const response = await request("GET", "/news", {  
      params: {  
        id: `eq.${newsId}`,  
        select: "*,author:users(id,nombre,full_name,username,photo_url,avatar_url)"  
      },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    console.error('Error fetching news detail:', error)  
    return null  
  }  
}  
  
// ===== BÚSQUEDA =====  
export async function globalSearch(query: string, userId: string) {  
  try {  
    const response = await request("POST", "/rpc/search_all", {  
      body: { search_term: query, current_user_id: userId }  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error in global search:', error)  
    return []  
  }  
}  
  
export async function searchUsers(query: string) {  
  try {  
    const response = await request("GET", "/users", {  
      params: {  
  or: `(nombre.ilike.%${query}%,username.ilike.%${query}%)`,  
        select: "id,nombre,full_name,username,photo_url,avatar_url,role,bio",  
        limit: "20"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error searching users:', error)  
    return []  
  }  
}  
  
// ===== STORAGE =====  
export async function uploadAvatar(uid: string, blob: Blob) {  
  const token = await SecureStore.getItemAsync("access_token")  
  const response = await fetch(`${urls.STORAGE_URL}/object/avatars/${uid}/avatar.jpg`, {  
    method: "POST",  
    headers: {  
      "Content-Type": "image/jpeg",  
      "apikey": ANON_KEY,  
      "Authorization": `Bearer ${token}`,  
    },  
    body: blob,  
  })  
  
  if (!response.ok) {  
    const errorText = await response.text()  
    console.error("Upload error details:", errorText)  
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)  
  }  
  return await response.json()  
}  
  
export async function uploadImage(file: any) {  
  try {  
    const formData = new FormData()  
    formData.append('file', file)  
    const token = await SecureStore.getItemAsync("access_token")  
    const response = await fetch(`${urls.STORAGE_URL}/object/avatars/${file.name}`, {  
      method: 'POST',  
      headers: {  
        'Authorization': `Bearer ${token}`,  
        'apikey': ANON_KEY,  
      },  
      body: formData,  
    })  
    if (!response.ok) {  
      throw new Error('Error al subir la imagen')  
    }  
    const data = await response.json()  
    return data.url  
  } catch (error: any) {  
    console.error('Error uploading image:', error)  
    return 'https://www.investiiapp.com/investi-logo-new-main.png'  
  }  
}  
  
// ===== CURSOS Y LECCIONES =====  

// ===== EDUCATION SYSTEM =====

// Video Themes
export async function getVideoThemes() {
  try {
    return await request("GET", "/video_themes", {
      params: {
        select: "id,name,color,order_index",
        is_active: "eq.true",
        order: "order_index.asc"
      }
    });
  } catch (error: any) {
    console.error('Error fetching video themes:', error);
    return [];
  }
}

// Videos
export async function getVideos(themeId?: string) {
  try {
    let params: any = {
      select: "id,title,description,video_url,thumbnail_url,duration,theme_id,view_count,like_count,category,tags",
      is_published: "eq.true",
      order: "created_at.desc"
    };
    
    if (themeId) {
      params.theme_id = `eq.${themeId}`;
    }
    
    return await request("GET", "/videos", { params });
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

// Course Topics
export async function getCourseTopics() {
  try {
    return await request("GET", "/course_topics", {
      params: {
        select: "id,name,description,icon,color,order_index",
        is_active: "eq.true",
        order: "order_index.asc"
      }
    });
  } catch (error: any) {
    console.error('Error fetching course topics:', error);
    return [];
  }
}

// Courses
export async function getCourses(topicId?: string) {
  try {
    let params: any = {
      select: "id,title,description,category,level,duration,price,currency,topic,icon,color",
      is_published: "eq.true",
      order: "created_at.desc"
    };
    
    if (topicId) {
      params.topic = `eq.${topicId}`;
    }
    
    return await request("GET", "/courses", { params });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Educational Tools
export async function getEducationalTools() {
  try {
    return await request("GET", "/educational_tools", {
      params: {
        select: "id,title,description,icon,route,is_premium,order_index",
        is_active: "eq.true",
        order: "order_index.asc"
      }
    });
  } catch (error: any) {
    console.error('Error fetching educational tools:', error);
    return [];
  }
}

// User Video Progress
export async function getUserVideoProgress(userId: string) {
  try {
    return await request("GET", "/video_progress", {
      params: {
        user_id: `eq.${userId}`,
        select: "video_id,progress_percentage,completed,last_watched_at",
        order: "last_watched_at.desc"
      }
    });
  } catch (error: any) {
    console.error('Error fetching video progress:', error);
    return [];
  }
}

// User Course Progress
export async function getUserCourseProgress(userId: string) {
  try {
    return await request("GET", "/course_enrollments", {
      params: {
        user_id: `eq.${userId}`,
        select: "course_id,progress_percentage,completed_at,last_accessed_at",
        is_active: "eq.true",
        order: "last_accessed_at.desc"
      }
    });
  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    return [];
  }
}

// Update Video Progress
export async function updateVideoProgress(userId: string, videoId: string, progressPercentage: number, completed: boolean = false) {
  try {
    return await request("POST", "/video_progress", {
      body: {
        user_id: userId,
        video_id: videoId,
        progress_percentage: progressPercentage,
        completed: completed,
        last_watched_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error updating video progress:', error);
    throw error;
  }
}

// Update Course Progress
export async function updateCourseProgress(userId: string, courseId: string, progressPercentage: number) {
  try {
    return await request("PATCH", "/course_enrollments", {
      params: {
        user_id: `eq.${userId}`,
        course_id: `eq.${courseId}`
      },
      body: {
        progress_percentage: progressPercentage,
        last_accessed_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error updating course progress:', error);
    throw error;
  }
}

// Enroll in Course
export async function enrollInCourse(userId: string, courseId: string) {
  try {
    return await request("POST", "/course_enrollments", {
      body: {
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        is_active: true
      }
    });
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
}

// Get Lessons for Course
export async function getCourseLessons(courseId: string) {
  try {
    return await request("GET", "/lessons", {
      params: {
        course_id: `eq.${courseId}`,
        select: "id,title,description,order_index,duration,content_type,is_free",
        order: "order_index.asc"
      }
    });
  } catch (error: any) {
    console.error('Error fetching course lessons:', error);
    return [];
  }
}

// Get User Lesson Progress
export async function getUserLessonProgress(userId: string, courseId: string) {
  try {
    const lessons = await getCourseLessons(courseId);
    const lessonIds = lessons.map((l: any) => l.id);
    
    if (lessonIds.length === 0) return [];
    
    return await request("GET", "/lesson_progress", {
      params: {
        user_id: `eq.${userId}`,
        lesson_id: `in.(${lessonIds.join(',')})`,
        select: "lesson_id,completed,progress_percentage,last_accessed_at"
      }
    });
  } catch (error: any) {
    console.error('Error fetching lesson progress:', error);
    return [];
  }
}

// Complete Lesson
export async function completeLesson(userId: string, lessonId: string) {
  try {
    return await request("POST", "/lesson_progress", {
      body: {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error completing lesson:', error);
    throw error;
  }
}  
  
export async function getLessons(courseId?: string) {  
  try {  
    let params: any = {  
      select: "id,titulo,descripcion,duration,tipo,orden"  
    }  
      
    if (courseId) {  
      params.course_id = `eq.${courseId}`  
    }  
      
    return await request("GET", "/lessons", { params })  
  } catch (error: any) {  
    console.error('Error fetching lessons:', error)  
    return []  
  }  
}  
  
export async function getCoursesWithLessons() {  
  try {  
    return await request("GET", "/courses", {  
      params: {  
        select: "id,titulo,descripcion,course_modules(id,titulo,orden,lessons(id,titulo,orden))",  
      },  
    })  
  } catch (error: any) {  
    if (error.code === "42P01") return []  
    return []  
  }  
}  
  

export async function getUserLearningProgress(userId: string) {  
  try {  
    const response = await request("GET", "/user_course_progress", {  
      params: {  
        user_id: `eq.${userId}`,  
        select: "course:courses(id,titulo),completed_lessons,progress_percent,last_accessed",  
        order: "last_accessed.desc",  
        limit: "5"  
      }  
    })  
      
    return (response || []).map((progress: any) => ({  
      courseId: progress.course?.id,  
      title: progress.course?.titulo,  
      completedLessons: progress.completed_lessons,  
      progress: progress.progress_percent,  
      lastAccessed: progress.last_accessed  
    }))  
  } catch (error: any) {  
    console.error('Error fetching learning progress:', error)  
    return []  
  }  
}






  
// ===== PORTFOLIO =====  
export async function getPortfolio(uid: string) {  
  try {  
    const response = await request("GET", "/simulated_portfolios", {  
      params: {  
        user_id: `eq.${uid}`,  
        select: "*,simulated_investments(*)",  
      },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    if (error.code === "42P01") return null  
    return null  
  }  
}  
  
export async function addInvestment(payload: any) {  
  return await request("POST", "/simulated_investments", { body: payload })  
}  
  
// ===== BLOQUEO DE USUARIOS =====  
export async function blockUser(user_id: string, blocked_user_id: string) {  
  return await request("POST", "/user_blocks", {  
    body: { user_id, blocked_user_id },  
  })  
}  
  
// ============================================================================
// HELPERS - FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene el usuario actualmente autenticado
 * Decodifica el JWT del token almacenado y obtiene los datos del usuario
 * 
 * @returns Usuario actual o null si no está autenticado
 * 
 * PROCESO:
 * 1. Obtiene el token de SecureStore
 * 2. Decodifica el JWT (payload.sub = user ID)
 * 3. Llama a getMe() con el ID
 * 
 * USADO EN:
 * - Todas las pantallas que necesitan datos del usuario actual
 * - useAuthGuard hook
 * - Navigation guards
 */
export async function getCurrentUser() {  
  try {  
    const token = await SecureStore.getItemAsync("access_token")  
    if (!token) return null  
    const payload = JSON.parse(atob(token.split(".")[1]))  
    const uid = payload.sub || null  
    if (!uid) return null  
    return await getMe(uid)  
  } catch {  
    return null  
  }  
}  
  
/**
 * Obtiene solo el ID del usuario actual (más rápido que getCurrentUser)
 * 
 * @returns ID del usuario o null
 * 
 * USADO EN:
 * - Cuando solo necesitas el ID sin todos los datos del usuario
 * - Operaciones rápidas de autenticación
 */
export async function getCurrentUserId(): Promise<string | null> {  
  try {  
    const token = await SecureStore.getItemAsync("access_token")  
    if (!token) return null  
    const payload = JSON.parse(atob(token.split(".")[1]))  
    return payload.sub || null  
  } catch {  
    return null  
  }  
}  
  
// ============================================================================
// NOTIFICACIONES
// ============================================================================

/**
 * Obtiene las notificaciones de un usuario
 * 
 * @param userId - ID del usuario
 * @returns Array de notificaciones ordenadas por fecha (más recientes primero)
 * 
 * USADO EN:
 * - NotificationsScreen
 * - Header (badge de notificaciones)
 */
export async function getNotifications(userId: string) {  
  const response = await request("GET", "/notifications", {  
    params: {  
      user_id: `eq.${userId}`,  
      select: "*",  
      order: "created_at.desc"  
    }  
  })  
  return response || []  
}  
  
/**
 * Marca una notificación como leída
 * 
 * @param notificationId - ID de la notificación
 * @returns Notificación actualizada
 * 
 * USADO EN:
 * - NotificationsScreen (al hacer clic en una notificación)
 */
export async function markNotificationAsRead(notificationId: string) {  
  return await request("PATCH", "/notifications", {  
    params: { id: `eq.${notificationId}` },  
    body: { read: true },  
    headers: { Prefer: "return=representation" },  
  })  
}  
  
// ============================================================================
// FAQ Y GLOSARIO
// ============================================================================  
export async function getFAQs() {  
  const response = await request("GET", "/faqs", {  
    params: {  
      select: "*",  
      order: "created_at.asc"  
    }  
  })  
  return response || []  
}  
  
export async function getGlossaryTerms() {  
  const response = await request("GET", "/glossary", {  
    params: {  
      select: "*",  
      order: "termino.asc"  
    }  
  })  
  return response || []  
}  
  
// ===== BADGES =====  
export async function getUserBadges(userId: string) {  
  const response = await request("GET", "/user_badges", {  
    params: {  
      user_id: `eq.${userId}`,  
      select: "*,badge:badges(*)"  
    }  
  })  
  return response || []  
}


// Obtener datos de mercado  
export async function getMarketData() {
  try {
    const envSymbols = process?.env?.EXPO_PUBLIC_MARKET_SYMBOLS || (global as any)?.EXPO_PUBLIC_MARKET_SYMBOLS
    const symbols = envSymbols ? envSymbols.split(',').map((s: string) => s.trim()) : ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
    const results = await fetchSearchApiForSymbols(symbols)
    return results || []
  } catch (error: any) {
    console.error('Error fetching market data:', error)
    return []
  }
}
  
// Obtener datos destacados del mercado  
export async function getFeaturedStocks() {
  try {
    const envSymbols = process?.env?.EXPO_PUBLIC_FEATURED_SYMBOLS || (global as any)?.EXPO_PUBLIC_FEATURED_SYMBOLS
    const symbols = envSymbols ? envSymbols.split(',').map((s: string) => s.trim()) : ["AAPL", "TSLA"]
    const results = await fetchSearchApiForSymbols(symbols)
    return results || []
  } catch (error: any) {
    console.error('Error fetching featured stocks:', error)
    return []
  }
}

async function fetchSearchApiForSymbols(symbols: string[]) {
  const key = process?.env?.EXPO_PUBLIC_SEARCHAPI_KEY || (global as any)?.EXPO_PUBLIC_SEARCHAPI_KEY
  if (!key) throw new Error('EXPO_PUBLIC_SEARCHAPI_KEY no configurada')

  const baseUrl = 'https://www.searchapi.io/api/v1/search'
  const results: any[] = []

  // Simple in-memory cache to avoid excessive calls (TTL seconds)
  const CACHE_TTL = 120 // seconds
  ;(global as any).__searchApiCache = (global as any).__searchApiCache || {}

  const fetchWithRetries = async (url: string, attempts = 2) => {
    let lastErr: any = null
    let delay = 300
    for (let i = 0; i <= attempts; i++) {
      try {
        const resp = await fetch(url, { method: 'GET' })
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
        return await resp.json()
      } catch (e: any) {
        lastErr = e
        if (i < attempts) await new Promise(r => setTimeout(r, delay))
        delay *= 2
      }
    }
    throw lastErr
  }

  for (const symbol of symbols) {
    try {
      const cacheKey = `searchapi:${symbol}`
      const cached = (global as any).__searchApiCache[cacheKey]
      if (cached && (Date.now() - cached.ts) / 1000 < CACHE_TTL) {
        results.push(cached.value)
        continue
      }

      const q = symbol.includes(':') ? symbol : `${symbol}:NASDAQ`
      const params = new URLSearchParams({ engine: 'google_finance', q, api_key: key, hl: 'en' })
      const url = `${baseUrl}?${params.toString()}`

      const data = await fetchWithRetries(url, 2)
      const summary = data?.summary || {}
      const kg = data?.knowledge_graph || {}

      const price = Number(summary.price || 0)
      const changeAmount = Number(summary?.price_change?.amount || 0)
      const changePercent = Number(summary?.price_change?.percentage || 0)
      const company = summary.title || (kg.about && kg.about.company) || symbol

      const website = summary?.website || (kg.about && kg.about.website) || null
      let logo_url = null
      try {
        if (website) {
          const u = website.replace(/^https?:\/\//, '').split('/')[0]
          logo_url = `https://logo.clearbit.com/${u}`
        }
      } catch (e) { logo_url = null }
      
      const mapped = {
        id: `${summary.stock || symbol}`,
        symbol: summary.stock || symbol.split(':')[0],
        company_name: company,
        logo_url,
        current_price: price,
        price_change: changeAmount,
        price_change_percent: changePercent,
        color: changeAmount > 0 ? '#10B981' : '#EF4444',
        is_featured: false,
        last_updated: summary.date || new Date().toISOString(),
      }

      ;(global as any).__searchApiCache[cacheKey] = { ts: Date.now(), value: mapped }
      results.push(mapped)
    } catch (err: any) {
      // Silent failure per symbol; continue with others
    }
  }

  return results
}



// Obtener usuarios activos para historias  
export async function getActiveUsers(limit = 10) {  
  try {  
    const response = await request("GET", "/users", {  
      params: {  
        select: "id,nombre,avatar_url,is_online,last_seen_at",  
        order: "last_seen_at.desc",  
        limit: String(limit),  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching active users:', error)  
    return []  
  }  
}
  
// Obtener chats del usuario  
  
export async function getUserChats(userId: string) {  
  try {  
    const response = await request("GET", "/chats", {
      params: {
        or: `(user_one_id.eq.${userId},user_two_id.eq.${userId})`,
        select: "id,type,last_message,last_message_at,community:communities(id,nombre,icono_url),user_one:users!user_one_id(id,nombre,avatar_url),user_two:users!user_two_id(id,nombre,avatar_url)",
        order: "last_message_at.desc",
      },
    })
      
    return (response || []).map((chat: any) => ({  
      ...chat,  
      unread_count: chat.unread_count || 0,
      user: chat.type === 'direct'
        ? (chat.user_one?.id === userId ? chat.user_two : chat.user_one)
        : null
    }))  
  } catch (error: any) {  
    console.error('Error fetching user chats:', error)  
    return []  
  }  
}
  
// Obtener último mensaje por chat  
export async function getLastMessages(chatIds: string[]) {  
  try {  
    const response = await request("GET", "/messages", {  
      params: {  
        chat_id: `in.(${chatIds.join(',')})`,  
        select: "id,chat_id,sender:users(id,nombre),content,created_at",  
        order: "created_at.desc",  
        limit: "1"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching last messages:', error)  
    return []  
  }  
}


export async function getUserComplete(userId: string) {  
  try {  
    console.log('🔍 [getUserComplete] Fetching profile for userId:', userId)  
    
    // Fetch user data and stats separately with individual error handling  
    let userResponse, statsResponse, postsResponse, communitiesResponse  
    
    try {  
      console.log('📡 [getUserComplete] Requesting user data from /users...')
      userResponse = await request("GET", "/users", {  
        params: {  
          id: `eq.${userId}` ,  
          select: "id,nombre,bio,location,avatar_url,banner_url,is_verified,fecha_registro,full_name,username,photo_url,pais,role"  
        }  
      })  
      console.log('✅ [getUserComplete] User data fetched:', userResponse?.[0]?.nombre || userResponse?.[0]?.username)  
      console.log('📊 [getUserComplete] User data:', JSON.stringify(userResponse?.[0], null, 2))
    } catch (error: any) {  
      console.error('❌ [getUserComplete] Error fetching user:', error)  
      console.error('❌ [getUserComplete] Error code:', error?.code)
      console.error('❌ [getUserComplete] Error message:', error?.message)
      console.error('❌ [getUserComplete] Error details:', error?.details)
      throw error  
    }  
    
    const user = userResponse?.[0]  
    if (!user) {  
      console.error('❌ [getUserComplete] User not found for ID:', userId)  
      return null  
    }  
    
    // Fetch stats with RPC (POST method)  
    try {  
      console.log('📡 [getUserComplete] Requesting user stats...')
      statsResponse = await request("POST", "/rpc/get_user_stats", {  
        body: { user_id: userId }  
      })  
      console.log('✅ [getUserComplete] Stats fetched:', statsResponse)  
    } catch (error: any) {  
      console.error('⚠️ [getUserComplete] Error fetching stats, using defaults:', error?.message)  
      statsResponse = { followers_count: 0, following_count: 0, posts_count: 0 }  
    }  
    
    // Fetch posts  
    try {  
      console.log('📡 [getUserComplete] Requesting user posts...')
      postsResponse = await request("GET", "/posts", {  
        params: {  
          user_id: `eq.${userId}` ,  
          select: "id,contenido,created_at,likes_count,comment_count,user:users!posts_user_id_fkey(id,nombre,avatar_url)",  
          order: "created_at.desc",  
          limit: "10"  
        }  
      })  
      console.log('✅ [getUserComplete] Posts fetched:', postsResponse?.length || 0)  
    } catch (error: any) {  
      console.error('⚠️ [getUserComplete] Error fetching posts:', error?.message)  
      postsResponse = []  
    }  
    
    // Fetch communities  
    try {  
      console.log('📡 [getUserComplete] Requesting user communities...')
      communitiesResponse = await request("GET", "/user_communities", {  
        params: {  
          user_id: `eq.${userId}` ,  
          status: `eq.active` ,
          select: "role,status,joined_at,community:communities(id,nombre,name,descripcion,icono_url,image_url,member_count,type,category,is_verified)",
          order: "joined_at.desc",
          limit: "20"
        }  
      })  
      console.log('✅ [getUserComplete] Communities fetched:', communitiesResponse?.length || 0)  
    } catch (error: any) {  
      console.error('⚠️ [getUserComplete] Error fetching communities:', error?.message)  
      communitiesResponse = []  
    }  
    
    const result = {  
      id: user.id,  
      name: user.nombre || user.full_name || user.username,  
      bio: user.bio,  
      location: user.location,  
      avatarUrl: user.avatar_url || user.photo_url,  
      bannerUrl: user.banner_url,  
      isVerified: user.is_verified,
      country: user.pais,
      role: user.role,
      username: user.username,
      learningTag: user.role === 'principiante' ? 'Aprendiendo de inversiones' : undefined,
      stats: {  
        postsCount: statsResponse?.posts_count || postsResponse?.length || 0,  
        followersCount: statsResponse?.followers_count || 0,  
        followingCount: statsResponse?.following_count || 0  
      },  
      posts: postsResponse || [],  
      communities: communitiesResponse?.map((uc: any) => ({  
        id: uc.community?.id,  
        name: uc.community?.nombre || uc.community?.name,  
        imageUrl: uc.community?.icono_url || uc.community?.image_url,  
        memberCount: uc.community?.member_count || 0,  
        isMember: true // Ya que viene de user_communities con status active  
      })) || []  
    }  
    
    console.log('✅ [getUserComplete] Profile complete:', result.name, 'with', result.posts.length, 'posts and', result.communities.length, 'communities')  
    return result  
  } catch (error: any) {  
    console.error('❌ [getUserComplete] Critical error fetching complete user profile:', error)  
    console.error('❌ [getUserComplete] Error details:', JSON.stringify(error, null, 2))  
    return null  
  }  
}  
  
export async function followUser(followerId: string, followingId: string) {  
  try {  
    return await request("POST", "/user_follows", {  
      body: { follower_id: followerId, following_id: followingId }  
    })  
  } catch (error: any) {  
    if (error.code === "23505") return null // Already following  
    throw error  
  }  
}  
  
export async function unfollowUser(followerId: string, followingId: string) {  
  try {  
    return await request("DELETE", "/user_follows", {  
      params: {  
        follower_id: `eq.${followerId}`,  
        following_id: `eq.${followingId}`  
      }  
    })  
  } catch (error: any) {  
    console.error('Error unfollowing user:', error)  
    throw error  
  }  
}  



export async function getUserPosts(userId: string, limit = 20) {  
  try {  
    const response = await request("GET", "/posts", {  
      params: {  
        user_id: `eq.${userId}`,  
        select: "id,contenido,created_at,likes_count,comment_count,media_url,user:users(id,nombre,avatar_url)",  
        order: "created_at.desc",  
        limit: String(limit)  
      }  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching user posts:', error)  
    return []  
  }  
}  
  
export async function getSavedPosts(userId: string) {  
  try {  
    const response = await request("GET", "/saved_posts", {  
      params: {  
        user_id: `eq.${userId}`,  
        select: "post:posts(id,contenido,created_at,likes_count,comment_count,user:users!posts_user_id_fkey(id,nombre,avatar_url))",  
        order: "created_at.desc"  
      }  
    })  
    return response?.map((sp: any) => sp.post) || []  
  } catch (error: any) {  
    console.error('Error fetching saved posts:', error)  
    return []  
  }  
}  
  
export async function getRecommendedCommunities(userId: string) {  
  try {  
    const response = await request("GET", "/communities", {  
      params: {  
        select: "id,nombre,descripcion,icono_url,members:user_communities(count)",  
        limit: "5"  
      }  
    })  
    return response.map((community: {
      id: string;
      nombre: string;
      descripcion: string;
      icono_url: string;
      members?: Array<{ count: number }>;
    }) => ({
      id: community.id,
      name: community.nombre,
      description: community.descripcion,
      imageUrl: community.icono_url,
      memberCount: community.members?.[0]?.count || 0,
      isMember: false // TODO: Check if user is member  
    }))  
  } catch (error: any) {  
    console.error('Error fetching recommended communities:', error)  
    return []  
  }  
}

// ===== ONBOARDING OPTIONS ENDPOINTS =====

// Investment Goals - trae TODOS los datos de la tabla goals
export async function getInvestmentGoals() {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching goals from Supabase:', error)
      // Fallback a datos mock si falla la consulta
      return [
        { id: '1', name: 'Comprar una casa o departamento', description: 'Adquirir vivienda propia', icon: '🏠', category: 'real_estate', priority: 1 },
        { id: '2', name: 'Pagar estudios', description: 'Financiar educación', icon: '🎓', category: 'education', priority: 2 },
        { id: '3', name: 'Lograr libertad financiera', description: 'Independencia económica', icon: '💰', category: 'financial_freedom', priority: 3 },
        { id: '4', name: 'Viajar por el mundo', description: 'Conocer nuevos lugares', icon: '✈️', category: 'travel', priority: 4 },
        { id: '5', name: 'Comprar un auto', description: 'Adquirir vehículo propio', icon: '🚗', category: 'vehicle', priority: 5 },
        { id: '6', name: 'Hacer crecer mi dinero a largo plazo', description: 'Inversiones a futuro', icon: '📈', category: 'investment', priority: 6 },
        { id: '7', name: 'Prepararme para mi salud', description: 'Fondo para emergencias médicas', icon: '🏥', category: 'health', priority: 7 },
        { id: '8', name: 'Proyectos personales', description: 'Emprendimientos propios', icon: '🚀', category: 'business', priority: 8 },
        { id: '9', name: 'Aprender financieramente', description: 'Educación financiera', icon: '📚', category: 'learning', priority: 9 },
        { id: '10', name: 'Bienestar de mi mascota', description: 'Cuidado de animales', icon: '🐕', category: 'pets', priority: 10 }
      ]
    }

    // Mapear datos de Supabase al formato esperado
    return data?.map((goal: any, index: number) => ({
      id: goal.id,
      name: goal.name,
      description: goal.description || '',
      icon: goal.icon || '🎯', // Icono por defecto si no tiene
      category: goal.category || 'general',
      priority: index + 1
    })) || []

  } catch (error: any) {
    console.error('Error fetching investment goals:', error)
    return []
  }
}

export async function saveUserGoals(userId: string, goalIds: string[]) {
  try {
    console.log('📝 saveUserGoals - userId:', userId)
    console.log('📝 saveUserGoals - goalIds:', goalIds)
    
    // Verificar sesión de Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    console.log('🔐 Session check:', sessionData?.session ? 'Autenticado' : 'No autenticado')
    
    if (sessionError || !sessionData?.session) {
      console.error('❌ No hay sesión activa:', sessionError)
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.')
    }
    
    // Primero eliminar metas anteriores del usuario
    console.log('🗑️ Eliminando metas anteriores...')
    const { error: deleteError } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId)
    
    if (deleteError) {
      console.error('⚠️ Error eliminando metas anteriores (puede ser normal si no hay):', deleteError)
    }
    
    // Insertar nuevas metas con prioridad
    const goalsToInsert = goalIds.map((goalId, index) => ({
      user_id: userId,
      goal_id: goalId,
      priority: index + 1,
      created_at: new Date().toISOString()
    }))
    
    console.log('📥 Insertando metas:', goalsToInsert)
    
    const { data, error } = await supabase
      .from('user_goals')
      .insert(goalsToInsert)
      .select()
    
    if (error) {
      console.error('❌ Error insertando metas:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error details:', error.details)
      throw error
    }
    
    console.log('✅ Metas insertadas exitosamente:', data)
    return data
  } catch (error: any) {
    console.error('❌ Error en saveUserGoals:', error)
    throw error
  }
}

export async function getUserGoals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select(`
        id,
        goal_id,
        priority,
        goal:goals(id, name, description, icon)
      `)
      .eq('user_id', userId)
      .order('priority', { ascending: true })
    
    if (error) {
      console.error('Error fetching user goals:', error)
      return []
    }
    
    return data || []
  } catch (error: any) {
    console.error('Error fetching user goals:', error)
    return []
  }
}

// Investment Interests - trae TODOS los datos de la tabla interests
export async function getInvestmentInterests() {
  try {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching interests from Supabase:', error)
      // Fallback a datos mock si falla la consulta
      return [
        { id: '1', name: 'Acciones Locales', description: 'Empresas nicaragüenses', icon: '🇳🇮', category: 'stocks', risk_level: 'medium', popularity_score: 95 },
        { id: '2', name: 'Criptomonedas', description: 'Bitcoin, Ethereum, etc.', icon: '₿', category: 'crypto', risk_level: 'high', popularity_score: 85 },
        { id: '3', name: 'Acciones Extranjeras', description: 'Mercados internacionales', icon: '🌍', category: 'international_stocks', risk_level: 'medium', popularity_score: 90 },
        { id: '4', name: 'Depósitos a plazo', description: 'Inversiones seguras', icon: '🏦', category: 'deposits', risk_level: 'low', popularity_score: 80 },
        { id: '5', name: 'Inversión Inmobiliaria', description: 'Bienes raíces', icon: '🏠', category: 'real_estate', risk_level: 'medium', popularity_score: 85 },
        { id: '6', name: 'Educación Financiera', description: 'Aprender sobre finanzas', icon: '📚', category: 'education', risk_level: 'low', popularity_score: 75 },
        { id: '7', name: 'Fondos Mutuos', description: 'Portafolios diversificados', icon: '📊', category: 'mutual_funds', risk_level: 'medium', popularity_score: 70 },
        { id: '8', name: 'Startups', description: 'Empresas emergentes', icon: '🚀', category: 'startups', risk_level: 'high', popularity_score: 65 }
      ]
    }

    // Mapear datos de Supabase al formato esperado
    return data?.map((interest: any) => ({
      id: interest.id,
      name: interest.name,
      description: interest.description || '',
      icon: interest.icon || '💼', // Icono por defecto si no tiene
      category: interest.category || 'general',
      risk_level: 'medium', // Valor por defecto
      popularity_score: 50 // Valor por defecto
    })) || []

  } catch (error: any) {
    console.error('Error fetching investment interests:', error)
    return []
  }
}

export async function saveUserInterests(userId: string, interests: string[], experienceLevel?: string) {
  try {
    console.log('💾 Guardando intereses:', { userId, interests, experienceLevel })
    
    // Primero eliminar intereses anteriores
    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)
    
    if (deleteError) {
      console.log('⚠️ Error eliminando intereses anteriores (puede ser normal):', deleteError)
    }
    
    // Insertar nuevos intereses uno por uno
    const insertPromises = interests.map(interestId => 
      supabase
        .from('user_interests')
        .insert({
          user_id: userId,
          interest_id: interestId,
          experience_level: experienceLevel || 'beginner'
        })
    )
    
    const results = await Promise.all(insertPromises)
    
    // Verificar si hubo errores
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('❌ Errores al insertar intereses:', errors)
      throw errors[0].error
    }
    
    console.log('✅ Intereses guardados exitosamente')
    
    // Actualizar paso de onboarding
    await updateUser(userId, { onboarding_step: 'pick_knowledge' })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving user interests:', error)
    throw error
  }
}

// Knowledge Levels - usando datos mock ya que la columna level no existe
export async function getKnowledgeLevels() {
  try {
    // Retornar datos mock mientras se corrige la base de datos
    return [
      { id: '1', name: 'Principiante', description: 'Sin experiencia previa en inversiones', level_order: 1, requirements: 'Ninguno', next_steps: 'Aprender conceptos básicos' },
      { id: '2', name: 'Intermedio', description: 'Conocimientos básicos de inversión', level_order: 2, requirements: 'Conceptos básicos', next_steps: 'Diversificar portafolio' },
      { id: '3', name: 'Avanzado', description: 'Experiencia significativa en inversiones', level_order: 3, requirements: 'Portafolio diversificado', next_steps: 'Estrategias complejas' }
    ]
  } catch (error: any) {
    console.error('Error fetching knowledge levels:', error)
    return []
  }
}

export async function saveUserKnowledgeLevel(userId: string, level: string, specificAreas?: string[], learningGoals?: string[]) {
  try {
    // Guardar nivel de conocimiento usando upsert (actualiza si existe, inserta si no)
    const { error } = await supabase
      .from('user_knowledge')
      .upsert({
        user_id: userId,
        level: level,
        specific_areas: specificAreas || [],
        learning_goals: learningGoals || []
      }, {
        onConflict: 'user_id'
      })
    
    if (error) {
      console.error('Error upserting user knowledge:', error)
      throw error
    }
    
    // Actualizar paso de onboarding a completado
    await updateUser(userId, { onboarding_step: 'completed' })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving user knowledge level:', error)
    throw error
  }
}

// ===== RECOMMENDED COMMUNITIES BY GOALS =====

export async function getRecommendedCommunitiesByGoals(userId: string, limit = 10) {
  try {
    console.log('🎯 Obteniendo comunidades recomendadas para usuario:', userId)
    
    // Intentar con v3 (considera nivel de conocimiento)
    const { data: dataV3, error: errorV3 } = await supabase
      .rpc('get_recommended_communities_by_goals_v3', {
        p_user_id: userId,
        p_limit: limit
      })
    
    if (!errorV3 && dataV3 && dataV3.length > 0) {
      console.log('✅ Comunidades obtenidas con algoritmo v3:', dataV3.length)
      return dataV3
    }
    
    // Fallback a v2
    const { data: dataV2, error: errorV2 } = await supabase
      .rpc('get_recommended_communities_by_goals_v2', {
        p_user_id: userId,
        p_limit: limit
      })
    
    if (!errorV2 && dataV2 && dataV2.length > 0) {
      console.log('✅ Comunidades obtenidas con algoritmo v2:', dataV2.length)
      return dataV2
    }
    
    console.log('⚠️ Intentando con función original (v1)...')
    const { data, error } = await supabase
      .rpc('get_recommended_communities_by_goals', {
        p_user_id: userId,
        p_limit: limit
      })
    
    if (error) {
      console.error('❌ Error con función v1:', error)
      return []
    }
    
    console.log('✅ Comunidades obtenidas con algoritmo v1:', data?.length || 0)
    return data || []
  } catch (error: any) {
    console.error('❌ Error fetching recommended communities by goals:', error)
    return []
  }
}

// ===== ENHANCED COMMUNITY ENDPOINTS =====

// Get complete community details
export async function getCommunityDetailsComplete(communityId: string) {
  try {
    const response = await request("GET", "/communities", {
      params: {
        id: `eq.${communityId}`,
        select: "id,nombre,name,descripcion,icono_url,image_url,tipo,created_at,member_count,members:user_communities(count),posts:posts(count)"
      }
    })
    
    if (!response?.[0]) return null
    
    const community = response[0]
    return {
      id: community.id,
      name: community.nombre || community.name,
      description: community.descripcion,
      image_url: community.icono_url || community.image_url,
      cover_image_url: community.image_url || community.icono_url,
      is_public: community.tipo === 'public',
      member_count: community.member_count || community.members?.[0]?.count || 0,
      post_count: community.posts?.[0]?.count || 0,
      created_at: community.created_at,
      admin_users: community.admin_users?.map((admin: any) => ({
        id: admin.user?.id,
        name: admin.user?.nombre,
        avatar_url: admin.user?.avatar_url,
        role: admin.user?.role
      })) || [],
      engagement_stats: {
        daily_active_members: Math.floor(Math.random() * 50) + 10,
        weekly_posts: Math.floor(Math.random() * 100) + 20,
        average_response_time: '2h'
      }
    }
  } catch (error: any) {
    console.error('Error fetching complete community details:', error)
    return null
  }
}

// Get suggested people for user
export async function getSuggestedPeople(userId: string, limit = 10) {
  try {
    // Intentar con v2 primero (filtra mejor)
    const { data: dataV2, error: errorV2 } = await supabase
      .rpc('get_suggested_people_v2', {
        p_user_id: userId,
        p_limit: limit
      })
    
    if (!errorV2 && dataV2 && dataV2.length > 0) {
      console.log('✅ Personas sugeridas con algoritmo v2:', dataV2.length)
      return dataV2
    }
    
    // Fallback a función original
    const { data, error } = await supabase
      .rpc('get_suggested_people', {
        p_user_id: userId,
        p_limit: limit
      })
    
    if (error) {
      console.error('Error fetching suggested people:', error)
      return []
    }
    
    return data || []
  } catch (error: any) {
    console.error('Error fetching suggested people:', error)
    return []
  }
}

/**
 * Obtiene personas que comparten intereses con el usuario
 * 
 * @param userId - ID del usuario
 * @param limit - Número máximo de resultados (default: 10)
 * @returns Array de personas con intereses compartidos y score de coincidencia
 * 
 * USADO EN:
 * - PromotionsScreen (sección de personas sugeridas)
 * - CommunityRecommendationsScreen
 */
export async function getPeopleByInterests(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .rpc('get_people_by_shared_interests', {
        p_user_id: userId,
        p_limit: limit
      })
    
    if (error) {
      console.error('Error fetching people by interests:', error)
      return []
    }
    
    console.log('✅ Personas por intereses compartidos:', data?.length || 0)
    return data || []
  } catch (error: any) {
    console.error('Error fetching people by interests:', error)
    return []
  }
}

// Follow a user
export async function followUserNew(userId: string, targetUserId: string, source = 'suggestions') {
  try {
    return await request("POST", "/user_follows", {
      body: {
        follower_id: userId,
        following_id: targetUserId,
        source: source
      }
    })
  } catch (error: any) {
    if (error.code === "23505") return null // Already following
    throw error
  }
}

// ===== ENHANCED HOME FEED ENDPOINTS =====

// Get personalized feed with recommendations
export async function getPersonalizedFeedComplete(userId: string, limit = 20) {
  try {
    const [feedResponse, recommendationsResponse] = await Promise.all([
      getUserFeed(userId, limit),
      getRecommendations(userId)
    ])
    
    return {
      posts: feedResponse || [],
      recommendations: recommendationsResponse,
      user_segments: await getUserSegments(userId)
    }
  } catch (error: any) {
    console.error('Error fetching personalized feed:', error)
    return {
      posts: [],
      recommendations: { communities: [], people: [], content: [] },
      user_segments: []
    }
  }
}

// Get user recommendations
export async function getRecommendations(userId: string) {
  try {
    const [communities, people, content] = await Promise.all([
      getRecommendedCommunities(userId),
      getSuggestedPeople(userId, 5),
      getRecommendedContent(userId)
    ])
    
    return {
      communities: communities || [],
      people: people || [],
      content: content || []
    }
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return { communities: [], people: [], content: [] }
  }
}

// Get recommended content
export async function getRecommendedContent(userId: string) {
  try {
    const response = await request("GET", "/educational_content", {
      params: {
        select: "id,title,description,content_type,image_url,level",
        limit: "5",
        order: "created_at.desc"
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching recommended content:', error)
    return []
  }
}

// ===== USER NOTIFICATIONS =====

export async function getUserNotifications(userId: string, limit = 20) {
  try {
    const response = await request("GET", "/notifications", {
      params: {
        user_id: `eq.${userId}`,
        select: "id,type,title,message,is_read,action_url,created_at,actor:users!actor_id(id,nombre,avatar_url),target_object",
        order: "created_at.desc",
        limit: String(limit)
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    return await request("PATCH", "/notifications", {
      params: { id: `eq.${notificationId}` },
      body: { is_read: true }
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// ===== USER MESSAGES =====

export async function getUserConversations(userId: string) {
  try {
    const response = await request("GET", "/conversations", {
      params: {
        or: `(participant_one.eq.${userId},participant_two.eq.${userId})`,
        select: "id,type,last_message,updated_at,participant_one:users!participant_one(id,nombre,avatar_url,is_online),participant_two:users!participant_two(id,nombre,avatar_url,is_online)",
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
        select: "id,content,sender_id,message_type,media_url,is_read,created_at,sender:users!sender_id(id,nombre,avatar_url)",
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

// ===== MESSAGES_READS HELPERS =====

export async function getMessagesReadsForUser(userId: string) {
  try {
  const response = await request('GET', '/message_reads', {
      params: {
        user_id: `eq.${userId}`,
        select: 'conversation_id,user_id,last_read_at'
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching messages_reads:', error)
    return []
  }
}

//Contar mensajes no leídos para una conversación y usuario.
export async function countUnreadMessagesForConversation(conversationId: string, userId: string) {
  try {
  const reads = await request('GET', '/message_reads', {
      params: { conversation_id: `eq.${conversationId}`, user_id: `eq.${userId}`, select: 'last_read_at' }
    })
    const lastReadAt = (reads && reads[0] && reads[0].last_read_at) ? reads[0].last_read_at : null

    if (!lastReadAt) {
      const allMsgs = await request('GET', '/messages', { params: { conversation_id: `eq.${conversationId}`, select: 'id' } })
      return (allMsgs || []).length
    }

    // contar solo mensajes posteriores a last_read_at
    const unread = await request('GET', '/messages', {
      params: { conversation_id: `eq.${conversationId}`, created_at: `gt.${lastReadAt}`, select: 'id' }
    })
    return (unread || []).length
  } catch (error: any) {
    console.error('Error counting unread messages:', error)
    return 0
  }
}

//Marcar una conversación como leída para un usuario 
export async function markConversationAsRead(conversationId: string, userId: string) {
  try {
    // Intentar PATCH (si existe)
  await request('PATCH', '/message_reads', {
      params: { conversation_id: `eq.${conversationId}`, user_id: `eq.${userId}` },
      body: { last_read_at: new Date().toISOString() }
    })
    return true
  } catch (err: any) {
    // Si no existe la fila o hubo conflicto, intentar crearla
    try {
  await request('POST', '/message_reads', {
        body: { conversation_id: conversationId, user_id: userId, last_read_at: new Date().toISOString() }
      })
      return true
    } catch (err2: any) {
      console.error('Error marking conversation as read:', err2)
      return false
    }
  }
}

// ===== ADVANCED SEARCH =====

export async function advancedSearch(query: string, type = 'all', filters = {}, limit = 20) {
  try {
    const response = await request("POST", "/rpc/advanced_search", {
      body: {
        search_query: query,
        search_type: type,
        search_filters: filters,
        result_limit: limit
      }
    })
    return response || { users: [], posts: [], communities: [], total_results: 0 }
  } catch (error: any) {
    console.error('Error in advanced search:', error)
    return { users: [], posts: [], communities: [], total_results: 0 }
  }
}

// ===== QUICK ACTIONS =====

export async function performQuickAction(postId: string, action: string, userId: string, metadata: any = {}) {
  try {
    switch (action) {
      case 'like':
        return await likePost(postId, userId)
      case 'save':
        return await savePost(postId, userId)
      case 'share':
        return await sharePost(postId, userId, metadata)
      case 'report':
        return await reportPost(postId, userId, metadata.report_reason || 'inappropriate')
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error: any) {
    console.error(`Error performing ${action}:`, error)
    throw error
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    return await request("POST", "/saved_posts", {
      body: { post_id: postId, user_id: userId }
    })
  } catch (error: any) {
    if (error.code === "23505") return null // Already saved
    throw error
  }
}

export async function sharePost(postId: string, userId: string, metadata: any) {
  try {
    return await request("POST", "/post_shares", {
      body: {
        post_id: postId,
        user_id: userId,
        platform: metadata.share_platform || 'app',
        shared_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error sharing post:', error)
    throw error
  }
}

export async function reportPost(postId: string, userId: string, reason: string) {
  try {
    return await request("POST", "/post_reports", {
      body: {
        post_id: postId,
        reporter_id: userId,
        reason: reason,
        reported_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error reporting post:', error)
    throw error
  }
}

// ===== USER QUICK STATS =====

export async function getUserQuickStats(userId: string) {
  try {
    const response = await request("POST", "/rpc/get_user_quick_stats", {
      body: { p_user_id: userId }
    })
    return response || {
      notifications_count: 0,
      messages_count: 0,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      achievements: []
    }
  } catch (error: any) {
    console.error('Error fetching user quick stats:', error)
    return {
      notifications_count: 0,
      messages_count: 0,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      achievements: []
    }
  }
}

// ===== USER SEGMENTATION =====

export async function getUserSegments(userId: string) {
  try {
    const response = await request("GET", "/user_segments", {
      params: {
        user_id: `eq.${userId}`,
        select: "id,segment_type,segment_value,confidence_score,updated_at"
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching user segments:', error)
    return []
  }
}

export async function updateUserSegments(userId: string, segments: any[]) {
  try {
    // Delete existing segments
    await request("DELETE", "/user_segments", {
      params: { user_id: `eq.${userId}` }
    })
    
    // Insert new segments
    const segmentPromises = segments.map(segment =>
      request("POST", "/user_segments", {
        body: {
          user_id: userId,
          segment_type: segment.type,
          segment_value: segment.value,
          confidence_score: segment.confidence
        }
      })
    )
    
    return await Promise.all(segmentPromises)
  } catch (error: any) {
    console.error('Error updating user segments:', error)
    throw error
  }
}

// ===== PERSONALIZED CONTENT =====

export async function getPersonalizedContent(userId: string) {
  try {
    const response = await request("POST", "/rpc/get_personalized_content", {
      body: { p_user_id: userId }
    })
    return response || {
      educational_content: { articles: [], courses: [], videos: [] },
      investment_opportunities: { stocks: [], crypto: [], funds: [] },
      community_suggestions: [],
      expert_insights: [],
      trending_topics: []
    }
  } catch (error: any) {
    console.error('Error fetching personalized content:', error)
    return {
      educational_content: { articles: [], courses: [], videos: [] },
      investment_opportunities: { stocks: [], crypto: [], funds: [] },
      community_suggestions: [],
      expert_insights: [],
      trending_topics: []
    }
  }
}

// ===== BEHAVIOR TRACKING =====

export async function trackUserBehavior(userId: string, actionType: string, targetType: string, targetId: string, metadata = {}) {
  try {
    return await request("POST", "/user_behavior_tracking", {
      body: {
        user_id: userId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        metadata: metadata,
        created_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error tracking user behavior:', error)
    // Don't throw error for tracking, just log it
  }
}

// ===== INVESTOR PROFILE =====
interface InvestorProfile {
  id: string;
  user_id: string;
  experience_level: string;
  investment_goals: string[];
  risk_tolerance: string;
  preferred_investments: string[];
  created_at: string;
  updated_at: string;
  user?: any;
}

export const fetchInvestorProfile = async (userId: string): Promise<InvestorProfile> => {
  try {
    const { data, error } = await request('GET', `/investor_profile?user_id=eq.${userId}`)
    
    if (error) throw error
    
    // If no profile exists, return a default one
    if (!data || data.length === 0) {
      const user = await getCurrentUser()
      return {
        id: userId,
        user_id: userId,
        experience_level: 'beginner',
        investment_goals: [],
        risk_tolerance: 'medium',
        preferred_investments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: user || { id: userId, name: 'Inversionista' }
      }
    }
    
    // Get user data
    const userData = await getUserProfile(userId)
    
    return {
      ...data[0],
      user: userData
    }
  } catch (error) {
    console.error('Error fetching investor profile:', error)
    throw error
  }
}

// ===== ENDPOINTS CRÍTICOS FALTANTES =====

// CHAT Y MENSAJERÍA CORREGIDOS
export async function getUserConversationsFixed(userId: string) {
  try {
    const response = await request("POST", "/rpc/get_user_conversations", {
      body: { p_user_id: userId }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

export async function getConversationMessagesFixed(conversationId: string, limit = 50) {
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

export async function sendMessageFixed(conversationId: string, userId: string, content: string) {
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

// PLANIFICADOR FINANCIERO
export async function getUserBudgets(userId: string) {
  try {
    const response = await request("GET", "/user_budgets", {
      params: {
        user_id: `eq.${userId}`,
        select: "*",
        order: "created_at.desc"
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching budgets:', error)
    return []
  }
}

export async function createBudget(userId: string, budgetData: any) {
  try {
    return await request("POST", "/user_budgets", {
      body: {
        user_id: userId,
        ...budgetData
      }
    })
  } catch (error: any) {
    console.error('Error creating budget:', error)
    throw error
  }
}

export async function getUserTransactions(userId: string, filters: any = {}) {
  try {
    let params: any = {
      user_id: `eq.${userId}`,
      select: "*",
      order: "date.desc",
      limit: "50"
    }
    
    if (filters.category) {
      params.category = `eq.${filters.category}`
    }
    
    if (filters.type) {
      params.type = `eq.${filters.type}`
    }
    
    const response = await request("GET", "/user_transactions", { params })
    return response || []
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export async function createTransaction(userId: string, transactionData: any) {
  try {
    return await request("POST", "/user_transactions", {
      body: {
        user_id: userId,
        ...transactionData
      }
    })
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    throw error
  }
}

// PROMOCIONES MEJORADAS
export async function claimPromotion(promotionId: string, userId: string) {
  try {
    return await request("POST", "/promotion_claims", {
      body: {
        promotion_id: promotionId,
        user_id: userId,
        claimed_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    if (error.code === "23505") return null // Already claimed
    throw error
  }
}

export async function trackPromotionView(promotionId: string, userId: string) {
  try {
    return await request("POST", "/promotion_views", {
      body: {
        promotion_id: promotionId,
        user_id: userId,
        viewed_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error tracking promotion view:', error)
    // No throw error for tracking
  }
}

export async function getPromotionsByCategory(category: string, limit = 10) {
  try {
    const response = await request("GET", "/promotions", {
      params: {
        category: `eq.${category}`,
        active: "eq.true",
        select: "*",
        order: "created_at.desc",
        limit: String(limit)
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching promotions by category:', error)
    return []
  }
}

// Get promotions for user
export async function getPromotions(userId: string, searchQuery?: string) {
  try {
    const response = await request("GET", "/promotions", {
      params: {
        active: "eq.true",
        select: "*",
        order: "created_at.desc",
        limit: "10"
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching promotions:', error)
    return []
  }
}

// Get suggested communities
export async function getSuggestedCommunities(userId: string, limit = 5) {
  try {
    const response = await request("POST", "/rpc/get_suggested_communities", {
      body: { user_id_param: userId, limit_param: limit }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching suggested communities:', error)
    return []
  }
}

// Get recent posts
export async function getRecentPosts(userId: string, filter: string, limit = 10) {
  try {
    const response = await request("POST", "/rpc/get_recent_posts", {
      body: { 
        user_id_param: userId, 
        filter_param: filter,
        limit_param: limit 
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching recent posts:', error)
    return []
  }
}

// Connect with user
export async function connectWithUser(userId: string, targetUserId: string) {
  try {
    const response = await request("POST", "/user_connections", {
      body: {
        user_id: userId,
        target_user_id: targetUserId,
        status: 'pending'
      }
    })
    return response
  } catch (error: any) {
    console.error('Error connecting with user:', error)
    throw error
  }
}

// ESTADÍSTICAS RÁPIDAS
export async function getUserQuickStatsFixed(userId: string) {
  try {
    const response = await request("POST", "/rpc/get_user_quick_stats", {
      body: { p_user_id: userId }
    })
    return response || {
      notifications_count: 0,
      messages_count: 0,
      followers_count: 0,
      following_count: 0,
      posts_count: 0
    }
  } catch (error: any) {
    console.error('Error fetching user quick stats:', error)
    return {
      notifications_count: 0,
      messages_count: 0,
      followers_count: 0,
      following_count: 0,
      posts_count: 0
    }
  }
}

// CORREGIR UPLOAD DE IMÁGENES
export async function uploadPostMedia(userId: string, file: any) {
  try {
    const token = await SecureStore.getItemAsync("access_token")
    const fileExt = file.uri ? file.uri.split('.').pop() : 'jpg'
    const fileName = `posts/${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`
    
    // Crear FormData correctamente
    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'image/jpeg',
      name: fileName
    } as any)
    
    const response = await fetch(`${urls.STORAGE_URL}/object/post-media/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': ANON_KEY,
      },
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
    
    // Obtener URL pública
    const publicUrl = `${urls.STORAGE_URL}/object/public/post-media/${fileName}`
    return publicUrl
  } catch (error: any) {
    console.error('Error uploading post media:', error)
    throw error
  }
}

// ===== CREATE POST SCREEN - NEW ENDPOINTS =====

// Upload media to Supabase Storage
export async function uploadMedia(
  fileUri: string,
  kind: 'image' | 'video',
  userId: string
): Promise<{ url: string; mime: string; bytes: number }> {
  try {
    const token = await SecureStore.getItemAsync("access_token")
    if (!token) throw new Error('No auth token')

    // Get file info
    const fileExt = fileUri.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const folder = kind === 'image' ? 'images' : 'videos'
    const dateFolder = new Date().toISOString().split('T')[0]
    const fileName = `${folder}/${userId}/${dateFolder}/${timestamp}_${random}.${fileExt}`

    // Determine mime type
    let mimeType = 'application/octet-stream'
    if (kind === 'image') {
      mimeType = fileExt === 'png' ? 'image/png' : fileExt === 'gif' ? 'image/gif' : 'image/jpeg'
    } else if (kind === 'video') {
      mimeType = fileExt === 'mp4' ? 'video/mp4' : 'video/quicktime'
    }

    // Create form data
    const formData = new FormData()
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: fileName.split('/').pop(),
    } as any)

    // Upload to Supabase Storage
    const response = await fetch(`${urls.STORAGE_URL}/object/media/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': ANON_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload error:', errorText)
      throw new Error(`Upload failed: ${response.status}`)
    }

    // Get file size (approximate from URI if possible)
    let fileSize = 0
    try {
      const fileInfo = await fetch(fileUri, { method: 'HEAD' })
      const contentLength = fileInfo.headers.get('content-length')
      if (contentLength) fileSize = parseInt(contentLength, 10)
    } catch (e) {
      fileSize = 0
    }

    // Return public URL
    const publicUrl = `${urls.STORAGE_URL}/object/public/media/${fileName}`
    
    return {
      url: publicUrl,
      mime: mimeType,
      bytes: fileSize,
    }
  } catch (error: any) {
    console.error('Error uploading media:', error)
    throw error
  }
}

// List user communities with pagination and search
export async function listCommunitiesPaged(
  userId: string,
  q: string,
  page: number,
  pageSize: number = 20
): Promise<{ items: Array<{ id: string; name: string; image_url: string; member_count?: number }>; hasMore: boolean }> {
  try {
    const offset = (page - 1) * pageSize
    
    // Build query params
    let params: any = {
      select: 'community:communities(id,nombre,icono_url,members:user_communities(count))',
      user_id: `eq.${userId}`,
      offset: String(offset),
      limit: String(pageSize + 1), // Fetch one extra to check hasMore
      order: 'joined_at.desc',
    }

    // Add search filter if query provided
    if (q && q.trim()) {
      // Note: This requires the community name to be searchable
      // We'll filter client-side for now
    }

    const response = await request('GET', '/user_communities', { params })
    
    let items = (response || []).map((uc: any) => ({
      id: uc.community?.id,
      name: uc.community?.nombre,
      image_url: uc.community?.icono_url,
      member_count: uc.community?.members?.[0]?.count || 0,
    })).filter((c: any) => c.id)

    // Client-side search filter
    if (q && q.trim()) {
      const query = q.toLowerCase()
      items = items.filter((item: any) => 
        item.name?.toLowerCase().includes(query)
      )
    }

    // Check if there are more results
    const hasMore = items.length > pageSize
    if (hasMore) {
      items = items.slice(0, pageSize)
    }

    return { items, hasMore }
  } catch (error: any) {
    console.error('Error listing communities:', error)
    return { items: [], hasMore: false }
  }
}

// Create post with full support (media, poll, celebration, partnership)
export async function createPostFull(payload: {
  user_id: string
  content: string
  audience_type: 'profile' | 'community'
  audience_id?: string
  media?: Array<{ url: string; type: string; mime: string; size: number }>
  poll?: { options: string[]; duration_days: number }
  celebration?: { type: string }
  partnership?: { business_type: string; investment_amount: string; location: string }
}): Promise<{ id: string }> {
  try {
    // Try RPC first (if available)
    try {
      const response = await request('POST', '/rpc/create_post_with_children', {
        body: { payload: JSON.stringify(payload) }
      })
      return response
    } catch (rpcError) {
      console.log('RPC not available, using fallback')
    }

    // Fallback: Create post manually
    const postData: any = {
      user_id: payload.user_id,
      contenido: payload.content,
    }

    if (payload.audience_type === 'community' && payload.audience_id) {
      postData.community_id = payload.audience_id
    }

    const post = await createPost(postData)
    const postId = post?.id || post?.[0]?.id

    if (!postId) throw new Error('Failed to create post')

    // Add media if present
    if (payload.media && payload.media.length > 0) {
      for (const media of payload.media) {
        try {
          await request('POST', '/post_media', {
            body: {
              post_id: postId,
              media_url: media.url,
              media_type: media.type,
              mime_type: media.mime,
              file_size: media.size,
            }
          })
        } catch (e) {
          console.error('Error adding media:', e)
        }
      }
    }

    // Add poll if present
    if (payload.poll) {
      try {
        const pollResponse = await request('POST', '/polls', {
          body: {
            post_id: postId,
            duration_hours: payload.poll.duration_days * 24,
          }
        })
        const pollId = pollResponse?.id || pollResponse?.[0]?.id

        if (pollId) {
          for (let i = 0; i < payload.poll.options.length; i++) {
            await request('POST', '/poll_options', {
              body: {
                poll_id: pollId,
                option_text: payload.poll.options[i],
                option_order: i + 1,
              }
            })
          }
        }
      } catch (e) {
        console.error('Error adding poll:', e)
      }
    }

    // Add celebration if present
    if (payload.celebration) {
      try {
        await request('POST', '/post_celebrations', {
          body: {
            post_id: postId,
            celebration_type: payload.celebration.type,
          }
        })
      } catch (e) {
        console.error('Error adding celebration:', e)
      }
    }

    // Add partnership if present
    if (payload.partnership) {
      try {
        await request('POST', '/post_partnerships', {
          body: {
            post_id: postId,
            business_type: payload.partnership.business_type,
            investment_amount: payload.partnership.investment_amount,
            location: payload.partnership.location,
          }
        })
      } catch (e) {
        console.error('Error adding partnership:', e)
      }
    }

    return { id: postId }
  } catch (error: any) {
    console.error('Error creating full post:', error)
    throw error
  }
}

// Draft management (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage'

const DRAFT_KEY = 'create_post_draft'

export async function saveDraft(draft: {
  content: string
  audience?: any
  media?: any[]
  poll?: any
  celebration?: any
  partnership?: any
}): Promise<void> {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

export async function loadDraft(): Promise<any | null> {
  try {
    const draft = await AsyncStorage.getItem(DRAFT_KEY)
    return draft ? JSON.parse(draft) : null
  } catch (error) {
    console.error('Error loading draft:', error)
    return null
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY)
  } catch (error) {
    console.error('Error clearing draft:', error)
  }
}

export { request }
