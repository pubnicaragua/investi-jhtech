-- ============================================================================
-- TRIGGER: Actualizar likes_count automáticamente
-- ============================================================================

-- Función para actualizar likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador
    UPDATE posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador
    UPDATE posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_update_likes_count ON post_likes;

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
  WHERE pl.post_id = p.id
);

-- Verificar
SELECT 
  'Trigger creado exitosamente' as status,
  COUNT(*) as posts_actualizados
FROM posts
WHERE likes_count IS NOT NULL;
