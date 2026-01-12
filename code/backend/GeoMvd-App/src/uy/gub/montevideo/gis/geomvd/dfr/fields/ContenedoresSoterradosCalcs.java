package uy.gub.montevideo.gis.geomvd.dfr.fields;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.json.JSONArray;
import org.json.JSONObject;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;

public class ContenedoresSoterradosCalcs {

    private static String datasourcePg = "nucleoDS";
    private static String datasourceOracle = "brfDS";

    public static String getCantidadPorDefecto(String _geometry, Usuario usuario) throws Exception {
        return "1";
    }

    public static String getMunicipio(String _geometry, Usuario usuario) throws Exception {
        return ServiceDFR.getMunicipio(_geometry, usuario);
    }

    public static String getCodMunicipio(String gid, Usuario usuario) throws Exception{
        String municipio = Datahandler.selectOneValue(datasourceOracle,
        "select COD_MUNICIPIO as Municipio from df_contenedores_soterrados where gid=" + gid, usuario);
        return municipio;
    }

    public static String getCallePuerta(String _geometry, Usuario usuario) throws Exception {
        JSONArray colXeY = ServiceDFR.getXeY(_geometry);
        JSONObject datosXeY = (JSONObject) colXeY.get(0);
        double x = Double.parseDouble(datosXeY.get("x").toString());
        double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x, y);
        String direccionRetorno = "";
        if (retorno != null) {
            JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
            direccionRetorno = convertedObject.get("descripcion").getAsString();
        }else {
            retorno = Restconsuming.parqueByXeY(x, y);
            JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
            direccionRetorno = convertedObject.get("descripcion").getAsString();
        }
        if (retorno == null || direccionRetorno.startsWith("No existe"))
            direccionRetorno = "";
        return direccionRetorno;
    }

    public static String getDireccion(String gid, Usuario usuario) throws Exception {
        String geometria = Datahandler.selectOneValue(datasourceOracle,
                "select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from df_contenedores_soterrados where gid=" + gid, usuario);
        JSONArray colXeY = ServiceDFR.getXeY(geometria);
        JSONObject datosXeY = (JSONObject) colXeY.get(0);
        double x = Double.parseDouble(datosXeY.get("x").toString());
        double y = Double.parseDouble(datosXeY.get("y").toString());
        String retorno = Restconsuming.direccionByXeY(x, y);
        String direccionRetorno = "";
        if (retorno != null) {
            JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
            direccionRetorno = convertedObject.get("descripcion").getAsString();
            String numeroRetorno = convertedObject.get("numero").getAsString();
            direccionRetorno = direccionRetorno.replace(numeroRetorno, "").trim();
        } else {
            retorno = Restconsuming.parqueByXeY(x, y);
            JsonObject convertedObject = new Gson().fromJson(retorno, JsonObject.class);
            direccionRetorno = convertedObject.get("descripcion").getAsString();
        }
        if (retorno == null || direccionRetorno.startsWith("No existe"))
            direccionRetorno = "";
        return direccionRetorno;
    }

    public static String getNroPuerta(String gid, Usuario usuario) throws Exception {
        String geometria = Datahandler.selectOneValue(datasourceOracle,
                "select SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) from df_contenedores_soterrados where gid=" + gid, usuario);
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
