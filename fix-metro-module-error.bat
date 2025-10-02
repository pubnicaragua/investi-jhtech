@echo off
echo ========================================
echo SOLUCION ERROR MODULO 9415
echo ========================================
echo.

echo [1/6] Deteniendo procesos Metro y Expo...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM adb.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [3/6] Limpiando cache de Expo...
if exist .expo rmdir /s /q .expo

echo [4/6] Limpiando cache de Android...
cd android
call gradlew clean 2>nul
cd ..

echo [5/6] Limpiando cache temporal de Windows...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-*
if exist %TEMP%\react-native-* rmdir /s /q %TEMP%\react-native-*
if exist %TEMP%\haste-map-* rmdir /s /q %TEMP%\haste-map-*

echo [6/6] Iniciando Metro con cache limpio...
echo.
echo ========================================
echo IMPORTANTE: Presiona R, R en el emulador
echo para recargar despues de que inicie
echo ========================================
echo.

npx expo start --dev-client --clear --reset-cache

pause
