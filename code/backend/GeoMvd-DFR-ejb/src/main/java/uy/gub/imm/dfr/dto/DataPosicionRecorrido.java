package uy.gub.imm.dfr.dto;

import java.io.Serializable;

public class DataPosicionRecorrido implements Serializable {

	private static final long serialVersionUID = 5478895698420007008L;
	
	private Boolean error;	
	private String msgError;
		
	private String circuitoAbreviado;
	private Integer posicion;
	private Double latitud;
	private Double longitud;
	
	
	public Boolean isError() {
		return error;
	}
	
	public void setError(Boolean error) {
		this.error = error;
	}
	
	public String getMsgError() {
		return msgError;
	}
	
	public void setMsgError(String msgError) {
		this.msgError = msgError;
	}
			
	public String getCircuitoAbreviado() {
		return circuitoAbreviado;
	}
	
	public void setCircuitoAbreviado(String circuitoAbreviado) {
		this.circuitoAbreviado = circuitoAbreviado;
	}
	
	public Integer getPosicion() {
		return posicion;
	}
	
	public void setPosicion(Integer posicion) {
		this.posicion = posicion;
	}
	
	public Double getLatitud() {
		return latitud;
	}
	
	public void setLatitud(Double latitud) {
		this.latitud = latitud;
	}
	
	public Double getLongitud() {
		return longitud;
	}
	
	public void setLongitud(Double longitud) {
		this.longitud = longitud;
	}
		
	
}
