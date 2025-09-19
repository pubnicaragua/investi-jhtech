@echo off
echo 🚀 INVESTI APP - Windows APK Build Script
echo.

echo ❌ EAS local build no funciona en Windows
echo ✅ Usando EAS Cloud Build (GRATIS)
echo.

echo 📋 Opciones disponibles:
echo 1. EAS Cloud Build (Recomendado)
echo 2. Development Build Local
echo 3. React Native CLI Build
echo.
set /p choice="Selecciona opcion (1-3): "

if "%choice%"=="1" goto eas_cloud
if "%choice%"=="2" goto dev_build  
if "%choice%"=="3" goto rn_build
goto end

:eas_cloud
echo.
echo 🌐 Configurando EAS Cloud Build...
echo.

echo 📦 Instalando EAS CLI...
npm install -g @expo/cli

echo 🔑 Login a Expo (se abrira navegador)...
npx eas login

echo ⚙️ Configurando build...
npx eas build:configure

echo 🏗️ Iniciando build en la nube...
npx eas build --platform android --profile preview

echo.
echo ✅ Build iniciado en la nube!
echo 📱 Ve a https://expo.dev para descargar el APK cuando este listo
echo.
goto end

:dev_build
echo.
echo 📱 Development Build Local...
echo.

echo 📦 Instalando expo-dev-client...
npx expo install expo-dev-client

echo 🏗️ Generando build...
npx expo run:android --variant release

echo.
echo ✅ Development build completado!
goto end

:rn_build
echo.
echo ⚛️ React Native CLI Build...
echo.

echo 🧹 Limpiando y generando codigo nativo...
npx expo prebuild --clean

echo 🏗️ Building APK...
cd android
call gradlew assembleRelease

echo.
echo ✅ APK generado en: android\app\build\outputs\apk\release\app-release.apk
goto end

:end
echo.
echo 🎉 Proceso completado!
pause
