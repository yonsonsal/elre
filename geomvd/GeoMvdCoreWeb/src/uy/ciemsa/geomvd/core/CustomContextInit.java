package uy.ciemsa.geomvd.core;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import static uy.ciemsa.geomvd.core.Constants.APPLICATION_NAME;

@WebListener
public class CustomContextInit implements ServletContextListener {
    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        // Context startup
        ConfigParser.init(APPLICATION_NAME);
    }

    @Override
    public void contextDestroyed(final ServletContextEvent servletContextEvent) {
        // Context shutdown
    }
}
