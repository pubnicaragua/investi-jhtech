@echo off
echo ========================================
echo   Investi App - Setup de Desarrollo
echo ========================================
echo.

echo [1/4] Instalando dependencias...
call yarn install
if errorlevel 1 (
    echo Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando archivo .env...
if not exist .env (
    echo Creando .env desde .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edita el archivo .env con tus credenciales de Supabase
    echo.
)

echo.
echo [3/4] Limpiando cache...
rmdir /s /q .expo 2>nul
rmdir /s /q .metro 2>nul

echo.
echo [4/4] Setup completado!
echo.
echo ========================================
echo   Proximos pasos:
echo ========================================
echo.
echo 1. Edita el archivo .env con tus credenciales
echo 2. Construye el Development Build:
echo    npm run build:dev
echo.
echo 3. Instala el APK en tu telefono
echo.
echo 4. Para desarrollo diario:
echo    npm start
echo.
echo Ver DESARROLLO.md para mas informacion
echo ========================================
pause
