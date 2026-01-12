package uy.gub.montevideo.gis.geomvd.beans;


import java.io.Serializable;
import java.util.List;

import javax.enterprise.context.SessionScoped;
import javax.faces.context.FacesContext;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;

import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.EncriptionUtils;
import uy.gub.montevideo.gis.geomvd.util.RolesUtils;

@Named(value = "sessionBean")
@SessionScoped
public class SessionBean implements Serializable {

    private String username;
    private String token;
    private String timeout;


    public String LoginSSO() throws Exception {
        FacesContext context = FacesContext.getCurrentInstance();
        this.username = context.getExternalContext().getUserPrincipal()!=null ? context.getExternalContext().getUserPrincipal().getName():null;
        if (context.getExternalContext().getUserPrincipal() instanceof KeycloakPrincipal) {
            KeycloakPrincipal<KeycloakSecurityContext> kp = (KeycloakPrincipal<KeycloakSecurityContext>) context.getExternalContext().getUserPrincipal();
            this.username = kp.getKeycloakSecurityContext().getToken().getPreferredUsername();
            this.token = kp.getKeycloakSecurityContext().getToken().getAccessTokenHash();
        } else {
            this.token = EncriptionUtils.getEncodedToken(username);
        }

        //CustomLogger.log().info("Usuario logueado Frontend:"+this.username + "|" + this.token);
        
        List<String> roles = RolesUtils.getUserRoles(this.username);
        if (this.username!=null ) {
            // get Http Session and store username
            HttpSession session = Util.getSession();
            this.timeout = String.valueOf(session.getMaxInactiveInterval()/60);
            session.setAttribute("username", username);
            session.setAttribute("token", token);
            session.setAttribute("timeout", timeout);
            //System.out.println("TIMEOUT SESSION: " + session.getMaxInactiveInterval());
            return token;
        } else {
            HttpServletRequest requestServlet = (HttpServletRequest) context.getExternalContext().getRequest();
            HttpServletResponse responseServlet = (HttpServletResponse) context.getExternalContext().getResponse();
            responseServlet.sendRedirect(requestServlet.getContextPath() + "/logout.xhtml");
            return null;
        }
    }

    public void logout() {
        FacesContext context = FacesContext.getCurrentInstance();
        //CustomLogger.log().info("Logout:"+this.username);
        context.getExternalContext().invalidateSession();
    }

    public String getToken() throws Exception {
        HttpSession session = Util.getSession();
        if (session!=null && session.getAttribute("token")!=null)
            return session.getAttribute("token").toString();
        else
            return LoginSSO();
    };

    public String getUsername() throws Exception {
        return this.username;
    };
    
    public String getTimeOut() throws Exception {
        return this.timeout;
    };
}
