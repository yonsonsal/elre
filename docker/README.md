# Entorno de Desarrollo Local - Plugineta

Este directorio contiene la configuración para levantar un entorno de desarrollo completo con Docker Compose.

## 🚀 Componentes

- **PostgreSQL + PostGIS**: Base de datos espacial
- **OpenLDAP**: Servidor de autenticación
- **phpLDAPadmin**: Interfaz web para administrar LDAP
- **GeoServer**: Servidor de mapas (Kartoza)

## 📋 Requisitos Previos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Al menos 6GB de RAM disponible
- Puertos disponibles: 5432, 389, 636, 8080, 8081

## 🔧 Inicio Rápido

Desde el directorio raíz del proyecto:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Verificar estado de los servicios
docker-compose ps

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ ELIMINA TODOS LOS DATOS)
docker-compose down -v
```

## 🌐 Acceso a los Servicios

Una vez iniciados, los servicios estarán disponibles en:

### GeoServer
- **URL**: http://localhost:8080/geoserver
- **Usuario**: `admin`
- **Contraseña**: `geoserver`

### phpLDAPadmin (Administración LDAP)
- **URL**: http://localhost:8081
- **Login DN**: `cn=admin,dc=plugineta,dc=local`
- **Contraseña**: `admin_password`

### PostgreSQL + PostGIS
- **Host**: `localhost`
- **Puerto**: `5432`
- **Base de datos**: `gis_database`
- **Usuario**: `gis_user`
- **Contraseña**: `gis_password`

#### Usuario para GeoServer:
- **Usuario**: `geoserver_user`
- **Contraseña**: `geoserver_pass`

### OpenLDAP
- **Host**: `localhost`
- **Puerto**: `389` (LDAP) / `636` (LDAPS)
- **Base DN**: `dc=plugineta,dc=local`
- **Admin DN**: `cn=admin,dc=plugineta,dc=local`
- **Admin Password**: `admin_password`

## 👥 Usuarios LDAP de Prueba

| Usuario | Password | Grupo | Descripción |
|---------|----------|-------|-------------|
| `admin_gis` | `admin123` | gis_admins, gis_editors, gis_viewers | Administrador con acceso completo |
| `editor_gis` | `editor123` | gis_editors, gis_viewers | Editor con permisos de edición |
| `viewer_gis` | `viewer123` | gis_viewers | Visualizador solo lectura |

**Email pattern**: `{usuario}@plugineta.local`

## 🗄️ Datos de Ejemplo

La base de datos se inicializa automáticamente con:

### Schema: `example_data`

1. **points_of_interest**: Puntos de interés (Plaza, Museo, Parque, etc.)
2. **streets**: Calles y rutas
3. **zones**: Zonas y distritos

Todas las tablas tienen geometrías en **EPSG:4326** (WGS84).

## 🔧 Configurar GeoServer con LDAP

### Opción 1: Interfaz Web (Recomendado para desarrollo)

1. Acceder a GeoServer: http://localhost:8080/geoserver
2. Login con admin/geoserver
3. Ir a **Security** → **Authentication**
4. Agregar nuevo **LDAP Authentication Provider**:
   - **Name**: `ldap-auth`
   - **Server URL**: `ldap://ldap:389/dc=plugineta,dc=local`
   - **User DN pattern**: `uid={0},ou=users`
   - **User search base**: `ou=users`
   - **User search filter**: `uid={0}`
5. En **Authentication Filter Chain**, agregar `ldap-auth` antes de `basic`

### Opción 2: Configuración Automática (TODO)

```bash
# Script para configurar LDAP en GeoServer automáticamente
./docker/scripts/configure-geoserver-ldap.sh
```

## 🗺️ Configurar PostGIS Store en GeoServer

### Vía Web UI:

1. Ir a **Stores** → **Add new Store** → **PostGIS**
2. Configurar:
   - **Workspace**: Crear uno nuevo (ej: `plugineta`)
   - **Data Source Name**: `plugineta-db`
   - **Host**: `postgis`
   - **Port**: `5432`
   - **Database**: `gis_database`
   - **Schema**: `example_data`
   - **User**: `geoserver_user`
   - **Password**: `geoserver_pass`
3. Guardar y publicar las capas desde el schema `example_data`

### Vía REST API:

```bash
# Crear workspace
curl -u admin:geoserver -X POST \
  http://localhost:8080/geoserver/rest/workspaces \
  -H 'Content-Type: application/json' \
  -d '{"workspace":{"name":"plugineta"}}'

# Crear datastore
curl -u admin:geoserver -X POST \
  http://localhost:8080/geoserver/rest/workspaces/plugineta/datastores \
  -H 'Content-Type: application/json' \
  -d '{
    "dataStore": {
      "name": "plugineta-db",
      "connectionParameters": {
        "host": "postgis",
        "port": "5432",
        "database": "gis_database",
        "schema": "example_data",
        "user": "geoserver_user",
        "passwd": "geoserver_pass",
        "dbtype": "postgis"
      }
    }
  }'
```

## 🧪 Verificar Conexiones

### PostgreSQL:
```bash
# Conectar con psql
docker exec -it plugineta-postgis psql -U gis_user -d gis_database

# Verificar tablas
\dt example_data.*

# Ver datos de ejemplo
SELECT name, category, ST_AsText(the_geom) FROM example_data.points_of_interest;
```

### LDAP:
```bash
# Buscar usuarios
ldapsearch -x -H ldap://localhost:389 \
  -D "cn=admin,dc=plugineta,dc=local" \
  -w admin_password \
  -b "ou=users,dc=plugineta,dc=local" \
  "(objectClass=inetOrgPerson)"

# Verificar grupos
ldapsearch -x -H ldap://localhost:389 \
  -D "cn=admin,dc=plugineta,dc=local" \
  -w admin_password \
  -b "ou=groups,dc=plugineta,dc=local" \
  "(objectClass=groupOfUniqueNames)"
```

### GeoServer:
```bash
# Verificar que GeoServer está corriendo
curl http://localhost:8080/geoserver/web/

# Listar workspaces
curl -u admin:geoserver \
  http://localhost:8080/geoserver/rest/workspaces.json | jq
```

## 🐛 Troubleshooting

### GeoServer no inicia
```bash
# Ver logs detallados
docker-compose logs geoserver

# Verificar que PostgreSQL está listo
docker-compose ps postgis

# Reiniciar solo GeoServer
docker-compose restart geoserver
```

### LDAP no responde
```bash
# Ver logs de LDAP
docker-compose logs ldap

# Verificar conectividad
docker exec plugineta-ldap ldapsearch -x -b "dc=plugineta,dc=local"
```

### PostgreSQL no acepta conexiones
```bash
# Ver logs
docker-compose logs postgis

# Verificar health status
docker inspect plugineta-postgis | jq '.[0].State.Health'
```

## 📊 Monitoreo de Recursos

```bash
# Ver uso de recursos de cada contenedor
docker stats

# Ver espacio usado por volúmenes
docker system df -v
```

## 🧹 Limpieza

```bash
# Detener servicios sin eliminar datos
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina todos los datos)
docker-compose down -v

# Eliminar también redes y imágenes huérfanas
docker-compose down -v --rmi local --remove-orphans
```

## 📝 Notas

- Los datos persisten en volúmenes Docker entre reinicios
- Las contraseñas son para desarrollo local, **NO usar en producción**
- El LDAP está configurado sin TLS para simplificar el desarrollo
- GeoServer puede tardar 1-2 minutos en estar completamente disponible

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Esta configuración es SOLO para desarrollo local.

Para producción debes:
- Cambiar TODAS las contraseñas
- Habilitar TLS/SSL en LDAP y GeoServer
- Configurar firewalls y restricciones de red
- Usar secrets management (Vault, etc.)
- Configurar backups automáticos
