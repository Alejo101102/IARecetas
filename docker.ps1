# Script PowerShell para gestionar Docker en IARecetas
# Alternativa a Makefile para Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "`n=== IARecetas Docker Manager ===" -ForegroundColor Cyan
    Write-Host "`nComandos disponibles:" -ForegroundColor Yellow
    Write-Host "  .\docker.ps1 up          " -NoNewline; Write-Host "- Levantar servicios (producción)" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 up-dev      " -NoNewline; Write-Host "- Levantar en modo desarrollo" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 down        " -NoNewline; Write-Host "- Detener servicios" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 restart     " -NoNewline; Write-Host "- Reiniciar servicios" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 logs        " -NoNewline; Write-Host "- Ver logs de todos los servicios" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 logs-backend" -NoNewline; Write-Host "- Ver logs del backend" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 logs-frontend" -NoNewline; Write-Host "- Ver logs del frontend" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 ps          " -NoNewline; Write-Host "- Estado de contenedores" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 clean       " -NoNewline; Write-Host "- Limpiar contenedores y volúmenes" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 rebuild     " -NoNewline; Write-Host "- Reconstruir desde cero" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 test        " -NoNewline; Write-Host "- Probar que los servicios funcionen" -ForegroundColor Gray
    Write-Host "  .\docker.ps1 run-tests   " -NoNewline; Write-Host "- Ejecutar tests en contenedores" -ForegroundColor Gray
    Write-Host ""
}

function Start-Services {
    Write-Host "`nLevantando servicios en modo producción..." -ForegroundColor Green
    docker-compose up -d
    Start-Sleep -Seconds 3
    Write-Host "`n✅ Servicios iniciados" -ForegroundColor Green
    Write-Host "Frontend: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:  " -NoNewline; Write-Host "http://localhost:5001" -ForegroundColor Cyan
}

function Start-Dev {
    Write-Host "`nLevantando servicios en modo desarrollo..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up
}

function Stop-Services {
    Write-Host "`nDeteniendo servicios..." -ForegroundColor Yellow
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}

function Restart-Services {
    Stop-Services
    Start-Services
}

function Show-Logs {
    docker-compose logs -f
}

function Show-BackendLogs {
    docker-compose logs -f backend
}

function Show-FrontendLogs {
    docker-compose logs -f frontend
}

function Show-Status {
    docker-compose ps
}

function Clean-All {
    Write-Host "`n⚠️  Esto eliminará todos los contenedores, imágenes y volúmenes" -ForegroundColor Red
    $confirm = Read-Host "¿Continuar? (s/N)"
    if ($confirm -eq 's' -or $confirm -eq 'S') {
        docker-compose down -v
        docker system prune -f
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
    }
}

function Rebuild-All {
    Write-Host "`nReconstruyendo imágenes..." -ForegroundColor Yellow
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "✅ Reconstrucción completada" -ForegroundColor Green
}

function Test-Services {
    Write-Host "`nProbando servicios..." -ForegroundColor Cyan
    
    Write-Host "`nBackend (http://localhost:5001):" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Backend OK - " -NoNewline -ForegroundColor Green
        Write-Host $response.Content
    } catch {
        Write-Host "❌ Backend ERROR" -ForegroundColor Red
    }
    
    Write-Host "`nFrontend (http://localhost:3000):" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Frontend ERROR" -ForegroundColor Red
    }
}

function Run-Tests {
    Write-Host "`nEjecutando tests en contenedores..." -ForegroundColor Cyan
    
    Write-Host "`nBackend Tests (pytest):" -ForegroundColor Yellow
    docker-compose run --rm backend pytest -v
    
    Write-Host "`nFrontend Tests (jest):" -ForegroundColor Yellow
    docker-compose run --rm frontend npm test -- --watchAll=false
}

# Main
switch ($Command.ToLower()) {
    "up" { Start-Services }
    "run-tests" { Run-Tests }
    "up-dev" { Start-Dev }
    "down" { Stop-Services }
    "restart" { Restart-Services }
    "logs" { Show-Logs }
    "logs-backend" { Show-BackendLogs }
    "logs-frontend" { Show-FrontendLogs }
    "ps" { Show-Status }
    "clean" { Clean-All }
    "rebuild" { Rebuild-All }
    "test" { Test-Services }
    "help" { Show-Help }
    default {
        Write-Host "Comando no reconocido: $Command" -ForegroundColor Red
        Show-Help
    }
}
