/**
 * ============================================================================
 * USERS.TS - FUNCIONES RELACIONADAS CON USUARIOS
 * ============================================================================
 * Este archivo contiene todas las funciones relacionadas con usuarios,
 * búsqueda, perfiles y operaciones de usuario.
 */

// Re-exportar funciones base necesarias
export { request, getCurrentUser } from './api'

/**
 * Busca usuarios por nombre, username o bio
 *
 * @param query - Término de búsqueda
 * @returns Array de usuarios que coinciden con la búsqueda
 *
 * USADO EN:
 * - SearchScreen
 * - CommunityMembersScreen (invitar usuarios)
 * - User search functionality
 */
export async function searchUsers(query: string) {
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
