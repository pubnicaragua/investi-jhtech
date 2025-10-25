-- Corregir función get_suggested_people_v2
-- Error: column reference "user_id" is ambiguous

-- Primero eliminar la función existente
DROP FUNCTION IF EXISTS get_suggested_people_v2(UUID, INT);

-- Recrear con la firma correcta
CREATE OR REPLACE FUNCTION get_suggested_people_v2(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  photo_url TEXT,
  bio TEXT,
  role TEXT,
  shared_interests INT
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
    u.role,
    COUNT(DISTINCT ui2.interest_id)::INT as shared_interests
  FROM users u
  LEFT JOIN user_interests ui2 ON u.id = ui2.user_id
  LEFT JOIN user_interests ui1 ON ui1.interest_id = ui2.interest_id AND ui1.user_id = p_user_id
  WHERE u.id != p_user_id
    AND u.id NOT IN (
      SELECT following_id 
      FROM user_follows 
      WHERE follower_id = p_user_id
    )
  GROUP BY u.id, u.nombre, u.full_name, u.username, u.avatar_url, u.photo_url, u.bio, u.role
  ORDER BY shared_interests DESC, RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
