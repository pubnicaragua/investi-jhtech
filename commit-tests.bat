@echo off
echo Subiendo archivos de prueba al repositorio...
echo.

cd /d "%~dp0"

echo Agregando archivos al staging area...
git add tests/
git add test-api.js
git add test-supabase-real.js
git add quick-test.js
git add run-tests.bat
git add playwright.config.js
git add GUIA-PRUEBAS.md
git add package.json

echo.
echo Verificando archivos agregados...
git status

echo.
echo Haciendo commit...
git commit -m "feat: Agregar sistema completo de pruebas automatizadas

- Agregar scripts de prueba para API y Supabase
- Configurar Playwright para pruebas E2E
- Incluir 44 pantallas detectadas en la aplicación
- Crear guía completa de ejecución de pruebas
- Configurar limpieza automática de datos de prueba
- Agregar soporte para Windows con scripts .bat

Archivos agregados:
- tests/e2e/config.js - Configuración de pruebas E2E
- tests/e2e/test-runner.js - Runner principal de Playwright
- tests/e2e/README.md - Documentación de pruebas E2E
- tests/simple-test-runner.js - Runner simplificado
- test-api.js - Verificación básica del proyecto
- test-supabase-real.js - Pruebas completas de Supabase
- quick-test.js - Prueba rápida de conectividad
- playwright.config.js - Configuración de Playwright
- GUIA-PRUEBAS.md - Guía completa de uso
- run-tests.bat - Script de ejecución para Windows"

echo.
echo Subiendo cambios al repositorio remoto...
git push

echo.
echo ¡Proceso completado!
echo Presiona cualquier tecla para continuar...
pause
