package uy.gub.montevideo.gis.geomvd.core.api;

import java.sql.SQLException;

import javax.naming.NamingException;

import org.json.JSONArray;

import uy.gub.montevideo.gis.geomvd.core.AtributoCapa;
import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;

public class ReportesCore {

	public static JSONArray selectFilter(String dbms, String ds, String tabla, ReportFilter filter, boolean includeGeom, boolean translateToLatLon, Usuario usuario) throws SQLException, NamingException {
		return Datahandler.selectFilter(dbms, ds, tabla, filter, includeGeom, translateToLatLon, usuario);
	}

	public static String obtenerColumnasExportables(String tabla, String format) {
		ConfigParser data = ConfigParser.getInstance();
		//CustomLogger.log().info("Exportando tabla: " + tabla);
		Capa capa = data.findCapaByTableName(tabla);
		// Buscar la tabla y los atributos que voy a exportar
		String result = "";
		for (AtributoCapa a : capa.getAtributos().values()) {
			if (a.getNombre_bd()!=null && (a.getNoExporTo()==null || !a.getNoExporTo().contains(format)))
				result+=a.getNombre_bd()+",";
			if (a.getNombre().contentEquals("the_geom") && capa.getDbms().contentEquals("POSTGIS"))
				result+="Box2D(ST_Envelope(the_geom)) as box,";
			else if (a.getNombre().contentEquals("the_geom") && capa.getDbms().contentEquals("ORACLE"))
				result+="replace('BOX(' || SDO_GEOM.SDO_MIN_MBR_ORDINATE(the_geom,1) || ' '\n" + 
						"|| SDO_GEOM.SDO_MIN_MBR_ORDINATE(the_geom,2) || ' '\n" + 
						"|| SDO_GEOM.SDO_MAX_MBR_ORDINATE(the_geom,1) || ' '\n" + 
						"|| SDO_GEOM.SDO_MAX_MBR_ORDINATE(the_geom,2) || ')',',','.') BOX,";
		}
		return result.endsWith(",")?result.substring(0, result.length()-1):result;
	}

}
