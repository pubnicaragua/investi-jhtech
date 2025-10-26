-- ============================================================================
-- CORRECCIONES FINALES - Sistema de Recomendaciones
-- ============================================================================

-- 1. ACTUALIZAR NOMBRES GENÉRICOS
-- ============================================================================
UPDATE users 
SET full_name = COALESCE(username, SPLIT_PART(email, '@', 1)),
    nombre = COALESCE(username, SPLIT_PART(email, '@', 1))
WHERE full_name IN ('Usuario', 'Test Auth User', 'usuario', 'test auth user')
   OR nombre IN ('Usuario', 'Test Auth User', 'usuario', 'test auth user')
   OR full_name IS NULL
   OR nombre IS NULL;


-- 2. VERIFICAR TABLA user_connections (ya existe, no crear)
-- ============================================================================
-- La tabla user_connections ya existe en la BD
-- No es necesario crearla de nuevo


-- 3. FUNCIÓN DEFINITIVA DE RECOMENDACIONES (SIN PAÍS)
-- ============================================================================
-- Eliminar versiones anteriores
DROP FUNCTION IF EXISTS get_recommended_people_final(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v2(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v3(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v4(UUID, INT);
DROP FUNCTION IF EXISTS get_recommended_people(UUID, INT);

-- Crear función definitiva SIN scoring por país
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
    u.nivel_finanzas,
    u.intereses,
    COALESCE(array_agg(DISTINCT ug.goal_id) FILTER (WHERE ug.goal_id IS NOT NULL), ARRAY[]::UUID[])
  INTO 
    v_user_nivel,
    v_user_intereses,
    v_user_metas
  FROM users u
  LEFT JOIN user_goals ug ON ug.user_id = u.id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.nivel_finanzas, u.intereses;

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
      u.nivel_finanzas,
      u.intereses,
      
      -- Score por nivel financiero (10 puntos)
      CASE 
        WHEN u.nivel_finanzas = v_user_nivel::finance_level
         AND u.nivel_finanzas IS NOT NULL 
         AND u.nivel_finanzas != 'none'::finance_level THEN 10 
        ELSE 0 
      END as score_nivel,
      
      -- Calcular intereses comunes
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM unnest(u.intereses) AS interest 
         WHERE interest = ANY(v_user_intereses)
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
      -- Solo usuarios con onboarding completo
      AND u.onboarding_step = 'completed'
      -- Solo usuarios con avatar
      AND (u.avatar_url IS NOT NULL OR u.photo_url IS NOT NULL)
      -- Excluir usuarios ya seguidos
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
    cu.nivel_finanzas,
    cu.intereses,
    -- Score total (SIN país)
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

-- Crear índices para optimizar
CREATE INDEX IF NOT EXISTS idx_users_onboarding_step ON users(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_users_nivel_finanzas ON users(nivel_finanzas) WHERE nivel_finanzas IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_goal_id ON user_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_pair ON user_follows(follower_id, followed_id);

COMMENT ON FUNCTION get_recommended_people_final IS 
'Función definitiva para recomendar personas basada en scoring SIN país:
- Nivel financiero: 10 puntos
- Intereses comunes: 5 puntos cada uno
- Metas comunes: 5 puntos cada una
Excluye usuarios ya seguidos.
Requiere onboarding completo y avatar.';


-- 4. VERIFICAR RESULTADOS
-- ============================================================================
-- Ver usuarios actualizados
SELECT 
  id, 
  full_name, 
  nombre, 
  username, 
  email
FROM users 
WHERE full_name NOT IN ('Usuario', 'Test Auth User')
ORDER BY full_name
LIMIT 20;

-- Probar función de recomendaciones
SELECT * FROM get_recommended_people_final('c7812eb1-c3b1-429f-aabe-ba8da052201f', 20);
