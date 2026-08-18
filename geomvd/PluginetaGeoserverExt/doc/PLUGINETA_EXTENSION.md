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
