@echo off
title INVESTI APP - LIMPIEZA COMPLETA Y TEST
echo ========================================
echo 🧹 LIMPIEZA COMPLETA - INVESTI APP 🧹
echo ========================================

echo.
echo 1. Deteniendo Metro si está corriendo...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Limpiando cache completo...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\react-native-* rmdir /s /q %TEMP%\react-native-* 2>nul
if exist %APPDATA%\Expo rmdir /s /q %APPDATA%\Expo 2>nul

echo.
echo 3. Limpiando watchman (si existe)...
watchman watch-del-all 2>nul

echo.
echo 4. Limpiando npm cache...
npm cache clean --force

echo.
echo 5. Configurando variables para debugging...
set NODE_ENV=development
set DEBUG=1
set EXPO_DEBUG=1
set REACT_NATIVE_PACKAGER_CACHE_DISABLED=1

echo.
echo ========================================
echo 📱 INSTRUCCIONES PARA PROBAR:
echo ========================================
echo.
echo 1. La app debería abrir en "Choose your language"
echo 2. Toca ESPAÑOL o ENGLISH
echo 3. Observa los logs en esta consola
echo 4. Deberías ver navegación a Welcome
echo.
echo 🔍 LOGS A BUSCAR:
echo    🌍 Iniciando selección de idioma
echo    ✅ Idioma guardado exitosamente
echo    🧭 Navegando a Welcome
echo.
echo SI NO FUNCIONA:
echo - Presiona 'r' para reload
echo - O cierra/abre la app
echo.

echo ⚡ Iniciando con cache limpio...
npx expo start --dev-client --clear --reset-cache

pause
