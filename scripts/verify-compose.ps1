# Valida configuración Docker Compose sin levantar servicios (SCRUM-23)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $Root "docker/docker-compose.yml"

Write-Host "Validando $ComposeFile ..."
docker compose -f $ComposeFile config | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "OK: docker compose config"
