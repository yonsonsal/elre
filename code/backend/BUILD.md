# Compilación del Backend Plugineta

Este proyecto puede compilarse de **dos maneras diferentes**, dependiendo de si tienes o no JDK 8 instalado localmente.

## Opción 1: Compilar con Docker (Recomendado) ⭐

**No requiere tener instalado:**
- ❌ Maven
- ❌ JDK 8

**Solo requiere:**
- ✅ Docker Desktop instalado y corriendo

### Instrucciones:

```bash
# Ejecutar el script de build
./build-with-docker.sh
```

Este script:
1. Descarga automáticamente OpenJDK 8 dentro de un contenedor Docker
2. Usa Maven Wrapper para compilar el proyecto
3. Extrae los artefactos compilados (.war y .jar) a las carpetas `target/`

### Artefactos generados:
- `GeoMvd-DFR/target/GeoMvd-DFR-1.0.1.war` - Aplicación principal
- `GeoMvd-DFR-ejb/target/GeoMvd-DFR-ejb-1.1.0.jar` - Módulo EJB

---

## Opción 2: Compilar con Maven Wrapper (Local)

**Requiere:**
- ✅ JDK 8 instalado y configurado (`JAVA_HOME`)
- ❌ Maven (se descarga automáticamente vía wrapper)

### Instrucciones:

```bash
# Configurar JAVA_HOME (si no está configurado)
export JAVA_HOME=/ruta/a/tu/jdk8
export PATH=$JAVA_HOME/bin:$PATH

# Ejecutar el script de build
./build-with-mvnw.sh
```

Alternativamente, puedes usar Maven Wrapper directamente:

```bash
# Compilar EJB primero
cd GeoMvd-DFR-ejb
../mvnw clean install

# Compilar WAR principal
cd ../GeoMvd-DFR
../mvnw clean package
```

---

## Verificar compilación exitosa

Después de compilar, deberías ver:

```
GeoMvd-DFR/target/
├── GeoMvd-DFR-1.0.1.war  ← Archivo principal para desplegar

GeoMvd-DFR-ejb/target/
├── GeoMvd-DFR-ejb-1.1.0.jar
```

---

## Desplegar en WildFly local

Una vez compilado el WAR, copiarlo al directorio de deployments:

```bash
# Desde el directorio backend/
cp GeoMvd-DFR/target/GeoMvd-DFR-1.0.1.war ../../server/wildfly/deployments/
```

WildFly detectará automáticamente el archivo y lo desplegará.

---

## Solución de problemas

### Error: "Docker no está corriendo"
- Inicia Docker Desktop antes de ejecutar `build-with-docker.sh`

### Error: "JAVA_HOME no está configurado"
- Instala JDK 8 o usa la opción 1 (Docker)
- Configura la variable de entorno:
  ```bash
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_XXX.jdk/Contents/Home
  ```

### Error: "mvnw: command not found"
- Asegúrate de estar en el directorio `code/backend/`
- Verifica que los archivos `mvnw` y `.mvn/` existan
- Da permisos de ejecución: `chmod +x mvnw`

### Error de compilación: dependencias faltantes
- El proyecto tiene dependencias locales (`GeoMvdCoreAPI`)
- Asegúrate de que los archivos JAR estén en las carpetas `lib/` correspondientes

---

## Notas técnicas

### Maven Wrapper
El proyecto incluye Maven Wrapper (`mvnw`), que descarga automáticamente la versión correcta de Maven (3.6.3) la primera vez que se ejecuta. Esto garantiza que todos los desarrolladores usen la misma versión de Maven.

### Multi-módulo
El proyecto tiene dos módulos:
1. **GeoMvd-DFR-ejb** - Módulo EJB con lógica de negocio
2. **GeoMvd-DFR** - WAR principal que incluye REST API y recursos web

Siempre compila el EJB primero, ya que el WAR depende de él.

### Dockerfile.build
El `Dockerfile.build` usa un patrón multi-stage:
- **Stage 1 (builder)**: Descarga JDK 8, compila el proyecto
- **Stage 2 (artifacts)**: Imagen vacía que solo contiene los artefactos compilados

Esto mantiene la imagen de build limpia y permite extraer solo los archivos necesarios.
