@echo off
echo ========================================
echo SOLUCION TURBOMODULE ERROR - INMEDIATA
echo ========================================

echo.
echo [1/9] Deteniendo todos los procesos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM adb.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/9] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [3/9] Limpiando cache de npm...
call npm cache clean --force

echo.
echo [4/9] Limpiando cache de Watchman...
call watchman watch-del-all 2>nul

echo.
echo [5/9] Limpiando cache temporal del sistema...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-* 2>nul
if exist %TEMP%\haste-* rmdir /s /q %TEMP%\haste-* 2>nul

echo.
echo [6/9] Limpiando build de Android...
cd android
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
cd ..

echo.
echo [7/9] Limpiando cache de Gradle...
if exist %USERPROFILE%\.gradle\caches rmdir /s /q %USERPROFILE%\.gradle\caches

echo.
echo [8/9] Reinstalando dependencias nativas...
call npx expo install --fix

echo.
echo [9/9] Iniciando con cache limpio...
echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
echo.
echo IMPORTANTE: Ahora ejecuta estos comandos en orden:
echo.
echo 1. npx expo start --dev-client --clear
echo 2. En otra terminal: npx expo run:android
echo.
echo O presiona cualquier tecla para iniciar automaticamente...
pause

echo.
echo Iniciando Metro Bundler...
start cmd /k "npx expo start --dev-client --clear"

timeout /t 5 /nobreak >nul

echo.
echo Compilando app Android...
call npx expo run:android
