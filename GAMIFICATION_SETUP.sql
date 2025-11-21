-- ============================================
-- SISTEMA DE GAMIFICACIÓN COMPLETO - INVESTÍ
-- ============================================
-- Ejecutar en Supabase SQL Editor
-- Tiempo estimado: 5 minutos

-- ============================================
-- 1. TABLA: educational_tools (Verificar estructura)
-- ============================================
-- Primero verificamos si existe y la estructura correcta
CREATE TABLE IF NOT EXISTS educational_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  route TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar herramienta de extracción de cartola
INSERT INTO educational_tools (title, description, icon, route, is_premium, order_index)
VALUES (
  'Extractor de Cartola',
  'Convierte tus estados de cuenta en reportes profesionales con el logo de Investí',
  '📄',
  'CartolaExtractor',
  false,
  (SELECT COALESCE(MAX(order_index), 0) + 1 FROM educational_tools)
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. TABLAS: Metas Financieras y Progreso
-- ============================================
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  next_level_xp INTEGER NOT NULL DEFAULT 1000,
  achievements_count INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABLA: Logros y Misiones
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  category TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 4. TABLA: Misiones Diarias/Semanales
-- ============================================
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL,
  mission_description TEXT,
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 50,
  period TEXT DEFAULT 'weekly' CHECK (period IN ('daily', 'weekly', 'monthly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ÍNDICES para mejor rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(user_id, status);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

-- Políticas para financial_goals
DROP POLICY IF EXISTS "Users can view own financial goals" ON financial_goals;
CREATE POLICY "Users can view own financial goals" ON financial_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own financial goals" ON financial_goals;
CREATE POLICY "Users can insert own financial goals" ON financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own financial goals" ON financial_goals;
CREATE POLICY "Users can update own financial goals" ON financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own financial goals" ON financial_goals;
CREATE POLICY "Users can delete own financial goals" ON financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_progress
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para achievements (todos pueden ver)
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Políticas para user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_missions
DROP POLICY IF EXISTS "Users can view own missions" ON user_missions;
CREATE POLICY "Users can view own missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own missions" ON user_missions;
CREATE POLICY "Users can update own missions" ON user_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. LOGROS PREDEFINIDOS
-- ============================================
INSERT INTO achievements (code, title, description, icon, xp_reward, category, requirement_type, requirement_value) VALUES
-- Paso 1: Unirse a comunidades
('join_first_community', 'Primera Comunidad', 'Únete a tu primera comunidad', '🏘️', 100, 'social', 'join_communities', 1),
('join_three_communities', 'Explorador Social', 'Únete a 3 comunidades', '🌟', 250, 'social', 'join_communities', 3),
('join_five_communities', 'Networker Pro', 'Únete a 5 comunidades', '👥', 500, 'social', 'join_communities', 5),

-- Paso 2: Crear posts en comunidades
('first_community_post', 'Primera Publicación', 'Crea tu primer post en una comunidad', '✍️', 150, 'engagement', 'community_posts', 1),
('post_in_three_communities', 'Comunicador Activo', 'Publica en 3 comunidades diferentes', '📢', 300, 'engagement', 'community_posts', 3),

-- Paso 3: Posts semanales
('weekly_poster', 'Publicador Semanal', 'Publica 2 posts en una semana', '📅', 200, 'engagement', 'weekly_posts', 2),
('consistent_poster', 'Creador Consistente', 'Publica 2 posts por semana durante 4 semanas', '🔥', 800, 'engagement', 'monthly_posts', 8),

-- Paso 4: Encuestas
('first_poll', 'Primera Encuesta', 'Crea tu primera encuesta', '📊', 100, 'engagement', 'create_polls', 1),
('poll_master', 'Maestro de Encuestas', 'Crea 5 encuestas', '🎯', 500, 'engagement', 'create_polls', 5),
('weekly_poll_voter', 'Votante Activo', 'Vota en 3 encuestas en una semana', '🗳️', 150, 'engagement', 'vote_polls', 3),

-- Educación
('first_video', 'Aprendiz Curioso', 'Mira tu primer video educativo', '🎥', 100, 'education', 'watch_videos', 1),
('video_enthusiast', 'Entusiasta del Aprendizaje', 'Mira 10 videos educativos', '📚', 500, 'education', 'watch_videos', 10),
('course_starter', 'Inicio de Curso', 'Comienza tu primer curso', '🎓', 200, 'education', 'start_courses', 1),
('course_completer', 'Graduado', 'Completa tu primer curso', '🏆', 1000, 'education', 'complete_courses', 1),

-- Finanzas
('first_goal', 'Primera Meta', 'Establece tu primera meta financiera', '🎯', 150, 'finance', 'set_goals', 1),
('goal_achiever', 'Cumplidor de Metas', 'Completa tu primera meta financiera', '💰', 500, 'finance', 'complete_goals', 1),
('savings_starter', 'Ahorrador Principiante', 'Ahorra C$1,000', '🐷', 300, 'finance', 'total_savings', 1000),
('savings_master', 'Maestro del Ahorro', 'Ahorra C$10,000', '💎', 1500, 'finance', 'total_savings', 10000),

-- Social
('first_like', 'Primera Recomendación', 'Dale like a un post', '👍', 50, 'social', 'like_posts', 1),
('active_liker', 'Apoyo Activo', 'Dale like a 50 posts', '❤️', 300, 'social', 'like_posts', 50),
('first_comment', 'Primera Opinión', 'Comenta en un post', '💬', 75, 'social', 'comment_posts', 1),
('conversation_starter', 'Iniciador de Conversaciones', 'Comenta en 25 posts', '🗨️', 400, 'social', 'comment_posts', 25),

-- Racha
('streak_3_days', 'Racha de 3 Días', 'Mantén una racha de 3 días', '🔥', 200, 'streak', 'daily_streak', 3),
('streak_7_days', 'Semana Completa', 'Mantén una racha de 7 días', '⭐', 500, 'streak', 'daily_streak', 7),
('streak_30_days', 'Mes Completo', 'Mantén una racha de 30 días', '🌟', 2000, 'streak', 'daily_streak', 30)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 8. FUNCIÓN: Calcular XP y Nivel
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level_from_xp(current_xp INTEGER)
RETURNS TABLE(level INTEGER, next_level_xp INTEGER) AS $$
BEGIN
  -- Fórmula: Nivel = floor(sqrt(XP / 100)) + 1
  -- XP necesario para siguiente nivel = (nivel actual)^2 * 100
  level := FLOOR(SQRT(current_xp::FLOAT / 100.0))::INTEGER + 1;
  next_level_xp := (level * level) * 100;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. FUNCIÓN: Otorgar XP al usuario
-- ============================================
CREATE OR REPLACE FUNCTION grant_xp_to_user(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_next_level_xp INTEGER;
BEGIN
  -- Obtener XP actual o crear registro si no existe
  INSERT INTO user_progress (user_id, xp, level, next_level_xp)
  VALUES (p_user_id, 0, 1, 1000)
  ON CONFLICT (user_id) DO NOTHING;

  -- Actualizar XP
  UPDATE user_progress
  SET xp = xp + p_xp_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- Calcular nuevo nivel
  SELECT * INTO v_new_level, v_next_level_xp
  FROM calculate_level_from_xp(v_new_xp);

  -- Actualizar nivel si cambió
  UPDATE user_progress
  SET level = v_new_level,
      next_level_xp = v_next_level_xp
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. FUNCIÓN: Verificar y otorgar logros
-- ============================================
CREATE OR REPLACE FUNCTION check_and_grant_achievement(
  p_user_id UUID,
  p_achievement_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_xp_reward INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Verificar si ya tiene el logro
  SELECT EXISTS(
    SELECT 1 FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = p_user_id AND a.code = p_achievement_code
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN FALSE;
  END IF;

  -- Obtener ID y recompensa del logro
  SELECT id, xp_reward INTO v_achievement_id, v_xp_reward
  FROM achievements
  WHERE code = p_achievement_code AND is_active = true;

  IF v_achievement_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Otorgar logro
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id);

  -- Incrementar contador de logros
  UPDATE user_progress
  SET achievements_count = achievements_count + 1
  WHERE user_id = p_user_id;

  -- Otorgar XP
  PERFORM grant_xp_to_user(p_user_id, v_xp_reward, 'Achievement: ' || p_achievement_code);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. FUNCIÓN: Actualizar racha diaria
-- ============================================
CREATE OR REPLACE FUNCTION update_daily_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
BEGIN
  -- Obtener última actividad
  SELECT last_activity_date, streak_days INTO v_last_activity, v_current_streak
  FROM user_progress
  WHERE user_id = p_user_id;

  -- Si es el primer día o no hay registro
  IF v_last_activity IS NULL THEN
    UPDATE user_progress
    SET streak_days = 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    RETURN;
  END IF;

  -- Si ya registró actividad hoy, no hacer nada
  IF v_last_activity = CURRENT_DATE THEN
    RETURN;
  END IF;

  -- Si fue ayer, incrementar racha
  IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_progress
    SET streak_days = streak_days + 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- Verificar logros de racha
    v_current_streak := v_current_streak + 1;
    IF v_current_streak = 3 THEN
      PERFORM check_and_grant_achievement(p_user_id, 'streak_3_days');
    ELSIF v_current_streak = 7 THEN
      PERFORM check_and_grant_achievement(p_user_id, 'streak_7_days');
    ELSIF v_current_streak = 30 THEN
      PERFORM check_and_grant_achievement(p_user_id, 'streak_30_days');
    END IF;
  ELSE
    -- Racha rota, reiniciar
    UPDATE user_progress
    SET streak_days = 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. TRIGGERS: Automáticos para logros
-- ============================================

-- Trigger: Al unirse a una comunidad
CREATE OR REPLACE FUNCTION trigger_community_join()
RETURNS TRIGGER AS $$
DECLARE
  v_community_count INTEGER;
BEGIN
  -- Contar comunidades activas del usuario
  SELECT COUNT(*) INTO v_community_count
  FROM user_communities
  WHERE user_id = NEW.user_id AND status = 'active';

  -- Verificar logros
  IF v_community_count = 1 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'join_first_community');
  ELSIF v_community_count = 3 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'join_three_communities');
  ELSIF v_community_count = 5 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'join_five_communities');
  END IF;

  -- Actualizar racha
  PERFORM update_daily_streak(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_community_join ON user_communities;
CREATE TRIGGER on_community_join
  AFTER INSERT ON user_communities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_community_join();

-- Trigger: Al crear un post
CREATE OR REPLACE FUNCTION trigger_post_creation()
RETURNS TRIGGER AS $$
DECLARE
  v_post_count INTEGER;
  v_community_post_count INTEGER;
BEGIN
  -- Otorgar XP por crear post
  PERFORM grant_xp_to_user(NEW.user_id, 50, 'Created post');

  -- Si es post en comunidad
  IF NEW.community_id IS NOT NULL THEN
    -- Contar posts en comunidades
    SELECT COUNT(DISTINCT community_id) INTO v_community_post_count
    FROM posts
    WHERE user_id = NEW.user_id AND community_id IS NOT NULL;

    IF v_community_post_count = 1 THEN
      PERFORM check_and_grant_achievement(NEW.user_id, 'first_community_post');
    ELSIF v_community_post_count = 3 THEN
      PERFORM check_and_grant_achievement(NEW.user_id, 'post_in_three_communities');
    END IF;
  END IF;

  -- Actualizar racha
  PERFORM update_daily_streak(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_creation ON posts;
CREATE TRIGGER on_post_creation
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_post_creation();

-- Trigger: Al dar like
CREATE OR REPLACE FUNCTION trigger_post_like()
RETURNS TRIGGER AS $$
DECLARE
  v_like_count INTEGER;
BEGIN
  -- Contar likes del usuario
  SELECT COUNT(*) INTO v_like_count
  FROM post_likes
  WHERE user_id = NEW.user_id;

  IF v_like_count = 1 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'first_like');
  ELSIF v_like_count = 50 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'active_liker');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_like ON post_likes;
CREATE TRIGGER on_post_like
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_post_like();

-- Trigger: Al comentar
CREATE OR REPLACE FUNCTION trigger_comment_creation()
RETURNS TRIGGER AS $$
DECLARE
  v_comment_count INTEGER;
BEGIN
  -- Otorgar XP
  PERFORM grant_xp_to_user(NEW.user_id, 25, 'Created comment');

  -- Contar comentarios
  SELECT COUNT(*) INTO v_comment_count
  FROM comments
  WHERE user_id = NEW.user_id;

  IF v_comment_count = 1 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'first_comment');
  ELSIF v_comment_count = 25 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'conversation_starter');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_creation ON comments;
CREATE TRIGGER on_comment_creation
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_comment_creation();

-- Trigger: Al establecer meta financiera
CREATE OR REPLACE FUNCTION trigger_financial_goal_creation()
RETURNS TRIGGER AS $$
DECLARE
  v_goal_count INTEGER;
BEGIN
  -- Contar metas
  SELECT COUNT(*) INTO v_goal_count
  FROM financial_goals
  WHERE user_id = NEW.user_id;

  IF v_goal_count = 1 THEN
    PERFORM check_and_grant_achievement(NEW.user_id, 'first_goal');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_financial_goal_creation ON financial_goals;
CREATE TRIGGER on_financial_goal_creation
  AFTER INSERT ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_financial_goal_creation();

-- ============================================
-- 13. VISTA: Resumen de progreso del usuario
-- ============================================
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
  up.user_id,
  up.level,
  up.xp,
  up.next_level_xp,
  up.achievements_count,
  up.streak_days,
  COUNT(DISTINCT uc.community_id) as communities_joined,
  COUNT(DISTINCT p.id) as total_posts,
  COUNT(DISTINCT CASE WHEN p.community_id IS NOT NULL THEN p.id END) as community_posts,
  COUNT(DISTINCT fg.id) as financial_goals_count,
  0 as completed_goals_count
FROM user_progress up
LEFT JOIN user_communities uc ON up.user_id = uc.user_id AND uc.status = 'active'
LEFT JOIN posts p ON up.user_id = p.user_id
LEFT JOIN financial_goals fg ON up.user_id = fg.user_id
GROUP BY up.user_id, up.level, up.xp, up.next_level_xp, up.achievements_count, up.streak_days;

-- ============================================
-- ✅ INSTALACIÓN COMPLETADA
-- ============================================
-- Ejecuta este script completo en Supabase SQL Editor
-- Todas las tablas, funciones y triggers están listos
