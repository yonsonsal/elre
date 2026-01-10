package uy.gub.montevideo.gis.geomvd.dfr.fields;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class PosicionesRecorridoPLCalcs {

private static String datasource = "brfDS";
	
	public static String getZonaRecorrido(String _geometry, Usuario usuario) throws Exception {
		
		return ServiceDFR.cargarZonaRecorridoPL(_geometry, usuario);
	}
	
	public static String getCallePuerta(String _geometry, Usuario usuario) throws Exception {  
		
		JSONArray colXeY = ServiceDFR.getXeY(_geometry);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x,y); 
        
        String direccionRetorno = "";
		if (retorno != null) {
			JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
		} else {
			retorno = Restconsuming.esquinaByXeY(x, y);
			if(retorno !=null){
				JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
				direccionRetorno = convertedObject.get("descripcion").getAsString();
			}
		}
		if (retorno == null || direccionRetorno.startsWith("No existe")){
			direccionRetorno = "";
		}
		return direccionRetorno;
    }
}
