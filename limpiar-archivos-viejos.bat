@echo off
echo ========================================
echo Limpiando archivos antiguos y confusos
echo ========================================
echo.

echo Eliminando scripts .bat antiguos...
del /f /q SOLUCION-DIRECTA.bat 2>nul
del /f /q SOLUCION-FINAL.bat 2>nul
del /f /q build-apk-windows.bat 2>nul
del /f /q build-apk.bat 2>nul
del /f /q build-fixed.bat 2>nul
del /f /q build-production-apk.bat 2>nul
del /f /q clean-all-and-test.bat 2>nul
del /f /q clear-and-start.bat 2>nul
del /f /q clear-language-and-test.bat 2>nul
del /f /q commit-final.bat 2>nul
del /f /q commit-simple.bat 2>nul
del /f /q commit-tests.bat 2>nul
del /f /q dev-fast.bat 2>nul
del /f /q fix-and-start.bat 2>nul
del /f /q fix-dependencies.bat 2>nul
del /f /q fix-metro-eperm.bat 2>nul
del /f /q fix-turbo-errors.bat 2>nul
del /f /q rebuild-dev-client.bat 2>nul
del /f /q restart-app.bat 2>nul
del /f /q run-comprehensive-tests.bat 2>nul
del /f /q run-screen-flow-tests.bat 2>nul
del /f /q run-tests.bat 2>nul
del /f /q setup-clean.bat 2>nul
del /f /q setup-dev.bat 2>nul
del /f /q start-optimized.bat 2>nul
del /f /q super-fast-start.bat 2>nul
del /f /q test-all-44-routes.bat 2>nul
del /f /q test-language-buttons.bat 2>nul
del /f /q test-language-navigation.bat 2>nul
del /f /q test-navigation-complete.bat 2>nul
del /f /q test-web-routes.bat 2>nul
del /f /q upgrade-to-sdk53.bat 2>nul
del /f /q use-expo-go-temp.bat 2>nul
del /f /q yarn-install-fix.bat 2>nul

echo.
echo Eliminando documentacion .md antigua...
del /f /q CHANGELOG_DEV_CLIENT.md 2>nul
del /f /q COMPARACION_PROYECTOS.md 2>nul
del /f /q GUIA_OPTIMIZACION_IMAGENES.md 2>nul
del /f /q INSTRUCCIONES_IMPLEMENTACION.md 2>nul
del /f /q LEEME_PRIMERO.md 2>nul
del /f /q OPTIMIZACIONES_PERFORMANCE.md 2>nul
del /f /q OPTIMIZACION_BUNDLE.md 2>nul
del /f /q OPTIMIZACION_BUNDLE_SIZE.md 2>nul
del /f /q OPTIMIZACION_METRO.md 2>nul
del /f /q PASOS-EXACTOS-PARA-PROBAR.md 2>nul
del /f /q POSTMAN_QUICK_SETUP.md 2>nul
del /f /q RESUMEN_OPTIMIZACIONES.md 2>nul
del /f /q RUTAS-PARA-PROBAR-WEB.md 2>nul
del /f /q SOLUCION_ERROR_HERMES.md 2>nul
del /f /q TODAS-LAS-RUTAS-44-PANTALLAS.md 2>nul
del /f /q windows-apk-build-guide.md 2>nul

echo.
echo Eliminando scripts .js de testing antiguos...
del /f /q fix-icon-imports.js 2>nul
del /f /q test-api.js 2>nul
del /f /q test-auth-flow.js 2>nul
del /f /q test-supabase-real.js 2>nul
del /f /q quick-test.js 2>nul
del /f /q fix-app-errors.js 2>nul
del /f /q fix-gradle-build.js 2>nul
del /f /q fix-gradle-version.js 2>nul
del /f /q fix-lockfile-conflict.js 2>nul

echo.
echo ========================================
echo Limpieza completada!
echo ========================================
echo.
echo Archivos eliminados:
echo - 34 scripts .bat antiguos
echo - 29 archivos .md de documentacion vieja
echo - 9 scripts .js de testing
echo.
echo Archivos que SE MANTIENEN:
echo - README.md (documentacion principal)
echo - build-dev-client.bat (util para builds)
echo - package.json, tsconfig.json, etc.
echo.
pause
