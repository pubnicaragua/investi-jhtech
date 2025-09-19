@echo off
echo ========================================
echo INVESTI APP - COMPREHENSIVE SCREEN FLOW TESTS
echo ========================================
echo.

echo Instalando dependencias necesarias...
call npm install @supabase/supabase-js

echo.
echo Ejecutando pruebas completas de flujo de pantallas...
echo Esto incluye validacion de pantallas con 4+ endpoints:
echo - ProfileScreen (12+ endpoints)
echo - CreatePostScreen (8+ endpoints) 
echo - ChatScreen (6+ endpoints)
echo - HomeFeedScreen (5+ endpoints)
echo.

node tests/comprehensive-screen-flow-test.js

echo.
echo ========================================
echo PRUEBAS COMPLETADAS
echo ========================================
pause
