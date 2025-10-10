@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         BUILD EN LA NUBE (SIN ANDROID SDK LOCAL)           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Esta opcion compila la app en los servidores de Expo.
echo NO necesitas Android SDK instalado localmente.
echo.
echo ════════════════════════════════════════════════════════════
echo PASO 1: CONFIGURACION
echo ════════════════════════════════════════════════════════════
echo.

echo Verificando EAS CLI...
call npx eas-cli --version >nul 2>&1
if errorlevel 1 (
    echo Instalando EAS CLI...
    call npm install -g eas-cli
)

echo.
echo ════════════════════════════════════════════════════════════
echo PASO 2: LOGIN EN EXPO
echo ════════════════════════════════════════════════════════════
echo.
echo Se abrira el navegador para login...
call npx eas login

echo.
echo ════════════════════════════════════════════════════════════
echo PASO 3: BUILD PARA DESARROLLO
echo ════════════════════════════════════════════════════════════
echo.
echo Compilando APK de desarrollo...
echo Este proceso toma 10-15 minutos.
echo.
call npx eas build --profile development --platform android

if errorlevel 1 (
    echo.
    echo ❌ BUILD FALLO
    echo.
    echo Verifica:
    echo   1. Que iniciaste sesion correctamente
    echo   2. Que tienes conexion a internet
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ BUILD EXITOSO
echo ════════════════════════════════════════════════════════════
echo.
echo El APK se ha compilado en la nube.
echo.
echo Para instalarlo:
echo   1. Ve a: https://expo.dev/accounts/[tu-usuario]/projects/investi-app/builds
echo   2. Descarga el APK
echo   3. Instalalo en tu dispositivo
echo.
echo O escanea el QR code que aparecio arriba con tu dispositivo.
echo.
pause
