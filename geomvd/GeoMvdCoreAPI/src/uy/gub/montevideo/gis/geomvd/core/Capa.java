package uy.gub.montevideo.gis.geomvd.core;

import java.util.LinkedHashMap;
import java.util.Map;

import com.google.gson.annotations.SerializedName;

public class Capa {
	@SerializedName("Nombre Capa")
	private String nombre;
	private DatosCapa datos;
	private Map<String, AtributoCapa> atributos;
	private Child child;
	private String tipo;
	@SerializedName("Origen_datos")
	private String fuenteBD;
	private String dbms;
	private String nombreTabla;
	private String pk;
	private String comboValue;
	private String comboLabel;
	private String nombreSecuencia;
	private Boolean visible;
	private Boolean editable;
	private Boolean geomedit;
	private Boolean alta;
	private Boolean baja;
	private String estilo;
	private String grupo;
	private String strokeColor; // WFS
	private String strokeWidth; // WFS
	private String fillColor; // WFS
	private String roleedit;
	private String roleeditparcial;
	private Boolean autocommit;
	private Boolean canSplit;
	private Boolean canDeleteVertex;
	private Boolean canClone;
	private Boolean canMerge;

	private boolean esCodiguera;

	public Capa() {
		this.esCodiguera = false;
	}

	public Capa(Capa another) {
		this.nombre = another.nombre;
		this.tipo = another.tipo;
		this.fuenteBD = another.fuenteBD;
		this.dbms = another.dbms;
		this.nombreTabla = another.nombreTabla;
		this.pk = another.pk;
		this.comboValue = another.comboValue;
		this.comboLabel = another.comboLabel;
		this.nombreSecuencia = another.nombreSecuencia;
		this.visible = another.visible;
		this.editable = another.editable;
		this.geomedit = another.geomedit;
		this.alta = another.alta;
		this.baja = another.baja;
		this.estilo = another.estilo;
		this.grupo = another.grupo;
		this.strokeColor = another.strokeColor; // WFS
		this.strokeWidth = another.strokeWidth; // WFS
		this.fillColor = another.fillColor; // WFS
		this.roleedit = another.roleedit;
		this.roleeditparcial = another.roleeditparcial;
		this.esCodiguera = another.esCodiguera;
		this.autocommit = another.getAutocommit();
		this.setCanSplit(another.getCanSplit());
		this.setCanDeleteVertex(another.getCanDeleteVertex());
		this.setCanClone(another.getCanClone());
		this.setCanMerge(another.getCanMerge());
		this.datos = another.datos;
		this.child = another.child;

		Map<String, AtributoCapa> atributosClon = new LinkedHashMap<String, AtributoCapa>();
		for (AtributoCapa a : another.atributos.values()) {
			AtributoCapa atri = new AtributoCapa(a);
			atributosClon.put(atri.getNombre(), atri);
		}

		this.atributos = atributosClon;
	}

	/////////////////////////////////////////////////////
	// Get and Set///////////////////////////////////////
	////////////////////////////////////////////////

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public DatosCapa getDatos() {
		return datos;
	}

	public void setDatos(DatosCapa datos) {
		this.datos = datos;
	}

	public Boolean isVisible() {
		return visible;
	}

	public void setVisible(Boolean visible) {
		this.visible = visible;
	}

	public Boolean isEditable() {
		return editable;
	}

	public void setEditable(Boolean editable) {
		this.editable = editable;
	}

	public String getEstilo() {
		return estilo;
	}

	public void setEstilo(String estilo) {
		this.estilo = estilo;
	}

	public String getGrupo() {
		return grupo;
	}

	public void setGrupo(String grupo) {
		this.grupo = grupo;
	}

	public Map<String, AtributoCapa> getAtributos() {
		return atributos;
	}

	public void setAtributos(Map<String, AtributoCapa> atributos) {
		this.atributos = atributos;
	}

	public String getFuenteBD() {
		return fuenteBD;
	}

	public void setFuenteBD(String fuenteBD) {
		this.fuenteBD = fuenteBD;
	}

	public String getNombreTabla() {
		return nombreTabla;
	}

	public void setNombreTabla(String nombreTabla) {
		this.nombreTabla = nombreTabla;
	}

	public boolean isEsCodiguera() {
		return esCodiguera;
	}

	public void setEsCodiguera(boolean esCodiguera) {
		this.esCodiguera = esCodiguera;
	}

	public Child getChild() {
		return child;
	}

	public void setChild(Child child) {
		this.child = child;
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

	public String getNombreSecuencia() {
		return nombreSecuencia;
	}

	public void setNombreSecuencia(String nombreSecuencia) {
		this.nombreSecuencia = nombreSecuencia;
	}

	public Boolean isAlta() {
		return alta;
	}

	public void setAlta(Boolean alta) {
		this.alta = alta;
	}

	public Boolean isBaja() {
		return baja;
	}

	public void setBaja(Boolean baja) {
		this.baja = baja;
	}

	public String getPk() {
		return pk;
	}

	public void setPk(String pk) {
		this.pk = pk;
	}

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public void setDbms(String dbms) {
		this.dbms = dbms;
	}

	public String getDbms() {
		return dbms;
	}

	public String getRoleedit() {
		return roleedit;
	}

	public void setRoleedit(String roleedit) {
		this.roleedit = roleedit;
	}

	public String getRoleeditparcial() {
		return roleeditparcial;
	}

	public void setRoleeditparcial(String roleeditparcial) {
		this.roleeditparcial = roleeditparcial;
	}

	public AtributoCapa findAtributobyNombreBD(String nombreBD) {
		for (AtributoCapa a : atributos.values())
			if (a.getNombre_bd() != null && a.getNombre_bd().equals(nombreBD))
				return a;
		return null;
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
	
	public void setCanMerge(Boolean canMerge) {
		this.canMerge = canMerge;
	}
	
	public Boolean getCanMerge() {
		return canMerge;
	}

	public String getComboValue() {
		return comboValue;
	}

	public void setComboValue(String comboValue) {
		this.comboValue = comboValue;
	}

	public String getComboLabel() {
		return comboLabel;
	}

	public void setComboLabel(String comboLabel) {
		this.comboLabel = comboLabel;
	}
	
	

}
