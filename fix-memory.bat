@echo off
echo ========================================
echo SOLUCION COMPLETA - ERROR DE MEMORIA
echo ========================================

echo.
echo [1/7] Matando todos los procesos Node.js...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM watchman.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/7] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [3/7] Limpiando cache de Expo...
if exist .expo rmdir /s /q .expo

echo.
echo [4/7] Limpiando cache temporal de Windows...
del /f /s /q %TEMP%\metro-* 2>nul
del /f /s /q %TEMP%\haste-map-* 2>nul
del /f /s /q %TEMP%\react-* 2>nul

echo.
echo [5/7] Limpiando cache de Watchman...
watchman watch-del-all 2>nul

echo.
echo [6/7] Limpiando cache de npm...
npm cache clean --force

echo.
echo [7/7] Configurando variables de entorno...
set NODE_OPTIONS=--max-old-space-size=4096
set EXPO_NO_CACHE=1

echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora ejecuta: start-optimized.bat
echo.
pause
