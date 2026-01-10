package uy.gub.montevideo.gis.geomvd.piai.fields;

import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class OcupacionesIrregularesCalcs {
	
	public static String getMunicipio(String _geometry, Usuario usuario) throws Exception {

		return ServiceDFR.obtenerMunicipio(_geometry, usuario);
	}
	
	public static int getCcz(String _geometry, Usuario usuario) throws Exception {

		return Integer.valueOf(ServiceDFR.obtenerCentroComunalZonal(_geometry, usuario).replace("CCZ", ""));
	}
}
