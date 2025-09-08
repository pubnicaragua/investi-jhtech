@echo off
echo Iniciando pruebas automatizadas de Investi App...
echo.

cd /d "%~dp0"

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo.
echo Ejecutando pruebas de base de datos y API...
node tests\simple-test-runner.js

echo.
echo Pruebas completadas. Presiona cualquier tecla para continuar...
pause
