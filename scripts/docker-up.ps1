# Levanta toda la plataforma DataOps con Docker Compose (SCRUM-8)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Creado .env desde .env.example — revisa contraseñas." -ForegroundColor Yellow
}

Write-Host "Iniciando stack DataOps Control Center..." -ForegroundColor Cyan
docker compose -f docker/docker-compose.yml up -d --build

Write-Host "`nEstado de servicios:" -ForegroundColor Cyan
docker compose -f docker/docker-compose.yml ps

Write-Host "`nVerificar tablas de metadatos:" -ForegroundColor Cyan
docker exec dataops-postgres-metadata psql -U dataops -d dataops_metadata -c "\dt"
