@echo off
title INVESTI APP - CORRECCIÓN CRÍTICA Y REINICIO
echo ========================================
echo 🔧 CORRECCIÓN CRÍTICA - INVESTI APP 🔧
echo ========================================

echo.
echo 🧹 Limpieza completa de cache y archivos temporales...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\react-native-* rmdir /s /q %TEMP%\react-native-* 2>nul

echo.
echo 📦 Verificando e instalando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    npm install --legacy-peer-deps
) else (
    echo Dependencias encontradas, continuando...
)

echo.
echo ⚙️ Configurando variables de entorno...
set NODE_ENV=development
set EXPO_NO_DOTENV=1
set REACT_NATIVE_PACKAGER_CACHE_DISABLED=1

echo.
echo 🚀 Iniciando con configuración estable...
echo    - Metro config simplificado
echo    - Babel config estable  
echo    - Imports directos (sin lazy loading)
echo    - Navegación completa funcional
echo.

npx expo start --dev-client --clear --localhost

echo.
echo ========================================
echo ✅ INVESTI APP CORREGIDO E INICIADO!
echo ========================================
pause
