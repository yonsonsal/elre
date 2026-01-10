package uy.gub.montevideo.gis.geomvd.dfr.rest;


import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;


@Path("/validateDFR")
@Consumes({ "application/json" })
@Produces({ "application/json" })
public class DFRValidations {
	
	@Path("/cargarZonaRecorrido/")
	@GET
	public Response cargarZonaRecorrido(
			@QueryParam(value = "geom") String geom,
			@javax.ws.rs.core.Context HttpServletRequest req) {

		Usuario user = SecurityHelper.getCurrentUser(req);
		try {
			String resultado = "";
			resultado = ServiceDFR.cargarZonaRecorrido(geom, user);
			System.out.println("resultado " + resultado);
			if(resultado.equalsIgnoreCase("")) {
				return Response.status(200)
						.entity(null).build();
			}
			else {
				return Response.status(200)
						.entity(resultado.toString()).build();
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/chequeoPosicionesFueraZona/")
	@GET
	public Response chequeoPosicionesFueraZona(@QueryParam(value = "codigoRecorrido") String codigoRecorrido, @QueryParam(value = "geom") String geom,
			@javax.ws.rs.core.Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);
		try {
			Boolean result = ServiceDFR.chequeoPosicionesFueraZona(codigoRecorrido, geom, user);
			return Response.status(200)
					.entity(result.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/chequeoPosicionesFueraZonaPlanificado/")
	@GET
	public Response chequePosicionesFueraZonaPlanificado(@QueryParam(value = "codigoRecorrido") String codigoRecorrido,
			@QueryParam(value = "geom") String geom,
			@javax.ws.rs.core.Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);
		try {
			Boolean result = ServiceDFR.chequePosicionesFueraZonaPlanificado(codigoRecorrido, geom, user);
			return Response.status(200)
					.entity(result.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/chequeoPosicionesRegionCAP/")
	@GET
	public Response chequeoPosicionesRegionCAP(@QueryParam(value = "geom") String geom,
			@javax.ws.rs.core.Context HttpServletRequest req) {
		Usuario user = SecurityHelper.getCurrentUser(req);
		try {
			Boolean result = ServiceDFR.chequeoPosicionesRegionCAP(geom, user);
			return Response.status(200)
					.entity(result.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/chequeoPosicionesRecorridoTieneContenedoresAsociados/")
	@GET
	public Response posicionesRecorridoTieneContenedoresAsociados(
			@QueryParam(value = "gid") String gid,
			@javax.ws.rs.core.Context HttpServletRequest req) {

		Usuario user = SecurityHelper.getCurrentUser(req);
		try {
			Boolean result = ServiceDFR.posicionesRecorridoTieneContenedoresAsociados(gid, user);
			System.out.println("result.toString() " + result.toString());
			return Response.status(200)
					.entity(result.toString()).build();			
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/chequeoPosicionesRecorridoEstaFueraDeZona/")
	@GET
	public Response posicionesRecorridoControlEstaFueraDeZona(
			@QueryParam(value = "gid") String gid,
			@QueryParam(value = "geom") String geom,
			@javax.ws.rs.core.Context HttpServletRequest req) {

		Usuario user = SecurityHelper.getCurrentUser(req);
		try {
			Boolean result = ServiceDFR.posicionesRecorridoControlEstaFueraDeZona(gid, geom, user);
			System.out.println("result.toString() " + result.toString());
			return Response.status(200)
					.entity(result.toString()).build();			
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	
}
