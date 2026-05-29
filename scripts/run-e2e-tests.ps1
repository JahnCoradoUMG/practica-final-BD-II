# Ejecuta pruebas E2E contra API + PostgreSQL metadatos (SCRUM-23)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$env:METADATA_DB_HOST = if ($env:METADATA_DB_HOST) { $env:METADATA_DB_HOST } else { "localhost" }
$env:METADATA_DB_PORT = if ($env:METADATA_DB_PORT) { $env:METADATA_DB_PORT } else { "5432" }
$env:POSTGRES_TEST_HOST = if ($env:POSTGRES_TEST_HOST) { $env:POSTGRES_TEST_HOST } else { "localhost" }
$env:POSTGRES_TEST_PORT = if ($env:POSTGRES_TEST_PORT) { $env:POSTGRES_TEST_PORT } else { "5433" }
$env:REDIS_HOST = if ($env:REDIS_HOST) { $env:REDIS_HOST } else { "localhost" }

Write-Host "DataOps E2E — metadatos $($env:METADATA_DB_HOST):$($env:METADATA_DB_PORT), motor prueba $($env:POSTGRES_TEST_HOST):$($env:POSTGRES_TEST_PORT)"

Push-Location (Join-Path $Root "backend")
try {
  npm install --no-fund
  npm run test:e2e
} finally {
  Pop-Location
}

Write-Host "Evidencias en: docs/e2e/evidence/"
