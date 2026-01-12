package uy.gub.montevideo.gis.geomvd.util;

public enum ConfigPropertiesGeomvd {

	CARACTERES_REPLACE ("CARACTERES_REPLACE"),
	SECUENCIA_USA_PK ("SECUENCIA_USA_PK");
		
	private final String value;
	
	private ConfigPropertiesGeomvd(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
	
}
