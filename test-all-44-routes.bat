@echo off
title INVESTI APP - TEST 44 PANTALLAS COMPLETAS
echo ========================================
echo 🚀 TEST 44 PANTALLAS COMPLETAS 🚀
echo ========================================

echo.
echo Iniciando servidor web optimizado...
taskkill /f /im node.exe 2>nul

echo.
echo Limpieza completa...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo.
echo ========================================
echo 📋 44 RUTAS PARA PROBAR:
echo ========================================
echo.
echo 🔥 CRÍTICAS (7):
echo    /language-selection
echo    /welcome
echo    /signin
echo    /signup
echo    /home
echo    /create-post
echo    /profile
echo.
echo ⚡ IMPORTANTES (13):
echo    /upload-avatar
echo    /pick-goals
echo    /pick-interests
echo    /pick-knowledge
echo    /post/123
echo    /communities
echo    /community/1
echo    /chats
echo    /chat/1
echo    /notifications
echo    /educacion
echo    /inversiones
echo    /settings
echo.
echo 📋 SECUNDARIAS (14):
echo    /share-post
echo    /saved-posts
echo    /profile/123
echo    /community-recommendations
echo    /group-chat/1
echo    /messages
echo    /learning-paths
echo    /course/1
echo    /video-player
echo    /inversionista
echo    /market-info
echo    /news
echo    /news/1
echo    /promotions
echo.
echo 🛠️ AVANZADAS (10):
echo    /promotion/1
echo    /planificador-financiero
echo    /caza-hormigas
echo    /payment
echo    /reportes-avanzados
echo    /investment-knowledge
echo    /onboarding-complete
echo    /community-members/1
echo    /edit-community/1
echo    /create-community
echo    /dev-menu
echo.
echo ✅ VALIDAR EN CADA RUTA:
echo    - Carga sin error 404
echo    - UI se ve correctamente
echo    - Botones responden
echo    - Sin errores en consola F12
echo    - Datos se cargan (si aplica)
echo.

echo ⚡ Iniciando servidor web...
npx expo start --web --clear

echo.
echo ========================================
echo 🌐 SERVIDOR INICIADO - 44 RUTAS LISTAS
echo ========================================
echo.
echo 📋 INSTRUCCIONES:
echo 1. Abre http://localhost:8081 en navegador
echo 2. Prueba TODAS las rutas listadas arriba
echo 3. Marca cuales funcionan y cuales no
echo 4. Reporta errores específicos
echo 5. Con esa info corregimos todo de una vez
echo.
echo 🎯 OBJETIVO: 44/44 RUTAS FUNCIONANDO
echo.
pause
