package uy.gub.montevideo.gis.geomvd.util;

public enum ConfigProperties {

	urlBase ("url"),
	userBase ("user"),
	geodesicMeasure("geodesicMeasure"),
	urlManual("URLmanual"),
	urlParadasFaltantesDesvio("URLparadasFaltantesDesvio"),
	urlUpdateDesvio("URLupdateDesvio"),
	urlUpdateDestino("URLupdateDestino"),
	urlUpdateDestinoDesvio("URLupdateDestinoDesvio"),
	URLlugaresDesvio("URLlugaresDesvio"),
	URLaddLugarDesvio("URLaddLugarDesvio"),
	URLaddVarianteCron("URLaddVarianteCron"),
	URLupdateDescripcionSublineaCron("URLupdateDescripcionSublineaCron"),
	URLdeleteVarianteCron("URLdeleteVarianteCron"),
	URLcorregirExtremosVarianteCron("URLcorregirExtremosVarianteCron"),
	URLagregarDesvioCron("URLagregarDesvioCron"),
	userServiciosRest("userServiciosRest"),
	passServiciosRest("passServiciosRest"),
	passwordBase ("password"),
	URLgeoserver ("URLgeoserver"),
	URL_GEOSERVER_PROXY ("URLgeoserverProxy"),
	URL_REST_SERVER ("URLrestserver"),
	REPORTS_PATH ("REPORTS_PATH"),
	ROL_APLICACION ("rolaplicacion"),
	REPORTS_BASE_URL ("REPORTS_BASE_URL");
		
	private final String value;
	
	private ConfigProperties(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
	
}
