<#
.SYNOPSIS
    Crea la base de datos nativa (gis_database) y corre los mismos scripts SQL que usa
    el stack Docker (docker/init-db/01-init-schema.sql, 02-init-schema-4326.sql), sin
    modificarlos.

.DESCRIPTION
    Correr en PowerShell elevado, DESPUES de Install-Prerequisites.ps1 (necesita psql y el
    servicio de PostgreSQL corriendo) y DESPUES de Deploy-GeoServer.ps1 (que ya dejo
    configurado el datasource JNDI esperando a 'geoserver_user'/'geoserver_pass' en esta
    misma base - ver C:\tomcat9\webapps\geoserver\META-INF\context.xml).

    Idempotente: si 'gis_database' ya existe, asume que esto ya corrio antes y no
    reintenta (evita el error de "CREATE USER ya existe" de los scripts SQL, que no
    estan pensados para correr dos veces). Si necesitas repetirlo de cero, borra la base
    manualmente primero (ver nota al final).
#>

#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'

$PgBin   = 'C:\Program Files\PostgreSQL\16\bin'
$psql    = Join-Path $PgBin 'psql.exe'
$Deploy  = 'C:\deploy'
$sql1    = Join-Path $Deploy 'init-db\01-init-schema.sql'
$sql2    = Join-Path $Deploy 'init-db\02-init-schema-4326.sql'
$DbName  = 'gis_database'

foreach ($p in @($psql, $sql1, $sql2)) {
    if (-not (Test-Path $p)) { throw "No se encuentra $p" }
}

$pgSuperPasswordSecure = Read-Host -Prompt "Contrasena del superusuario 'postgres' (la que pusiste en Install-Prerequisites.ps1)" -AsSecureString
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToGlobalAllocUnicode($pgSuperPasswordSecure)
)

try {
    Write-Host "`n== Verificando conexion y si '$DbName' ya existe ==" -ForegroundColor Cyan
    $exists = & $psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "psql fallo al conectar (exit code $LASTEXITCODE). Salida: $exists`n" +
              "Lo mas probable es que la contrasena de 'postgres' ingresada no sea la correcta."
    }
    if ($exists -and $exists.Trim() -eq '1') {
        Write-Host "'$DbName' ya existe - asumo que esto ya se corrio antes, no hago nada mas." -ForegroundColor Yellow
        Write-Host "Si queres reinicializar de cero: 'DROP DATABASE $DbName;' con psql -U postgres y volve a correr este script."
        return
    }

    Write-Host "`n== Creando base '$DbName' ==" -ForegroundColor Cyan
    & $psql -U postgres -h localhost -c "CREATE DATABASE $DbName;"

    Write-Host "`n== Corriendo 01-init-schema.sql (EPSG:32721) ==" -ForegroundColor Cyan
    & $psql -U postgres -h localhost -d $DbName -v ON_ERROR_STOP=1 -f $sql1

    Write-Host "`n== Corriendo 02-init-schema-4326.sql (EPSG:4326) ==" -ForegroundColor Cyan
    & $psql -U postgres -h localhost -d $DbName -v ON_ERROR_STOP=1 -f $sql2

    Write-Host "`n== Verificacion ==" -ForegroundColor Cyan
    & $psql -U postgres -h localhost -d $DbName -c "\dt example_data.*"
    & $psql -U postgres -h localhost -d $DbName -c "\dt example_data_4326.*"
    & $psql -U postgres -h localhost -d $DbName -c "SELECT rolname FROM pg_roles WHERE rolname='geoserver_user';"

    Write-Host "`nBase de datos inicializada. Reiniciar el servicio Tomcat9 si ya estaba arrancado," -ForegroundColor Green
    Write-Host "para que GeoServer tome la conexion recien disponible:" -ForegroundColor Green
    Write-Host "  Restart-Service Tomcat9"
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
