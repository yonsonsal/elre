package uy.gub.montevideo.gis.geomvd.core.db;

import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import uy.gub.montevideo.gis.geomvd.core.db.AuditoriaHelper;

public class DBHelper {
    public static int SRID = 32721;

    /**
     * Connect to the PostgreSQL database
     *
     * @return a Connection object
     * @throws NamingException
     */
    public static Connection connect(String datasource, Usuario usuario) throws SQLException, NamingException {
        String dsjndiName = GetPropertyValues.getInstance().getValue(datasource);
        //CustomLogger.log().info("Cargando jndi datasource (" + datasource + "): " + dsjndiName);
        Context ctx = new InitialContext();
        DataSource ds=(DataSource)ctx.lookup(dsjndiName);
        Connection con = ds.getConnection();
        // No se auditan las conexiones al DS brhDS de usuario y roles
        if (!SecurityHelper.SECURITY_DATASOURCE.equals(datasource))
            AuditoriaHelper.afterOpenConnection(con, usuario);
        return con;
    }

    public static void closeConnection(Connection conn, Usuario usuario) throws SQLException {
        if (conn!=null && !conn.isClosed()) {
            AuditoriaHelper.beforeCloseConnection(conn);
            conn.setAutoCommit(true);
            conn.close();
        }
    }

    public static String convertToGeometry(String dbms, String geomtext) {
        if (dbms.equals("POSTGIS"))
            return "ST_GeomFromText('"+geomtext+"',"+ SRID +")";
        else if (dbms.equals("ORACLE"))
            return "SDO_GEOMETRY('"+geomtext+"',"+ SRID +")";
        return "";
    }

    public static String convertToDate(String dbms, String dateText) {
        if (dbms.equals("ORACLE")) {
        	dateText  = dateText.replace("Z","");
            return "TO_DATE('"+dateText+"', 'YYYY-MM-DD')";
        }
        else
            return "'"+dateText+"'";
    }

    public static String convertToTime(String dbms, String dateText) {
        if (dbms.equals("ORACLE"))
            return "TO_DATE('"+dateText+"', 'YYYY-MM-DD HH24:MI:SS')";
        else
            return "'"+dateText+"'";
    }

    public static boolean isGeometryColumn(String columnName) {
        return columnName.toLowerCase().equals("the_geom");
    }

    public static boolean isDateColumn(String tabla, String attName, String dateText) {
        ConfigParser config = ConfigParser.getInstance();
        String attType = config.findAttributeType(tabla, attName);
        if (attType != null && attType.equals("java.util.Date")) {
            SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
            try{
                sdf1.parse(dateText);
                return true;
            } catch (ParseException e1) {
            }
        }
        return false;
    }

    public static boolean isDateTimeColumn(String tabla, String attName, String dateText) {
        ConfigParser config = ConfigParser.getInstance();
        String attType = config.findAttributeType(tabla, attName);
        if (attType != null && attType.equals("java.util.Date")) {
            SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            try {
                sdf2.parse(dateText);
                return true;
            } catch (ParseException e2) {}
        }
        return false;
    }

    public static String geoColumnAsWKT(String dbms, boolean translateToLatLon) {
        if (dbms.equals("POSTGIS"))
            return translateToLatLon?"ST_ASTEXT(ST_Transform(the_geom, 4326)) as the_geom" :"ST_ASTEXT(the_geom) as the_geom";
        else if (dbms.equals("ORACLE"))
            return translateToLatLon?"SDO_CS.TRANSFORM(t.the_geom,4326).Get_WKT() as the_geom":"t.the_geom.Get_WKT() as the_geom";
        return "";
    }

    /**
     * Igual que geoColumnAsWKT(dbms, translateToLatLon) pero con un SRID de destino arbitrario en
     * vez de un booleano fijo a 4326 (ver plan de soporte multi-CRS, Fase 5). Se agrega como
     * sobrecarga nueva en vez de modificar la firma existente para no romper compilación de
     * código legacy (DFRPublicLayerService, en el módulo GeoMvd-App, dormido) que sigue llamando
     * a la version original.
     */
    public static String geoColumnAsWKT(String dbms, String targetSrid) {
        if (dbms.equals("POSTGIS"))
            return "ST_ASTEXT(ST_Transform(the_geom, " + targetSrid + ")) as the_geom";
        else if (dbms.equals("ORACLE"))
            return "SDO_CS.TRANSFORM(t.the_geom," + targetSrid + ").Get_WKT() as the_geom";
        return "";
    }

    /**
     * Simétrico de entrada de geoColumnAsWKT/convertToGeometry: arma el fragmento SQL para
     * parsear un WKT con un SRID explícito (en vez del campo estático SRID=32721). Mismo patrón
     * que convertToGeometry(dbms, geomtext), parametrizado.
     */
    public static String parseWKTWithSrid(String dbms, String wkt, String srid) {
        if (dbms.equals("POSTGIS"))
            return "ST_GeomFromText('" + wkt + "'," + srid + ")";
        else if (dbms.equals("ORACLE"))
            return "SDO_GEOMETRY('" + wkt + "'," + srid + ")";
        return "";
    }

    public static String geoColumnAsWKTBothSRS(String dbms) {
        if (dbms.equals("POSTGIS"))
            return "ST_AsText(the_geom) AS wkt_geom, ST_AsText(ST_Transform(the_geom, 4326)) AS wkt_transformed_geom";
        else if (dbms.equals("ORACLE"))
            return "SDO_UTIL.TO_WKTGEOMETRY(THE_GEOM) AS wkt_geom, SDO_CS.TRANSFORM(the_geom,4326).Get_WKT() AS wkt_transformed_geom";
        return "";
    }

    public static String addSecuencia(String datasource, String nombreSec) {
        if (datasource.equals("ORACLE"))
            return nombreSec + ".nextval";
        else
            return "nextval('" + nombreSec + "')";
    }
    
    public static String addSecuenciaPK(String datasource, String tabla, String pk) {
        if (datasource.equals("ORACLE"))
            return " (select  "+pk+" + 1 from "+tabla+" ORDER BY "+pk+" DESC  fetch  first 1 rows only) ";
        else
            return " (select "+pk+" + 1 from "+tabla+" order by "+pk+" DESC LIMIT 1) ";
    }
}
