package uy.gub.montevideo.gis.geomvd.dfr.fields;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.json.JSONArray;
import org.json.JSONObject;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class PosicionesRecorridoHistoricoCalcs {
    
    private static String datasource = "brfDS";
	private static String datasourceOracle = "brfDS";

    public static String getDireccion(String gid, Usuario usuario) throws Exception {
		System.out.println("---------------------------------------");
		System.out.println("gid: " + gid);
		String geometria = Datahandler.selectOneValue(datasourceOracle,
				"select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from v_df_hist_posiciones_recorrido where gid=" + gid, usuario);
		System.out.println("geom: " + geometria);
		JSONArray colXeY = ServiceDFR.getXeY(geometria);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
		System.out.println("x: " + x + "y: " + y);
		String retorno = Restconsuming.direccionByXeY(x, y);
		System.out.println("retorno: " + retorno);
		String direccionRetorno = "";
		if (retorno != null) {
			System.out.println("retorno != null");
			JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
			direccionRetorno = convertedObject.get("descripcion").getAsString();
			String numeroRetorno = convertedObject.get("numero").getAsString();
			direccionRetorno = direccionRetorno.replace(numeroRetorno, "").trim();
		} else {
			System.out.println("retorno == null");
			retorno = Restconsuming.parqueByXeY(x, y);
			System.out.println("parque");
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

	public static String getNroPuerta(String gid, Usuario usuario) throws Exception {
		String geometria = Datahandler.selectOneValue(datasourceOracle,
				"select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from v_df_hist_posiciones_recorrido where gid=" + gid, usuario);
		JSONArray colXeY = ServiceDFR.getXeY(geometria);
		JSONObject datosXeY = (JSONObject) colXeY.get(0);
		double x = Double.parseDouble(datosXeY.get("x").toString());
		double y = Double.parseDouble(datosXeY.get("y").toString());
		String retorno = Restconsuming.direccionByXeY(x, y);
		String numeroRetorno = "";
		if (retorno != null) {
			JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
			numeroRetorno = convertedObject.get("numero").getAsString();
		}
		if (retorno == null || numeroRetorno.startsWith("No existe"))
			numeroRetorno = "";
		return numeroRetorno;
	}

}
