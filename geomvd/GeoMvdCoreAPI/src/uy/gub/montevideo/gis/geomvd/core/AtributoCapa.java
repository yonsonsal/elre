package uy.gub.montevideo.gis.geomvd.core;

import com.google.gson.annotations.SerializedName;

public class AtributoCapa {
	
	private String nombre;
	private String nombreParaMostrar;
	private String tipo;
	private transient Capa capa;
	@SerializedName("capa_referenciada")
	private String capaReferenciada;
	@SerializedName("NILLABLE")
	private Boolean nillable;
	private String nombre_bd;
	private String usage;
	private String presentation;
	private String referenced_layer;
	private String columns;
	private Boolean query_capable;
	private Boolean read_only;
	private String role_edit;
	private Boolean show;
	private String valorCalculado;
	private Boolean persistible;
	private Boolean consultable;
	private Boolean withtime;
	private String label;
	private String size;
	private String no_export_to;
	private String validador;
	
	private boolean itsintheMD;
	
	public AtributoCapa() {
		this.show = false;
		this.itsintheMD = false;
	}
	
	public AtributoCapa(AtributoCapa another) {
		this.nombre = another.nombre;
		this.nombreParaMostrar = another.nombreParaMostrar ;
		this.tipo = another.tipo;
		if (another.capa != null) {
			this.capa = new Capa(another.capa);	
		}
		
		this.capaReferenciada = another.capaReferenciada;
		this.nillable = another.nillable;
		this.nombre_bd = another.nombre_bd;
		this.usage = another.usage;
		this.presentation = another.presentation;
		this.referenced_layer = another.referenced_layer;
		this.columns = another.columns;
		this.query_capable = another.query_capable;
		this.read_only = another.read_only;
		this.role_edit = another.role_edit;
		this.show = another.show;
		this.valorCalculado = another.valorCalculado;
		this.persistible = another.persistible;
		this.consultable = another.consultable;
		this.withtime = another.withtime;
		this.label = another.label;
		this.size = another.size;
		this.no_export_to = another.no_export_to;
		this.validador = another.validador;
		
		this.itsintheMD = another.itsintheMD;
	}
	
	/////Get and Set/////
	public String getNombre() {
		return nombre;
	}
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
	public String getTipo() {
		return tipo;
	}
	public void setTipo(String tipo) {
		this.tipo = tipo;
	}
	public String getCapaReferenciada() {
		return capaReferenciada;
	}
	public void setCapaReferenciada(String capaReferenciada) {
		this.capaReferenciada = capaReferenciada;
	}
	public Boolean getNillable() {
		return nillable;
	}
	public void setNillable(Boolean nillable) {
		this.nillable = nillable;
	}
	public String getNombre_bd() {
		return nombre_bd;
	}
	public void setNombre_bd(String nombre_bd) {
		this.nombre_bd = nombre_bd;
	}
	public Capa getCapa() {
		return capa;
	}
	public void setCapa(Capa capa) {
		this.capa = capa;
	}
	public String getUsage() {
		return usage;
	}
	public void setUsage(String usage) {
		this.usage = usage;
	}
	public String getPresentation() {
		return presentation;
	}
	public void setPresentation(String presentation) {
		this.presentation = presentation;
	}
	public String getReferenced_layer() {
		return referenced_layer;
	}
	public void setReferenced_layer(String referenced_layer) {
		this.referenced_layer = referenced_layer;
	}
	public String getColumns() {
		return columns;
	}
	public void setColumns(String columns) {
		this.columns = columns;
	}
	public Boolean getQuery_capable() {
		return query_capable;
	}
	public void setQuery_capable(Boolean query_capable) {
		this.query_capable = query_capable;
	}
	public Boolean getRead_only() {
		return read_only;
	}
	public void setRead_only(Boolean read_only) {
		this.read_only = read_only;
	}
	public String getRole_edit() {
		return role_edit;
	}
	public void setRole_edit(String role_edit) {
		this.role_edit = role_edit;
	}
	public Boolean getShow() {
		return show;
	}
	public void setShow(Boolean show) {
		this.show = show;
	}
	public Boolean getConsultable() {
		return consultable;
	}
	public void setConsultable(Boolean consultable) {
		this.consultable = consultable;
	}
	public String getLabe() {
		return label;
	}
	public void setLabe(String labe) {
		this.label = labe;
	}
	public String getNombreParaMostrar() {
		return nombreParaMostrar;
	}
	public void setNombreParaMostrar(String nombreParaMostrar) {
		this.nombreParaMostrar = nombreParaMostrar;
	}
	public String getSize() {
		return size;
	}
	public void setSize(String size) {
		this.size = size;
	}
	public Boolean getWithtime() {
		return withtime;
	}
	public void setWithtime(Boolean withtime) {
		this.withtime = withtime;
	}
	public void setNoExportTo(String no_export_to) {
		this.no_export_to = no_export_to;
	}
	public String getNoExporTo() {
		return no_export_to;
	}
	public String getValorCalculado() { return valorCalculado; }
	public void setValorCalculado(String valorCalculado) { this.valorCalculado = valorCalculado; }
	public String getValidador() { return validador; }
    public void setValidador(String validador) { this.validador = validador; }

	public Boolean getPersistible() {
		return persistible;
	}

	public void setPersistible(Boolean persistible) {
		this.persistible = persistible;
	}

	public boolean isItsintheMD() {
		return itsintheMD;
	}

	public void setItsintheMD(boolean itsintheMD) {
		this.itsintheMD = itsintheMD;
	}
}
