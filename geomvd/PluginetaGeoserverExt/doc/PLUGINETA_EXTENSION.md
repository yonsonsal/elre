# Extensión de GeoServer (`PluginetaGeoserverExt`)

Desde la migración de plataforma, el backend que consume el plugin QGIS **ya no es
WildFly** — es una extensión nativa que corre dentro del propio proceso de GeoServer
(Spring MVC, clases `@RestController extends RestBaseController`). WildFly sigue en el
repo pero dormido (`docker-compose --profile legacy up wildfly`), sin arrancar por
defecto.

- Código fuente: `geomvd/PluginetaGeoserverExt/`
- Especificación OpenAPI: [`openapi.yml`](openapi.yml)
- Se despliega como jar en `WEB-INF/lib` del propio GeoServer (ver el servicio
  `geoserver` en `docker-compose.yml` — monta `PluginetaGeoserverExt-*.jar`,
  `GeoMvdCoreAPI-*.jar` y `gson-*.jar`).

## Endpoints

Todo bajo `http://localhost:8080/geoserver/rest/plugineta/...`, con HTTP Basic Auth de
un usuario LDAP válido (ver [`../../../README.md`](../../../README.md#usuarios-ldap-de-prueba)).

| Método | Endpoint | Para qué lo usa el plugin |
|--------|----------|----------------------------|
| GET | `/rest/plugineta/public/{appName}/layers` | Listado de capas del workspace (no confirmado en tráfico real, se migró igual) |
| GET | `/rest/plugineta/public/{appName}/layers/atributocapaformat?capa=` | Metadata/atributos editables de una capa — se llama por cada capa cargada |
| GET | `/rest/plugineta/public/{appName}/layers/codiguerasdata` | Listas de valores para dropdowns, una vez por workspace |
| POST | `/rest/plugineta/public/{appName}/layers/getCalcFields?tabla=` | Campos calculados al editar una feature |

Repositorio de plugins QGIS (`PluginetaRepoController`, no lo usan las capas — lo usa QGIS mismo para instalar/actualizar el plugin). **Estos dos, a diferencia de todo lo demás en esta tabla, son públicos, sin auth** (ver regla propia en `rest.properties`) — mismo criterio que el repositorio oficial de `plugins.qgis.org`, y evita pedir credenciales dos veces (una para el repo, otra para el login del propio plugin):

| Método | Endpoint | Para qué sirve |
|--------|----------|-----------------|
| GET | `/rest/plugineta/repo/plugins.xml` | Índice del repositorio (formato `plugins.xml` de QGIS) |
| GET | `/rest/plugineta/repo/{fileName}.zip` | Descarga del plugin en sí, referenciada por `download_url` en el XML de arriba |

Diagnóstico (no los usa el plugin, son para verificar que la extensión está sana):

| Método | Endpoint | Qué confirma |
|--------|----------|----------------|
| GET | `/rest/plugineta/ping` | El jar fue descubierto por GeoServer y la seguridad deja pasar a un usuario autenticado |
| GET | `/rest/plugineta/ping/config?appName=` | `GeoServerResourceLoader` + `ConfigParser` resuelven y parsean la config de esa app |
| GET | `/rest/plugineta/ping/db` | El DataSource JNDI (`pluginetaDS`) conecta y puede correr una query real |

**Qué se dio de baja** (decisiones explícitas, no un olvido):
- `POST .../reportes/csv/{dbms}/{datasource}/{tabla}` (export CSV) — feature heredada de
  cuando la escritura pasaba por este backend; con WFS-T directo a GeoServer, ese export
  lo hace QGIS nativamente.
- `codiguerasformat` — no se vio en tráfico real del cliente QGIS de producción.
- El módulo de auditoría (`p_aw_contexto`) — queda para una iteración futura, pensado
  como un `TransactionListener`/`TransactionPlugin` de WFS-T de GeoServer, no un puerto
  directo del código viejo.

## Instalar el plugin QGIS como repositorio (en vez de "Install from ZIP")

Con GeoServer como backend completo, el plugin también se puede instalar y actualizar desde
QGIS como cualquier plugin del repositorio oficial, sin manejar ZIPs a mano:

1. En QGIS: **Plugins > Manage and Install Plugins > Settings > Plugin Repositories > Add**.
2. Nombre libre (ej. "Plugineta"), URL: `http://localhost:8080/geoserver/rest/plugineta/repo/plugins.xml`
   (reemplazar `localhost:8080` por el host real, ver [exponer la demo](#exponer-la-demo-afuera) más abajo).
   No hace falta configurar **Authentication** — el repositorio es público (ver la nota en la tabla
   de endpoints de arriba), así que la única contraseña que vas a tipear es la del login del plugin
   en sí, no una segunda para bajar el plugin.
3. Guardar. El plugin "Open Plugineta" aparece en la pestaña **All** del Plugin Manager, instalable
   con un click — y a partir de ahí, QGIS lo detecta y ofrece actualizarlo solo cuando cambia la
   versión en el repositorio.

**Publicar una versión nueva** — no requiere recompilar la extensión ni reiniciar GeoServer:
1. `cd code/frontend && ./build-plugin.sh` (después de bumpear `version=` en
   `im_layer_loader/metadata.txt`).
2. Copiar el ZIP resultante a
   `server/geoserver/data_dir/plugineta-config/plugin-repo/im_layer_loader.zip` — **el nombre
   del archivo tiene que quedar siempre igual** (ver aviso abajo), así que es un simple
   sobreescribir, no hay que renombrar nada.
3. Editar `plugineta-config/plugin-repo/repo.properties` — actualizar solo `version` (`fileName`
   no cambia entre versiones).

`PluginetaRepoController` lee esos archivos directo del data_dir (vía `GeoServerResourceLoader`,
igual que los `.ori`) en cada request — a diferencia de `ConfigParser` (ver el aviso de cache más
abajo), acá no hay ningún singleton en memoria, así que el cambio es instantáneo.

**Importante — el nombre del archivo no puede tener un punto antes de `.zip`**: el instalador de
QGIS, al instalar desde un repositorio, calcula el id interno del plugin cortando `file_name` en
el *primer* punto (`fileName.partition(".")[0]`) — con un nombre como `im_layer_loader-0.65.zip`
el primer punto cae en "0.65" (no antes de "zip"), y QGIS termina esperando una carpeta
`im_layer_loader-0`, que no existe (el zip trae `im_layer_loader/`, el nombre real del módulo
Python). Resultado: *"El complemento ha desaparecido... la carpeta .../im_layer_loader-0 no fue
encontrada"*, aunque el ZIP en sí esté perfecto. Por eso `fileName=im_layer_loader.zip` (un solo
punto, justo antes de `zip`) y la versión se versiona únicamente vía el tag `<version>` del XML,
nunca en el nombre del archivo.

## Exponer la demo afuera

Para que alguien fuera de tu red acceda a la demo (GeoServer + el repo de plugins de arriba) sin
publicar tu IP y con HTTPS, la forma más rápida es un túnel saliente — no requiere abrir puertos en
el router ni tener un dominio propio.

**Usamos [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), no ngrok**: el free tier de ngrok
interpone una página HTML de confirmación ("interstitial") ante cualquier visitante sin el header
`ngrok-skip-browser-warning` — lo cual traba tanto al instalador de QGIS (baja `plugins.xml`/el
zip con un cliente HTTP simple, no un navegador que pueda hacer click en "Visit Site") como al
propio plugin corriendo. Un "quick tunnel" de Cloudflare no tiene ese problema, no requiere cuenta
ni login. A cambio, la URL es efímera — cambia en cada arranque del túnel (igual que ngrok free).

```bash
# arranca el tunel (perfil opt-in, no corre con "docker compose up" normal)
docker compose --profile tunnel up -d cloudflared

# la URL asignada queda en los logs del contenedor
docker compose logs cloudflared | grep trycloudflare.com
```

Eso imprime una URL pública `https://xxxx-xx-xx.trycloudflare.com` que proxea a `geoserver:8080`
dentro de la red de Docker Compose (no hace falta que apunte a tu `localhost`, el contenedor
`cloudflared` habla directo con el contenedor `geoserver`).

### El repositorio (plugins.xml) anda solo — pero lo que instala el plugin, no

`PluginetaRepoController` genera `download_url` respetando `X-Forwarded-Proto`/`X-Forwarded-Host`,
así que el `plugins.xml` en sí ya apunta correcto al host público sin tocar nada. **El problema es
lo que hay DENTRO del ZIP**: el plugin trae su propio `config.local.properties` con
`urlApi`/`urlCapas` apuntando a `http://localhost:8080` — en la máquina de otra persona, "localhost"
es esa misma máquina, no la tuya. Sin corregir esto, el login del plugin y la carga de capas fallan
aunque el repositorio funcione perfecto.

### Una sola variable para las dos cosas: `PLUGINETA_PUBLIC_URL`

Con la URL del túnel en mano, `PLUGINETA_PUBLIC_URL` (variable de Docker Compose, en `.env`)
alimenta **dos** mecanismos distintos — hay que recrear los dos contenedores después de cambiarla:

```bash
# .env
PLUGINETA_PUBLIC_URL=https://xxxx-xx-xx.trycloudflare.com
```

**1. GeoServer mismo — `PROXY_BASE_URL`** (servicio `geoserver` en `docker-compose.yml`). Es una
*application property* nativa de GeoServer (no un invento de esta imagen ni de esta extensión) que
le dice al servidor bajo qué URL externa se lo ve, para que capabilities documents, enlaces
internos y redirecciones de login del admin apunten al host público en vez de a
`http://localhost:8080`:

```bash
docker compose up -d geoserver
```

Sin esto, GeoServer sigue creyendo que es `localhost:8080` detrás del túnel y esos enlaces salen
rotos aunque el proxy funcione. Está resuelto vía `docker-compose.yml`:
`PROXY_BASE_URL=${PLUGINETA_PUBLIC_URL:-http://localhost:8080}/geoserver` — vacía la variable, cae
al comportamiento de siempre.

**2. El plugin QGIS servido por el repo embebido — `urlApi`/`urlCapas`**:

```bash
# corre una vez y termina - no hace falta reiniciar geoserver para que sirva el zip nuevo
docker compose --profile publish up plugin-repo-publisher
```

Esto reempaqueta `im_layer_loader.zip` con `urlApi`/`urlCapas` apuntando a `PLUGINETA_PUBLIC_URL`
en vez de `localhost:8080`, y lo deja en `plugineta-config/plugin-repo/` — `PluginetaRepoController`
lo sirve al toque (lee el zip del disco en cada request, no lo cachea). El código fuente en git
nunca se toca: el reemplazo se hace en una copia temporal (ver
`code/frontend/publish-plugin-repo.sh`). Si `PLUGINETA_PUBLIC_URL` está vacía (o no corriste este
comando), el plugin se publica con el default `localhost:8080` de siempre — nada cambia para el uso
local normal.

Con las dos cosas hechas, cualquiera que instale el plugin desde
`https://xxxx-xx-xx.trycloudflare.com/geoserver/rest/plugineta/repo/plugins.xml` (repositorio
público, sin auth — ver más arriba) baja una copia ya configurada para hablarle al túnel, se
autentica, y ve/edita capas sin tocar nada en su máquina.

### La URL cambia en cada reinicio del túnel

Tanto el quick tunnel de Cloudflare como el free tier de ngrok asignan una URL nueva cada vez que
se reinician — está bien para una demo puntual, pero significa repetir los dos pasos de arriba
(`docker compose up -d geoserver` + `docker compose --profile publish up plugin-repo-publisher`)
con la URL nueva cada vez que se reinicia el túnel (y cualquiera que ya tenía el plugin instalado
necesita actualizarlo de nuevo desde QGIS). Si hace falta una URL estable para más de una sesión,
conviene un dominio propio en Cloudflare Tunnel (`cloudflared tunnel` con token, no el modo
`--url` de quick tunnel) o un plan pago de ngrok con subdominio reservado — mismo mecanismo de
arriba, solo cambia qué URL le pasás a `PLUGINETA_PUBLIC_URL`.

## Cómo testear que la extensión anda bien

### 1. El jar fue descubierto por GeoServer

```bash
docker-compose logs geoserver | grep -i pluginetaext
```

Y directo al endpoint de diagnóstico (con un usuario LDAP real — sin autenticar da
`401`, y eso también es una señal de que el filtro de seguridad de
`rest.properties` está activo):

```bash
curl -u admin_gis:admin123 http://localhost:8080/geoserver/rest/plugineta/ping
# {"status":"ok","extension":"PluginetaGeoserverExt"}
```

### 2. La config (`.ori`) de una app resuelve

```bash
curl -u admin_gis:admin123 \
  "http://localhost:8080/geoserver/rest/plugineta/ping/config?appName=workspace-demo"
# {"appName":"workspace-demo","capasCargadas":3,"nombres":["zones","streets","points_of_interest"]}
```

Si `capasCargadas` da `0` para un `appName` nuevo, el problema está en la config (ver
sección siguiente), no en la extensión.

### 3. La conexión a la base (JNDI) anda

```bash
curl -u admin_gis:admin123 http://localhost:8080/geoserver/rest/plugineta/ping/db
# {"status":"ok","filas":3}
```

### 4. Los 4 endpoints reales responden con datos

```bash
curl -u editor_gis:editor123 \
  "http://localhost:8080/geoserver/rest/plugineta/public/workspace-demo/layers/atributocapaformat?capa=zones"
```

Debería devolver el JSON de metadata de la capa (ver ejemplo en `openapi.yml`), **no**
un 401/403 (verificá el usuario/password) ni un 404 con `"no tiene metadata"` (revisá
que exista el `.ori` — ver más abajo).

### 5. Prueba end-to-end real: cargar capas desde QGIS

Es la única prueba que ejercita el camino completo (incluye la parte del plugin, no
solo el backend). Con el plugin instalado y apuntando a
`http://localhost:8080/geoserver` (`urlCapas` en `config.local.properties`):

1. Iniciar sesión con un usuario LDAP de prueba.
2. Seleccionar `workspace-demo` (o `workspace-demo-4326`) y cargar capas.
3. Confirmar que las 3 capas aparecen en el panel de capas, con geometría visible.
4. Abrir el formulario de atributos de una feature — si el formulario carga con los
   campos esperados (no aparece "No Existe Metadata De La Capa"), el circuito completo
   (auth → `atributocapaformat` → `configuraCapasProyecto`) funciona.

## Dónde van los `.ori` en este nuevo contexto

**Importante**: hay dos copias de la config en el repo, y solo una está viva.

- `server/wildfly/configuration/apps/plugineta/` — la copia **original**, congelada,
  solo relevante si se revive WildFly (`--profile legacy`). No se toca.
- `server/geoserver/data_dir/plugineta-config/apps/{appName}/` — la copia que **usa de
  verdad** esta extensión. Es la que hay que editar.

Cada `appName` (= nombre del workspace de GeoServer) tiene su propia carpeta ahí
adentro, con:

- `{appName}.app` — declara qué capas del workspace están habilitadas para el plugin
  (`<capa nombre="..."/>`, el `nombre` tiene que ser **el nombre real de la capa en
  GeoServer**, no un alias).
- Un `<capa>.ori` + `<capa>_md.xml` por cada capa listada en el `.app` — el `.ori`
  define workspace/tipo/EPSG/tabla de origen/atributos editables; el `_md.xml` es
  metadata adicional del formulario.

Ejemplo real (`workspace-demo`):

```
server/geoserver/data_dir/plugineta-config/apps/plugineta/
├── config.properties              # defaultEpsg, datasources, etc.
├── workspace-demo/
│   ├── workspace-demo.app
│   ├── zones.ori
│   ├── zones_md.xml
│   ├── streets.ori
│   ├── streets_md.xml
│   ├── poi.ori
│   └── poi_md.xml
└── workspace-demo-4326/
    └── ... (mismo patrón, epsg="4326")
```

Para agregar un workspace nuevo: crear la carpeta `{appName}/`, copiar el `.app` y los
`.ori`/`_md.xml` de un workspace existente como plantilla, y ajustar
`nombre`/`esquema`/`epsg` según corresponda.

**Importante — cache en memoria**: `ConfigParser.getInstanceAppMap(appName)` guarda un
singleton por `appName` (`instanceMap`, `HashMap` estático) — el `.ori` se parsea **una
sola vez**, la primera vez que se pide ese `appName`, y esa instancia se reutiliza para
siempre mientras el proceso de GeoServer siga vivo. Si editás un `.ori`/`.app` de un
`appName` que ya fue consultado antes, el cambio **no** se refleja hasta reiniciar
GeoServer (`docker compose restart geoserver`) — no hay refresh en caliente. Para un
`appName` nuevo (nunca antes consultado) no hace falta reiniciar nada: la primera
llamada real ya lo carga.

### Sobre el error "No Existe Metadata De La Capa"

Si ves este mensaje al cargar capas de `workspace-demo`/`workspace-demo-4326` en
particular, **no** es un `.ori` faltante — esos ya existen y están verificados. Antes de
crear un `.ori` nuevo, confirmá con el paso 4 de arriba (`curl` directo al endpoint) si
el problema es de credenciales/autenticación: `configuraCapasProyecto.py` arma el
formulario de cada capa reautenticándose contra este mismo endpoint, así que un fallo de
auth ahí produce exactamente este mensaje, sin que falte ningún archivo de config.
