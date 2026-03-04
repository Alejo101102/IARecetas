#!/usr/bin/env pwsh
# Script para instalar dependencias de testing

Write-Host "`n🔧 Instalando dependencias para testing..." -ForegroundColor Cyan

# Backend
Write-Host "`n📦 Backend (Python)..." -ForegroundColor Yellow
Push-Location Backend

if (Test-Path "venv") {
    Write-Host "✓ Entorno virtual ya existe" -ForegroundColor Green
} else {
    Write-Host "Creando entorno virtual..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "Activando entorno virtual..." -ForegroundColor Gray
& ".\venv\Scripts\Activate.ps1"

Write-Host "Instalando dependencias..." -ForegroundColor Gray
pip install -r requirements.txt --quiet

Write-Host "✅ Backend listo" -ForegroundColor Green
Pop-Location

# Frontend
Write-Host "`n📦 Frontend (Node.js)..." -ForegroundColor Yellow
Push-Location Frontend

if (Test-Path "node_modules") {
    Write-Host "✓ node_modules ya existe, actualizando..." -ForegroundColor Green
    npm install --quiet
} else {
    Write-Host "Instalando dependencias..." -ForegroundColor Gray
    npm install --quiet
}

Write-Host "✅ Frontend listo" -ForegroundColor Green
Pop-Location

Write-Host "`n✨ Todo listo! Ahora puedes ejecutar:" -ForegroundColor Green
Write-Host "  .\test.ps1          # Ejecutar todos los tests" -ForegroundColor Cyan
Write-Host "  .\test.ps1 backend  # Solo backend" -ForegroundColor Cyan
Write-Host "  .\test.ps1 frontend # Solo frontend" -ForegroundColor Cyan
Write-Host ""
