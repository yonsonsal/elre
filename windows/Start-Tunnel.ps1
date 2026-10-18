<#
.SYNOPSIS
    Descarga cloudflared nativo para Windows y levanta un "quick tunnel" hacia el
    GeoServer local (puerto 8080), igual mecanismo que el perfil 'tunnel' de
    docker-compose.yml pero sin Docker de por medio.

.DESCRIPTION
    Correr DESPUES de Deploy-GeoServer.ps1 / Init-Database.ps1 (GeoServer ya tiene que
    estar respondiendo en localhost:8080).

    El proceso de cloudflared queda corriendo en segundo plano (Start-Process, no -Wait).
    Para cortarlo: Stop-Process -Name cloudflared -Force

    La URL es efimera - cambia cada vez que se reinicia cloudflared. Despues de obtenerla
    hay que, en este orden: 1) setear PROXY_BASE_URL/GEOSERVER_CSRF_WHITELIST y reiniciar
    Tomcat, 2) re-publicar el plugin (im_layer_loader.zip) con esa URL horneada - ver
    windows/README.md.
#>

$ErrorActionPreference = 'Stop'

$CfDir = 'C:\cloudflared'
$CfExe = Join-Path $CfDir 'cloudflared.exe'
$LogFile = Join-Path $CfDir 'tunnel.log'

New-Item -ItemType Directory -Force -Path $CfDir | Out-Null

if (-not (Test-Path $CfExe)) {
    Write-Host "Descargando cloudflared..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile $CfExe
}

# Si ya habia un tunel corriendo de antes, lo corto para no acumular procesos
Get-Process -Name 'cloudflared' -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1
Remove-Item $LogFile -Force -ErrorAction SilentlyContinue

Write-Host "Levantando tunel hacia http://localhost:8080 ..." -ForegroundColor Cyan
Start-Process -FilePath $CfExe `
    -ArgumentList 'tunnel --no-autoupdate --url http://localhost:8080' `
    -RedirectStandardOutput $LogFile -RedirectStandardError "$LogFile.err" `
    -WindowStyle Hidden

Write-Host "Esperando que cloudflared asigne la URL (hasta 20s)..."
$url = $null
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    $content = Get-Content "$LogFile.err" -ErrorAction SilentlyContinue
    $match = $content | Select-String -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
    if ($match) {
        $url = $match.Matches[0].Value
        break
    }
}

if (-not $url) {
    throw "No pude leer la URL asignada en $LogFile.err tras 20s - revisar ese archivo a mano."
}

Write-Host "`nURL publica asignada: $url" -ForegroundColor Green
Write-Host "Guardala - la vas a necesitar para los proximos pasos (PROXY_BASE_URL y republicar el plugin)."
