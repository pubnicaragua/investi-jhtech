@echo off
echo ========================================
echo LIMPIEZA PROFUNDA - INVESTI APP
echo ========================================

echo.
echo [1/7] Deteniendo procesos de Metro...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/7] Eliminando cache de Expo...
if exist .expo rmdir /s /q .expo
if exist .metro rmdir /s /q .metro

echo.
echo [3/7] Eliminando cache de Metro...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [4/7] Eliminando cache de npm...
npm cache clean --force

echo.
echo [5/7] Eliminando cache de Watchman...
watchman watch-del-all 2>nul

echo.
echo [6/7] Eliminando cache temporal...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-*
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-*
if exist %TEMP%\haste-* rmdir /s /q %TEMP%\haste-*

echo.
echo [7/7] Reiniciando servidor Metro...
echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora ejecuta: npm start
echo.
pause
