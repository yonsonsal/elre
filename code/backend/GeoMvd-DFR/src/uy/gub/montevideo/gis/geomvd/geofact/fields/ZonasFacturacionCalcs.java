package uy.gub.montevideo.gis.geomvd.geofact.fields;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

public class ZonasFacturacionCalcs {

    private static String datasourcePg = "nucleoDS";

    public static Double getMetrosVia(String geom, Usuario usuario) throws Exception {
        String query = "SELECT COALESCE(SUM(ST_Length(the_geom)),0) as total_meters " +
                "FROM mdg_tramos_vias " +
                "WHERE ST_Within(mdg_tramos_vias.the_geom, ST_SetSRID(ST_GeomFromText('" + geom + "'), 32721));";
        Double totalMeters = Double.parseDouble(Datahandler.selectOneValue(datasourcePg, query, usuario));
        return totalMeters;
    }

    public static int getCantPadrones(String geom, Usuario usuario) throws Exception {
        String query = "SELECT COUNT(*) as cant " +
                "FROM mdg_parcelas " +
                "WHERE ST_Within(mdg_parcelas.the_geom, ST_SetSRID(ST_GeomFromText('" + geom + "'), 32721));";
        int totalMeters = Integer.parseInt(Datahandler.selectOneValue(datasourcePg, query, usuario));
        return totalMeters;
    }

}
