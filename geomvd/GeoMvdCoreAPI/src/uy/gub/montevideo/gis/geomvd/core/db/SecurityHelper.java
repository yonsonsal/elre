package uy.gub.montevideo.gis.geomvd.core.db;

import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.RolesUtils;

import javax.naming.NamingException;
import javax.servlet.http.HttpServletRequest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class SecurityHelper {

    // Security DS
    public static final String SECURITY_DATASOURCE = "brhDS";

    public static boolean isUserInRole(Usuario usuario, String roleName) throws SQLException {
        Connection conn = null;
        boolean result = false;
        try {
            conn = DBHelper.connect(SECURITY_DATASOURCE, usuario);
            String sql = "select rol from V_ROLES_JAAS where usuario='" + usuario.getUsername()+"' and rol='"+roleName+"'";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            result = pstmt.executeQuery().next();
        } catch (SQLException | NamingException ex) {
            System.out.println(ex.getMessage());
        } finally {
            DBHelper.closeConnection(conn, usuario);
        }
        return result;

    }

    /**
     * ESTO SOLO SE USA PARA APLICACIONES CLIENTE COMO QGIS QUE SOLO CONSUMEN SERVICIOS
     * @param username
     * @param req
     * @return Usuario
     */
    public static Usuario getCurrentUser(String username, HttpServletRequest req) {
        //String username = req.getUserPrincipal().getName().toUpperCase();
        String auditoriaId = AuditoriaHelper.getCurrentUserAuditoriaId(req.getSession());
        Usuario user = new Usuario(username, null, auditoriaId);
        user.setRoles(RolesUtils.getUserRolesAsString(username));
        return user;
    }
    
    public static Usuario getCurrentUser(HttpServletRequest req) {
        String username = req.getUserPrincipal().getName().toUpperCase();
        String auditoriaId = AuditoriaHelper.getCurrentUserAuditoriaId(req.getSession());
        Usuario user = new Usuario(username, null, auditoriaId);
        user.setRoles(RolesUtils.getUserRolesAsString(username));
        return user;
    }

    public static List<String> getUserRoles(String username) throws SQLException {
        Connection conn = null;
        List<String> roles = new ArrayList<String>();
        try {
            conn = DBHelper.connect(SECURITY_DATASOURCE, null);
            String sql = "select rol from V_ROLES_JAAS where usuario='" + username+"'";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            ResultSet rs = pstmt.executeQuery();
            while(rs.next()) {
                roles.add(rs.getString("rol"));
            }
            //CustomLogger.log().info("Obtenidos "+ roles.size() +" roles del usuario " + username  );
        } catch (SQLException | NamingException ex) {
            CustomLogger.log().error("Error cargando roles del usuario " + username);
            CustomLogger.log().error(ex);
            ex.printStackTrace();
        } finally {
            DBHelper.closeConnection(conn, null);
        }
        return roles;
    }
}
