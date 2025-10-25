-- =====================================================
-- ARREGLAR ERRORES DE FIX_23_PROBLEMS.sql
-- =====================================================

-- ERROR 1: Column "interests" no existe
-- Agregar columna interests si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- ERROR 2: Column "followed_id" no existe en user_follows
-- Verificar estructura de user_follows y crear si no existe
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, followed_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);

-- Ahora sí, crear la función get_recommended_people
CREATE OR REPLACE FUNCTION get_recommended_people(user_id_param UUID, limit_param INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  nombre TEXT,
  username TEXT,
  avatar_url TEXT,
  photo_url TEXT,
  profession TEXT,
  role TEXT,
  bio TEXT,
  interests TEXT[],
  expertise_areas TEXT[],
  mutual_connections INT,
  compatibility_score INT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.nombre,
    u.username,
    u.avatar_url,
    u.photo_url,
    u.profession,
    u.role,
    u.bio,
    u.interests,
    ARRAY[]::TEXT[] as expertise_areas,
    0 as mutual_connections,
    75 as compatibility_score,
    'Intereses similares' as reason
  FROM users u
  WHERE u.id != user_id_param
    AND u.id NOT IN (
      SELECT followed_id FROM user_follows WHERE follower_id = user_id_param
    )
    AND (
      u.interests && (SELECT interests FROM users WHERE id = user_id_param)
      OR u.role = (SELECT role FROM users WHERE id = user_id_param)
    )
  ORDER BY RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificaciones de seguimiento
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, related_user_id, created_at)
  VALUES (
    NEW.followed_id,
    'follow',
    'Nuevo seguidor',
    (SELECT COALESCE(full_name, nombre, username, 'Alguien') FROM users WHERE id = NEW.follower_id) || ' comenzó a seguirte',
    NEW.follower_id,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_follow ON user_follows;
CREATE TRIGGER trigger_notify_on_follow
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION notify_on_follow();

COMMIT;
