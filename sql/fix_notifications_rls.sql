-- ============================================================================
-- ARREGLAR RLS POLICIES PARA NOTIFICATIONS
-- ============================================================================
-- Error: new row violates row-level security policy for table "notifications"
-- Solución: Permitir INSERT desde triggers y funciones

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable read for users based on user_id" ON notifications;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON notifications;

-- 2. Crear políticas correctas

-- SELECT: Usuarios pueden ver sus propias notificaciones
CREATE POLICY "notifications_select_policy"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT: Permitir INSERT desde cualquier usuario autenticado
-- Esto permite que los triggers creen notificaciones
CREATE POLICY "notifications_insert_policy"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "notifications_update_policy"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "notifications_delete_policy"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 3. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Comentarios
COMMENT ON POLICY "notifications_select_policy" ON notifications IS 'Usuarios ven sus propias notificaciones';
COMMENT ON POLICY "notifications_insert_policy" ON notifications IS 'Permitir INSERT desde triggers (cualquier usuario autenticado)';
COMMENT ON POLICY "notifications_update_policy" ON notifications IS 'Usuarios actualizan sus propias notificaciones';
COMMENT ON POLICY "notifications_delete_policy" ON notifications IS 'Usuarios eliminan sus propias notificaciones';
