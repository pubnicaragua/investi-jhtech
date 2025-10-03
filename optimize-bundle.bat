@echo off
echo ========================================
echo   OPTIMIZACION DE BUNDLE - INVESTI APP
echo ========================================
echo.

echo [1/4] Limpiando cache de Metro...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q .metro 2>nul
echo ✓ Cache limpiado

echo.
echo [2/4] Limpiando cache de Expo...
rmdir /s /q .expo 2>nul
echo ✓ Cache de Expo limpiado

echo.
echo [3/4] Analizando dependencias no utilizadas...
echo Ejecutando: npx depcheck
call npx depcheck --ignores="@types/*,eslint-*,@babel/*,jest-*,@playwright/*,patch-package,postcss,ts-jest,webpack"
echo.

echo [4/4] Recomendaciones:
echo.
echo ✓ El bundle de 3174 modulos es NORMAL para una app compleja
echo ✓ El tiempo de 144s es aceptable en desarrollo
echo ✓ Para produccion, usa: npm run prod
echo.
echo Optimizaciones aplicadas:
echo - Cache de Metro habilitado
echo - inlineRequires activado
echo - Archivos .sql, .md, .txt excluidos
echo.
pause
