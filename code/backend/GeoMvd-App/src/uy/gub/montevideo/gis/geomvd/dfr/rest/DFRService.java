package uy.gub.montevideo.gis.geomvd.dfr.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import org.json.JSONArray;

import uy.gub.montevideo.gis.geomvd.dfr.function.ServiceDFR;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;

@Path("/servicedfr")
@Consumes({ "application/json" })
@Produces({ "application/json" })
public class DFRService {

	private static String nucleoDatasource = "nucleoDS";

	@Path("/turnos")
	@GET
	public Response getTurnosZonasRecorridos(@QueryParam(value = "turno") String turno) {

		CustomLogger.log().info("Obteniendo turnos " + turno);

		try {
			JSONArray zonasIds = ServiceDFR.getTurnosZonasRecorridos(turno);
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/viajesPlanificados")
	@GET
	public Response getViajesPlanificadosZonasRecorridos() {

		CustomLogger.log().info("Obteniendo viajes planificados");

		try {
			JSONArray zonasIds = ServiceDFR.getViajesPlanificadosZonasRecorridos();
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/circuitosPorMunicipio")
	@GET
	public Response getCircuitosPorMunicipios(@QueryParam(value = "municipio") String municipio) {
		CustomLogger.log().info("Obteniendo circuitos para municipio " + municipio);

		try {
			JSONArray zonasIds = ServiceDFR.getCircuitosPorMunicipio(municipio);
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/circuitosPlanificadosPorMunicipio")
	@GET
	public Response getCircuitosPlanificadosPorMunicipios(@QueryParam(value = "municipio") String municipio) {
		CustomLogger.log().info("Obteniendo circuitos para municipio " + municipio);

		try {
			JSONArray zonasIds = ServiceDFR.getCircuitosPlanificadosPorMunicipio(municipio);
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/municipiosParaFiltroRutasRecorridoPlanificado")
	@GET
	public Response getMunicipiosParaCircuitosPlanificados() {
		CustomLogger.log().info("Obteniendo municipios para rutas recorrido planificados");

		try {
			JSONArray zonasIds = ServiceDFR.getMunicipiosParaFiltroRutasRecorridoPlanificado();
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	
	@Path("/municipiosParaFiltroRutasRecorrido")
	@GET
	public Response getMunicipiosParaCircuitos() {
		CustomLogger.log().info("Obteniendo municipios para rutas recorrido ");

		try {
			JSONArray zonasIds = ServiceDFR.getMunicipiosParaFiltroRutasRecorrido();
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/tiposResiduosParaFiltroMobiliarioDecaux")
	@GET
	public Response getTipoResiduoMobiliarioDecaux() {
		CustomLogger.log().info("Obteniendo tipos residuos para mobiliarios decaux ");

		try {
			JSONArray tiposResiduos = ServiceDFR.getTipoResiduoMobiliarioDecaux();
			return Response.status(200).entity(tiposResiduos.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/municipiosParaFiltroPosicionesRecorrido")
	@GET
	public Response getMunicipiosParaPosicionesRecorrido() {
		CustomLogger.log().info("Obteniendo municipios para posiciones recorrido ");

		try {
			JSONArray zonasIds = ServiceDFR.getMunicipiosParaFiltroPosicionesRecorrido();
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/posicionesRecorridoPorMunicipio")
	@GET
	public Response getCircuitosPuntosRecorridosPorMunicipios(@QueryParam(value = "municipio") String municipio) {
		CustomLogger.log().info("Obteniendo circuitos para municipio " + municipio);

		try {
			JSONArray zonasIds = ServiceDFR.getCircuitosPuntosRecorridosPorMunicipios(municipio);
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/municipiosParaFiltroPosicionesRecorridoHistorico")
	@GET
	public Response getMunicipiosParaPosicionesRecorridoHistorico() {
		CustomLogger.log().info("Obteniendo municipios para posiciones recorrido Historico ");

		try {
			JSONArray zonasIds = ServiceDFR.getMunicipiosParaPosicionesRecorridoHistorico();
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}

	@Path("/posicionesRecorridoHistoricoPorMunicipio")
	@GET
	public Response getCircuitosPuntosRecorridosHistoricoPorMunicipios(@QueryParam(value = "municipio") String municipio) {
		CustomLogger.log().info("Obteniendo circuitos Historico para municipio " + municipio);

		try {
			JSONArray zonasIds = ServiceDFR.getCircuitosPuntosRecorridosHistoricoPorMunicipios(municipio);
			return Response.status(200).entity(zonasIds.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	
	@Path("/circuitosPlanificados")
	@GET
	public Response getCircuitosPlanif() {
		CustomLogger.log().info("Obteniendo zonas planificadas ");

		try {
			JSONArray circuitos = ServiceDFR.getCircuitosPlanificados();
			return Response.status(200)
					.entity(circuitos.toString()).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(500).entity(e.getMessage()).build();
		}
	}
	

}
