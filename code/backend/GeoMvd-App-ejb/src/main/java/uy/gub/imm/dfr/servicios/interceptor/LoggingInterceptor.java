package uy.gub.imm.dfr.servicios.interceptor;


import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.Provider;

import org.jboss.resteasy.core.interception.PostMatchContainerRequestContext;

/**
 * Log de acceso a los servicios REST
 * 
 * @author im4389976
 *
 */

@Provider
public class LoggingInterceptor implements ContainerRequestFilter {
	
	Logger logger = Logger.getLogger(LoggingInterceptor.class.getName());
	 
    @Context
    HttpServletRequest servletRequest;
  
	@Override
	public void filter(ContainerRequestContext requestContext) throws IOException {
		
		PostMatchContainerRequestContext pmContext = (PostMatchContainerRequestContext) requestContext;
		
		@SuppressWarnings("unused")
		String methodName = pmContext.getResourceMethod().getMethod().getName();
		
		String uricompleta = servletRequest.getRequestURI();
	
        if (servletRequest.getQueryString()!=null)
        	uricompleta = uricompleta +"?" + servletRequest.getQueryString();
        
      
	}
}