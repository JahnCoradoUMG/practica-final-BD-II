# Genera docs/informe-tecnico.pdf desde docs/informe-tecnico.md (SCRUM-24)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Md = Join-Path $Root "docs/informe-tecnico.md"
$Css = Join-Path $Root "docs/informe-pdf.css"
$Pdf = Join-Path $Root "docs/informe-tecnico.pdf"

if (-not (Test-Path $Md)) {
  Write-Error "No existe $Md"
}

Write-Host "Generando PDF desde informe-tecnico.md (Python fpdf2) ..."
$Py = "C:\Users\cesar\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if (-not (Test-Path $Py)) { $Py = "python" }
& $Py (Join-Path $Root "scripts/build_informe_pdf.py")
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 2) { exit $LASTEXITCODE }

if (Test-Path $Pdf) {
  $sizeKb = [math]::Round((Get-Item $Pdf).Length / 1KB, 1)
  Write-Host "OK: $Pdf ($sizeKb KB)"
} else {
  Write-Error "No se genero el PDF"
}
