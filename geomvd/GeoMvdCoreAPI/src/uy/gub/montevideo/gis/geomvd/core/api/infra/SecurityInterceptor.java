package uy.gub.montevideo.gis.geomvd.core.api.infra;


import org.jboss.resteasy.core.Headers;
import org.jboss.resteasy.core.ResourceMethodInvoker;
import org.jboss.resteasy.core.ServerResponse;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.EncriptionUtils;

import javax.annotation.security.DenyAll;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.List;

@Provider
public class SecurityInterceptor implements javax.ws.rs.container.ContainerRequestFilter
{
    private static final String AUTHORIZATION_PROPERTY = "Authorization";
    private static final String AUTHENTICATION_SCHEME = "Basic";
    private static final ServerResponse ACCESS_DENIED = new ServerResponse("Access denied for this resource", 401, new Headers<Object>());;
    private static final ServerResponse ACCESS_FORBIDDEN = new ServerResponse("Nobody can access this resource", 403, new Headers<Object>());;
    private static final ServerResponse SERVER_ERROR = new ServerResponse("INTERNAL SERVER ERROR", 500, new Headers<Object>());;

    @Override
    public void filter(ContainerRequestContext requestContext)
    {
        ResourceMethodInvoker methodInvoker = (ResourceMethodInvoker) requestContext.getProperty("org.jboss.resteasy.core.ResourceMethodInvoker");
        Method method = methodInvoker.getMethod();
        //Access allowed for all
        if( ! method.isAnnotationPresent(PermitAll.class))
        {
            //Access denied for all
            if(method.isAnnotationPresent(DenyAll.class))
            {
                requestContext.abortWith(ACCESS_FORBIDDEN);
                return;
            }
            if (method.isAnnotationPresent(PermitLocal.class)){
                // Solo acepto pedidos desde localhost
                if (!requestContext.getUriInfo().getBaseUri().getHost().toLowerCase().equals("localhost")){
                    requestContext.abortWith(ACCESS_FORBIDDEN);
                    return;
                }
                return; //Para los que son PermitLocal no chequeo usuario
            }
            //Get request headers
            final MultivaluedMap<String, String> headers = requestContext.getHeaders();

            //Fetch authorization header
            final List<String> authorization = headers.get(AUTHORIZATION_PROPERTY);

            //If no authorization information present; block access
            if(authorization == null || authorization.isEmpty())
            {
                requestContext.abortWith(ACCESS_DENIED);
                return;
            }

            //Get encoded username and password
            final String encodedUserInfo = authorization.get(0).replaceFirst(AUTHENTICATION_SCHEME + " ", "");

            //Decode username and password
            String username = null;
            try {
                username = EncriptionUtils.getDecodedToken(encodedUserInfo);
            } catch (IOException e) {
                requestContext.abortWith(SERVER_ERROR);
                return;
            }
            //Is user session valid?
            if( ! isSessionAllowed(username, null))
            {
                requestContext.abortWith(ACCESS_DENIED);
                return;
            }

            //Verify user access
            if(method.isAnnotationPresent(RolesAllowed.class))
            {
                //requestContext.setProperty("username", username);
                //CustomLogger.log().info("Intercepted user request " + username);
                // No valido los roles por ahora, solo tengo rol de usuario
                //RolesAllowed rolesAnnotation = method.getAnnotation(RolesAllowed.class);
                //Set<String> rolesSet = new HashSet<String>(Arrays.asList(rolesAnnotation.value()));
            }
        }
    }

    private boolean isSessionAllowed(final String userMail, final String session)
    {
        boolean isAllowed = true;
        // Por ahora si esta autenticado, entonces se permite todo
        return isAllowed;
    }
}

