#!/bin/bash

# Script para compilar el proyecto usando Maven Wrapper
# Requiere tener JDK 8 instalado localmente
# Maven se descarga automáticamente vía Maven Wrapper

set -e

echo "================================================"
echo "  Compilando Plugineta Backend con mvnw"
echo "================================================"
echo ""
echo "Este script requiere:"
echo "  - JDK 8 instalado (JAVA_HOME configurado)"
echo "  - Maven se descarga automáticamente"
echo ""

# Verificar que JAVA_HOME esté configurado
if [ -z "$JAVA_HOME" ]; then
    echo "❌ ERROR: JAVA_HOME no está configurado"
    echo ""
    echo "Por favor configura JAVA_HOME apuntando a tu instalación de JDK 8:"
    echo "  export JAVA_HOME=/ruta/a/jdk8"
    echo "  export PATH=\$JAVA_HOME/bin:\$PATH"
    echo ""
    echo "Alternativamente, usa el script build-with-docker.sh que no requiere JDK local"
    exit 1
fi

# Verificar versión de Java
JAVA_VERSION_FULL=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)

echo "☕ Java detectado:"
java -version 2>&1 | head -n 3
echo ""

# Verificar si es Java 8 (puede ser 1.8.x o simplemente 8.x)
if [[ ! "$JAVA_VERSION_FULL" =~ ^1\.8 ]] && [[ ! "$JAVA_VERSION_FULL" =~ ^8\. ]]; then
    echo "⚠️  ADVERTENCIA: Se requiere JDK 8, pero se detectó versión $JAVA_VERSION_FULL"
    echo "   La compilación podría fallar."
    echo ""
    read -p "¿Deseas continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Instalando dependencias locales en repositorio Maven..."
echo ""

# Instalar GeoMvdCoreAPI
./mvnw install:install-file \
    -Dfile=GeoMvd-App/WebContent/WEB-INF/lib/GeoMvdCoreAPI-1.1.0-SNAPSHOT.jar \
    -DgroupId=GeoMvdCoreAPI \
    -DartifactId=GeoMvdCoreAPI \
    -Dversion=1.1.0-SNAPSHOT \
    -Dpackaging=jar

echo ""
echo "🔨 Compilando GeoMvd-App (WAR principal)..."
echo ""
cd GeoMvd-App
../mvnw clean package -DskipTests
cd ..

echo ""
echo "✅ Compilación completada exitosamente!"
echo ""
echo "📁 Artefactos generados:"
echo "   - WAR principal: $(ls -lh GeoMvd-App/target/*.war 2>/dev/null | awk '{print $9, "("$5")"}')"
echo ""
echo "🚀 Para desplegar en WildFly, copia el WAR a:"
echo "   ../../server/wildfly/deployments/"
echo ""
