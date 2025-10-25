-- ============================================================================
-- FIX: Error duplicate key en user_follows
-- ============================================================================
-- Problema: Al seguir usuario da error 23505 duplicate key
-- Solución: Usar ON CONFLICT DO NOTHING o función RPC
-- ============================================================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_follows'
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINT ÚNICO
-- ============================================================================
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'user_follows'::regclass;

-- 3. CREAR FUNCIÓN RPC PARA SEGUIR USUARIO (CON MANEJO DE DUPLICADOS)
-- ============================================================================
CREATE OR REPLACE FUNCTION follow_user_safe(
  p_follower_id UUID,
  p_following_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_already_following BOOLEAN;
BEGIN
  -- Validar que no sea el mismo usuario
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'No puedes seguirte a ti mismo';
  END IF;
  
  -- Verificar si ya sigue al usuario
  SELECT EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = p_follower_id 
      AND following_id = p_following_id
  ) INTO v_already_following;
  
  IF v_already_following THEN
    -- Ya está siguiendo, retornar éxito sin error
    RETURN json_build_object(
      'success', true,
      'already_following', true,
      'message', 'Ya sigues a este usuario'
    );
  END IF;
  
  -- Insertar nuevo seguimiento
  INSERT INTO user_follows (follower_id, following_id, created_at)
  VALUES (p_follower_id, p_following_id, NOW())
  ON CONFLICT (follower_id, following_id) DO NOTHING;
  
  -- Actualizar contador de seguidores
  UPDATE users
  SET followers_count = COALESCE(followers_count, 0) + 1
  WHERE id = p_following_id;
  
  -- Actualizar contador de siguiendo
  UPDATE users
  SET following_count = COALESCE(following_count, 0) + 1
  WHERE id = p_follower_id;
  
  RETURN json_build_object(
    'success', true,
    'already_following', false,
    'message', 'Ahora sigues a este usuario'
  );
END;
$$;

-- 4. CREAR FUNCIÓN RPC PARA DEJAR DE SEGUIR
-- ============================================================================
CREATE OR REPLACE FUNCTION unfollow_user_safe(
  p_follower_id UUID,
  p_following_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_was_following BOOLEAN;
BEGIN
  -- Verificar si seguía al usuario
  SELECT EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = p_follower_id 
      AND following_id = p_following_id
  ) INTO v_was_following;
  
  IF NOT v_was_following THEN
    -- No estaba siguiendo, retornar éxito sin error
    RETURN json_build_object(
      'success', true,
      'was_following', false,
      'message', 'No seguías a este usuario'
    );
  END IF;
  
  -- Eliminar seguimiento
  DELETE FROM user_follows
  WHERE follower_id = p_follower_id 
    AND following_id = p_following_id;
  
  -- Actualizar contador de seguidores
  UPDATE users
  SET followers_count = GREATEST(COALESCE(followers_count, 1) - 1, 0)
  WHERE id = p_following_id;
  
  -- Actualizar contador de siguiendo
  UPDATE users
  SET following_count = GREATEST(COALESCE(following_count, 1) - 1, 0)
  WHERE id = p_follower_id;
  
  RETURN json_build_object(
    'success', true,
    'was_following', true,
    'message', 'Dejaste de seguir a este usuario'
  );
END;
$$;

-- 5. CREAR FUNCIÓN PARA VERIFICAR SI SIGUE
-- ============================================================================
CREATE OR REPLACE FUNCTION is_following_user(
  p_follower_id UUID,
  p_following_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = p_follower_id 
      AND following_id = p_following_id
  );
END;
$$;

-- 6. AGREGAR COLUMNAS DE CONTADORES SI NO EXISTEN
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'followers_count'
  ) THEN
    ALTER TABLE users ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'following_count'
  ) THEN
    ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 7. RECALCULAR CONTADORES EXISTENTES
-- ============================================================================
UPDATE users u
SET followers_count = (
  SELECT COUNT(*) 
  FROM user_follows 
  WHERE following_id = u.id
);

UPDATE users u
SET following_count = (
  SELECT COUNT(*) 
  FROM user_follows 
  WHERE follower_id = u.id
);

-- 8. VERIFICAR FUNCIONES CREADAS
-- ============================================================================
SELECT 
  routine_name as function_name,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'follow_user_safe',
    'unfollow_user_safe',
    'is_following_user'
  )
ORDER BY routine_name;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON FUNCTION follow_user_safe IS 'Seguir usuario con manejo de duplicados y actualización de contadores';
COMMENT ON FUNCTION unfollow_user_safe IS 'Dejar de seguir usuario con actualización de contadores';
COMMENT ON FUNCTION is_following_user IS 'Verificar si un usuario sigue a otro';
