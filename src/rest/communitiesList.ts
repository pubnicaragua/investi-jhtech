/**
 * ============================================================================
 * COMMUNITIES LIST API - CommunitiesScreen
 * ============================================================================
 * API específica para la pantalla de listado de comunidades
 * 100% Backend Driven - Sin datos hardcodeados
 * ============================================================================
 */

import { supabase } from '../supabase'

export interface CommunityListItem {
  id: string
  name: string
  description: string | null
  image_url: string | null
  cover_image_url: string | null
  banner_url: string | null
  member_count: number
  post_count: number
  is_public: boolean
  category: string | null
  created_at: string
  tipo: string | null
}

/**
 * Obtiene la lista completa de comunidades con detalles enriquecidos
 * Usado en: CommunitiesScreen
 */
export async function getCommunitiesWithDetails(): Promise<CommunityListItem[]> {
  try {
    console.log('🔵 [getCommunitiesWithDetails] Obteniendo comunidades...')

    const { data, error } = await supabase
      .from('communities')
      .select(`
        id,
        nombre,
        name,
        descripcion,
        icono_url,
        image_url,
        tipo,
        created_at,
        member_count
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [getCommunitiesWithDetails] Error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('⚠️ [getCommunitiesWithDetails] No hay comunidades')
      return []
    }

    // Enriquecer con conteos de miembros y posts
    const enrichedCommunities = await Promise.all(
      data.map(async (community: any) => {
        try {
          // Contar miembros
          const { count: memberCount } = await supabase
            .from('community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', community.id)

          // Contar posts
          const { count: postCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', community.id)

          return {
            id: community.id,
            name: community.nombre || community.name,
            description: community.descripcion,
            image_url: community.icono_url || community.image_url,
            cover_image_url: community.image_url || community.icono_url,
            banner_url: community.image_url || community.icono_url,
            member_count: memberCount || community.member_count || 0,
            post_count: postCount || 0,
            is_public: community.tipo !== 'private',
            category: community.tipo,
            created_at: community.created_at,
            tipo: community.tipo,
          }
        } catch (error) {
          console.error(`❌ Error enriqueciendo comunidad ${community.id}:`, error)
          // Retornar datos básicos si falla el enriquecimiento
          return {
            id: community.id,
            name: community.nombre || community.name,
            description: community.descripcion,
            image_url: community.icono_url || community.image_url,
            cover_image_url: community.image_url || community.icono_url,
            banner_url: community.image_url || community.icono_url,
            member_count: community.member_count || 0,
            post_count: 0,
            is_public: community.tipo !== 'private',
            category: community.tipo,
            created_at: community.created_at,
            tipo: community.tipo,
          }
        }
      })
    )

    console.log(`✅ [getCommunitiesWithDetails] ${enrichedCommunities.length} comunidades obtenidas`)
    return enrichedCommunities

  } catch (error) {
    console.error('❌ [getCommunitiesWithDetails] Error fatal:', error)
    throw error
  }
}

/**
 * Verifica si un usuario ya es miembro de una comunidad
 * Usado en: CommunitiesScreen (para el estado de botón "Unido")
 */
export async function checkUserMembership(userId: string, communityId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select('id')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .maybeSingle()

    if (error) {
      console.error('❌ [checkUserMembership] Error:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('❌ [checkUserMembership] Error fatal:', error)
    return false
  }
}

/**
 * Obtiene las comunidades a las que el usuario ya está unido
 * Usado en: CommunitiesScreen (para marcar como "Unido")
 */
export async function getUserJoinedCommunities(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ [getUserJoinedCommunities] Error:', error)
      return []
    }

    return (data || []).map((item: any) => item.community_id)
  } catch (error) {
    console.error('❌ [getUserJoinedCommunities] Error fatal:', error)
    return []
  }
}

/**
 * Une a un usuario a una comunidad
 * Usado en: CommunitiesScreen (animación de puerta)
 */
export async function joinCommunityOptimized(userId: string, communityId: string): Promise<boolean> {
  try {
    console.log('🔵 [joinCommunityOptimized] Uniendo usuario:', { userId, communityId })

    // Verificar si ya es miembro
    const isMember = await checkUserMembership(userId, communityId)
    if (isMember) {
      console.log('⚠️ [joinCommunityOptimized] Usuario ya es miembro')
      return true
    }

    // Insertar membresía
    const { error } = await supabase
      .from('community_members')
      .insert({
        user_id: userId,
        community_id: communityId,
        role: 'member',
        joined_at: new Date().toISOString(),
      })

    if (error) {
      console.error('❌ [joinCommunityOptimized] Error:', error)
      return false
    }

    console.log('✅ [joinCommunityOptimized] Usuario unido exitosamente')
    return true
  } catch (error) {
    console.error('❌ [joinCommunityOptimized] Error fatal:', error)
    return false
  }
}
