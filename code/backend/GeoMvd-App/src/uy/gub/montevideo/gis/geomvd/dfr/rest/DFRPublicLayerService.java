package uy.gub.montevideo.gis.geomvd.dfr.rest;

import static uy.gub.montevideo.gis.geomvd.core.db.DBHelper.geoColumnAsWKT;
import static uy.gub.montevideo.gis.geomvd.util.Constants.CSV_COLUMN_SEPARATOR;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.naming.NamingException;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import uy.gub.montevideo.gis.geomvd.core.AtributoCapa;
import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.Layer;
import uy.gub.montevideo.gis.geomvd.core.api.ReportFilter;
import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.core.fields.ReflectionCalcs;
import uy.gub.montevideo.gis.geomvd.util.JsonUtils;
import uy.gub.montevideo.gis.geomvd.util.RandomGenerator;
import uy.gub.montevideo.gis.geomvd.util.RolesUtils;
import uy.gub.montevideo.gis.geomvd.util.StringUtils;

@Path("/public/{appName}/layers")
@Consumes({ "application/json" })
@Produces({ "application/json" })
public class DFRPublicLayerService {

	@GET
	public Response getLayers(@PathParam("appName") String appName, @QueryParam(value = "username") String username, @Context HttpServletRequest req) {

		ConfigParser data = ConfigParser.getInstanceAppMap(appName);
		// Make username optional for open-source distribution - default to "test" if not provided
		String effectiveUsername = (username != null && !username.isEmpty()) ? username : "test";
		Usuario user = SecurityHelper.getCurrentUser(effectiveUsername.toUpperCase(), req);
		String layers = "";
		//CustomLogger.log().info("Obteniendo layers de usuario: " + user.getUsername() + "|"+user.getRoles());

		List<Capa> capas = data.getAppData();
		List<Layer> Layers = RolesUtils.getLayerswithRolesPlugineta(capas, user);
		
		layers = JsonUtils.generateJSON(Layers); 
		return Response.status(200).entity(layers).build();
	}

	@Path("/atributocapaformat")
	@GET
	public Response getAtributoCapa(@PathParam("appName") String appName, @QueryParam(value = "username") String username, @QueryParam(value = "capa") String capa, @Context HttpServletRequest req) {
		ConfigParser data = ConfigParser.getInstanceAppMap(appName);
		String effectiveUsername = (username != null && !username.isEmpty()) ? username : "test";
		Usuario user = SecurityHelper.getCurrentUser(effectiveUsername.toUpperCase(), req);

		//CustomLogger.log().info("Obteniendo atributos de las capas para el usuario: " + user.getUsername());
		String atributocapa = "";
		Capa capaAux = data.findCapa(capa);
		
		if (capaAux == null) {
			return Response.status(Response.Status.NOT_FOUND).entity("La capa : "+ capa + " no tiene metadata").build();
		}

		capaAux = RolesUtils.getCapaswithRolesPlugineta(capaAux, user);
		
		atributocapa = JsonUtils.generateAtributoJSON(capaAux);
		return Response.status(200).entity(atributocapa).build();
	}
	
	@Path("/codiguerasformat")
	@GET
	public Response getCodigueras(@PathParam("appName") String appName) {
		String codigueras = "";
		ConfigParser data = ConfigParser.getInstanceAppMap(appName);
		codigueras = data.getCodiguerasJSON();
		return Response.status(200).entity(codigueras).build();
	}
	
	@Path("/codiguerasdata")
	@GET
	public Response getCodiguerasData(@PathParam("appName") String appName, @QueryParam(value = "username") String username, @Context HttpServletRequest req) {
		ConfigParser data = ConfigParser.getInstanceAppMap(appName);
		String effectiveUsername = (username != null && !username.isEmpty()) ? username : "test";
		Usuario user = SecurityHelper.getCurrentUser(effectiveUsername.toUpperCase(), req);
		String codigueras = "";
		codigueras = data.getCodiguerasJSON();
		//System.out.println("codigueras " + codigueras);
		JSONArray codArray = new JSONArray();
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		JsonArray convertedObject = gson.fromJson(codigueras, JsonArray.class);
		try {
			int cantCodi = convertedObject.size();
			//System.out.println("cantCodi " + cantCodi);
			int i = 0;
			while (i < cantCodi){
				String datasource = convertedObject.get(i).getAsJsonObject().get("Origen_datos").getAsString();
				String tabla = convertedObject.get(i).getAsJsonObject().get("nombreTabla").getAsString();
				//CustomLogger.log().info("Cargando codiguera " + datasource +":" + tabla);
				//System.out.println(convertedObject.get(i).getAsJsonObject().getAsJsonObject());
				String pk = convertedObject.get(i).getAsJsonObject().get("pk").getAsString();
				String comboValue = convertedObject.get(i).getAsJsonObject().get("comboValue")!=null?convertedObject.get(i).getAsJsonObject().get("comboValue").getAsString():pk;
				String comboLabel = convertedObject.get(i).getAsJsonObject().get("comboLabel")!=null?convertedObject.get(i).getAsJsonObject().get("comboLabel").getAsString():"";
				//CustomLogger.log().info("armando pk " + pk);
				String sql = "select * from " + tabla + " order by " + pk;
				//CustomLogger.log().info("armando query " + sql);
				JSONArray result = Datahandler.selectAsJSONArray(datasource, sql, false, user);
				String codi = convertedObject.get(i).getAsJsonObject().get("Nombre Capa").getAsString();

				JSONObject codiguera = new JSONObject();
				//System.out.println(codi);
				codiguera.put("Codiguera", codi);
				codiguera.put("comboValue", comboValue);
				codiguera.put("comboLabel", comboLabel);
				codiguera.put("Data", result==null?new JSONArray():result);
				//System.out.println(codiguera.get("Data"));
				codArray.put(codiguera);
				i++;
			}	
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
		return Response.status(200)
	               .entity(codArray.toString()).build();
	}
	
	@Path("/getCalcFields")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getCalcFields(@PathParam("appName") String appName, @QueryParam(value = "username") String username, @QueryParam(value = "tabla") String tabla, Object data, @Context HttpServletRequest req) {
		String effectiveUsername = (username != null && !username.isEmpty()) ? username : "test";
		Usuario user = SecurityHelper.getCurrentUser(effectiveUsername.toUpperCase(), req);

		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(data);
		System.out.println("Recibido getCalcFields: " + json);
		JSONObject object = new JSONObject(json);
		try {
			Map<String, String> valoresCalculados = ConfigParser.getInstanceAppMap(appName).getCalcFields(tabla);
			ReflectionCalcs.injectCalcFields(object, valoresCalculados, user);
			return Response.status(200)
					.entity(object.toString()).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}

	}	
 
	@Path("reportes/csv/{dbms}/{datasource}/{tabla}")
	@POST
	//@Consumes(MediaType.APPLICATION_JSON)
	@Produces({"text/csv"})
	public Response getCSV(@PathParam("appName") String appName, @PathParam("datasource") String ds, @PathParam("tabla") String tabla, @PathParam("dbms") String dbms, @QueryParam(value = "username") String username, ReportFilter filter, @Context HttpServletRequest req, @Context ServletContext context) {
		String effectiveUsername = (username != null && !username.isEmpty()) ? username : "test";
		Usuario user = SecurityHelper.getCurrentUser(effectiveUsername.toUpperCase(), req);

		try {
			System.out.println("tabla " + tabla );
			String columnas = obtenerColumnasExportables(appName, tabla, "csv");
			System.out.println("columnas " + columnas );
			filter.columns = columnas;
			File file = toCSVFile(appName, tabla, selectFilter(appName, dbms, ds, tabla, filter, true, false, user), context.getRealPath("reports"), user);
			//return Response.status(200)
		    //           .entity(result).build();
			return Response.ok(file)
				      .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"" ) //optional
				      .build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}		
	}
	
	private String obtenerColumnasExportables(String appName, String tabla, String format) {
		System.out.println("aplic " + appName);
		ConfigParser data = ConfigParser.getInstanceAppMap(appName);
		Capa capa = data.findCapaByTableName(tabla);
		// Buscar la tabla y los atributos que voy a exportar
		String result = "";
		for (AtributoCapa a : capa.getAtributos().values()) {
			if (a.getNombre_bd()!=null && (a.getNoExporTo()==null || !a.getNoExporTo().contains(format)) &&
					a.isItsintheMD())
				result+=a.getNombre_bd()+",";
		}
		return result.endsWith(",")?result.substring(0, result.length()-1):result;
	}
	
	public static JSONArray selectFilter(String appName, String dbms, String datasource, String tabla, ReportFilter filter, boolean includeGeom, boolean translateToLatLon, Usuario usuario) throws SQLException, NamingException {
		//EN ORACLE NO SE PUEDEN ARMAR LISTAS DE MAS DE 1000 PARAMETROS EN EL WHERE PK IN(1,2,3..,1001) PORQUE DA ERROR ORA-01795
		//ENTONCES ARMAMOS UNA LOGICA QUE GENERE PK IN(1,2,3..,999) OR PK IN (1000, 1001,...,1999)
		String[] filtros = filter.getIdsAsString().split(",");
		int cantidadFiltros = filtros.length;
		String where = "";
		String textoPkFiltro = "";
		
		ConfigParser instancia = ConfigParser.getInstanceAppMap(appName);
		Capa cap_aux = instancia.findCapaByTableName(tabla);
		String pk = (cap_aux.getPk()==null?"":cap_aux.getPk());
		
		//SI VIENEN MAS DE 1000 ENTRAMOS A LA LOGICA NUEVA
		if(cantidadFiltros>1000) {
			for(int i=1; i<=cantidadFiltros; i++) {
				textoPkFiltro += filtros[i-1] + ",";
				//CUANDO LLEGAMOS AL 1000 CORTAMOS, ARMAMOS EL IN Y LIMPIAMOS LA VARIABLE textoPkFiltro
				if(i%1000==0) {
					textoPkFiltro = StringUtils.removeLastComma(textoPkFiltro);
					if(where.equalsIgnoreCase(""))
					{
						where = " " + pk + " IN (" + textoPkFiltro + ")";
					}
					else {
						where += " or " + pk + " IN (" + textoPkFiltro + ")";
					}
					textoPkFiltro = "";
				}
			}
			textoPkFiltro = StringUtils.removeLastComma(textoPkFiltro);
			if(!textoPkFiltro.equalsIgnoreCase("")) {
				where += " or " + pk + " IN (" + textoPkFiltro + ")";
			}
		}//SI VIENEN HASTA 1000 HACE COMO ANTES
		else
		{
			where = " " + pk + " IN (" + filter.getIdsAsString() + ")";			
		}
		
		String columns = (filter.columns!=null&&filter.columns.length()>0)?filter.columns:"*";
		String geom = includeGeom? geoColumnAsWKT(dbms, translateToLatLon) : "";
		if (geom != "") {
			geom = geom + ",";
		}
		String SQL = "select " + pk + ", " +geom +columns+ " FROM " + tabla + " t WHERE " + where;
		return Datahandler.selectAsJSONArray(datasource, SQL, true, usuario);
	}
	
	public static File toCSVFile(String appName, String tabla, JSONArray rs, String basePath, Usuario usuario) throws IOException {
		String path = basePath;
		Map<String, String> valoresCalculados = ConfigParser.getInstanceAppMap(appName).getCalcFieldsNotPersistiblesAndToExportCSV(tabla);
		String filename = "report-"+RandomGenerator.getString(10)+".csv";
		File file = new File(path + "/" + filename);
		FileWriter fw = new FileWriter(file);
		//CustomLogger.log().info("Guardando reporte en " + file.getAbsolutePath());
		List<String> columnNames = new ArrayList<String>();
		for(int i=0; i<rs.length();i++) {
			JSONObject obj = rs.getJSONObject(i);
			// Inyecto campos calculados
			ReflectionCalcs.injectCalcFields(obj, valoresCalculados, usuario);
			// Inicializo las columnas solo 1 vez
			String row = "";
			if (columnNames.size()==0) {
				String headers="";
				for(String k:obj.keySet()) {
					columnNames.add(k);
					headers += k+ CSV_COLUMN_SEPARATOR;
				}
				headers = StringUtils.removeLastComma(headers);
				fw.append(headers);
		        fw.append('\n');
			}
			// Recorro los datos
			for(String col:columnNames) {
				row += obj.getString(col) + CSV_COLUMN_SEPARATOR;
			}
			row = StringUtils.removeLastComma(row);
            fw.append(row);
            fw.append('\n');
		}
       fw.flush();
       fw.close();
	  //String reportsURL = GetPropertyValues.getInstance().getValue(ConfigProperties.REPORTS_BASE_URL.getValue());
	  //return reportsURL+filename;
	  return file;
  }
	
}