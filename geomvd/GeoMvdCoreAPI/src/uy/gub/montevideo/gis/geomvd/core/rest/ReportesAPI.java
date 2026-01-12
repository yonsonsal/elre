package uy.gub.montevideo.gis.geomvd.core.rest;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import uy.gub.montevideo.gis.geomvd.core.AtributoCapa;
import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.api.ReportFilter;
import uy.gub.montevideo.gis.geomvd.core.api.ReportesCore;
import uy.gub.montevideo.gis.geomvd.core.api.ResultSetConvert;
import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;


@Path("/reportes")
@Consumes({ "application/json" })
@Produces({ "application/json" })
public class ReportesAPI {
	
	@Path("/csv/{dbms}/{datasource}/{tabla}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getCSV(@PathParam("datasource") String ds, @PathParam("tabla") String tabla, @PathParam("dbms") String dbms, ReportFilter filter, @Context HttpServletRequest req, @Context ServletContext context) {
		Usuario user = SecurityHelper.getCurrentUser(req);

		try {
			String columnas = obtenerColumnasExportables(tabla, "csv");
			filter.columns = columnas;
			String result = ResultSetConvert.toCSVFile(tabla, ReportesCore.selectFilter(dbms, ds, tabla, filter, false, false, user), context.getRealPath("reports"), user);
			return Response.status(200)
		               .entity(result).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}		
	}

	@Path("/kml/{dbms}/{datasource}/{tabla}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getKML(@PathParam("datasource") String ds, @PathParam("tabla") String tabla, @PathParam("dbms") String dbms, ReportFilter filter, @Context HttpServletRequest req, @Context ServletContext context) {
		Usuario user = SecurityHelper.getCurrentUser(req);

		try {
			String columnas = obtenerColumnasExportables(tabla, "kml");
			filter.columns = columnas;
			String result = ResultSetConvert.toKMLFile(tabla, ReportesCore.selectFilter(dbms, ds, tabla, filter, true, true, user), context.getRealPath("reports"), user);
			return Response.status(200)
					.entity(result).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/shp/{dbms}/{datasource}/{tabla}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getSHP(@PathParam("datasource") String ds, @PathParam("tabla") String tabla, @PathParam("dbms") String dbms, ReportFilter filter, @Context HttpServletRequest req, @Context ServletContext context) {
		Usuario user = SecurityHelper.getCurrentUser(req);

		try {
			String columnas = obtenerColumnasExportables(tabla, "shp");
			filter.columns = columnas;
			String result = ResultSetConvert.toSHPFile(tabla, ReportesCore.selectFilter(dbms, ds, tabla, filter, true, true, user), context.getRealPath("reports"), user);
			return Response.status(200)
					.entity(result).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/geojson/{dbms}/{datasource}/{tabla}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getGeoJson(@PathParam("datasource") String ds, @PathParam("tabla") String tabla, @PathParam("dbms") String dbms, ReportFilter filter, @Context HttpServletRequest req, @Context ServletContext context) {
		Usuario user = SecurityHelper.getCurrentUser(req);

		try {
			String columnas = obtenerColumnasExportables(tabla, "shp");
			filter.columns = columnas;
			String result = ResultSetConvert.toGeoJsonFile(tabla, ReportesCore.selectFilter(dbms, ds, tabla, filter, true, true, user), context.getRealPath("reports"), user);
			return Response.status(200)
					.entity(result).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	private String obtenerColumnasExportables(String tabla, String format) {
		ConfigParser data = ConfigParser.getInstance();
		//CustomLogger.log().info("Exportando tabla: " + tabla);
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
}
