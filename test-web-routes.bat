@echo off
title INVESTI APP - TEST RUTAS WEB
echo ========================================
echo 🌐 TEST RUTAS WEB - INVESTI APP 🌐
echo ========================================

echo.
echo Iniciando servidor web...
taskkill /f /im node.exe 2>nul

echo.
echo Limpieza rapida...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul

echo.
echo ========================================
echo 📋 RUTAS PARA PROBAR EN ORDEN:
echo ========================================
echo.
echo 🔗 BASE: http://localhost:8081
echo.
echo 1️⃣ FLUJO BASICO:
echo    /language-selection
echo    /welcome  
echo    /signin
echo    /home
echo.
echo 2️⃣ PRINCIPALES:
echo    /create-post
echo    /communities
echo    /chats
echo    /notifications
echo.
echo 3️⃣ CONTENIDO:
echo    /post/b0150eb7-8d24-4486-8447-e91937ce38fd
echo    /community/1
echo    /profile
echo.
echo 4️⃣ EDUCACION:
echo    /educacion
echo    /inversiones
echo    /market-info
echo.
echo 5️⃣ HERRAMIENTAS:
echo    /planificador-financiero
echo    /caza-hormigas
echo    /promotions
echo.
echo ✅ QUE VALIDAR:
echo    - Carga sin errores
echo    - UI se ve bien
echo    - Botones funcionan
echo    - No errores en consola (F12)
echo.

echo ⚡ Iniciando servidor web...
npx expo start --web --clear

echo.
echo ========================================
echo 🌐 SERVIDOR WEB INICIADO
echo ========================================
echo.
echo 📋 INSTRUCCIONES:
echo 1. Abre http://localhost:8081 en tu navegador
echo 2. Prueba las rutas en el orden listado arriba
echo 3. Reporta cuales funcionan y cuales no
echo 4. Con esa info corregiremos todo
echo.
pause
