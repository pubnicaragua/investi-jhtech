@echo off
title INVESTI APP - TEST NAVEGACIÓN COMPLETO
echo ========================================
echo 🚀 TEST NAVEGACIÓN COMPLETO - INVESTI APP 🚀
echo ========================================

echo.
echo 🔧 Preparando entorno de testing...
set NODE_ENV=development
set DEBUG=1
set EXPO_DEBUG=1

echo.
echo 🧹 Limpieza completa...
if exist .expo rmdir /s /q .expo 2>nul
if exist .metro rmdir /s /q .metro 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo.
echo 📋 PLAN DE TESTING:
echo.
echo PASO 1: Verificar que la app inicie en LanguageSelection
echo PASO 2: Seleccionar un idioma (Español o English)
echo PASO 3: Verificar navegación automática a Welcome
echo PASO 4: Si falla, usar DevMenu para debug
echo.

echo 🔍 LOGS CLAVE A OBSERVAR:
echo.
echo 🌍 LanguageSelectionScreen: Iniciando selección de idioma: [es/en]
echo ✅ LanguageSelectionScreen: Idioma guardado exitosamente
echo 🔍 LanguageSelectionScreen: Verificación - idioma guardado: [es/en]
echo 🧭 LanguageSelectionScreen: Iniciando navegación a Welcome...
echo 🧭 LanguageSelectionScreen: Usando navigation.replace/navigate
echo.

echo 🛠️ HERRAMIENTAS DE DEBUG DISPONIBLES:
echo.
echo 1. DevMenu: Accesible desde la app (si está en desarrollo)
echo 2. Debug Storage: Para ver y limpiar AsyncStorage
echo 3. Logs detallados en esta consola
echo.

echo 📱 INSTRUCCIONES DETALLADAS:
echo.
echo SI LA NAVEGACIÓN NO FUNCIONA:
echo 1. Ve a DevMenu en la app
echo 2. Selecciona "🧪 Debug Storage"
echo 3. Usa "🧹 Limpiar Todo"
echo 4. Cierra y abre la app
echo 5. Deberías ver LanguageSelection de nuevo
echo 6. Intenta seleccionar idioma otra vez
echo.

echo SI AÚN NO FUNCIONA:
echo 1. Desinstala la app completamente
echo 2. Reinstala desde development build
echo 3. Debería empezar limpio en LanguageSelection
echo.

echo ⚡ Iniciando con configuración optimizada...
npx expo start --dev-client --clear --localhost

echo.
echo ========================================
echo ✅ TEST INICIADO - SIGUE LAS INSTRUCCIONES
echo ========================================
pause
