package uy.gub.montevideo.gis.geomvd.dfr.fields;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class ContenedoresCAPCalcs {

    private static String datasource = "brfDS";

    public static float getCapacidadSeca(String _geometry, Usuario usuario) {
        return (float) 3;
    }

    public static float getCapacidadHumeda(String _geometry, Usuario usuario) {
        return (float) 2.25;
    }

    public static Integer getCantHumedo(String _geometry, Usuario usuario) {
        return 1;
    }

    public static Integer getCantSeco(String _geometry, Usuario usuario) {
        return 0;
    }

    public static String getZonaCircuitoCap(String _geometry, Usuario usuario) throws Exception {
        return ServiceDFR.getZonaCircuitoCap(_geometry, usuario);
    }
    
    public static String getDireccion(String gid, Usuario usuario) throws Exception {  
		System.out.println("gid " + gid);
		String geometria = Datahandler.selectOneValue(datasource, "select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from df_cap_contenedores where gid="+gid, usuario);

		JSONArray colXeY = ServiceDFR.getXeY(geometria);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x,y); 
        
        String direccionRetorno = "";
		if (retorno != null) {
			System.out.println("retorno != null");
			JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
			direccionRetorno = convertedObject.get("descripcion").getAsString();
		} else {
			System.out.println("retorno == null");
			retorno = Restconsuming.esquinaByXeY(x, y);
			System.out.println("esquina");
			System.out.println(retorno);
			if(retorno !=null){
				JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
				direccionRetorno = convertedObject.get("descripcion").getAsString();
			}
		}
		if (retorno == null || direccionRetorno.startsWith("No existe")){
			System.out.println("retorno == null || direccionRetorno.startsWith(No existe");
			direccionRetorno = "";
		}
		System.out.println("direccionRetorno: " +direccionRetorno);
		return direccionRetorno;
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
			direccionRetorno = convertedObject.get("descripcion").getAsString();
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
