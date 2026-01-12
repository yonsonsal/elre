#!/bin/bash
set -e

echo "=========================================="
echo "Starting WildFly 10.1.0.Final for Plugineta"
echo "=========================================="
echo ""

# Configurar DataSource si no está ya configurado
if ! grep -q "pluginetaDS" $JBOSS_HOME/standalone/configuration/standalone.xml 2>/dev/null; then
    echo "🔧 Configurando Driver PostgreSQL y DataSource..."
    $JBOSS_HOME/bin/jboss-cli.sh --file=$JBOSS_HOME/bin/configure-datasource.cli
    echo "✅ Driver y DataSource configurados"
else
    echo "✅ DataSource ya está configurado"
fi

echo ""
echo "🔧 Configurando symlink para config geomvd..."
# Create symlink if not exists
if [ ! -L "$JBOSS_HOME/standalone/configuration/apps/geomvd" ]; then
    ln -s $JBOSS_HOME/standalone/configuration/apps/dfr $JBOSS_HOME/standalone/configuration/apps/geomvd
    echo "✅ Symlink geomvd -> dfr creado"
else
    echo "✅ Symlink ya existe"
fi

echo ""
echo "🚀 Iniciando WildFly..."
echo "   DB_HOST: ${DB_HOST:-db}"
echo "   DB_PORT: ${DB_PORT:-5432}"
echo "   DB_NAME: ${DB_NAME:-gis_database}"
echo "   DB_USER: ${DB_USER:-gis_user}"
echo ""

# Iniciar WildFly con standalone.xml
exec $JBOSS_HOME/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0
