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

## Proyeccion y Sistema de Coordenadas

Este proyecto utiliza la proyeccion **EPSG:32721** (UTM zona 21 Sur) como sistema de coordenadas nativo.

| Parametro | Valor |
|-----------|-------|
| **EPSG** | 32721 |
| **Nombre** | WGS 84 / UTM zone 21S |
| **Unidades** | Metros |
| **Zona** | Uruguay, sur de Brasil, noreste de Argentina |

Los datos de ejemplo incluidos estan centrados en **Montevideo, Uruguay**:
- Rango X: 560,000 - 590,000 metros
- Rango Y: 6,130,000 - 6,160,000 metros

> **Nota**: Si necesitas trabajar con otra proyeccion, deberas modificar:
> 1. El script de inicializacion de la base de datos (`docker/init-db/01-init-schema.sql`)
> 2. Los featuretype.xml de GeoServer (`server/geoserver/data_dir/workspaces/`)
> 3. La configuracion del plugin QGIS (`code/frontend/im_layer_loader/modulos/properties/`)

## Requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- QGIS 3.22+ (para el plugin)
- Java 8+ y Maven 3.6+ (para desarrollo del backend)
- 6GB RAM minimo disponible

## Inicio Rapido

### 1. Clonar el repositorio

```bash
git clone https://github.com/dti-montevideo/open-plugineta.git
cd open-plugineta
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores si es necesario
```

### 3. Compilar el backend

```bash
./build.sh
```

> **Nota**: La primera ejecucion tarda varios minutos porque descarga las dependencias y compila el proyecto Java.

### 4. Iniciar los servicios

```bash
docker-compose up -d --build
```

### 5. Verificar que los servicios esten corriendo

```bash
docker-compose ps
```

### 6. Acceder a los servicios

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

Ver documentacion completa en [code/backend/README.md](code/backend/README.md).

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
pluginetaDS=jboss/datasources/pluginetaDS
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

El backend se compila ejecutando `./build.sh` en la raiz del proyecto. Este script:
1. Usa Docker para compilar el WAR (no requiere Java instalado)
2. Copia el WAR generado a `server/wildfly/deployments/`

Para instrucciones detalladas sobre desarrollo del backend, ver [code/backend/README.md](code/backend/README.md).

**Compilacion con Maven Wrapper (alternativa, requiere Java 8):**

```bash
cd code/backend
./mvnw install:install-file \
    -Dfile=GeoMvd-App/WebContent/WEB-INF/lib/GeoMvdCoreAPI-1.1.0-SNAPSHOT.jar \
    -DgroupId=GeoMvdCoreAPI -DartifactId=GeoMvdCoreAPI \
    -Dversion=1.1.0-SNAPSHOT -Dpackaging=jar
cd GeoMvd-App && ../mvnw clean package -DskipTests
```

El WAR generado estara en `code/backend/GeoMvd-App/target/geomvd-app-v1.0.0-BETA.war`.

### Generar el Plugin QGIS

El plugin se distribuye como un archivo ZIP que se puede instalar directamente en QGIS.

```bash
cd code/frontend
./build-plugin.sh
```

Esto genera el archivo `dist/im_layer_loader-{version}.zip`.

### Instalar el Plugin en QGIS

**Opcion 1: Instalar desde ZIP (recomendado)**

1. Generar el ZIP con `./build-plugin.sh` (ver arriba)
2. En QGIS, ir a **Plugins** > **Manage and Install Plugins**
3. Seleccionar **Install from ZIP**
4. Buscar el archivo `code/frontend/dist/im_layer_loader-{version}.zip`
5. Click en **Install Plugin**

**Opcion 2: Copiar manualmente**

Copiar el directorio del plugin a la carpeta de plugins de QGIS:

```bash
# Linux
cp -r code/frontend/im_layer_loader ~/.local/share/QGIS/QGIS3/profiles/default/python/plugins/

# macOS
cp -r code/frontend/im_layer_loader ~/Library/Application\ Support/QGIS/QGIS3/profiles/default/python/plugins/

# Windows
xcopy /E code\frontend\im_layer_loader %APPDATA%\QGIS\QGIS3\profiles\default\python\plugins\im_layer_loader
```

Luego reiniciar QGIS y activar el plugin en **Plugins** > **Manage and Install Plugins**.

## API REST

El backend activo hoy **no es WildFly** — es una extensión nativa de GeoServer
(`PluginetaGeoserverExt`), que corre dentro del propio proceso de GeoServer y es la que
consume el plugin QGIS real. WildFly queda dormido en el repo (perfil `legacy`), sin
arrancar por defecto.

- Especificacion OpenAPI (API activa): [geomvd/PluginetaGeoserverExt/doc/openapi.yml](geomvd/PluginetaGeoserverExt/doc/openapi.yml)
- Documentacion de endpoints, como testearlos y donde van los `.ori`: [geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md](geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md)
- Especificacion original (WildFly, dormida): [code/backend/specs/openapi.yaml](code/backend/specs/openapi.yaml)

### Endpoints principales (GeoServer, activos)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/geoserver/rest/plugineta/public/{appName}/layers` | Obtener capas de una aplicacion |
| GET | `/geoserver/rest/plugineta/public/{appName}/layers/atributocapaformat` | Metadata/atributos de una capa |
| GET | `/geoserver/rest/plugineta/public/{appName}/layers/codiguerasdata` | Datos de codigueras |
| POST | `/geoserver/rest/plugineta/public/{appName}/layers/getCalcFields` | Campos calculados |

Todos requieren HTTP Basic Auth con un usuario LDAP valido (ver
[geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md](geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md) para
ejemplos de `curl` y guia de testeo).

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

- [Backend Java (compilacion y despliegue, WildFly, dormido)](code/backend/README.md)
- [Extension de GeoServer (backend activo): endpoints, testing, .ori](geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md)
- [Configuracion de Docker](docker/README.md)
- [Configuracion de GeoServer](server/README.md)
- [Configuracion LDAP para GeoServer](docker/configure-geoserver-ldap.md)

## Licencia

Este proyecto esta licenciado bajo la [GNU General Public License v3.0](LICENSE).

## Contribuir

Las contribuciones son bienvenidas. Por favor, abrir un issue antes de enviar un pull request para discutir los cambios propuestos.

## Creditos

Desarrollado por la Intendencia de Montevideo.
