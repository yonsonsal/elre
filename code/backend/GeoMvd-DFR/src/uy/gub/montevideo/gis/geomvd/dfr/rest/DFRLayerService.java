package uy.gub.montevideo.gis.geomvd.dfr.rest;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
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
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.Layer;
import uy.gub.montevideo.gis.geomvd.core.Restconsuming;
import uy.gub.montevideo.gis.geomvd.core.api.ReportesCore;
import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.core.fields.ReflectionCalcs;
import uy.gub.montevideo.gis.geomvd.dfr.function.DatahandlertDFR;
import uy.gub.montevideo.gis.geomvd.util.ConfigProperties;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;
import uy.gub.montevideo.gis.geomvd.util.JsonUtils;
import uy.gub.montevideo.gis.geomvd.util.RolesUtils;

@Path("/layers")
@Consumes({ "application/json" })
@Produces({ "application/json" })
public class DFRLayerService {

	@GET
	public Response getLayers(@Context HttpServletRequest req) {

		ConfigParser data = ConfigParser.getInstance();
		Usuario user = SecurityHelper.getCurrentUser(req);
		String layers = "";
		//CustomLogger.log().info("Obteniendo layers de usuario: " + user.getUsername() + "|"+user.getRoles());

		List<Capa> capas = data.getAppData();
		List<Layer> Layers = RolesUtils.getLayerswithRoles(capas, user);
		
		layers = JsonUtils.generateJSON(Layers); 
		return Response.status(200).entity(layers).build();
	}
	
	@Path("/tieneRolEdicionUtilidades")
	@GET
	public Response tieneRolEdicionUtilidades(@Context HttpServletRequest req) {

		Usuario user = SecurityHelper.getCurrentUser(req);

		boolean tieneRol = RolesUtils.isEspcificrolEditbyUser(user, "RA_GEOSDFR_EDICION");
		
		System.out.println("tieneRolEdicionUtilidades: " + tieneRol); 
		return Response.status(200).entity(tieneRol).build();
	}


	@Path("/atributocapaformat")
	@GET
	public Response getAtributoCapa(@QueryParam(value = "capa") String capa, @Context HttpServletRequest req) {
		ConfigParser data = ConfigParser.getInstance();
		Usuario user = SecurityHelper.getCurrentUser(req);

		//CustomLogger.log().info("Obteniendo atributos de las capas para el usuario: " + user.getUsername());
		String atributocapa = "";
		Capa capaAux = data.findCapa(capa);

		capaAux = RolesUtils.getCapaswithRoles(capaAux, user);
		
		atributocapa = JsonUtils.generateAtributoJSON(capaAux);
		return Response.status(200).entity(atributocapa).build();
	}
	
	@Path("/codiguerasformat")
	@GET
	public Response getCodigueras() {
		String codigueras = "";
		ConfigParser data = ConfigParser.getInstance();
		codigueras = data.getCodiguerasJSON();
		return Response.status(200).entity(codigueras).build();
	}
	
	@Path("/codiguerasdata")
	@GET
	public Response getCodiguerasData(@Context HttpServletRequest req) {
		ConfigParser data = ConfigParser.getInstance();
		Usuario user = SecurityHelper.getCurrentUser(req);
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
	
	@Path("/selecttable")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getDataSelect(Object data, @Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(data);
		JsonObject convertedObject = new Gson().fromJson(json, JsonObject.class);
		try {
			String columnasExportables = ReportesCore.obtenerColumnasExportables(convertedObject.get("tabla").getAsString(), "plain");
			JSONArray result = Datahandler.select(convertedObject, columnasExportables, false, user);
			return Response.status(200)
		               .entity(result.toString()).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
		
	}

	@Path("/getCalcFields")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getCalcFields(@QueryParam(value = "tabla") String tabla, Object data, @Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);

		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(data);
		//CustomLogger.log().info("Recibido getCalcFields: " + json);
		JSONObject object = new JSONObject(json);
		try {
			Map<String, String> valoresCalculados = ConfigParser.getInstance().getCalcFields(tabla);
			ReflectionCalcs.injectCalcFields(object, valoresCalculados, user);
			return Response.status(200)
					.entity(object.toString()).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}

	}
	
	@Path("/execute_i_d_u")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response execute_i_d_u(Object data, @Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);

		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(data);
		JsonObject convertedObject = new Gson().fromJson(json, JsonObject.class);
		
		String metodo = convertedObject.get("metodo").getAsString();
		String tabla = convertedObject.get("tabla").getAsString();
		
		ConfigParser dataConfig = ConfigParser.getInstance();
		Capa capa = dataConfig.findCapaByTableName(tabla);

		String response = "";
		try {
			boolean tienePermiso = RolesUtils.isrolEditbyUser(capa, user, false);
			boolean tienePermisoParcial = RolesUtils.isrolEditbyUser(capa, user, true);

			if (metodo.equals("insert") && tienePermiso && (capa.isAlta() || capa.getCanSplit() || capa.getCanClone() ) ) {
				response = Datahandler.insert(convertedObject, user);
			}
			else if (metodo.equals("update") && ((tienePermiso && (capa.isEditable() || capa.getCanDeleteVertex())) ||
					(tienePermisoParcial && capa.isEditable()))) {
				if (capa.getNombre().equalsIgnoreCase("Zonas Recorrido"))
					response = DatahandlertDFR.modificaZonasRecorrido(convertedObject, user);
				else if (capa.getNombre().equalsIgnoreCase("Posiciones Recorrido")) {
					System.out.println("modificar posiciones recorrido");
					response = DatahandlertDFR.modificacionPosicionRecorrido(convertedObject, user);
				} else
					response = Datahandler.update(convertedObject, user);
			}
			else if (metodo.equals("delete") && tienePermiso &&  (capa.isBaja() || capa.getCanSplit())) {
				
				if(capa.getNombre().equalsIgnoreCase("Posiciones Recorrido")) {
					response = DatahandlertDFR.bajaPosicionesRecorrido(convertedObject, user);
				} else {
					response = Datahandler.delete(convertedObject, user);
				}
			} else {
				return Response.status(500).entity("Metodo no soportado").build();
			}
			return Response.status(201)
		               .entity(response).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
		
	}
	
	
	@Path("/updateCascade")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response updateCascade(Object data, @Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);
		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(data);
		JsonObject convertedObject = new Gson().fromJson(json, JsonObject.class);
		
		String response = "";
		try {
			
			response = DatahandlertDFR.updateCascade(convertedObject, user);
			return Response.status(201)
		               .entity(response).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
		
	}
	
	
	@Path("/nombrecallebycodigo")
	@GET
	public Response getNombrecallebycodigo(@QueryParam(value = "codigo") String codigocalle) {
		try {
			String respons = Restconsuming.nombrecallebycodigo(codigocalle);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe la via con codigo: " + codigocalle + ", o ocurrio un error").build();
		}
		
	}
	
	@Path("/calleLikenombre")
	@GET
	public Response getcalleLikenombre(@QueryParam(value = "nomCalle") String nomCalle) {
		try {
			String respons = Restconsuming.calleLikenombre(nomCalle);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No se ecnontraron coincidencia con la palabra " + nomCalle + ", o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacioncallebycodigoandnropuerta")
	@GET
	public Response getubicacioncallebycodigoandnropuerta(@QueryParam(value = "codigo") String codigocalle,@QueryParam(value = "nropuerta") String nropuerta) {
		try {
			String respons = Restconsuming.ubicacioncallebycodigoandnropuerta(codigocalle,nropuerta);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe la via con codigo: " + codigocalle + " y nropuerta: " + nropuerta + ", o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicaciongeometricopadron")
	@GET
	public Response getubicaciongeometricopadron(@QueryParam(value = "padron") String padron) {
		try {
			String respons = Restconsuming.ubicaciongeometricopadron(padron);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el padron: " + padron + " , o ocurrio un error").build();
		}
		
	}
	
	
	@Path("/ubicacioncentroidepadron")
	@GET
	public Response getubicacioncentroidepadron(@QueryParam(value = "padron") String padron) {
		try {
			String respons = Restconsuming.ubicacioncentroidepadron(padron);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el padron: " + padron + " , o ocurrio un error").build();
		}
		
	}
	
	
	@Path("/ubicacioncalleesquina")
	@GET
	public Response getubicacioncalleesquina(@QueryParam(value = "codigoCalle1") String codigoCalle1,@QueryParam(value = "codigoCalle2") String codigoCalle2) {
		try {
			String respons = Restconsuming.ubicacioncalleesquina(codigoCalle1,codigoCalle2);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe la esquina entre la calle: " + codigoCalle1 + " y " + codigoCalle2 + ", o ocurrio un error").build();
		}
		
	}
	
	@Path("/callesesquina")
	@GET
	public Response getcallesesquina(@QueryParam(value = "codigoCalle") String codigoCalle) {
		try {
			String respons = Restconsuming.callesesquina(codigoCalle);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existen calles esquina para la calle: " + codigoCalle + ", o ocurrio un error").build();
		}
		
	}
	
	
	@Path("/tipomedicion")
	@GET
	public Response getTipoMedicionMapa() {
		String geodesicMeasure = GetPropertyValues.getInstance().getValue(ConfigProperties.geodesicMeasure.getValue());
		
		geodesicMeasure = "{ \"geodesicMeasure\": " + geodesicMeasure  +" }";

		return Response.status(200).entity(geodesicMeasure).build();
	}
	
	@Path("/urlmanual")
	@GET
	public Response getManual() {
		String urlManual = GetPropertyValues.getInstance().getValue(ConfigProperties.urlManual.getValue());
		
		urlManual = "{ \"urlmanual\":\"" + urlManual  +"\" }";

		return Response.status(200).entity(urlManual).build();
	}
	
	@Path("/urlgeoserver")
	@GET
	public Response getUrlgeoserver() {
		String urlgeoserver = GetPropertyValues.getInstance().getValue(ConfigProperties.URLgeoserver.getValue());
		
		urlgeoserver = "{ \"urlgeoserver\": \"" + urlgeoserver  +"\" }";

		return Response.status(200).entity(urlgeoserver).build();
	}
	
	@Path("/ccz")
	@GET
	public Response getccz() {
		try {
			String respons = Restconsuming.ccz();
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("Error al obtener los ccz").build();
		}
		
	}

	@Path("/ubicacioncentroidccz")
	@GET
	public Response getubicacioncentroidccz(@QueryParam(value = "ccz") String ccz) {
		try {
			String respons = Restconsuming.ubicacioncentroidccz(ccz);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el ccz: " + ccz + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicaciongeometricoccz")
	@GET
	public Response getubicaciongeometricoccz(@QueryParam(value = "ccz") String ccz) {
		try {
			String respons = Restconsuming.ubicaciongeometricoccz(ccz);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el ccz: " + ccz + " , o ocurrio un error").build();
		}
		
	}	
	
	@Path("/barrioLikenombre")
	@GET
	public Response getbarrioLikenombre(@QueryParam(value = "nomBarrio") String nomBarrio) {
		try {
			String respons = Restconsuming.barrioLikenombre(nomBarrio);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No se ecnontraron coincidencia con la palabra " + nomBarrio + ", o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacioncentroidbarrio")
	@GET
	public Response getubicacioncentroidbarrio(@QueryParam(value = "codBarrio") String codBarrio) {
		try {
			String respons = Restconsuming.ubicacioncentroidbarrio(codBarrio);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el barrio: " + codBarrio + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicaciongeometricobarrio")
	@GET
	public Response getubicaciongeometricobarrio(@QueryParam(value = "codBarrio") String codBarrio) {
		try {
			String respons = Restconsuming.ubicaciongeometricobarrio(codBarrio);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el barrio: " + codBarrio + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/municipios")
	@GET
	public Response getmunicipios() {
		try {
			String respons = Restconsuming.municipios();
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("Error al obtener los municipios").build();
		}
		
	}
	
	@Path("/ubicacioncentroidmunicipio")
	@GET
	public Response getubicacioncentroidmunicipio(@QueryParam(value = "municipio") String municipio) {
		try {
			String respons = Restconsuming.ubicacioncentroidmunicipio(municipio);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el municipio: " + municipio + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicaciongeometricomunicipio")
	@GET
	public Response getubicaciongeometricomunicipio(@QueryParam(value = "municipio") String municipio) {
		try {
			String respons = Restconsuming.ubicaciongeometricomunicipio(municipio);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el municipio: " + municipio + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/lugarDeInteresLikenombre")
	@GET
	public Response getlugarDeInteresLikenombre(@QueryParam(value = "lugar") String lugar, @QueryParam(value = "nombre") String nombre) {
		try {
			String respons = Restconsuming.lugarDeInteresLikenombre(lugar, nombre);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No se ecnontraron " + lugar + " con la palabra " + nombre + ", o ocurrio un error").build();
		}
	}
	
	@Path("/ubicacionCultura")
	@GET
	public Response getubicacionCultura(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacionCultura(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Lugar Cultura: " + codigo + " , o ocurrio un error").build();
		}
	}
	
	@Path("/ubicacionDeporte")
	@GET
	public Response getubicacionDeporte(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacionDeporte(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Lugar Deporte: " + codigo + " , o ocurrio un error").build();
		}
	}
	
	@Path("/ubicacionEducacion")
	@GET
	public Response getubicacionEducacion(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacionEducacion(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Lugar Educacion: " + codigo + " , o ocurrio un error").build();
		}
	}
	
	@Path("/ubicaciongeometricoEspacioLibre")
	@GET
	public Response getubicaciongeometricoEspacioLibre(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicaciongeometricoEspacioLibre(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Espacio Libre: " + codigo + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacioncentroidEspacioLibre")
	@GET
	public Response getubicacioncentroidEspacioLibre(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacioncentroidEspacioLibre(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Espacio Libre: " + codigo + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacionMonumentos")
	@GET
	public Response getubicacionMonumentos(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacionMonumentos(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Lugar Monumento: " + codigo + " , o ocurrio un error").build();
		}
	}
	
	@Path("/ubicaciongeometricoPatrimonio")
	@GET
	public Response getubicaciongeometricoPatrimonio(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicaciongeometricoPatrimonio(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Patrimonio: " + codigo + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacioncentroidPatrimonio")
	@GET
	public Response getubicacioncentroidPatrimonio(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacioncentroidPatrimonio(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Patrimonio: " + codigo + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicaciongeometricoPlaya")
	@GET
	public Response getubicaciongeometricoPlaya(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicaciongeometricoPlaya(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Playa: " + codigo + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacioncentroidPlaya")
	@GET
	public Response getubicacioncentroidPlaya(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacioncentroidPlaya(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Playa: " + codigo + " , o ocurrio un error").build();
		}
		
	}
	
	@Path("/ubicacionSalud")
	@GET
	public Response getubicacionSalud(@QueryParam(value = "codigo") String codigo) {
		try {
			String respons = Restconsuming.ubicacionSalud(codigo);
	
			return Response.status (Response.Status.OK).entity(respons).build() ;
		}catch (Exception e) {
			return Response.status(Response.Status.NOT_FOUND).entity("No existe el Lugar Salud: " + codigo + " , o ocurrio un error").build();
		}
	}
}