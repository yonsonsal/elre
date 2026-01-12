package uy.gub.imm.dfr.business.ejb;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import uy.gub.imm.dfr.business.ejb.interfaces.DFRBeanLocal;
import uy.gub.imm.dfr.dto.DataFecha;
import uy.gub.imm.dfr.dto.DataPosicionRecorrido;

/**
 * Session Bean implementation class DFRBean
 */
@Stateless
public class DFRBean implements DFRBeanLocal {

	@PersistenceContext(unitName="brfDS")
	EntityManager emOra;
	
	
	public String obtenerUltimaFechaEjecutadaExportacion(){
		int ok = 0;		
		HashMap<String,List<DataPosicionRecorrido>> res = new HashMap<String,List<DataPosicionRecorrido>>();		
    	
		String sql = "select VALOR from df_param_sdfr where PARAMETRO = 'ULTIMO_REPORTE_CIRCUITOS_MODIF'";
		Query q = emOra.createNativeQuery(sql);  
		String dataFecha = (String)q.getSingleResult();
				
		return dataFecha;	
	}
	
	
	public HashMap<String,List<DataPosicionRecorrido>> exportarUltimosContenedoresModificados(String fecha){
		
		int ok = 0;		
		HashMap<String,List<DataPosicionRecorrido>> res = new HashMap<String,List<DataPosicionRecorrido>>();		
    			
		String sql = "select distinct(cod_recorrido)" +
				" from df_posiciones_recorrido where fact > to_date('"+fecha+"', 'dd/mm/yyyy hh24:mi:ss')";
		
		Query q = emOra.createNativeQuery(sql);  
		List<String> dataCircuito = q.getResultList();
		    					
		for(String circuito:dataCircuito){
			
			List<DataPosicionRecorrido> lista = new ArrayList<DataPosicionRecorrido>();
	    				
			sql = "select posicion, sdo_cs.transform(the_geom, 4326).sdo_point.x, sdo_cs.transform(the_geom, 4326).sdo_point.y " +
					"from df_posiciones_recorrido " +
					"where cod_recorrido = '"+ circuito +"' and fecha_hasta is null and posicion > 0 " +
					"order by posicion";
								    			  				
			q = emOra.createNativeQuery(sql);
			List<Object[]> dataContenedor = q.getResultList();
			
			for(Object[] tuplaContenedor:dataContenedor){
				
				DataPosicionRecorrido dpr = new DataPosicionRecorrido();
		    	dpr.setCircuitoAbreviado(circuito.substring(0, circuito.indexOf("_"))+circuito.substring(circuito.indexOf("CL_")+2));
		    	dpr.setPosicion(((BigDecimal)tuplaContenedor[0]).intValue());
		    	dpr.setLatitud(((BigDecimal)tuplaContenedor[2]).doubleValue());
		    	dpr.setLongitud(((BigDecimal)tuplaContenedor[1]).doubleValue());
		    	dpr.setError(false);
		    	
		    	lista.add(dpr);										    
		    }
			res.put(circuito, lista);			
	    }
		
		return res;		
	}
	
	public HashMap<String,List<DataPosicionRecorrido>> exportarTodosContenedoresModificados(){
		
		int ok = 0;		
		HashMap<String,List<DataPosicionRecorrido>> res = new HashMap<String,List<DataPosicionRecorrido>>();		
    			
		String sql = "select distinct(cod_recorrido)" +
				" from df_posiciones_recorrido ";
		
		Query q = emOra.createNativeQuery(sql);  
		List<String> dataCircuito = q.getResultList();
		    					
		for(String circuito:dataCircuito){
			
			List<DataPosicionRecorrido> lista = new ArrayList<DataPosicionRecorrido>();
	    				
			sql = "select posicion, sdo_cs.transform(the_geom, 4326).sdo_point.x, sdo_cs.transform(the_geom, 4326).sdo_point.y " +
					"from df_posiciones_recorrido " +
					"where cod_recorrido = '"+ circuito +"' and fecha_hasta is null and posicion > 0 " +
					"order by posicion";
								    			  				
			q = emOra.createNativeQuery(sql);
			List<Object[]> dataContenedor = q.getResultList();
			
			for(Object[] tuplaContenedor:dataContenedor){
				
				DataPosicionRecorrido dpr = new DataPosicionRecorrido();
		    	dpr.setCircuitoAbreviado(circuito.substring(0, circuito.indexOf("_"))+circuito.substring(circuito.indexOf("CL_")+2));
		    	dpr.setPosicion(((BigDecimal)tuplaContenedor[0]).intValue());
		    	dpr.setLatitud(((BigDecimal)tuplaContenedor[2]).doubleValue());
		    	dpr.setLongitud(((BigDecimal)tuplaContenedor[1]).doubleValue());
		    	dpr.setError(false);
		    	
		    	lista.add(dpr);										    
		    }
			res.put(circuito, lista);			
	    }
		
		return res;	
	}
	
	public void setearUltimaFechaEjecucionExportacion(){
		
		String sql = "select to_char(sysdate, 'dd/mm/yyyy hh24:mi:ss') from dual";
		Query q = emOra.createNativeQuery(sql);  
		String dataFecha = (String)q.getSingleResult();
		
		sql = "update df_param_sdfr set VALOR = '" + dataFecha + "' where PARAMETRO = 'ULTIMO_REPORTE_CIRCUITOS_MODIF'";		
		q = emOra.createNativeQuery(sql); 
		q.executeUpdate();
		
	}
	
	
	public Integer pasarPlanificadosAVigente(HashMap<String,String> circuitosPlanAVig, String circuitosVigentesAHist, String usuario){
		
		Integer res = 0;
		
		Set<String> circuitosAVigente = circuitosPlanAVig.keySet();
		Iterator it = circuitosAVigente.iterator();
		Date fechaMinima = Calendar.getInstance().getTime();
		SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");	
		while (it.hasNext()) {
			String circuito = (String)it.next();
			String fecha = circuitosPlanAVig.get(circuito);
			
			Date fechaActual = Calendar.getInstance().getTime();;
			try {
				fechaActual = sdf.parse(fecha);
			} catch (ParseException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			if (fechaActual.before(fechaMinima))
				fechaMinima = fechaActual;
		}
		
		Calendar cal = Calendar.getInstance();
		cal.setTime(fechaMinima);
		
		cal.add(Calendar.DATE, -1);
		String fechaHastaMenosUno = sdf.format(cal.getTime());
		
		try {
			String[] circuitosVigentesAHistorico = circuitosVigentesAHist.split(",");
					
			//Primero paso a histórico las zonas, posiciones y rutas de 'circuitosVigentesAHistorico'		
			
			String sql = "",circuito;
			//ZONAS
			for (int i=0; i<circuitosVigentesAHistorico.length; i++) {  
				circuito = circuitosVigentesAHistorico[i].split("_")[0]+"_DU_RM_CL_"+circuitosVigentesAHistorico[i].split("_")[1];
				
				sql = "update df_zona_recorrido set fecha_hasta = to_date('"+fechaHastaMenosUno+"', 'dd/mm/yyyy') where cod_recorrido = '"+circuito+"'";
				Query q = emOra.createNativeQuery(sql);
				q = emOra.createNativeQuery(sql); 
				q.executeUpdate();
	        }
			
			//POSICIONES
			for (int i=0; i<circuitosVigentesAHistorico.length; i++) {        	
				circuito = circuitosVigentesAHistorico[i].split("_")[0]+"_DU_RM_CL_"+circuitosVigentesAHistorico[i].split("_")[1];
				
				sql = "update df_posiciones_recorrido set fecha_hasta = to_date('"+fechaHastaMenosUno+"', 'dd/mm/yyyy'), posicion = 0 where cod_recorrido = '"+circuito+"'";
				Query q = emOra.createNativeQuery(sql);
				q = emOra.createNativeQuery(sql); 
				q.executeUpdate();
	        }
			
			//RUTAS
			for (int i=0; i<circuitosVigentesAHistorico.length; i++) {
				circuito = circuitosVigentesAHistorico[i].split("_")[0]+"_DU_RM_CL_"+circuitosVigentesAHistorico[i].split("_")[1];
				
				sql = "update df_rutas_recorrido set fecha_hasta = to_date('"+fechaHastaMenosUno+"', 'dd/mm/yyyy') where nom_rut = '"+circuito+"'";
				Query q = emOra.createNativeQuery(sql);
				q = emOra.createNativeQuery(sql); 
				q.executeUpdate();
	        }
			
			
			//Ahora paso a vigente las zonas, posiciones y rutas de 'circuitosPlanAVigente'
			//Tengo que ir a buscar los datos en las tablas de planificacion y borrarlas de ahí
			
			String fecha;
			Query q;
			circuitosAVigente = circuitosPlanAVig.keySet();
			it = circuitosAVigente.iterator();
			while (it.hasNext()) {
				circuito = (String)it.next();
				fecha = circuitosPlanAVig.get(circuito);
				
				circuito = circuito.split("_")[0]+"_DU_RM_CL_"+circuito.split("_")[1];
				
				//ZONAS
				sql = "insert into df_zona_recorrido " +
						"(gid, cod_recorrido, fecha_desde, ucrea, fcrea, uact, fact, the_geom, estado, municipio) " +
						"select s_dfzore.nextval, cod_recorrido, to_date('"+fecha+"', 'dd/mm/yyyy'), '"+usuario+"', sysdate, '"+usuario+"', sysdate, the_geom, 2,'"+circuito.split("_")[0]+ "' " +
						"from df_zona_recorrido_plan where cod_recorrido = '"+circuito+"'";
						
				q = emOra.createNativeQuery(sql);
				q.executeUpdate();
						
				sql = "delete from df_zona_recorrido_plan where cod_recorrido = '"+circuito+"'";
				q = emOra.createNativeQuery(sql);
				q.executeUpdate();
				
				
				//POSICIONES				
				sql = "insert into df_posiciones_recorrido " +
						"(gid, region, cod_recorrido, fecha_desde, ucrea, fcrea, uact, fact, the_geom, posicion, ultima_posicion, cod_municipio) " +
						"select s_dfpore.nextval, region, cod_recorrido, to_date('"+fecha+"', 'dd/mm/yyyy'), '"+usuario+"', sysdate, '"+usuario+"', sysdate, the_geom, posicion, 0,'"+circuito.split("_")[0]+ "' " +
						"from df_posiciones_recorrido_pl where cod_recorrido = '"+circuito+"'";
				
				q = emOra.createNativeQuery(sql); 
				q.executeUpdate();
				
				//Seteo la ultima posicion
				sql = "update df_posiciones_recorrido set ultima_posicion = 1 where cod_recorrido = '"+circuito+"' and posicion = (select max(posicion) from df_posiciones_recorrido_pl where cod_recorrido = '"+circuito+"')";
				q = emOra.createNativeQuery(sql); 
				q.executeUpdate();
				
				sql = "delete from df_posiciones_recorrido_pl where cod_recorrido = '"+circuito+"'";
				q = emOra.createNativeQuery(sql);
				q.executeUpdate();
				
				
				//RUTAS						
				sql = "insert into df_rutas_recorrido " +
						"(gid, nom_rut, fecha_desde, ucrea, fcrea, uact, fact, the_geom) " +
						"select s_dfrure.nextval, nom_rut, to_date('"+fecha+"', 'dd/mm/yyyy'), '"+usuario+"', sysdate, '"+usuario+"', sysdate, the_geom " +
						"from df_rutas_recorrido_plan where nom_rut = '"+circuito+"'";
					
				q = emOra.createNativeQuery(sql); 
				q.executeUpdate();
			
				sql = "delete from df_rutas_recorrido_plan where nom_rut = '"+circuito+"'";
				q = emOra.createNativeQuery(sql);
				q.executeUpdate();
			}
			
		} catch(Exception e){
			e.printStackTrace();
			res = 1;
		}
		return res;
	}	
	
}
