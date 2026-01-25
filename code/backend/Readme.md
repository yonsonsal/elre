# Backend GeoMvd-App

Backend Java para Open Plugineta, desplegado en WildFly.

## Requisitos

Para desarrollo local:
- Java 8 (JDK)
- Maven 3.6+

Para compilacion sin instalar Java/Maven:
- Docker Engine 20.10+

## Estructura del Proyecto

```
code/backend/
├── GeoMvd-App/              # Modulo WAR principal
│   ├── src/                 # Codigo fuente Java
│   ├── WebContent/          # Recursos web y librerias
│   │   └── WEB-INF/lib/     # JARs de dependencias
│   └── pom.xml              # Configuracion Maven
├── Files/                   # Archivos de configuracion
├── specs/                   # Especificacion OpenAPI
├── Dockerfile.build         # Docker para compilacion
└── mvnw                     # Maven Wrapper
```

## Compilacion

### Opcion 1: Usando Docker (recomendado)

No requiere tener Java ni Maven instalados. Solo Docker.

```bash
cd code/backend

# Compilar usando Docker
docker build --target builder -t plugineta-builder -f Dockerfile.build .

# Extraer el WAR generado
mkdir -p ./target
docker create --name temp plugineta-builder true
docker cp temp:/build/GeoMvd-App/target/geomvd-app-v1.0.0-BETA.war ./target/
docker rm temp

# Verificar
ls -la ./target/
```

El WAR generado estara en `./target/geomvd-app-v1.0.0-BETA.war`.

### Opcion 2: Usando Maven Wrapper

Requiere Java 8 instalado, pero no Maven.

```bash
cd code/backend

# Instalar GeoMvdCoreAPI en el repositorio local
./mvnw install:install-file \
    -Dfile=GeoMvd-App/WebContent/WEB-INF/lib/GeoMvdCoreAPI-1.1.0-SNAPSHOT.jar \
    -DgroupId=GeoMvdCoreAPI \
    -DartifactId=GeoMvdCoreAPI \
    -Dversion=1.1.0-SNAPSHOT \
    -Dpackaging=jar

# Compilar
cd GeoMvd-App
../mvnw clean package -DskipTests
```

El WAR generado estara en `GeoMvd-App/target/geomvd-app-v1.0.0-BETA.war`.

### Opcion 3: Usando Maven instalado

Requiere Java 8 y Maven 3.6+ instalados.

```bash
cd code/backend

# Instalar GeoMvdCoreAPI
mvn install:install-file \
    -Dfile=GeoMvd-App/WebContent/WEB-INF/lib/GeoMvdCoreAPI-1.1.0-SNAPSHOT.jar \
    -DgroupId=GeoMvdCoreAPI \
    -DartifactId=GeoMvdCoreAPI \
    -Dversion=1.1.0-SNAPSHOT \
    -Dpackaging=jar

# Compilar
cd GeoMvd-App
mvn clean package -DskipTests
```

## Versionado

La version del WAR se define en `GeoMvd-App/pom.xml`:

```xml
<version>1.0.0-BETA</version>
```

El nombre del WAR generado sigue el patron: `geomvd-app-v{version}.war`

Para cambiar la version, editar el tag `<version>` en el pom.xml antes de compilar.

## Dependencias

El proyecto depende de:

- **GeoMvdCoreAPI** (1.1.0-SNAPSHOT): Libreria core incluida en `WebContent/WEB-INF/lib/`
- **org.json**: Para manejo de JSON
- **Gson**: Serializacion/deserializacion JSON
- **JTS**: Java Topology Suite para geometrias
- **Jackson**: Procesamiento JSON

Las dependencias estan definidas en `GeoMvd-App/pom.xml`.

## Despliegue en WildFly

### Despliegue manual

```bash
# Copiar WAR al directorio de deployments de WildFly
cp target/geomvd-app-v1.0.0-BETA.war $WILDFLY_HOME/standalone/deployments/

# WildFly detectara automaticamente el nuevo WAR (hot-deploy)
```

### Despliegue con Docker Compose

El `docker-compose.yml` del proyecto monta automaticamente el directorio de deployments:

```yaml
services:
  wildfly:
    volumes:
      - ./server/wildfly/deployments:/opt/jboss/wildfly/standalone/deployments
```

Copiar el WAR a `server/wildfly/deployments/` para desplegarlo.

## Configuracion

### Archivos de configuracion de aplicaciones

Los workspaces se configuran en:
```
/opt/wildfly/standalone/configuration/apps/plugineta/{workspace}/
```

Cada workspace contiene:
- `{workspace}.app`: Configuracion de capas
- `{workspace}.ori`: Configuracion de origenes de datos

### Variables de entorno

El backend lee configuracion de WildFly y de los archivos `.app` / `.ori`.

## API REST

La API esta documentada en OpenAPI:
- Especificacion: [specs/openapi.yaml](specs/openapi.yaml)

### Endpoints principales

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/rest/public/{workspace}/layers` | Obtener capas |
| GET | `/rest/public/{workspace}/layers/atributocapaformat` | Formato de atributos |
| GET | `/rest/public/{workspace}/layers/codiguerasformat` | Formato de codigueras |
| GET | `/rest/public/{workspace}/layers/codiguerasdata` | Datos de codigueras |
| POST | `/rest/public/{workspace}/layers/getCalcFields` | Campos calculados |
| POST | `/rest/public/{workspace}/layers/reportes/csv/{dbms}/{datasource}/{tabla}` | Generar CSV |

## Troubleshooting

### Error: JSONArray/JSONObject not found

La dependencia `org.json` debe estar en el pom.xml:

```xml
<dependency>
    <groupId>org.json</groupId>
    <artifactId>json</artifactId>
    <version>20190722</version>
</dependency>
```

### Error: GeoMvdCoreAPI not found

Instalar el JAR en el repositorio Maven local antes de compilar (ver seccion Compilacion).

### Error de compilacion con git-commit-id-plugin

Este plugin fue removido. Si tienes una version antigua del pom.xml, actualiza a la ultima version.
