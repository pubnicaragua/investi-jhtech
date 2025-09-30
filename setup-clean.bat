@echo off
echo ========================================
echo INSTALACION LIMPIA - INVESTI JHTECH
echo ========================================
echo.

echo [1/6] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [2/6] Limpiando cache de Expo...
if exist .expo rmdir /s /q .expo

echo [3/6] Limpiando node_modules...
if exist node_modules rmdir /s /q node_modules

echo [4/6] Limpiando package-lock...
if exist package-lock.json del /f package-lock.json

echo [5/6] Instalando dependencias...
call npm install

echo [6/6] Instalando Expo CLI global (si no existe)...
call npm install -g expo-cli

echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo Para iniciar el proyecto:
echo   npm start
echo.
pause
