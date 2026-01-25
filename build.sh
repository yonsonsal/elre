#!/bin/bash
# Script para compilar el backend de Open Plugineta
# Genera el WAR y lo copia al directorio de deployments de WildFly

set -e

echo "=== Open Plugineta - Build Backend ==="
echo ""

# Directorio base del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/code/backend"
DEPLOYMENTS_DIR="$SCRIPT_DIR/server/wildfly/deployments"

# Crear directorio de deployments si no existe
mkdir -p "$DEPLOYMENTS_DIR"

echo "1. Compilando el backend con Docker..."
echo "   (esto puede tardar varios minutos la primera vez)"
echo ""

cd "$BACKEND_DIR"

# Construir usando el Dockerfile.build existente
docker build --target builder -t plugineta-builder -f Dockerfile.build .

echo ""
echo "2. Extrayendo el WAR compilado..."

# Crear contenedor temporal y copiar el WAR
docker create --name plugineta-temp plugineta-builder true
docker cp plugineta-temp:/build/GeoMvd-App/target/. "$DEPLOYMENTS_DIR/"
docker rm plugineta-temp

# Limpiar archivos que no son WAR
find "$DEPLOYMENTS_DIR" -type f ! -name "*.war" -delete 2>/dev/null || true
find "$DEPLOYMENTS_DIR" -type d -empty -delete 2>/dev/null || true

echo ""
echo "=== Build completado ==="
echo ""
echo "WAR generado en: $DEPLOYMENTS_DIR/"
ls -la "$DEPLOYMENTS_DIR/"*.war 2>/dev/null || echo "No se encontraron archivos WAR"
echo ""
echo "Ahora puedes ejecutar: docker-compose up -d"
