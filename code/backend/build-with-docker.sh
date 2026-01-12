#!/bin/bash

# Script para compilar el proyecto usando Docker
# No requiere tener instalado ni Maven ni JDK en la máquina local
# Solo requiere Docker

set -e

echo "================================================"
echo "  Compilando Plugineta Backend con Docker"
echo "================================================"
echo ""
echo "Este script NO requiere tener instalado:"
echo "  - Maven"
echo "  - JDK 8"
echo ""
echo "Solo requiere Docker instalado y corriendo."
echo ""

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no está instalado"
    echo "   Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker no está corriendo"
    echo "   Por favor inicia Docker Desktop"
    exit 1
fi

echo "✅ Docker está disponible"
echo ""

# Crear directorio target si no existe
mkdir -p GeoMvd-DFR/target
mkdir -p GeoMvd-DFR-ejb/target

echo "🔨 Iniciando compilación..."
echo ""

# Compilar usando Docker
docker build --target builder -t plugineta-build -f Dockerfile.build .

# Crear contenedor temporal para extraer los artefactos
echo ""
echo "📦 Extrayendo artefactos compilados..."
CONTAINER_ID=$(docker create plugineta-build)

# Copiar WAR del proyecto principal
docker cp ${CONTAINER_ID}:/build/GeoMvd-DFR/target/ ./GeoMvd-DFR/ 2>/dev/null || true

# Copiar JAR del EJB
docker cp ${CONTAINER_ID}:/build/GeoMvd-DFR-ejb/target/ ./GeoMvd-DFR-ejb/ 2>/dev/null || true

# Limpiar contenedor temporal
docker rm ${CONTAINER_ID} > /dev/null

echo ""
echo "✅ Compilación completada exitosamente!"
echo ""
echo "📁 Artefactos generados:"
echo "   - WAR principal: $(ls -lh GeoMvd-DFR/target/*.war 2>/dev/null | awk '{print $9, "("$5")"}')"
echo "   - EJB JAR: $(ls -lh GeoMvd-DFR-ejb/target/*.jar 2>/dev/null | grep -v sources | grep -v javadoc | awk '{print $9, "("$5")"}' | head -1)"
echo ""
echo "🚀 Para desplegar en WildFly, copia el WAR a:"
echo "   ../../server/wildfly/deployments/"
echo ""
