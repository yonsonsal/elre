package uy.gub.montevideo.gis.geomvd.core.rest;

import com.google.gson.*;
import org.json.JSONArray;

import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.db.DBHelper;
import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/core")
@Consumes({ "application/json" })
@Produces({ "application/json" })
public class CoreService {

    @Path("/selectmultiple")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response getDataSelectMultiple(Object data, @Context HttpServletRequest req) {
        Usuario user = SecurityHelper.getCurrentUser(req);

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String json = gson.toJson(data);
        JsonObject convertedObject = new Gson().fromJson(json, JsonObject.class);
        try {
            String tabla = convertedObject.get("tabla").getAsString();
            String datasource = convertedObject.get("Origen_datos").getAsString();
            String filter = convertedObject.get("filter").getAsString();
            String dbms = convertedObject.get("dbms").getAsString();
            JsonArray atributos = convertedObject.get("atributos").getAsJsonArray();
            
            ConfigParser instancia = ConfigParser.getInstance();
            Capa cap_aux = instancia.findCapaByTableName(tabla);
            String pk = (cap_aux.getPk()==null?"":cap_aux.getPk() + ",");
            
            String attList = "";
            for (JsonElement a : atributos){
                attList += a.getAsString() + " ,";
            }
            JSONArray result = Datahandler.selectAsJSONArray(datasource, "SELECT " + pk + attList + " " + DBHelper.geoColumnAsWKTBothSRS(dbms) + " FROM " + tabla + (filter.length()>0?" WHERE " + filter:""), false, user);
            return Response.status(200)
                    .entity(result.toString()).build();
        } catch(Exception e) {
            e.printStackTrace();
            return Response.status(500).entity(e.getMessage()).build();
        }

    }
}
