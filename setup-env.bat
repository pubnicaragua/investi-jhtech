@echo off
echo ============================================
echo CONFIGURACION DE VARIABLES DE ENTORNO
echo ============================================
echo.

REM Verificar si .env ya existe
if exist .env (
    echo [!] El archivo .env ya existe.
    echo.
    choice /C YN /M "Deseas sobrescribirlo"
    if errorlevel 2 goto :end
    echo.
)

REM Copiar .env.example a .env
echo [+] Creando archivo .env desde .env.example...
copy .env.example .env >nul

echo.
echo [+] Archivo .env creado exitosamente!
echo.
echo ============================================
echo IMPORTANTE: CONFIGURA TU GROK API KEY
echo ============================================
echo.
echo 1. Abre el archivo .env en tu editor
echo 2. Reemplaza "tu-grok-api-key-aqui" con tu API key real:
echo    GROK_API_KEY=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
echo.
echo 3. Guarda el archivo
echo 4. Reinicia el servidor: npm start
echo.
echo NOTA: El archivo .env NO se subira a GitHub (esta en .gitignore)
echo.

:end
pause
