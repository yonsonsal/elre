package uy.gub.imm.dfr.servicios.exception;


import java.util.logging.Logger;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import uy.gub.imm.dfr.servicios.DTO.Resultado;


@Provider
public class RestExceptionMapper implements ExceptionMapper<Throwable> {
	
	Logger logger = Logger.getLogger(RestExceptionMapper.class.getName());

	@Override
	public Response toResponse(Throwable exception) {
       logger.severe("Servicio REST TYT: " + exception.getMessage());
		
		return Response.status(500).entity( new Resultado(500, "Se ha producido un error, por favor intente mas tarde." )).type(MediaType.APPLICATION_JSON_TYPE).build();
	}

}
