@echo off
echo ========================================
echo INICIO SÚPER RÁPIDO - INVESTI APP
echo ========================================

echo.
echo 1. Configurando variables de entorno para máxima velocidad...
set NODE_ENV=development
set EXPO_USE_FAST_RESOLVER=1
set EXPO_NO_DOTENV=1
set EXPO_NO_TYPESCRIPT_SETUP=1
set REACT_NATIVE_PACKAGER_CACHE_DISABLED=1
set METRO_CACHE=0

echo.
echo 2. Limpiando cache rápido...
del /q .expo\* 2>nul
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo.
echo 3. Iniciando con configuración optimizada...
npx expo start --dev-client --clear --no-dev --tunnel

echo.
echo ========================================
echo DESARROLLO SÚPER RÁPIDO INICIADO!
echo ========================================
pause
