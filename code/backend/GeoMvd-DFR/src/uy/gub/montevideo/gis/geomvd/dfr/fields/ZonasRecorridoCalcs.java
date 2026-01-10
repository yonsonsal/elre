package uy.gub.montevideo.gis.geomvd.dfr.fields;

import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class ZonasRecorridoCalcs {

private static String datasource = "brfDS";
	
	public static String getZonaRecorrido(String _geometry, Usuario usuario) throws Exception {
		
		return ServiceDFR.cargarZonaRecorrido(_geometry, usuario);
	}
	
	public static String getMunicipio(String _geometry, Usuario usuario) throws Exception {
		
		return ServiceDFR.obtenerMunicipio(_geometry, usuario);
	}
}
