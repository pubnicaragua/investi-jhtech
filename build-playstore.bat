@echo off
echo ================================
echo  BUILD AAB PARA PLAY STORE
echo ================================
echo.

echo [1/4] Verificando configuracion...
if not exist "app.config.js" (
    echo ERROR: app.config.js no encontrado
    exit /b 1
)

if not exist "eas.json" (
    echo ERROR: eas.json no encontrado
    exit /b 1
)

echo [2/4] Limpiando cache...
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul
echo Cache limpiado

echo.
echo [3/4] Iniciando build de AAB para Play Store...
echo Esto puede tardar varios minutos...
echo.

eas build --profile playstore --platform android --non-interactive

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: El build fallo
    echo Revisa los logs arriba para mas detalles
    pause
    exit /b 1
)

echo.
echo ================================
echo  BUILD COMPLETADO CON EXITO!
echo ================================
echo.
echo El archivo AAB estara disponible en EAS Build
echo Para descargarlo:
echo 1. Ve a https://expo.dev/accounts/[tu-cuenta]/projects/investi-app/builds
echo 2. Descarga el archivo .aab
echo 3. Subelo a Google Play Console
echo.
echo IMPORTANTE: El video splash se ha optimizado para produccion
echo y funcionara correctamente en la app distribuida.
echo.
pause
