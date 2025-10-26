-- ============================================================================
-- FIX: Agregar columnas faltantes a tabla notifications
-- ============================================================================

-- Verificar estructura actual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Agregar columnas si no existen
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_id UUID;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_type TEXT;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES users(id);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON notifications(from_user_id);

-- Verificar
SELECT 'Columnas agregadas exitosamente' as status;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
