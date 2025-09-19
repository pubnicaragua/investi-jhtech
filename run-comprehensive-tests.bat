@echo off
echo ========================================
echo INVESTI APP - COMPREHENSIVE ERROR DETECTION
echo ========================================
echo.

echo 🚀 Iniciando servidor de desarrollo...
start "Expo Dev Server" cmd /k "cd /d %~dp0 && npm start"

echo ⏳ Esperando que el servidor inicie (30 segundos)...
timeout /t 30 /nobreak > nul

echo 🧪 Ejecutando tests comprehensivos de detección de errores...
npx playwright test tests/e2e/comprehensive-error-detection-test.js --config=playwright.config.comprehensive.js

echo.
echo 📊 Abriendo reporte de resultados...
start "" "playwright-report/index.html"

echo.
echo ✅ Tests completados. Revisa el reporte HTML para ver todos los errores detectados.
pause
