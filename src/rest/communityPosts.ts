/**
 * ============================================================================
 * COMMUNITY POSTS.TS - FUNCIONES RELACIONADAS CON POSTS DE COMUNIDAD
 * ============================================================================
 * Este archivo contiene todas las funciones relacionadas con posts específicos
 * de comunidad, comentarios, likes y contenido de comunidad.
 */

import { request, getCurrentUser, supabase } from './api'

/**
 * ⚠️ FUNCIÓN CRÍTICA - Obtiene posts de una comunidad específica
 *
 * @param communityId - ID de la comunidad
 * @param limit - Número máximo de posts a retornar (default: 20)
 * @returns Array de posts con datos del autor
 *
 * MAPEO DE CAMPOS:
 * - contenido → content
 * - likes_count → likes
 * - comment_count → comments
 * - shares_count → shares
 * - media_url → media
 * - users.nombre/full_name/username → author.name
 * - users.photo_url/avatar_url → author.avatar
 * - users.role → author.role
 *
 * USADO EN:
 * - CommunityDetailScreen (tab "Posts" - posts específicos de comunidad)
 *
 * ⚠️ IMPORTANTE: Esta función usa la nueva tabla community_post
 */
export async function getCommunityPosts(communityId: string, limit = 20) {
  const { request } = await import('./api')
  try {
    const response = await request("GET", "/community_post", {
      params: {
        community_id: `eq.${communityId}`,
        select: "id,contenido,created_at,likes_count,comment_count,shares_count,user_id,media_url,is_pinned,pinned_at,users!community_post_user_id_fkey(id,nombre,full_name,username,photo_url,avatar_url,role)",
        order: "is_pinned.desc,created_at.desc",
        limit: String(limit),
      },
    })

    return (response || []).map((post: any) => ({
      id: post.id,
      content: post.contenido,
      created_at: post.created_at,
      likes: post.likes_count || 0,
      comments: post.comment_count || 0,
      shares: post.shares_count || 0,
      media: post.media_url || [],
      is_pinned: post.is_pinned || false,
      pinned_at: post.pinned_at,
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
 * Crea un nuevo post en una comunidad específica
 *
 * @param data - Datos del post
 * @param data.community_id - ID de la comunidad
 * @param data.user_id - ID del usuario autor
 * @param data.contenido - Contenido del post
 * @param data.media_url - URLs de medios adjuntos (opcional)
 * @returns Post creado
 *
 * USADO EN:
 * - CommunityDetailScreen
 * - CreateCommunityPostScreen
 */
export async function createCommunityPost(data: {
  community_id: string
  user_id: string
  contenido: string
  media_url?: string[]
}) {
  const { request } = await import('./api')
  return await request("POST", "/community_post", {
    body: {
      ...data,
      media_url: data.media_url || []
    }
  })
}

/**
 * ⚠️ FUNCIÓN CRÍTICA - Obtiene el detalle de un post de comunidad
 *
 * @param postId - ID del post
 * @returns Post con detalles completos o null
 *
 * USADO EN:
 * - CommunityPostDetailScreen
 */
export async function getCommunityPostDetail(postId: string) {
  const { request } = await import('./api')
  try {
    // Paso 1: Obtener el post
    const response = await request("GET", "/community_post", {
      params: {
        id: `eq.${postId}`,
        select: "id,contenido,created_at,likes_count,comment_count,shares_count,user_id,media_url,community_id,is_pinned,pinned_at,users!community_post_user_id_fkey(id,nombre,full_name,username,photo_url,avatar_url,role)",
      },
    })

    if (!response || response.length === 0) return null

    const post = response[0]

    // Paso 2: Obtener comentarios con sus autores
    const commentsResponse = await request("GET", "/community_post_comments", {
      params: {
        community_post_id: `eq.${postId}`,
        select: "id,contenido,created_at,user_id,parent_id",
        order: "created_at.asc"
      }
    })

    // Paso 3: Obtener usuarios de los comentarios
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

    const user = post.users
    return {
      ...post,
      content: post.contenido,
      likes: post.likes_count,
      comment_count: post.comment_count,
      shares: post.shares_count,
      media: post.media_url,
      author: {
        id: user?.id,
        username: user?.username || user?.full_name || user?.nombre || 'Usuario',
        photo_url: user?.photo_url || user?.avatar_url || 'https://ui-avatars.com/api/?name=User',
        role: user?.role || 'Usuario'
      },
      comments: commentsWithUsers
    }
  } catch (error) {
    console.error('getCommunityPostDetail error:', error)
    return null
  }
}

/**
 * Da like/dislike a un post de comunidad
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @param is_like - true para like, false para dislike (default: true)
 * @returns Like creado o null si ya existía
 *
 * USADO EN:
 * - CommunityPostCard component
 * - CommunityPostDetailScreen
 */
export async function likeCommunityPost(post_id: string, user_id: string, is_like = true) {
  const { request } = await import('./api')
  try {
    return await request("POST", "/community_post_likes", {
      body: { community_post_id: post_id, user_id, is_like },
    })
  } catch (error: any) {
    if (error.code === "23505") return null // Ya dio like
    return null
  }
}

/**
 * Elimina un like de un post de comunidad
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @returns Resultado de la operación
 *
 * USADO EN:
 * - CommunityPostCard component
 */
export async function unlikeCommunityPost(post_id: string, user_id: string) {
  const { request, supabase } = await import('./api')
  try {
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('community_post_id', post_id)
      .eq('user_id', user_id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error unliking community post:', error)
    return null
  }
}

/**
 * Crea un comentario en un post de comunidad
 * Soporta comentarios anidados (respuestas)
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @param contenido - Contenido del comentario
 * @param parent_id - ID del comentario padre (para respuestas)
 * @returns Comentario creado
 *
 * USADO EN:
 * - CommunityPostDetailScreen
 * - CommunityCommentSection component
 */
export async function commentCommunityPost(post_id: string, user_id: string, contenido: string, parent_id?: string) {
  const { request } = await import('./api')
  return await request("POST", "/community_post_comments", {
    body: { community_post_id: post_id, user_id, contenido, parent_id: parent_id || null },
  })
}

/**
 * Guarda un post de comunidad
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @returns Save creado
 *
 * USADO EN:
 * - CommunityPostCard component
 */
export async function saveCommunityPost(post_id: string, user_id: string) {
  const { request } = await import('./api')
  try {
    return await request("POST", "/community_post_saves", {
      body: { community_post_id: post_id, user_id },
    })
  } catch (error: any) {
    if (error.code === "23505") return null // Ya guardado
    return null
  }
}

/**
 * Elimina un save de un post de comunidad
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @returns Resultado de la operación
 *
 * USADO EN:
 * - CommunityPostCard component
 */
export async function unsaveCommunityPost(post_id: string, user_id: string) {
  const { request, supabase } = await import('./api')
  try {
    const { error } = await supabase
      .from('community_post_saves')
      .delete()
      .eq('community_post_id', post_id)
      .eq('user_id', user_id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error unsaving community post:', error)
    return null
  }
}

/**
 * Comparte un post de comunidad
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @returns Share creado
 *
 * USADO EN:
 * - CommunityPostCard component
 */
export async function shareCommunityPost(post_id: string, user_id: string) {
  const { request } = await import('./api')
  return await request("POST", "/community_post_shares", {
    body: { community_post_id: post_id, user_id },
  })
}

/**
 * Actualiza un post de comunidad (solo el autor)
 *
 * @param post_id - ID del post
 * @param data - Datos a actualizar
 * @returns Post actualizado
 *
 * USADO EN:
 * - EditCommunityPostScreen
 */
export async function updateCommunityPost(post_id: string, data: {
  contenido?: string
  media_url?: string[]
}) {
  const { request } = await import('./api')
  return await request("PATCH", `/community_post?id=eq.${post_id}`, {
    body: data
  })
}

/**
 * Elimina un post de comunidad (solo el autor)
 *
 * @param post_id - ID del post
 * @returns Resultado de la operación
 *
 * USADO EN:
 * - CommunityPostDetailScreen
 */
export async function deleteCommunityPost(post_id: string) {
  const { request } = await import('./api')
  return await request("DELETE", `/community_post?id=eq.${post_id}`)
}

/**
 * Fija o desfija un post de comunidad (solo moderadores/admins)
 *
 * @param post_id - ID del post
 * @param pinned - true para fijar, false para desfijar
 * @param user_id - ID del usuario que realiza la acción
 * @returns Post actualizado
 *
 * USADO EN:
 * - CommunityModerationScreen
 */
export async function togglePinCommunityPost(post_id: string, pinned: boolean, user_id: string) {
  const { request } = await import('./api')
  return await request("PATCH", `/community_post?id=eq.${post_id}`, {
    body: {
      is_pinned: pinned,
      pinned_by: pinned ? user_id : null,
      pinned_at: pinned ? new Date().toISOString() : null
    }
  })
}

/**
 * Obtiene posts guardados de una comunidad por el usuario
 *
 * @param user_id - ID del usuario
 * @param community_id - ID de la comunidad (opcional)
 * @param limit - Número máximo de posts (default: 20)
 * @returns Array de posts guardados
 *
 * USADO EN:
 * - SavedCommunityPostsScreen
 */
export async function getSavedCommunityPosts(user_id: string, community_id?: string, limit = 20) {
  const { request } = await import('./api')
  try {
    let params: any = {
      user_id: `eq.${user_id}`,
      select: "id,community_post_id,created_at,community_post(id,contenido,created_at,likes_count,comment_count,shares_count,media_url,community_id,is_pinned,users!community_post_user_id_fkey(id,nombre,full_name,username,photo_url,avatar_url,role))",
      order: "created_at.desc",
      limit: String(limit)
    }

    if (community_id) {
      params['community_post.community_id'] = `eq.${community_id}`
    }

    const response = await request("GET", "/community_post_saves", { params })

    return (response || []).map((save: any) => ({
      save_id: save.id,
      saved_at: save.created_at,
      post: {
        id: save.community_post.id,
        content: save.community_post.contenido,
        created_at: save.community_post.created_at,
        likes: save.community_post.likes_count || 0,
        comments: save.community_post.comment_count || 0,
        shares: save.community_post.shares_count || 0,
        media: save.community_post.media_url || [],
        is_pinned: save.community_post.is_pinned || false,
        community_id: save.community_post.community_id,
        author: {
          id: save.community_post.users?.id,
          name: save.community_post.users?.full_name || save.community_post.users?.nombre || save.community_post.users?.username || 'Usuario',
          avatar: save.community_post.users?.avatar_url || save.community_post.users?.photo_url || 'https://i.pravatar.cc/100',
          role: save.community_post.users?.role || 'Financiero'
        }
      }
    }))
  } catch (error: any) {
    console.error('Error fetching saved community posts:', error)
    return []
  }
}
