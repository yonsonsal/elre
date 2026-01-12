package uy.gub.montevideo.gis.geomvd.core;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.naming.NamingException;

import org.json.JSONArray;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.json.JSONObject;
import uy.gub.montevideo.gis.geomvd.core.api.ReportFilter;
import uy.gub.montevideo.gis.geomvd.core.api.ResultSetConvert;
import uy.gub.montevideo.gis.geomvd.core.db.AuditoriaHelper;
import uy.gub.montevideo.gis.geomvd.core.db.DBHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.core.fields.ReflectionCalcs;
import uy.gub.montevideo.gis.geomvd.util.ConfigProperties;
import uy.gub.montevideo.gis.geomvd.util.ConfigPropertiesGeomvd;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;
import uy.gub.montevideo.gis.geomvd.util.StringUtils;

import static uy.gub.montevideo.gis.geomvd.core.db.DBHelper.closeConnection;
import static uy.gub.montevideo.gis.geomvd.core.db.DBHelper.geoColumnAsWKT;

public class  Datahandler {
	
	private static String listaCaracteresReplace = GetPropertyValues.getInstanceGeomvd().getValueGeomvd(ConfigPropertiesGeomvd.CARACTERES_REPLACE.getValue());
	private static String secuencia_usa_pk = GetPropertyValues.getInstanceGeomvd().getValueGeomvd(ConfigPropertiesGeomvd.SECUENCIA_USA_PK.getValue());
    /**
     * execute SQL
     *
     * @param SQL
     * @throws SQLException 
     * @throws NamingException 
     */
    public static String executeQuery(String datasource, String pk, String SQL, Usuario usuario) throws SQLException, NamingException {
    	Connection conn = null;
        try {
        	
        	conn = DBHelper.connect(datasource, usuario);
            //CustomLogger.log().info("Executing query: " + SQL);
            PreparedStatement pstmt;
            
            if (SQL.contains(pk)) {
            	pstmt = conn.prepareStatement(SQL,new String[]{pk}); 
            }
            else {
            	pstmt = conn.prepareStatement(SQL,Statement.RETURN_GENERATED_KEYS); 
            }
         
            Integer rowsafect = pstmt.executeUpdate();

            ResultSet rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
            	rowsafect =  (int) rs.getLong(1);
            }
            
            return rowsafect.toString();
        } catch (SQLException ex) {
			closeConnection(conn, usuario);
            throw(ex);
        } finally {
			closeConnection(conn, usuario);
        }
    }
    
    public static String executeQuery(Connection conn, String pk, String SQL, Usuario usuario) throws SQLException, NamingException {
        try {
        	
            //CustomLogger.log().info("Executing query: " + SQL);
            PreparedStatement pstmt;
            
            if (SQL.contains(pk)) {
            	pstmt = conn.prepareStatement(SQL,new String[]{pk}); 
            }
            else {
            	pstmt = conn.prepareStatement(SQL,Statement.RETURN_GENERATED_KEYS); 
            }
         
            Integer rowsafect = pstmt.executeUpdate();

            ResultSet rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
            	rowsafect =  (int) rs.getLong(1);
            }
            
            return rowsafect.toString();
        } catch (SQLException ex) {			
            throw(ex);
        } finally {
			
        }
    }
    
    public static String insert(Connection conn, JsonObject convertedObject, Usuario usuario) throws SQLException, NamingException {
    	String tabla = convertedObject.get("tabla").getAsString();
    	String dbms = convertedObject.get("dbms").getAsString();
    	String pknombre = convertedObject.get("pknombre").getAsString();
		String SQL = getInsertSQL(dbms, convertedObject,tabla, null, null, usuario);
		return executeQuery(conn, pknombre, SQL, usuario);
    }
    
    public static String insert(JsonObject convertedObject, Usuario usuario) throws SQLException, NamingException {
    	String tabla = convertedObject.get("tabla").getAsString();
    	String datasource = convertedObject.get("Origen_datos").getAsString();
    	String dbms = convertedObject.get("dbms").getAsString();
    	String pknombre = convertedObject.get("pknombre").getAsString();
		String SQL = getInsertSQL(dbms, convertedObject,tabla, null, null, usuario);
		return executeQuery(datasource, pknombre, SQL, usuario);
    }
    
    public static String delete(JsonObject convertedObject, Usuario usuario) throws SQLException, NamingException {
     	String pkvalor = convertedObject.get("pkvalor").getAsString();
		String pknombre = convertedObject.get("pknombre").getAsString();
		String tabla = convertedObject.get("tabla").getAsString();
		String datasource = convertedObject.get("Origen_datos").getAsString();
		String SQL = "DELETE FROM " + tabla + " WHERE " + pknombre + " = " + pkvalor;
				
		return  Datahandler.executeQuery(datasource, pknombre, SQL, usuario);
    }
    
    public static String delete(Connection conn, JsonObject convertedObject, Usuario usuario) throws SQLException, NamingException {
     	String pkvalor = convertedObject.get("pkvalor").getAsString();
		String pknombre = convertedObject.get("pknombre").getAsString();
		String tabla = convertedObject.get("tabla").getAsString();
		String SQL = "DELETE FROM " + tabla + " WHERE " + pknombre + " = " + pkvalor;
				
		return  Datahandler.executeQuery(conn, pknombre, SQL, usuario);
    }
    
    public static String update(JsonObject convertedObject, Usuario usuario) throws Exception {
    	String pkvalor = convertedObject.get("pkvalor").getAsString();
		String pknombre = convertedObject.get("pknombre").getAsString();
		String tabla = convertedObject.get("tabla").getAsString();
		String dbms = convertedObject.get("dbms").getAsString();
		String datasource = convertedObject.get("Origen_datos").getAsString();
		JsonArray atributos = convertedObject.getAsJsonArray("atributos");

		int cant = atributos.size();
		int i = 0;
		String SQL = "UPDATE " + tabla + " SET ";

		while (i < cant) {
			String colum = atributos.get(i).getAsJsonObject().get("nombre_atributo").getAsString();
			String valor = null;
			if (!AuditoriaHelper.isAuditoriaColumn(colum)) {
				if (atributos.get(i).getAsJsonObject().get("valor")!=null) {
					valor = atributos.get(i).getAsJsonObject().get("valor").getAsString();

					if (DBHelper.isGeometryColumn(colum)) {
						valor = DBHelper.convertToGeometry(dbms, valor);
						SQL += colum + " = " + valor + "";
					} else if (DBHelper.isDateTimeColumn(tabla, colum, valor)){
						valor = DBHelper.convertToTime(dbms, valor);
						SQL += colum + " = " + valor + "";
					} else if (DBHelper.isDateColumn(tabla, colum, valor)){
						valor = DBHelper.convertToDate(dbms, valor);
						SQL += colum + " = " + valor + "";
					} else {
						SQL += colum + " = '" + StringUtils.replaceCharInputQueryValues(valor, listaCaracteresReplace) + "'";
					}
				}else {
					SQL += colum + " = null";
				}
				SQL += ",";
			}

			i++;
		}
		SQL = AuditoriaHelper.completarColumnasAuditoriaUpdate(dbms,SQL, usuario);
		
		SQL = StringUtils.removeLastComma(SQL);
		SQL += " WHERE " + pknombre + " = " + pkvalor;
				
		return  Datahandler.executeQuery(datasource, pknombre, SQL, usuario);
    }
    
    public static String update(Connection conn, JsonObject convertedObject, Usuario usuario) throws Exception {
    	String pkvalor = convertedObject.get("pkvalor").getAsString();
		String pknombre = convertedObject.get("pknombre").getAsString();
		String tabla = convertedObject.get("tabla").getAsString();
		String dbms = convertedObject.get("dbms").getAsString();
		JsonArray atributos = convertedObject.getAsJsonArray("atributos");

		int cant = atributos.size();
		int i = 0;
		String SQL = "UPDATE " + tabla + " SET ";

		while (i < cant) {
			String colum = atributos.get(i).getAsJsonObject().get("nombre_atributo").getAsString();
			String valor = null;
			if (!AuditoriaHelper.isAuditoriaColumn(colum)) {
				if (atributos.get(i).getAsJsonObject().get("valor")!=null) {
					valor = atributos.get(i).getAsJsonObject().get("valor").getAsString();

					if (DBHelper.isGeometryColumn(colum)) {
						valor = DBHelper.convertToGeometry(dbms, valor);
						SQL += colum + " = " + valor + "";
					} else if (DBHelper.isDateTimeColumn(tabla, colum, valor)){
						valor = DBHelper.convertToTime(dbms, valor);
						SQL += colum + " = " + valor + "";
					} else if (DBHelper.isDateColumn(tabla, colum, valor)){
						valor = DBHelper.convertToDate(dbms, valor);
						SQL += colum + " = " + valor + "";
					} else {
						SQL += colum + " = '" + StringUtils.replaceCharInputQueryValues(valor, listaCaracteresReplace) + "'";
					}
				}else {
					SQL += colum + " = null";
				}
				SQL += ",";
			}

			i++;
		}
		SQL = AuditoriaHelper.completarColumnasAuditoriaUpdate(dbms,SQL, usuario);
		
		SQL = StringUtils.removeLastComma(SQL);
		SQL += " WHERE " + pknombre + " = " + pkvalor;
		System.out.println("UPDATE= " + SQL);
		return  Datahandler.executeQuery(conn, pknombre, SQL, usuario);
    }
    

    public static String updateCascade(JsonObject convertedObject, Usuario usuario) throws SQLException, NamingException {
    	String datasource = convertedObject.get("Origen_datos").getAsString();
    	Connection conn = DBHelper.connect(datasource, usuario);
    	String dbms = convertedObject.get("dbms").getAsString();
    	String SQL = "";
    	try {
    		conn.setAutoCommit(false);
	 
	    	String pkvalor = convertedObject.get("pkvalor").getAsString();
			String pknombre = convertedObject.get("pknombre").getAsString();
			String tabla = convertedObject.get("tabla").getAsString();
			JsonArray atributos = convertedObject.getAsJsonArray("atributos");
					
			int cant = atributos.size();
			int i = 0;
			
			//Update PAdre///////
			SQL = "UPDATE " + tabla + " SET ";

			while (i < cant) {
				String colum = atributos.get(i).getAsJsonObject().get("nombre_atributo").getAsString();
				String valor = null;
				if (!AuditoriaHelper.isAuditoriaColumn(colum)) {
					if (atributos.get(i).getAsJsonObject().get("valor")!=null) {
						valor =atributos.get(i).getAsJsonObject().get("valor").getAsString();

						if (DBHelper.isGeometryColumn(colum)) {
							valor = DBHelper.convertToGeometry(dbms, valor);
							SQL += colum + " = " + valor + "";
						} else if (DBHelper.isDateTimeColumn(tabla, colum, valor)){
							valor = DBHelper.convertToTime(dbms, valor);
							SQL += colum + " = " + valor + "";
						} else if (DBHelper.isDateColumn(tabla, colum, valor)){
							valor = DBHelper.convertToDate(dbms, valor);
							SQL += colum + " = " + valor + "";
						} else {
							SQL += colum + " = '" + StringUtils.replaceCharInputQueryValues(valor, listaCaracteresReplace) + "'";
						}

						// SQL += colum + " = '" + valor + "' ,";
					}else {
						SQL += colum + " = null";
						// SQL += colum + " = null ,";
					}
					SQL += ",";
				}
				
				i++;
			}
			// SebaG - Como siempre es un update, el cabezal no modifica los ucrea y fcrea. Los uact y fact siempre se pisan
			AuditoriaHelper.completarColumnasAuditoriaUpdate(dbms,SQL, usuario);
			
			SQL = SQL.substring(0, SQL.length()-1);
			SQL += " WHERE " + pknombre + " = " + pkvalor;
			//CustomLogger.log().debug("updateCascade:" + SQL);
			
			PreparedStatement pstmt = conn.prepareStatement(SQL); 
			pstmt.executeUpdate();
	        
			/////////////////////
			//Oper hijos///////
			/////////////////////
			JsonObject Child = convertedObject.getAsJsonObject("child");
			
			String fknombre = Child.get("fknombre").getAsString();
			String pknombrehijo = Child.get("pknombre").getAsString();
			String tablahijo = Child.get("tabla").getAsString();
			JsonArray hijos = Child.getAsJsonArray("hijos");
			
			
			int cantHijos = hijos.size();
			int j = 0;
			
			String SQLHijo[] = new String[cantHijos];
			PreparedStatement pstmthijos[] = new PreparedStatement[cantHijos];
			
			while (j < cantHijos) {
				JsonObject hijo = hijos.get(j).getAsJsonObject();
				String metodo = hijo.get("metodo").getAsString();
				if (metodo.equals("update")) {
					SQLHijo[j] = updateChild(dbms,hijo, tablahijo, pknombrehijo, fknombre, pkvalor, usuario);
				}
				else if (metodo.equals("insert")) {
					SQLHijo[j] = getInsertSQL(dbms, hijo, tablahijo, fknombre, pkvalor, usuario);
				}
				else if (metodo.equals("delete")){
					SQLHijo[j] = deleteChild(hijo, tablahijo, pknombrehijo, fknombre, pkvalor);
				}
				SQL = SQLHijo[j];
				pstmthijos[j] = conn.prepareStatement(SQL); 
				pstmthijos[j].executeUpdate();
				j++;
			}
			
			conn.commit();
			
			return "OK";
        } catch (SQLException e ) {
        	CustomLogger.log().error("Error ejecutando :" + SQL);
        	CustomLogger.log().error(e);
            if (conn != null) {
                try {
                    System.err.print("Transaction is being rolled back");
                    conn.rollback();
                } catch(SQLException excep) {
                	CustomLogger.log().error(excep);
                }                
            }
            return e.getMessage();

	    } finally {
	    	closeConnection(conn, usuario);
	    }
    }

    public static String updateCascade(JsonObject convertedObject, Usuario usuario, Connection conn) throws SQLException, NamingException {
    	String datasource = convertedObject.get("Origen_datos").getAsString();
    	String dbms = convertedObject.get("dbms").getAsString();
    	String SQL = "";
    	try {
	 
	    	String pkvalor = convertedObject.get("pkvalor").getAsString();
			String pknombre = convertedObject.get("pknombre").getAsString();
			String tabla = convertedObject.get("tabla").getAsString();
			JsonArray atributos = convertedObject.getAsJsonArray("atributos");
					
			int cant = atributos.size();
			int i = 0;
			
			//Update PAdre///////
			SQL = "UPDATE " + tabla + " SET ";

			while (i < cant) {
				String colum = atributos.get(i).getAsJsonObject().get("nombre_atributo").getAsString();
				String valor = null;
				if (!AuditoriaHelper.isAuditoriaColumn(colum)) {
					if (atributos.get(i).getAsJsonObject().get("valor")!=null) {
						valor =atributos.get(i).getAsJsonObject().get("valor").getAsString();

						if (DBHelper.isGeometryColumn(colum)) {
							valor = DBHelper.convertToGeometry(dbms, valor);
							SQL += colum + " = " + valor + "";
						} else if (DBHelper.isDateTimeColumn(tabla, colum, valor)){
							valor = DBHelper.convertToTime(dbms, valor);
							SQL += colum + " = " + valor + "";
						} else if (DBHelper.isDateColumn(tabla, colum, valor)){
							valor = DBHelper.convertToDate(dbms, valor);
							SQL += colum + " = " + valor + "";
						} else {
							SQL += colum + " = '" + StringUtils.replaceCharInputQueryValues(valor, listaCaracteresReplace) + "'";
						}

						// SQL += colum + " = '" + valor + "' ,";
					}else {
						SQL += colum + " = null";
						// SQL += colum + " = null ,";
					}
					SQL += ",";
				}
				
				i++;
			}
			// SebaG - Como siempre es un update, el cabezal no modifica los ucrea y fcrea. Los uact y fact siempre se pisan
			AuditoriaHelper.completarColumnasAuditoriaUpdate(dbms,SQL, usuario);
			
			SQL = SQL.substring(0, SQL.length()-1);
			SQL += " WHERE " + pknombre + " = " + pkvalor;
			//CustomLogger.log().debug("updateCascade:" + SQL);
			
			PreparedStatement pstmt = conn.prepareStatement(SQL); 
			pstmt.executeUpdate();
	        
			/////////////////////
			//Oper hijos///////
			/////////////////////
			JsonObject Child = convertedObject.getAsJsonObject("child");
			
			String fknombre = Child.get("fknombre").getAsString();
			String pknombrehijo = Child.get("pknombre").getAsString();
			String tablahijo = Child.get("tabla").getAsString();
			JsonArray hijos = Child.getAsJsonArray("hijos");
			
			
			int cantHijos = hijos.size();
			int j = 0;
			
			String SQLHijo[] = new String[cantHijos];
			PreparedStatement pstmthijos[] = new PreparedStatement[cantHijos];
			
			while (j < cantHijos) {
				JsonObject hijo = hijos.get(j).getAsJsonObject();
				String metodo = hijo.get("metodo").getAsString();
				if (metodo.equals("update")) {
					SQLHijo[j] = updateChild(dbms,hijo, tablahijo, pknombrehijo, fknombre, pkvalor, usuario);
				}
				else if (metodo.equals("insert")) {
					SQLHijo[j] = getInsertSQL(dbms, hijo, tablahijo, fknombre, pkvalor, usuario);
				}
				else if (metodo.equals("delete")){
					SQLHijo[j] = deleteChild(hijo, tablahijo, pknombrehijo, fknombre, pkvalor);
				}
				SQL = SQLHijo[j];
				pstmthijos[j] = conn.prepareStatement(SQL); 
				pstmthijos[j].executeUpdate();
				j++;
			}
			return "OK";
        } catch (SQLException e ) {
        	CustomLogger.log().error("Error ejecutando :" + SQL);
        	CustomLogger.log().error(e);
            if (conn != null) {
                try {
                    System.err.print("Transaction is being rolled back");
                    conn.rollback();
                } catch(SQLException excep) {
                	CustomLogger.log().error(excep);
                }
                throw e;
            }
            return e.getMessage();

	    } finally {
	    }
    }
    
    public static String updateChild(String dbms,JsonObject hijo,String tablahijo, String pknombrehijo, String fknombre, String pkvalor, Usuario usuario) {
    	
    	String pkvalorHijo = hijo.get("pkvalor").getAsString();
		JsonArray atributoshijo = hijo.getAsJsonArray("atributos");

		int cantAtributoshijo = atributoshijo.size();
		int k = 0;
		
		String SQL = "UPDATE " + tablahijo + " SET ";

		while (k < cantAtributoshijo) {
			String colum = atributoshijo.get(k).getAsJsonObject().get("nombre_atributo").getAsString();
			String valor = null;
			if (!AuditoriaHelper.isAuditoriaColumn(colum)) {
				if (atributoshijo.get(k).getAsJsonObject().get("valor")!=null) {
					valor = atributoshijo.get(k).getAsJsonObject().get("valor").getAsString();
					SQL += colum + " = '" + StringUtils.replaceCharInputQueryValues(valor, listaCaracteresReplace) + "' ,";
				}else {
					SQL += colum + " = null ,";
				}
			}
			k++;
		}
		
		// SebaG - Como siempre es un update, el cabezal no modifica los ucrea y fcrea. Los uact y fact siempre se pisan
		AuditoriaHelper.completarColumnasAuditoriaUpdate(dbms,SQL, usuario);
		
		SQL = StringUtils.removeLastComma(SQL);
		SQL += " WHERE " + pknombrehijo + " = " + pkvalorHijo + " AND " + fknombre + " = " + pkvalor;

		//CustomLogger.log().debug("updateChild:" + SQL);
		return SQL;
    	
    }
    

    public static String getInsertSQL(String dbms, JsonObject elemento, String tabla, String fknombre, String pkvalor, Usuario usuario) {

		JsonArray atributos = elemento.getAsJsonArray("atributos");
		
		String SQL = "INSERT INTO " + tabla;
		String columnaStr = "(";
		String valueStr = " VALUES (" ;
		
		ConfigParser data = ConfigParser.getInstance();
        
		Capa cap_aux = data.findCapaByTableName(tabla);

		// Arrancamos a armar las columnas y sus valores con la secuencia
		columnaStr = addsecuenciaColumn(columnaStr,cap_aux);
		valueStr = addsecuenciaValue(valueStr,cap_aux);
		
		columnaStr +=  (fknombre==null?"":fknombre + ",");
		valueStr += (pkvalor==null?"":pkvalor + ",");
		
		HashMap<String, String> columnas = new HashMap<String, String>();
		completarColumnas(atributos, columnas);
		AuditoriaHelper.completarColumnasAuditoriaInsert(columnas, usuario);
		
		for(String col : columnas.keySet()) {
			columnaStr += col+",";
			if (DBHelper.isGeometryColumn(col)) {
				valueStr += DBHelper.convertToGeometry(dbms, columnas.get(col))+ ",";
			} else if (DBHelper.isDateTimeColumn(tabla, col, columnas.get(col))){
				valueStr += DBHelper.convertToTime(dbms, columnas.get(col))+ ",";
			} else if (DBHelper.isDateColumn(tabla, col, columnas.get(col))){
				valueStr += DBHelper.convertToDate(dbms, columnas.get(col))+ ",";
			} else {
				//valueStr += "'"+columnas.get(col)+"',";
				valueStr += "'"+StringUtils.replaceCharInputQueryValues(columnas.get(col), listaCaracteresReplace)+"',";
			}
		}
		columnaStr = StringUtils.removeLastComma(columnaStr);
		valueStr = StringUtils.removeLastComma(valueStr);
		columnaStr += ")";
		valueStr += ")";
		SQL += columnaStr + valueStr ;
		
		//System.out.println(SQL);
		return SQL;   	
    }

	private static void completarColumnas(JsonArray atributos, HashMap<String, String> columnas) {
		int cant = atributos.size();
		int i = 0;
		while (i < cant) {
			if (atributos.get(i).getAsJsonObject().get("nombre_atributo")!=null) {
				String column = atributos.get(i).getAsJsonObject().get("nombre_atributo").getAsString();
				if (!AuditoriaHelper.isAuditoriaColumn(column) && atributos.get(i).getAsJsonObject().get("valor")!=null) {
					String valor = atributos.get(i).getAsJsonObject().get("valor").getAsString();	
					if (!valor.isEmpty()) {
						columnas.put(column, valor);
					}
				}
			}
			i++;
		}
	}
	
	private static String addsecuenciaColumn(String columnaStr, Capa cap_aux) {
		if (cap_aux.getNombreSecuencia() != null && cap_aux.getPk() != null) {
			if (cap_aux.getDbms().equals("ORACLE") || cap_aux.getDbms().equals("POSTGIS")) {			
				columnaStr +=  cap_aux.getPk() + ",";
			}
		}
		return columnaStr;
	}
	
	private static String addsecuenciaValue(String valueStr, Capa cap_aux) {
		if (cap_aux.getNombreSecuencia() != null && cap_aux.getPk() != null) {
			if(cap_aux.getNombreSecuencia().equalsIgnoreCase(secuencia_usa_pk))
			{
				valueStr += DBHelper.addSecuenciaPK(cap_aux.getDbms(), cap_aux.getNombreTabla(), cap_aux.getPk())+ ",";
			}
			else {
				valueStr += DBHelper.addSecuencia(cap_aux.getDbms(), cap_aux.getNombreSecuencia())+ ",";
			}
		}
		return valueStr;
	}

    public static String deleteChild(JsonObject hijo,String tablahijo, String pknombrehijo, String fknombre, String pkvalor) {
    	String pkvalorHijo = hijo.get("pkvalor").getAsString();
		String SQL = "DELETE FROM " + tablahijo + " WHERE " + pknombrehijo + " = " + pkvalorHijo + " AND " + fknombre + " = " + pkvalor;
		//CustomLogger.log().debug("deleteChild:" + SQL);
		//System.out.println(SQL);
		return SQL;
    }
    
    public static JSONArray select(JsonObject convertedObject, String columnasExportables, boolean includeCalcFields,
			Usuario usuario) throws SQLException, NamingException {
		String SQL;
		String tabla;
		String pkvalor;
		String pknombre;
		String datasource;
		
		tabla = convertedObject.get("tabla").getAsString();
		ConfigParser instancia = ConfigParser.getInstance();
		Capa cap_aux = instancia.findCapaByTableName(tabla);
		String pk = (cap_aux.getPk()==null?"":cap_aux.getPk());
		
		if (!columnasExportables.toLowerCase().contains(pk))
			columnasExportables = pk+"," + columnasExportables;
		
		if (convertedObject.get("pkvalor") == null) {
			tabla = convertedObject.get("tabla").getAsString();
			datasource = convertedObject.get("Origen_datos").getAsString();
			SQL = "select " + columnasExportables + " FROM " + tabla;
		} else {
			pkvalor = convertedObject.get("pkvalor").getAsString();
			pknombre = convertedObject.get("pknombre").getAsString();
			tabla = convertedObject.get("tabla").getAsString();
			datasource = convertedObject.get("Origen_datos").getAsString();
			SQL = "select * FROM " + tabla + " WHERE " + pknombre + " = " + pkvalor;
		}
		JSONArray rs = Datahandler.selectAsJSONArray(datasource, SQL, false, usuario);
		if (includeCalcFields) {
			Map<String, String> valoresCalculados = ConfigParser.getInstance().getCalcFields(tabla);
			for (int i = 0; i < rs.length(); i++) {
				ReflectionCalcs.injectCalcFields(rs.getJSONObject(i), valoresCalculados, usuario);
			}
		}
		return rs;
	}

	public static JSONArray selectAsJSONArray(String datasource, String sql, boolean includeNullValues, Usuario usuario) throws SQLException, NamingException {
		Connection conn = null;
		try {
			conn = DBHelper.connect(datasource, usuario);
			//CustomLogger.log().info("Ejecutando: " + sql);
			PreparedStatement pstmt = conn.prepareStatement(sql);
			return ResultSetConvert.toJSONArray(pstmt.executeQuery(), includeNullValues);
		} catch (SQLException ex) {
			System.out.println(ex.getMessage());
		} finally {
			closeConnection(conn, usuario);
		}
		return null;
	}

	public static String selectOneValue(String datasource, String sql, Usuario usuario) throws SQLException, NamingException {
		Connection conn = null;
		try {
			conn = DBHelper.connect(datasource, usuario);
			CustomLogger.log().info("Ejecutando: " + sql);
			PreparedStatement pstmt = conn.prepareStatement(sql);
			return ResultSetConvert.toSingleResult(pstmt.executeQuery());
		} catch (SQLException ex) {
			System.out.println(ex.getMessage());
		} finally {
			closeConnection(conn, usuario);
		}
		return null;
	}

	public static List<Map<String,String>> selectToMap(String datasource, String sql, boolean includeNullValues, Usuario usuario) throws SQLException, NamingException {
		Connection conn = null;
		try {
			conn = DBHelper.connect(datasource, usuario);
			//CustomLogger.log().info("Ejecutando: " + sql);
			PreparedStatement pstmt = conn.prepareStatement(sql);
			return ResultSetConvert.toResultMap(pstmt.executeQuery(), includeNullValues);
		} catch (SQLException ex) {
			System.out.println(ex.getMessage());
		} finally {
			closeConnection(conn, usuario);
		}
		return null;
	}


	public static JSONArray selectFilter(String dbms, String datasource, String tabla, ReportFilter filter, boolean includeGeom, boolean translateToLatLon, Usuario usuario) throws SQLException, NamingException {
		//EN ORACLE NO SE PUEDEN ARMAR LISTAS DE MAS DE 1000 PARAMETROS EN EL WHERE PK IN(1,2,3..,1001) PORQUE DA ERROR ORA-01795
		//ENTONCES ARMAMOS UNA LOGICA QUE GENERE PK IN(1,2,3..,999) OR PK IN (1000, 1001,...,1999)
		String[] filtros = filter.getIdsAsString().split(",");
		int cantidadFiltros = filtros.length;
		String where = "";
		String textoPkFiltro = "";
		
		ConfigParser instancia = ConfigParser.getInstance();
		Capa cap_aux = instancia.findCapaByTableName(tabla);
		String pk = (cap_aux.getPk()==null?"":cap_aux.getPk());
		
		//SI VIENEN MAS DE 1000 ENTRAMOS A LA LOGICA NUEVA
		if(cantidadFiltros>1000) {
			for(int i=1; i<=cantidadFiltros; i++) {
				textoPkFiltro += filtros[i-1] + ",";
				//CUANDO LLEGAMOS AL 1000 CORTAMOS, ARMAMOS EL IN Y LIMPIAMOS LA VARIABLE textoPkFiltro
				if(i%1000==0) {
					textoPkFiltro = StringUtils.removeLastComma(textoPkFiltro);
					if(where.equalsIgnoreCase(""))
					{
						where = " " + pk + " IN (" + textoPkFiltro + ")";
					}
					else {
						where += " or " + pk + " IN (" + textoPkFiltro + ")";
					}
					textoPkFiltro = "";
				}
			}
			textoPkFiltro = StringUtils.removeLastComma(textoPkFiltro);
			if(!textoPkFiltro.equalsIgnoreCase("")) {
				where += " or " + pk + " IN (" + textoPkFiltro + ")";
			}
		}//SI VIENEN HASTA 1000 HACE COMO ANTES
		else
		{
			where = " " + pk + " IN (" + filter.getIdsAsString() + ")";			
		}
		
		String columns = (filter.columns!=null&&filter.columns.length()>0)?filter.columns:"*";
		String geom = includeGeom? geoColumnAsWKT(dbms, translateToLatLon) : "";
		if (geom != "") {
			geom = geom + ",";
		}
		String SQL = "select " + pk + ", " +geom +columns+ " FROM " + tabla + " t WHERE " + where;
		return Datahandler.selectAsJSONArray(datasource, SQL, true, usuario);
	}

}
