@echo off
title INVESTI APP - INICIO SÚPER RÁPIDO
echo ========================================
echo 🚀 INVESTI APP - MODO SÚPER RÁPIDO 🚀
echo ========================================

echo.
echo ⚡ Configurando variables de entorno para máxima velocidad...
set NODE_ENV=development
set EXPO_USE_FAST_RESOLVER=1
set EXPO_NO_DOTENV=1
set EXPO_NO_TYPESCRIPT_SETUP=1
set REACT_NATIVE_PACKAGER_CACHE_DISABLED=1
set METRO_CACHE=0
set EXPO_SKIP_MANIFEST_VALIDATION_SPEEDUPS=1
set EXPO_NO_TELEMETRY=1

echo.
echo 🧹 Limpieza súper rápida...
if exist .expo rmdir /s /q .expo 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist .metro rmdir /s /q .metro 2>nul

echo.
echo 📦 Verificando dependencias críticas...
if not exist node_modules (
    echo ❌ Dependencias faltantes. Ejecuta: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo 🔥 Iniciando con configuración SÚPER OPTIMIZADA...
echo    - Lazy loading activado
echo    - Cache deshabilitado para desarrollo
echo    - Bundle mínimo inicial
echo    - Metro súper optimizado
echo.

npx expo start --dev-client --clear --no-dev --localhost --port 8081

echo.
echo ========================================
echo ✅ INVESTI APP INICIADO SÚPER RÁPIDO!
echo ========================================
pause
