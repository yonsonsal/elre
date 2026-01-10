#!/bin/bash

# Script para verificar y guiar el inicio del entorno Docker

echo "🔍 Verificando Docker..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instalar desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    echo ""
    echo "Por favor:"
    echo "  1. Abre Docker Desktop"
    echo "  2. Espera a que el ícono de Docker en la barra de menú deje de parpadear"
    echo "  3. Vuelve a ejecutar este script"
    echo ""
    exit 1
fi

echo "✅ Docker está instalado y corriendo"
echo ""

# Verificar docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose no encontrado, usando 'docker compose' (versión integrada)"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
    echo "✅ docker-compose encontrado"
fi

echo ""
echo "🚀 Iniciando servicios..."
echo ""

cd "$(dirname "$0")/.." || exit

# Iniciar servicios
$COMPOSE_CMD up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Servicios iniciados correctamente!"
    echo ""
    echo "📊 Estado de los servicios:"
    $COMPOSE_CMD ps
    echo ""
    echo "🌐 URLs de acceso:"
    echo "   - GeoServer:      http://localhost:8080/geoserver (admin/geoserver)"
    echo "   - phpLDAPadmin:   http://localhost:8081 (cn=admin,dc=plugineta,dc=local / admin_password)"
    echo "   - PostgreSQL:     localhost:5432 (gis_user/gis_password)"
    echo ""
    echo "📝 Ver logs en tiempo real:"
    echo "   $COMPOSE_CMD logs -f"
    echo ""
    echo "⚠️  NOTA: GeoServer puede tardar 1-2 minutos en estar completamente disponible"
    echo ""
else
    echo ""
    echo "❌ Error al iniciar servicios"
    echo "   Ver logs: $COMPOSE_CMD logs"
    exit 1
fi
