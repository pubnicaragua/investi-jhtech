-- ============================================================================
-- CORRECCIONES URGENTES - INVESTI APP
-- ============================================================================
-- Fecha: 25 de Octubre de 2025
-- Descripción: Correcciones críticas para errores en producción
-- ============================================================================

-- ============================================================================
-- 1. ARREGLAR TRIGGER DE POST_LIKES
-- ============================================================================
-- Problema: "trigger functions can only be called as triggers"
-- Solución: Recrear la función del trigger correctamente

-- Eliminar trigger existente
DROP TRIGGER IF EXISTS trigger_update_likes_count ON post_likes;

-- Recrear función del trigger
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar likes_count cuando se inserta un like
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar likes_count cuando se elimina un like
    UPDATE posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- Recalcular likes_count para todos los posts existentes
UPDATE posts p
SET likes_count = (
  SELECT COUNT(*)
  FROM post_likes pl
  WHERE pl.post_id = p.id AND pl.is_like = true
);

-- ============================================================================
-- 2. VERIFICAR Y CORREGIR POLÍTICAS RLS DE POST_LIKES
-- ============================================================================

-- Política para ver likes
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
  FOR SELECT USING (true);

-- Política para insertar likes
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para eliminar likes
DROP POLICY IF EXISTS "Users can unlike their own likes" ON post_likes;
CREATE POLICY "Users can unlike their own likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 3. VERIFICAR ESTRUCTURA DE TABLA POST_COMMENTS
-- ============================================================================

-- Verificar si existe la columna parent_comment_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_comments' AND column_name = 'parent_comment_id'
  ) THEN
    -- Agregar columna si no existe (para respuestas a comentarios)
    ALTER TABLE post_comments 
    ADD COLUMN parent_comment_id uuid REFERENCES post_comments(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Columna parent_comment_id agregada a post_comments';
  ELSE
    RAISE NOTICE 'Columna parent_comment_id ya existe en post_comments';
  END IF;
END $$;

-- ============================================================================
-- 4. VERIFICAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índice para post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_unique ON post_likes(post_id, user_id);

-- Índice para post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- ============================================================================
-- 5. VERIFICAR DATOS DE PRUEBA
-- ============================================================================

-- Verificar conteo de likes
SELECT 
  'Total de likes' as metrica,
  COUNT(*) as valor
FROM post_likes;

-- Verificar conteo de comentarios
SELECT 
  'Total de comentarios' as metrica,
  COUNT(*) as valor
FROM post_comments;

-- Verificar posts con likes_count incorrecto
SELECT 
  p.id,
  p.contenido,
  p.likes_count as likes_count_actual,
  COUNT(pl.id) as likes_count_real,
  (p.likes_count - COUNT(pl.id)) as diferencia
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.is_like = true
GROUP BY p.id, p.contenido, p.likes_count
HAVING p.likes_count != COUNT(pl.id);

-- ============================================================================
-- FIN DE CORRECCIONES
-- ============================================================================

SELECT '✅ Correcciones aplicadas exitosamente' as resultado;
