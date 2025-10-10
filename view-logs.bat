@echo off
echo ========================================
echo   INVESTI APP - LOGS EN TIEMPO REAL
echo ========================================
echo.
echo Mostrando logs de la app...
echo Presiona Ctrl+C para detener
echo.

REM Limpiar logs anteriores
adb logcat -c

REM Mostrar logs filtrados de la app
adb logcat -v time ReactNativeJS:V ReactNative:V Expo:V *:E | findstr /V "ViewRootImpl Choreographer"

pause
