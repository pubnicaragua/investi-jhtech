-- ============================================================================
-- EJECUTAR AHORA - TODAS LAS CORRECCIONES
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


-- 2. FUNCIÓN DEFINITIVA DE RECOMENDACIONES (CORREGIDA)
-- ============================================================================
DROP FUNCTION IF EXISTS get_recommended_people_final(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v2(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v3(UUID, INT);
DROP FUNCTION IF EXISTS get_suggested_people_v4(UUID, INT);
DROP FUNCTION IF EXISTS get_recommended_people(UUID, INT);

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
      
      CASE 
        WHEN u.nivel_finanzas = v_user_nivel
         AND u.nivel_finanzas IS NOT NULL 
         AND u.nivel_finanzas != 'none'::finance_level THEN 10 
        ELSE 0 
      END as score_nivel,
      
      COALESCE(
        (SELECT COUNT(*)::INT 
         FROM unnest(u.intereses) AS interest 
         WHERE interest = ANY(v_user_intereses)
         AND array_length(v_user_intereses, 1) > 0),
        0
      ) as intereses_comunes,
      
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

CREATE INDEX IF NOT EXISTS idx_users_onboarding_step ON users(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_users_nivel_finanzas ON users(nivel_finanzas) WHERE nivel_finanzas IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_goal_id ON user_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_pair ON user_follows(follower_id, followed_id);


-- 3. TRIGGER PARA ACTUALIZAR LIKES_COUNT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_likes_count ON post_likes;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- Recalcular likes_count existentes
UPDATE posts p
SET likes_count = (
  SELECT COUNT(*)
  FROM post_likes pl
  WHERE pl.post_id = p.id
);


-- 4. VERIFICAR RESULTADOS
-- ============================================================================
SELECT 'CORRECCIONES APLICADAS EXITOSAMENTE' as status;

-- Ver usuarios actualizados
SELECT COUNT(*) as usuarios_actualizados
FROM users 
WHERE full_name NOT IN ('Usuario', 'Test Auth User');

-- Probar función de recomendaciones (reemplaza con tu user_id)
-- SELECT * FROM get_recommended_people_final('c7812eb1-c3b1-429f-aabe-ba8da052201f', 20);
