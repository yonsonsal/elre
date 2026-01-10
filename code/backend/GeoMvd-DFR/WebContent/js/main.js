let baseURL = getCurrentURL();
let apiURL = baseURL + '/api/plugineta/rest';
let coreURL = baseURL + '/api/geomvd/core';
let urlGeoserver = "";

let scripts = [
	coreURL + '/external/js/ol-debug.js?v='+buildVersion,
	coreURL + '/external/js/FileSaver.min.js?v='+buildVersion,
	coreURL + '/external/js/jspdf.debug.js?v='+buildVersion,
	coreURL + '/external/js/jsts.min.js?v='+buildVersion,
	coreURL + '/external/js/bootstrap.min.js?v='+buildVersion,
	coreURL + '/external/js/ol3-layerswitcher.js?v='+buildVersion,
	coreURL + '/external/js/proj4.js?v='+buildVersion,
	coreURL + '/external/js/jszip.min.js?v='+buildVersion,
	coreURL + '/external/js/ol-ext.min.js?v='+buildVersion,
	coreURL + '/external/js/alertify.min.js?v='+buildVersion,
	coreURL + '/external/js/xml2json.js?v='+buildVersion,
	coreURL + '/external/js/sldreader.js?v='+buildVersion,
	coreURL + '/external/js/turf-5.1.6.min.js?v='+buildVersion,
	coreURL + '/external/js/jquery.blockUI.js?v='+buildVersion,
	coreURL + '/js/classPendingChange.js?v='+buildVersion,
	coreURL + '/js/styles.js?v='+buildVersion,
	coreURL + '/js/utils.js?v='+buildVersion,
	coreURL + '/js/def.js?v='+buildVersion,
	coreURL + '/js/geometryHelper.js?v='+buildVersion,
	coreURL + '/js/layerHelper.js?v='+buildVersion,
	coreURL + '/js/filterHelper.js?v='+buildVersion,
	coreURL + '/js/validationHelper.js?v='+buildVersion,
	coreURL + '/js/formHelper.js?v='+buildVersion,
	coreURL + '/js/actions.js?v='+buildVersion,
	coreURL + '/js/services.js?v='+buildVersion,
	coreURL + '/js/HTMLHelper.js?v='+buildVersion,
	coreURL + '/js/measure.js?v='+buildVersion,
	coreURL + '/WebComponents/wc-map/wc-map.js?v='+buildVersion,
	coreURL + '/WebComponents/wc-toolbar/wc-toolbar.js?v='+buildVersion
];

$(document).ready(function () {
	cargarUrlGeoserver();
	console.log("apiURL: ", apiURL);
});

function getCurrentURL() {
	let baseURL = window.location.protocol + '//' + window.location.host;
	return baseURL;
}

function cargarScripts(_scripts, _indice) {
	if (_indice < _scripts.length) {
		var script = document.createElement('script');
		script.onload = function () {
			_indice++;
		    cargarScripts(_scripts, _indice)
		};
		
		script.src = scripts[_indice];
		
		document.head.appendChild(script);
	} else {
		scriptsCargados();
	}
}

function scriptsCargados() {
	let map = document.querySelector("wc-map");
	cargarTipoDeMedicion(map);
	cargarmanual(map);
	cargarFiltrosApp(map);
	cargarEventosDeRecarga(map);
	cargarValidacionesApp(map);
	cargarMenuApp(map);
    map.addEventListener('WCMapSingleClick', this.WCMapSingleClick);
}

function WCMapSingleClick(e) {
}

function cargarTipoDeMedicion(map) {
	var getLayers = $.get(apiURL + '/layers/tipomedicion')
	.done(function(response) {
		let tipoMedicion = "";
		
		if (response) {
			tipoMedicion = response;
		}
		map.geodesicMeasure = tipoMedicion.geodesicMeasure;
	})
	.fail(function() {
	    alert("Ha ocurrido un error al cargar el tipo de medición. Por favor, intente nuevamente.");
	});
}

function cargarmanual(map) {
	var getLayers = $.get(apiURL + '/layers/urlmanual')
	.done(function(response) {
		let urlmanual = "";
		
		if (response) {
			urlmanual = response;
		}
		map.helpLink = urlmanual.urlmanual;
	})
	.fail(function() {
	    alert("Ha ocurrido un error al cargar el manual. Por favor, intente nuevamente.");
	});
}

function cargarUrlGeoserver() {
	var getLayers = $.get(apiURL + '/layers/urlgeoserver')
	.done(function(response) {
		urlGeoserver = response.urlgeoserver;
		cargarScripts(scripts, 0, scriptsCargados);
	})
	.fail(function() {
	    alert("Ha ocurrido un error al cargar la url del geoserver. Por favor, intente nuevamente.");
	});
}

function cargarFiltrosApp(map) {
	map._customApplicationFilterCallback = filterBy;
	map._loadCustomAppFiltersCallback = loadCustomAppFiltersCallback;
}

function cargarEventosDeRecarga(map) {
	map._appLayerReloadCallback = function (layer, that) {
		//debugger;
		if (layer.values_.title == "Zonas Recorrido" || layer.values_.originalLayerTitle == "Zonas Recorrido") {
			that.refreshLayerSource(that, "Posiciones Recorrido");
			setTimeout(() => {
				if (that._filters.find(v => (v.layerName === 'Zonas Recorrido')).filters.length > 0 /*&& that._filters.find(v => (v.layerName === 'Zonas Recorrido')).filters[0].filter != undefined*/) {
					that.applyFiltersFromArray(getFilterLayerByOriginalLayerTitle(that, "Zonas Recorrido"), null, false);
				}
				if (that._filters.find(v => (v.layerName === 'Posiciones Recorrido')).filters.length > 0 /*&& that._filters.find(v => (v.layerName === 'Posiciones Recorrido')).filters[0].filter != undefined*/) {
					that.applyFiltersFromArray(getFilterLayerByOriginalLayerTitle(that, "Posiciones Recorrido"), null, false);				
				}
			}, 3000)
		}
	};
}

function cargarValidacionesApp(map) {
	map._customValidationsCallback = validateCustom;
}

function cargarMenuApp(map) {
	map._loadAppCustomMenu = loadAppCustomMenu;
	map._customMenuActions = loadAppCustomMenuActions;
}

mostrarConfirmarLuegoDeBorrar = [
	{
		layerTitle: 'Posiciones Recorrido',
		titulo: 'Desasociar Contenedor',
		mensaje: 'Existe un contenedor físico en esa posición.\n Se desasociará el contenedor físico de la posición.\n ¿Confirma la baja?',
		luegoDeConfirmar: function accionMostrarConfirmar(context) {
			siHayQueEjecutarAccionLuegoDeBorrar();	
		},
		muestroAlertify : async function verificarMostrarConfirmar(context) {
			let ret = posicionesRecorridoTieneContenedoresAsociados(context);
			return ret;
		}
	}
]

mostrarMensajeLuegoDeEditarGeometria = [
	{
		layerTitle: 'Posiciones Recorrido',
		titulo: 'Advertencia',
		mensaje: 'Advertencia: La posición fue colocada fuera de su zona de recorrido.',
		muestroMensaje : async function verificarMostrarMensaje(context) {
			let ret = posicionesRecorridoControlEstaFueraDeZona(context);
			return ret;
		}
	}
]

function cargarZonaRecorrido(context){
	let retorno = "";
	let geom = getWKTFromFeature(context.featuresInUse[0]);
	
	$.ajax({
		type: "GET",
		async:false, //POR DEFAULT VIENE EN TRUE, LO PONGO EN FALSE PORQUE NECESITO QUE SE ESPERE ESTA RESPUESTA
		url: apiURL + "/validateDFR/cargarZonaRecorrido/?geom="+geom,
        headers: {
        	"Accept": "application/json"
    	},
    	success: function(data) {
    		retorno = data;
		},
		error: function(error) {
           console.error("[main.js] - cargarZonaRecorrido - ajax - error | error:");
           console.error(error);
       }
   });
	return retorno;
}

function posicionesRecorridoTieneContenedoresAsociados(context){
	//debugger;
	let retorno = false;
	let gid = context.selectedFeatures[0].values_["GID"];
	console.log("gid " + gid);
	$.ajax({
		type: "GET",
		async:false, //POR DEFAULT VIENE EN TRUE, LO PONGO EN FALSE PORQUE NECESITO QUE SE ESPERE ESTA RESPUESTA
        url: apiURL + "/validateDFR/chequeoPosicionesRecorridoTieneContenedoresAsociados/?gid=" + gid,
        headers: {
        	"Accept": "application/json"
    	},
    	success: function(data) {
    		retorno = data;
		},
		error: function(error) {
           console.error("[main.js] - chequeoPosicionesRecorridoTieneContenedoresAsociados - ajax - error | error:");
           console.error(error);
       }
   });
	return retorno;
}

function posicionesRecorridoControlEstaFueraDeZona(context){
	let retorno = false;
	let gid = context.selectedFeatures[0].values_["GID"];
	let geom = getWKTFromGeometry(context.featuresInUse[0].values_['THE_GEOM']);
	$.ajax({
		type: "GET",
		async:false, //POR DEFAULT VIENE EN TRUE, LO PONGO EN FALSE PORQUE NECESITO QUE SE ESPERE ESTA RESPUESTA
        url: apiURL + "/validateDFR/chequeoPosicionesRecorridoEstaFueraDeZona/?gid=" + gid+"&geom="+geom,
        headers: {
        	"Accept": "application/json"
    	},
    	success: function(data) {
    		retorno = data;
		},
		error: function(error) {
           console.error("[main.js] - chequeoPosicionesRecorridoEstaFueraDeZona - ajax - error | error:");
           console.error(error);
       }
   });
	return retorno;
}
