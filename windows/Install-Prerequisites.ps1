<#
.SYNOPSIS
    Instala los prerequisitos del despliegue nativo de Plugineta en Windows Server:
    JDK 17 (Temurin), Apache Tomcat 9.x (como servicio, registrado pero detenido) y
    PostgreSQL 16 + PostGIS.

.DESCRIPTION
    Correr en PowerShell elevado (Administrador) en la propia VM/Server destino.
    Requiere conexion a internet saliente (descarga los instaladores oficiales).

    No arranca el servicio de Tomcat al final: GeoServer todavia no esta desplegado
    en webapps/. Eso lo hace Deploy-GeoServer.ps1 (siguiente paso), que configura la
    datasource JNDI y recien ahi arranca el servicio.

.NOTES
    Version de Tomcat y de PostgreSQL quedan fijadas (pinned) abajo. Si pasó mucho
    tiempo desde que se escribió este script, confirmar que las URLs siguen existiendo
    en https://archive.apache.org/dist/tomcat/tomcat-9/ y
    https://www.enterprisedb.com/download-postgresql-binaries antes de correrlo.
#>

#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'

$WorkDir = 'C:\deploy\_prereq-downloads'
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

# ============================================================
# 1. JDK 17 (Eclipse Temurin) - instalado vía MSI oficial, silencioso
# ============================================================
Write-Host "`n== 1/3 Instalando JDK 17 (Eclipse Temurin) ==" -ForegroundColor Cyan

$jdkInfo = Invoke-RestMethod -Uri 'https://api.adoptium.net/v3/assets/latest/17/hotspot?image_type=jdk&os=windows&architecture=x64'
$jdkUrl  = $jdkInfo[0].binary.installer.link
$jdkMsi  = Join-Path $WorkDir 'temurin17.msi'
Write-Host "Descargando $jdkUrl"
Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkMsi

$javaInstallDir = 'C:\Program Files\Eclipse Adoptium\jdk-17'
# ADDLOCAL/INSTALLDIR documentados en https://adoptium.net/installation/windows/ :
# FeatureMain (obligatorio, requiere INSTALLDIR) + FeatureEnvironment (PATH/JAVA_HOME)
# + FeatureJarFileRunWith (asociar .jar) + FeatureJavaHome (setea JAVA_HOME a nivel Machine)
$msiArgs = "/i `"$jdkMsi`" ADDLOCAL=FeatureMain,FeatureEnvironment,FeatureJarFileRunWith,FeatureJavaHome INSTALLDIR=`"$javaInstallDir`" /quiet /norestart"
Start-Process msiexec.exe -ArgumentList $msiArgs -Wait -NoNewWindow

# Refrescar variables de esta sesion de PowerShell (el instalador las seteo a nivel Machine,
# pero este proceso ya arrancado no las ve hasta que las releemos)
$env:JAVA_HOME = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'Machine')
$env:Path      = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')

if (-not $env:JAVA_HOME) {
    throw "JAVA_HOME no quedo seteado tras instalar el JDK. Revisar manualmente en Sistema > Variables de entorno."
}
Write-Host "JAVA_HOME = $env:JAVA_HOME"
& "$env:JAVA_HOME\bin\java.exe" -version

# ============================================================
# 2. Apache Tomcat 9.x - zip, registrado como servicio de Windows (detenido)
# ============================================================
Write-Host "`n== 2/3 Instalando Apache Tomcat 9.0.123 ==" -ForegroundColor Cyan

$tomcatVersion = '9.0.123'
$tomcatUrl     = "https://archive.apache.org/dist/tomcat/tomcat-9/v$tomcatVersion/bin/apache-tomcat-$tomcatVersion-windows-x64.zip"
$tomcatZip     = Join-Path $WorkDir 'tomcat9.zip'
Write-Host "Descargando $tomcatUrl"
Invoke-WebRequest -Uri $tomcatUrl -OutFile $tomcatZip

$tomcatHome = 'C:\tomcat9'
if (Test-Path $tomcatHome) {
    Write-Host "Ya existe $tomcatHome, lo elimino antes de reinstalar." -ForegroundColor Yellow
    Remove-Item $tomcatHome -Recurse -Force
}
Expand-Archive -Path $tomcatZip -DestinationPath 'C:\' -Force
Rename-Item -Path "C:\apache-tomcat-$tomcatVersion" -NewName 'tomcat9'

[Environment]::SetEnvironmentVariable('CATALINA_HOME', $tomcatHome, 'Machine')
$env:CATALINA_HOME = $tomcatHome

$existingSvc = Get-Service -Name Tomcat9 -ErrorAction SilentlyContinue
if ($existingSvc) {
    Write-Host "El servicio Tomcat9 ya existia (corrida anterior) - lo elimino antes de re-registrarlo." -ForegroundColor Yellow
    if ($existingSvc.Status -ne 'Stopped') { Stop-Service -Name Tomcat9 -Force }
    sc.exe delete Tomcat9 | Out-Null
    Start-Sleep -Seconds 2
}

Push-Location "$tomcatHome\bin"
try {
    # service.bat install registra el servicio de Windows leyendo JAVA_HOME/CATALINA_HOME
    # del entorno del proceso actual (ya seteados arriba)
    & .\service.bat install Tomcat9
} finally {
    Pop-Location
}

$svc = Get-Service -Name Tomcat9 -ErrorAction SilentlyContinue
if (-not $svc) {
    throw "El servicio Tomcat9 no quedo registrado. Revisar la salida de service.bat arriba."
}
Write-Host "Servicio '$($svc.Name)' registrado, estado: $($svc.Status) (se arranca recien en Deploy-GeoServer.ps1, despues de desplegar la app)" -ForegroundColor Yellow

# ============================================================
# 3. PostgreSQL 16 + PostGIS
# ============================================================
Write-Host "`n== 3/3 Instalando PostgreSQL 16.10 ==" -ForegroundColor Cyan

$pgUrl = 'https://get.enterprisedb.com/postgresql/postgresql-16.10-1-windows-x64.exe'
$pgExe = Join-Path $WorkDir 'postgresql16.exe'
Remove-Item $pgExe -Force -ErrorAction SilentlyContinue
Write-Host "Descargando $pgUrl"
Invoke-WebRequest -Uri $pgUrl -OutFile $pgExe

Write-Host "Vas a necesitar esta misma contrasena despues, en Init-Database.ps1." -ForegroundColor Yellow
$pgSuperPasswordSecure = Read-Host -Prompt "Contrasena para el superusuario 'postgres' de PostgreSQL" -AsSecureString
$pgSuperPasswordPlain  = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToGlobalAllocUnicode($pgSuperPasswordSecure)
)

# Flags de instalacion desatendida del instalador EDB (BitRock InstallBuilder) - documentados
# en https://www.postgresql.org/docs/current/install-windows-full.html
$pgArgs = "--mode unattended --unattendedmodeui none --superpassword `"$pgSuperPasswordPlain`" " +
          "--servicename postgresql-x64-16 --serverport 5432 --disable-components stackbuilder"
Start-Process -FilePath $pgExe -ArgumentList $pgArgs -Wait -NoNewWindow

$pgBin = 'C:\Program Files\PostgreSQL\16\bin'
if (-not (Test-Path $pgBin)) {
    throw "No se encontro $pgBin tras instalar PostgreSQL. Revisar si la instalacion fallo."
}
[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'Machine') + ";$pgBin", 'Machine')
$env:Path += ";$pgBin"
& "$pgBin\psql.exe" --version

Write-Host "`n== Instalando PostGIS 3.6 (bundle para PostgreSQL 16) ==" -ForegroundColor Cyan
$postgisUrl = 'https://download.osgeo.org/postgis/windows/pg16/postgis-bundle-pg16x64-setup-3.6.2-1.exe'
$postgisExe = Join-Path $WorkDir 'postgis-bundle.exe'
Write-Host "Descargando $postgisUrl"
Invoke-WebRequest -Uri $postgisUrl -OutFile $postgisExe

Write-Host @'

ATENCION - este paso es semi-manual: el instalador de PostGIS es un NSIS que no tiene
un modo silencioso documentado/confiable para los parametros de conexion a Postgres.
Se va a abrir una ventana - seguir estos pasos:

  1. Aceptar la licencia.
  2. Seleccionar la instalacion de PostgreSQL 16 detectada (puerto 5432).
  3. Usuario: postgres / la contrasena que acabas de ingresar arriba.
  4. Dejar "Create spatial database" SIN tildar - Init-Database.ps1 ya corre
     CREATE EXTENSION postgis sobre las bases que corresponden.
  5. Finalizar.

'@ -ForegroundColor Yellow
Start-Process -FilePath $postgisExe -Wait

Write-Host "`n== Prerequisitos instalados ==" -ForegroundColor Green
Write-Host "Verificar manualmente:"
Write-Host "  java -version"
Write-Host "  Get-Service Tomcat9"
Write-Host "  psql --version"
