# Script para ejecutar tests localmente
param(
    [Parameter(Position=0)]
    [string]$Target = "all"
)

function Show-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Test-Backend {
    Show-Header "BACKEND TESTS (pytest)"
    
    Push-Location Backend
    
    Write-Host "Ejecutando tests del backend..." -ForegroundColor Yellow
    pytest -v --cov=. --cov-report=term-missing --cov-report=html
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n✅ Tests del backend PASSED" -ForegroundColor Green
        Write-Host "📊 Coverage report: Backend/htmlcov/index.html" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Tests del backend FAILED" -ForegroundColor Red
    }
    
    Pop-Location
    return $exitCode
}

function Test-Frontend {
    Show-Header "FRONTEND TESTS (Jest)"
    
    Push-Location Frontend
    
    Write-Host "Ejecutando tests del frontend..." -ForegroundColor Yellow
    npm test -- --coverage --watchAll=false
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n✅ Tests del frontend PASSED" -ForegroundColor Green
        Write-Host "📊 Coverage report: Frontend/coverage/lcov-report/index.html" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Tests del frontend FAILED" -ForegroundColor Red
    }
    
    Pop-Location
    return $exitCode
}

function Test-All {
    $backendResult = Test-Backend
    $frontendResult = Test-Frontend
    
    Show-Header "RESUMEN"
    
    if ($backendResult -eq 0) {
        Write-Host "Backend:  ✅ PASSED" -ForegroundColor Green
    } else {
        Write-Host "Backend:  ❌ FAILED" -ForegroundColor Red
    }
    
    if ($frontendResult -eq 0) {
        Write-Host "Frontend: ✅ PASSED" -ForegroundColor Green
    } else {
        Write-Host "Frontend: ❌ FAILED" -ForegroundColor Red
    }
    
    if ($backendResult -eq 0 -and $frontendResult -eq 0) {
        Write-Host "`n🎉 Todos los tests pasaron!" -ForegroundColor Green
        return 0
    } else {
        Write-Host "`n⚠️  Algunos tests fallaron" -ForegroundColor Yellow
        return 1
    }
}

# Main
switch ($Target.ToLower()) {
    "backend" { 
        exit (Test-Backend)
    }
    "frontend" { 
        exit (Test-Frontend)
    }
    "all" { 
        exit (Test-All)
    }
    default {
        Write-Host "Uso: .\test.ps1 [backend|frontend|all]" -ForegroundColor Yellow
        Write-Host "  backend  - Solo tests del backend" -ForegroundColor Gray
        Write-Host "  frontend - Solo tests del frontend" -ForegroundColor Gray
        Write-Host "  all      - Todos los tests (default)" -ForegroundColor Gray
        exit 1
    }
}
