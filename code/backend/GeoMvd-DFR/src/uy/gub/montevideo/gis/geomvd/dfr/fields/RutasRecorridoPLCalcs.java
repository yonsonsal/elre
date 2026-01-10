package uy.gub.montevideo.gis.geomvd.dfr.fields;

import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;


public class RutasRecorridoPLCalcs {

    private static String datasource = "brfDS";
	
	public static String getZonaRecorrido(String _geometry, Usuario usuario) throws Exception {
		
		return ServiceDFR.cargarZonaRecorridoPL(_geometry, usuario);
	}
	

}
