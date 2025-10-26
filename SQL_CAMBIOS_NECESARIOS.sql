-- ============================================================================
-- SQL CAMBIOS NECESARIOS - 25 de Octubre de 2025
-- ============================================================================
-- Ejecutar estos cambios en Supabase para resolver errores

-- ============================================================================
-- 1. AGREGAR COLUMNA invited_by_user_id A community_invitations
-- ============================================================================
-- ERROR: Could not find the 'invited_by_user_id' column of 'community_invitations'

ALTER TABLE community_invitations 
ADD COLUMN invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Crear índice para mejorar performance
CREATE INDEX idx_community_invitations_invited_by 
ON community_invitations(invited_by_user_id);

-- ============================================================================
-- 2. VERIFICAR TABLA community_join_requests (para PendingRequests)
-- ============================================================================
-- Asegurar que existe la tabla con la estructura correcta

CREATE TABLE IF NOT EXISTS community_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_community_join_requests_community 
ON community_join_requests(community_id);

CREATE INDEX IF NOT EXISTS idx_community_join_requests_user 
ON community_join_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_community_join_requests_status 
ON community_join_requests(status);

-- ============================================================================
-- 3. VERIFICAR TABLA community_blocked_users (para BlockedUsers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(community_id, blocked_user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_community_blocked_users_community 
ON community_blocked_users(community_id);

CREATE INDEX IF NOT EXISTS idx_community_blocked_users_blocked 
ON community_blocked_users(blocked_user_id);

-- ============================================================================
-- 4. VERIFICAR TABLA lessons (para LessonDetail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  video_url VARCHAR(500),
  duration INTEGER DEFAULT 0,
  lesson_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_lessons_course 
ON lessons(course_id);

CREATE INDEX IF NOT EXISTS idx_lessons_order 
ON lessons(lesson_order);

-- ============================================================================
-- 5. CREAR TABLA user_lesson_progress (para tracking de lecciones)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user 
ON user_lesson_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson 
ON user_lesson_progress(lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_completed 
ON user_lesson_progress(completed);

-- ============================================================================
-- 6. HABILITAR RLS (Row Level Security) SI NO ESTÁ HABILITADO
-- ============================================================================

-- Para community_join_requests
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view join requests for their communities"
ON community_join_requests FOR SELECT
USING (
  community_id IN (
    SELECT id FROM communities 
    WHERE created_by = auth.uid()
  )
);

-- Para community_blocked_users
ALTER TABLE community_blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view blocked users in their communities"
ON community_blocked_users FOR SELECT
USING (
  community_id IN (
    SELECT id FROM communities 
    WHERE created_by = auth.uid()
  )
);

-- Para user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON user_lesson_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
ON user_lesson_progress FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================
-- 7. CREAR POSTS DE EJEMPLO EN COMUNIDAD c7812eb1-c3b1-429f-aabe-ba8da052201f
-- ============================================================================
-- NOTA: Esta tabla debe existir en tu BD. Si no existe, crear primero.
-- Los posts se pueden crear manualmente desde la app.

-- ============================================================================
-- 8. VERIFICAR INTEGRIDAD DE DATOS
-- ============================================================================

-- Contar registros en tablas críticas
SELECT 'community_invitations' as tabla, COUNT(*) as total FROM community_invitations
UNION ALL
SELECT 'community_join_requests', COUNT(*) FROM community_join_requests
UNION ALL
SELECT 'community_blocked_users', COUNT(*) FROM community_blocked_users
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'user_lesson_progress', COUNT(*) FROM user_lesson_progress;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Ejecutar estos cambios en orden
-- 2. Verificar que no hay errores después de cada cambio
-- 3. Si hay errores de "already exists", significa que ya está creado
-- 4. Los índices mejoran la performance de las consultas
-- 5. Las políticas RLS protegen los datos del usuario

-- ============================================================================
