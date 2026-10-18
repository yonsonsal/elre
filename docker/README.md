# Entorno de Desarrollo Local - Plugineta

Este directorio contiene los scripts de inicializacion (PostgreSQL, LDAP) que usa
`docker-compose.yml` (en la raiz del proyecto) para levantar el entorno completo.

> **Arquitectura y como levantar todo**: ver el [README principal](../README.md) — esta pagina es
> solo un complemento con comandos de verificacion y troubleshooting puntual. El backend activo
> es GeoServer + `PluginetaGeoserverExt` (no WildFly), y los workspaces/datastores de GeoServer
> ya vienen preconfigurados en `server/geoserver/data_dir/` — no hace falta crearlos a mano via
> REST API ni Web UI como sugerian versiones anteriores de este documento.

## Componentes que levanta `docker-compose.yml` (por defecto)

- **PostgreSQL + PostGIS**: base de datos espacial
- **OpenLDAP**: autenticacion
- **phpLDAPadmin**: interfaz web para administrar LDAP
- **GeoServer** (`docker.osgeo.org/geoserver`, con `PluginetaGeoserverExt` montada): backend activo

Servicios opcionales (perfiles `legacy`/`tunnel`/`publish`): ver [README principal](../README.md#componentes).

## Requisitos Previos

- Docker Engine 20.10+ / Docker Compose 2.0+
- Al menos 6GB de RAM disponible
- Puertos disponibles: 5432, 389, 636, 8080, 8081

## Comandos basicos

Desde el directorio raiz del proyecto:

```bash
docker compose up -d              # iniciar todos los servicios (default)
docker compose logs -f            # ver logs en tiempo real
docker compose ps                 # verificar estado
docker compose down               # detener servicios
docker compose down -v            # detener y eliminar volumenes (ELIMINA TODOS LOS DATOS)
```

## Acceso a los Servicios

| Servicio | URL / Conexion | Credenciales |
|---|---|---|
| GeoServer | http://localhost:8080/geoserver | admin / geoserver |
| phpLDAPadmin | http://localhost:8081 | cn=admin,dc=plugineta,dc=local / admin_password |
| PostgreSQL + PostGIS | localhost:5432, db `gis_database` | gis_user / gis_password |
| OpenLDAP | localhost:389 (LDAP) / 636 (LDAPS), base DN `dc=plugineta,dc=local` | cn=admin,dc=plugineta,dc=local / admin_password |

## Usuarios LDAP de Prueba

| Usuario | Password | Grupo | Descripcion |
|---|---|---|---|
| `admin_gis` | `admin123` | gis_admins, gis_editors, gis_viewers | Administrador con acceso completo |
| `editor_gis` | `editor123` | gis_editors, gis_viewers | Editor con permisos de edicion |
| `viewer_gis` | `viewer123` | gis_viewers | Visualizador solo lectura |

**Email pattern**: `{usuario}@plugineta.local`

## Datos de Ejemplo

Dos workspaces conviviendo (ver [Proyeccion y sistema de coordenadas en el README](../README.md#proyeccion-y-sistema-de-coordenadas)):

- `example_data` (schema PostGIS, EPSG:32721) → workspace GeoServer `workspace-demo`
- `example_data_4326` (schema PostGIS, EPSG:4326) → workspace GeoServer `workspace-demo-4326`

Ambos con las mismas 3 tablas conceptuales: `points_of_interest`, `streets`, `zones`.

## Verificar Conexiones

### PostgreSQL

```bash
docker exec -it plugineta-postgis psql -U gis_user -d gis_database

\dt example_data.*
SELECT name, category, ST_AsText(the_geom) FROM example_data.points_of_interest;
```

### LDAP

```bash
ldapsearch -x -H ldap://localhost:389 \
  -D "cn=admin,dc=plugineta,dc=local" -w admin_password \
  -b "ou=users,dc=plugineta,dc=local" "(objectClass=inetOrgPerson)"

ldapsearch -x -H ldap://localhost:389 \
  -D "cn=admin,dc=plugineta,dc=local" -w admin_password \
  -b "ou=groups,dc=plugineta,dc=local" "(objectClass=groupOfUniqueNames)"
```

### GeoServer

```bash
curl -u admin:geoserver http://localhost:8080/geoserver/rest/workspaces.json

# la extension activa (PluginetaGeoserverExt) responde en:
curl -u admin_gis:admin123 http://localhost:8080/geoserver/rest/plugineta/ping
```

## Troubleshooting

### GeoServer no inicia, o la extension no responde

```bash
docker compose logs geoserver
docker compose ps db                # confirmar que Postgres esta healthy
docker compose restart geoserver
```

Si el problema es que los endpoints `/rest/plugineta/...` dan 404, ver la nota sobre compilar
`PluginetaGeoserverExt`/`GeoMvdCoreAPI` en el [README principal](../README.md#3-compilar-el-backend-activo-extension-de-geoserver).

### LDAP no responde

```bash
docker compose logs ldap
docker exec plugineta-ldap ldapsearch -x -b "dc=plugineta,dc=local"
```

### PostgreSQL no acepta conexiones

```bash
docker compose logs db
docker inspect plugineta-postgis --format '{{json .State.Health}}'
```

## Limpieza

```bash
docker compose down                                    # sin eliminar datos
docker compose down -v                                 # CUIDADO: elimina todos los datos
docker compose down -v --rmi local --remove-orphans    # + imagenes/redes huerfanas
```

## Notas

- Los datos persisten en volumenes Docker entre reinicios.
- Las contrasenas son para desarrollo local — **no usar en produccion**.
- El LDAP esta configurado sin TLS para simplificar el desarrollo.
- GeoServer puede tardar 1-2 minutos en estar completamente disponible la primera vez.

## Seguridad

Esta configuracion es **solo para desarrollo local**. Para un despliegue real hay que cambiar
todas las contrasenas, habilitar TLS/SSL, restringir red/firewall, y gestionar secretos
apropiadamente — ver la seccion [Produccion, con un dominio propio](../README.md#produccion-con-un-dominio-propio)
del README principal para lo especifico de exponer GeoServer con HTTPS y CSRF.
