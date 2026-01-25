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

# Actualizar repositorios de CentOS 7 (EOL) a vault.centos.org
RUN sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-* && \
    sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*

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

# Copiar module.xml para PostgreSQL driver
COPY module.xml $JBOSS_HOME/modules/system/layers/base/org/postgresql/main/module.xml

# Copiar script de configuración CLI para WildFly
COPY configure-datasource.cli $JBOSS_HOME/bin/configure-datasource.cli

# Copiar y dar permisos al script de inicio
COPY start-wildfly.sh $JBOSS_HOME/bin/start-wildfly.sh
RUN chmod +x $JBOSS_HOME/bin/start-wildfly.sh

# Crear directorio para deployments
RUN mkdir -p $JBOSS_HOME/standalone/deployments

# Exponer puertos
# 8080: HTTP
# 9990: Management console
# 8443: HTTPS (si se configura)
# 8787: Debug port (si se necesita)
EXPOSE 8080 9990 8443 8787

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
