package uy.gub.montevideo.gis.geomvd.dfr;

import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import static uy.ciemsa.geomvd.dfr.Constants.APPLICATION_NAME;

@WebListener
public class CustomContextInit  implements ServletContextListener {
    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        // Context startup
        GetPropertyValues.initProperties(APPLICATION_NAME);
    }

    @Override
    public void contextDestroyed(final ServletContextEvent servletContextEvent) {
        // Context shutdown
    }
}
