# Script para crear archivo .env con GROK_API_KEY
# Este archivo NO se sube a GitHub (está en .gitignore)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CREANDO ARCHIVO .ENV CON GROK API KEY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$envContent = @"
# ============================================================================
# CONFIGURACIÓN DE VARIABLES DE ENTORNO - INVESTI APP
# ============================================================================
# 
# IMPORTANTE: Este archivo NO se sube a GitHub (está en .gitignore)
#
# ============================================================================

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5MjE1NjAsImV4cCI6MjA0MzQ5NzU2MH0.kYvLZqH0Ug3_qXQVQqYQqYQqYQqYQqYQqYQqYQqYQqY

# Grok API Configuration (para Chat con IRI)
# API key configurada para el chat de IRI
EXPO_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui
"@

# Crear archivo .env
$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "[!] El archivo .env ya existe." -ForegroundColor Yellow
    $response = Read-Host "¿Deseas sobrescribirlo? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "[X] Operación cancelada." -ForegroundColor Red
        exit
    }
}

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "[✓] Archivo .env creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "GROK_API_KEY configurada: [OCULTA POR SEGURIDAD]" -ForegroundColor Green
Write-Host ""
Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host "1. Reinicia el servidor: npm start" -ForegroundColor White
Write-Host "2. Abre la app y ve a 'Chat con IRI'" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: El archivo .env NO se subirá a GitHub ✓" -ForegroundColor Green
Write-Host ""
