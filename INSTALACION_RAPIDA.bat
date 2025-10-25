@echo off
REM ============================================================================
REM INVESTI APP - INSTALACION RAPIDA DE CORRECCIONES
REM ============================================================================
REM Este script automatiza la instalacion de las correcciones finales
REM ============================================================================

echo.
echo ========================================
echo   INVESTI APP - INSTALACION RAPIDA
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: Este script debe ejecutarse desde la raiz del proyecto
    echo Directorio actual: %CD%
    pause
    exit /b 1
)

echo [1/5] Limpiando cache...
echo.
call npm run clean
if errorlevel 1 (
    echo WARNING: Error al limpiar cache, continuando...
)

echo.
echo [2/5] Instalando dependencias...
echo.
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)

echo.
echo [3/5] Verificando archivos SQL...
echo.
if exist "sql\create_user_connections_system.sql" (
    echo ✓ create_user_connections_system.sql encontrado
) else (
    echo ERROR: No se encontro sql\create_user_connections_system.sql
    pause
    exit /b 1
)

if exist "sql\verify_connections_system.sql" (
    echo ✓ verify_connections_system.sql encontrado
) else (
    echo ERROR: No se encontro sql\verify_connections_system.sql
    pause
    exit /b 1
)

echo.
echo [4/5] Verificando archivos TypeScript modificados...
echo.
if exist "src\rest\api.ts" (
    echo ✓ src\rest\api.ts encontrado
) else (
    echo ERROR: No se encontro src\rest\api.ts
    pause
    exit /b 1
)

if exist "src\screens\SettingsScreen.tsx" (
    echo ✓ src\screens\SettingsScreen.tsx encontrado
) else (
    echo ERROR: No se encontro src\screens\SettingsScreen.tsx
    pause
    exit /b 1
)

if exist "src\screens\SavedPostsScreen.tsx" (
    echo ✓ src\screens\SavedPostsScreen.tsx encontrado
) else (
    echo ERROR: No se encontro src\screens\SavedPostsScreen.tsx
    pause
    exit /b 1
)

if exist "src\screens\NotificationsScreen.tsx" (
    echo ✓ src\screens\NotificationsScreen.tsx encontrado
) else (
    echo ERROR: No se encontro src\screens\NotificationsScreen.tsx
    pause
    exit /b 1
)

echo.
echo [5/5] Mostrando instrucciones SQL...
echo.
echo ========================================
echo   SIGUIENTE PASO: EJECUTAR SQL
echo ========================================
echo.
echo IMPORTANTE: Debes ejecutar el SQL en Supabase manualmente
echo.
echo Opcion 1 - Dashboard de Supabase:
echo   1. Ir a: https://supabase.com/dashboard
echo   2. Seleccionar tu proyecto
echo   3. Ir a "SQL Editor"
echo   4. Hacer clic en "New Query"
echo   5. Abrir: sql\create_user_connections_system.sql
echo   6. Copiar todo el contenido
echo   7. Pegar en el editor
echo   8. Hacer clic en "Run"
echo.
echo Opcion 2 - Linea de comandos:
echo   psql -h [HOST] -U postgres -d postgres -f sql\create_user_connections_system.sql
echo.
echo Despues de ejecutar el SQL, verifica con:
echo   sql\verify_connections_system.sql
echo.
echo ========================================
echo   COMPILAR LA APP
echo ========================================
echo.
echo Para Android:
echo   npm run android
echo.
echo Para iOS:
echo   npm run ios
echo.
echo Para Web:
echo   npm run web
echo.
echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo ✓ Dependencias instaladas
echo ✓ Archivos verificados
echo ✓ Listo para ejecutar SQL
echo.
echo Consulta RESUMEN_CORRECCIONES_CLIENTE.md para mas detalles
echo.

pause
