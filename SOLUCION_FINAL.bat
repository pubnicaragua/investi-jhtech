@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           SOLUCION FINAL - TURBOMODULE ERROR               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Se han aplicado los siguientes cambios:
echo.
echo ✓ Eliminadas todas las importaciones de screenTesting.ts
echo ✓ Deshabilitado screenTesting en App.tsx
echo ✓ Deshabilitada nueva arquitectura React Native (newArchEnabled=false)
echo.
echo ════════════════════════════════════════════════════════════
echo PASOS PARA SOLUCIONAR:
echo ════════════════════════════════════════════════════════════
echo.
echo 1. EN TU DISPOSITIVO ANDROID:
echo    - Ve a Ajustes ^> Apps ^> Investi
echo    - Presiona "Forzar detencion"
echo    - DESINSTALA la app completamente
echo.
echo 2. LIMPIEZA COMPLETA:
echo.
pause

echo [1/8] Matando procesos...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM adb.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/8] Limpiando Metro cache...
rmdir /s /q "%TEMP%\metro-*" 2>nul
rmdir /s /q "%TEMP%\haste-map-*" 2>nul
rmdir /s /q "%TEMP%\react-*" 2>nul
rmdir /s /q .metro 2>nul

echo [3/8] Limpiando Expo cache...
rmdir /s /q .expo 2>nul

echo [4/8] Limpiando Watchman...
call watchman watch-del-all >nul 2>&1

echo [5/8] Limpiando Android build...
cd android
if exist gradlew (
    call gradlew clean >nul 2>&1
)
rmdir /s /q app\build 2>nul
rmdir /s /q build 2>nul
rmdir /s /q .gradle 2>nul
cd ..

echo [6/8] Limpiando node_modules cache...
rmdir /s /q node_modules\.cache 2>nul

echo [7/8] Limpiando npm cache...
call npm cache clean --force >nul 2>&1

echo [8/8] Ejecutando prebuild...
call npx expo prebuild --clean --no-install

echo.
echo ════════════════════════════════════════════════════════════
echo AHORA EJECUTA:
echo ════════════════════════════════════════════════════════════
echo.
echo   npx expo run:android
echo.
echo Esto compilara e instalara la app desde cero.
echo El proceso tomara 3-5 minutos.
echo.
echo ⚠️  SI AUN VES EL ERROR DE TURBOMODULE:
echo    1. Verifica que desinstalaste la app del dispositivo
echo    2. Ejecuta: adb devices (verifica que este conectado)
echo    3. Ejecuta: npx expo run:android --verbose
echo.
pause
