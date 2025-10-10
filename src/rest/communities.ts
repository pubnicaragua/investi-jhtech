/**
 * ============================================================================
 * COMMUNITIES.TS - FUNCIONES RELACIONADAS CON COMUNIDADES
 * ============================================================================
 * Este archivo contiene todas las funciones relacionadas con comunidades,
 * canales, membresía y gestión de comunidades.
 */

// Re-exportar funciones base necesarias
export { request, getCurrentUser } from './api'

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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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

/**
 * Crear comunidad
 */
export async function createCommunity(data: { nombre: string; descripcion?: string; tipo?: string; icono_url?: string; banner_url?: string; created_by?: string }) {
  const { request } = await import('./api')
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
  const { request } = await import('./api')
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
