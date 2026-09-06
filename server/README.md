# Directorio Server - Configuraciones Locales

Este directorio contiene las configuraciones y datos de los servidores para desarrollo local.

> **Backend activo**: desde la migración de plataforma, el backend que consume el
> plugin QGIS corre como extensión nativa **dentro** de GeoServer, no en WildFly. Ver
> [../geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md](../geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md)
> (endpoints, testing, ubicación de los `.ori`) y
> [../geomvd/PluginetaGeoserverExt/doc/openapi.yml](../geomvd/PluginetaGeoserverExt/doc/openapi.yml).
> El código fuente de la extensión vive en `../geomvd/PluginetaGeoserverExt/` (hermano de
> `code/`, no dentro de este directorio `server/`, que es solo datos/config de GeoServer).

## 📂 Estructura

```
server/
├── geoserver/
│   ├── data_dir/          # Configuración completa de GeoServer
│   │   ├── workspaces/    # Workspaces configurados (plugineta, etc.)
│   │   ├── security/      # Configuración de seguridad
│   │   ├── styles/        # Estilos SLD
│   │   ├── logs/          # Logs (no versionado)
│   │   └── ...
│   ├── gwc/               # Cache de GeoWebCache
│   └── settings/          # Configuraciones adicionales
└── wildfly/               # (Futuro) Configuración de WildFly
```

## 🎯 Propósito

### GeoServer (data_dir)

Este directorio se monta como volumen en el contenedor Docker de GeoServer (`/opt/geoserver/data_dir`).

**Ventajas**:
- ✅ Configuración persistente entre reinicios de Docker
- ✅ Versionable en Git (workspace, datastores, capas)
- ✅ Fácil backup y restauración
- ✅ Compartible entre desarrolladores

**Contenido importante**:
- `workspaces/plugineta/` - Workspace con capas configuradas
- `security/` - Usuarios, roles, y configuración de autenticación
- `global.xml` - Configuración global de GeoServer
- `logging.xml` - Configuración de logs

### GeoWebCache (gwc)

Caché de tiles generados por GeoServer.

**Nota**: Los tiles en sí no se versionan (están en `.gitignore`), pero la configuración sí.

### Settings

Configuraciones adicionales específicas de la imagen Kartoza de GeoServer.

## 🔧 Uso

### Iniciar GeoServer con configuración local

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d geoserver
```

GeoServer usará automáticamente la configuración en `./server/geoserver/data_dir/`.

### Backup de la configuración

La configuración ya está en un directorio local, por lo que hacer backup es tan simple como:

```bash
# Backup manual
cp -r server/geoserver/data_dir server/geoserver/data_dir.backup-$(date +%Y%m%d)

# O versionarlo con Git
git add server/geoserver/data_dir/workspaces/
git commit -m "Update GeoServer workspace configuration"
```

### Restaurar configuración

Si necesitas restaurar la configuración:

```bash
# Detener GeoServer
docker-compose stop geoserver

# Restaurar backup
rm -rf server/geoserver/data_dir
cp -r server/geoserver/data_dir.backup-YYYYMMDD server/geoserver/data_dir

# Reiniciar
docker-compose up -d geoserver
```

### Actualizar configuración desde contenedor

Si hiciste cambios en GeoServer vía interfaz web y quieres guardarlos:

```bash
# La configuración ya se guarda automáticamente en el directorio local
# Solo necesitas commitearla a Git si quieres versionarla
git status server/geoserver/data_dir/
git add server/geoserver/data_dir/
git commit -m "Update GeoServer configuration"
```

## 🗂️ ¿Qué se versiona y qué no?

### ✅ Versionado en Git

- Configuración de workspaces
- Datastores (conexiones a bases de datos)
- Feature types y layers
- Estilos SLD/CSS
- Configuración de seguridad (sin contraseñas sensibles)
- Configuración global

### ❌ No versionado (en .gitignore)

- Logs (`logs/`, `*.log`)
- Archivos temporales (`temp/`, `tmp/`)
- Cache de tiles generados
- Bases de datos de monitoring

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Este directorio contiene configuración de desarrollo.

**Antes de publicar a GitHub**:
- Revisar `security/` para contraseñas hardcodeadas
- Verificar que los datastores usen variables de entorno o valores genéricos
- No incluir certificados o keys privadas

## 📋 Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `workspaces/plugineta/workspace.xml` | Configuración del workspace |
| `workspaces/plugineta/plugineta-db/datastore.xml` | Conexión a PostgreSQL |
| `workspaces/plugineta/plugineta-db/*/layer.xml` | Configuración de cada capa |
| `security/usergroup/default/users.xml` | Usuarios locales |
| `security/role/default/roles.xml` | Roles definidos |
| `global.xml` | Configuración global de GeoServer |

## 🚀 Próximos Pasos

1. **Configurar LDAP**: Agregar configuración de autenticación LDAP
2. **Agregar estilos**: Crear estilos SLD personalizados para las capas
3. **WildFly**: Agregar configuración de WildFly cuando se implemente el backend

## 📚 Referencias

- [GeoServer Data Directory](https://docs.geoserver.org/stable/en/user/datadirectory/index.html)
- [Kartoza GeoServer Docker](https://github.com/kartoza/docker-geoserver)
- [GeoServer Security](https://docs.geoserver.org/stable/en/user/security/index.html)
