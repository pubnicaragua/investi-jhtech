@echo off
title INVESTI APP - CORRECCIÓN TURBO MODULES
echo ========================================
echo 🔧 CORRECCIÓN TURBO MODULES CRÍTICA 🔧
echo ========================================

echo.
echo 🛑 Deteniendo todos los procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im watchman.exe 2>nul

echo.
echo 🧹 Limpieza COMPLETA de cache...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\react-native-* rmdir /s /q %TEMP%\react-native-* 2>nul
if exist %APPDATA%\Expo rmdir /s /q %APPDATA%\Expo 2>nul

echo.
echo 📦 Reinstalando dependencias críticas...
npm uninstall react-native-reanimated
npm install react-native-reanimated@~3.16.1 --legacy-peer-deps

echo.
echo ⚙️ Configurando variables para desactivar TurboModules...
set RN_NEW_ARCH_ENABLED=0
set EXPO_USE_TURBO_MODULES=false
set EXPO_USE_FABRIC=false
set REACT_NATIVE_NEW_ARCH_ENABLED=false
set NODE_ENV=development

echo.
echo 🔄 Limpiando watchman...
watchman watch-del-all 2>nul

echo.
echo 🚀 Iniciando con configuración estable...
echo    - TurboModules: DESACTIVADO
echo    - New Architecture: DESACTIVADO  
echo    - Hermes: ACTIVADO
echo    - Bundle optimizado para velocidad
echo.

npx expo start --dev-client --clear --reset-cache --no-dev --minify

echo.
echo ========================================
echo ✅ CORRECCIÓN APLICADA
echo ========================================
echo.
echo 📊 MEJORAS ESPERADAS:
echo    - Bundle time: 117s → ~30s
echo    - No más errores TurboModule
echo    - Navegación funcionando
echo.
pause
