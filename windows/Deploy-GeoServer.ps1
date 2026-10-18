<#
.SYNOPSIS
    Despliega GeoServer + la extension Plugineta en el Tomcat 9 nativo instalado por
    Install-Prerequisites.ps1, y arranca el servicio.

.DESCRIPTION
    Correr en PowerShell elevado (Administrador), DESPUES de Install-Prerequisites.ps1
    y ANTES de Init-Database.ps1 (el servicio queda arrancado al final, pero GeoServer
    todavia no va a poder conectar a la base hasta que esa base/usuario existan -
    es esperable ver errores de conexion a BD en los logs hasta correr ese paso).

    Asume que C:\deploy tiene la estructura armada en B1/B3:
        C:\deploy\geoserver.war
        C:\deploy\jars\{GeoMvdCoreAPI,PluginetaGeoserverExt,gson-2.8.5}*.jar
        C:\deploy\data_dir\...

    No configura PROXY_BASE_URL ni GEOSERVER_CSRF_WHITELIST todavia - eso se hace cuando
    se sepa la URL publica real (Fase 6 / B8, cloudflared). Mientras tanto GeoServer
    funciona bien en local/RDP con su deteccion automatica de URL.
#>

#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'

$Deploy     = 'C:\deploy'
$TomcatHome = 'C:\tomcat9'
$WebappDir  = Join-Path $TomcatHome 'webapps\geoserver'
$DataDirNative = 'C:\geoserver_data'

foreach ($p in @("$Deploy\geoserver.war", "$Deploy\jars", "$Deploy\data_dir")) {
    if (-not (Test-Path $p)) { throw "No se encuentra $p - revisar que B3 (copiar artefactos) se haya hecho bien." }
}

# ============================================================
# 0. Asegurar que el servicio esta detenido mientras desplegamos
# ============================================================
$svc = Get-Service -Name Tomcat9 -ErrorAction SilentlyContinue
if (-not $svc) { throw "El servicio Tomcat9 no existe. Correr Install-Prerequisites.ps1 primero." }
if ($svc.Status -ne 'Stopped') {
    Write-Host "Deteniendo Tomcat9 para desplegar..." -ForegroundColor Yellow
    Stop-Service -Name Tomcat9 -Force
    Start-Sleep -Seconds 3
}

# ============================================================
# 1. Extraer geoserver.war a webapps/geoserver (expandido, no como .war suelto -
#    asi podemos copiarle jars y el context.xml ANTES del primer arranque)
# ============================================================
Write-Host "`n== 1/4 Extrayendo geoserver.war ==" -ForegroundColor Cyan

if (Test-Path $WebappDir) {
    Write-Host "Ya existe $WebappDir, lo elimino antes de re-desplegar." -ForegroundColor Yellow
    Remove-Item $WebappDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $WebappDir | Out-Null

# Expand-Archive no valida la extension del archivo, solo que sea un zip valido (un .war lo es)
Expand-Archive -Path "$Deploy\geoserver.war" -DestinationPath $WebappDir -Force

$pgDriverJar = Get-ChildItem "$WebappDir\WEB-INF\lib" -Filter "postgresql-*.jar" -ErrorAction SilentlyContinue
if (-not $pgDriverJar) {
    throw "No se encontro el driver JDBC de PostgreSQL en WEB-INF/lib del WAR extraido - " +
          "inesperado, el soporte PostGIS deberia traerlo bundleado. Revisar el WAR descargado."
}
Write-Host "Driver JDBC de Postgres encontrado: $($pgDriverJar.Name)"

# ============================================================
# 2. Copiar los 3 jars de la extension Plugineta
# ============================================================
Write-Host "`n== 2/4 Copiando jars de PluginetaGeoserverExt ==" -ForegroundColor Cyan

Copy-Item "$Deploy\jars\*.jar" "$WebappDir\WEB-INF\lib\" -Force
Get-ChildItem "$WebappDir\WEB-INF\lib" -Filter "*.jar" | Where-Object {
    $_.Name -match '^(GeoMvdCoreAPI|PluginetaGeoserverExt|gson-2\.8\.5)'
} | ForEach-Object { Write-Host "  OK: $($_.Name)" }

# ============================================================
# 3. data_dir nativo + variable de entorno GEOSERVER_DATA_DIR
# ============================================================
Write-Host "`n== 3/4 Copiando data_dir a $DataDirNative ==" -ForegroundColor Cyan

if (Test-Path $DataDirNative) {
    Write-Host "Ya existe $DataDirNative, lo elimino antes de recopiar." -ForegroundColor Yellow
    Remove-Item $DataDirNative -Recurse -Force
}
Copy-Item "$Deploy\data_dir" $DataDirNative -Recurse -Force

[Environment]::SetEnvironmentVariable('GEOSERVER_DATA_DIR', $DataDirNative, 'Machine')
Write-Host "GEOSERVER_DATA_DIR = $DataDirNative"

# El data_dir original (server/geoserver/data_dir/security/config.xml) usa roleServiceName=
# "ldap-roles" porque el stack Docker tiene LDAP. Esta prueba de despliegue nativo deja LDAP
# explicitamente fuera de alcance (ver plan) - sin el, cualquier usuario autentica pero queda
# sin roles (la consulta de roles a LDAP no resuelve nada) y GeoServer responde 403 en todo lo
# que requiera ROLE_ADMINISTRATOR, aunque el login visualmente "funcione". El servicio de roles
# local 'default' (security/role/default/roles.xml) ya trae admin -> ADMIN mapeado, asi que
# alcanza con apuntar ahi en vez de a ldap-roles.
$securityConfigPath = Join-Path $DataDirNative 'security\config.xml'
(Get-Content $securityConfigPath -Raw) -replace
    '<roleServiceName>ldap-roles</roleServiceName>', '<roleServiceName>default</roleServiceName>' |
    Set-Content $securityConfigPath -NoNewline
Write-Host "security/config.xml: roleServiceName -> default (LDAP fuera de alcance en este despliegue)" -ForegroundColor Yellow

# Los datastores nativos de GeoServer (los que realmente leen/escriben las capas WMS/WFS, un
# canal de conexion totalmente aparte del JNDI pluginetaDS de arriba) tienen horneado el
# hostname de Docker Compose ("db") y el rol principal de la app ("gis_user"), que no existen
# en esta VM nativa. Los apuntamos al geoserver_user/geoserver_pass que crea Init-Database.ps1
# (mismos permisos de schema que gis_user tenia en Docker). La contrasena va en texto plano -
# GeoServer la re-encripta sola la primera vez que alguien guarda el store desde la consola web;
# si nunca se vuelve a guardar manualmente, se queda en texto plano y sigue funcionando igual
# (es el formato legacy, GeoServer lo acepta sin problema).
foreach ($ds in @(
    "$DataDirNative\workspaces\workspace-demo\demo-db\datastore.xml",
    "$DataDirNative\workspaces\workspace-demo-4326\demo-db-4326\datastore.xml"
)) {
    (Get-Content $ds -Raw) `
        -replace '<entry key="host">db</entry>', '<entry key="host">localhost</entry>' `
        -replace '<entry key="user">gis_user</entry>', '<entry key="user">geoserver_user</entry>' `
        -replace '<entry key="passwd">crypt2:[^<]+</entry>', '<entry key="passwd">geoserver_pass</entry>' |
        Set-Content $ds -NoNewline
}
Write-Host "Datastores nativos (demo-db, demo-db-4326): host/user/passwd apuntados a localhost/geoserver_user" -ForegroundColor Yellow

# El servicio Tomcat9 (registrado por service.bat install) corre como NT AUTHORITY\LocalService,
# que no tiene permiso de escritura/borrado sobre los archivos copiados (el ACL heredado solo da
# FullControl a SYSTEM/Administrators). Sin esto, GeoServer puede LEER el catalogo al arrancar
# pero falla con "unable to remove existing ...xml" al intentar guardar cualquier cambio desde
# la consola web (reemplazo atomico de archivo .tmp -> original) - NO es un problema de file
# locking de Windows (se descarto: Defender, indexado de busqueda y Lock Provider de GeoServer
# no tenian nada que ver), es simplemente el ACL.
icacls $DataDirNative /grant "NT AUTHORITY\LocalService:(OI)(CI)M" /T | Out-Null
Write-Host "Permisos de escritura otorgados a NT AUTHORITY\LocalService sobre $DataDirNative"

# ============================================================
# 4. JNDI DataSource (META-INF/context.xml del propio webapp)
# ============================================================
Write-Host "`n== 4/4 Configurando datasource JNDI 'jboss/datasources/pluginetaDS' ==" -ForegroundColor Cyan

# Mismo usuario/contrasena que crea literalmente docker/init-db/01-init-schema.sql
# (CREATE USER geoserver_user WITH PASSWORD 'geoserver_pass') - Init-Database.ps1 corre ese
# mismo script sin modificarlo, asi que tiene que coincidir. Es la misma credencial de demo/
# desarrollo que ya usa todo el stack Docker (no apta para produccion, ver docker/README.md).
$pgAppPasswordPlain = 'geoserver_pass'

$metaInfDir = Join-Path $WebappDir 'META-INF'
New-Item -ItemType Directory -Force -Path $metaInfDir | Out-Null

# name="jboss/datasources/pluginetaDS": asi lo busca GeoMvdCoreAPI via
# java:comp/env/jboss/datasources/pluginetaDS (ver server/geoserver/data_dir/plugineta-config/
# apps/plugineta/config.properties). geoserver_user/example_data* son los que crea
# docker/init-db/01-init-schema.sql + 02-init-schema-4326.sql (Init-Database.ps1 corre lo mismo).
$contextXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <Resource name="jboss/datasources/pluginetaDS"
              auth="Container"
              type="javax.sql.DataSource"
              factory="org.apache.tomcat.dbcp.dbcp2.BasicDataSourceFactory"
              driverClassName="org.postgresql.Driver"
              url="jdbc:postgresql://localhost:5432/gis_database"
              username="geoserver_user"
              password="$pgAppPasswordPlain"
              maxTotal="20"
              maxIdle="10"
              maxWaitMillis="10000"/>
</Context>
"@
Set-Content -Path (Join-Path $metaInfDir 'context.xml') -Value $contextXml -Encoding UTF8
Write-Host "META-INF/context.xml escrito en $metaInfDir"

# ============================================================
# Arrancar el servicio
# ============================================================
Write-Host "`n== Arrancando servicio Tomcat9 ==" -ForegroundColor Cyan
Start-Service -Name Tomcat9
Start-Sleep -Seconds 5
(Get-Service -Name Tomcat9) | Format-Table Name, Status

Write-Host @"

GeoServer desplegado. Puede tardar 1-2 minutos en levantar del todo.
Vas a ver errores de conexion a base de datos en los logs
(C:\tomcat9\logs\catalina.<fecha>.log) hasta que corras Init-Database.ps1 -
es esperable, la base/usuario 'geoserver_user' todavia no existen.

Verificar en un rato:
  Invoke-WebRequest http://localhost:8080/geoserver/web/ -UseBasicParsing
"@ -ForegroundColor Green
