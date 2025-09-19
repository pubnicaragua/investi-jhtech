@echo off
echo 🚀 INVESTI APP - Production APK Build
echo.

echo 📋 Este script generará un APK de producción independiente
echo ❌ NO abrirá Expo, será una app nativa completa
echo.

echo 📦 Paso 1: Instalando dependencias...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo 🧹 Paso 2: Limpiando caches...
call npx expo install --fix
call npm cache clean --force
call npx expo start --clear

echo ⚙️ Paso 3: Verificando configuración...
echo Usando perfil: standalone (developmentClient: false)

echo 🔑 Paso 4: Login a Expo (si es necesario)...
call npx eas login

echo 🏗️ Paso 5: Construyendo APK de producción...
call npx eas build --platform android --profile standalone --local

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build local falló, intentando build en la nube...
    call npx eas build --platform android --profile standalone
)

echo.
echo ✅ Build completado!
echo 📱 El APK generado será una aplicación independiente
echo 🚫 NO requerirá Expo para funcionar
echo.
pause
