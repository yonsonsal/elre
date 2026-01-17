# Open Plugineta

Sistema de gestion de capas geoespaciales para QGIS con backend Java y autenticacion LDAP.

## Descripcion

Open Plugineta es una plataforma que permite:

- **Cargar capas geoespaciales** en QGIS desde un servidor centralizado
- **Gestionar permisos** de acceso a capas por usuario/grupo via LDAP
- **Publicar mapas** a traves de GeoServer con autenticacion integrada
- **Generar reportes** y exportar datos en multiples formatos

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   QGIS Plugin   │────▶│  Backend Java   │────▶│   PostgreSQL    │
│ (im_layer_loader)│     │   (WildFly)     │     │   + PostGIS     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   GeoServer     │────▶│    OpenLDAP     │
                        │   (WFS/WMS)     │     │ (Autenticacion) │
                        └─────────────────┘     └─────────────────┘
```

## Componentes

| Componente | Descripcion | Puerto |
|------------|-------------|--------|
| **Backend (WildFly)** | API REST para gestion de capas | 8082 |
| **GeoServer** | Servidor de mapas WFS/WMS | 8080 |
| **PostgreSQL + PostGIS** | Base de datos espacial | 5432 |
| **OpenLDAP** | Autenticacion de usuarios | 389 |
| **phpLDAPadmin** | Interfaz web para LDAP | 8081 |

## Requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- QGIS 3.22+ (para el plugin)
- Java 8+ y Maven 3.6+ (para desarrollo del backend)
- 6GB RAM minimo disponible

## Inicio Rapido

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/open-plugineta.git
cd open-plugineta
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores si es necesario
```

### 3. Iniciar los servicios

```bash
docker-compose up -d
```

### 4. Verificar que los servicios esten corriendo

```bash
docker-compose ps
```

### 5. Acceder a los servicios

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| GeoServer | http://localhost:8080/geoserver | admin / geoserver |
| phpLDAPadmin | http://localhost:8081 | cn=admin,dc=plugineta,dc=local / admin_password |
| Backend API | http://localhost:8082/api/plugineta | - |

## Estructura del Proyecto

```
open-plugineta/
├── code/
│   ├── backend/               # Backend Java (WildFly)
│   │   ├── GeoMvd-App/       # Modulo WAR principal
│   │   ├── GeoMvd-App-ejb/   # Modulo EJB
│   │   ├── Files/            # Archivos de configuracion
│   │   └── specs/            # Especificacion OpenAPI
│   └── frontend/
│       └── im_layer_loader/  # Plugin QGIS
├── docker/
│   ├── init-db/              # Scripts inicializacion PostgreSQL
│   └── ldap-init/            # Configuracion inicial LDAP
├── server/
│   ├── geoserver/            # Configuracion GeoServer
│   │   └── data_dir/         # Directorio de datos (versionado)
│   └── wildfly-docker/       # Dockerfile para WildFly
└── docker-compose.yml
```

## Configuracion

### Backend (Java)

Los archivos de configuracion estan en `code/backend/Files/`:

```bash
# Copiar template de configuracion
cp code/backend/Files/config.properties.example code/backend/Files/config.local.properties
```

Editar `config.local.properties` segun tu entorno:

```properties
# URL del GeoServer
URLgeoserver=http://localhost:8080/geoserver

# Datasources (deben coincidir con standalone.xml de WildFly)
brfDS=jboss/datasources/brfDS
```

### Plugin QGIS

Los archivos de configuracion estan en `code/frontend/im_layer_loader/modulos/properties/`:

```bash
# Copiar template de configuracion
cp code/frontend/im_layer_loader/modulos/properties/config.local.properties.example \
   code/frontend/im_layer_loader/modulos/properties/config.local.properties
```

### GeoServer con LDAP

Para configurar la autenticacion LDAP en GeoServer, ver [docker/configure-geoserver-ldap.md](docker/configure-geoserver-ldap.md).

Configuracion rapida:
1. Acceder a GeoServer: http://localhost:8080/geoserver
2. Ir a **Security** > **Authentication**
3. Agregar nuevo **LDAP Authentication Provider**:
   - Server URL: `ldap://ldap:389/dc=plugineta,dc=local`
   - User DN pattern: `uid={0},ou=users`
   - Group search filter: `(uniqueMember={0})`

## Usuarios LDAP de Prueba

| Usuario | Password | Grupos | Permisos |
|---------|----------|--------|----------|
| admin_gis | admin123 | GIS_ADMINS, GIS_EDITORS, GIS_VIEWERS | Acceso completo |
| editor_gis | editor123 | GIS_EDITORS, GIS_VIEWERS | Edicion |
| viewer_gis | viewer123 | GIS_VIEWERS | Solo lectura |

## Desarrollo

### Compilar el Backend

```bash
cd code/backend

# Usando Maven Wrapper (recomendado)
./mvnw clean package -DskipTests

# O usando Maven instalado
mvn clean package -DskipTests
```

El WAR generado estara en `code/backend/GeoMvd-App/target/GeoMvd-App-2.0.0-SNAPSHOT.war`.

### Desplegar en WildFly

```bash
# Copiar WAR al directorio de deployments
cp code/backend/GeoMvd-App/target/GeoMvd-App-*.war server/wildfly/deployments/

# El hot-deploy de WildFly lo desplegara automaticamente
```

### Instalar el Plugin en QGIS

1. En QGIS, ir a **Plugins** > **Manage and Install Plugins** > **Install from ZIP**
2. Seleccionar el directorio `code/frontend/im_layer_loader`
3. O copiar manualmente a `~/.local/share/QGIS/QGIS3/profiles/default/python/plugins/`

## API REST

La documentacion completa de la API esta disponible en formato OpenAPI:

- Especificacion: [code/backend/specs/openapi.yaml](code/backend/specs/openapi.yaml)

### Endpoints principales

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/rest/public/{appName}/layers` | Obtener capas de una aplicacion |
| GET | `/rest/public/{appName}/layers/atributocapaformat` | Formato de atributos |
| GET | `/rest/public/{appName}/layers/codiguerasformat` | Formato de codigueras |
| GET | `/rest/public/{appName}/layers/codiguerasdata` | Datos de codigueras |
| POST | `/rest/public/{appName}/layers/getCalcFields` | Campos calculados |
| POST | `/rest/public/{appName}/layers/reportes/csv/{dbms}/{datasource}/{tabla}` | Generar reporte CSV |

## Troubleshooting

### GeoServer no inicia

```bash
# Ver logs
docker-compose logs geoserver

# Reiniciar
docker-compose restart geoserver
```

### Error de conexion a LDAP

```bash
# Verificar que LDAP esta corriendo
docker-compose ps ldap

# Probar conexion
ldapsearch -x -H ldap://localhost:389 -b "dc=plugineta,dc=local" -D "cn=admin,dc=plugineta,dc=local" -w admin_password
```

### Base de datos no responde

```bash
# Ver logs
docker-compose logs db

# Verificar estado
docker exec plugineta-postgis pg_isready -U gis_user -d gis_database
```

## Documentacion Adicional

- [Configuracion de Docker](docker/README.md)
- [Configuracion de GeoServer](server/README.md)
- [Configuracion LDAP para GeoServer](docker/configure-geoserver-ldap.md)

## Licencia

Este proyecto esta licenciado bajo la [GNU General Public License v3.0](LICENSE).

## Contribuir

Las contribuciones son bienvenidas. Por favor, abrir un issue antes de enviar un pull request para discutir los cambios propuestos.

## Creditos

Desarrollado por la Intendencia de Montevideo.
