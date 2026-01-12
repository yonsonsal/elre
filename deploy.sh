#!/bin/bash

# Script de deploy automático para GeoMvd-App (Plugineta)
# Este script compila el proyecto y lo despliega en WildFly

set -e

echo "================================================"
echo "  Deploy Automático - GeoMvd-App (Plugineta)"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/code/backend"
DEPLOY_DIR="${SCRIPT_DIR}/server/wildfly/deployments"

# Verificar que JAVA_HOME esté configurado
if [ -z "$JAVA_HOME" ]; then
    echo -e "${RED}❌ ERROR: JAVA_HOME no está configurado${NC}"
    echo ""
    echo "Por favor configura JAVA_HOME apuntando a tu instalación de JDK 8:"
    echo "  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_202.jdk/Contents/Home"
    echo "  export PATH=\$JAVA_HOME/bin:\$PATH"
    exit 1
fi

# Verificar versión de Java
JAVA_VERSION_FULL=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
echo -e "${GREEN}☕ Java detectado:${NC}"
java -version 2>&1 | head -n 3
echo ""

# Advertencia si no es Java 8
if [[ ! "$JAVA_VERSION_FULL" =~ ^1\.8 ]] && [[ ! "$JAVA_VERSION_FULL" =~ ^8\. ]]; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Se recomienda JDK 8, detectado versión $JAVA_VERSION_FULL${NC}"
    echo ""
fi

# Paso 1: Compilar el proyecto
echo -e "${GREEN}📦 Paso 1/3: Compilando proyecto...${NC}"
echo ""
cd "${BACKEND_DIR}"
bash build-with-mvnw.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en la compilación${NC}"
    exit 1
fi

# Paso 2: Encontrar el WAR generado
echo ""
echo -e "${GREEN}📦 Paso 2/3: Buscando artefacto WAR...${NC}"
WAR_FILE=$(find "${BACKEND_DIR}/GeoMvd-App/target" -name "*.war" -type f | head -1)

if [ -z "$WAR_FILE" ]; then
    echo -e "${RED}❌ No se encontró el archivo WAR${NC}"
    exit 1
fi

WAR_FILENAME=$(basename "$WAR_FILE")
echo "   Encontrado: $WAR_FILENAME"

# Paso 3: Limpiar deployments anteriores y copiar nuevo WAR
echo ""
echo -e "${GREEN}📦 Paso 3/3: Desplegando en WildFly...${NC}"
echo ""

# Crear directorio de deployments si no existe
mkdir -p "${DEPLOY_DIR}"

# Eliminar WARs antiguos de versiones anteriores (opcional - comentar si no se desea)
echo "   Limpiando deployments anteriores..."
rm -f "${DEPLOY_DIR}"/geomvd-app-v*.war
rm -f "${DEPLOY_DIR}"/geomvd-app-v*.war.deployed
rm -f "${DEPLOY_DIR}"/geomvd-app-v*.war.failed

# Copiar nuevo WAR
echo "   Copiando ${WAR_FILENAME} a deployments..."
cp "$WAR_FILE" "${DEPLOY_DIR}/"

# Verificar copia
if [ -f "${DEPLOY_DIR}/${WAR_FILENAME}" ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy completado exitosamente!${NC}"
    echo ""
    echo "📁 WAR deployado en:"
    echo "   ${DEPLOY_DIR}/${WAR_FILENAME}"
    echo ""
    echo "🔄 Para aplicar cambios:"
    echo "   1. Si WildFly está corriendo, detectará el nuevo WAR automáticamente"
    echo "   2. Si no está corriendo, inicia con: docker-compose up -d wildfly"
    echo ""
    echo "🌐 URLs de acceso:"
    echo "   - WildFly: http://localhost:8082"
    echo "   - GeoServer: http://localhost:8080/geoserver"
    echo "   - App: http://localhost:8082/geomvd-app"
    echo ""
else
    echo -e "${RED}❌ Error al copiar el WAR${NC}"
    exit 1
fi
