-- ============================================================================
-- VERIFICACIÓN DEL SISTEMA DE CONEXIONES
-- ============================================================================
-- Este script verifica que todas las funciones y tablas estén correctamente
-- configuradas para el sistema de conexiones de usuarios
-- ============================================================================

-- 1. VERIFICAR TABLA user_connections
-- ============================================================================
SELECT 
  'user_connections table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_connections'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. VERIFICAR COLUMNAS DE LA TABLA
-- ============================================================================
SELECT 
  'user_connections columns' as check_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_connections';

-- 3. VERIFICAR ÍNDICES
-- ============================================================================
SELECT 
  'user_connections indexes' as check_name,
  string_agg(indexname, ', ') as indexes
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'user_connections';

-- 4. VERIFICAR FUNCIONES RPC
-- ============================================================================
SELECT 
  routine_name as function_name,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'are_users_connected',
    'request_user_connection',
    'accept_connection_request',
    'reject_connection_request',
    'get_pending_connection_requests',
    'get_user_connections'
  )
ORDER BY routine_name;

-- 5. VERIFICAR POLÍTICAS RLS
-- ============================================================================
SELECT 
  policyname as policy_name,
  cmd as command,
  '✅ ACTIVE' as status
FROM pg_policies 
WHERE tablename = 'user_connections'
ORDER BY policyname;

-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================================================
SELECT 
  'RLS enabled on user_connections' as check_name,
  CASE 
    WHEN relrowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_class
WHERE relname = 'user_connections';

-- 7. CONTAR CONEXIONES EXISTENTES (si hay datos)
-- ============================================================================
SELECT 
  'Total connections' as metric,
  COUNT(*) as count
FROM user_connections;

SELECT 
  'Connections by status' as metric,
  status,
  COUNT(*) as count
FROM user_connections
GROUP BY status
ORDER BY status;

-- 8. VERIFICAR TABLA DE NOTIFICACIONES
-- ============================================================================
SELECT 
  'notifications table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 9. VERIFICAR TIPOS DE NOTIFICACIÓN DE CONEXIÓN
-- ============================================================================
SELECT 
  'Connection notifications' as metric,
  type,
  COUNT(*) as count
FROM notifications
WHERE type IN ('connection_request', 'connection_accepted')
GROUP BY type
ORDER BY type;

-- ============================================================================
-- RESUMEN DE VERIFICACIÓN
-- ============================================================================
SELECT 
  '========================================' as separator,
  'VERIFICATION SUMMARY' as title,
  '========================================' as separator2;

-- Verificar que todo está OK
SELECT 
  CASE 
    WHEN (
      -- Tabla existe
      EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_connections')
      AND
      -- Todas las funciones existen
      (SELECT COUNT(*) FROM information_schema.routines 
       WHERE routine_schema = 'public' 
       AND routine_name IN (
         'are_users_connected',
         'request_user_connection',
         'accept_connection_request',
         'reject_connection_request',
         'get_pending_connection_requests',
         'get_user_connections'
       )) = 6
      AND
      -- RLS está habilitado
      EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_connections' AND relrowsecurity = true)
      AND
      -- Hay políticas RLS
      EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_connections')
    ) THEN '✅ ALL CHECKS PASSED - SYSTEM READY'
    ELSE '❌ SOME CHECKS FAILED - REVIEW ABOVE'
  END as final_status;

-- ============================================================================
-- INSTRUCCIONES
-- ============================================================================
/*
Para ejecutar este script:

1. Desde psql:
   psql -h [HOST] -U postgres -d postgres -f sql/verify_connections_system.sql

2. Desde Supabase Dashboard:
   - SQL Editor → New Query
   - Pegar contenido de este archivo
   - Run

3. Verificar que todos los checks muestren ✅

Si algún check muestra ❌:
- Ejecutar primero: sql/create_user_connections_system.sql
- Volver a ejecutar este script de verificación
*/
