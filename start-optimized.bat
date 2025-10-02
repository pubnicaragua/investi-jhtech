@echo off
echo ========================================
echo INICIO OPTIMIZADO - INVESTI APP
echo Configurado para bajo uso de memoria
echo ========================================

echo.
echo [1/5] Deteniendo procesos de Metro y Node...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\haste-map-* del /f /q %TEMP%\haste-map-* 2>nul

echo.
echo [3/5] Limpiando cache de Watchman...
watchman watch-del-all 2>nul

echo.
echo [4/5] Aumentando memoria disponible para Node.js...
set NODE_OPTIONS=--max-old-space-size=4096

echo.
echo [5/5] Iniciando servidor optimizado...
echo.
echo ========================================
echo EXPO DEV CLIENT - MODO OPTIMIZADO
echo ========================================
echo.

npx expo start --dev-client --clear --max-workers 2
