@echo off
echo ========================================
echo INICIO LIMPIO - INVESTI APP
echo ========================================

echo.
echo [1/4] Deteniendo procesos de Metro...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [3/4] Limpiando cache de Watchman...
watchman watch-del-all 2>nul

echo.
echo [4/4] Iniciando servidor con cache limpio...
echo.
echo ========================================
echo INICIANDO EXPO DEV CLIENT
echo ========================================
echo.

npx expo start --dev-client --clear --reset-cache
