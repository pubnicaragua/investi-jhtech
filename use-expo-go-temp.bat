@echo off
title INVESTI APP - EXPO GO TEMPORAL
echo ========================================
echo 📱 USAR EXPO GO TEMPORALMENTE 📱
echo ========================================

echo.
echo 💡 SOLUCIÓN TEMPORAL MIENTRAS REGENERAS BUILD:
echo.
echo El development build actual tiene TurboModules activados.
echo Usaremos Expo Go temporalmente para probar la navegación.
echo.

echo 🛑 Deteniendo Metro...
taskkill /f /im node.exe 2>nul

echo.
echo 🧹 Limpieza rápida...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul

echo.
echo ⚙️ Configurando para Expo Go...
set NODE_ENV=development
set EXPO_NO_DOTENV=1

echo.
echo 📋 INSTRUCCIONES:
echo.
echo 1. DESINSTALA el development build de tu móvil
echo 2. INSTALA Expo Go desde Play Store
echo 3. ESCANEA el QR que aparecerá con Expo Go
echo 4. La app debería funcionar SIN errores TurboModule
echo 5. Prueba la navegación de idioma
echo.

echo ⚠️  LIMITACIONES DE EXPO GO:
echo   - Algunas funciones nativas pueden no funcionar
echo   - Solo para testing básico
echo   - Navegación debería funcionar perfectamente
echo.

echo 🔄 PARA REGENERAR DEVELOPMENT BUILD:
echo   1. Ejecuta en otra terminal: eas build --platform android --profile development
echo   2. Espera ~10-15 minutos
echo   3. Descarga e instala el nuevo APK
echo   4. El nuevo build NO tendrá TurboModules
echo.

echo ⚡ Iniciando con Expo Go...
npx expo start --tunnel --clear

echo.
echo ========================================
echo ✅ EXPO GO INICIADO
echo ========================================
echo.
echo 📱 PRÓXIMOS PASOS:
echo 1. Desinstala development build
echo 2. Instala Expo Go
echo 3. Escanea QR con Expo Go
echo 4. Prueba navegación de idioma
echo.
pause
