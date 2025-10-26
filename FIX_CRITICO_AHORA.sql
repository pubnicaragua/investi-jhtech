-- ============================================================================
-- FIX CRÍTICO: Función de recomendaciones con tipos correctos
-- ============================================================================

DROP FUNCTION IF EXISTS get_recommended_people_final(UUID, INT);

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
  nivel_finanzas TEXT,
  intereses UUID[],
  score_total INT,
  score_nivel INT,
  score_intereses INT,
  score_metas INT,
  intereses_comunes INT,
  metas_comunes INT
) AS $$
DECLARE
  v_user_nivel finance_level;
  v_user_intereses UUID[];
  v_user_metas UUID[];
BEGIN
  -- Obtener datos del usuario actual
  SELECT 
    COALESCE(u.nivel_finanzas, 'none'::finance_level),
    COALESCE(u.intereses, ARRAY[]::UUID[]),
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
      COALESCE(u.intereses, ARRAY[]::UUID[]) as intereses,
      
      -- Score por nivel financiero (10 puntos)
      CASE 
        WHEN u.nivel_finanzas = v_user_nivel
         AND u.nivel_finanzas IS NOT NULL 
         AND u.nivel_finanzas != 'none'::finance_level THEN 10 
        ELSE 0 
      END as score_nivel,
      
      -- Calcular intereses comunes (comparar UUID con UUID)
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM unnest(COALESCE(u.intereses, ARRAY[]::UUID[])) AS user_interest 
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
    -- Al menos debe tener algo en común O tener datos completos
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

-- Verificar que funciona
SELECT 'Función corregida' as status;

-- Probar con un usuario (reemplaza con tu ID)
-- SELECT * FROM get_recommended_people_final('17e255b9-5f66-4740-9b74-26b5693b3dee', 10);
