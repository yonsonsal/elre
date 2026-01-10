# Dockerfile para WildFly 10.1.0.Final con DataSource PostgreSQL configurado
# Para el proyecto open-plugineta

FROM centos:7

# Metadatos
LABEL maintainer="open-plugineta"
LABEL description="WildFly 10.1.0.Final con PostgreSQL DataSource para plugineta backend"

# Variables de entorno
ENV WILDFLY_VERSION=10.1.0.Final \
    JBOSS_HOME=/opt/wildfly \
    DOWNLOAD_URL=https://download.jboss.org/wildfly/10.1.0.Final/wildfly-10.1.0.Final.tar.gz \
    POSTGRES_JDBC_VERSION=42.2.27

# Instalar Java 8, curl, tar y herramientas necesarias
RUN yum install -y java-1.8.0-openjdk curl tar gzip unzip && \
    yum clean all -y

# Crear directorio de WildFly y descargar
RUN mkdir -p $JBOSS_HOME && \
    curl -L -O $DOWNLOAD_URL && \
    tar -zx --strip-components=1 -C $JBOSS_HOME -f wildfly-$WILDFLY_VERSION.tar.gz && \
    rm wildfly-$WILDFLY_VERSION.tar.gz

# Descargar driver JDBC de PostgreSQL
RUN curl -L -o /tmp/postgresql.jar \
    https://jdbc.postgresql.org/download/postgresql-${POSTGRES_JDBC_VERSION}.jar

# Crear estructura de módulos para PostgreSQL driver
RUN mkdir -p $JBOSS_HOME/modules/system/layers/base/org/postgresql/main && \
    mv /tmp/postgresql.jar $JBOSS_HOME/modules/system/layers/base/org/postgresql/main/

# Crear module.xml para PostgreSQL driver
RUN cat > $JBOSS_HOME/modules/system/layers/base/org/postgresql/main/module.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="urn:jboss:module:1.1" name="org.postgresql">
    <resources>
        <resource-root path="postgresql-42.2.27.jar"/>
    </resources>
    <dependencies>
        <module name="javax.api"/>
        <module name="javax.transaction.api"/>
    </dependencies>
</module>
EOF

# Crear script de configuración CLI para WildFly
# Este script se ejecutará cuando arranque WildFly para configurar el DataSource
RUN cat > $JBOSS_HOME/bin/configure-datasource.cli << 'EOFCLI'
# Conectar al servidor embebido
embed-server --server-config=standalone-full.xml

# Agregar driver PostgreSQL
/subsystem=datasources/jdbc-driver=postgresql:add( \
    driver-name=postgresql, \
    driver-module-name=org.postgresql, \
    driver-class-name=org.postgresql.Driver, \
    driver-xa-datasource-class-name=org.postgresql.xa.PGXADataSource \
)

# Crear DataSource principal para GIS (ejemplo)
data-source add \
    --name=pluginetaDS \
    --driver-name=postgresql \
    --jndi-name=java:jboss/datasources/pluginetaDS \
    --connection-url=jdbc:postgresql://${env.DB_HOST:db}:${env.DB_PORT:5432}/${env.DB_NAME:gis_database} \
    --user-name=${env.DB_USER:gis_user} \
    --password=${env.DB_PASSWORD:gis_password} \
    --use-ccm=false \
    --max-pool-size=25 \
    --blocking-timeout-wait-millis=5000 \
    --enabled=true \
    --jta=true \
    --use-java-context=true \
    --valid-connection-checker-class-name=org.jboss.jca.adapters.jdbc.extensions.postgres.PostgreSQLValidConnectionChecker \
    --exception-sorter-class-name=org.jboss.jca.adapters.jdbc.extensions.postgres.PostgreSQLExceptionSorter

# Habilitar estadísticas de datasource (opcional, útil para desarrollo)
/subsystem=datasources/data-source=pluginetaDS:write-attribute(name=statistics-enabled,value=true)

# Guardar y salir
:reload
quit
EOFCLI

# Crear script de inicio personalizado que configure y arranque WildFly
RUN cat > $JBOSS_HOME/bin/start-wildfly.sh << 'EOFSTART'
#!/bin/bash
set -e

echo "=========================================="
echo "Starting WildFly 10.1.0.Final for Plugineta"
echo "=========================================="
echo ""

# Configurar DataSource si no está ya configurado
if ! grep -q "pluginetaDS" $JBOSS_HOME/standalone/configuration/standalone-full.xml 2>/dev/null; then
    echo "🔧 Configurando DataSource PostgreSQL..."
    $JBOSS_HOME/bin/jboss-cli.sh --file=$JBOSS_HOME/bin/configure-datasource.cli
    echo "✅ DataSource configurado"
else
    echo "✅ DataSource ya está configurado"
fi

echo ""
echo "🚀 Iniciando WildFly..."
echo "   DB_HOST: ${DB_HOST:-db}"
echo "   DB_PORT: ${DB_PORT:-5432}"
echo "   DB_NAME: ${DB_NAME:-gis_database}"
echo "   DB_USER: ${DB_USER:-gis_user}"
echo ""

# Iniciar WildFly
exec $JBOSS_HOME/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0 -c standalone-full.xml
EOFSTART

# Dar permisos de ejecución al script
RUN chmod +x $JBOSS_HOME/bin/start-wildfly.sh

# Crear directorio para deployments
RUN mkdir -p $JBOSS_HOME/standalone/deployments

# Exponer puertos
# 8080: HTTP
# 9990: Management console
# 8443: HTTPS (si se configura)
EXPOSE 8080 9990 8443

# Variables de entorno para la base de datos (pueden ser sobrescritas en docker-compose)
ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_NAME=gis_database \
    DB_USER=gis_user \
    DB_PASSWORD=gis_password

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Comando por defecto: usar nuestro script personalizado
CMD ["/opt/wildfly/bin/start-wildfly.sh"]
