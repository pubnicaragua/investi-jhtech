@echo off
echo ========================================
echo   INVESTI APP - TODOS LOS LOGS
echo ========================================
echo.
echo Mostrando TODOS los logs (puede ser mucho)...
echo Presiona Ctrl+C para detener
echo.

REM Limpiar logs anteriores
adb logcat -c

REM Mostrar TODOS los logs con timestamp
adb logcat -v time

pause
