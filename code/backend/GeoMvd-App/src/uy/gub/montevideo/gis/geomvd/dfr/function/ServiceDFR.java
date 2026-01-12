package uy.gub.montevideo.gis.geomvd.dfr.function;

import java.sql.Connection;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

public class ServiceDFR {

    private static String datasourcePg = "nucleoDS";
    private static String datasourceOracle = "brfDS";
    private static String datasourceSTM = "stmDS";

    public static JSONArray getTurnosZonasRecorridos(String turno) throws Exception {
        String sql = "select distinct NOMENCLATURA_CIRCUITO " +
                "from v_df_recorridos_contenedores " +
                "where nomenclatura_abreviada IS NOT NULL AND turno = '" + turno + "'";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static JSONArray getViajesPlanificadosZonasRecorridos() throws Exception {
        String sql = "select distinct NOMENCLATURA_CIRCUITO " +
                "from v_df_recorridos_contenedores " +
                "where nomenclatura_abreviada IS NOT NULL AND viajes_planificados = 'S'";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static JSONArray getCircuitosPorMunicipio(String municipio) throws Exception {
        String sql = "select distinct V.MUNICIPIO || SUBSTR(V.NOMENCLATURA_CIRCUITO,INSTR(V.NOMENCLATURA_CIRCUITO,'_',-1)) AS NOMENCLATURA_ABREVIADA, V.NOMENCLATURA_CIRCUITO " +
                "from DF_ZONA_RECORRIDO z, DF_RECORRIDOS v, DF_POSICIONES_RECORRIDO p " +
                "where z.COD_RECORRIDO IS NOT NULL AND z.COD_RECORRIDO = v.NOMENCLATURA_CIRCUITO AND z.COD_RECORRIDO = p.COD_RECORRIDO AND p.FECHA_HASTA IS NULL AND z.MUNICIPIO = '"
                + municipio + "' AND p.COD_MUNICIPIO = z.MUNICIPIO " +
                "order by NOMENCLATURA_ABREVIADA";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static JSONArray getCircuitosPlanificadosPorMunicipio(String municipio) throws Exception {
        String sql = "SELECT distinct B.MUNICIPIO || SUBSTR(B.NOMENCLATURA_CIRCUITO,INSTR(B.NOMENCLATURA_CIRCUITO,'_',-1)) AS NOMENCLATURA_ABREVIADA, B.NOMENCLATURA_CIRCUITO " +
                "FROM DF_ZONA_RECORRIDO_PLAN A " +
                "INNER JOIN DF_RECORRIDOS B " +
                "ON A.COD_RECORRIDO = NOMENCLATURA_CIRCUITO " +
                "INNER JOIN DF_POSICIONES_RECORRIDO_PL C " +
                "ON A.COD_RECORRIDO = C.COD_RECORRIDO " +
                "INNER JOIN DF_RUTAS_RECORRIDO_PLAN D " +
                "ON B.NOMENCLATURA_CIRCUITO = D.NOM_RUT " +
                "WHERE A.COD_RECORRIDO IS NOT NULL " +
                "AND B.MUNICIPIO = '" + municipio + "' " +
                "order by NOMENCLATURA_ABREVIADA";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static JSONArray getMunicipiosParaFiltroRutasRecorridoPlanificado() throws Exception{
        String sql = "select distinct REGEXP_SUBSTR(COD_RECORRIDO, '[^_]+', 1, 1) as MUNICIPIO from DF_ZONA_RECORRIDO_PLAN ORDER BY MUNICIPIO";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false); 
    }

    public static JSONArray getMunicipiosParaFiltroRutasRecorrido() throws Exception {
        String sql = "select distinct REGEXP_SUBSTR(COD_RECORRIDO, '[^_]+', 1, 1) as MUNICIPIO from DF_ZONA_RECORRIDO ORDER BY MUNICIPIO";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }
    
    public static JSONArray getTipoResiduoMobiliarioDecaux() throws Exception {
        String sql = "select cod_cont, nombre_cont from ep_tipos_cont_decaux";
        return DatahandlertDFR.selectAsJSONArray(datasourcePg, sql, false);
    }

    public static JSONArray getMunicipiosParaFiltroPosicionesRecorrido() throws Exception {
        String sql = "select distinct COD_MUNICIPIO as MUNICIPIO from DF_POSICIONES_RECORRIDO order by COD_MUNICIPIO";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static JSONArray getCircuitosPuntosRecorridosPorMunicipios(String municipio) throws Exception {
        String sql = "select distinct V.MUNICIPIO || SUBSTR(V.NOMENCLATURA_CIRCUITO,INSTR(V.NOMENCLATURA_CIRCUITO,'_',-1)) AS NOMENCLATURA_ABREVIADA, V.NOMENCLATURA_CIRCUITO  " +
                "from DF_POSICIONES_RECORRIDO p " +
                "INNER JOIN DF_RECORRIDOS v " +
                "ON p.COD_RECORRIDO = V.NOMENCLATURA_CIRCUITO " +
                "where p.FECHA_HASTA is null AND p.COD_MUNICIPIO = '" + municipio + "' " +
                "ORDER BY NOMENCLATURA_ABREVIADA";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }
    
    public static JSONArray getMunicipiosParaPosicionesRecorridoHistorico() throws Exception {
        String sql = "select distinct COD_MUNICIPIO as MUNICIPIO from v_df_hist_posiciones_recorrido order by COD_MUNICIPIO";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static JSONArray getCircuitosPuntosRecorridosHistoricoPorMunicipios(String municipio) throws Exception {
        String sql = "SELECT distinct B.MUNICIPIO || SUBSTR(B.NOMENCLATURA_CIRCUITO,INSTR(B.NOMENCLATURA_CIRCUITO,'_',-1)) AS NOMENCLATURA_ABREVIADA, B.NOMENCLATURA_CIRCUITO  " + 
        		"FROM DF_ZONA_RECORRIDO A " + 
        		"INNER JOIN DF_RECORRIDOS B " + 
        		"ON A.COD_RECORRIDO = b.NOMENCLATURA_CIRCUITO " + 
        		"inner JOIN v_df_hist_posiciones_recorrido C " + 
        		"ON A.MUNICIPIO = C.COD_MUNICIPIO and " + 
        		"b.NOMENCLATURA_CIRCUITO = C.COD_RECORRIDO " + 
        		"WHERE A.COD_RECORRIDO IS NOT NULL " + 
        		"AND C.COD_MUNICIPIO = '" + municipio + "' " + 
        		"order by NOMENCLATURA_ABREVIADA"; 
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }
    
    public static String cargarZonaRecorrido(String geometria, Usuario usuario) throws Exception {
		
		String query = "select COD_RECORRIDO " + 
				"from df_zona_recorrido a " + 
				"where fecha_hasta is null and SDO_CONTAINS(a.the_geom, SDO_GEOMETRY('"+geometria+"',32721)) = 'TRUE' " + 
				"FETCH FIRST 1 ROWS ONLY ";
		String retorno = Datahandler.selectOneValue(datasourceOracle, query, usuario);
		
		if(retorno.equalsIgnoreCase("")) {
			retorno = "0";
		}
		
		return retorno;
	}
    
    public static String cargarZonaRecorridoPL(String geometria, Usuario usuario) throws Exception {
		
		String query = "select COD_RECORRIDO " + 
				"from df_zona_recorrido a " + 
				"where fecha_hasta is null and SDO_CONTAINS(a.the_geom, SDO_GEOMETRY('"+geometria+"',32721)) = 'TRUE' " + 
				"FETCH FIRST 1 ROWS ONLY ";
		System.out.println(query);
		return Datahandler.selectOneValue(datasourceOracle, query, usuario);
	}
    
    public static String obtenerMunicipio(String geometria, Usuario usuario) throws Exception {
		
		String query = "select municipio " + 
				"from sig_municipios sm where " + 
				"_st_contains(sm.the_geom, (select ST_GeomFromText('"+geometria+"',32721)))";

		return Datahandler.selectOneValue(datasourcePg, query, usuario);
	}
    
    public static String obtenerCentroComunalZonal(String geometria, Usuario usuario) throws Exception {
		
		String query = "select zona_legal " + 
				"from sig_comunales sc where " + 
				"_st_contains(sc.the_geom, (select ST_GeomFromText('"+geometria+"',32721)))";

		return Datahandler.selectOneValue(datasourcePg, query, usuario);
	}
    
    public static String obtenerPadron(String geometria, Usuario usuario) throws Exception {
		
		String query = "select padron " + 
				"from mdg_parcelas pd where " + 
				"_st_contains(pd.the_geom, (select ST_GeomFromText('"+geometria+"',32721)))";

		return Datahandler.selectOneValue(datasourcePg, query, usuario);
	}

    public static String getMunicipio(String geometriaPunto, Usuario usuario) throws Exception {
        String query = "SELECT municipio " +
                "FROM sig_municipios " +
                "WHERE ST_Intersects(ST_GeometryFromText('" + geometriaPunto + "',32721) , the_geom )";
        return Datahandler.selectOneValue(datasourcePg, query, usuario);
    }
    
    public static JSONArray getXeY(String geom) throws Exception {
    	String sql = "select st_x(the_geom) as X, st_y(the_geom) as Y " + 
    			"from (select ST_GeomFromText('"+geom+"',32721) as the_geom) as a";
        return DatahandlertDFR.selectAsJSONArray(datasourcePg, sql, false);
    }

    public static String getZonaCircuitoCap(String geometriaPunto, Usuario usuario) throws Exception {
        String query = "SELECT CIRCUITO " +
                "FROM df_cap_circuitos c " +
                "WHERE SDO_CONTAINS(c.the_geom, SDO_GEOMETRY('" + geometriaPunto + "',32721)) = 'TRUE' ";
        return Datahandler.selectOneValue(datasourceOracle, query, usuario);
    }
    
    public static boolean chequeoPosicionesFueraZona(String codRecorrido, String geom, Usuario usuario) throws Exception {       
    	 String query = "select COUNT(*) AS CANTIDAD " + 
    			 		"from df_posiciones_recorrido A  " +
				    	"where A.COD_RECORRIDO = '"+codRecorrido+"' AND A.FECHA_HASTA IS NULL " + 
				    	"AND SDO_GEOM.SDO_INTERSECTION(a.the_geom, SDO_GEOMETRY('"+geom+"',32721), 0.005) is null";
                        System.out.println("query: " + query);
    	int cantidad = Integer.parseInt(Datahandler.selectOneValue(datasourceOracle, query, usuario));
		return cantidad > 0;       
    }
    
    public static boolean chequeoPosicionesRegionCAP(String geom, Usuario usuario) throws Exception {
        
    	String query = "SELECT  count(*) as cantidad " +
                "FROM df_regiones r " +
                "WHERE r.NRO_REGION=0 AND SDO_CONTAINS(r.the_geom, SDO_GEOMETRY('" + geom + "',32721)) = 'TRUE' ";
	   	int cantidad = Integer.parseInt(Datahandler.selectOneValue(datasourceOracle, query, usuario));
	
		return cantidad > 0;       
    }
    
    public static void desasociarPosicionesZonaBaja(String codigoRecorrido, Usuario usuario, Connection conn) throws Exception {
    
    	JSONArray featuresAModificar = getPosicionesRecorridosParaDesasociar(codigoRecorrido);
		for(int j = 0; j < featuresAModificar.length(); j++)
		{
			JSONObject objMod = (JSONObject) featuresAModificar.get(j);
		    		    
		    JsonObject objetoUpdate = new JsonObject();
			objetoUpdate.addProperty("pkvalor", objMod.get("GID").toString());
			objetoUpdate.addProperty("pknombre", "GID");
			objetoUpdate.addProperty("tabla", "df_posiciones_recorrido");
			objetoUpdate.addProperty("dbms", "ORACLE");
			objetoUpdate.addProperty("Origen_datos", datasourceOracle);
			
			JsonArray atributosPosiciones = new JsonArray();
			objetoUpdate.add("atributos", atributosPosiciones);
			
			JsonObject obj = new JsonObject();
			obj.addProperty("nombre_atributo", "COD_RECORRIDO");
			obj.addProperty("valor", "");
			objetoUpdate.getAsJsonArray("atributos").add(obj);
			
			obj = new JsonObject();
			obj.addProperty("nombre_atributo", "POSICION");
			obj.addProperty("valor", 0);
			objetoUpdate.getAsJsonArray("atributos").add(obj);
			
			obj = new JsonObject();
			obj.addProperty("nombre_atributo", "ULTIMA_POSICION");
			obj.addProperty("valor", 0);
			objetoUpdate.getAsJsonArray("atributos").add(obj);
						
		    Datahandler.update(conn, objetoUpdate, usuario);
		}	
    	
    }
    
    public static JSONArray getPosicionesRecorridosParaDesasociar(String codigoRecorrido) throws Exception {
		
    	String sql = "select GID, COD_RECORRIDO, POSICION, ULTIMA_POSICION from df_posiciones_recorrido where COD_RECORRIDO = '"+codigoRecorrido+"' AND fecha_hasta is null";
    	
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static boolean chequePosicionesFueraZonaPlanificado(String codRecorrido, String geom, Usuario usuario)
            throws Exception {      
        String query = "select count(*) as cantidad " +
                "from df_posiciones_recorrido_pl p  " +
                "where p.COD_RECORRIDO = '" + codRecorrido + "' " +
                "AND SDO_GEOM.SDO_INTERSECTION(p.the_geom, SDO_GEOMETRY('" + geom + "',32721), 0.005) is null";     
        int cantidad = Integer.parseInt(Datahandler.selectOneValue(datasourceOracle, query, usuario));       
        return cantidad > 0;
    }
    
    public static Integer getCantidadContenedores(String gid, Usuario usuario) throws Exception {
        
    	String query = "select count(*) as Cantidad from df_cap_contenedores where circuito = (select circuito from df_cap_circuitos where gid = "+gid+" and fecha_hasta is null) and fecha_hasta is null";
    	int cantidad = Integer.parseInt(Datahandler.selectOneValue(datasourceOracle, query, usuario));
		return cantidad;       
    }

    public static JSONArray getPosicionesRecorridosConPosicionMayor(Integer numeracion, String codRecorrido)
            throws Exception {
        String sql = "select GID, POSICION, ULTIMA_POSICION from df_posiciones_recorrido where posicion >" + numeracion
                + " AND FECHA_HASTA is null AND COD_RECORRIDO = '" + codRecorrido + "' order by POSICION";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }
    
    public static JSONArray getPosicionesRecorridosConPosicionMayorParaBaja(Integer numeracion, String codRecorrido, String gid)
            throws Exception {
        String sql = "select GID, POSICION, ULTIMA_POSICION from df_posiciones_recorrido where posicion >=" + numeracion
                + " AND FECHA_HASTA is null AND COD_RECORRIDO = '" + codRecorrido + "' and GID not in ("+gid+") order by POSICION";
        System.out.println("traigo " + sql);
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, sql, false);
    }

    public static void actualizarNumeracionPosicionRecorrido(String gid, int nuevoNumero, int esUltimo,
            Usuario usuario, Connection conn) throws Exception {

        JsonObject objetoUpdate = new JsonObject();
        objetoUpdate.addProperty("pkvalor", gid);
        objetoUpdate.addProperty("pknombre", "GID");
        objetoUpdate.addProperty("tabla", "df_posiciones_recorrido");
        objetoUpdate.addProperty("dbms", "ORACLE");
        objetoUpdate.addProperty("Origen_datos", datasourceOracle);

        JsonArray atributosPosiciones = new JsonArray();
        objetoUpdate.add("atributos", atributosPosiciones);

        JsonObject obj = new JsonObject();
        obj.addProperty("nombre_atributo", "POSICION");
        obj.addProperty("valor", nuevoNumero);
        objetoUpdate.getAsJsonArray("atributos").add(obj);

        obj = new JsonObject();
        obj.addProperty("nombre_atributo", "ULTIMA_POSICION");
        obj.addProperty("valor", esUltimo);
        objetoUpdate.getAsJsonArray("atributos").add(obj);

        Datahandler.update(conn, objetoUpdate, usuario);

    }

    public static JSONArray getCodRecorridoNumeroPosicionUltimaPosicionDePosicionRecorrido(String gid, Usuario usuario) throws Exception {
        String query = "select COD_RECORRIDO, POSICION, ULTIMA_POSICION from df_posiciones_recorrido where GID = '" + gid + "'";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, query, false);
        
    }

    public static JSONArray getPosicionMaxDeRecorrido(String codRecorrido, Usuario usuario) throws Exception{
        String query = "select gid, posicion, ultima_posicion from df_posiciones_recorrido where FECHA_HASTA is null AND COD_RECORRIDO = '"+codRecorrido+"' order by posicion desc FETCH FIRST 1 ROWS ONLY";
        return DatahandlertDFR.selectAsJSONArray(datasourceOracle, query, false);
    }

    public static void reenumerarUnoMenosDesdeHasta(String codRecorrido, int desde, int hasta, boolean marcarUltimo,
            Usuario usuario, Connection conn)
            throws Exception {
        JSONArray aReenumerar = getPosicionesRecorridosConPosicionMayor(desde, codRecorrido);
        int indice = 0;
        while (indice < aReenumerar.length() && aReenumerar.getJSONObject(indice).getInt("POSICION") <= hasta) {
            actualizarNumeracionPosicionRecorrido(aReenumerar.getJSONObject(indice).getString("GID"),
                    aReenumerar.getJSONObject(indice).getInt("POSICION") - 1,
                    marcarUltimo && (indice + 1 >= aReenumerar.length()
                            || aReenumerar.getJSONObject(indice + 1).getInt("POSICION") > hasta) ? 1 : 0,
                    usuario, conn);
            indice++;
        }
    }

    public static void reenumerarUnoMasDesdeHasta(String codRecorrido, int desde, int hasta, boolean marcarUltimo,
            Usuario usuario, Connection conn)
            throws Exception {
        JSONArray aReenumerar = getPosicionesRecorridosConPosicionMayor(desde - 1, codRecorrido);
        int indice = 0;
        while (indice < aReenumerar.length() && aReenumerar.getJSONObject(indice).getInt("POSICION") <= hasta) {
            actualizarNumeracionPosicionRecorrido(aReenumerar.getJSONObject(indice).getString("GID"),
                    aReenumerar.getJSONObject(indice).getInt("POSICION") + 1,
                    marcarUltimo && (indice + 1 >= aReenumerar.length()
                            || aReenumerar.getJSONObject(indice + 1).getInt("POSICION") > hasta) ? 1 : 0,
                    usuario, conn);
            indice++;
        }
    }

    public static String getCodigoRecorrido(String geometriaPunto, Usuario usuario) throws Exception {
        String query = "select COD_RECORRIDO " +
                "from df_zona_recorrido z " +
                "where z.fecha_hasta is null " +
                "and SDO_GEOM.SDO_INTERSECTION(z.the_geom, SDO_GEOMETRY('" + geometriaPunto
                + "',32721), 0.00005) is not null";
        return Datahandler.selectOneValue(datasourceOracle, query, usuario);
    }
    
    public static void reenumerarUnoMenosBaja(String codRecorrido, int desde, String gid, boolean esUltimo,
            Usuario usuario, Connection conn)
            throws Exception {
        JSONArray aReenumerar = getPosicionesRecorridosConPosicionMayorParaBaja(desde, codRecorrido, gid);       
        int indice = 0;
        int decremento = 1;
        if(esUltimo)
        {
        	decremento=0;
        }
        while (indice < aReenumerar.length()) {  
            actualizarNumeracionPosicionRecorrido(aReenumerar.getJSONObject(indice).getString("GID"),
                    aReenumerar.getJSONObject(indice).getInt("POSICION") - decremento,
                    (indice + 1 >= aReenumerar.length()) ? 1 : 0,
                    usuario, conn);
            indice++;
        }
    }
    
    public static boolean posicionesRecorridoTieneContenedoresAsociados(String gid, Usuario usuario) throws Exception {

		int cantidad = Integer.parseInt(Datahandler.selectOneValue(datasourceOracle,
				"select count(*) as cantidad from v_df_contenedores_geom where gid = " + gid, usuario));
		System.out.println("gid " + gid);
		System.out.println("cantidad " + cantidad);
		return cantidad > 0;
	}
    
    public static boolean posicionesRecorridoControlEstaFueraDeZona(String gid, String geom, Usuario usuario) throws Exception {

    	int cantidad = Integer.parseInt(Datahandler.selectOneValue(datasourceOracle,
				"select COUNT(*) AS CANTIDAD " + 
				"from df_zona_recorrido z, " + 
				"DF_POSICIONES_RECORRIDO p " + 
				"where  " + 
				"p.COD_RECORRIDO = Z.COD_RECORRIDO and " + 
				"P.GID="+ gid +" AND " + 
				"z.fecha_hasta is null  " + 
				"and SDO_GEOM.SDO_INTERSECTION(z.the_geom, SDO_GEOMETRY('"+geom+"',32721), 0.00005) is not null", 
				usuario));
		return cantidad == 0;
	}
    
    public static String getCodRecorridoPosicionesRecorrido(String gid, Usuario usuario) throws Exception {
        
    	String query = "select COD_RECORRIDO from df_posiciones_recorrido where GID = " + gid;
    	String codRecorrido = Datahandler.selectOneValue(datasourceOracle, query, usuario);
		return codRecorrido;       
    }
    
    /*public static Integer desasociarContenedor(String gid, String circuito) throws Exception {
		Context ctx;
		ContenedoresLocal dfr;

		ctx = new InitialContext();
		dfr = (ContenedoresLocal) ctx.lookup("limpiezaRecoleccionEAR/ContenedoresBean/local");

		return dfr.desasociarContenedor(gid, circuito);
	}*/
    
    public static JSONArray getCircuitosPlanificados() throws Exception {
        
    	String query = "select COD_RECORRIDO from df_zona_recorrido_plan where COD_RECORRIDO is not null order by COD_RECORRIDO";
    	return DatahandlertDFR.selectAsJSONArray(datasourceOracle, query, false);
    }

}
