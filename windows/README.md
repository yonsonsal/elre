# Despliegue nativo en Windows Server (sin Docker)

Procedimiento para instalar Open Plugineta en un Windows Server "pelado" (2022/2025), sin
contenedores: JDK + Tomcat 9 + GeoServer + la extensión `PluginetaGeoserverExt` + PostgreSQL/PostGIS,
todo nativo. Pensado para entornos que no permiten Docker (ej. VMware + Windows Server sin
contenedores). Si tu entorno sí soporta Docker, usá el [README principal](../README.md) en su
lugar — es más simple y es lo que se usa en desarrollo.

Probado de punta a punta en una VM de Windows Server 2025 en Google Cloud Platform.

## Qué instala

| Componente | Versión probada | Notas |
|---|---|---|
| JDK | Eclipse Temurin 17 | Requisito de GeoServer 2.28 |
| Apache Tomcat | 9.0.x | **No usar Tomcat 10+** — cambia el namespace de servlets (`jakarta.*` vs `javax.*`) y rompe la extensión sin recompilarla |
| PostgreSQL | 16.x | Instalador oficial EDB |
| PostGIS | 3.6.x | Bundle standalone (no requiere Stack Builder) |
| GeoServer | 2.28.0 | WAR oficial + `PluginetaGeoserverExt`/`GeoMvdCoreAPI`/`gson` en `WEB-INF/lib` |

## Paso 0 — Preparar los artefactos (en una máquina de desarrollo, no en el Server)

En un Mac/Linux con JDK 8 y JDK 17 instalados:

```bash
cd geomvd/GeoMvdCoreAPI
JAVA_HOME=$(/usr/libexec/java_home -v 1.8) mvn install -DskipTests

cd ../PluginetaGeoserverExt
JAVA_HOME=$(/usr/libexec/java_home -v 17) mvn package -DskipTests
```

Armar una carpeta (va a viajar entera al Server, por ejemplo `windows-deploy/`) con:

- `jars/GeoMvdCoreAPI-1.1.0-SNAPSHOT.jar`, `jars/PluginetaGeoserverExt-1.0.0-SNAPSHOT.jar` (de `target/` de cada módulo)
- `jars/gson-2.8.5.jar` (queda en `geomvd/PluginetaGeoserverExt/target/webapp-lib/` tras el build)
- `geoserver.war` — WAR oficial de GeoServer 2.28.0 (`geoserver-2.28.0-war.zip` en SourceForge, extraer el `.war` de adentro)
- `data_dir/` — copia completa de `server/geoserver/data_dir/` (excluyendo `logs/`, `temp/`, `tmp/` si existieran)
- `init-db/01-init-schema.sql`, `init-db/02-init-schema-4326.sql` (de `docker/init-db/`)
- `plugin-repo/<nombre>.zip` — el plugin QGIS compilado (`code/frontend/build-plugin.sh`)

Transferir esa carpeta al Server como `C:\deploy` (por RDP con redirección de carpetas, un bucket/share temporal, o el medio que tengas disponible — no hay un mecanismo único, depende de tu red).

## Paso 1 — Prerequisitos

En el Server, PowerShell **como Administrador**:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
cd C:\deploy
.\Install-Prerequisites.ps1
```

Instala JDK 17, descarga y registra Tomcat 9 como servicio de Windows (queda `Stopped` a
propósito — arranca recién en el paso 2), e instala PostgreSQL 16 en modo silencioso.

**Importante al correrlo:**
- Cuando pida la contraseña del superusuario `postgres`, **anotala** — se usa de nuevo en el paso 3.
- Tras ingresarla, el instalador de PostgreSQL corre **en silencio, sin imprimir nada, durante
  1-3 minutos**. No es que se colgó — **no interrumpir con Ctrl+C** en ese lapso.
- Al final se abre el instalador de **PostGIS**, que sí es interactivo (NSIS, no tiene modo
  silencioso confiable para los parámetros de conexión). Seguir los pasos que el script mismo
  imprime en pantalla antes de abrirlo.
- Es re-ejecutable: si falla a mitad de camino, se puede volver a correr tal cual. Si falla
  específicamente durante la descarga de PostgreSQL con
  `The process cannot access the file ... because it is being used by another process`, es
  un instalador anterior que quedó corriendo en segundo plano — verificar con
  `Get-Process | Where-Object ProcessName -like "*postgres*"` y matarlo antes de reintentar.

## Paso 2 — Desplegar GeoServer + la extensión

```powershell
cd C:\deploy
.\Deploy-GeoServer.ps1
```

Extrae el WAR, copia los 3 jars a `WEB-INF/lib`, copia `data_dir` a `C:\geoserver_data`
(seteando `GEOSERVER_DATA_DIR`), configura el datasource JNDI `jboss/datasources/pluginetaDS`,
y aplica automáticamente estos ajustes **necesarios porque el `data_dir` versionado está pensado
para el stack Docker**, no para Windows nativo:

- **Roles**: cambia `roleServiceName` de `ldap-roles` a `default` en `security/config.xml`. Sin
  LDAP (explícitamente fuera de alcance de este despliegue), cualquier login queda sin roles y
  todo lo que requiere administrador da 403, aunque el login en sí "funcione" visualmente.
- **Datastores nativos de GeoServer** (`demo-db`, `demo-db-4326` — el canal que realmente
  lee/escribe las capas WMS/WFS, aparte del JNDI de la extensión): apunta `host` de `db`
  (hostname de Docker Compose) a `localhost`, y `user`/`passwd` de `gis_user` al
  `geoserver_user`/`geoserver_pass` que crea el paso 3.
- **Permisos de archivo**: el servicio Tomcat9 corre como `NT AUTHORITY\LocalService`, que no
  tiene permiso de escritura sobre los archivos copiados. Sin este fix, GeoServer puede *leer*
  el catálogo al arrancar pero falla con `unable to remove existing ...xml` al intentar guardar
  cualquier cambio desde la consola web. (Se descartó que fuera file locking de Windows —
  Defender, indexado de búsqueda y el Lock Provider de GeoServer no tenían nada que ver; es
  puramente el ACL).

Al final arranca el servicio. Es normal ver errores de conexión a base de datos en los logs
hasta correr el paso 3.

Verificar: `Invoke-WebRequest http://localhost:8080/geoserver/web/ -UseBasicParsing` → 200.

## Paso 3 — Inicializar la base de datos

```powershell
cd C:\deploy
.\Init-Database.ps1
```

Pide la contraseña de `postgres` del paso 1, crea la base `gis_database`, y corre los mismos
`01-init-schema.sql`/`02-init-schema-4326.sql` que usa Docker (sin modificarlos) — crean los
schemas `example_data`/`example_data_4326` y el rol `geoserver_user`. Es idempotente: si
`gis_database` ya existe, no hace nada (evita el error de "CREATE USER ya existe" en un re-run).

Al final:
```powershell
Restart-Service Tomcat9
```

## Paso 4 — Verificar localmente

Esperar ~1 minuto y entrar (desde el propio Server, por RDP) a
`http://localhost:8080/geoserver/web/` con `admin`/`geoserver`. Confirmar:

- El menú completo aparece (Workspaces, Stores, Layers, etc.) — si falta, revisar que el paso 2
  haya corrido bien el ajuste de `roleServiceName`.
- **Stores** → `demo-db` y `demo-db-4326` sin ícono de error.
- **Layer Preview** → abrir cualquier capa (`points_of_interest`, `streets`, `zones`) en formato
  OpenLayers → se ven los datos.

También por REST (más rápido para scriptear):
```powershell
Invoke-WebRequest "http://localhost:8080/geoserver/rest/plugineta/ping" -UseBasicParsing -AllowUnencryptedAuthentication -Credential (Get-Credential -UserName "admin")
```
→ 200 confirma que la extensión cargó y puede hablar con la base vía JNDI.

## Paso 5 — Exponer (demo rápida con túnel, o producción con dominio propio)

### Demo rápida (URL efímera, sin dominio propio)

```powershell
cd C:\deploy
.\Start-Tunnel.ps1
```

Descarga `cloudflared` nativo y levanta un "quick tunnel" (mismo mecanismo que el perfil
`tunnel` de `docker-compose.yml`, sin Docker). Imprime una URL pública
`https://algo-random.trycloudflare.com` — cambia cada vez que se reinicia.

Con esa URL:
```powershell
[Environment]::SetEnvironmentVariable('PROXY_BASE_URL', 'https://<tu-url>.trycloudflare.com/geoserver', 'Machine')
[Environment]::SetEnvironmentVariable('GEOSERVER_CSRF_WHITELIST', 'trycloudflare.com', 'Machine')
Restart-Service Tomcat9
```

### Producción (dominio propio)

Mismo mecanismo que en Docker — ver
[Producción, con un dominio propio](../README.md#producción-con-un-dominio-propio) del README
principal: `PROXY_BASE_URL` apuntando a tu dominio real, `GEOSERVER_CSRF_WHITELIST` con ese
dominio, TLS terminado en tu propio reverse proxy/load balancer (no en Tomcat directamente).

## Paso 6 — Republicar el plugin QGIS con la URL pública real

En la máquina de desarrollo (no en el Server), con la URL del paso 5:

```bash
PLUGINETA_PUBLIC_URL=https://<tu-url-publica> ./code/frontend/publish-plugin-repo.sh
```

Esto regenera `im_layer_loader.zip` con esa URL horneada en su config. Copiar el resultado a
`C:\geoserver_data\plugineta-config\plugin-repo\im_layer_loader.zip` en el Server (sobreescribir
el que ya está) — no hace falta reiniciar el servicio, el controlador lee el zip del disco en
cada request.

Verificar: `https://<tu-url-publica>/geoserver/rest/plugineta/repo/plugins.xml` responde con el
XML del repositorio.

## Verificación end-to-end

1. `http://localhost:8080/geoserver/web/` responde, login admin funciona con menú completo
2. `/rest/plugineta/ping` responde 200
3. Ambos workspaces visibles con datos reales en Layer Preview
4. Plugin QGIS instalado desde el repositorio publicado (vía la URL del paso 5), login, carga de capas
5. Insert de prueba vía QGIS, confirmar que persiste en el PostgreSQL nativo

## Troubleshooting

| Síntoma | Causa | Fix |
|---|---|---|
| `service.bat install` falla con "service already exists" | Re-corriste `Install-Prerequisites.ps1` sin limpiar el servicio anterior | El script ya lo maneja (borra el servicio viejo antes de re-registrar). Si pasa igual: `sc.exe delete Tomcat9` manual y reintentar |
| Instalador de PostgreSQL falla con "being used by another process" | Instalador anterior interrumpido con Ctrl+C sigue corriendo en segundo plano | `Get-Process -Name postgresql* \| Stop-Process -Force`, borrar `C:\deploy\_prereq-downloads`, reintentar |
| Consola de GeoServer muestra solo "Layer Preview" en el menú, sin Workspaces/Stores/etc. | `roleServiceName` apunta a `ldap-roles` (no hay LDAP nativo) | Ya automatizado en `Deploy-GeoServer.ps1`. Si corriste una versión vieja del script: cambiar a mano `security/config.xml` → `<roleServiceName>default</roleServiceName>`, reiniciar servicio |
| Layer Preview da `Cannot create PoolableConnectionFactory ... host "db"` | Datastores nativos de GeoServer apuntan al hostname de Docker | Ya automatizado en `Deploy-GeoServer.ps1`. Si no: editar `host`/`user`/`passwd` en los `datastore.xml` de cada workspace (ver paso 2) |
| Guardar cualquier cosa en la consola web da `unable to remove existing ...xml` | ACL: el servicio corre como `LocalService` sin permiso de escritura sobre `data_dir` | Ya automatizado en `Deploy-GeoServer.ps1` (`icacls ... /grant "NT AUTHORITY\LocalService:(OI)(CI)M" /T`). **No** es un problema de file locking — no pierdas tiempo con exclusiones de Defender o cambiar el Lock Provider, no es eso |
