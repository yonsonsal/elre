package uy.gub.montevideo.gis.geomvd.core.db;

import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;

import javax.naming.Context;
import javax.servlet.http.HttpSession;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Random;

public class AuditoriaHelper {

    private static final String SQL_AUDITORIA_DATOS = "{ call p_aw_contexto(?, ?, ?) }";
    private static final String ESTANDAR_PACKAGES = "uy.gub.imm.";
    private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static String getCurrentUserAuditoriaId(HttpSession session){
        if (session.getAttribute("idAuditoria")!=null)
            return session.getAttribute("idAuditoria").toString();
        else {
            String idAuditoria = idAuditoriaRandom();
            session.setAttribute("idAuditoria", idAuditoria);
            return idAuditoria;
        }
    }
    public static void beforeCloseConnection(Connection connection) throws SQLException {
        CallableStatement proc = connection.prepareCall(SQL_AUDITORIA_DATOS);

        try {
            proc.setString(1, null);
            proc.setString(2, null);
            proc.setString(3, null);
            proc.execute();
        } catch (Exception e) {
            CustomLogger.log().error("------ AUDITO DATOS ------ ERROR beforeCloseConnection ");
            CustomLogger.log().error(e);
        }
    }

    public static void afterOpenConnection(Connection connection, Usuario usuario) throws SQLException {
        String nombreAp = "No estandar";
        try {
            CallableStatement proc = connection.prepareCall(SQL_AUDITORIA_DATOS);
            proc.setString(1, usuario.getUsername());
            proc.setString(2, usuario.getIdAuditoria());
            proc.setString(3, nombreAp);
            proc.execute();
            CustomLogger.log().info("--------------------> AUDIT completado: "+usuario.getUsername());
        } catch (Exception e) {
            CustomLogger.log().error("------ AUDITO DATOS ------ ERROR afterOpenConnection");
            CustomLogger.log().error("usuario: " + usuario.getUsername());
            CustomLogger.log().error("idAuditoria: " + usuario.getIdAuditoria());
            CustomLogger.log().error("aplicacin: " + nombreAp);
            CustomLogger.log().error(e);
        }
    }

    public static void completarColumnasAuditoriaInsert(HashMap<String, String> columnas, Usuario usuario) {
        String factual = sdf.format(new Date(new java.util.Date().getTime()));
        columnas.put("fcrea", factual);
        columnas.put("fact", factual);
        columnas.put("ucrea", usuario.getUsername());
        columnas.put("uact", usuario.getUsername());
        columnas.put("idauditoria", usuario.getIdAuditoria());
    }
    
    public static String completarColumnasAuditoriaUpdate(String dbms, String query, Usuario usuario) {
        /*String factual = sdf.format(new Date(new java.util.Date().getTime()));
        if (dbms.equals("ORACLE"))
        	query += " fact = TO_DATE('"+factual+"', 'YYYY-MM-DD HH24:MI:SS') ,";
        else
        	query += " fact = '"+ factual +"' ,";
        
        query += " uact = '"+ usuario.getUsername() +"' ,";
        query += " idauditoria = '"+ usuario.getIdAuditoria() +"' ,";*/
        return query;
    }

    public static boolean isAuditoriaColumn(String colum) {
        return colum.equals("fcrea") || colum.equals("fact") || colum.equals("ucrea") || colum.equals("uact")|| colum.equals("idauditoria");
    }

    private static String idAuditoriaRandom(){
        //formato similar a JSESSIONID
        Random r = new Random();
        StringBuffer sb = new StringBuffer();
        while(sb.length() < 30){
            sb.append(Integer.toHexString(r.nextInt()));
        }
        return sb.toString().substring(0, 30).toUpperCase();
    }
}
