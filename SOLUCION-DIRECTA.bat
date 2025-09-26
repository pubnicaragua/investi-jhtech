@echo off
title SOLUCION DIRECTA - SIN COMPLICACIONES
echo ========================================
echo SOLUCION DIRECTA - SIN COMPLICACIONES
echo ========================================

echo.
echo Deteniendo procesos...
taskkill /f /im node.exe 2>nul

echo.
echo Limpieza basica...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul

echo.
echo INICIANDO SIN TUNNEL (LOCAL)...
echo.
echo INSTRUCCIONES SIMPLES:
echo 1. Conecta tu movil a la MISMA WIFI que tu PC
echo 2. Abre la app development build en tu movil
echo 3. Escanea el QR que aparecera
echo 4. Listo - sin complicaciones
echo.

npx expo start --dev-client --clear --localhost

pause
