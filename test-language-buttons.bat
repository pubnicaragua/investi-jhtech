@echo off
title INVESTI APP - TEST BOTONES IDIOMA
echo ========================================
echo 🔥 TEST ESPECÍFICO - BOTONES IDIOMA 🔥
echo ========================================

echo.
echo 🧹 Limpieza rápida...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul

echo.
echo 📱 PASOS EXACTOS PARA PROBAR:
echo.
echo 1. Abre la app en tu móvil
echo 2. Deberías ver "Choose your language"
echo 3. Toca el botón ESPAÑOL
echo 4. Observa INMEDIATAMENTE esta consola
echo.
echo 🔍 LOGS QUE DEBES VER AL TOCAR EL BOTÓN:
echo.
echo    🔥 BOTÓN PRESIONADO! Idioma: es
echo    🌍 LanguageSelectionScreen: Iniciando selección de idioma: es
echo    ✅ LanguageSelectionScreen: Idioma guardado exitosamente
echo    🔍 LanguageSelectionScreen: Verificación - idioma guardado: es
echo    🧭 LanguageSelectionScreen: Iniciando navegación a Welcome...
echo    🚀 Método X: navigation.replace("Welcome")
echo.
echo ❌ SI NO VES ESTOS LOGS:
echo    - El botón no está funcionando
echo    - Hay un error en el código
echo    - Problema de touch en el móvil
echo.
echo ✅ SI VES LOS LOGS PERO NO NAVEGA:
echo    - Problema en la navegación
echo    - Pantalla Welcome no existe
echo    - Error en el Stack Navigator
echo.

echo ⚡ Iniciando con logging máximo...
set DEBUG=*
npx expo start --dev-client --clear

echo.
echo ========================================
echo 📊 ANÁLISIS DE RESULTADOS:
echo ========================================
echo.
echo ¿Viste "🔥 BOTÓN PRESIONADO!"? 
echo   SÍ = El botón funciona
echo   NO = Problema de touch/código
echo.
echo ¿Viste "🚀 Método X: navigation..."?
echo   SÍ = Navegación intentada
echo   NO = Error antes de navegar
echo.
pause
