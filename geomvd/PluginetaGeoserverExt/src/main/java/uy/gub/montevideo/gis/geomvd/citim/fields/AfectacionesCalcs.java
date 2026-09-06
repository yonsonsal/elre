package uy.gub.montevideo.gis.geomvd.citim.fields;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.SridRegistry;
import uy.gub.montevideo.gis.geomvd.core.db.DBHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

/**
 * Port a PluginetaGeoserverExt de code/backend/GeoMvd-App/.../citim/fields/AfectacionesCalcs.java
 * (módulo GeoMvd-App dormido). Mismo tratamiento multi-CRS que ZonasFacturacionCalcs: mdg_parcelas
 * es una tabla de referencia externa en SRID fijo, la geometría de entrada usa el SRID real de la
 * capa que dispara el cálculo (SridRegistry.getCurrent()) en vez de 32721 a fuego.
 */
public class AfectacionesCalcs {

    private static String datasourcePg = "nucleoDS";
    private static final String REFERENCE_TABLE_SRID = "32721";

    public static String getPadron(String geometria, Usuario usuario) throws Exception {
        String srcSrid = SridRegistry.getCurrent();
        if (srcSrid == null) {
            srcSrid = REFERENCE_TABLE_SRID;
        }
        String query = "select padron " +
                "from mdg_parcelas pd where " +
                "_st_contains(pd.the_geom, (select ST_Transform(" +
                DBHelper.parseWKTWithSrid("POSTGIS", geometria, srcSrid) + ", " + REFERENCE_TABLE_SRID + ")))";

        return Datahandler.selectOneValue(datasourcePg, query, usuario);
    }
}
