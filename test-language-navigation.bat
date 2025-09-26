@echo off
title INVESTI APP - TEST NAVEGACIÓN IDIOMA
echo ========================================
echo 🧪 TEST NAVEGACIÓN DESDE IDIOMA 🧪
echo ========================================

echo.
echo 🔧 Preparando test de navegación...
echo    - Limpiando AsyncStorage
echo    - Forzando pantalla de idioma
echo    - Activando logging detallado

echo.
echo 🧹 Limpiando datos de idioma...
adb shell am broadcast -a com.investi.CLEAR_LANGUAGE_DATA 2>nul

echo.
echo 📱 Instrucciones para el test:
echo.
echo 1. Abre la app en tu celular
echo 2. Deberías ver "Choose your language"
echo 3. Selecciona cualquier idioma (Español o English)
echo 4. Observa los logs en esta consola
echo 5. Deberías navegar automáticamente a Welcome
echo.
echo 🔍 Logs detallados activados:
echo    - LanguageSelectionScreen: logs con 🌍
echo    - LanguageContext: logs con ✅
echo    - Navigation: logs con 🧭
echo.

echo ⚡ Iniciando con logging detallado...
set DEBUG=1
set EXPO_DEBUG=1
npx expo start --dev-client --clear

echo.
echo ========================================
echo ✅ TEST COMPLETADO
echo ========================================
pause
