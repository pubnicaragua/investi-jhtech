@echo off
echo === COMMIT SIMPLE - PASO A PASO ===
echo.

cd /d "%~dp0"

echo [1/4] Agregando archivos...
git add FLUJO-APLICACION.md
git add GUIA-PRUEBAS.md
git add tests/
git add *.js
git add *.bat
echo Archivos agregados.

echo.
echo [2/4] Verificando estado...
git status --porcelain
echo.

echo [3/4] Haciendo commit...
git commit -m "feat: Agregar sistema de pruebas y documentacion completa"
echo Commit realizado.

echo.
echo [4/4] Subiendo al repositorio...
git push
echo.

echo === PROCESO COMPLETADO ===
pause
