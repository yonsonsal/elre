package uy.gub.imm.dfr.servicios.exception;


import java.util.logging.Logger;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

import org.jboss.resteasy.spi.BadRequestException;

import uy.gub.imm.dfr.servicios.DTO.Resultado;



public class BadRequestExceptionMapper implements ExceptionMapper<BadRequestException>{

	Logger logger = Logger.getLogger(BadRequestExceptionMapper.class.getName());
	
	@Override
	public Response toResponse(BadRequestException exception) {
     
		logger.severe("Servicio REST TYT: " + exception.getMessage());
		
		return Response.status(500).entity( new Resultado(500, "No se pueden extraer los parametros del request HTTP" )).type(MediaType.APPLICATION_JSON_TYPE).build();
	}

}