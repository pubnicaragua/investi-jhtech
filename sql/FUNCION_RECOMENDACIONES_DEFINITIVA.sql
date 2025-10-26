-- ============================================================================
-- FUNCIÓN DEFINITIVA DE RECOMENDACIONES DE PERSONAS
-- ============================================================================
-- Esta función reemplaza todas las versiones anteriores (v1, v2, v3, v4)
-- Usa un sistema de scoring basado en:
-- - País (10 puntos)
-- - Nivel financiero (5 puntos)
-- - Intereses comunes (3 puntos por interés)
-- - Metas comunes (3 puntos por meta)
-- ============================================================================

-- Eliminar versiones anteriores
DROP FUNCTION IF EXISTS get_suggested_people(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v2(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v3(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v4(UUID, INT);
DROP FUNCTION IF EXISTS get_recommended_people(UUID, INT);
DROP FUNCTION IF EXISTS get_people_by_interests(UUID, INT);

-- Crear función definitiva
CREATE OR REPLACE FUNCTION get_recommended_people_final(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  nombre TEXT,
  username TEXT,
  avatar_url TEXT,
  photo_url TEXT,
  bio TEXT,
  role TEXT,
  pais TEXT,
  nivel_finanzas TEXT,
  intereses UUID[],
  score_total INT,
  score_pais INT,
  score_nivel INT,
  score_intereses INT,
  score_metas INT,
  intereses_comunes INT,
  metas_comunes INT
) AS $$
DECLARE
  v_user_pais TEXT;
  v_user_nivel TEXT;
  v_user_intereses UUID[];
  v_user_metas UUID[];
BEGIN
  -- Obtener datos del usuario actual
  SELECT 
    u.pais,
    u.nivel_finanzas,
    u.intereses,
    COALESCE(array_agg(DISTINCT ug.goal_id) FILTER (WHERE ug.goal_id IS NOT NULL), ARRAY[]::UUID[])
  INTO 
    v_user_pais,
    v_user_nivel,
    v_user_intereses,
    v_user_metas
  FROM users u
  LEFT JOIN user_goals ug ON ug.user_id = u.id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.pais, u.nivel_finanzas, u.intereses;

  -- Retornar usuarios recomendados con scoring
  RETURN QUERY
  WITH candidate_users AS (
    SELECT DISTINCT
      u.id,
      u.full_name,
      u.nombre,
      u.username,
      u.avatar_url,
      u.photo_url,
      u.bio,
      u.role,
      u.pais,
      u.nivel_finanzas,
      u.intereses,
      
      -- Score por país (10 puntos)
      CASE 
        WHEN u.pais = v_user_pais AND u.pais IS NOT NULL THEN 10 
        ELSE 0 
      END as score_pais,
      
      -- Score por nivel financiero (5 puntos)
      CASE 
        WHEN u.nivel_finanzas = v_user_nivel 
         AND u.nivel_finanzas IS NOT NULL 
         AND u.nivel_finanzas != 'none' THEN 5 
        ELSE 0 
      END as score_nivel,
      
      -- Calcular intereses comunes
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM unnest(u.intereses) AS interest 
         WHERE interest = ANY(v_user_intereses)),
        0
      ) as intereses_comunes,
      
      -- Calcular metas comunes
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM user_goals ug 
         WHERE ug.user_id = u.id 
           AND ug.goal_id = ANY(v_user_metas)),
        0
      ) as metas_comunes
      
    FROM users u
    WHERE u.id != p_user_id
      -- Solo usuarios con onboarding completo
      AND u.onboarding_step = 'completed'
      -- Solo usuarios con avatar
      AND (u.avatar_url IS NOT NULL OR u.photo_url IS NOT NULL)
      -- Excluir usuarios ya conectados
      AND NOT EXISTS (
        SELECT 1 
        FROM connections c 
        WHERE (c.user_id = p_user_id AND c.connected_user_id = u.id AND c.status = 'accepted')
           OR (c.connected_user_id = p_user_id AND c.user_id = u.id AND c.status = 'accepted')
      )
      -- Excluir usuarios que ya sigues
      AND NOT EXISTS (
        SELECT 1 
        FROM user_follows uf 
        WHERE uf.follower_id = p_user_id AND uf.followed_id = u.id
      )
  )
  SELECT 
    cu.id,
    cu.full_name,
    cu.nombre,
    cu.username,
    cu.avatar_url,
    cu.photo_url,
    cu.bio,
    cu.role,
    cu.pais,
    cu.nivel_finanzas,
    cu.intereses,
    -- Score total
    (cu.score_pais + cu.score_nivel + (cu.intereses_comunes * 3) + (cu.metas_comunes * 3))::INT as score_total,
    cu.score_pais::INT,
    cu.score_nivel::INT,
    (cu.intereses_comunes * 3)::INT as score_intereses,
    (cu.metas_comunes * 3)::INT as score_metas,
    cu.intereses_comunes,
    cu.metas_comunes
  FROM candidate_users cu
  WHERE 
    -- Al menos debe tener algo en común
    (cu.score_pais > 0 OR cu.score_nivel > 0 OR cu.intereses_comunes > 0 OR cu.metas_comunes > 0)
  ORDER BY 
    -- Ordenar por score total, luego por intereses comunes, luego aleatorio
    score_total DESC,
    cu.intereses_comunes DESC,
    cu.metas_comunes DESC,
    RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Crear índices para optimizar la función
CREATE INDEX IF NOT EXISTS idx_users_onboarding_step ON users(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_users_pais ON users(pais) WHERE pais IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_nivel_finanzas ON users(nivel_finanzas) WHERE nivel_finanzas IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_goal_id ON user_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user_id, connected_user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_follows_pair ON user_follows(follower_id, followed_id);

-- Comentarios sobre la función
COMMENT ON FUNCTION get_recommended_people_final IS 
'Función definitiva para recomendar personas basada en scoring:
- País: 10 puntos
- Nivel financiero: 5 puntos  
- Intereses comunes: 3 puntos cada uno
- Metas comunes: 3 puntos cada una
Excluye usuarios ya conectados y seguidos.
Requiere onboarding completo y avatar.';
