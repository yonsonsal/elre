package uy.gub.montevideo.gis.geomvd.dfr.fields;

import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class SelectivaDomiciliariaCalcs {

	private static String datasourcePg = "nucleoDS";
    private static String datasourceOracle = "brfDS";
    private static String datasourceSTM = "stmDS";
		
	public static String getCallePuerta(String _geometry, Usuario usuario) throws Exception {  
		
		JSONArray colXeY = ServiceDFR.getXeY(_geometry);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x,y); 
        
        JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
		
		String direccionRetorno = convertedObject.get("descripcion").getAsString();
        if(direccionRetorno.startsWith("No existe"))  
        	direccionRetorno = ""; 
        return direccionRetorno;
    }
	
	public static String getNroPuerta(String gid, Usuario usuario) throws Exception {  
		
		String geometria = Datahandler.selectOneValue(datasourceOracle, "select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from df_selectiva_domiciliaria where gid="+gid, usuario);
		JSONArray colXeY = ServiceDFR.getXeY(geometria);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x,y); 
        
        JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
		
		String numeroRetorno = convertedObject.get("numero").getAsString();
        if(numeroRetorno.startsWith("No existe"))  
        	numeroRetorno = ""; 
        return numeroRetorno;
    }
	
	public static String getDireccion(String gid, Usuario usuario) throws Exception {  
		
		String geometria = Datahandler.selectOneValue(datasourceOracle, "select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from df_selectiva_domiciliaria where gid="+gid, usuario);

		JSONArray colXeY = ServiceDFR.getXeY(geometria);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x,y); 
        
        JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
		
        String direccionRetorno = convertedObject.get("descripcion").getAsString();
		String numeroRetorno = convertedObject.get("numero").getAsString();
		direccionRetorno = direccionRetorno.replace(numeroRetorno, "").trim();
        if(direccionRetorno.startsWith("No existe"))  
        	direccionRetorno = ""; 
        return direccionRetorno;
    }
	
	
	
	
}
