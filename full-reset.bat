@echo off
echo ========================================
echo RESET COMPLETO - INVESTI APP
echo ========================================

echo.
echo [1/8] Deteniendo todos los procesos Node...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM watchman.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [2/8] Eliminando cache de Expo...
if exist .expo rmdir /s /q .expo

echo.
echo [3/8] Eliminando cache de Metro...
if exist .metro rmdir /s /q .metro

echo.
echo [4/8] Eliminando cache de node_modules...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [5/8] Limpiando cache de npm...
npm cache clean --force

echo.
echo [6/8] Limpiando cache de Watchman...
watchman watch-del-all 2>nul

echo.
echo [7/8] Eliminando archivos temporales...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-* 2>nul
if exist %TEMP%\haste-* rmdir /s /q %TEMP%\haste-* 2>nul

echo.
echo [8/8] Iniciando con configuración limpia...
echo.
echo ========================================
echo RESET COMPLETADO
echo ========================================
echo.

npx expo start --dev-client --clear --reset-cache
