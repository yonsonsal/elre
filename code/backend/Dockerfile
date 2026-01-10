FROM registry.imm.gub.uy/dockerhub-proxy/library/maven:3.8.6-openjdk-8 as builder
WORKDIR /app
COPY dfr/ dfr/
COPY geomvd/ geomvd/
RUN keytool -importcert -file dfr/Docker/CERT.cer -noprompt -trustcacerts -alias "IM" -keystore $JAVA_HOME/jre/lib/security/cacerts -storepass changeit
RUN mvn clean compile package install -f /app/geomvd/GeoMvdCoreAPI/pom.xml
RUN mvn clean compile package install -f /app/geomvd/GeoMvdCoreWeb/pom.xml
RUN mvn clean compile package install -f /app/dfr/GeoMvd-DFR-ejb/pom.xml
RUN mvn clean compile package -f /app/dfr/GeoMvd-DFR/pom.xml

FROM registry.imm.gub.uy/dockerhub-proxy/library/openjdk:8
RUN curl https://imnube.montevideo.gub.uy/share/s/6TaGIkCmS2eyLyUKPX6LEw -o wildfly-10.1.0.Final.dfr.tar.gz && \
    tar -xf wildfly-10.1.0.Final.dfr.tar.gz && \
    rm wildfly-10.1.0.Final.dfr.tar.gz
COPY geomvd/GeoMvdCoreWeb/Files/ /wildfly-10.1.0.Final/standalone/configuration/apps/geomvd/
RUN mv /wildfly-10.1.0.Final/standalone/configuration/apps/geomvd/config.dev.properties /wildfly-10.1.0.Final/standalone/configuration/apps/geomvd/config.properties && rm /wildfly-10.1.0.Final/standalone/configuration/apps/geomvd/config.local.properties && rm /wildfly-10.1.0.Final/standalone/configuration/apps/geomvd/config.prod.properties
COPY dfr/Files/ /wildfly-10.1.0.Final/standalone/configuration/apps/dfr/
RUN mv /wildfly-10.1.0.Final/standalone/configuration/apps/dfr/config.dev.properties /wildfly-10.1.0.Final/standalone/configuration/apps/dfr/config.properties && rm /wildfly-10.1.0.Final/standalone/configuration/apps/dfr/config.local.properties && rm /wildfly-10.1.0.Final/standalone/configuration/apps/dfr/config.prod.properties
COPY --from=builder /app/geomvd/GeoMvdCoreWeb/target/GeoMVDCore*.war /wildfly-10.1.0.Final/standalone/deployments/apps/geomvd/GeoMVDCore.war
COPY --from=builder /app/dfr/GeoMvd-DFR/target/dfr*.war /wildfly-10.1.0.Final/standalone/deployments/apps/dfr/dfr.war
EXPOSE 8443
CMD ["/wildfly-10.1.0.Final/bin/standalone.sh", "-b", "0.0.0.0", "-bmanagement", "0.0.0.0", "-c", "standalone-full.xml"]

