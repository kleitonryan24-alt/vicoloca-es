# Reescreve um arquivo como UTF-8 COM BOM (necessario para o
# Windows PowerShell 5.1 interpretar corretamente os acentos nos .ps1).
# Uso: powershell -ExecutionPolicy Bypass -File tools\codificar-com-bom.ps1 tools\gerar-paginas.ps1
param(
    [Parameter(Mandatory = $true)]
    [string]$Caminho
)

$destino = Join-Path (Get-Location) $Caminho
$texto = [IO.File]::ReadAllText($destino, [Text.Encoding]::UTF8)
[IO.File]::WriteAllText($destino, $texto, (New-Object Text.UTF8Encoding($true)))
Write-Host ("UTF-8 com BOM aplicado: " + $Caminho)
