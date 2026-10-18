package uy.gub.montevideo.gis.geomvd.geofact.fields;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.SridRegistry;
import uy.gub.montevideo.gis.geomvd.core.db.DBHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

/**
 * Port a PluginetaGeoserverExt de code/backend/GeoMvd-App/.../geofact/fields/ZonasFacturacionCalcs.java
 * (módulo GeoMvd-App dormido). Mismas queries de negocio (facturación de zonas, Montevideo) — el
 * único cambio es multi-CRS: mdg_tramos_vias/mdg_parcelas son tablas de referencia externas en un
 * SRID fijo (REFERENCE_TABLE_SRID, siempre 32721, dato real de Montevideo, no depende de qué capa
 * disparó el cálculo). Lo que sí variaba antes era el SRID asumido para la geometría de ENTRADA
 * (geom) — se tomaba 32721 a fuego; ahora se toma de SridRegistry.getCurrent() (ver plan de
 * soporte multi-CRS, Fase 5), y se transforma explícitamente al SRID de la tabla de referencia en
 * vez de solo "relabelear" el SRID sin convertir coordenadas.
 *
 * Nota: mdg_tramos_vias/mdg_parcelas no existen en la base demo de este repo (son datos reales de
 * Montevideo) — no se puede verificar end-to-end acá, limitación preexistente de estas clases, no
 * introducida por este cambio.
 */
public class ZonasFacturacionCalcs {

    private static String datasourcePg = "nucleoDS";
    private static final String REFERENCE_TABLE_SRID = "32721";

    public static Double getMetrosVia(String geom, Usuario usuario) throws Exception {
        // ::geography exige que la geometria ya este en grados (lon/lat) - PostGIS rechaza el cast
        // directo desde un CRS proyectado como 32721 ("Only lon/lat coordinate systems are
        // supported in geography", confirmado probando contra datos reales del demo). Por eso el
        // ST_Transform(...,4326) previo es obligatorio, no cosmetico - sin el, esto rompe siempre
        // que mdg_tramos_vias este en un CRS proyectado (que es el caso real, 32721 fijo).
        String query = "SELECT COALESCE(SUM(ST_Length(ST_Transform(mdg_tramos_vias.the_geom,4326)::geography)),0) as total_meters " +
                "FROM mdg_tramos_vias " +
                "WHERE ST_Within(mdg_tramos_vias.the_geom, ST_Transform(" + geomEnReferenceSrid(geom) + ", " + REFERENCE_TABLE_SRID + "));";
        Double totalMeters = Double.parseDouble(Datahandler.selectOneValue(datasourcePg, query, usuario));
        return totalMeters;
    }

    public static int getCantPadrones(String geom, Usuario usuario) throws Exception {
        String query = "SELECT COUNT(*) as cant " +
                "FROM mdg_parcelas " +
                "WHERE ST_Within(mdg_parcelas.the_geom, ST_Transform(" + geomEnReferenceSrid(geom) + ", " + REFERENCE_TABLE_SRID + "));";
        int totalMeters = Integer.parseInt(Datahandler.selectOneValue(datasourcePg, query, usuario));
        return totalMeters;
    }

    private static String geomEnReferenceSrid(String geom) {
        String srcSrid = SridRegistry.getCurrent();
        if (srcSrid == null) {
            srcSrid = REFERENCE_TABLE_SRID;
        }
        return DBHelper.parseWKTWithSrid("POSTGIS", geom, srcSrid);
    }
}
