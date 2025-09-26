@echo off
title INVESTI APP - REBUILD DEVELOPMENT CLIENT
echo ========================================
echo 🔄 REBUILD DEVELOPMENT CLIENT COMPLETO 🔄
echo ========================================

echo.
echo ⚠️  PROBLEMA IDENTIFICADO:
echo    El development build actual tiene TurboModules activados
echo    Necesitamos regenerar el build completamente
echo.

echo 🛑 Deteniendo procesos...
taskkill /f /im node.exe 2>nul

echo.
echo 🧹 Limpieza completa...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo.
echo ⚙️ Configurando variables para build...
set RN_NEW_ARCH_ENABLED=0
set EXPO_USE_TURBO_MODULES=false
set EXPO_USE_FABRIC=false
set REACT_NATIVE_NEW_ARCH_ENABLED=false
set NODE_ENV=development

echo.
echo 📱 OPCIONES PARA SOLUCIONAR:
echo.
echo OPCIÓN 1 - REBUILD AUTOMÁTICO (RECOMENDADO):
echo   1. Ejecuta: eas build --platform android --profile development
echo   2. Instala el nuevo APK en tu móvil
echo   3. El nuevo build NO tendrá TurboModules
echo.
echo OPCIÓN 2 - PREBUILD LOCAL:
echo   1. Ejecuta: npx expo prebuild --clean
echo   2. Luego: npx expo run:android
echo   3. Esto regenera el proyecto nativo
echo.
echo OPCIÓN 3 - EXPO GO (TEMPORAL):
echo   1. Desinstala el development build
echo   2. Instala Expo Go desde Play Store
echo   3. Usa Expo Go temporalmente
echo.

echo ========================================
echo 🎯 COMANDO RECOMENDADO:
echo ========================================
echo.
echo Para generar nuevo development build:
echo   eas build --platform android --profile development
echo.
echo Para usar Expo Go temporalmente:
echo   npx expo start --tunnel
echo.

echo ⚡ Iniciando Metro para Expo Go...
echo (Presiona Ctrl+C si prefieres hacer rebuild)
echo.
timeout /t 5

npx expo start --tunnel --clear

echo.
echo ========================================
echo 📋 PRÓXIMOS PASOS:
echo ========================================
echo.
echo SI USAS EXPO GO:
echo 1. Desinstala development build del móvil
echo 2. Instala Expo Go
echo 3. Escanea QR con Expo Go
echo 4. Deberías ver la app sin errores TurboModule
echo.
echo SI HACES REBUILD:
echo 1. Ejecuta: eas build --platform android --profile development
echo 2. Espera ~10-15 minutos
echo 3. Descarga e instala nuevo APK
echo 4. El nuevo build estará limpio
echo.
pause
