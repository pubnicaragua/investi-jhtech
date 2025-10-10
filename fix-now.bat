@echo off
echo ========================================
echo SOLUCION INMEDIATA - TURBOMODULE ERROR
echo ========================================
echo.

echo [1/5] Matando todos los procesos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM adb.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Limpiando cache de Metro...
rmdir /s /q %TEMP%\metro-* 2>nul
rmdir /s /q %TEMP%\haste-map-* 2>nul
rmdir /s /q %TEMP%\react-* 2>nul

echo [3/5] Limpiando cache de Expo...
rmdir /s /q .expo 2>nul

echo [4/5] Limpiando Watchman...
call watchman watch-del-all 2>nul

echo [5/5] Iniciando Metro limpio...
echo.
echo ========================================
echo AHORA:
echo 1. Cierra COMPLETAMENTE la app en tu dispositivo
echo 2. Presiona cualquier tecla para iniciar Metro
echo 3. Cuando Metro inicie, presiona 'a' para Android
echo ========================================
pause

start cmd /k "npx expo start --clear"
