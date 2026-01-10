package uy.gub.montevideo.gis.geomvd.dfr.rest;

import uy.gub.montevideo.gis.geomvd.core.rest.CoreService;
import uy.gub.montevideo.gis.geomvd.core.rest.ReportesAPI;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

@ApplicationPath("/rest")
public class RestApplication extends Application {

    private Set<Object> singletons = new HashSet<Object>();
    private Set<Class<?>> empty = new HashSet<Class<?>>();

    public RestApplication() {
        singletons.add(new DFRLayerService());
        singletons.add(new DFRPublicLayerService());
        singletons.add(new DFRService());
        singletons.add(new DFRValidations());
        singletons.add(new ReportesAPI());
        singletons.add(new CoreService());
    }

    @Override
    public Set<Class<?>> getClasses() {
        return empty;
    }

    @Override
    public Set<Object> getSingletons() {
        return singletons;
    }

}