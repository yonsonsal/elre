package uy.gub.montevideo.gis.geomvd.dfr.fields;

import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class ZonasCircuitosCAPCalcs {

    private static String datasource = "brfDS";

    public static Integer getCantidadContenedores(String gid, Usuario usuario) throws Exception {
        return ServiceDFR.getCantidadContenedores(gid, usuario);
    }

}
