-- =====================================================
-- FIX: Agregar columna 'source' a user_follows
-- =====================================================

-- Agregar columna source si no existe
ALTER TABLE user_follows 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Crear índice para source
CREATE INDEX IF NOT EXISTS idx_user_follows_source ON user_follows(source);

-- Verificar que se agregó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_follows'
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✅ Columna source agregada a user_follows' as status;
