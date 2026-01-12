package uy.gub.montevideo.gis.geomvd.geoprep.fields;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class LocalesCircuitosCalcs {

private static String datasourcePg = "nucleoDS";
	
	public static String getDireccion(String _geometry, Usuario usuario) throws Exception {
		JSONArray colXeY = ServiceDFR.getXeY(_geometry);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
		String retorno = Restconsuming.ubicacionByXeY(x, y , Boolean.TRUE);
		
		String direccionRetorno = "";
		if (retorno != null) {
			JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
			direccionRetorno = convertedObject.get("descripcion").getAsString();
		}

		if (retorno == null || direccionRetorno.startsWith("No existe"))
			direccionRetorno = "";
		return direccionRetorno;
	}
	
	public static String getMunicipio(String _geometry, Usuario usuario) throws Exception {

		return ServiceDFR.obtenerMunicipio(_geometry, usuario);
	}
	
	public static String getRevisado(String _geometry, Usuario usuario) throws Exception {

		return "S";
	}
	
	public static String getAccesible(String _geometry, Usuario usuario) throws Exception {

		return "N";
	}
	
	public static int getCcz(String _geometry, Usuario usuario) throws Exception {

		return Integer.valueOf(ServiceDFR.obtenerCentroComunalZonal(_geometry, usuario).replace("CCZ", ""));
	}
    
}
