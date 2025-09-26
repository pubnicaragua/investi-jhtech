@echo off
title INVESTI APP - LIMPIAR IDIOMA Y PROBAR
echo ========================================
echo 🧪 LIMPIAR IDIOMA Y PROBAR NAVEGACIÓN 🧪
echo ========================================

echo.
echo 🧹 Limpiando completamente el estado de idioma...

echo.
echo 1. Limpiando cache de Metro...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo.
echo 2. Creando script para limpiar AsyncStorage...
echo import AsyncStorage from '@react-native-async-storage/async-storage'; > clear-storage.js
echo AsyncStorage.multiRemove(['user_language', 'language_selected', 'auth_token', 'user_data']); >> clear-storage.js
echo console.log('AsyncStorage limpiado'); >> clear-storage.js

echo.
echo 📱 INSTRUCCIONES PARA EL TEST:
echo.
echo 1. Abre la app en tu celular
echo 2. Ve a Settings o DevMenu si está disponible
echo 3. O simplemente desinstala y reinstala la app
echo 4. Deberías ver "Choose your language" 
echo 5. Selecciona un idioma y observa los logs
echo.
echo 🔍 LOGS A OBSERVAR:
echo    🌍 LanguageSelectionScreen: Iniciando selección de idioma
echo    ✅ LanguageSelectionScreen: Idioma guardado exitosamente  
echo    🧭 LanguageSelectionScreen: Iniciando navegación a Welcome
echo    🧭 LanguageSelectionScreen: Usando navigation.replace/navigate
echo.

echo ⚡ Iniciando con debugging completo...
npx expo start --dev-client --clear

echo.
echo ========================================
echo ✅ TEST INICIADO - REVISA LOS LOGS
echo ========================================
pause
