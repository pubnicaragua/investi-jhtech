@echo off
echo ========================================
echo COMPILAR DEV CLIENT - INVESTI JHTECH
echo ========================================
echo.
echo Este proceso puede tomar 10-15 minutos la primera vez.
echo Asegurate de tener:
echo   - Android Studio instalado
echo   - SDK de Android configurado
echo   - Dispositivo/Emulador conectado
echo.
pause

echo.
echo [1/4] Verificando instalacion de dependencias...
if not exist node_modules (
    echo ERROR: Primero ejecuta setup-clean.bat
    pause
    exit /b 1
)

echo [2/4] Limpiando cache de Metro...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [3/4] Limpiando cache de Expo...
if exist .expo rmdir /s /q .expo

echo [4/4] Compilando Dev Client para Android...
echo.
echo IMPORTANTE: Este comando va a:
echo   - Descargar Gradle (si no existe)
echo   - Compilar modulos nativos
echo   - Instalar la app en tu dispositivo
echo.
call npx expo run:android

echo.
echo ========================================
echo COMPILACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes usar: npm start
echo.
pause
