package uy.gub.montevideo.gis.geomvd.dfr.function;

import static uy.ciemsa.geomvd.core.db.DBHelper.closeConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.json.JSONArray;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.api.ResultSetConvert;
import uy.gub.montevideo.gis.geomvd.core.db.DBHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;
import uy.gub.montevideo.gis.geomvd.util.StringUtils;

public class  DatahandlertDFR {
	
	/**
     * Connect to the PostgreSQL database
     *
     * @return a Connection object
	 * @throws NamingException 
     */
    public static Connection connect(String datasource) throws SQLException, NamingException {
    	String dsjndiName = GetPropertyValues.getInstance().getValue(datasource);
    	//CustomLogger.log().debug("Cargando jndi datasource (" + datasource + "): " + dsjndiName);
    	Context ctx = new InitialContext(); 
    	DataSource ds=(DataSource)ctx.lookup(dsjndiName);  
    	Connection con = ds.getConnection(); 
    	return con;
    }
    
   

	public static JSONArray selectAsJSONArray(String datasource, String sql, boolean includeNullValues) throws SQLException, NamingException {
		Connection conn = null;
		try {
			conn = connect(datasource);
			CustomLogger.log().info("Ejecutando: " + sql);
			PreparedStatement pstmt = conn.prepareStatement(sql);
			return ResultSetConvert.toJSONArray(pstmt.executeQuery(), includeNullValues);
		} catch (SQLException ex) {
			System.out.println(ex.getMessage());
		} finally {
			if (conn!=null && !conn.isClosed())
				conn.close();
		}
		return null;
	}

	public static String selectOneValue(String datasource, String sql) throws SQLException, NamingException {
		Connection conn = null;
		try {
			conn = connect(datasource);
			//CustomLogger.log().info("Ejecutando: " + sql);
			PreparedStatement pstmt = conn.prepareStatement(sql);
			return ResultSetConvert.toSingleResult(pstmt.executeQuery());
		} catch (SQLException ex) {
			System.out.println(ex.getMessage());
		} finally {
			if (conn!=null && !conn.isClosed())
				conn.close();
		}
		return null;
	}
	
		
	public static String updateCascade(JsonObject convertedObject, Usuario usuario) throws NamingException {
		// crear conexin
		String datasource = convertedObject.get("Origen_datos").getAsString();
    	Connection conn = null;
		try {
			conn = DBHelper.connect(datasource, usuario);
	    	conn.setAutoCommit(false);
	    	   	
	    	// update gral
	    	Datahandler.updateCascade(convertedObject, usuario, conn);
			
			// comitear 
			conn.commit();
			
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			//cerrar 
			try {
				if(conn != null) {
					DBHelper.closeConnection(conn, usuario);
				}
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		return "OK";
	}
	
	public static String modificaZonasRecorrido(JsonObject convertedObject, Usuario usuario) throws Exception {
		String respuesta = "";
		String datasource = convertedObject.get("Origen_datos").getAsString();
		Connection conn = null;
		try {
			conn = DBHelper.connect(datasource, usuario);
	    	conn.setAutoCommit(false);
			respuesta = modificaZonasRecorridoInterno(conn, convertedObject, usuario);
			
		} catch (Exception e) {
			conn.rollback();
			closeConnection(conn, usuario);
			e.printStackTrace();
			return "ERROR";
		}
		finally {
			if(StringUtils.isNumeric(respuesta))
			{
				conn.commit();
			}
			else {
				conn.rollback();
			}
			closeConnection(conn, usuario);
	    }
		System.out.println("respuesta " + respuesta);
		return respuesta;
	}
	
	private static String modificaZonasRecorridoInterno(Connection conn, JsonObject convertedObject, Usuario usuario) throws Exception {
		String respuesta = "";
		try {
			
			int gid = Integer.parseInt(convertedObject.get("pkvalor").getAsString());
			String codRecorrido = "";
			String fechaHasta = null;
			JsonArray atributos = convertedObject.getAsJsonArray("atributos");
			int cantAtributos = atributos.size();
			int k = 0;			
			
			while (k < cantAtributos) {
				String colum = atributos.get(k).getAsJsonObject().get("nombre_atributo").getAsString();
				if(colum.equalsIgnoreCase("cod_recorrido")) {
					codRecorrido = atributos.get(k).getAsJsonObject().get("valor").getAsString();
				}
				if(colum.equalsIgnoreCase("FECHA_HASTA")) {
					fechaHasta = (atributos.get(k).getAsJsonObject().get("valor")!=null? atributos.get(k).getAsJsonObject().get("valor").getAsString():null);
				}
				k++;
			}
			
			if(fechaHasta!=null) {
						
				ServiceDFR.desasociarPosicionesZonaBaja(codRecorrido, usuario, conn);
				
			}
			
			int res = 1;
			if (res == 1) {
				respuesta = Datahandler.update(conn, convertedObject, usuario);
			} else {
				respuesta = "Fallo la modificacion de 'Zonas Recorrido' en Oracle";
			}
			
			
		} catch (Exception e) {
			e.printStackTrace();
			return "ERROR";
		}
		finally {
	    }
		System.out.println("respuesta " + respuesta);
		return respuesta;
	}

	public static String modificacionPosicionRecorrido(JsonObject convertedObject, Usuario usuario) throws Exception {	
		String respuesta = "OK";
		String datasource = convertedObject.get("Origen_datos").getAsString();		
		Connection conn = null;
		try {
			conn = DBHelper.connect(datasource, usuario);
			conn.setAutoCommit(false);
			respuesta = modificacionPosicionRecorridoInterno(conn, convertedObject, usuario);		
		} catch (Exception e) {
			conn.rollback();
			closeConnection(conn, usuario);
			e.printStackTrace();
			return "ERROR";
		} finally {
			if (StringUtils.isNumeric(respuesta)) {
				conn.commit();
			} else {
				conn.rollback();
			}
			closeConnection(conn, usuario);
		}
		return respuesta;
	}

	private static String modificacionPosicionRecorridoInterno(Connection conn, JsonObject convertedObject,
			Usuario usuario) throws Exception {
		String respuesta = "1";
		try {
			int gid = Integer.parseInt(convertedObject.get("pkvalor").getAsString());
			String codRecorrido = "";
			JsonArray atributos = convertedObject.getAsJsonArray("atributos");
			int cantAtributos = atributos.size();
			int k = 0;
			int nuevaPosicion = -1;
			String geom = "";
			while (k < cantAtributos) {
				String colum = atributos.get(k).getAsJsonObject().get("nombre_atributo").getAsString();
				if (colum.equalsIgnoreCase("cod_recorrido")) {
					codRecorrido = atributos.get(k).getAsJsonObject().get("valor").getAsString();
				}
				if (colum.equalsIgnoreCase("posicion")) {
					nuevaPosicion = atributos.get(k).getAsJsonObject().get("valor").getAsInt();
				}
				if (colum.equalsIgnoreCase("the_geom")) {
					geom = atributos.get(k).getAsJsonObject().get("valor").getAsString();
				}
				k++;
			}

			JSONArray actual = ServiceDFR
					.getCodRecorridoNumeroPosicionUltimaPosicionDePosicionRecorrido(String.valueOf(gid), usuario);
			int posicionActual = actual.getJSONObject(0).getInt("POSICION");
			String codRecorridoActual = actual.getJSONObject(0).getString("COD_RECORRIDO");
			int esUltimaPosicion = actual.getJSONObject(0).getInt("ULTIMA_POSICION");
			if (nuevaPosicion != -1 && !codRecorrido.equals("0")) {
				JSONArray maxPosicion = ServiceDFR.getPosicionMaxDeRecorrido(codRecorrido, usuario);
				if (nuevaPosicion >= maxPosicion.getJSONObject(0).getInt("POSICION")) {
					JsonObject ultimaPosicion = new JsonObject();
					ultimaPosicion.addProperty("nombre_atributo", "ULTIMA_POSICION");
					ultimaPosicion.addProperty("valor", 1);
					convertedObject.getAsJsonArray("atributos").add(ultimaPosicion);
					for (JsonElement object : convertedObject.getAsJsonArray("atributos")) {
						if (object.getAsJsonObject().get("nombre_atributo").getAsString().equals("posicion")) {
							object.getAsJsonObject().remove("valor");
							object.getAsJsonObject().addProperty("valor",
									maxPosicion.getJSONObject(0).getInt("POSICION"));
						}
					}
				}
				if (esUltimaPosicion == 1 && nuevaPosicion < maxPosicion.getJSONObject(0).getInt("POSICION")) {
					JsonObject ultimaPosicion = new JsonObject();
					ultimaPosicion.addProperty("nombre_atributo", "ULTIMA_POSICION");
					ultimaPosicion.addProperty("valor", 0);
					convertedObject.getAsJsonArray("atributos").add(ultimaPosicion);
				}
				if (codRecorrido.equals(codRecorridoActual)) {
					if (nuevaPosicion > posicionActual)
						ServiceDFR.reenumerarUnoMenosDesdeHasta(codRecorrido, posicionActual, nuevaPosicion, false,
								usuario,
								conn);
					else {
						if (esUltimaPosicion == 1)
							ServiceDFR.reenumerarUnoMasDesdeHasta(codRecorrido, nuevaPosicion, posicionActual - 1,
									true,
									usuario, conn);
						else
							ServiceDFR.reenumerarUnoMasDesdeHasta(codRecorrido, nuevaPosicion, posicionActual, false,
									usuario, conn);
					}
				} else if (codRecorridoActual.equals("0")) {
					maxPosicion = ServiceDFR.getPosicionMaxDeRecorrido(codRecorrido, usuario);
					ServiceDFR.reenumerarUnoMasDesdeHasta(codRecorrido, posicionActual,
							maxPosicion.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
				} else {
					maxPosicion = ServiceDFR.getPosicionMaxDeRecorrido(codRecorrido, usuario);
					JSONArray maxPosicionNuevo = ServiceDFR.getPosicionMaxDeRecorrido(codRecorridoActual, usuario);
					if (!codRecorrido.equals(codRecorridoActual) && !codRecorridoActual.equals("0")) {
						ServiceDFR.reenumerarUnoMenosDesdeHasta(codRecorridoActual, posicionActual,
								maxPosicion.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
						ServiceDFR.reenumerarUnoMasDesdeHasta(codRecorrido, posicionActual,
								maxPosicionNuevo.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
					}
				}
			} else {
				if (codRecorrido != "") {
					if (codRecorrido.equals("0")) {
						JSONArray maxPosicion = ServiceDFR.getPosicionMaxDeRecorrido(codRecorridoActual, usuario);
						ServiceDFR.reenumerarUnoMenosDesdeHasta(codRecorridoActual, posicionActual,
								maxPosicion.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
					} else {
						String nuevoCodRecorrido = ServiceDFR.getCodigoRecorrido(geom, usuario);
						JSONArray maxPosicion = ServiceDFR.getPosicionMaxDeRecorrido(codRecorridoActual, usuario);
						JSONArray maxPosicionNuevo = ServiceDFR.getPosicionMaxDeRecorrido(nuevoCodRecorrido, usuario);
						if (!codRecorridoActual.equals(nuevoCodRecorrido) && !codRecorridoActual.equals("0")) {
							ServiceDFR.reenumerarUnoMasDesdeHasta(nuevoCodRecorrido, posicionActual,
									maxPosicion.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
							ServiceDFR.reenumerarUnoMenosDesdeHasta(codRecorridoActual, posicionActual,
									maxPosicionNuevo.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
						} else if (codRecorridoActual.equals("0")) {
							if (posicionActual >= maxPosicionNuevo.getJSONObject(0).getInt("POSICION")) {
								ServiceDFR.reenumerarUnoMasDesdeHasta(nuevoCodRecorrido, posicionActual,
										maxPosicionNuevo.getJSONObject(0).getInt("POSICION"), true, usuario, conn);
							} else {
								ServiceDFR.reenumerarUnoMasDesdeHasta(nuevoCodRecorrido, posicionActual,
										maxPosicionNuevo.getJSONObject(0).getInt("POSICION"), false, usuario, conn);
							}
						}
						JsonObject obj = new JsonObject();
						obj.addProperty("nombre_atributo", "COD_RECORRIDO");
						obj.addProperty("valor", nuevoCodRecorrido);
						convertedObject.getAsJsonArray("atributos").add(obj);
					}
				}
			}
			Datahandler.update(conn, convertedObject, usuario);
		} catch (Exception e) {
			e.printStackTrace();
			return "ERROR";
		} finally {

		}
		return respuesta;
	}
	
	public static String bajaPosicionesRecorrido(JsonObject convertedObject, Usuario usuario) throws Exception {
		String respuesta = "";
		Connection conn = null;
		
		try {
			String datasource = convertedObject.get("Origen_datos").getAsString();
			conn = DBHelper.connect(datasource, usuario);
			
			boolean hayFalla = false;
			
			String gid = convertedObject.get("pkvalor").getAsString();
			
			JSONArray actual = ServiceDFR.getCodRecorridoNumeroPosicionUltimaPosicionDePosicionRecorrido(
					String.valueOf(gid),
					usuario);
			int posicionActual = actual.getJSONObject(0).getInt("POSICION");
			String codRecorridoActual = actual.getJSONObject(0).getString("COD_RECORRIDO");
			int esUltimaPosicion = actual.getJSONObject(0).getInt("ULTIMA_POSICION");
			
			boolean hayContenedorFisico = ServiceDFR.posicionesRecorridoTieneContenedoresAsociados(gid, usuario);
			
			//SI TIENE CONTENEDORES ASOCIADOS
			if(hayContenedorFisico) {
				if(/*ServiceDFR.desasociarContenedor(gid, codRecorridoActual)*/1!=1) {
					hayFalla = true;
					respuesta = "Fallo desasociar 'Contenedor' en Oracle";
				}				
			}
			
			if(!hayFalla) {				
				
				if (esUltimaPosicion == 1) {
					ServiceDFR.reenumerarUnoMenosBaja(codRecorridoActual, posicionActual-1, gid, true,
							usuario, conn);
				}
				else {
					ServiceDFR.reenumerarUnoMenosBaja(codRecorridoActual, posicionActual, gid, false,
							usuario, conn);
				}
				
				respuesta = Datahandler.delete(conn, convertedObject, usuario);
			}
		} catch (Exception e) {
			closeConnection(conn, usuario);
			e.printStackTrace();
			return "ERROR";
		}
		finally {
			closeConnection(conn, usuario);
	    }
		System.out.println("respuesta " + respuesta);
		return respuesta;
	}
	
}
