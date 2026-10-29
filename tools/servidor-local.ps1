# Servidor estatico minimo para teste local do site (PowerShell puro).
# Uso: powershell -ExecutionPolicy Bypass -File tools\servidor-local.ps1
# Depois acesse http://localhost:8123/index.html
$raiz = Split-Path -Parent $PsscriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8123/")
$listener.Start()
Write-Host ("Servindo " + $raiz + " em http://localhost:8123/ (Ctrl+C para parar)")

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".webp" = "image/webp"
    ".xml"  = "application/xml; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"
    ".webmanifest" = "application/manifest+json; charset=utf-8"
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $caminho = $ctx.Request.Url.AbsolutePath
    if ($caminho -eq "/") { $caminho = "/index.html" }
    if ($caminho.EndsWith("/")) { $caminho = $caminho + "index.html" }
    $arquivo = Join-Path $raiz ($caminho -replace "/", "\")
    if ($arquivo.StartsWith($raiz) -and (Test-Path $arquivo) -and -not (Get-Item $arquivo).PSIsContainer) {
        $bytes = [IO.File]::ReadAllBytes($arquivo)
        $ext = [IO.Path]::GetExtension($arquivo).ToLower()
        $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" })
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $alvo = Join-Path $raiz "404.html"
        if (Test-Path $alvo) {
            $bytes = [IO.File]::ReadAllBytes($alvo)
            $ctx.Response.StatusCode = 404
            $ctx.Response.ContentType = "text/html; charset=utf-8"
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
        }
    }
    $ctx.Response.Close()
}
