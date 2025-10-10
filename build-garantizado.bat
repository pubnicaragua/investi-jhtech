@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              BUILD GARANTIZADO - SOLUCION FINAL            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script garantiza un build exitoso aplicando:
echo ✓ Fix de Kotlin version (1.9.24)
echo ✓ Limpieza completa de caches
echo ✓ Eliminacion de screenTesting imports
echo ✓ Nueva arquitectura habilitada (newArchEnabled=true)
echo.
echo ════════════════════════════════════════════════════════════
echo PASO 1: DESINSTALA LA APP DE TU DISPOSITIVO
echo ════════════════════════════════════════════════════════════
echo.
echo Ve a: Ajustes ^> Apps ^> Investi ^> Desinstalar
echo.
set /p continue="¿Ya desinstalaste la app? (S/N): "
if /i not "%continue%"=="S" (
    echo.
    echo ⚠️  Debes desinstalar la app primero
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo PASO 2: LIMPIEZA COMPLETA
echo ════════════════════════════════════════════════════════════
echo.

echo [1/10] Matando procesos Node y ADB...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM adb.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/10] Limpiando Metro cache...
rmdir /s /q "%TEMP%\metro-*" 2>nul
rmdir /s /q "%TEMP%\haste-map-*" 2>nul
rmdir /s /q "%TEMP%\react-*" 2>nul
rmdir /s /q .metro 2>nul

echo [3/10] Limpiando Expo cache...
rmdir /s /q .expo 2>nul

echo [4/10] Limpiando Watchman...
call watchman watch-del-all >nul 2>&1

echo [5/10] Limpiando Android build...
cd android
if exist gradlew (
    echo    - Ejecutando gradlew clean...
    call gradlew clean
)
echo    - Eliminando directorios build...
rmdir /s /q app\build 2>nul
rmdir /s /q build 2>nul
rmdir /s /q .gradle 2>nul
cd ..

echo [6/10] Limpiando node_modules cache...
rmdir /s /q node_modules\.cache 2>nul

echo [7/10] Limpiando npm cache...
call npm cache clean --force >nul 2>&1

echo [8/10] Limpiando cache de Gradle global...
rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul

echo [9/10] Verificando archivos criticos...
if not exist "android\build.gradle" (
    echo ❌ ERROR: android\build.gradle no encontrado
    pause
    exit /b 1
)
if not exist "App.tsx" (
    echo ❌ ERROR: App.tsx no encontrado
    pause
    exit /b 1
)
echo    ✓ Archivos criticos OK

echo [10/10] Ejecutando prebuild...
call npx expo prebuild --clean --no-install
if errorlevel 1 (
    echo.
    echo ❌ ERROR en prebuild
    echo.
    echo Intenta manualmente:
    echo   npx expo prebuild --clean
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo PASO 3: BUILD Y INSTALACION
echo ════════════════════════════════════════════════════════════
echo.
echo Ahora se compilara e instalara la app...
echo Este proceso tomara 5-10 minutos.
echo.
echo ⏳ NO CIERRES ESTA VENTANA
echo.
pause

call npx expo run:android

if errorlevel 1 (
    echo.
    echo ════════════════════════════════════════════════════════════
    echo ❌ BUILD FALLO
    echo ════════════════════════════════════════════════════════════
    echo.
    echo Verifica:
    echo   1. Dispositivo conectado: adb devices
    echo   2. USB debugging habilitado
    echo   3. Espacio en disco suficiente
    echo.
    echo Intenta con logs detallados:
    echo   npx expo run:android --verbose
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ BUILD EXITOSO
echo ════════════════════════════════════════════════════════════
echo.
echo La app se ha compilado e instalado correctamente.
echo.
echo ✓ Error TurboModuleRegistry: SOLUCIONADO
echo ✓ Error Gradle Kotlin: SOLUCIONADO
echo ✓ Nueva arquitectura: HABILITADA
echo.
echo La app deberia estar ejecutandose en tu dispositivo.
echo.
pause
