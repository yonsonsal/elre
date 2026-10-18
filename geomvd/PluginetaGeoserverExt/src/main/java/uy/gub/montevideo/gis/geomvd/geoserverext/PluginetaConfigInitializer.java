package uy.gub.montevideo.gis.geomvd.geoserverext;

import java.io.File;
import java.io.IOException;
import javax.annotation.PostConstruct;
import org.geoserver.platform.GeoServerResourceLoader;
import org.springframework.stereotype.Component;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;

/**
 * Ubica los archivos de config de GeoMvdCoreAPI (.app/.ori/_md.xml/config.properties) dentro del
 * data_dir de GeoServer, vía la API de recursos nativa (Resource API), y arranca
 * GetPropertyValues/ConfigParser sin tocar ni una línea de GeoMvdCoreAPI: solo se calcula, en
 * runtime, el valor de la system property "jboss.server.config.dir" que ese código ya sabe leer.
 *
 * Reemplaza a CustomContextInit (@WebListener) del WAR original — acá se dispara explícito en
 * vez de depender del auto-escaneo de anotaciones de GeoServer.
 */
@Component
public class PluginetaConfigInitializer {

    /** Igual a uy.gub.montevideo.gis.geomvd.dfr.Constants.APPLICATION_NAME (módulo GeoMvd-App,
     *  no es dependencia de esta extensión) — nombre de app fijo bajo el que GetPropertyValues
     *  busca apps/{nombre}/config.properties. */
    private static final String APPLICATION_NAME = "plugineta";

    private final GeoServerResourceLoader resourceLoader;

    public PluginetaConfigInitializer(GeoServerResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void init() throws IOException {
        File configDir = resourceLoader.findOrCreateDirectory("plugineta-config");
        System.setProperty("jboss.server.config.dir", configDir.getAbsolutePath());
        GetPropertyValues.initProperties(APPLICATION_NAME);
    }
}
