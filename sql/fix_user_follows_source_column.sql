-- ============================================================================
-- FIX: Agregar columna 'source' a user_follows
-- ============================================================================
-- Error: "Could not find the 'source' column of 'user_follows' in the schema cache"
-- Esta columna es necesaria para trackear de dónde viene el follow (suggestions, profile, etc.)
-- ============================================================================

-- 1. Agregar columna 'source' si no existe
ALTER TABLE user_follows 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'profile';

-- 2. Crear índice para mejorar performance en queries por source
CREATE INDEX IF NOT EXISTS idx_user_follows_source ON user_follows(source);

-- 3. Actualizar registros existentes sin source
UPDATE user_follows 
SET source = 'profile' 
WHERE source IS NULL;

-- 4. Comentario en la tabla
COMMENT ON COLUMN user_follows.source IS 'Origen del follow: profile, suggestions, community, search, etc.';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Verificar que la columna existe:
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_follows' AND column_name = 'source';
