package uy.gub.montevideo.gis.geomvd.dfr.fields;

import java.util.List;
import java.util.Map;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class PosicionesRecorridoNUCalcs {

	private static String datasourcePg = "nucleoDS";
    private static String datasourceOracle = "brfDS";
    private static String datasourceSTM = "stmDS";
	
	public static String getDireccion(String _geometry, Usuario usuario) throws Exception {
        System.out.println("Calculando getDireccion para: " + _geometry);
        List<Map<String, String>> results = Datahandler.selectToMap(datasourcePg, "select nom_calle from v_mdg_vias v order by ST_Distance(the_geom, ST_GeomFromText('"+_geometry+"',32721)) asc limit 15", true, usuario);
        String descUbicacionParada = "";
        for(Map<String,String> row:results){
            if (row.get("nom_calle")!=null && row.get("nom_calle").length()>0){
                if (descUbicacionParada.length()==0)
                    descUbicacionParada = row.get("nom_calle"); // primera calle
                else
                    if (!descUbicacionParada.equals(row.get("nom_calle"))) {//segunda calle, chequeo que no se repita con la primera
                        descUbicacionParada += " y " + row.get("nom_calle");
                        return descUbicacionParada;
                    }
            }
        }
        return descUbicacionParada;
    }
}
