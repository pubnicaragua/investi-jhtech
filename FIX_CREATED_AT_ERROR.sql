-- ============================================================================
-- FIX: created_at no existe en users
-- ============================================================================
-- El campo correcto es fecha_registro, no created_at

-- 1. Verificar si la función existe y tiene el error
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name LIKE '%recommended_people%' 
AND routine_schema = 'public';

-- 2. Recrear la función get_recommended_people_final usando fecha_registro
CREATE OR REPLACE FUNCTION get_recommended_people_final(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  photo_url TEXT,
  bio TEXT,
  location TEXT,
  intereses_comunes INTEGER,
  metas_comunes INTEGER,
  score_total INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    u.id,
    u.nombre,
    u.full_name,
    u.username,
    u.avatar_url,
    u.photo_url,
    u.bio,
    u.location,
    COALESCE(
      (SELECT COUNT(*)::INTEGER 
       FROM unnest(u.intereses) AS ui(interes)
       JOIN unnest((SELECT intereses FROM users WHERE id = p_user_id)) AS mi(interes) 
       ON ui.interes = mi.interes), 
      0
    ) AS intereses_comunes,
    COALESCE(
      (SELECT COUNT(*)::INTEGER 
       FROM user_goals ug1
       JOIN user_goals ug2 ON ug1.goal_id = ug2.goal_id
       WHERE ug1.user_id = u.id AND ug2.user_id = p_user_id), 
      0
    ) AS metas_comunes,
    (
      COALESCE(
        (SELECT COUNT(*)::INTEGER 
         FROM unnest(u.intereses) AS ui(interes)
         JOIN unnest((SELECT intereses FROM users WHERE id = p_user_id)) AS mi(interes) 
         ON ui.interes = mi.interes), 
        0
      ) * 2 +
      COALESCE(
        (SELECT COUNT(*)::INTEGER 
         FROM user_goals ug1
         JOIN user_goals ug2 ON ug1.goal_id = ug2.goal_id
         WHERE ug1.user_id = u.id AND ug2.user_id = p_user_id), 
        0
      ) * 3
    ) AS score_total
  FROM users u
  WHERE u.id != p_user_id
    AND u.id NOT IN (
      SELECT following_id 
      FROM user_follows 
      WHERE follower_id = p_user_id
    )
  ORDER BY score_total DESC, u.fecha_registro DESC  -- USAR fecha_registro en lugar de created_at
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Verificar que funciona
SELECT * FROM get_recommended_people_final(
  (SELECT id FROM users LIMIT 1),
  5
);

-- ============================================================================
-- RESULTADO ESPERADO:
-- ✅ La función ahora usa fecha_registro en lugar de created_at
-- ✅ No más error: "column users.created_at does not exist"
-- ============================================================================
