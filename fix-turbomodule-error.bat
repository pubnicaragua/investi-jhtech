@echo off
echo ========================================
echo SOLUCION COMPLETA: TurboModuleRegistry Error
echo ========================================
echo.
echo IMPORTANTE: Cierra la app en tu dispositivo AHORA
echo.
pause

echo [1/10] Matando todos los procesos Node y Metro...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM adb.exe 2>nul
timeout /t 3 /nobreak >nul

echo [2/10] Limpiando cache de Metro...
rmdir /s /q %TEMP%\metro-* 2>nul
rmdir /s /q %TEMP%\haste-map-* 2>nul
rmdir /s /q .metro 2>nul

echo [3/10] Limpiando cache de React Native...
rmdir /s /q %TEMP%\react-native-* 2>nul
rmdir /s /q %TEMP%\react-* 2>nul

echo [4/10] Limpiando cache de Expo...
rmdir /s /q .expo 2>nul

echo [5/10] Limpiando Watchman...
call watchman watch-del-all 2>nul

echo [6/10] Limpiando build de Android...
cd android
call gradlew clean 2>nul
rmdir /s /q app\build 2>nul
rmdir /s /q build 2>nul
rmdir /s /q .gradle 2>nul
cd ..

echo [7/10] Limpiando node_modules cache...
rmdir /s /q node_modules\.cache 2>nul

echo [8/10] Reinstalando dependencias nativas criticas...
call npm install react-native@0.76.5 --force
call npm install expo@~53.0.0 --force

echo [9/10] Ejecutando prebuild de Expo...
call npx expo prebuild --clean

echo [10/10] Iniciando Metro con cache limpio...
echo.
echo ========================================
echo LIMPIEZA COMPLETA FINALIZADA
echo ========================================
echo.
echo AHORA EJECUTA:
echo   npx expo run:android
echo.
echo Esto reconstruira completamente la app con modulos nativos frescos
echo.
pause
