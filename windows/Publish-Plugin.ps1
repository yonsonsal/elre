<#
.SYNOPSIS
    Re-publica el plugin QGIS (im_layer_loader.zip) con una URL publica distinta horneada en
    su configuracion - equivalente nativo de Windows de
    code/frontend/publish-plugin-repo.sh, pero corriendo directo sobre el ZIP ya instalado en
    el Server (no necesita el codigo fuente del plugin ni bash).

.DESCRIPTION
    Usar esto cada vez que cambie la URL publica del Server (ej. se reinicio el tunel de
    cloudflared y cambio la URL efimera, o se paso de demo con tunel a un dominio propio de
    produccion).

.PARAMETER PublicUrl
    La nueva URL publica, SIN barra final. Ejemplos:
      https://algo-nuevo.trycloudflare.com
      https://geoserver.miempresa.com

.EXAMPLE
    .\Publish-Plugin.ps1 -PublicUrl "https://otra-url.trycloudflare.com"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$PublicUrl
)

#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$PublicUrl = $PublicUrl.TrimEnd('/')
$PluginRepoDir = 'C:\geoserver_data\plugineta-config\plugin-repo'
$ZipPath = Join-Path $PluginRepoDir 'im_layer_loader.zip'

if (-not (Test-Path $ZipPath)) {
    throw "No se encuentra $ZipPath - este script espera que el plugin ya este publicado ahi (ver windows/README.md)."
}

$WorkDir = Join-Path $env:TEMP ("publish-plugin-" + [guid]::NewGuid())
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

try {
    Write-Host "Extrayendo $ZipPath ..." -ForegroundColor Cyan
    [System.IO.Compression.ZipFile]::ExtractToDirectory($ZipPath, $WorkDir)

    $propsFile = Join-Path $WorkDir 'im_layer_loader\modulos\properties\config.local.properties'
    if (-not (Test-Path $propsFile)) {
        throw "No se encontro $propsFile dentro del zip - estructura inesperada, revisar manualmente."
    }

    $content = Get-Content $propsFile -Raw

    # OJO: config.local.properties tiene VARIOS hosts ademas del de GeoServer (capas base de
    # OpenStreetMap, Google, montevideo.gub.uy, IDEuy...). Solo hay que tocar las 2 lineas que
    # apuntan al GeoServer propio (urlCapas, urlApi) - una regex generica de "cualquier http(s)://"
    # rompe las capas base (una version anterior de este script lo hacia asi: las capas de OSM/
    # Google terminaban pidiendo tiles a la URL del tunel en vez de a sus servidores reales).
    $newContent = $content `
        -replace '(?m)^(urlCapas=)https?://[^/]+', "`$1$PublicUrl" `
        -replace '(?m)^(urlApi=)https?://[^/]+', "`$1$PublicUrl"
    if ($newContent -eq $content) {
        Write-Host "Aviso: no se detecto ningun host para reemplazar en $propsFile - revisar el archivo a mano." -ForegroundColor Yellow
    }
    Set-Content -Path $propsFile -Value $newContent -NoNewline

    Write-Host "Config actualizada:" -ForegroundColor Cyan
    Get-Content $propsFile | Select-String 'http'

    # Re-zipear preservando "im_layer_loader/" como carpeta raiz DENTRO del zip (critico - ver
    # el aviso en repo.properties sobre por que el nombre interno de la carpeta importa).
    # includeBaseDirectory=$true es justamente el parametro de .NET para esto - no armar el zip
    # a mano entrada por entrada (una version anterior de este script lo hacia asi y tenia un
    # bug que anidaba todo un nivel de mas, rompiendo la instalacion en QGIS).
    Remove-Item $ZipPath -Force
    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        (Join-Path $WorkDir 'im_layer_loader'),
        $ZipPath,
        [System.IO.Compression.CompressionLevel]::Optimal,
        $true
    )

    Write-Host "`nRepublicado: $ZipPath con PublicUrl = $PublicUrl" -ForegroundColor Green
    Write-Host "No hace falta reiniciar Tomcat - el controlador lee el zip del disco en cada request."
}
finally {
    Remove-Item $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
}
