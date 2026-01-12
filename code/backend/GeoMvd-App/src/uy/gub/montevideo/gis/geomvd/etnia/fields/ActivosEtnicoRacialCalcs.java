package uy.gub.montevideo.gis.geomvd.etnia.fields;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class ActivosEtnicoRacialCalcs {
	
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
			if(convertedObject.has("geometria") && 
			   convertedObject.get("geometria").getAsJsonObject().has("geoJSON") &&
			   convertedObject.get("geometria").getAsJsonObject().get("geoJSON").getAsJsonObject().has("type")
			   ){
				String tipo = convertedObject.get("geometria").getAsJsonObject().get("geoJSON").getAsJsonObject().get("type").getAsString();
				if(tipo.equalsIgnoreCase("MultiPolygon") || tipo.equalsIgnoreCase("Polygon")) {
					String via = convertedObject.get("via").getAsString();
					
					retorno = Restconsuming.nombreViabycodigo(via);
					if (retorno != null) {
						convertedObject = new Gson().fromJson(retorno, JsonObject.class);
						direccionRetorno = direccionRetorno + ", por calle " + convertedObject.get("descripcion").getAsString();
					}
				}
			}
		}

		if (retorno == null || direccionRetorno.startsWith("No existe"))
			direccionRetorno = "";
		return direccionRetorno;
	}
	
	public static String getMunicipio(String _geometry, Usuario usuario) throws Exception {

		return ServiceDFR.obtenerMunicipio(_geometry, usuario);
	}
}
