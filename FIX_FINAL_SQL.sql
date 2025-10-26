-- ============================================================================
-- FIX FINAL - EJECUTAR EN SUPABASE
-- ============================================================================

-- 1. ELIMINAR función antigua
DROP FUNCTION IF EXISTS get_recommended_people_final(UUID, INTEGER);

-- 2. CREAR función nueva (sin created_at)
CREATE OR REPLACE FUNCTION get_recommended_people_final(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
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
  nivel_finanzas TEXT,
  intereses TEXT[],
  score_total INT,
  score_nivel INT,
  score_intereses INT,
  score_metas INT,
  intereses_comunes INT,
  metas_comunes INT
) AS $$
DECLARE
  v_user_nivel finance_level;
  v_user_intereses TEXT[];
  v_user_metas UUID[];
BEGIN
  -- Obtener datos del usuario actual
  SELECT 
    COALESCE(u.nivel_finanzas, 'none'::finance_level),
    COALESCE(u.intereses, ARRAY[]::TEXT[]),
    COALESCE(array_agg(DISTINCT ug.goal_id) FILTER (WHERE ug.goal_id IS NOT NULL), ARRAY[]::UUID[])
  INTO 
    v_user_nivel,
    v_user_intereses,
    v_user_metas
  FROM users u
  LEFT JOIN user_goals ug ON ug.user_id = u.id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.nivel_finanzas, u.intereses;

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
      u.nivel_finanzas,
      COALESCE(u.intereses, ARRAY[]::TEXT[]) as intereses,
      
      -- Score por nivel financiero
      CASE 
        WHEN u.nivel_finanzas = v_user_nivel
         AND u.nivel_finanzas IS NOT NULL 
         AND u.nivel_finanzas != 'none'::finance_level THEN 10 
        ELSE 0 
      END as score_nivel,
      
      -- Calcular intereses comunes
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM unnest(COALESCE(u.intereses, ARRAY[]::TEXT[])) AS user_interest 
         WHERE user_interest = ANY(v_user_intereses)
         AND array_length(v_user_intereses, 1) > 0),
        0
      ) as intereses_comunes,
      
      -- Calcular metas comunes
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM user_goals ug 
         WHERE ug.user_id = u.id 
           AND ug.goal_id = ANY(v_user_metas)
           AND array_length(v_user_metas, 1) > 0),
        0
      ) as metas_comunes
      
    FROM users u
    WHERE u.id != p_user_id
      AND u.onboarding_step = 'completed'
      AND (u.avatar_url IS NOT NULL OR u.photo_url IS NOT NULL)
      AND NOT EXISTS (
        SELECT 1 
        FROM user_follows uf 
        WHERE uf.follower_id = p_user_id AND uf.following_id = u.id
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
    cu.nivel_finanzas::TEXT,
    cu.intereses,
    (cu.score_nivel + (cu.intereses_comunes * 5) + (cu.metas_comunes * 5))::INT as score_total,
    cu.score_nivel::INT,
    (cu.intereses_comunes * 5)::INT as score_intereses,
    (cu.metas_comunes * 5)::INT as score_metas,
    cu.intereses_comunes,
    cu.metas_comunes
  FROM candidate_users cu
  WHERE 
    (cu.score_nivel > 0 OR cu.intereses_comunes > 0 OR cu.metas_comunes > 0)
    OR (cu.intereses IS NOT NULL AND array_length(cu.intereses, 1) > 0)
  ORDER BY 
    score_total DESC,
    cu.intereses_comunes DESC,
    cu.metas_comunes DESC,
    RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- RESULTADO: ✅ Función recreada sin error de created_at
-- ============================================================================
