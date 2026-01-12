package uy.gub.montevideo.gis.geomvd.core;

import com.google.gson.Gson;

import uy.gub.montevideo.gis.geomvd.util.ConfigProperties;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;

public class Layer {
	
	private String nombre;
	private Boolean tiled;//WMS
	private Boolean visible; //WFS o WMS
	private Boolean editabe;
	private Boolean geomedit;
	private Boolean alta;
	private Boolean baja;
	private String grupo;
	private String title; //WFS o WMS
	private String workspace; //WFS o WMS
	private String capa; //WFS o WMS
	private String layers; //WFS
	private String format; //WMS o WMS
	private String url; //WFS o WMS
	private String service; //WFS
	private String version = "1.1.0"; //WFS o WMS
	private String typeName; //WFS & WMS
	private String tipogeometria; //WFS o WMS
	private String srsName; //WFS & WMS
	private String formatToService; //WMS
	private String tilesOrigin; //WMS
	private boolean esCodiguera;
	private String strokeColor; //WFS
	private String strokeWidth; //WFS
	private String fillColor; //WFS
	private String nombreTabla;
	private String source;
	private String tipoOrigen;
	private String tipo;
	private String estilo;
	private String fuenteDB;
	private String dbms;
	private Boolean autocommit;
	private Boolean canSplit;
	private Boolean canDeleteVertex;
	private Boolean canClone;
	private Boolean canMerge;


	public Layer() {
		this.esCodiguera = false;
	}
	
	//////////////////////////////////////////////////
	//////Function/////////////////////////////////
	
	public String getJson() {
		String json;

		if (this.format != null ) {
			this.srsName = "EPSG:32721";
			this.typeName = this.workspace + ":" + this.capa;
			if (format.equals("WFS")) {
				this.url = GetPropertyValues.getInstance().getValue(ConfigProperties.URLgeoserver.getValue()) + "/wfs";
				this.service = "WFS";
				
			}else {
				// Todas las capas WMS locales pasan por el proxy
				if (this.url == null) this.url = GetPropertyValues.getInstance().getValue(ConfigProperties.URL_GEOSERVER_PROXY.getValue()) + "/wms";	
				if (this.formatToService == null) this.formatToService = "image/png";
				if (this.workspace == null) {
					this.layers = this.capa;
				}
				else {
					this.layers = this.workspace + ":" + this.capa;
				}
				if (this.tilesOrigin == null) this.tilesOrigin = "500614.25,6133579";
				this.tiled = true;
				
			}
		}
		
		json = new Gson().toJson(this);	
		
		return json;
	}
	
	public void capatoLayer (Capa capa,Layer layer) {
		
		layer.workspace = (capa.getDatos() != null ? capa.getDatos().getWorkspace():null);
		layer.esCodiguera = capa.isEsCodiguera();
		layer.format = (capa.getDatos() != null ?capa.getDatos().getTipo():null);
		layer.title = (capa.getDatos() != null ?capa.getDatos().getNombreMostrar():null);
		layer.capa = (capa.getDatos() != null ?capa.getDatos().getLayer():null);
		layer.grupo = capa.getGrupo();
		layer.nombre = capa.getNombre();
		layer.tipogeometria = (capa.getAtributos().get("the_geom") != null ? capa.getAtributos().get("the_geom").getTipo() : (capa.getAtributos().get("THE_GEOM") != null ? capa.getAtributos().get("THE_GEOM").getTipo() : null));
		layer.visible = capa.isVisible();
		layer.editabe = capa.isEditable();
		layer.geomedit = capa.getGeomedit();
		layer.alta = capa.isAlta();
		layer.baja = capa.isBaja();
		layer.strokeColor = capa.getStrokeColor();
		layer.strokeWidth = capa.getStrokeWidth();
		layer.fillColor = capa.getFillColor();
		layer.nombreTabla = capa.getNombreTabla();
		layer.fuenteDB = capa.getFuenteBD();
		layer.tilesOrigin = (capa.getDatos() != null ?capa.getDatos().getTilesOrigin():null);
		layer.source = ((capa.getDatos() != null ?capa.getDatos().getSource():null));
		layer.tipoOrigen = (capa.getDatos() != null ?capa.getDatos().getTipoOrigen():null);
		layer.url = (capa.getDatos() != null ?capa.getDatos().getURL():null);
		layer.tipo = capa.getTipo();
		layer.estilo = capa.getEstilo();
		layer.formatToService = (capa.getDatos() != null ?capa.getDatos().getFormatToService():null);
		layer.dbms = capa.getDbms();
		
		layer.autocommit = capa.getAutocommit();
		layer.canSplit = capa.getCanSplit();
		layer.canDeleteVertex = capa.getCanDeleteVertex();
		layer.canClone = capa.getCanClone();
		layer.canMerge = capa.getCanMerge();

	}
	
	/////////////////////////////////////////////////////
	//Get and Set///////////////////////////////////////
	////////////////////////////////////////////////
	
	public String getNombre() {
		return nombre;
	}
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public Boolean isVisible() {
		return visible;
	}
	public void setVisible(Boolean visible) {
		this.visible = visible;
	}
	
	public String getGrupo() {
		return grupo;
	}
	public void setGrupo(String grupo) {
		this.grupo = grupo;
	}

	public Boolean getTiled() {
		return tiled;
	}

	public void setTiled(Boolean tiled) {
		this.tiled = tiled;
	}

	public boolean isEsCodiguera() {
		return esCodiguera;
	}

	public void setEsCodiguera(boolean esCodiguera) {
		this.esCodiguera = esCodiguera;
	}


	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getWorkspace() {
		return workspace;
	}

	public void setWorkspace(String workspace) {
		this.workspace = workspace;
	}

	public String getLayers() {
		return layers;
	}

	public void setLayers(String layer) {
		this.layers = layer;
	}

	public String getFormat() {
		return format;
	}

	public void setFormat(String format) {
		this.format = format;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getService() {
		return service;
	}

	public void setService(String service) {
		this.service = service;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getTypeName() {
		return typeName;
	}

	public void setTypeName(String typeName) {
		this.typeName = typeName;
	}

	public String getTipogeometria() {
		return tipogeometria;
	}

	public void setTipogeometria(String tipogeometria) {
		this.tipogeometria = tipogeometria;
	}

	public String getSrsName() {
		return srsName;
	}

	public void setSrsName(String srsName) {
		this.srsName = srsName;
	}

	public String getFormatToService() {
		return formatToService;
	}

	public void setFormatToService(String formatToService) {
		this.formatToService = formatToService;
	}

	public String getCapa() {
		return capa;
	}

	public void setCapa(String capa) {
		this.capa = capa;
	}

	public String getTilesOrigin() {
		return tilesOrigin;
	}

	public void setTilesOrigin(String tilesOrigin) {
		this.tilesOrigin = tilesOrigin;
	}

	public Boolean getEditabe() {
		return editabe;
	}

	public void setEditabe(Boolean editabe) {
		this.editabe = editabe;
	}

	public String getStrokeColor() {
		return strokeColor;
	}

	public void setStrokeColor(String strokeColor) {
		this.strokeColor = strokeColor;
	}

	public String getStrokeWidth() {
		return strokeWidth;
	}

	public void setStrokeWidth(String strokeWidth) {
		this.strokeWidth = strokeWidth;
	}

	public String getFillColor() {
		return fillColor;
	}

	public void setFillColor(String fillColor) {
		this.fillColor = fillColor;
	}

	public String getNombreTabla() {
		return nombreTabla;
	}

	public void setNombreTabla(String nombreTabla) {
		this.nombreTabla = nombreTabla;
	}
	
	public String getFuenteDB() {
		return fuenteDB;
	}
	
	public void setFuenteDB(String fuenteDB) {
		this.fuenteDB = fuenteDB;
	}

	public Boolean getAlta() {
		return alta;
	}

	public void setAlta(Boolean alta) {
		this.alta = alta;
	}

	public Boolean getBaja() {
		return baja;
	}

	public void setBaja(Boolean baja) {
		this.baja = baja;
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

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public String getEstilo() {
		return estilo;
	}

	public void setEstilo(String estilo) {
		this.estilo = estilo;
	}

	public String getDbms() {
		return dbms;
	}

	public void setDbms(String dbms) {
		this.dbms = dbms;
	}

	public Boolean getGeomedit() {
		return geomedit;
	}

	public void setGeomedit(Boolean geomedit) {
		this.geomedit = geomedit;
	}

	public Boolean getAutocommit() {
		return autocommit;
	}

	public void setAutocommit(Boolean autocommit) {
		this.autocommit = autocommit;
	}

	public Boolean getCanSplit() {
		return canSplit;
	}

	public void setCanSplit(Boolean canSplit) {
		this.canSplit = canSplit;
	}

	public Boolean getCanDeleteVertex() {
		return canDeleteVertex;
	}

	public void setCanDeleteVertex(Boolean canDeleteVertex) {
		this.canDeleteVertex = canDeleteVertex;
	}

	public Boolean getCanClone() {
		return canClone;
	}

	public void setCanClone(Boolean canClone) {
		this.canClone = canClone;
	}
	
	public Boolean getCanMerge() {
		return canMerge;
	}

	public void setCanMerge(Boolean canMerge) {
		this.canMerge = canMerge;
	}
}
