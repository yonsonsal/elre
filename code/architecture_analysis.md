# Análisis de Arquitectura - Plugineta

Este documento detalla la arquitectura y el funcionamiento de **Plugineta**, una solución empresarial para la edición de capas en QGIS con gestión centralizada de permisos y metadatos.

## Visión General

Plugineta actúa como un puente entre QGIS y una infraestructura de datos espaciales (IDE) basada en GeoServer. Su objetivo principal es permitir la edición segura y controlada de capas geográficas, gestionando permisos de usuario y configuraciones de formularios de manera centralizada.

### Componentes Principales

La solución se divide en dos grandes componentes:

1.  **Frontend (QGIS Plugin):**
    *   **Tecnología:** Python (PyQt5, QGIS API).
    *   **Ubicación:** `frontend/im_layer_loader`.
    *   **Función:** Interfaz de usuario en QGIS para autenticación, selección de capas, carga de capas (WMS/WFS) y configuración dinámica de formularios de edición.

2.  **Backend (Servicios REST):**
    *   **Tecnología:** Java (JAX-RS).
    *   **Ubicación:** `backend/GeoMvd-DFR`.
    *   **Función:**
        *   Provee metadatos de las capas (qué capas puede ver el usuario, qué atributos son editables, etc.).
        *   Gestiona la seguridad y roles (integración con LDAP/Base de datos).
        *   Provee datos auxiliares como "codigueras" (listas de valores para dropdowns).
        *   Genera reportes (CSV).

3.  **GeoServer (Infraestructura Externa):**
    *   **Función:** Servidor de mapas que provee los servicios estándar OGC (WMS para visualización, WFS-T para edición).
    *   **Interacción:** El plugin configura las capas en QGIS para apuntar directamente a GeoServer para la transmisión de datos geométricos.

## Diagrama de Arquitectura

```mermaid
graph TD
    subgraph "Cliente (QGIS)"
        User[Usuario]
        Plugin[Plugineta (Python)]
        QGIS_Core[QGIS Core]
    end

    subgraph "Servidor"
        Backend[Backend Java (REST API)]
        GeoServer[GeoServer (WMS/WFS)]
        DB[(Base de Datos Espacial)]
    end

    User -->|Login| Plugin
    Plugin -->|1. Autenticación & Metadata| Backend
    Plugin -->|2. Configurar Capa| QGIS_Core
    QGIS_Core -->|3. GetMap (WMS)| GeoServer
    QGIS_Core -->|4. GetFeature/Transaction (WFS-T)| GeoServer
    Backend -->|Roles & Config| DB
    GeoServer -->|Datos Espaciales| DB
```

## Flujo de Interacción (Carga de Capas)

El siguiente diagrama de secuencia ilustra cómo el plugin interactúa con el backend y GeoServer al cargar capas.

```mermaid
sequenceDiagram
    participant User as Usuario
    participant Plugin as Plugineta (Frontend)
    participant Backend as Backend REST
    participant GeoServer

    User->>Plugin: Inicia Sesión & Selecciona Workspace
    Plugin->>GeoServer: GET /rest/workspaces/{ws}/layers (Obtener lista capas)
    activate GeoServer
    GeoServer-->>Plugin: Lista de Capas
    deactivate GeoServer

    loop Para cada capa
        Plugin->>Backend: GET /public/{app}/layers/atributocapaformat (Metadata)
        activate Backend
        Backend-->>Plugin: JSON (Roles, Atributos, Visibilidad)
        deactivate Backend

        alt Es WFS (Edición)
            Plugin->>QGIS_Core: Crear QgsVectorLayer (WFS)
            Note right of Plugin: Configura URL WFS y Credenciales
        else Es WMS (Visualización)
            Plugin->>QGIS_Core: Crear QgsRasterLayer (WMS)
        end

        Plugin->>QGIS_Core: Aplicar Estilos (desde GeoServer)
        Plugin->>QGIS_Core: Configurar Formularios (según Metadata Backend)
    end
    
    QGIS_Core->>User: Muestra Capas en Mapa
```

## Análisis de Código

### Frontend (`frontend/im_layer_loader`)

*   **`IM_layer_loader.py`**: Punto de entrada del plugin. Inicializa la UI y los menús.
*   **`modulos/cargaCapasProyecto.py`**: Lógica central para iterar sobre los workspaces y cargar las capas en el proyecto QGIS. Decide si una capa es WMS o WFS.
*   **`modulos/servicios/serviciosRest.py`**: Cliente HTTP genérico (usando `requests`) para comunicarse con el backend. Maneja errores y autenticación básica.
*   **`modulos/servicios/geoserverApi.py`**: Cliente específico para la API REST de GeoServer (usado para listar capas y estilos).
*   **`modulos/servicios/serviciosCapas.py`**: Cliente para los servicios de negocio del backend (obtener atributos, codigueras).
*   **`modulos/properties/`**: Archivos de configuración (`config.local.properties`, etc.) que definen las URLs de los servicios.

### Backend (`backend/GeoMvd-DFR`)

*   **`uy.ciemsa.geomvd.dfr.rest.DFRPublicLayerService`**: Controlador REST principal expuesto al plugin.
    *   `@Path("/public/{appName}/layers")`
    *   `getLayers`: Devuelve las capas permitidas para el usuario.
    *   `getAtributoCapa`: Devuelve la configuración detallada de una capa (campos, tipos, permisos).
    *   `getCodiguerasData`: Devuelve los datos para llenar los comboboxes en los formularios de QGIS.
*   **`uy.ciemsa.geomvd.dfr.rest.DFRLayerService`**: Servicios adicionales, posiblemente de uso interno o legacy, incluyendo lógica de `execute_i_d_u` (aunque el frontend parece priorizar WFS-T).
*   **`uy.ciemsa.geomvd.core.db.SecurityHelper`**: Manejo de usuarios y roles.

## Puntos Clave para Publicación Open Source

1.  **Desacoplamiento de Configuración**: Las URLs y credenciales hardcodeadas o en archivos de propiedades deben ser completamente configurables por el usuario final (ej. variables de entorno o panel de configuración en el plugin).
2.  **Limpieza de Dependencias**: El backend parece tener dependencias de librerías internas (`uy.ciemsa.geomvd.core...`). Para liberar el código, estas librerías deben ser incluidas o refactorizadas.
3.  **Documentación de Despliegue**: Se necesita documentación clara sobre cómo desplegar el backend (Docker, WAR file) y cómo configurar GeoServer para trabajar con Plugineta.
