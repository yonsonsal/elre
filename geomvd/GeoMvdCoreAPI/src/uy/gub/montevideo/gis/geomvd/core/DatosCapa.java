package uy.gub.montevideo.gis.geomvd.core;

import com.google.gson.annotations.SerializedName;

public class DatosCapa {
	
	@SerializedName("capa_publicada_nombre_mostrar")
	private String nombreMotrar;
	private String workspace;
	private String layer;
	private String tipo; //WMS o WFS
	private String tilesOrigin; 
	private String source;
	private String tipoOrigen;
	private String URL;
	private String formatToService;
	
	
	public String getNombreMostrar() {
		return nombreMotrar;
	}
	public void setNombreMostrar(String nombre) {
		this.nombreMotrar = nombre;
	}
	public String getWorkspace() {
		return workspace;
	}
	public void setWorkspace(String workspace) {
		this.workspace = workspace;
	}

	public String getLayer() {
		return layer;
	}
	public void setLayer(String layer) {
		this.layer = layer;
	}
	public String getTipo() {
		return tipo;
	}
	public void setTipo(String tipo) {
		this.tipo = tipo;
	}
	public String getTilesOrigin() {
		return tilesOrigin;
	}
	public void setTilesOrigin(String tilesOrigin) {
		this.tilesOrigin = tilesOrigin;
	}
	public String getSource() {
		return source;
	}
	public void setSource(String source) {
		this.source = source;
	}
	public String getTipoOrigen() {
		return tipoOrigen;
	}
	public void setTipoOrigen(String tipoOrigen) {
		this.tipoOrigen = tipoOrigen;
	}
	public String getURL() {
		return URL;
	}
	public void setURL(String uRL) {
		URL = uRL;
	}
	public String getFormatToService() {
		return formatToService;
	}
	public void setFormatToService(String formatToService) {
		this.formatToService = formatToService;
	}
}
