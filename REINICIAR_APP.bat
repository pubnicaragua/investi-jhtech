@echo off
echo ========================================
echo REINICIANDO INVESTI - LIMPIEZA COMPLETA
echo ========================================
echo.

echo [1/4] Deteniendo Metro Bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Limpiando cache de Metro...
rd /s /q %TEMP%\metro-* 2>nul
rd /s /q %TEMP%\react-* 2>nul

echo [3/4] Limpiando cache de Expo...
rd /s /q %USERPROFILE%\.expo\metro-cache 2>nul

echo [4/4] Iniciando Metro con cache limpio...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"

echo.
echo ========================================
echo LISTO! Ahora presiona 'r' en Metro
echo o recarga la app en tu dispositivo
echo ========================================
pause
