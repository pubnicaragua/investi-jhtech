@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  RECONSTRUCCION COMPLETA - SOLUCION TURBOMODULE ERROR      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este proceso tomara 5-10 minutos.
echo.
echo ⚠️  ANTES DE CONTINUAR:
echo    1. CIERRA la app completamente en tu dispositivo
echo    2. Ve a Ajustes ^> Apps ^> Investi ^> Forzar detencion
echo    3. Opcionalmente, DESINSTALA la app del dispositivo
echo.
set /p continue="¿Listo para continuar? (S/N): "
if /i not "%continue%"=="S" (
    echo Operacion cancelada.
    exit /b 0
)

echo.
echo ════════════════════════════════════════════════════════════
echo FASE 1: LIMPIEZA PROFUNDA
echo ════════════════════════════════════════════════════════════

echo [1/8] Deteniendo procesos...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM adb.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/8] Limpiando cache de Metro y React Native...
rmdir /s /q "%TEMP%\metro-*" 2>nul
rmdir /s /q "%TEMP%\haste-map-*" 2>nul
rmdir /s /q "%TEMP%\react-*" 2>nul
rmdir /s /q .metro 2>nul

echo [3/8] Limpiando cache de Expo...
rmdir /s /q .expo 2>nul

echo [4/8] Limpiando Watchman...
call watchman watch-del-all >nul 2>&1

echo [5/8] Limpiando builds de Android...
cd android
if exist gradlew (
    call gradlew clean >nul 2>&1
)
rmdir /s /q app\build 2>nul
rmdir /s /q build 2>nul
rmdir /s /q .gradle 2>nul
cd ..

echo [6/8] Limpiando cache de node_modules...
rmdir /s /q node_modules\.cache 2>nul

echo [7/8] Limpiando cache de npm...
call npm cache clean --force >nul 2>&1

echo [8/8] Limpiando archivos temporales de Expo...
rmdir /s /q "%USERPROFILE%\.expo" 2>nul

echo.
echo ════════════════════════════════════════════════════════════
echo FASE 2: RECONSTRUCCION DE MODULOS NATIVOS
echo ════════════════════════════════════════════════════════════
echo.
echo Esto puede tomar varios minutos...
echo.

echo [1/2] Ejecutando prebuild de Expo (limpia configuracion nativa)...
call npx expo prebuild --clean --no-install
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Prebuild fallo
    echo.
    echo Intenta ejecutar manualmente:
    echo   npx expo prebuild --clean
    echo.
    pause
    exit /b 1
)

echo [2/2] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Instalacion de dependencias fallo
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo FASE 3: COMPILACION Y EJECUCION
echo ════════════════════════════════════════════════════════════
echo.
echo Ahora se compilara e instalara la app en tu dispositivo...
echo Este proceso puede tomar 3-5 minutos.
echo.
echo ⏳ NO CIERRES ESTA VENTANA
echo.

call npx expo run:android

if errorlevel 1 (
    echo.
    echo ════════════════════════════════════════════════════════════
    echo ❌ LA COMPILACION FALLO
    echo ════════════════════════════════════════════════════════════
    echo.
    echo Posibles causas:
    echo   1. Dispositivo no conectado o no autorizado
    echo   2. Android SDK no configurado correctamente
    echo   3. Espacio insuficiente en disco
    echo.
    echo Intenta:
    echo   1. Verifica que tu dispositivo este conectado: adb devices
    echo   2. Asegurate de tener Android SDK instalado
    echo   3. Ejecuta: npx expo run:android --verbose
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ RECONSTRUCCION COMPLETADA EXITOSAMENTE
echo ════════════════════════════════════════════════════════════
echo.
echo La app deberia estar ejecutandose en tu dispositivo.
echo.
echo Si aun ves el error de TurboModuleRegistry:
echo   1. Desinstala completamente la app del dispositivo
echo   2. Ejecuta este script nuevamente
echo   3. Si persiste, verifica tu instalacion de Android SDK
echo.
pause
