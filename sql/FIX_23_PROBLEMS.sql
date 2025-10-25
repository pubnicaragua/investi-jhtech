-- =====================================================
-- SOLUCIÓN 23 PROBLEMAS CRÍTICOS
-- =====================================================

-- PROBLEMA 1: CommunityRecommendations - nombres usuarios
-- Crear función para obtener personas recomendadas con nombres reales
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

-- PROBLEMA 2: Guardar post duplicado - agregar constraint si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_posts_user_id_post_id_key'
  ) THEN
    ALTER TABLE saved_posts ADD CONSTRAINT saved_posts_user_id_post_id_key UNIQUE (user_id, post_id);
  END IF;
END $$;

-- PROBLEMA 6: Notificaciones sin columna title
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;

-- Actualizar notificaciones existentes sin title
UPDATE notifications 
SET title = CASE 
  WHEN type = 'follow' THEN 'Nuevo seguidor'
  WHEN type = 'like' THEN 'Le gustó tu publicación'
  WHEN type = 'comment' THEN 'Nuevo comentario'
  WHEN type = 'mention' THEN 'Te mencionaron'
  WHEN type = 'connection' THEN 'Nueva conexión'
  ELSE 'Notificación'
END
WHERE title IS NULL;

-- PROBLEMA 8: MarketInfo - Agregar tabla para portafolio simulado
CREATE TABLE IF NOT EXISTS user_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  quantity DECIMAL(10, 4) DEFAULT 0,
  purchase_price DECIMAL(10, 2) DEFAULT 0,
  current_price DECIMAL(10, 2) DEFAULT 0,
  purchase_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stock_symbol)
);

CREATE INDEX IF NOT EXISTS idx_user_portfolio_user ON user_portfolio(user_id);

-- Tabla para simulaciones de inversión
CREATE TABLE IF NOT EXISTS investment_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  initial_amount DECIMAL(10, 2) NOT NULL,
  shares DECIMAL(10, 4) NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  profit_loss DECIMAL(10, 2),
  profit_loss_percent DECIMAL(5, 2),
  status TEXT DEFAULT 'active', -- active, closed
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_simulations_user ON investment_simulations(user_id);

-- PROBLEMA 10: 3 herramientas nuevas importantes
INSERT INTO educational_tools (id, title, description, icon, route, is_premium, order_index, is_active) VALUES
('10000000-0000-0000-0001-000000000007', 'Calculadora de Interés Compuesto', 'Calcula el crecimiento de tus inversiones con interés compuesto', '💹', 'CalculadoraInteres', false, 7, true),
('10000000-0000-0000-0001-000000000008', 'Simulador de Jubilación', 'Planifica cuánto necesitas ahorrar para tu retiro', '🏖️', 'SimuladorJubilacion', false, 8, true),
('10000000-0000-0000-0001-000000000009', 'Comparador de Inversiones', 'Compara diferentes opciones de inversión lado a lado', '⚖️', 'ComparadorInversiones', false, 9, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  route = EXCLUDED.route,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

-- PROBLEMA 11: Foto de portada en perfil
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- PROBLEMA 13: Mejorar sistema de seguimientos con notificaciones
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

-- PROBLEMA 19: GroupChat - Agregar campos reales para miembros
ALTER TABLE communities ADD COLUMN IF NOT EXISTS active_members_count INT DEFAULT 0;

-- Función para actualizar miembros activos (últimos 7 días)
CREATE OR REPLACE FUNCTION update_active_members_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities
  SET active_members_count = (
    SELECT COUNT(DISTINCT uc.user_id)
    FROM user_communities uc
    LEFT JOIN community_posts cp ON cp.user_id = uc.user_id AND cp.community_id = uc.community_id
    WHERE uc.community_id = NEW.community_id
      AND (cp.created_at > NOW() - INTERVAL '7 days' OR uc.joined_at > NOW() - INTERVAL '7 days')
  )
  WHERE id = NEW.community_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PROBLEMA 22: EditCommunity - Asegurar que tags funcione
ALTER TABLE communities ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_communities_tags ON communities USING GIN(tags);

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own portfolio" ON user_portfolio;
CREATE POLICY "Users can manage their own portfolio" ON user_portfolio
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own simulations" ON investment_simulations;
CREATE POLICY "Users can manage their own simulations" ON investment_simulations
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para verificar si un usuario ya sigue a otro
CREATE OR REPLACE FUNCTION is_following(follower_id_param UUID, followed_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_follows 
    WHERE follower_id = follower_id_param 
      AND followed_id = followed_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener conteo de seguidores vs contactos
CREATE OR REPLACE FUNCTION get_user_connections_count(user_id_param UUID)
RETURNS TABLE (
  followers_count BIGINT,
  following_count BIGINT,
  mutual_connections_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_follows WHERE followed_id = user_id_param) as followers_count,
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = user_id_param) as following_count,
    (SELECT COUNT(*) FROM user_follows uf1
     WHERE uf1.follower_id = user_id_param
       AND EXISTS (
         SELECT 1 FROM user_follows uf2 
         WHERE uf2.follower_id = uf1.followed_id 
           AND uf2.followed_id = user_id_param
       )
    ) as mutual_connections_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
