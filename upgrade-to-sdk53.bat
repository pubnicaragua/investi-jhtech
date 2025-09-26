@echo off
echo ========================================
echo ACTUALIZANDO INVESTI APP A EXPO SDK 53
echo ========================================

echo.
echo 1. Limpiando cache y node_modules...
rmdir /s /q node_modules 2>nul
rmdir /s /q .expo 2>nul
del package-lock.json 2>nul
del yarn.lock 2>nul

echo.
echo 2. Instalando dependencias actualizadas...
npm install --legacy-peer-deps

echo.
echo 3. Limpiando cache de Expo...
npx expo install --fix

echo.
echo 4. Verificando configuración...
npx expo doctor

echo.
echo ========================================
echo ACTUALIZACIÓN COMPLETADA!
echo ========================================
echo.
echo Para iniciar el proyecto:
echo   npx expo start --clear
echo.
echo Para generar APK:
echo   eas build --platform android --profile preview
echo.
pause
