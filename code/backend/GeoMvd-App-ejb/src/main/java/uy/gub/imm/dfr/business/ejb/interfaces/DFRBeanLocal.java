package uy.gub.imm.dfr.business.ejb.interfaces;

import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.ejb.Local;

import uy.gub.imm.dfr.dto.DataFecha;
import uy.gub.imm.dfr.dto.DataPosicionRecorrido;

@Local
public interface DFRBeanLocal {

	public String obtenerUltimaFechaEjecutadaExportacion();
	public HashMap<String,List<DataPosicionRecorrido>> exportarUltimosContenedoresModificados(String fecha);
	public HashMap<String,List<DataPosicionRecorrido>> exportarTodosContenedoresModificados();
	public void setearUltimaFechaEjecucionExportacion();
	
	public Integer pasarPlanificadosAVigente(HashMap<String,String> circuitosPlanAVigente, String circuitosVigentesAHistorico, String usuario);
		
}
