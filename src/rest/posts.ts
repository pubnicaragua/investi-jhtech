/**
 * ============================================================================
 * POSTS.TS - FUNCIONES RELACIONADAS CON POSTS Y CONTENIDO
 * ============================================================================
 * Este archivo contiene todas las funciones relacionadas con posts,
 * comentarios, likes y contenido en general.
 */

// Re-exportar funciones base necesarias
export { request, getCurrentUser, supabase } from './api'

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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
  return await request("POST", "/posts", { body: data })
}

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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
 * Elimina un like de un post
 *
 * @param post_id - ID del post
 * @param user_id - ID del usuario
 * @returns Resultado de la operación
 *
 * USADO EN:
 * - PostCard component
 * - PromotionsScreen
 */
export async function unlikePost(post_id: string, user_id: string) {
  const { request, supabase } = await import('./api')
  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', post_id)
      .eq('user_id', user_id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error unliking post:', error)
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
  const { request } = await import('./api')
  return await request("POST", "/comments", {
    body: { post_id, user_id, contenido, parent_id: parent_id || null },
  })
}
