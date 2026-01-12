let baseMapURL = '';
let WCMapAPIUrl = apiURL;
let urlGeoserverMap = urlGeoserver
let WCMapGetComboDataURL = WCMapAPIUrl + '/layers/codiguerasdata';
let WCMapGetLayerURL = WCMapAPIUrl + '/layers/atributocapaformat';
let WCMapUpdateLayerDataURL = WCMapAPIUrl + '/layers/execute_i_d_u';
let WCMapUpdateCascadeURL = WCMapAPIUrl + '/layers/updateCascade';
let WCMapSelectTableURL = WCMapAPIUrl + '/layers/selecttable';
let WCMapSelectMultipleURL = WCMapAPIUrl + '/core/selectmultiple';
let WCMapNombreCallebyCodigoURL = WCMapAPIUrl + '/layers/nombrecallebycodigo';
let WCMapcalleLikenombreURL = WCMapAPIUrl + '/layers/calleLikenombre';
let WCMapesquinabycalleURL = WCMapAPIUrl + '/layers/callesesquina';
let WCMapubicacioncallebycodigoandnropuertaURL = WCMapAPIUrl + '/layers/ubicacioncallebycodigoandnropuerta';
let WCMapubicacionesquinaURL = WCMapAPIUrl + '/layers/ubicacioncalleesquina';
let WCMapubicacionpadronURL = WCMapAPIUrl + '/layers/ubicacioncentroidepadron';
let WCMapubicacionpadronpoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricopadron';
let WCMapcczURL = WCMapAPIUrl + '/layers/ccz';
let WCMapubicacioncczURL = WCMapAPIUrl + '/layers/ubicacioncentroidccz';
let WCMapubicacioncczpoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricoccz';
let WCMaplugarDeInteresLikenombreURL = WCMapAPIUrl + '/layers/lugarDeInteresLikenombre';
let WCMapubicacionbarrioURL = WCMapAPIUrl + '/layers/ubicacioncentroidbarrio';
let WCMapubicacionbarriopoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricobarrio';
let WCMapmunicipiosURL = WCMapAPIUrl + '/layers/municipios';
let WCMapubicacionmunicipioURL = WCMapAPIUrl + '/layers/ubicacioncentroidmunicipio';
let WCMapubicacionmunicipiopoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricomunicipio';
let WCMapbarrioLikenombreURL = WCMapAPIUrl + '/layers/barrioLikenombre';
let WCMapubicacionCulturaURL = WCMapAPIUrl + '/layers/ubicacionCultura';
let WCMapubicacionDeporteURL = WCMapAPIUrl + '/layers/ubicacionDeporte';
let WCMapubicacionEducacionURL = WCMapAPIUrl + '/layers/ubicacionEducacion';
let WCMapubicacionEspacioLibreURL = WCMapAPIUrl + '/layers/ubicacioncentroidEspacioLibre';
let WCMapubicacionEspacioLibrepoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricoEspacioLibre';
let WCMapubicacionMonumentosURL = WCMapAPIUrl + '/layers/ubicacionMonumentos';
let WCMapubicacionPatrimonioURL = WCMapAPIUrl + '/layers/ubicacioncentroidPatrimonio';
let WCMapubicacionPatrimoniopoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricoPatrimonio';
let WCMapubicacionPlayaURL = WCMapAPIUrl + '/layers/ubicacioncentroidPlaya';
let WCMapubicacionPlayapoligonoURL = WCMapAPIUrl + '/layers/ubicaciongeometricoPlaya';
let WCMapubicacionSaludURL = WCMapAPIUrl + '/layers/ubicacionSalud';
let WCMapExportCSVURL = WCMapAPIUrl + '/reportes/csv';
let WCMapExportGeoJSONURL = WCMapAPIUrl + '/reportes/geojson';
let WCMapExportKMLURL = WCMapAPIUrl + '/reportes/kml';
let WCMapExportSHPURL = WCMapAPIUrl + '/reportes/shp';
let WCMapGetCalcFieldURL = WCMapAPIUrl + '/layers/getCalcFields';
let WCMapGetWFSLayerStyles = urlGeoserverMap + '/wms?request=GetStyles&service=wms&version=1.1.1';
let urlsFile;
let files;

let comboData = null;
let comboFindCalle;
let comboFindEsquinas;
let comboFindBarrio;
let comboFindMunicipios;
let comboFindCcz;
let capa = null

let idNotFunddatetimelocal = [];
let time = 0;

let hayQuePasarAHistorico = false;
let hayQueEjecutarAccionLuegoDeBorrar = false;

const WFST_authorization = true;
const wfsusername='tyt', wfspassword='tyt';

// ****************************************
// MANEJO DE TIMEOUT POR JAVASCRIPT
// ****************************************
// variableTimeOut son los minutos configurados en el session-timeout del
// web.xml de cada aplicacion
let variableTimeOut = $("wc-map")[0].getAttribute('timeout');
console.log("timeout: " + variableTimeOut);

if(variableTimeOut > 0){
	
	var IdealTimeOut = 1 + (60 * variableTimeOut);
	var idleSecondsTimer = null;
	var idleSecondsCounter = 0;
	document.onclick = function () { idleSecondsCounter = 0; };
	document.onmousemove = function () { idleSecondsCounter = 0; };
	document.onkeypress = function () { idleSecondsCounter = 0; };
	idleSecondsTimer = window.setInterval(CheckIdleTime, 1000);

	function CheckIdleTime() {
	    idleSecondsCounter++;
	    if (idleSecondsCounter >= IdealTimeOut) {
	        window.clearInterval(idleSecondsTimer);
	        alert("Su Sesión ha expirado. Debe volver a hacer Login.");
	        logout();
	    }
	}	
}

// ****************************************
// ****************************************

class WCMap extends HTMLElement {
	/*
	 * Lifecycle
	 */
	constructor() {
		super();
	}
	
	// Se llama cada vez que el elemento se inserta en el DOM. Es similar al
	// componentWillMount de React.js.
	connectedCallback () {
		this.innerHTML = renderWCMapHTML();
		this.setSettings();
		this.initMap();
		this.loadComboData();
		this.addCustomEvents();
		this.customizeInteractions();
		console.log('this wc-map' + this)
		cargarCapas(this);	
	}
	
	// Se llama cuando el componente es eliminado del DOM. Es similar al
	// componentWillUnmount de React.js.
	disconnectedCallback() {
	}
	
	// Se llama cuando un atributo del elemento es agregado, removido,
	// actualziado o remplazado. Es similar al componentWillReciveProps,
	// shouldComponentUpdate y componentDidUpdate de React.js.
	attributeChangedCallback(name, oldValue, newValue) {
	}
	
	// Se llama cada vez que el elemento es movido a un nuevo documento. Solo se
	// llamará cuando en la página haya un iframe.
	adoptedCallback() {
    }

	async applyCustomValidations(layerId, attribute, value, originalValue, context, extraData) {
		let isValid = true;
		if (context._customValidationsCallback) {
			isValid = await context._customValidationsCallback(layerId, attribute, value, originalValue, context, extraData);
		}
		return isValid;
	}

	applyCustomApplicationFilter(filterBy, layerId, context) {
		let that = context;
		let errorMessage = null;
		
		  if (that._mode == "ADD" && that.hasPendingChanges(that)) { 
			  errorMessage = "Debe salir del modo alta, confirmar ó descartar cambios para poder aplicar filtros."; 
		  } else if (that._mode == "EDIT" && that.hasPendingChanges(that)) {
			  errorMessage = "Debe salir del modo edición, confirmar ó descartar cambios para poder aplicar filtros."; 
		  }

		if (errorMessage) {
			alertify.error(errorMessage);
		} else {
			if (that._customApplicationFilterCallback) {
				that._customApplicationFilterCallback(filterBy, layerId, context);
			} else {
				let layer = getLayerByLayerId(context, layerId);
				let layerTitle = layer && layer.values_ ? layer.values_.title : null;
				let filterLayer = getFilterLayerByOriginalLayerTitle(context, layerTitle);
				context.applyFiltersFromArray(filterLayer, null);
            }
		}
	}


	/*
	 * Getters & Setters
	 */
	set layers(value) {
		console.log('setting layers...' + value)
		this._layers = value;
		this.updateLayers();
	}
  
	get layers() {
		return this._layers;
	}

	get authenticationToken() {
		return this._authenticationToken;
	}
	
	set helpLink(value) {
		this._helpLink = value;
	}
  
	get helpLink() {
		return this._helpLink;
	}
	
	set geodesicMeasure(value) {
		this._geodesicMeasure = value;
	}
  
	get geodesicMeasure() {
		return this._geodesicMeasure;
	}
	
	
	/*
	 * General Functions
	 */
	setSettings() {
		alertify.set('notifier', 'position', 'bottom-right');
		if (this.getAttribute('authenticationToken')) {
			this._authenticationToken = this.getAttribute('authenticationToken');
		}
	}

	initMap() {
		let that = this;
		this._loadCustomAppFiltersCallback = function() { return ""; }
		this._customValidationsCallback = function() { return true; }
		this._customMenuActions = function(buttonId) { }
		this._checkSession = () => {
		    // ToDo: chequear si la sesión está activa. Si no está activa,
			// ejecutar la línea que está comentada debajo.
            // window.location.href = window.location.href + "?GLO=true"
        }
        this._initialZoom = 11;
		this._lastPositions = [];
		this._nextPositions = [];
		this._mapInitialCenter = ol.proj.transform([-56.211514, -34.816746], 'EPSG:4326', 'EPSG:32721');
		let mapCenter = this._mapInitialCenter;
		let initialZoom = this._initialZoom;
		
		let view = new ol.View({
	        center: [0, 0],
	        zoom: 1
	    });
		
		let layers = [];
	    let vectorControles = [];

	    let scaleLineControl = new ol.control.ScaleLine({
	    	className: 'ol-scale-line ol-scale-line-inner ol-custom-scale-line'
	    });
	    
	    let zoomSelector = new ol.control.Zoom();
	    
	    let zoomslider = new ol.control.ZoomSlider();
	    
	    let mousePositionControl = new ol.control.MousePosition({
			coordinateFormat: ol.coordinate.createStringXY(5),
			projection: 'EPSG:32721',
			className: 'custom-mouse-position',
			undefinedHTML: 'Cursor fuera del mapa'
		});
	    
	    vectorControles = [
	    	scaleLineControl,
	        zoomSelector,
	        zoomslider,
	        mousePositionControl
	    ];
		
		let container = document.getElementById('popup');
		
	    let content = document.getElementById('popup-content');
	   
	    let overlay = new ol.Overlay({
	        element: container,
	        autoPan: true,
	        autoPanAnimation: {
	            duration: 250
	        }
	    });
	    
		let map = new ol.Map({
	        target: 'map',
	        layers: [],
	        overlays: [overlay],
	        controls: vectorControles,
	        view: new ol.View({
	            center: mapCenter,
				minZoom: 11,
				maxZoom: 30,
	            zoom: initialZoom,
	            projection: 'EPSG:32721' // OSM projection
	        })
	    });

		let currZoom = map.getView().getZoom();
	    
	    map.on('moveend', function(e) {
	        let newZoom = map.getView().getZoom();
	        if (currZoom != newZoom) {
	            currZoom = newZoom;
	        }
	    });
	    
	    that._map = map;
	}
	
	addCustomEvents() {
		let that = this;
		let verticeMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line ol-unselectable')[0].setAttribute("id","verticeMapa");
		let escalaMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line-inner')[0].setAttribute("id","escalaMapa");
		let zoomMapa = document.getElementsByClassName('ol-zoom ol-unselectable ol-control')[0].setAttribute("id","zoomMapa");
		let reglaMapa = document.getElementsByClassName('ol-zoomslider ol-unselectable ol-control')[0].setAttribute("id","reglaMapa");		
		
		$("#verticeMapa").css("left","258px");
		$("#verticeMapa").css("transition","left .5s");
		$("#escalaMapa").css("left","30px");
		$("#escalaMapa").css("transition","left .5s");
		$("#zoomMapa").css("left","258px");
		$("#zoomMapa").css("transition","left .5s");
		$("#reglaMapa").css("left","258px");
		$("#reglaMapa").css("transition","left .5s");
		
		$("#modal-select-layer-to-filter-button-select").click(function() {
			that.selectLayerToApplyFilter();
		});
		
		$("#modal-select-layer-to-filter-button-cancel").click(function() {
			that.cancelFilterSelection();
		});
		
		window.onresize = function() {
			let mapa = parseInt($("#map").css('height'));
			let buscador = parseInt($("#layer-switcher-find").css('height'));
			let valor = mapa - buscador;
			$("#sidebar-layer-switcher").css("height",valor+"px");
		}

		function openSidebarLayerSwitcher() 
		{
			$("#sidebar-layer-switcher").css("left","0");
			$("#sidebar-layer-switcher").css("width","250px");
			// $("#map-container").css("margin-left","250px");
			$("#control-sidebar-layer-switcher").addClass("active");
			$("#sidebar-layer-switcher").addClass("active");
			// this._layerSwitcherOpened = true;

			$("#layer-switcher-find").css("width","250px");
			$("#layer-switcher-find").css("left","0px");
			
			$("#pending-changes").css("left","270px");
			$("#pending-changes").css("top","5px");
			
			let verticeMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line ol-unselectable')[0].setAttribute("id","verticeMapa");
			let escalaMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line-inner')[0].setAttribute("id","escalaMapa");
			let zoomMapa = document.getElementsByClassName('ol-zoom ol-unselectable ol-control')[0].setAttribute("id","zoomMapa");
			let reglaMapa = document.getElementsByClassName('ol-zoomslider ol-unselectable ol-control')[0].setAttribute("id","reglaMapa");		
			
			$("#verticeMapa").css("left","258px");
			$("#escalaMapa").css("left","30px");
			$("#zoomMapa").css("left","258px");
			$("#reglaMapa").css("left","258px");
			
		}
		
		$("#sidebar-layer-switcher").css("left","0");
		$("#control-sidebar-layer-switcher").addClass("active");
		$("#sidebar-layer-switcher").addClass("active");

		$("#pending-changes").css("left","270px");
		$("#pending-changes").css("top","5px");
		
		function closeSidebarLayerSwitcher()
		{
			$("#sidebar-layer-switcher").css("width","250px");
			$("#sidebar-layer-switcher").css("left","-250px");
			$("#map-container").css("margin-left","0");
			$("#control-sidebar-layer-switcher").removeClass("active");
			$("#sidebar-layer-switcher").removeClass("active");
			// this._layerSwitcherOpened = false;
			
			$("#layer-switcher-find").css("width","250px");
			$("#layer-switcher-find").css("left","-250px");

			$("#pending-changes").css("left","40px");
			$("#pending-changes").css("top","40px");
			
			let verticeMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line ol-unselectable')[0].setAttribute("id","verticeMapa");
			let escalaMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line-inner')[0].setAttribute("id","escalaMapa");
			let zoomMapa = document.getElementsByClassName('ol-zoom ol-unselectable ol-control')[0].setAttribute("id","zoomMapa");
			let reglaMapa = document.getElementsByClassName('ol-zoomslider ol-unselectable ol-control')[0].setAttribute("id","reglaMapa");		
			
			$("#verticeMapa").css("left","8px");
			$("#escalaMapa").css("left","30px");
			$("#zoomMapa").css("left","8px");
			$("#reglaMapa").css("left","8px");
			
		}
			
		document.getElementById('sidebar-layer-switcher').addEventListener("click",function(){
			let valor = parseInt($("#sidebar-layer-switcher").css("width"));
			$("#layer-switcher-find").css("width",valor+"px");
			valor=valor+10;
			$("#control-sidebar-layer-switcher").css("left",valor+"px");
			
			let verticeMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line ol-unselectable')[0].setAttribute("id","verticeMapa");
			let escalaMapa = document.getElementsByClassName('ol-scale-line ol-scale-line-inner ol-custom-scale-line-inner')[0].setAttribute("id","escalaMapa");
			let zoomMapa = document.getElementsByClassName('ol-zoom ol-unselectable ol-control')[0].setAttribute("id","zoomMapa");
			let reglaMapa = document.getElementsByClassName('ol-zoomslider ol-unselectable ol-control')[0].setAttribute("id","reglaMapa");		
			
			$("#verticeMapa").css("left",valor+"px");
			$("#escalaMapa").css("left","30px");
			$("#zoomMapa").css("left",valor+"px");
			$("#reglaMapa").css("left",valor+"px");
        });
		
		$("#botonBuscar").click(function(e){
			e.preventDefault();
			let grilla = parseInt($("#sidebar-layer-switcher").css('height'));
			let buscador = parseInt($("#layer-switcher-find").css('height'));
			let valor;
			if(buscador>38){
				valor = grilla+(buscador-38);
			}
			else
			{
				let tfind = $("#selectTfind")[0].value;
				if (tfind == 3 || tfind == 4 || tfind == 5 || tfind == 6){
					valor = grilla-(127-38);	
				}
				else
				{
					valor = grilla-(155-38);	
				}						
			}
			$("#sidebar-layer-switcher").css("height",valor+"px");
		});
		
		$("#control-sidebar-layer-switcher").click(function(e)
		{
			e.preventDefault();
			var p = $("#sidebar-layer-switcher").offset().left;
			if (p < 0) {
				openSidebarLayerSwitcher();
				$("#control-sidebar-layer-switcher").css("left","260px");
			} else {
				closeSidebarLayerSwitcher();
				$("#control-sidebar-layer-switcher").css("left","10px");
			}
		});
		
		$("#clear-selected-mode").click(function(e)
		{
			if (that.hasPendingChanges(that)) {
				alertify.confirm(
	        		'¿Desea salir del modo actual?',
	        		'Los cambios pendientes serán descartados.',
	        		function() {
						that.cancelPendingChanges(that);
						that.setMode(null);	
	        		},
	        		function() {
	        		}
				);
			} else {
				that.cancelPendingChanges(that);
				that.setMode(null);
			}
		});

		document.addEventListener('keydown', function(e) {
			if (e.keyCode == 16) {
				// Shift
				that._shiftKeyIsPressed = true;
			} else if (e.keyCode == 27) {
				// Esc
				if (that._isMeasuring) {
					stopMeasure(that);
				} else if (that._drawPolygonInteraction) {
					that._map.removeInteraction(that._drawPolygonInteraction);
					that._drawPolygonInteraction = null;
				}
			}
		});

		document.addEventListener('keyup', function(e) {
			if (e.keyCode == 16) {
				that._shiftKeyIsPressed = false;
			}
		});
	}
	
	async updateLayers() {
		let layers = JSON.parse(this._layers);
		let filterLayers = [];
		this._filters = [];
		let baseLayers = [];
		let layerGroups = await loadLayersIntoGroups(layers, baseLayers, filterLayers, this._map, urlGeoserverMap);
		layerGroups.forEach(layerGroup => {
			console.log(layerGroup)
			this._map.addLayer(layerGroup);
		});

		if (baseLayers.length > 0) {
			let lastBaseLayer = baseLayers[baseLayers.length-1];
			let overviewMap = new ol.control.OverviewMap({
		        collapsed: false,
		        className: 'ol-overviewmap ol-custom-overviewmap',
		        layers: [
		        	new ol.layer.Tile({
					    source: new ol.source.TileWMS({
					        url: lastBaseLayer.url,
				        	params: {
					        	"FORMAT": lastBaseLayer.formatToService,
					        	"VERSION": lastBaseLayer.version,
					            tiled: lastBaseLayer.tiled,
					            STYLES: lastBaseLayer.styles,
					            LAYERS: lastBaseLayer.layers.startsWith(':') ? lastBaseLayer.layers.substring(1) : lastBaseLayer.layers,
					            tilesOrigin: lastBaseLayer.tilesOrigin
					        }
					    })
					})
				],
				view: new ol.View({
					maxZoom: 9,
				    minZoom: 9,
				    zoom: 9,
				    projection: 'EPSG:32721'
			    })
		    });
			this._map.addControl(overviewMap);
		}
	
		let layerGroup = new ol.layer.Group({
            name: "LAYER_GROUP_TO_FILTERS",
            title: "Resultado de filtros",
            layers: filterLayers
        });
		
		let vectorFiltroPoligonos = new ol.layer.Vector({
			name: 'FILTER_POLYGON',
			isFilterLayer: true,
		});
		
		let layerGroupPolygon = new ol.layer.Group({
            name: "FILTER_POLYGON_GROUP",
            layers: [vectorFiltroPoligonos]
        });

		filterLayers.forEach( oneLayer => {
			this._filters.push({
				layerName: oneLayer && oneLayer.values_ && oneLayer.values_.title ? oneLayer.values_.title.substring(8) : "",
				filters: []
			})
		});
		
		this._map.addLayer(layerGroup);
		this._map.addLayer(layerGroupPolygon);

		let layerTitlesToLoadInfo = [];
		layers.forEach(ol => {
			if (ol && ol.groupTitle != "Posicion" && ol.groupLayers && ol.groupLayers.length > 0) {
				ol.groupLayers.forEach(ogl => {
					if (
						ogl &&
						(!ogl.tipo || (ogl.tipo && ogl.tipo != "base")) &&
						(ogl.title || (ogl.tipo == "externa" && ogl.nombre))
					) {
						layerTitlesToLoadInfo.push(ogl.title || ogl.nombre);
					}
				});
			}
		});
		updateLayersInfoArray(this, layerTitlesToLoadInfo);

		this.updateLayerSwitcher();
		this.initToolbar();
	}
	
	resetView() {
		this._map.getView().setCenter(this._mapInitialCenter);
		this._map.getView().setZoom(this._initialZoom);
	}

	
	
	customizeInteractions() {
		let that = this;
		const dblClickInteraction = this._map.getInteractions().getArray().find((interaction ) => { return interaction instanceof ol.interaction.DoubleClickZoom })
	    this._map.removeInteraction(dblClickInteraction);
		
		this._map.on('dblclick', function (event) {
		});
		
		this._map.on('click', function (event) {
			if (!that._isMeasuring) {
				// La variable detail es la que va a contener la información a
				// devolver.
				let detail = "Hard-coded data from wc-map (Web Component).";
				
				if (that._mode && that._mode == "INFO") {
					if (!that._activeLayersToConsult || that._activeLayersToConsult.length == 0) {
						let title = "Error";
						// let content = "No tiene ninguna capa seleccionada
						// para efectuar consultas.";
						let content = "Debe encender alguna capa consultable.";
						let okAction = null;
						let cancelAction = null;
						let okButtonText = null;
						let cancelButtonText = "Cerrar";
						let cancelButtonMustCloseModal = true;
						let okButtonMustCloseModal = null;
						let size = null;
						let backdrop = true;
						let keyboard = true;
						that.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
					} else {
						getFeaturesInfo(event, that);
					}
				}
				
				// Creamos un evento en el componente y le agregamos la
				// información guardada en detail.
				// Esto es para que el padre pueda obtener esa información.
				const WCMapSingleClick = new CustomEvent("WCMapSingleClick", {
					detail
			    });
				
			    // Disparamos el evento.
			    that.dispatchEvent(WCMapSingleClick);
			}
	    });
	}
	
	loadComboData() {
		let that = this;
		$.ajax({
    		type: "GET",
            url: WCMapGetComboDataURL,
            headers: {
            	"Accept": "application/json"
        	},
        	success: function(data) {
        		if (data && data.length > 0) {
        			comboData = data;
    			} else {
    				that.showMessage("Error", "<p>No se ha podido cargar la información de las codigueras.</p><p>Intente nuevamente recargado la página o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1008.</small></p>");
				}
    		},
    		error: function(error) {
               console.error("[wc-map.js] - loadComboData - ajax - error | error:");
               console.error(error);
               that.showMessage("Error", "<p>No se ha podido cargar la información de las codigueras.</p><p>Intente nuevamente recargado la página o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1007.</small></p>");
           }
       });
	}
	
	setPositionByCenter(pCenter, pZoom) {
		this._lastPositions.push({
			zoom: this._map.getView().getZoom(),
			center: this._map.getView().getCenter()
		});
		this._nextPositions = [];
		if (!$("#btn-redo-view-map").hasClass("disabled")) {
			$("#btn-redo-view-map").addClass("disabled");
		}
		
		$("#btn-undo-view-map").removeClass("disabled");
		
		this._map.getView().setCenter(pCenter);
		this._map.getView().setZoom(pZoom);
	}
	
	setPositionByBoundingBox(pExtent) {
		this._lastPositions.push({
			zoom: this._map.getView().getZoom(),
			center: this._map.getView().getCenter()
		});
		this._nextPositions = [];
		if (!$("#btn-redo-view-map").hasClass("disabled")) {
			$("#btn-redo-view-map").addClass("disabled");
		}
		
		$("#btn-undo-view-map").removeClass("disabled");
		
		this._map.getView().fit(pExtent, this._map.getSize());3
	}
	
	setLastPosition() {
		if (this._lastPositions && this._lastPositions.length > 0) {

			let actualPosition = {
				zoom: this._map.getView().getZoom(),
				center: this._map.getView().getCenter(),
				fake: true
			};
			let lastPosition = this._lastPositions.pop();

			let ignorePosition = false;
			if (
				actualPosition.zoom == lastPosition.zoom &&
				actualPosition.center == lastPosition.center
			) {
				ignorePosition = true;
			}

			if (this._nextPositions.length == 0) {
			    this._nextPositions.push(actualPosition);
            }
			if (!lastPosition.fake) {
				this._nextPositions.push(lastPosition);
			}

			if (ignorePosition) {
				lastPosition = this._lastPositions.pop();
				this._nextPositions.push(lastPosition);
			}

			this._map.getView().setCenter(lastPosition.center);
			this._map.getView().setZoom(lastPosition.zoom);

			$("#btn-redo-view-map").removeClass("disabled");

			if (this._lastPositions.length == 0) {
				$("#btn-undo-view-map").addClass("disabled");
			}
		}
	}

	setNextPosition() {
		if (this._nextPositions && this._nextPositions.length > 0) {

			let actualPosition = {
				zoom: this._map.getView().getZoom(),
				center: this._map.getView().getCenter(),
				fake: true
			};
			let nextPosition = this._nextPositions.pop();

			let ignorePosition = false;
			if (
				actualPosition.zoom == nextPosition.zoom &&
				actualPosition.center == nextPosition.center
			) {
				ignorePosition = true;
			}

			this._lastPositions.push(nextPosition);

			if (ignorePosition) {
				nextPosition = this._nextPositions.pop();
				this._lastPositions.push(nextPosition);
			}

			this._map.getView().setCenter(nextPosition.center);
			this._map.getView().setZoom(nextPosition.zoom);

			$("#btn-undo-view-map").removeClass("disabled");

			if (this._nextPositions.length == 0) {
				$("#btn-redo-view-map").addClass("disabled");
			}
		}
	}


	/*
	 * Consult, Edit, Delete & Add Mode
	 */
	updateActiveLayersToConsult() {
		let that = this;
		let layersToConsult = [];

		setTimeout(function() {
			let layerGroups = that._map.getLayers().array_;
			for (let i = (layerGroups.length-1); i >= 0; i--) {
				let oneLayerGroup = layerGroups[i];
				let layerGroupTitle = oneLayerGroup && oneLayerGroup.values_ ? oneLayerGroup.values_.title : null;
				let layerGroupLayers = oneLayerGroup && oneLayerGroup.values_ && oneLayerGroup.values_.layers && oneLayerGroup.values_.layers.array_ ? oneLayerGroup.values_.layers.array_ : [];
				if (layerGroupTitle) {
					for (let j = (layerGroupLayers.length-1); j >= 0; j--) {
						let oneLayer = layerGroupLayers [j];
						if (layerCanBeConsulted(oneLayer)) {
							let filterLayer = oneLayer && oneLayer.values_ && oneLayer.values_.title ? getFilterLayerByOriginalLayerTitle(that, oneLayer.values_.title) : null;
							let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
							let filterLayerIsVisible = filterLayer ? filterLayer.getVisible() : false;
							if (oneLayer.getVisible() || (filterLayerInUse && filterLayerIsVisible)) {
								if (filterLayerInUse) {
									layersToConsult.push(filterLayer);
								} else {
									layersToConsult.push(oneLayer)
								}
								that.setActiveLayersToConsult(layersToConsult);
							}
						}
					}
				}
			}
			if (!layersToConsult || layersToConsult.length == 0) {
				that.setMode(null);
			}
		}, 10);
	}
	
	setActiveLayerToEdit(layer) {
		let that = this;

		let layerToEdit = null;
		let filterLayer = layer && layer.values_ && layer.values_.title ? getFilterLayerByOriginalLayerTitle(that, layer.values_.title) : null;
		let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
		let filterLayerIsVisible = filterLayer ? filterLayer.getVisible() : false;
		if (filterLayerInUse && filterLayerIsVisible) {
			layerToEdit = filterLayer;
		} else {
			layerToEdit = layer;
		}

		this._activeLayerToEdit = layerToEdit;
		let layerInUse = this._activeLayerToEdit;
		let layerTitle = "Ninguna";
		this._EDITING_LAYER_DATA = false;
		if (layerToEdit && layerToEdit.values_ && layerToEdit.values_.title) {
			layerTitle = layerToEdit.values_.originalLayerTitle;
		}
		$("#selected-layer-to-edit").html(layerTitle);
		
		if (layerToEdit) {
			if ($(`[layereditselectorlayertitle="${layerTitle}"]`) && !$(`[layereditselectorlayertitle="${layerTitle}"]`).hasClass("layer-switcher-layer-selector-active")) {
				$(`[layereditselectorlayertitle="${layerTitle}"]`).addClass("layer-switcher-layer-selector-active");
				$(`[layereditselectorlayertitle="${layerTitle}"]`).removeClass("layer-switcher-layer-selector-inactive");
			}
			var styleFunctionForSelectedFeatures = function (feature) {
				//Default styles:
				//https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html
				const styles = {};
				const white = [255, 255, 255, 1];
				const blue = [0, 153, 255, 1];
				const width = 3;
				const fillPolygon = new ol.style.Fill({
					color: 'rgba(255,255,255,0.4)',
				});
				const strokePolygon = new ol.style.Stroke({
					color: '#3399CC',
					width: 2,
				});
				styles['Polygon'] = [
					new ol.style.Style({
						image: new ol.style.Circle({
							fill: fillPolygon,
							stroke: strokePolygon,
							radius: 5,
						}),
						fill: fillPolygon,
						stroke: strokePolygon,
					})
				];
				styles['MultiPolygon'] =
					styles['Polygon'];
				styles['LineString'] = [
					new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: '#3399CC',
							width: 5,
						}),
						image: new ol.style.Circle({
							radius: 5,
							fill: new ol.style.Fill({
								color: 'orange'
							})
						}),
						geometry: function (feature, resolution) {
							var geometry = feature.getGeometry();
							var collection = new ol.geom.GeometryCollection();
							var geometries = [geometry];
							geometries.push(new ol.geom.Point(geometry.getFirstCoordinate()));
							geometry.forEachSegment(function (start, end) {
								var point = new ol.geom.Point(end);
								geometries.push(point);
							});
							collection.setGeometries(geometries);
							return collection;
						}
					})
				];
				styles['MultiLineString'] = styles['LineString'];
				styles['Circle'] = styles['Polygon'].concat(
					styles['LineString']
				);
				styles['Point'] = [
					new ol.style.Style({
						image: new ol.style.Circle({
							radius: width * 2,
							fill: new ol.style.Fill({
								color: blue,
							}),
							stroke: new ol.style.Stroke({
								color: white,
								width: width / 2,
							}),
						}),
						zIndex: Infinity,
					}),
				];
				styles['MultiPoint'] =
					styles['Point'];
				styles['GeometryCollection'] =
					styles['Polygon'].concat(
						styles['LineString'],
						styles['Point']
					);

				return styles[feature.getGeometry().getType()];
			};
			
			that.select = new ol.interaction.Select({
	            // Para que sólo pueda seleccionar elementos de la capa en uso
	            layers: function (layerFilter) {
	                if (layerFilter && layerFilter.values_ && layerFilter.values_.layerId && layerInUse && layerInUse.values_ && layerInUse.values_.layerId) {
	                    return (layerFilter.values_.layerId === layerInUse.values_.layerId);
	                } else {
	                    return false;
	                }
	            },
				style: styleFunctionForSelectedFeatures,
				toggleCondition: function (evt) {
	            	// Se puede seleccionar un único elemento a la vez, salvo
					// que el geometryType de capa sea de tipo Polygon, en la
					// que se pueden seleccionar hasta 2.
	            	// LineString?
	            	return that._shiftKeyIsPressed &&
						(!that.selectedFeatures || that.selectedFeatures.length < 2) &&
						// that._activeLayerToEdit && that._activeLayerToEdit.values_ && that._activeLayerToEdit.values_.geometryType == "Polygon";
	            		//Para cuando se pueda mergear lineas
						that._activeLayerToEdit && that._activeLayerToEdit.values_ && that._activeLayerToEdit.values_.canMerge && (that._activeLayerToEdit.values_.geometryType == "Polygon" || that._activeLayerToEdit.values_.geometryType == "LineString");
				}, // ol.events.condition.never,
				hitTolerance: 5
	        });
			that._map.addInteraction(that.select);
			that.selectedFeat = that.select.getFeatures();			
			
			// nuevo interaccion para mover poligonos
			const translate = new ol.interaction.Translate({
			    features: that.select.getFeatures(),
			});
						
			// that._map.addInteraction(that.translate);
			// that._map.getInteractions().extend([that.select, translate]);		

			translate.on('translatestart', function (evt) {
			    evt.features.forEach(function (feature) {
			        originalCoordinates[feature] = feature.getGeometry().getCoordinates();
			    });
			});
			
			translate.on('translateend', async function (evt) {
				console.log("[GeoMvdCoreWeb][wc-map.js] - setActiveLayerToEdit - translate.on 'translateend' | Start");
				console.log("[GeoMvdCoreWeb][wc-map.js] - setActiveLayerToEdit - translate.on 'translateend' | evt:");
				
	            let features = evt.features;
	            let data = getLayerInfo(that, layerTitle);
	            
	            attsDefinition = null;
	            attributes = [];
	            
				if (data && data['nombreTabla']) {
					
					attsDefinition = data['atributos'];
				}
				if (!that._splitting) {
					if (features && features.array_ && features.array_.length == 1) {
						for (let i = 0; i < features.array_.length; i++) {

							let oneFeature = features.array_[i];
							let wkt;
							if (oneFeature.values_.geometry)
								wkt = getWKTFromFeatureFiltro(oneFeature);
							else
								wkt = getWKTFromFeature(oneFeature);
							attributes.push({
								nombre_atributo: "the_geom",
								valor: wkt
							});
							oneFeature.values_['wktGeometry'] = wkt;
							correcto = await validateAttributes(layerTitle, attributes, attsDefinition, that.applyCustomValidations, that);
							hayQuePasarAHistorico = false;
							if (correcto) {
								if (typeof mostrarConfirmarLuegoDeEditarGeometria != "undefined" && mostrarConfirmarLuegoDeEditarGeometria.find(c => (c.layerTitle == layerTitle))) {
									let confirmar = mostrarConfirmarLuegoDeEditarGeometria.find(c => (c.layerTitle == layerTitle));
									alertify.confirm(
										confirmar.titulo,
										confirmar.mensaje,
										function () {
											confirmar.luegoDeConfirmar(that);
											confirmarGuardarLuegoDeTraslado(that, oneFeature);
										},
										function () {
											confirmarGuardarLuegoDeTraslado(that, oneFeature);
										}
									);
								} else {
									confirmarGuardarLuegoDeTraslado(that, oneFeature);
								}
							}
							else{
								oneFeature.getGeometry().setCoordinates(
						                originalCoordinates[oneFeature]
						            );
						            delete originalCoordinates[oneFeature];
							}							
						}
						that.resetEditMode(that);
						
					} else if (features && features.array_ && features.array_.length > 1) {
						alertify.dismissAll();
						alertify.error("Puede editar una geometría a la vez");
					}
				}
	        });
			hayQuePasarAHistorico = false;
            // fin interaccion mover poligonos
			
			
			that.modify = new ol.interaction.Modify({
				condition: function (evt) {
					return that.selectedFeatures && that.selectedFeatures.length == 1;
				},
	            features: that.selectedFeat,
	            deleteCondition: function(event) {
	            	if (that._deletingVertices && that._deletingVertices === true) {
	            		if (event.type == "click") {
	            			return  ol.events.condition.always(event);
		            	}
	            	}
	            }
	        });

			that.selectedFeatures = that.selectedFeat && that.selectedFeat.array_ ? that.selectedFeat.array_ : [];
			that.featuresInUse = [];
			
			let attributes = [];
			let attsDefinition;
			let correcto;
			var originalCoordinates = {};
			that.modify.on('modifystart', function (evt) {
			    evt.features.forEach(function (feature) {
			        originalCoordinates[feature] = feature.getGeometry().getCoordinates();
			    });
			});

			that.modify.on('modifyend', async function (evt) {
				console.log("[GeoMvdCoreWeb][wc-map.js] - setActiveLayerToEdit - modify.on 'modifyend' | Start");
				console.log("[GeoMvdCoreWeb][wc-map.js] - setActiveLayerToEdit - modify.on 'modifyend' | evt:");
				console.log(evt);
				
	            let features = evt.features;
	            let data = getLayerInfo(that, layerTitle);
	            
	            attsDefinition = null;
	            attributes = [];
	            
				if (data && data['nombreTabla']) {
					
					attsDefinition = data['atributos'];
				}
				if (!that._splitting) {
					if (features && features.array_ && features.array_.length == 1) {
						for (let i = 0; i < features.array_.length; i++) {

							let oneFeature = features.array_[i];
							let wkt;
							if (that.modify.features_.array_[0].values_.geometry)
								wkt = getWKTFromFeatureFiltro(oneFeature);
							else
								wkt = getWKTFromFeature(oneFeature);
							attributes.push({
								nombre_atributo: "the_geom",
								valor: wkt
							});
							oneFeature.values_['wktGeometry'] = wkt;

							correcto = await validateAttributes(layerTitle, attributes, attsDefinition, that.applyCustomValidations, that);
							
							if (correcto){
								let changeToProcess = new PendingChange("UPDATE", that._activeLayerToEdit, oneFeature, "PENDING", false, true);
								that.addPendingChange(that, changeToProcess);
								if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
									that.processPendingChanges(that);
								}
	
								const id = oneFeature.id_;
								const index = that.featuresInUse.findIndex(f => f.id_ === id);
								if (index !== -1) {
									that.featuresInUse.splice(index, 1); // Si
																			// la
																			// feature
																			// ya
																			// estaba,
																			// la
																			// saco
								}
								if (!that._deletingVertices) {
									that.featuresInUse.push(oneFeature);
								}
							}
							else{
								oneFeature.getGeometry().setCoordinates(
						                originalCoordinates[oneFeature]
						            );
						            delete originalCoordinates[oneFeature];
							}
							
						}
						//esta pisada es para que no resetee cuando estamos borrando vertices
						if (!that._deletingVertices) {
							that.resetEditMode(that);
						}
						
					} else if (features && features.array_ && features.array_.length > 1) {
						alertify.dismissAll();
						alertify.error("Puede editar una geometría a la vez");
					}
				}
	        });

			let canEditGeometry = layerInUse && layerInUse.values_ ? layerInUse.values_.geomEdit : true;
			let canTranslateGeometry = canEditGeometry && layerInUse.values_.geometryType && layerInUse.values_.geometryType.toUpperCase() == "POINT";
			
			if (canEditGeometry) {
				that._map.addInteraction(that.modify);
				//that._map.addInteraction(translate);
			}
			if (canTranslateGeometry) {
				that._map.addInteraction(translate);
			}

	        let layerAllowDeleteItem = layerInUse && layerInUse.values_ ? layerInUse.values_.baja : true;
	        let layerAllowDeleteVertices = layerInUse && layerInUse.values_ && layerInUse.values_.geometryType && layerInUse.values_.geometryType.toUpperCase() != "POINT" && layerInUse.values_.canDeleteVertex;
	        let canSplit = layerInUse && layerInUse.values_ && layerInUse.values_.geometryType && layerInUse.values_.geometryType.toUpperCase() == "LINESTRING" && layerInUse.values_.canSplit;
			let layerAllowNewItem = layerInUse && layerInUse.values_ ? layerInUse.values_.alta : true;
			let canClone = layerInUse && layerInUse.values_ ? layerInUse.values_.canClone : true;
			// let canMerge = layerInUse && layerInUse.values_ && layerInUse.values_.geometryType && layerInUse.values_.geometryType.toUpperCase() == "POLYGON";
			//Para cuando se pueda mergear lineas
			let canMerge = layerInUse && layerInUse.values_ && layerInUse.values_.canMerge && layerInUse.values_.geometryType && (layerInUse.values_.geometryType.toUpperCase() == "POLYGON" || layerInUse.values_.geometryType.toUpperCase() == "LINESTRING");
			
			var selectedFeatures = that.select.getFeatures();
			
		    selectedFeatures.on('add', function(event) {
		      var feature = event.target.item(0);
		      let cantidad = that.select.getFeatures().array_.length;
		      // console.log("Agrego: cantidad " + cantidad);
		      	
				if (typeof habilitarEdit == 'function') {
					if (habilitarEdit(that)) {
						$("#edit-data-button").removeClass("disabled");
					}
				} else {
					$("#edit-data-button").removeClass("disabled");
				}
				if (layerAllowDeleteItem) {
					if (typeof habilitarDelete == 'function') {
						if (habilitarDelete(that))
							$("#delete-button").removeClass("disabled");
					} else {
						$("#delete-button").removeClass("disabled");
					}
				}
		      	if(layerAllowDeleteVertices){
		      		$("#remove-vertex-button").removeClass("disabled");
		      	}
		      	if(canSplit){
		      		$("#split-button").removeClass("disabled");
		      	}
		      	if(canClone){
		      		$("#copy-button").removeClass("disabled");
		      	}
		      	if(canMerge){
		      		$("#merge-button").removeClass("disabled");
		      	}
		      	if(canEditGeometry){
		      		$("#snap-in-button").removeClass("disabled");
		      		if (that.snaps && that.snaps.length > 0) {
		      			$("#snap-in-button").addClass("activated");
		      		}
		      	}
		    });

		    // when a feature is removed, clear the photo-info div
		    selectedFeatures.on('remove', function(event) {
		    	let cantidad = that.select.getFeatures().array_.length;
		    	// console.log("quito: cantidad " + cantidad);
		    	if(cantidad==0)
	    		{
		    		$("#edit-data-button").addClass("disabled");
		    		
		    		if(layerAllowDeleteItem){
			      		$("#delete-button").addClass("disabled");
			      	}
			      	if(layerAllowDeleteVertices){
			      		$("#remove-vertex-button").addClass("disabled");
			      	}
			      	if(canSplit){
			      		$("#split-button").addClass("disabled");
			      	}
			      	if(canClone){
			      		$("#copy-button").addClass("disabled");
			      	}
			      	if(canMerge){
			      		$("#merge-button").addClass("disabled");
			      	}
			      	if(canEditGeometry){			      		
			      		$("#snap-in-button").removeClass("activated");
			      		$("#snap-in-button").addClass("disabled");
			      	}
	    		}
		    });
			
			that.addSecondaryMenu(layerAllowDeleteItem, layerAllowDeleteVertices, canSplit, layerAllowNewItem, canClone, canMerge,canEditGeometry);
		}
	}
	
	setActiveLayerToAdd(layer) {
		this._activeLayerToAdd = layer;
		this.selectedFeatures = [];
		this.selectedFeat = null;
		let layerTitle = "Ninguna";
		if (layer && layer.values_ && layer.values_.title) {
			layerTitle = layer.values_.originalLayerTitle;
		}
		// $("#selected-layer-to-add").html(layerTitle);
		
		if (layer) {
			let that = this;
			let filterLayer = layer && layer.values_ && layer.values_.title ? getFilterLayerByOriginalLayerTitle(that, layer.values_.title) : null;
			let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
			let filterLayerIsVisible = filterLayer ? filterLayer.getVisible() : false;
			if (filterLayerInUse && filterLayerIsVisible) {

				this._activeLayerToAdd = filterLayer;
			}
			let layerToAdd = this._activeLayerToAdd;

		    let source = layerToAdd.getSource();
	        let layerValues = layerToAdd && layerToAdd.values_ ? layerToAdd.values_ : null;
	        if (layerValues) {
	            this.draw = new ol.interaction.Draw({
	                features: layerToAdd.getSource().getFeatures(),
	                type: layerToAdd.values_.geometryType // layer.type //
															// Point ||
															// LineString ||
															// Polygon || Circle
	            });
	            this.draw.on('drawend', function(evt) {
	                let feature = evt.feature;
	                feature.set('bin', 0);
	                idNotFunddatetimelocal = [];
	                that.featuresInUse = [];
	                that.featuresInUse.push(feature);
	                openLayerDataPopup(that, layerToAdd, feature.values_, true);
	                time = 0;
	                setTimeout(setdatetimepicker, 3000);
	                setTimeout(notEnter, 1000);
	            });
	            this._map.addInteraction(this.draw);
	        } else {
	            this.showMessage("Error", "<p>No se ha podido acceder a los datos de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1001.</small></p>");
	        }
		}
	}

	changeModeFromChildrenData(context, id, mode) {
		if (context.childrenToSave && context.childrenToSave.length > 0) {
			for (let i = 0; i < context.childrenToSave.length; i++) {
				if (context.childrenToSave[i].id == id) {
					if(mode == "delete") {
						if (context.childrenToSave[i].mode == "insert") {
							context.childrenToSave.splice(i, 1);
						} else {
							context.childrenToSave[i].mode = "delete";
						}
					} else if (mode == "update") {
						if (context.childrenToSave[i].mode != "insert") {
							context.childrenToSave[i].mode = mode;
						}
					} else {
						context.childrenToSave[i].mode = mode;
					}
					break;
				}
			}
		}
	}

	setActiveLayersToConsult(layers) {
		this._activeLayersToConsult = layers;
	}
	
	setMode(mode) {
		let that = this;
		let actualMode = this._mode;
		let modeDescription = "Ninguno";
		let hasError = false;
		let hasToClearModeAndInteractions = false;
		
		this._deletingVertices = false;
		
		$("#clear-selected-mode").removeClass("clear-selected-mode-hidden");
		
		if (!mode || (mode && mode == actualMode)) {
			hasToClearModeAndInteractions = true;
		} else if (mode && actualMode != mode) {
			if (mode == "INFO") {
				if (!this._activeLayersToConsult || this._activeLayersToConsult.length == 0) {
					let title = "Error";
					let content = "Primero debe encender alguna capa consultable.";
					let okAction = null;
					let cancelAction = null;
					let okButtonText = null;
					let cancelButtonText = "Cerrar";
					let cancelButtonMustCloseModal = true;
					let okButtonMustCloseModal = null;
					let size = null;
					let backdrop = true;
					let keyboard = true;
					this.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
					
					hasError = true;
				} else {
					this._map.removeInteraction(this.select);
					this._map.removeInteraction(this.modify);
					this._map.removeInteraction(this.draw);
					this._map.removeInteraction(this.translate);
					modeDescription = "Consulta";
				}
			} else if (mode == "EDIT") {
				if (!this._activeLayerToEdit) {
					let title = "Error";
					let content = "Primero debe seleccionar la capa para editar.";
					let okAction = null;
					let cancelAction = null;
					let okButtonText = null;
					let cancelButtonText = "Cerrar";
					let cancelButtonMustCloseModal = true;
					let okButtonMustCloseModal = null;
					let size = null;
					let backdrop = true;
					let keyboard = true;
					this.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

					hasError = true;
				} else {
					this._map.removeInteraction(this.draw);
					modeDescription = "Edición";
				}
			} else if (mode == "ADD") {
				if (!this._activeLayerToAdd) {
					let title = "Error";
					let content = "Primero debe seleccionar la capa para agregar.";
					let okAction = null;
					let cancelAction = null;
					let okButtonText = null;
					let cancelButtonText = "Cerrar";
					let cancelButtonMustCloseModal = true;
					let okButtonMustCloseModal = null;
					let size = null;
					let backdrop = true;
					let keyboard = true;
					this.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

					hasError = true;
				} else {
					modeDescription = "Alta";
				}
			}
			
			if (!hasError) {
				this._mode = mode;
				if (!mode) {
					$("#clear-selected-mode").addClass("clear-selected-mode-hidden");
				}
			} else {
				hasToClearModeAndInteractions = true;
			}
		}

		if (hasToClearModeAndInteractions) {
			this._mode = null;
			this._map.removeInteraction(this.select);
			this._map.removeInteraction(this.modify);
			this._map.removeInteraction(this.draw);
			this._map.removeInteraction(this.translate);
			$("#clear-selected-mode").addClass("clear-selected-mode-hidden");
			this.clearSelectedLayerToEdit();
			this.clearSelectedLayerToAdd();
			this.removeSecondaryMenu(this);
			if(this.select && this.select.getFeatures())
			{
				this.select.getFeatures().clear();			
			}
		}
		
		$("#selected-mode").html(modeDescription);
	}
	
	clearSelectedLayerToEdit() {
		this._activeLayerToEdit = null;
		let layerSwitcherLayerEditSelectors = $(".layer-switcher-layer-edit-selector.layer-switcher-layer-selector-active");
		if (layerSwitcherLayerEditSelectors && layerSwitcherLayerEditSelectors.length > 0) {
			$(layerSwitcherLayerEditSelectors[0]).removeClass("layer-switcher-layer-selector-active");
			$(layerSwitcherLayerEditSelectors[0]).addClass("layer-switcher-layer-selector-inactive");
		}
		this.setActiveLayerToEdit(null);
	}
	
	clearSelectedLayerToAdd() {
		this._activeLayerToAdd = null;
		let layerSwitcherLayerAddSelectors = $(".layer-switcher-layer-add-selector.layer-switcher-layer-selector-active");
		if (layerSwitcherLayerAddSelectors && layerSwitcherLayerAddSelectors.length > 0) {
			$(layerSwitcherLayerAddSelectors[0]).removeClass("layer-switcher-layer-selector-active");
			$(layerSwitcherLayerAddSelectors[0]).addClass("layer-switcher-layer-selector-inactive");
		}
		this.setActiveLayerToAdd(null);
	}

    addButtonPressed(context) {
        let that = context;
	    let actualMode = that._mode;
        let layer = that._activeLayerToEdit;
        if (actualMode == "ADD") {
        	$("#add-button").removeClass("activated");
			that.setActiveLayerToAdd(null);
			that.resetEditMode(that);
        } else  if (actualMode == "EDIT"){
        	$("#add-button").addClass("activated");
            that.setActiveLayerToAdd(layer);
            that.setMode("ADD");
            alertify.notify("Para salir del modo alta, presione nuevamente el botón (+).");
        }
        that.refreshSnapInteractions(that);
	}

	async saveFormDataChanges(context) {
		let that = context || this;
		let layer = null;
		// Oculto todas las notificaciones que tenia de antes
		alertify.dismissAll();
		if (that._mode == "ADD") {
			layer = that._activeLayerToAdd;
			let feature = that.featuresInUse[0];
		    let layerValues = layer && layer.values_ ? layer.values_ : null;
		    let format = new ol.format.WFS({featureNS:layerValues.layerWorkspace, featureType:layerValues.layerName});
		    
		    let layerTitle = layerValues.originalLayerTitle;
		    let pknombre = getLayerPK(that,layerTitle);
		    // Get atributos del layer
        	$.ajax({
        		type: "GET",
                url: WCMapGetLayerURL + '?capa=' + layerTitle,
            	success: async function(data) {
            		if (data && data['nombreTabla']) { 
            			let fidName;
            			for (var attName in data['atributos']) {
            				if (data['atributos'][attName]["tipo"]==="java.lang.String") {
        				    	fidName = data['atributos'][attName]["nombre_bd"];	// Me
																					// quedo
																					// con
																					// el
																					// primer
																					// campo
																					// String
																					// para
																					// usar
																					// como
																					// fid
																					// temporal
        				    	break;
        				    }
        				}
            			//debugger;
            			let layerTableName = data['nombreTabla'];
            			let layerPkName = pknombre;
            			let method = "insert";
            			let Origen_datos = data['Origen_datos'];
            			let dbms = data['dbms'];
            			let attsDefinition = data['atributos'];

            			let attributes = [];
            			
            			for (let i = 0; i < that.attributesToSave.length; i++) {
            				let attributeDatabaseColumnName = that.attributesToSave[i];
            				
            				let inputValue = $(`#input-${attributeDatabaseColumnName}`).val();
            				
            				//BUSCO LA DEFINICION DE ESE ATRIBUTO EN LA CAPA PARA VALIDAR EL TIPO DEL ATT
    						for (var attName in data['atributos']) {
    							if (data['atributos'][attName]["nombre_bd"]===attributeDatabaseColumnName) {	
    								if (data['atributos'][attName]["usage"]==="LOV_IS_LAZY"){
    									if(inputValue!=="")
										{
    										inputValue = document.querySelector("#input-"+attributeDatabaseColumnName+"-list option[value='"+inputValue+"']").dataset.value;
										}
    								}
    								break;
    							}
    						}
            				
            				if (inputValue===""){	// Si es un valor vacio
	            				for (var attName2 in data['atributos']) {
	            				    if (data['atributos'][attName]["nombre_bd"]===attributeDatabaseColumnName) {	// Busco
																													// la
																													// definicion
																													// de
																													// ese
																													// atributo
																													// en
																													// la
																													// capa
																													// para
																													// validar
																													// el
																													// tipo
																													// del
																													// att
	            				    	if (data['atributos'][attName]["tipo"]==="java.util.Date")
	            				    		inputValue = null;	// La fecha
																// vacía en
																// realidad debe
																// ir un NULL
	            				    	break;
	            				    }
	            				}
            				} else {
            					let type = $(`#input-${attributeDatabaseColumnName}`) && $(`#input-${attributeDatabaseColumnName}`)[0] && $(`#input-${attributeDatabaseColumnName}`)[0].attributes && $(`#input-${attributeDatabaseColumnName}`)[0].attributes.type && $(`#input-${attributeDatabaseColumnName}`)[0].attributes.type.nodeValue ? $(`#input-${attributeDatabaseColumnName}`)[0].attributes.type.nodeValue : null;
                				if (type == "datetime-local" && !Modernizr.inputtypes['datetime-local']){
                					inputValue = inputValue.replace(" ","T")
                				}
            				}

							feature.values_[attributeDatabaseColumnName] = inputValue;
							
            				if (!data['atributos'][attName]["read_only"]) {
            					attributes.push({
            						nombre_atributo: attributeDatabaseColumnName,
            						valor: inputValue,
									valor_original: inputValue
            					});
            				}	
            				
            				if (dbms == "ORACLE"){
            					attributeDatabaseColumnName = attributeDatabaseColumnName.toUpperCase();
            					feature.values_[attributeDatabaseColumnName] = inputValue;
            				}
            				
            				
            			}

            			let wkt = getWKTFromFeature(feature);
            			attributes.push({
    						nombre_atributo: "the_geom",
    						valor: wkt
    					});

            			let correcto = await validateAttributes(layerTitle, attributes, attsDefinition, that.applyCustomValidations, that);

            			if (correcto) {
							feature.values_["the_geom"] = wkt;

							let changeToProcess = new PendingChange("CREATE", layer, feature, "PENDING", false, true);
							layer.getSource().addFeature(feature);
							that.addPendingChange(that, changeToProcess);
							that.closePopup();
							if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
								that.processPendingChanges(that);
							}
						}
        			} else {
        				console.error(error);
        				that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1016.</small></p>");
    				}
        		}
        	});
		} else if (that._mode == "EDIT") {
			//debugger;
			layer = that._activeLayerToEdit;
			
			let layerValues = layer && layer.values_ ? layer.values_ : null;
			// let layerTableName = layereValues.databaseTableName
	        if (that._EDITING_LAYER_DATA) {
	        	let layerTitle = layerValues.originalLayerTitle;
	        	let pknombre = getLayerPK(that,layerTitle);
	        	let data = getLayerInfo(that, layerTitle);
				if (data && data['nombreTabla']) {
					let layerTableName = data['nombreTabla'];
					let Origen_datos = data['Origen_datos'];
					let dbms = data['dbms'];
					let layerPkName = pknombre;
					let method = "update";
					let childFKName = data['child'] ? data['child']['parent_id_attribute'] : null;
					let attributes = [];
					let attsDefinition = data['atributos'];

					for (let i = 0; i < that.attributesToSave.length; i++) {
						
						let attributeDatabaseColumnName = that.attributesToSave[i];
						let inputValue = $(`#input-${attributeDatabaseColumnName}`).val();
						let originalValue = $(`#input-${attributeDatabaseColumnName}`).attr('originalValue');
						
						//BUSCO LA DEFINICION DE ESE ATRIBUTO EN LA CAPA PARA VALIDAR EL TIPO DEL ATT
						for (var attName in data['atributos']) {
							if (data['atributos'][attName]["nombre_bd"]===attributeDatabaseColumnName) {	
								if (data['atributos'][attName]["usage"]==="LOV_IS_LAZY"){
									
									if(inputValue!=="")
									{
										inputValue = document.querySelector("#input-"+attributeDatabaseColumnName+"-list option[value='"+inputValue+"']").dataset.value;
									}
								}
								break;
							}
						}
						
						
						// considerar que input-fecha_hasta_ubic_deshabilitada
						// se le pone ese valor por defecto. Así evitamos error
						// JS
						if (inputValue==="" || inputValue == "__/__/____ __:__"){	// Si
																					// es
																					// un
																					// valor
																					// vacio
							for (var attName in data['atributos']) {
								if (data['atributos'][attName]["nombre_bd"]===attributeDatabaseColumnName) {	// Busco
																												// la
																												// definicion
																												// de
																												// ese
																												// atributo
																												// en
																												// la
																												// capa
																												// para
																												// validar
																												// el
																												// tipo
																												// del
																												// att
									if (data['atributos'][attName]["tipo"]==="java.util.Date")
										inputValue = null;	// La fecha vacía en
															// realidad debe ir
															// un NULL
									if (data['atributos'][attName]["tipo"]==="java.lang.Integer")
										inputValue = null;	// La fecha vacía en
															// realidad debe ir
															// un NULL
									break;
								}
							}
						}
						else {
							let t = $(`#input-${attributeDatabaseColumnName}`)[0];
							if (t != undefined && t.attributes && t.attributes.type){
								let type = $(`#input-${attributeDatabaseColumnName}`)[0].attributes.type.nodeValue;
								if (type == "datetime-local" ){
									if ( !Modernizr.inputtypes['datetime-local']){
										inputValue = formatoFechafecha(inputValue,true);
									}
									else
									{
										inputValue = formatoFechafecha(inputValue,false);
									}
								}
							}
						}
						if (that.selectedFeatures[0] && that.selectedFeatures[0].values_) {
							that.selectedFeatures[0].values_[attributeDatabaseColumnName] = inputValue;
						}

						attributes.push({
							nombre_atributo: attributeDatabaseColumnName,
							valor: inputValue,
							originalValue: originalValue
						});
					}
					
					let correcto = await validateAttributes(layerTitle, attributes, attsDefinition, that.applyCustomValidations, that);

        			if (correcto) {
						let isValid = true;
						let changeToProcess = new PendingChange("UPDATE", that._activeLayerToEdit, that.selectedFeatures[0], "PENDING", false, true);

						if (that.childrenToSave && that.childLayerToSave) {
							let child =  new PendingChangeChildrenData(that.childLayerToSave.nombreTabla, childFKName, that.childLayerToSave.pk);
							changeToProcess.setChildren(child);
							//debugger;
							for (let i = 0; i < that.childrenToSave.length; i++) {
								let oneChildToSave = that.childrenToSave[i];
								oneChildToSave['newData'] = {};
								let mode = oneChildToSave.mode;
								let id = oneChildToSave.id;
								let idFinal = id.split("-")[id.split("-").length-1];
								
								let childOriginalData = oneChildToSave.originalData;
								let pkValue = childOriginalData ? childOriginalData[that.childLayerToSave.pk] : null;

								if ((mode == "insert" && !oneChildToSave.isNewAndReadOnly) || mode == "update" || mode == "delete") {
									let atributos = null;

									//if (mode != "delete") {
										atributos = [];
										let childAttributesToSave = that.childLayerToSave.atributos;
										if (childAttributesToSave) {
											for (let key in childAttributesToSave) {
												let oneChildAttributeToSave = childAttributesToSave[key];
												if (oneChildAttributeToSave.show !== false && oneChildAttributeToSave.read_only !== true) {
													let attributeDatabaseColumnName = oneChildAttributeToSave.nombre_bd;
													//let inputValue = $(`#input-${attributeDatabaseColumnName}-${idFinal}`).val();
													//debugger
													let inputValue;
													if(mode == "delete"){
														inputValue = that.childrenToSave[i].originalData[attributeDatabaseColumnName];
														inputValue = (inputValue?inputValue:that.childrenToSave[i].originalData[attributeDatabaseColumnName.toUpperCase()]);
													}
													else{
														inputValue = $(`#input-${attributeDatabaseColumnName}-${idFinal}`).val();
														if(oneChildAttributeToSave.usage==="LOV_IS_LAZY"){
															if(inputValue!=="")
															{
																inputValue = document.querySelector("#input-"+attributeDatabaseColumnName+"-"+idFinal+"-list option[value='"+inputValue+"']").dataset.value;
															}
														}
													}
													
													atributos.push({nombre_atributo: attributeDatabaseColumnName, valor: inputValue});
													oneChildToSave.newData[attributeDatabaseColumnName] = inputValue;
												}
											}
										//}
										isValid = await validateChildAttributes(that.childLayerToSave['Nombre Capa'], atributos, childAttributesToSave, that.applyCustomValidations, that, {children: that.childrenToSave[i]}) && isValid;
									}

									child.hijos.push(new PendingChangeChild(mode, pkValue, atributos));
								}
							}
						}

						if (isValid) {
							layer.getSource().refresh();
							that.addPendingChange(that, changeToProcess);
							that.closePopup();
							if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
								that.processPendingChanges(that);
							}
						}
					}
				} else {
					that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1013.</small></p>");
				}
	        }
		}
	}
	
	addSecondaryMenu(canDelete, canDeleteVertices, canSplit, canAdd, canClone, canMerge, canEditGeometry) {
		let html = ``;

		html += `<button id="add-button" class="secondary-menu-button ${!canAdd ? 'disabled': ''}" data-toggle="tooltip" title="Agregar elemento"><i class="fas fa-plus"></i></button>`;
        html += `<button id="edit-data-button" class="secondary-menu-button" data-toggle="tooltip" title="Editar datos"><i class="fa fa-list-alt"></i></button>`;
		html += `<button id="delete-button" class="secondary-menu-button mr-15 ${!canDelete ? 'disabled': ''}" data-toggle="tooltip" title="Eliminar"><i class="fa fa-trash-alt"></i></button>`;

        html += `<button id="split-button" class="secondary-menu-button ${!canSplit ? 'disabled': ''}" data-toggle="tooltip" title="Partir línea"><i class="fa fa-cut"></i></button>`;
    	html += `<button id="remove-vertex-button" class="secondary-menu-button ${!canDeleteVertices ? 'disabled': ''}" data-toggle="tooltip" title="Remover vértice"><i class="fa fa-times-circle"></i></button>`;
    	html += `<button id="copy-button" class="secondary-menu-button ${!canClone ? 'disabled': ''}" data-toggle="tooltip" title="Clonar elemento"><i class="fa fa-clone"></i></button>`;
    	html += `<button id="snap-in-button" class="secondary-menu-button ${!canEditGeometry ? 'disabled': ''}" data-toggle="tooltip" title="Encajar vértices"><i class="fas fa-magnet"></i></button>`;
    	html += `<button id="merge-button" class="secondary-menu-button mr-15 ${!canMerge ? 'disabled': ''}" data-toggle="tooltip" title="Pegar polígono/línea"><i class="fa fa-object-group"></i></button>`;

    	html += `<button id="save-button" class="secondary-menu-button" data-toggle="tooltip" title="Guardar cambios"><i class="fa fa-save"></i></button>`;
        html += `<button id="cancel-button" class="secondary-menu-button" data-toggle="tooltip" title="Descartar cambios"><i class="fa fa-ban"></i></button>`;

        $("#new-buttons-container").html(html);

        let that = this;

		if (canAdd) {
			if ($("#add-button:not(.disabled)")) {
				$("#add-button:not(.disabled)").click(function () {
					that.addButtonPressed(that);
				});
			}
		}

		$("#cancel-button").addClass("disabled");
        $("#cancel-button").click(function() {
        	if (!$(this).hasClass("disabled")) {
        		if (that.hasPendingChanges(that)) {
    				alertify.confirm(
    					'Descartando cambios',
    					'¿Seguro que desea cancelar los cambios?',
    					function() {
    						that.cancelPendingChanges(that);
    						alertify.success("Todos los cambios han sido descartados.");
    						that.resetEditMode(that);
    					},
    					function() {
    						alertify.notify('Los cambios continuarán pendientes de guardar o descartar.', 'custom', 4, function(){});
    					}
    				);
    			} else {
    				alertify.dismissAll();
    				alertify.error("No tiene cambios pendientes para descartar.");
    			}
        	}
        });

        $("#edit-data-button").addClass("disabled");
        $("#edit-data-button").click(function() {
        	if (!$(this).hasClass("disabled")) {
        		that._EDITING_LAYER_DATA = true;
            	that.editLayerData(that);
        	}
        });

        $("#save-button").addClass("disabled");
        $("#save-button").click(function() {
        	if (!$(this).hasClass("disabled")) {
        		if (that.hasPendingChanges(that)) {
    				alertify.confirm(
    					'Guardando cambios',
    					'¿Seguro que desea guardar los cambios?',
    					function() {
    						that.processPendingChanges(that);
    					},
    					function() {
    						alertify.notify('Los cambios continuarán pendientes de guardar o descartar.', 'custom', 4, function(){});
    					}
    				);
    			} else {
    				alertify.dismissAll();
            		alertify.error("No tiene cambios pendientes para guardar.");
    			}
        	}
		});

        /*
		 * if (canDelete) { if ($("#delete-button:not(.disabled)")) {
		 * $("#delete-button:not(.disabled)").click(function() { if
		 * (that.selectedFeatures && that.selectedFeatures.length > 0) { if
		 * (that.selectedFeatures.length == 1) { alertify.confirm( 'Eliminar
		 * elemento', '¿Seguro que desea eliminar el elemento?', function() {
		 * let changeToProcess = new PendingChange("DELETE",
		 * that._activeLayerToEdit, that.selectedFeatures[0], "PENDING", false,
		 * true); that.addPendingChange(that, changeToProcess); if
		 * (changeToProcess && changeToProcess.layer &&
		 * changeToProcess.layer.getSource()) {
		 * changeToProcess.feature.setStyle(new ol.style.Style({})); //
		 * changeToProcess.layer.getSource().removeFeature(changeToProcess.feature); }
		 * if (that.select && that.select.getFeatures()) {
		 * that.select.getFeatures().clear(); } if (changeToProcess &&
		 * changeToProcess.layer && changeToProcess.layer.values_ &&
		 * changeToProcess.layer.values_.autocommit) {
		 * that.processPendingChanges(that); } }, function() { } ); } else {
		 * alertify.dismissAll(); alertify.error("Debe seleccionar un único
		 * elemento para poder eliminar."); } } else { alertify.dismissAll();
		 * alertify.error("Debe seleccionar el elemento que desea eliminar."); }
		 * }); } }
		 */
        
        $("#delete-button").addClass("disabled");
		$("#delete-button").click(function() {
			if (!$(this).hasClass("disabled")) {
				if (that.selectedFeatures && that.selectedFeatures.length > 0) {
					if (that.selectedFeatures.length == 1) {
						alertify.confirm(
							'Eliminar elemento',
							'¿Seguro que desea eliminar el elemento?',
							async function() {
							    //debugger;
								let puedoBorrar = true;
								let layer = that._activeLayerToEdit;
								let layerValues = layer && layer.values_ ? layer.values_ : null;
						        let layerTitle = layerValues.originalLayerTitle;
								let attsDefinition = null;
					            let attributes = [];
					            let pknombre = getLayerPK(that,layerTitle);
					            
					            //CONTROLO SI TENGO ESTA INFO PARA VER SI TENGO QUE VALIDAR AL BORRAR
					            if(layerValues){
					            	if (layerValues.dbms == "ORACLE" && that.selectedFeatures[0].values_[pknombre]){
						            	attributes.push({
											nombre_atributo: pknombre,
											valor: that.selectedFeatures[0].values_[pknombre],
											originalValue: that.selectedFeatures[0].values_[pknombre],
							            	modoInterno:"DELETE"
										});
						    		}
						            else if(that.selectedFeatures[0].values_[pknombre]){
						            	attributes.push({
											nombre_atributo: pknombre,
											valor: that.selectedFeatures[0].values_[pknombre],
											originalValue: that.selectedFeatures[0].values_[pknombre],
							            	modoInterno:"DELETE"
										});
						            }
					            	puedoBorrar = await validateAttributes(layerTitle, attributes, attsDefinition, that.applyCustomValidations, that);
					            }
					            hayQueEjecutarAccionLuegoDeBorrar = false;
								if(puedoBorrar){
									if (typeof mostrarConfirmarLuegoDeBorrar != "undefined" && mostrarConfirmarLuegoDeBorrar.find(c => (c.layerTitle == layerTitle))) {
										let confirmar = mostrarConfirmarLuegoDeBorrar.find(c => (c.layerTitle == layerTitle));
										//debugger;
										let confirmarMuestroAlertify = await confirmar.muestroAlertify(that);
										console.log(confirmarMuestroAlertify);
										if(confirmarMuestroAlertify == true){
											console.log("entro en el if de confirmar.muestroAlertify");
											alertify.confirm(
													confirmar.titulo,
													confirmar.mensaje,
													function () {
														console.log("entro en el confirmar");
														confirmar.luegoDeConfirmar(that);
														confirmarGuardarLuegoDeBorrar(that, that.selectedFeatures[0]);
													},
													function () {
														console.log("entro en el cancelar");
													}
												);
										}
										else{
											console.log("entro en el else de confirmar.muestroAlertify");
											confirmarGuardarLuegoDeBorrar(that, that.selectedFeatures[0]);
										}
									} else {
										confirmarGuardarLuegoDeBorrar(that, that.selectedFeatures[0]);
									}
								}
							},
							function() {
							}
						);
					} else {
						alertify.dismissAll();
						alertify.error("Debe seleccionar un único elemento para poder eliminar.");
					}
				} else {
					alertify.dismissAll();
					alertify.error("Debe seleccionar el elemento que desea eliminar.");
				}
			}
		});

		/*
		 * if (canClone) { $("#copy-button").click(function() { if
		 * (that.selectedFeatures && that.selectedFeatures[0]) {
		 * that.cloneFeatures(that, that.selectedFeatures); } else {
		 * alertify.dismissAll(); alertify.error("Debe seleccionar el elemento
		 * que desea clonar."); } }); }
		 */
		
		$("#copy-button").addClass("disabled");
		$("#copy-button").click(function() {
			if (!$(this).hasClass("disabled")) {
				if (that.selectedFeatures && that.selectedFeatures[0]) {
					that.cloneFeatures(that, that.selectedFeatures);
				} else {
					alertify.dismissAll();
					alertify.error("Debe seleccionar el elemento que desea clonar.");
				}
			}
		});
		
        /*
		 * if (canDeleteVertices) { $("#remove-vertex-button").click(function() {
		 * if (that.selectedFeatures && that.selectedFeatures[0]) { if
		 * (!that._deletingVertices) { that.showVerticesToDelete(that); }
		 * that._deletingVertices = !that._deletingVertices; } else {
		 * alertify.dismissAll(); alertify.error("Debe seleccionar el elemento
		 * con el cual desea trabajar."); } }); }
		 */
		
		$("#remove-vertex-button").addClass("disabled");
		$("#remove-vertex-button").click(function() {
			if (!$(this).hasClass("disabled")) {
				if (that.selectedFeatures && that.selectedFeatures[0]) {
					if (!that._deletingVertices) {
						$("#remove-vertex-button").addClass("activated");
						that.showVerticesToDelete(that);
					} else {
						$("#remove-vertex-button").removeClass("activated");
						that._map.addInteraction(that.select);
					}
					that._deletingVertices = !that._deletingVertices;
				} else {
					alertify.dismissAll();
					alertify.error("Debe seleccionar el elemento con el cual desea trabajar.");
				}
			}
        });
        
        /*
		 * if (canSplit) { $("#split-button").click(function() { if
		 * (that.selectedFeatures && that.selectedFeatures[0]) { if
		 * (!that._splitting) { that.addSplitInteraction(that); }
		 * that._splitting = !that._splitting; } else { alertify.dismissAll();
		 * alertify.error("Debe seleccionar el elemento con el cual desea
		 * trabajar."); } }); }
		 */
		
		$("#split-button").addClass("disabled");
		$("#split-button").click(function() {
			if (!$(this).hasClass("disabled")) {
				if (that.selectedFeatures && that.selectedFeatures[0]) {					
					if (!that._splitting) {
						$("#split-button").addClass("activated");
						that.addSplitInteraction(that);
					} else {
						$("#split-button").removeClass("activated");
						if (that.split){
							that._map.removeInteraction(that.split);
						}
					}
					that._splitting = !that._splitting;
				} else {
					alertify.dismissAll();
					alertify.error("Debe seleccionar el elemento con el cual desea trabajar.");
				}
			}
        });

		/*
		 * if (canMerge) { if ($("#merge-button:not(.disabled)")) {
		 * $("#merge-button:not(.disabled)").click(function () { if
		 * (that.selectedFeatures && that.selectedFeatures.length > 0) { if
		 * (that.selectedFeatures.length == 2) { that.mergeFeatures(that); }
		 * else { alertify.dismissAll(); alertify.error("Debe tener dos
		 * elementos selecionados para poder pegar."); } } else {
		 * alertify.dismissAll(); alertify.error("Debe seleccionar los elementos
		 * que desea pegar."); } }); } }
		 */
		
		$("#merge-button").addClass("disabled");
		$("#merge-button").click(function () {
			if (!$(this).hasClass("disabled")) {
				if (that.selectedFeatures && that.selectedFeatures.length > 0) {
					if (that.selectedFeatures.length == 2) {
						that.mergeFeatures(that);
					} else {
						alertify.dismissAll();
						alertify.error("Debe tener dos elementos selecionados para poder pegar.");
					}
				} else {
					alertify.dismissAll();
					alertify.error("Debe seleccionar los elementos que desea pegar.");
				}
			}
		});

		/*
		 * if ($("#snap-in-button:not(.disabled)")) {
		 * $("#snap-in-button:not(.disabled)").click(function () { if
		 * (that._mode == "ADD" || that._mode == "EDIT") { if (that.snaps &&
		 * that.snaps.length > 0) { that.clearSnapInteractions(that);
		 * alertify.notify('El cursor ya no se verá arrastrado por las
		 * geometrías existentes.'); } else { that._snapInWithMultipleSources =
		 * that._shiftKeyIsPressed; that.createSnapInteractions(that);
		 * 
		 * if (!that._snapInWithMultipleSources) { alertify.notify('El cursor se
		 * verá arrastrado por las geometrías de la capa que se está
		 * editando.'); } else { alertify.notify('El cursor se verá arrastrado
		 * por las geometrías de cualquier capa activa.'); } } } }); }
		 */
		
		$("#snap-in-button").addClass("disabled");
		$("#snap-in-button").click(function () {
			if (!$(this).hasClass("disabled")) {
				if (that._mode == "ADD" || that._mode == "EDIT") {
					if (that.snaps && that.snaps.length > 0) {
						$("#snap-in-button").removeClass("activated");
						that.clearSnapInteractions(that);
						alertify.notify('El cursor ya no se verá arrastrado por las geometrías existentes.');
					} else {
						$("#snap-in-button").addClass("activated");
						that._snapInWithMultipleSources = that._shiftKeyIsPressed;
						that.createSnapInteractions(that);

						if (!that._snapInWithMultipleSources) {
							alertify.notify('El cursor se verá arrastrado por las geometrías de la capa que se está editando.');
						} else {
							alertify.notify('El cursor se verá arrastrado por las geometrías de cualquier capa activa.');
						}
					}
				}
			}
		});
	}

	removeSecondaryMenu(context) {
		let those = context;
		those._EDITING_LAYER_DATA = false;
	    $("#new-buttons-container").html("");
	}
	
	editLayerData(context) {
		let that = context;
	    if (this.selectedFeatures && this.selectedFeatures.length > 0) {
	    	if (that.selectedFeatures.length == 1) {
				let oneFeature = this.selectedFeatures[0];
				idNotFunddatetimelocal = [];
				openLayerDataPopup(that, this._activeLayerToEdit, oneFeature ? oneFeature.values_ : null);
				time = 0;
				setTimeout(setdatetimepicker, 1000);
				setTimeout(notEnter, 1000);
			} else {
				alertify.dismissAll();
				alertify.error("Debe tener un único elemento seleccionado para poder realizar ediciones.");
			}
	    } else {
			alertify.dismissAll();
	    	alertify.error("Debe seleccionar un elemento para editar.");
	    }
	}
	
	showVerticesToDelete(context) {
		let that = context;
	    if (this.selectedFeatures && this.selectedFeatures.length > 0) {
	    	if (that.selectedFeatures.length == 1) {
				that._map.removeInteraction(that.select);
				let oneFeature = this.selectedFeatures[0];
				let layer = that._activeLayerToEdit;
				let layerStyle = layer.getStyle();
				let style = new ol.style.Style({
					name: "geometry-vertices",
					image: new ol.style.Circle({
						radius: 5,
						fill: new ol.style.Fill({
							color: 'orange'
						})
					}),
					geometry: function(feature) {
						if (feature == oneFeature) {
							let layerGeometryType = layer && layer.values_ && layer.values_.geometryType ? layer.values_.geometryType : null;
							let coordinates = null;
							if (layerGeometryType == "LineString") {
								// Línea
								coordinates = feature.getGeometry().getCoordinates();
							} else {
								// Polígono
								coordinates = feature.getGeometry().getCoordinates()[0];
							}
							return new ol.geom.MultiPoint(coordinates);
						}
					}
				});
				
				if (typeof layerStyle == "function"){
					layerStyle = layerStyle(oneFeature,that._map.getView().getResolution())
					layerStyle.push(style);
					layer.setStyle(layerStyle);
					layer.getSource().changed();
				}
				else{
					layerStyle.pop();
					layerStyle.push(style);
					layer.setStyle(layerStyle);
					layer.getSource().changed();
				}
			} else {
				alertify.dismissAll();
				alertify.error("Debe tener un único elemento seleccionado para poder mostrar sus vértices.");
			}
	    } else {
	        this.showMessage("Error", "<p>Debe seleccionar un elemento para mostrar sus vértices.</p>");
	    }
	}

	cloneFeatures(context, featureToClone) {
		let that = context;
		let map = that._map;
	    if (featureToClone) {
	        let layer = that._activeLayerToEdit;
	        
	        that.copyInteraction = new ol.interaction.CopyPaste({
	        	destination: layer.getSource(),
	            features: that.selectedFeat
	        });

	        let readOnlyAttributes = getReadOnlyAttributesFromLayer(that, layer);

	        that._map.addInteraction(that.copyInteraction);

	        that.copyInteraction.on('paste', function (e) {
	        	map.removeInteraction(that.modify);
	        	
	        	let pknombre = getLayerPK(that,layer.values_.originalLayerTitle);
	        	
	        	e.features.forEach(f => {
    				if (f && f.values_ && f.values_[pknombre]) {
    					
						f.values_[pknombre] = null;
				
    					if (readOnlyAttributes && readOnlyAttributes.length > 0 && f && f.values_) {
							for (let key in f.values_) {
								let upperCaseKey = null;
								if (key) {
									upperCaseKey = key.toUpperCase();
								}
								let aux = readOnlyAttributes.filter(oroa => {let nombre_bd = oroa.nombre_bd; if(nombre_bd) {nombre_bd = nombre_bd.toUpperCase()} console.log(nombre_bd, upperCaseKey); return nombre_bd == upperCaseKey});
								if (aux && aux.length > 0) {
									f.values_[key] = null;
								}
							}
						}

    					let changeToProcess = new PendingChange("CREATE", layer, f, "PENDING", false, true);
    					that.addPendingChange(that, changeToProcess);
						if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
							that.processPendingChanges(that);
						}
					}
    			});

				that.resetEditMode(that);
	        });
	        
	        that.copyInteraction.copy({ silent: false });
	        that.copyInteraction.paste({ silent: false });
	    } else {
	        this.showMessage("Error", "<p>Debe seleccionar un elemento para clonar.</p>");
	    }
	}

	resetEditMode(context) {
		let that = context;
		that._map.removeInteraction(that.select);
		that._map.removeInteraction(that.modify);
		that._map.removeInteraction(that.draw);
		that._map.removeInteraction(that.split);
		this._map.removeInteraction(this.translate);
		that._splitting = false;
		let tempLayerToEdit = that._activeLayerToEdit;
		that.setMode(null);
		that.setActiveLayerToEdit(tempLayerToEdit);
		if (that.hasPendingChanges(that)) {
			$("#cancel-button").removeClass("disabled");
			$("#save-button").removeClass("disabled");
		}
		that.setMode("EDIT");
		that.refreshSnapInteractions(that);
	}

	createSnapInteractions(context) {
		let that = context;

		that.snaps = [];
		if (that._snapInWithMultipleSources) {
			let wfsVisibleLayers = getWFSVisibleLayers(that);
			wfsVisibleLayers.forEach(oneWFSVisibleLayer => {
				that.snaps.push(new ol.interaction.Snap({source: oneWFSVisibleLayer.getSource()}));
			});
		} else {
			let layer = that._activeLayerToEdit;
			if (layer) {
				that.snaps.push(new ol.interaction.Snap({source: layer.getSource()}));
			}
		}

		if (that.snaps && that.snaps.length > 0) {
			that.snaps.forEach(snap => that._map.addInteraction(snap));
		}
	}

	refreshSnapInteractions(context) {
		let that = context;
		if (that.snaps && that.snaps.length > 0) {
			that.snaps.forEach(snap => that._map.removeInteraction(snap));
			that.snaps.forEach(snap => that._map.addInteraction(snap));
		}
	}

	clearSnapInteractions(context) {
		let that = context;
		if (that.snaps && that.snaps.length > 0) {
			that.snaps.forEach(snap => that._map.removeInteraction(snap));
			that.snaps = [];
		}
	}

	addSplitInteraction(context) {
		let that = context;
	    if (that.selectedFeatures && that.selectedFeatures.length > 0) {
	    	if (that.selectedFeatures.length == 1) {
				that.split = new ol.interaction.Split ({
					features: that.selectedFeatures,
				});

				that.split.on("aftersplit", function(e){
					if (e && e.original && e.features && e.features.length > 0) {
						let changeToProcess = new PendingChange("DELETE", that._activeLayerToEdit, e.original, "PENDING", false, true);
						that.addPendingChange(that, changeToProcess);
						if (changeToProcess && changeToProcess.layer && changeToProcess.layer.getSource()) {
							changeToProcess.feature.setStyle(new ol.style.Style({}));
							// changeToProcess.layer.getSource().removeFeature(changeToProcess.feature);
						}
						let pknombre = getLayerPK(that,that._activeLayerToEdit.values_.originalLayerTitle);
						e.features.forEach(f => {
							if (f && f.values_) {
								f.values_[pknombre] = null;
								changeToProcess = new PendingChange("CREATE", that._activeLayerToEdit, f,  "PENDING", false, true);
								that.addPendingChange(that, changeToProcess);
								if (changeToProcess && changeToProcess.layer && changeToProcess.layer.getSource()) {
									changeToProcess.layer.getSource().addFeature(changeToProcess.feature);
								}
							}
						});

						that.resetEditMode(that);
						if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
							that.processPendingChanges(that);
						}
						$("#split-button").removeClass("activated");
					}
				});

				that._map.addInteraction(that.split);
			} else {
				alertify.dismissAll();
				alertify.error("Debe tener un único elemento seleccionado para poder realizar pariciones");
			}
	    } else {
	        this.showMessage("Error", "<p>Debe seleccionar un elemento para cortar.</p>");
	    }
	}

	

	mergeFeatures(context) {
		let that = context;
	    if (that.selectedFeatures && that.selectedFeatures.length == 2) {
			let parser = new jsts.io.OL3Parser();
			let layerSource = that._activeLayerToEdit.getSource();
			let geomType = that._activeLayerToEdit.values_.geometryType; //"Polygon" o "LineString"
			let featureOne = that.selectedFeatures[0];
			let jstsGeomOne = parser.read(featureOne.getGeometry());
			let featureTwo = that.selectedFeatures[1];
			let jstsGeomTwo = parser.read(featureTwo.getGeometry());
			let intersection = jstsGeomOne.intersection(jstsGeomTwo);
			let featureIntersect = intersection && 
				 (
				 (intersection._shell && intersection._shell._points && intersection._shell._points._coordinates && intersection._shell._points._coordinates.length > 0)
				 ||
				 (intersection._geometries && intersection._geometries.length > 0)
                 ||
                 (intersection._points && intersection._points._coordinates && intersection._points._coordinates.length > 0)
				 ||
				  (geomType == "Polygon" ? (intersection._coordinates && intersection._coordinates._coordinates && intersection._coordinates._coordinates.length > 1) 
						 : (intersection._coordinates && intersection._coordinates._coordinates && intersection._coordinates._coordinates.length >= 1) 
				  )
	             );
			if (featureIntersect) {
				let union = jstsGeomOne.union(jstsGeomTwo);
				union = parser.write(union);
				let changeToProcessOne = new PendingChange("DELETE", that._activeLayerToEdit, featureOne, "PENDING", false, true);
				that.addPendingChange(that, changeToProcessOne);
				featureOne.setStyle(new ol.style.Style({}));
				let changeToProcessTwo = new PendingChange("DELETE", that._activeLayerToEdit, featureTwo, "PENDING", false, true);
				that.addPendingChange(that, changeToProcessTwo);
				featureTwo.setStyle(new ol.style.Style({}));
				let newFeature = new ol.Feature(union);
				if (newFeature.getGeometry().getType() == 'MultiLineString') {
					const lineStrings = newFeature.getGeometry().getLineStrings();
					if (lineStrings.length > 0) {
						const mergedLineString = new ol.geom.LineString();
						let mergedCoordinates = [];
						mergedCoordinates = lineStrings[0].getCoordinates();
						for (let i = 1; i <= lineStrings.length - 1; i++) {
							const currentLineString = lineStrings[i - 1];
							const nextLineString = lineStrings[i];
							const currentEndPoint = currentLineString.getCoordinates()[currentLineString.getCoordinates().length - 1];
							const currentStartPoint = currentLineString.getCoordinates()[0];
							const nextStartPoint = nextLineString.getCoordinates()[0];
							const nextEndPoint = nextLineString.getCoordinates()[nextLineString.getCoordinates().length - 1];
							if (currentEndPoint[0] == nextStartPoint[0] && currentEndPoint[1] === nextStartPoint[1]) {
								mergedCoordinates = mergedCoordinates.concat(nextLineString.getCoordinates());
							} else if(currentStartPoint[0] === nextEndPoint[0] && currentStartPoint[1] === nextEndPoint[1]){
								mergedCoordinates = mergedCoordinates.concat(nextLineString.getCoordinates().reverse());
							} else if (currentStartPoint[0] == nextStartPoint[0] && currentStartPoint[1] == nextStartPoint[1]){
								mergedCoordinates = mergedCoordinates.reverse().concat(nextLineString.getCoordinates());
							} else {
								mergedCoordinates = mergedCoordinates.concat(nextLineString.getCoordinates().reverse());
							}
						}
						mergedLineString.setCoordinates(mergedCoordinates);
						const mergedLineStringFeature = new ol.Feature(mergedLineString);
						newFeature.setGeometry(mergedLineStringFeature.getGeometry());
					}
				}

				newFeature.setGeometryName('the_geom');
				newFeature.values_["the_geom"] = newFeature.values_.geometry;
				newFeature.values_["geometry"] = null;
				
				let readOnlyAttributes = getReadOnlyAttributesFromLayer(that, that._activeLayerToEdit);
				let pknombre = getLayerPK(that,that._activeLayerToEdit.values_.originalLayerTitle)
				for (let key in featureOne.values_) {
					if (key != "the_geom" && key != "geometry" && key != pknombre) {
						let isReadOnly = readOnlyAttributes && readOnlyAttributes.filter(oroa => oroa.nombre_bd == key);
						if (!isReadOnly || isReadOnly.length == 0) {
							newFeature.values_[key] = featureOne.values_[key];
						}
					}
				}
				let changeToProcessThree = new PendingChange("CREATE", that._activeLayerToEdit, newFeature ,  "PENDING", false, true);
				that.addPendingChange(that, changeToProcessThree);
				layerSource.addFeature(newFeature);

				that.resetEditMode(that);
			} else {
				alertify.dismissAll();
				alertify.error("Puede pegar únicamente geometrías que tengan algún punto de contacto.");
			}
	    }
	}

	addPendingChange(context, changeToProcess) {
		let that = context;
		if (!that.pendingChangesToProcess) {
			that.pendingChangesToProcess = [];
		}

		let oldChangeForFeature = null;
		let i = 0;
		while (!oldChangeForFeature && i < that.pendingChangesToProcess.length) {
			let opc = that.pendingChangesToProcess[i];
			if (opc.feature.ol_uid == changeToProcess.feature.ol_uid) {
				oldChangeForFeature = opc;
			} else {
				i++;
			}
		}
		// Si ya tenía cambios pendientes para la misma geometría, agrupo todos
		// para procesarlos juntos.
		if (oldChangeForFeature) {
			// Si tengo cambios pendientes para una geometría que luego elimino,
			// me quedo únicamente con el delete pentiente de procesar.
			changeToProcess.typesToShow = oldChangeForFeature.typesToShow;
			that.pendingChangesToProcess.splice(i, 1);

			if (changeToProcess.type == "DELETE") {
				changeToProcess.typesToShow.push("DELETE");
				// Si entre los cambios que ya tenía pendientes para la
				// geometría había un alta, ignoro cualquiera de ellos porque
				// sin guardar se intentó crear y eliminar el mismo elemento.
				let changeToProcessHasInsertType = changeToProcess.hasTypeToShow("CREATE");
				if (changeToProcessHasInsertType) {
					changeToProcess.ignorable = true;
				}
			}
			if (changeToProcess.type == "UPDATE") {
				changeToProcess.typesToShow.push("UPDATE");

				if (oldChangeForFeature.children && !changeToProcess.children) {
					changeToProcess.setChildren(oldChangeForFeature.children);
				} else if (
					oldChangeForFeature.children &&
					oldChangeForFeature.children.hijos &&
					oldChangeForFeature.children.hijos.length > 0 &&
					changeToProcess.children &&
					changeToProcess.children.hijos &&
					changeToProcess.children.hijos.length > 0
				) {
					let newChildren = oldChangeForFeature.children.hijos.concat(changeToProcess.children.hijos);
					changeToProcess.children.hijos = newChildren;
				} else if (
					oldChangeForFeature.children &&
					oldChangeForFeature.children.hijos &&
					oldChangeForFeature.children.hijos.length > 0 &&
					(
						!changeToProcess.children.hijos ||
						changeToProcess.children.hijos.length == 0
					)
				) {
					changeToProcess.children.hijos = oldChangeForFeature.children.hijos;
				}


				// Si entre los cambios que ya tenía pendientes para la
				// geometría había un alta, me quedo con los últimos datos
				// agregados y lo proceso como insert.
				let oldChangeToProcessHasInsertType = oldChangeForFeature.hasTypeToShow("CREATE");
				if (oldChangeToProcessHasInsertType) {
					changeToProcess.type = "CREATE";
				}
			}
		}

		that.pendingChangesToProcess.push(changeToProcess);
		$("#cancel-button").removeClass("disabled");
		$("#save-button").removeClass("disabled");
		updatePendingChangesCard(context);
	}

	async processPendingChanges(context) {
		let that = context;
		if (that.pendingChangesToProcess) {
			let errorProcessingChanges = false;
			let layer = null;
			for (let index = 0; index < that.pendingChangesToProcess.length; index++) {
				let onePendingChange = that.pendingChangesToProcess[index];
				layer = onePendingChange.layer;
				let processResult = null;
				if (onePendingChange.status != "PROCESSED") {
					if (!onePendingChange.ignorable) {
						switch (onePendingChange.type) {
							case "CREATE":
								processResult = await that.processCreate(that, onePendingChange);								
								break;
							case "UPDATE":
								processResult = await that.processUpdate(that, onePendingChange);
								break;
							case "DELETE":
								processResult = await that.processDelete(that, onePendingChange);
								break;
						}
					} else {
						onePendingChange.status = "PROCESSED";
						processResult = 1;
					}

					// Si lo que se devuelve no es 1 (el número de filas
					// afectadas por el cambio)
					//debugger;
					if (
						!processResult || 
						((!isNaN(processResult) && processResult <= 0) && processResult != "OK") || 
						(isNaN(processResult)  && processResult != "OK")
					) {
						errorProcessingChanges = true;
						alertify.error("Ha ocurrido un error procesando uno de los cambios. Se detuvo el procesamieno.");
						
						if (that.pendingChangesToProcess && that.pendingChangesToProcess.length==1 &&
							that.pendingChangesToProcess[0] && that.pendingChangesToProcess[0].layer && 
							that.pendingChangesToProcess[0].layer.values_ && 
							that.pendingChangesToProcess[0].layer.values_.autocommit) {
							
							that.pendingChangesToProcess = [];
							$("#cancel-button").addClass("disabled");
							$("#save-button").addClass("disabled");
						}
						
						break;
					}
				}
			}
			
			let msjAlert = "";
			if (typeof msjAlertaAlta != "undefined" && msjAlertaAlta != "") {
				msjAlert += msjAlertaAlta;
				msjAlertaAlta = "";
			}
			if (typeof msjAlertaModif != "undefined" && msjAlertaModif != "") {
				msjAlert += msjAlertaModif;
				msjAlertaModif = "";
			}
			if (msjAlert != "")
				alertify.alert("Advertencia",msjAlert);

			if (!errorProcessingChanges) {
				layer.getSource().clear();
				if (layer.values_.isFilterLayer) {
					that.applyFiltersFromArray(layer, null, false);
				}
				layer.getSource().refresh();
				that.runAppLayerReload(layer, that);
				that._map.removeInteraction(that.draw);
				that._map.removeInteraction(that.split);
				// that.setMode(null);
				that.resetEditMode(that);
				that.pendingChangesToProcess = [];
				//esto se agrega para refrescar capas visibles dependiendo de la capa que estamos actualizando
				if (that._appLayerRefreshCallback) {
					that._appLayerRefreshCallback(layer, that);
				}
				$("#cancel-button").addClass("disabled");
				$("#save-button").addClass("disabled");
				alertify.success("Todos los cambios han sido procesados con éxito.");
			}
		}
		updatePendingChangesCard(context);
	}

	runAppLayerReload(layer, context) {
		console.log("[wc-map.js] - runAppLayerReload | Start");
		let that = context;
		if (that._appLayerReloadCallback) {
			that._appLayerReloadCallback(layer, context);
		}
	}

	processCreate(context, pendingChange) {
		let that = context;
	    if (pendingChange && pendingChange.feature) {
	        let oneFeature = pendingChange.feature;
	        let layer = pendingChange.layer;
	        let layerValues = layer && layer.values_ ? layer.values_ : null;
		    let format = new ol.format.WFS({featureNS:layerValues.layerWorkspace, featureType:layerValues.layerName});
		    let layerTitle = layerValues && layerValues.originalLayerTitle ? layerValues.originalLayerTitle : null;
		    let pkName = getLayerPK(that,layerTitle);

			return new Promise((resolve, reject) => {

				// Get atributos del layer
				$.ajax({
					type: "GET",
					url: WCMapGetLayerURL + '?capa=' + layerTitle,
					success: function(data) {
						if (data && data['nombreTabla']) {
							let layerTableName = data['nombreTabla'];
							let method = "insert";
							let Origen_datos = data['Origen_datos'];
							let dbms = data['dbms'];
							let attributes = [];
							let geometryName = oneFeature.geometryName_;

							if (oneFeature && oneFeature.values_) {
								let nombre_atributo = null;
								let valor_atributo = null;
								for (let layerAttName in data['atributos']) {
									for (let featureValue in oneFeature.values_) {
										let nombreBD = data['atributos'][layerAttName]["nombre_bd"];
										let nombreBDUpperCase = null;
										if (nombreBD) {
											nombreBDUpperCase = nombreBD.toUpperCase();
										}
										if (nombreBD == featureValue || nombreBDUpperCase == featureValue) {
											nombre_atributo = featureValue;
											valor_atributo = oneFeature.values_[nombreBDUpperCase] || oneFeature.values_[nombreBD];

											if (valor_atributo === "") { // Si
																			// es
																			// un
																			// valor
																			// vacio
												if (data['atributos'][layerAttName]["tipo"] === "java.util.Date") {
													valor_atributo = null;	// La
																			// fecha
																			// vacía
																			// en
																			// realidad
																			// debe
																			// ir
																			// un
																			// NULL
												}
											}

											attributes.push({
												nombre_atributo: nombre_atributo,
												valor: valor_atributo
											});
											break;
										}
									}
								}

								let newFeature = removeZFromFeature(oneFeature, layerValues.geometryType);

								let wkt = getWKTFromFeature(newFeature);
								attributes.push({
									nombre_atributo: "the_geom",
									valor: wkt
								});
								
								if (typeof desplegarAlertaAlta != "undefined" && desplegarAlertaAlta.find(c => (c.layerTitle == layerTitle))) {
									let msj = desplegarAlertaAlta.find(c => (c.layerTitle == layerTitle));
									msj.armarMensaje(attributes, newFeature);
								}

								let body = {
									tabla : layerTableName,
									pkvalor : "",
									pknombre : pkName,
									metodo : method,
									dbms: dbms,
									Origen_datos: Origen_datos,
									atributos : attributes
								};
								
									$.ajax({
										type: "POST",
										url: WCMapUpdateLayerDataURL,
										dataType: "json",
										contentType: "application/json",
										data: JSON.stringify(body),
										success: (data2) => {
											if (data2 && data2 > 0) {
												pendingChange.status = "PROCESSED";
												if (pendingChange.showSuccessMessage) {
													alertify.success('Elemento insertado correctamente, con el ' + pkName + '= ' + data2,0);
												}
											} else {
												pendingChange.status = "WITH_ERROR";
												if (pendingChange.showErrorMessage) {
													alertify.success('Error al insertar el elemento.');
												}
											}
											resolve(data2);
										},
										error: (error) => {
											//console.error("[wc-map.js] - processCreate - ADD - ajax - error | error:");
											//console.error(error);
											pendingChange.status = "WITH_ERROR";
											if (pendingChange.showErrorMessage) {
												that.showMessage("Error", "<p>No se han podido actualizar los datos.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1029.</small></p>");
											}
											reject(error);
										},
										context: that
									});
							} else {
								pendingChange.status = "WITH_ERROR";
							}
						} else {
							//console.error(error);
							pendingChange.status = "WITH_ERROR";
							if (pendingChange.showErrorMessage) {
								that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1030.</small></p>");
							}
						}
					}
				});
			}).catch(function (e) {});
	    }
	}

	processDelete(context, pendingChange) {
		let that = context;
	    if (pendingChange && pendingChange.feature) {
	        let oneFeature = pendingChange.feature;
	        let layer = pendingChange.layer;
	        let layerTableName = layer && layer.values_ && layer.values_.databaseTableName ? layer.values_.databaseTableName : null;
	        let pkName = getLayerPK(that, layer.values_.originalLayerTitle);
	        let pkValue = oneFeature.values_[pkName];
	        let origenDatos = layer.values_.origenDatos;

	        let body = {
				tabla : layerTableName,
				pkvalor : pkValue,
				Origen_datos: origenDatos,
				pknombre : pkName,
				metodo : "delete"
			};
	        
	        if(hayQueEjecutarAccionLuegoDeBorrar)
				body.ejecutarAccionLuegoDeBorrar = true;
			return new Promise((resolve, reject) => {
				$.ajax({
					type: "POST",
					url: WCMapUpdateLayerDataURL,
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify(body),
					success: (data) => {
						console.log(data);
						if (!isNaN(data) && data > 0) {
							pendingChange.status = "PROCESSED";
							if (pendingChange.showSuccessMessage) {
								alertify.success('Eliminación realizada con éxito.');
							}
						} else {
							pendingChange.status = "WITH_ERROR";
							if (pendingChange.showErrorMessage) {
								that.showMessage("Error", "<p>No se han podido eliminar el registro.</p><p>"+data+".</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1034.</small></p>");
							}
						}
						resolve(data);
					},
					error: (error) => {
						pendingChange.status = "WITH_ERROR";
						//console.error("[wc-map.js] - processDelete - DELETE - ajax - error | error:");
						//console.error(error);
						if (error && error.responseText && error.responseText.includes("violates foreign key constraint")){
							if (pendingChange.showErrorMessage) {
								that.showMessage("Error", "<p>No se han podido eliminar el elemento pues contiene registros que dependen de él.</p><p>Edite el elemento y elimine los registros que dependen de él, y luego intente borrarlo nuevamente.</p><p style='text-align: right;'><small>Nro. Error: 1021.</small></p>");
							}
						}
						else {
							if (pendingChange.showErrorMessage) {
								that.showMessage("Error", "<p>No se han podido eliminar el registro.</p><p>"+error.responseText+".</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1035.</small></p>");
							}
						}
						reject(error);
					},
					context: that
				});
			}).catch(function (e) {});
	    } else {
	    	if (pendingChange.showErrorMessage) {
	    		this.showMessage("Error", "<p>Debe seleccionar un elemento para eliminar.</p>");
	    	}
	    }
	}

	processUpdate(context, pendingChange) {
		let that = context;
		if (pendingChange && pendingChange.feature) {
			let oneFeature = pendingChange.feature;
			let layer = pendingChange.layer;
			let layerValues = layer && layer.values_ ? layer.values_ : null;
			let format = new ol.format.WFS({featureNS:layerValues.layerWorkspace, featureType:layerValues.layerName});
			let layerTitle = layerValues && layerValues.originalLayerTitle ? layerValues.originalLayerTitle : null;

			return new Promise((resolve, reject) => {
				// Get atributos del layer
				$.ajax({
					type: "GET",
					url: WCMapGetLayerURL + '?capa=' + layerTitle,
					success: function(data) {
						if (data && data['nombreTabla']) {
							let layerTableName = data['nombreTabla'];
							let layerPkName = getLayerPK(that, layerTitle);
							let method = "update";
							let Origen_datos = data['Origen_datos'];
							let dbms = data['dbms'];
							let attributes = [];
							let geometryName = oneFeature.geometryName_;

							if (oneFeature && oneFeature.values_) {
								let nombre_atributo = null;
								let valor_atributo = null;
								for (let layerAttName in data['atributos']) {
									for (let featureValue in oneFeature.values_) {
										if (data['atributos'][layerAttName]["nombre_bd"] == featureValue) {
											nombre_atributo = data['atributos'][layerAttName]["nombre_bd"];
											valor_atributo = oneFeature.values_[featureValue];

											if (valor_atributo === "") { // Si
																			// es
																			// un
																			// valor
																			// vacio
												if (data['atributos'][layerAttName]["tipo"] === "java.util.Date") {
													valor_atributo = null;	// La
																			// fecha
																			// vacía
																			// en
																			// realidad
																			// debe
																			// ir
																			// un
																			// NULL
												}
											}

											attributes.push({
												nombre_atributo: nombre_atributo,
												valor: valor_atributo
											});
											break;
										}
									}
								}

								let newFeature = removeZFromFeature(oneFeature, layerValues.geometryType);

								attributes.push({
									nombre_atributo: "the_geom",
									valor: getWKTFromFeature(newFeature)
								});
								
								if (typeof desplegarAlertaModif != "undefined" && desplegarAlertaModif.find(c => (c.layerTitle == layerTitle))) {
									let msj = desplegarAlertaModif.find(c => (c.layerTitle == layerTitle));
									msj.armarMensaje(attributes, newFeature);
								}

								let body = {
									tabla : layerTableName,
									pkvalor : oneFeature.values_[layerPkName],
									pknombre : layerPkName,
									metodo : method,
									dbms: dbms,
									Origen_datos: Origen_datos,
									atributos : attributes
								};
								
								if(hayQuePasarAHistorico)
									body.pasarHistorico = true;

								let url = WCMapUpdateLayerDataURL;
								if (pendingChange.children && pendingChange.children.hijos && pendingChange.children.hijos.length > 0) {
									body["child"] = pendingChange.children;
									url = WCMapUpdateCascadeURL;
								}
								$.ajax({
									type: "POST",
									url: url,
									dataType: "text",
									contentType: "application/json",
									data: JSON.stringify(body),
									success: (data2) => {
										if (!isNaN(data2) && data2 > 0 || data2 == "OK") {
											pendingChange.status = "PROCESSED";
											if (pendingChange.showSuccessMessage) {
												alertify.success('Elemento actualizado correctamente.');
											}
										} else {
											pendingChange.status = "WITH_ERROR";
											if (pendingChange.showErrorMessage) {
												//that.showMessage("Error", "<p>"+data2+"</p>");
												alertify.error('Error al actualizar el elemento.' + data2);
											}
										}
										resolve(data2);
									},
									error: (error) => {
										//console.error("[wc-map.js] - processUpdate - ajax - error | error:");
										//console.error(error);
										pendingChange.status = "WITH_ERROR";
										if (pendingChange.showErrorMessage) {
											that.showMessage("Error", "<p>No se han podido actualizar los datos.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1029.</small></p>");
										}
										reject(error);
									},
									context: that
								});
							} else {
								pendingChange.status = "WITH_ERROR";
							}
						} else {
							pendingChange.status = "WITH_ERROR";
							if (pendingChange.showErrorMessage) {
								that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1030.</small></p>");
							}
						}
					}
				});
			}).catch(function (e) {});
		}
	}

	cancelPendingChanges(context) {
		let that = context;
		if (that.pendingChangesToProcess && that.pendingChangesToProcess.length > 0) {
			let layer = that.pendingChangesToProcess && that.pendingChangesToProcess[0] ? that.pendingChangesToProcess[0].layer : null;

			if(layer && layer.getSource()) {
				that.pendingChangesToProcess = [];
				that._EDITING_LAYER_DATA = false;
				layer.getSource().clear();
				if (layer.values_.isFilterLayer) {
					that.applyFiltersFromArray(layer);
				}
				layer.getSource().refresh();
			}
			that.featuresInUse = [];
			$("#cancel-button").addClass("disabled");
			$("#save-button").addClass("disabled");
		}
		updatePendingChangesCard(that);
	}

	hasPendingChanges(context) {
		let that = context;
		if (that.pendingChangesToProcess && that.pendingChangesToProcess.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	getChildWithPendingChangeByMethod(context, pkValue, method) {
		let that = context;
		let child = null;

		if (that.pendingChangesToProcess && that.pendingChangesToProcess.length > 0) {
			let pendingChangesWithChildren = that.pendingChangesToProcess.filter(opctp => opctp.children && opctp.children.hijos && opctp.children.hijos.length > 0);
			if (pendingChangesWithChildren && pendingChangesWithChildren.length > 0) {
				let i = 0;
				while (!child && i < pendingChangesWithChildren.length) {
					let opcwc = pendingChangesWithChildren[i];
					let children = opcwc.children.hijos;

					if (children && children.length > 0) {
						children.forEach(c => {
							if (c.pkvalor ==  pkValue && c.metodo == method) {
								child = c;
							}
						});
					}

					i++;
				}
			}
		}

		return child;
	}

	getChildrenToAddFromFather(context, fatherPK) {
		let that = context;
		let children = [];

		if (that.pendingChangesToProcess && that.pendingChangesToProcess.length > 0) {
			let i = 0;
			while (i < that.pendingChangesToProcess.length) {
				let opctp = that.pendingChangesToProcess[i];
				let pknombre =  getLayerPK(that, opctp.layer.values_.originalLayerTitle);
				let opctpf = opctp ? opctp.feature : null;
				let opctpfPK = opctpf ? opctpf.values_[pknombre] : null;
				if (opctpfPK && opctpfPK == fatherPK) {
					if (opctp.children && opctp.children.hijos && opctp.children.hijos.length > 0) {
						opctp.children.hijos.forEach(h => {
							if (h.metodo == 'insert') {
								children.push(h);
							}
						});
					}
				}
				i++;
			}
		}

		return children;
	}

	
	/*
	 * Toolbar
	 */
	initToolbar() {
		let buttons = [];
		
		let hideResetButton = this.getAttribute('hideResetButton');
		if (hideResetButton) {
			hideResetButton = hideResetButton.toUpperCase();
		}
		
		buttons.push({
			"type": "option",
			"id": "btn-info",
			"tooltipText": "Prender/Apagar modo de consulta",
			"faIcon": "fa-info"
		});
		
		let mapOptions = [
			{
				"type": "option",
				"id": "btn-redo-view-map",
				"tooltipText": "Vista posterior",
				"faIcon": "fa-redo",
				"customClass": "disabled"
			},
			{
				"type": "option",
				"id": "btn-undo-view-map",
				"tooltipText": "Vista anterior",
				"faIcon": "fa-undo",
				"customClass": "disabled"
			}
		];

		mapOptions.push({
			"type": "option",
			"id": "btn-refresh-visible-layers",
			"tooltipText": "Recargar capas visibles",
			"faIcon": "fa-sync-alt"
		});
		
		if (!hideResetButton || hideResetButton === "FALSE" || hideResetButton === "0") {
			mapOptions.push({
				"type": "option",
				"id": "btn-reset-map",
				"tooltipText": "Resetear posición del mapa",
				"faIcon": "fa-home"
			});
		}
		
		buttons.push({
			"type": "menu",
			"id": "btn-map-options",
			"tooltipText": "Opciones del mapa",
			"faIcon": "fa-globe-americas",
			"buttons": mapOptions
		});
		
		let hideSelectButton = this.getAttribute('hideSelectButton');
		if (hideSelectButton) {
			hideSelectButton = hideSelectButton.toUpperCase();
		}
		let hideAssistedSelectButton = this.getAttribute('hideAssistedSelectButton');
		if (hideAssistedSelectButton) {
			hideAssistedSelectButton = hideAssistedSelectButton.toUpperCase();
		}
		let filterButtons = [
			{
				"type": "option",
				"id": "btn-remove-filters",
				"tooltipText": "Borrar todos los filtros",
				"faIcon": "fa-eraser"
			},
			{
				"type": "option",
				"id": "btn-advanced-search",
				"tooltipText": "Búsqueda avanzada",
				"faIcon": "fa-search"
			}
		];
		if (!hideSelectButton || hideSelectButton === "FALSE" || hideSelectButton === "0") {
			filterButtons.push({
				"type": "option",
				"id": "btn-select",
				"tooltipText": "Dibujar área de selección",
				"faIcon": "fa-pencil-alt"
			});
		}
		if (!hideAssistedSelectButton || hideAssistedSelectButton === "FALSE" || hideAssistedSelectButton === "0") {
			filterButtons.push({
				"type": "option",
				"id": "btn-select-polygon",
				"tooltipText": "Dibujar polígono de selección",
				"faIcon": "fa-edit"
			});
		}
		buttons.push({
			"type": "menu",
			"id": "btn-filter-menu",
			"tooltipText": "Filtros por área",
			"faIcon": "fa-filter",
			"buttons": filterButtons
		});
		
		let hideMeasureButton = this.getAttribute('hideMeasureButton');
		if (hideMeasureButton) {
			hideMeasureButton = hideMeasureButton.toUpperCase();
		}
		if (!hideMeasureButton || hideMeasureButton === "FALSE" || hideMeasureButton === "0") {
			buttons.push({
				"type": "menu",
				"id": "btn-measure-menu",
				"tooltipText": "Mediciones",
				"faIcon": "fa-ruler-combined",
				"buttons": [
					{
						"type": "option",
						"id": "btn-clear-measure",
						"tooltipText": "Borrar todas las mediciones",
						"faIcon": "fa-eraser"
					},
					{
						"type": "option",
						"id": "btn-measure",
						"tooltipText": "Dibujar medición",
						"faIcon": "fa-pencil-ruler"
					}
				]
			});
		}
		buttons.push({
			"type": "menu",
			"id": "btn-export-menu",
			"tooltipText": "Exportaciones",
			"faIcon": "fa-cloud-download-alt",
			"buttons": [
				{
					"type": "option",
					"id": "btn-screenshot",
					"tooltipText": "Exportar (.png)",
					"faIcon": "fa-camera"
				},
				{
					"type": "option",
					"id": "btn-export-csv",
					"tooltipText": "Exportar (.csv)",
					"faIcon": "fa-file-csv"
				},
				{
					"type": "option",
					"id": "btn-export-kml",
					"tooltipText": "Exportar (.kml)",
					"faIcon": "fa-file-code"
				},
				{
					"type": "option",
					"id": "btn-export-shp",
					"tooltipText": "Exportar (.shp)",
					"faIcon": "fa-shapes"
				},
				{
					"type": "option",
					"id": "btn-export-geojson",
					"tooltipText": "Exportar (.geojson)",
					"faIcon": "fa-exchange-alt"
				}
			]
		});
		if (this._helpLink) {
			buttons.push({
				"type": "option",
				"id": "btn-help",
				"tooltipText": "Ayuda",
				"faIcon": "fa-question"
			});
		}

		buttons.push({
			"type": "option",
			"id": "btn-logout",
			"tooltipText": "Salir",// + this.getAttribute('loggedUser'),
			"faIcon": "fa-sign-out-alt"
		});

		// Load each applications custom menu (if any_=)
		this._loadAppCustomMenu(buttons, this);

		let toolbar = document.querySelector("wc-toolbar");
		toolbar.buttons = JSON.stringify(buttons);
		
		toolbar.addEventListener('WCToolbarButtonClick', this.WCToolbarButtonClick, this);
	}
	
	WCToolbarButtonClick(e) {
		let map = document.getElementById("wc-map");
		let buttonId = e.detail;
		
		switch(buttonId) {
		case "btn-reset-map":
			 map.resetView();
			break;
		case "btn-refresh-visible-layers":
			map.refreshVisibleLayers(map);
			break;
		case "btn-undo-view-map":
			map.setLastPosition();
			break;
		case "btn-redo-view-map":
			map.setNextPosition();
			break;
		case "btn-info":
			if ((map._mode == "EDIT" || map._mode == "ADD") && map.hasPendingChanges(map)) {
				alertify.confirm(
					'Descartando cambios',
					'¿Seguro que desea cancelar los cambios y cambiar de modo?',
					function() {
						map.cancelPendingChanges(map);
						map.setMode(null);
						map.removeSecondaryMenu(map);
						map.setMode("INFO");
					},
					function() {
						alertify.notify('Los cambios continuarán pendientes de guardar o descartar.', 'custom', 4, function(){});
					}
				);
			} else {
				map.setMode(null);
				map.setMode("INFO");
			}
			break;
		case "btn-select":
			map.startSelelectFilter(true);
			break;
		case "btn-select-polygon":
			map.startSelelectFilter(false);
			break;
		case "btn-advanced-search":
			startAdvancedSearch(map);
			break;
		case "btn-remove-filters":
			map.removeFilters();
			break;
		case "btn-measure":
			if (map._mode == "ADD" || map._mode == "EDIT") {
				alertify.dismissAll();
				alertify.error("Para realizar mediciones no puede estar en modo alta ni edición.");
			} else {
				startMeasure(map);
			}
			break;
		case "btn-clear-measure":
			clearMeasure(map);
			break;
		case "btn-help":
			let url = map._helpLink;
			window.open(url, '_blank');
			break;
		case "btn-screenshot":
			if (!map._exportButtonsDisabled) {
				map.exportToPNG();
			}
			break;
		case "btn-export-csv":
			map.exportToCSV();
			break;
		case "btn-export-kml":
			map.exportToKML();
			break;
		case "btn-export-shp":
			map.exportToSHP();
			break;
		case "btn-export-geojson":
				map.exportToGeoJson();
				break;
		case "btn-logout":
			if (map.hasPendingChanges(map)) {
				alertify.confirm(
					'Descartando cambios',
					'¿Seguro que desea cancelar los cambios y salir?',
					function() {
						logout();
					},
					function() {
					}
				);
			} else {
					alertify.confirm(
					'Cerrar Sesión',
					'¿Seguro que desea cerrar sesión y salir?',
					function() {
						logout();
					},
					function() {
					}
				);
			}
			break;
		default:
			map._customMenuActions(buttonId, map);
		}
	}
	
	
	/*
	 * Filters
	 */
	checkPolygonFilterInUse() {
		let polygonFilterInUse = false;

		if (this._filters) {
			let i = 0;
			while (i < this._filters.length && !polygonFilterInUse) {
				let oneLayerToFilter = this._filters[i];
				if (oneLayerToFilter.filters && oneLayerToFilter.filters.length > 0) {
					let j = 0;
					while (j < oneLayerToFilter.filters.length && !polygonFilterInUse) {
						let oneFilter = oneLayerToFilter.filters[j];
						if (oneFilter.filterKey && oneFilter.filterKey == "POLYGON") {
							polygonFilterInUse = true;
						}
						j++;
					}
				}
				i++;
			}
		}

		return polygonFilterInUse;
	}

	startSelelectFilter(freehand) {
		let that = this;
		let errorMessage = null;
		
		if (that._mode == "ADD" && that.hasPendingChanges(that)) { 
			  errorMessage = "Debe salir del modo alta, confirmar ó descartar cambios para poder aplicar filtros."; 
		  } else if (that._mode == "EDIT" && that.hasPendingChanges(that)) {
			  errorMessage = "Debe salir del modo edición, confirmar ó descartar cambios para poder aplicar filtros."; 
		  }

		if (errorMessage) {
			alertify.error(errorMessage);
		} else {
			let polygonFilterInUse = that.checkPolygonFilterInUse();

			if (polygonFilterInUse) {
				let title = "Ya tiene un filtro por polígono aplicado.";
				let content = "¿Desea eliminarlo para crear uno nuevo?";
				let okAction = deleteFilterAndStartNew;
				let cancelAction = null;
				let okButtonText = "Si";
				let cancelButtonText = "No";
				let cancelButtonMustCloseModal = true;
				let okButtonMustCloseModal = true;
				let size = null;
				let backdrop = true;
				let keyboard = true;
				that.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
			} else {
				startFilter();
			}

			function deleteFilterAndStartNew() {
				that.deletePolygonFilter(that, true);
				startFilter();
			}

			function startFilter() {
				if (that._drawPolygonInteraction) {
					that._map.removeInteraction(that._drawPolygonInteraction);
					that._drawPolygonInteraction = null;
				}

				if (freehand) {
					that._drawingPolygonFilter = true;
					that._drawingPolygonFilterAssisted = false;
				} else {
					that._drawingPolygonFilter = false;
					that._drawingPolygonFilterAssisted = true;
				}

				const WFSLayers = that.getWFSLayers();

				if (WFSLayers && WFSLayers.length > 0) {
					let optionsHTML = ``;

					for (let i = 0; i < WFSLayers.length; i++) {
						const oneWFSLayer = WFSLayers[i];

						if (oneWFSLayer && oneWFSLayer.values_ && !oneWFSLayer.values_.isFilterLayer) {
							optionsHTML +=	`
						<div class="radio">
							<label><input type="radio" value="` + oneWFSLayer.values_.title + `" name="modal-select-layer-to-filter-option" ` + (i === 0 ? `checked>` : `>`) + oneWFSLayer.values_.title + `</label>
						</div>
					`;
						}
					}

					$('#modal-select-layer-to-filter-body').html(optionsHTML);

					$('#modal-select-layer-to-filter').modal({
						backdrop: 'static',
						keyboard: false
					});
				}
			}
		}
	}

	deletePolygonFilter(context, refreshLayerFilters) {
		let that = context;

		if (that._filters) {
			let polygonFilterFound = false;
			let i = 0;
			while (i < that._filters.length && !polygonFilterFound) {
				let oneLayerToFilter = this._filters[i];
				if (oneLayerToFilter.filters && oneLayerToFilter.filters.length > 0) {
					let j = 0;
					while (j < oneLayerToFilter.filters.length && !polygonFilterFound) {
						let oneFilter = oneLayerToFilter.filters[j];
						if (oneFilter.filterKey && oneFilter.filterKey == "POLYGON") {
							polygonFilterFound = true;
							oneLayerToFilter.filters.splice(j);
							let vectorFiltroPoligonos = that.getLayerToDraw();
							vectorFiltroPoligonos.getSource().clear();
							if (refreshLayerFilters) {
								if (oneLayerToFilter.filters.length > 0) {
									let filterLayer = getFilterLayerByOriginalLayerTitle(that, oneLayerToFilter.layerName);
									if (filterLayer) {
										that.applyFiltersFromArray(filterLayer);
									}
								} else {
									let layer = getLayerByNameOrTitle(that, oneLayerToFilter.layerName);
									that.removeFiltersToLayer(layer);
								}
							}
						}
						j++;
					}
				}
				i++;
			}
		}
	}

	cancelFilterSelection() {
		this._drawingPolygonFilter = false;
		this._drawingPolygonFilterAssisted = false;
	}

	selectLayerToApplyFilter() {
		let that = this;
		let layerTitle = $("input:radio[name='modal-select-layer-to-filter-option']:checked").val();
		
		let filterLayer = getFilterLayerByOriginalLayerTitle(that, layerTitle);
		
		if (this._drawingPolygonFilter) {
			this.drawFilter(filterLayer, layerTitle, true);
		} else if (this._drawingPolygonFilterAssisted) {
			this.drawFilter(filterLayer, layerTitle, false);
		}
		
		$('#modal-select-layer-to-filter').modal('hide');
	}
	
	drawFilter(filterLayer, layerTitle, freehand) {
		let that = this;
		let vectorFiltroPoligonos = that.getLayerToDraw();
		vectorFiltroPoligonos.setSource(new ol.source.Vector({wrapX: false}));
		
		this._drawPolygonInteraction = new ol.interaction.Draw({
			type: 'Polygon',
			source: vectorFiltroPoligonos.getSource(),
			freehand
		});
	
		this._drawPolygonInteraction.on('drawend', function (event) {
			let feature = event.feature;
			let geom = feature.getGeometry();
			that._lastPolygonFilter = ol.format.filter.intersects('the_geom', geom, 'EPSG:32721');
			that.addFilterToLayer(layerTitle, {filterType: 'GEOSERVER', filterKey: 'POLYGON', filterName: 'Polígono', filter: that._lastPolygonFilter});
			that.applyFiltersFromArray(filterLayer);
			that._map.removeInteraction(that._drawPolygonInteraction);
			that._drawingPolygonFilter = false;
		});
	
		this._map.addInteraction(this._drawPolygonInteraction);
	}
	
	addFilterToLayer(layerTitle, filter) {
		let filters = null;
		for(let i = 0; i < this._filters.length; i++) {
			if (this._filters[i].layerName && this._filters[i].layerName == layerTitle) {
				let layerFilters = this._filters[i].filters;
				let filterFound = false;
				let j = 0;
				while (!filterFound &&  j < layerFilters.length) {
					if (layerFilters[j].filterKey == filter.filterKey) {
						layerFilters[j] = filter;
						filterFound = true;
					}
					j++
				}
				if (!filterFound) {
					layerFilters.push(filter);
				}
				filters = this._filters[i].filters;
			}
		}
		return filters;
	}
	
	removeFiltersToLayer(layer, showLayerIfNeeded = true) {
		let that = this;
		let layerTitle = layer.values_.title;
		let filterFound = false;
		let i = 0;
		while (i < that._filters.length && !filterFound) {
			if (that._filters[i].layerName && that._filters[i].layerName == layerTitle) {
				let j = 0;
				let polygonFilterFound = false;
				while (j < that._filters[i].filters.length && !polygonFilterFound) {
					let oneFilter = that._filters[i].filters[j];
					if (oneFilter.filterKey == "POLYGON") {
						let vectorFiltroPoligonos = that.getLayerToDraw();
						vectorFiltroPoligonos.getSource().clear();
						polygonFilterFound = true;
					}
					j++;
				}
				that._filters[i].filters = [];
				filterFound = true;
			}
			i++;
		}
		let filterLayer = getFilterLayerByOriginalLayerTitle(that, layerTitle);
		filterLayer.getSource().clear();
		filterLayer.values_.inUse = false;

		if (showLayerIfNeeded && filterLayer.getVisible()) {
			layer.setVisible(true);
			if (layer && layer.values_ && (!layer.values_.format || (layer.values_.format && layer.values_.format != "WMS"))) {
				layer.getSource().clear();
				layer.getSource().refresh();
			}
		}
		that.updateFilterBadges(that);
		that.updateActiveLayersToConsult();
		if (typeof callbackAlBorrarFiltros == 'function') {
			callbackAlBorrarFiltros(layer);
		}		
	}
	
	applyFiltersFromArray(filterLayer, filterDoneCallback, zoomToResult = true) {
		let that = this;
		let layerNameCollection = filterLayer.values_.name.split("_");
		let layerName = layerNameCollection[layerNameCollection.length-1];
		let originalLayer = getLayerByNameOrTitle(that, layerName);
		filterLayer.getSource().clear();
		let geoserverFilters = that.getGeoserverAppliedFiltersFromLayerName(layerName);
		let clientSideFilters = that.getClientSideAppliedFiltersFromLayerName(layerName);
		
		if (originalLayer.values_.dbms == "ORACLE" && geoserverFilters != null   ){
			geoserverFilters.geometryName = "THE_GEOM"
		}

        var getFeatureRequest = new ol.format.WFS().writeGetFeature({
            srsName: originalLayer.values_.srsName,
            featureNS: originalLayer.values_.layerWorkspace,
            featurePrefix: originalLayer.values_.layerWorkspace,
            featureTypes: [originalLayer.values_.typeName],
            outputFormat: 'application/json',
            filter: geoserverFilters
        });
        const url = originalLayer.values_.WFSurl || originalLayer.values_.url
		var request = new Request( url , {
            method: 'POST',
            body: new XMLSerializer().serializeToString(getFeatureRequest),
            mode: 'cors',
            headers: new Headers()
        });
        fetch(request)
		.then(function (resp) { return resp.text() }) // Transform the
		.then(function (json) {// data into json
			filterLayer.values_.inUse = true;
			var features = new ol.format.GeoJSON().readFeatures(json);
			if (clientSideFilters && clientSideFilters.length > 0) {
				for (let i = 0; i < clientSideFilters.length; i++) {
					let oneClientSideFilter = clientSideFilters[i];

					features = features.filter(f => {
						let originalFeatureValues = f.values_;
						let featureValues = {};
						for (let key in originalFeatureValues) {
							if(typeof (originalFeatureValues[key]) === "string") {
								featureValues[key.toUpperCase()] = originalFeatureValues[key].toUpperCase();
							}
							else{
								featureValues[key.toUpperCase()] = originalFeatureValues[key];
							}
						}
						oneClientSideFilter = oneClientSideFilter.replace(".toUpperCase()","")
						return eval(oneClientSideFilter)
					});
				}
			}
			if (filterDoneCallback && filterDoneCallback!= null && filterDoneCallback!= undefined)
				features = filterDoneCallback(features)

			if(features && features.length > 0) {
				var parser = new jsts.io.OL3Parser();
				var buffersVector = new ol.source.Vector();

				for (var i = 0; i < features.length; i++) {
					var feature = features[i];
					var jstsGeom = parser.read(feature.getGeometry());
					if (jstsGeom) {
						var buffered = jstsGeom.buffer(100); // 100 metros
						var feat = new ol.Feature();
						feat.setGeometry(parser.write(buffered));
						buffersVector.addFeature(feat);

						filterLayer.getSource().addFeature(feature);
					}
				}

				if (zoomToResult) {
					that.setPositionByBoundingBox(buffersVector.getExtent());
				}

				originalLayer.setVisible(false);
				closeLoader();
			} else {
				closeLoader();
				alertify.warning("No se han encontrado resultados tras aplicar los filtros.");
			}
			originalLayer.setVisible(false);
			// Tras aplicar un filtro, como la capa se prende, si el checkbox
			// del selector no estaba marcado, le hacemos click.
			let layerId = originalLayer && originalLayer.values_ ? originalLayer.values_.layerId : null;
			let layerTitle;
			if (originalLayer && originalLayer.values_ && originalLayer.values_.title) {
				layerTitle = originalLayer.values_.originalLayerTitle;
			}
			if (layerId) {
				if(!$(`#layer-checkbox-${layerId}`).is(":checked")) {
					$(`#layer-checkbox-${layerId}`).click();
				}
			}
			// debugger;
			that.updateFilterBadges(that);
			that.updateActiveLayersToConsult();
			that.mantengoModoEdicion(false, layerTitle);
		})
		// .catch(function (error) {
		// });
	}
	
	getGeoserverAppliedFiltersFromLayerName(layerName) {
	    let that = this;
		let filters = null;
	    let filterCollection = [];
	    
	    for (let i = 0; i < this._filters.length; i++) {
	    	if (this._filters[i].layerName == layerName) {
	    		filterCollection = this._filters[i].filters;
	    	}
	    }

	    var first = true;

		filterCollection = filterCollection.filter(of => of.filterType == 'GEOSERVER');

	    filterCollection.forEach(function(item, index) {
	        let oneFilter = item.filter;
			if (item.filterKey == 'POLYGON') {
				oneFilter = that._lastPolygonFilter;
			}
			if (first){
				first = false;
				filters = oneFilter;
				// filters = new ol.format.filter.IsLike( item.name, '*' +
				// item.value.toUpperCase() + '*');
			} else {
				// let f = new ol.format.filter.IsLike( item.name, '*' +
				// item.value.toUpperCase() + '*');
				filters = ol.format.filter.and(filters, oneFilter);
			}
    	});

	    return filters;
	}

	getClientSideAppliedFiltersFromLayerName(layerName) {
		let that = this;
		let filters = [];
		let filterCollection = [];

		for (let i = 0; i < this._filters.length; i++) {
			if (this._filters[i].layerName == layerName) {
				filterCollection = this._filters[i].filters;
			}
		}

		filterCollection = filterCollection.filter(of => of.filterType == 'CLIENT_SIDE');

		filterCollection.forEach(function(item, index) {
			let oneFilter = item.filter;
			filters.push(oneFilter);
		});

		return filters;
	}

	removeFilters() {
		let that = this;
		let errorMessage = null;
		
		if ((that._mode == "ADD" || that._mode == "EDIT") && that.hasPendingChanges(that)) { 
				errorMessage ="Debe salir del modo edición, confirmar ó descartar cambios para poder borrar filtros."; 
		}
		
		if (errorMessage) {
			alertify.error(errorMessage);
		} else {
			if (that._filters) {
				alertify.confirm(
	        		'Borrar Filtros',
	        		'¿Seguro que desea borrar todos los filtros?',
	        		function() {
	        			that._filters.forEach(oneFilter => {
	    					if (oneFilter.filters && oneFilter.filters.length > 0) {

	    						// Chequeo si la capa tiene algo más que un
								// filtro de búsqueda avanzada como segunda capa
	    						let i = 0;
	    						let onlyAdvancedSearchLayer2FilterFound = true;
	    						while (i < oneFilter.filters.length) {
	    							let oneRealFilter = oneFilter.filters[i];
	    							if (!oneRealFilter.filterKey == "BUSQUEDA_AVANZADA" || !oneRealFilter.filter2) {
	    								onlyAdvancedSearchLayer2FilterFound = false;
	    							}
	    							i++;
	    						}

	    						oneFilter.filters = [];
	    						let layerName = oneFilter.layerName;
	    						let layer = getLayerByNameOrTitle(that, layerName);
	    						that.removeFiltersToLayer(layer, !onlyAdvancedSearchLayer2FilterFound);
	    						let layerId;
	    						if (layer && layer.values_ && layer.values_.layerId) {
	    							layerId = layer.values_.layerId;
	    						} 
	    						let layerTitle;
	    						if (layer && layer.values_ && layer.values_.title) {
	    							layerTitle = layer.values_.originalLayerTitle;
	    						}
	    						// debugger;
	    						that.mantengoModoEdicion(true, layerTitle);
	    					}
	    				});
	    				let vectorFiltroPoligonos = that.getLayerToDraw();
	    				if (vectorFiltroPoligonos && vectorFiltroPoligonos.getSource()) {
	    					vectorFiltroPoligonos.getSource().clear();
	    				}
	    				that.updateActiveLayersToConsult();	
	        		},
	        		function() {
	        		}
				);
				
			}
		}
	}


	/*
	 * Layers
	 */

	refreshVisibleLayers(context) {
		let layerGroups = context._map.getLayers().array_;
		layerGroups.forEach(olg => {
			let layers = null;
			if (olg && olg.values_ && olg.values_.title != "Capas base" && olg.values_.layers && olg.values_.layers.array_) {
				layers = olg.values_.layers.array_;
			}
			if (layers && layers.length > 0) {
				layers.forEach(ol => {
					if (ol.getVisible()) {
						context.refreshLayerSource(context, (ol.values_.title || ol.values_.name));
					}
				});
			}
		});
	}

	refreshLayerSource(context, layerNameOrTitle) {
		let layer = getLayerByNameOrTitle(context, layerNameOrTitle);
		if (layer) {
			let layerIsVisible = layer.getVisible();
			let layerSource = layer.getSource();
			if (layerIsVisible && layerSource) {
				if (layer.values_ && layer.values_.format == "WMS") {
					layerSource.changed();
					if(layerSource.params_){
						let sourceParams = JSON.parse(JSON.stringify(layerSource.getParams()));
						sourceParams["time"] = Date.now();
						if (sourceParams) {
							layerSource.updateParams(sourceParams);
						}
					}
				} else if (layer.values_ && layer.values_.format == "WFS" && getLayerByNameOrTitle(context, layer.values_.originalLayerTitle).getVisible()) {
					layerSource.clear();
					if (layer.values_.isFilterLayer) {
						context.applyFiltersFromArray(layer, null, false);
					}
				}
				layerSource.refresh();
				if (layer.values_.isFilterLayer && getVisibleLayerSinFiltro(layerNameOrTitle, context)) {
					context.runAppLayerReload(layer, context);
				}
			}
		}
	}
	
	setLayerLabelOption(that, layerId, layerIdFiltro, mostrarEtiqueta){
		//ACA VOY A SETEAR EL ATRIBUTO PARA LA CAPA ORIGINAL
		let layer = getLayerByLayerId(that, layerId);
		layer.setProperties({"mostrarEtiquetas":mostrarEtiqueta});
		layer.getSource().refresh();
		//ACA VOY A SETEAR EL ATRIBUTO PARA LA CAPA DE FILTRO
		let layerFilter = getLayerByLayerId(that, layerIdFiltro);
		layerFilter.setProperties({"mostrarEtiquetas":mostrarEtiqueta});
		layerFilter.getSource().refresh();
	}

	hideBaseLayers() {
		const layerGroups = this._map.getLayers().array_;
		for (let i = 0; i < layerGroups.length; i++) {
			const layerGroup = layerGroups[i].values_;
			if (layerGroup.layers) {
				const layers = layerGroup.layers.array_;

				for (let j = 0; j < layers.length; j++) {
					const oneLayer = layers[j];
					if (oneLayer && oneLayer.values_ && oneLayer.values_.type === "base" || oneLayer.values_.type === "BASE") {
						oneLayer.setVisible(false);
					}
				}				
			}
		}
	}
	
	getLayerToDraw() {
		let layer = null;
		
		const layerGroups = this._map.getLayers().array_;
		for (let i = 0; i < layerGroups.length; i++) {
			const layerGroup = layerGroups[i].values_;
			if (layerGroup.layers) {
				const layers = layerGroup.layers.array_;

				if (layerGroup && layerGroup.name && layerGroup.name === 'FILTER_POLYGON_GROUP') {
					for (let j = 0; j < layers.length; j++) {
						const oneLayer = layers[j];
						if (oneLayer && oneLayer.values_ && oneLayer.values_.name && oneLayer.values_.name === "FILTER_POLYGON") {
							layer = oneLayer;
							break;
						}
					}
				}
			}
		}
		
		return layer;
	}
	
	getWFSLayers() {
		const WFSLayers = [];
		const layerGroups = this._map.getLayers().array_;
		for (let i = 0; i < layerGroups.length; i++) {
			const layerGroup = layerGroups[i].values_;
			if (layerGroup.layers) {
				const layers = layerGroup.layers.array_;
				for (let j = 0; j < layers.length; j++) {
					const oneLayer = layers[j];
					if (oneLayer && oneLayer.values_ && oneLayer.values_.isWFS) {
						WFSLayers.push(oneLayer);
					}
				}
			}
		}
		return WFSLayers;
	}
	
	getLayerId(layer) {
	    let layerId = (layer && layer.values_ && layer.values_.id) ? layer.values_.id : null;
	    return layerId;
	}
	
	
	/*
	 * General Popup
	 */
	openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard) {
		let that = this;
		$('#general-modal-content').html("");
				
		$('#general-modal-dialog').removeClass("modal-lg");
		$('#general-modal-dialog').removeClass("modal-sm");
		if (size && (size == "sm" || size == "SM")) {
			$('#general-modal-dialog').addClass("modal-sm");
		}
		if (size && (size == "lg" || size == "LG")) {
			$('#general-modal-dialog').addClass("modal-lg");
		}
		if (size && (size == "full" || size == "FULL" || size == "Full")) {
			$('#general-modal-dialog').addClass("modal-full");
		}
		
		let generalModalContent = ``;
		
		if (title && title.toString().trim() != "") {
			generalModalContent +=	`<div id="modal-header" class="modal-header">`;
			// if (keyboard) {
				generalModalContent +=	`<button type="button" class="close" data-dismiss="modal">&times;</button>`;
			// }
			generalModalContent +=		`<h4 class="modal-title">${title}</h4>`;
			generalModalContent +=	`</div>`;
		}
		
		generalModalContent +=	`
			<div id="modal-select-layer-to-filter-body" class="modal-body">${content}</div>
		`;
		
		if (okAction || cancelAction || cancelButtonMustCloseModal || okButtonMustCloseModal) {
			generalModalContent +=	`<div class="modal-footer">`;
			if (cancelAction || cancelButtonMustCloseModal) {
				if (!cancelButtonText || cancelButtonText.toString().trim() == "") {
					cancelButtonText = "Cancelar";
				}
				generalModalContent +=	`<button id="general-modal-cancel" type="button" class="btn btn-default">${cancelButtonText}</button>`;
			}
			if (okAction || okButtonMustCloseModal) {
				if (!okButtonText || okButtonText.toString().trim() == "") {
					okButtonText = "Ok";
				}
				generalModalContent +=	`<button id="general-modal-ok" type="button" class="btn btn-success">${okButtonText}</button>`;
			}
			generalModalContent +=	`</div>`;
		}
		
		$('#general-modal-content').html(generalModalContent);
		
		if (cancelAction) {
			$('#general-modal-cancel').click(function(e) {
				cancelAction(that);
				if (cancelButtonMustCloseModal) {
					$('#general-modal').modal('hide');
				}
			});
		} else if (cancelButtonMustCloseModal) {
			$('#general-modal-cancel').click(function(e) {
				$('#general-modal').modal('hide');
			});
		}
		
		if (okAction) {
			$('#general-modal-ok').click(function(e) {
				okAction(that);
				if (okButtonMustCloseModal) {
					$('#general-modal').modal('hide');
				}
			});
		} else if (okButtonMustCloseModal) {
			$('#general-modal-ok').click(function(e) {
				$('#general-modal').modal('hide');
			});
		}
		
		$('#general-modal').modal({
			backdrop: "static",
	        keyboard: false
		});

		// ***************************************************************************************//
		// HACER QUE EL MODAL PANEL SEA RESIZABLE Y DRAGGABLE AL MISMO TIEMPO
		
		$("#general-modal-content").css("resize","both");
		$("#general-modal-content").css("overflow","scroll");
		$("#general-modal-content").css("position","absolute");
		$("#general-modal-content").css("width","90%");
		$("#general-modal-content").css("height","max-content");
		$("#modal-header").css("cursor","move");

		// Make the DIV element draggable:
		dragElement(document.getElementById("general-modal-content"));

		function dragElement(elmnt) {
		  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		  if (document.getElementById("modal-header")) {
		    // if present, the header is where you move the DIV from:
		    document.getElementById("modal-header").onmousedown = dragMouseDown;
		  } else {
		    // otherwise, move the DIV from anywhere inside the DIV:
		    elmnt.onmousedown = dragMouseDown;
		  }

		  function dragMouseDown(e) {
		    e = e || window.event;
		    e.preventDefault();
		    // get the mouse cursor position at startup:
		    pos3 = e.clientX;
		    pos4 = e.clientY;
		    document.onmouseup = closeDragElement;
		    // call a function whenever the cursor moves:
		    document.onmousemove = elementDrag;
		  }

		  function elementDrag(e) {
		    e = e || window.event;
		    e.preventDefault();
		    // calculate the new cursor position:
		    pos1 = pos3 - e.clientX;
		    pos2 = pos4 - e.clientY;
		    pos3 = e.clientX;
		    pos4 = e.clientY;
		    // set the element's new position:
		    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		  }

		  function closeDragElement() {
		    // stop moving when mouse button is released:
		    document.onmouseup = null;
		    document.onmousemove = null;
		  }
		}
		// ***************************************************************************************//

	}

	closePopup() {
		$('#general-modal').modal('hide');
	}
	
	showMessage(title, message) {
	    let content = `${message}`;
	    let okAction = null;
	    let cancelAction = null;
	    let okButtonText = null;
	    let cancelButtonText = "Ok";
	    let cancelButtonMustCloseModal = true;
	    let okButtonMustCloseModal = false;
	    let size = null;
	    let backdrop = true;
	    let keyboard = true;

	    content += `
	        <style>
	            p {
	                margin: 0;
	            }
	        </style>
	    `;

	    this.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
	}
	
	closeGeneralModal(){
	    $('#general-modal').modal('hide');
	}
	
	
	/*
	 * Layer Switcher
	 */
	updateLayerSwitcher() {
		let that = this;
		let layersToShowCheckIds = [];
		let layerSwitcherContentHTML = ``;
		
		let layerGroups = this._map.getLayers().array_;
		for (let i = (layerGroups.length-1); i >= 0; i--) {
			let oneLayerGroup = layerGroups[i];
			let layerGroupTitle = oneLayerGroup && oneLayerGroup.values_ ? oneLayerGroup.values_.title : null;
			let layerGroupLayers = oneLayerGroup && oneLayerGroup.values_ && oneLayerGroup.values_.layers && oneLayerGroup.values_.layers.array_ ? oneLayerGroup.values_.layers.array_ : [];
			let layerGroupName = oneLayerGroup && oneLayerGroup.values_ ? oneLayerGroup.values_.name : null;
			if (layerGroupTitle && (!layerGroupName || layerGroupName != "LAYER_GROUP_TO_FILTERS")) {
				layerSwitcherContentHTML += `<div class="layer-switcher-group">`;
				layerSwitcherContentHTML += 	`<p class="layer-switcher-group-title"><span class="layer-switcher-group-title-text">${layerGroupTitle}</span><span class="layer-switcher-group-title-icon"></span></p>`;
				for (let j = (layerGroupLayers.length-1); j >= 0; j--) {
					let oneLayer = layerGroupLayers [j];					
					let layerTitle = oneLayer && oneLayer.values_ ? oneLayer.values_.title : null;
					let layerId = oneLayer && oneLayer.values_ ? oneLayer.values_.layerId : null;
					let layerType = oneLayer && oneLayer.values_ ? oneLayer.values_.type : null;
					let layerURL = oneLayer && oneLayer.values_ ? oneLayer.values_.layerURL : null;
					if (layerURL == null){
						layerURL = oneLayer && oneLayer.values_ ? oneLayer.values_.url : null;
					}
					
					
					let layerStyle = oneLayer && oneLayer.values_ ? oneLayer.values_.styles : null;
					let layer = oneLayer && oneLayer.values_ ? oneLayer.values_.layer : null;
					if (layer == null){
						layer = oneLayer && oneLayer.values_ ? oneLayer.values_.typeName : null;
					}
					let layerIsWMS = oneLayer && oneLayer.values_ ? oneLayer.values_.format == "WMS" : false;
					let layerIsWFS = oneLayer && oneLayer.values_ ? oneLayer.values_.format == "WFS" : false;
					let layerIsFilterLayer = oneLayer && oneLayer.values_ ? oneLayer.values_.isFilterLayer : false;
					let layerIsVisible = oneLayer.getVisible();
					let isPositionLayer = oneLayer && oneLayer.values_ ? (oneLayer.values_.format == "GEOLOCATION") : false;
					let checked = ""; // layerIsVisible ? "checked" : "";
					
					if (layerIsVisible) {
						layersToShowCheckIds.push(`layer-checkbox-${layerId}`);
					}

					let strokeWidth = oneLayer && oneLayer.values_ ? oneLayer.values_.strokeWidth : null;
					let strokeColor = oneLayer && oneLayer.values_ ? oneLayer.values_.strokeColor : null;
					let fillColor = oneLayer && oneLayer.values_ ? oneLayer.values_.fillColor : null;
					let layerAllowNewItem = oneLayer && oneLayer.values_ ? oneLayer.values_.alta : true;
					
					if (layerType !== "base" && layerType !== "BASE") {
						layerSwitcherContentHTML +=		`<div class="layer-switcher-layer-container">`;
						// layerSwitcherContentHTML += `<input
						// id="layer-checkbox-${layerId}"
						// class="layer-switcher-checkbox" type="checkbox"
						// ${checked}/>`;
						// layerSwitcherContentHTML += `<label
						// id="layer-label-${layerId}"
						// class="layer-switcher-layer-title"
						// for="layer-checkbox-${layerId}"
						// data-toggle="dropdown" aria-haspopup="true"
						// aria-expanded="false">${layerTitle}</label>`;
						
						layerSwitcherContentHTML +=	`
															<div class="dropdown layer-switcher-contextual-menu-selector">
																<input id="layer-checkbox-${layerId}" class="layer-switcher-checkbox" type="checkbox" ${checked}/>
																<label id="layer-label-${layerId}" layer-id="${layerId}" class="layer-switcher-layer-title" for="layer-checkbox-${layerId}">${layerTitle}</label>
						`;

						// Load filters menu HTML
						if (!layerIsFilterLayer && (layerIsWFS || layerIsWMS)) {
							layerSwitcherContentHTML += getLayerFiltersHTML(layerTitle, layerId, this._loadCustomAppFiltersCallback, this, layerIsWFS)
						}

						layerSwitcherContentHTML += `		</div>`;
							
						/*
						 * if (layerCanBeConsulted(oneLayer)) {
						 * layerSwitcherContentHTML += `<div
						 * id="layer-info-selector-${layerId}"
						 * class="layer-switcher-layer-selector
						 * layer-switcher-layer-info-selector ` + (checked ?
						 * `layer-switcher-layer-selector-inactive` :
						 * `layer-switcher-layer-selector-disabled`) + `"
						 * type="button"><i class="fas fa-search"></i></div>`; }
						 */
						if (layerIsEditable(oneLayer)) {
							layerSwitcherContentHTML += 	`<div id="layer-edit-selector-${layerId}" layerEditSelectorLayerTitle="${layerTitle}" class="layer-switcher-layer-selector layer-switcher-layer-edit-selector ` + (checked ? `layer-switcher-layer-selector-inactive` : `layer-switcher-layer-selector-disabled`) + `" type="button" data-toggle="tooltip" title="Modo edición"><i class="fas fa-pencil-alt"></i></div>`;
							/*
							 * if (layerAllowNewItem) { layerSwitcherContentHTML += `<div
							 * id="layer-add-selector-${layerId}"
							 * class="layer-switcher-layer-selector
							 * layer-switcher-layer-add-selector ` + (checked ?
							 * `layer-switcher-layer-selector-inactive` :
							 * `layer-switcher-layer-selector-disabled`) + `"
							 * type="button" data-toggle="tooltip"
							 * title="Agregar elemento"><i class="fas fa-plus"></i></div>`; }
							 */
						}
						layerSwitcherContentHTML += 	`<div id="layer-switcher-layer-is-filtered-${layerId}" layer-id="${layerId}" class="layer-switcher-layer-is-filtered layer-switcher-layer-is-filtered-hidden layer-switcher-layer-selector" type="button" data-toggle="tooltip" title="Borrar filtros"><i class="fas fa-eraser"></i></div>`;
						if (layerIsWMS && layerURL && layer) {
							layerSwitcherContentHTML += 	`<div id="layer-switcher-layer-reference-${layerId}" class="layer-switcher-layer-reference layer-switcher-layer-reference-hidden">`;
							layerSwitcherContentHTML +=			`<img src="${layerURL}?VERSION=1.1.0&SERVICE=WMS&REQUEST=GetLegendGraphic&STYLE=${layerStyle}&sld_version=1.1.0&LAYER=${layer}&FORMAT=image%2Fpng&legend_options=bgColor:0xF2F2F2"/>`;
							layerSwitcherContentHTML += 	`</div>`;
						} else if (layerIsWFS && !layerIsFilterLayer) {
							layerSwitcherContentHTML += 	`<div id="layer-switcher-layer-reference-${layerId}" class="layer-switcher-layer-reference layer-switcher-layer-reference-hidden">`;
							layerSwitcherContentHTML +=			`<img src="${layerURL}?VERSION=1.1.0&SERVICE=WMS&REQUEST=GetLegendGraphic&STYLE=${layerStyle}&sld_version=1.1.0&LAYER=${layer}&FORMAT=image%2Fpng&legend_options=bgColor:0xF2F2F2"/>`;
							layerSwitcherContentHTML += 	`</div>`;
						}

						layerSwitcherContentHTML += 	`</div>`;
					} else {
						layerSwitcherContentHTML += `<div class="layer-switcher-layer-container"><input id="layer-radio-${layerId}" class="layer-switcher-radio" type="radio" name="base-layer" value="layer-radio-${layerId}" ${layerIsVisible ? "checked" : ""}/><label class="layer-switcher-layer-title" for="layer-radio-${layerId}">${layerTitle}</label></div>`;
					}
				}
				layerSwitcherContentHTML += `</div>`;
			}
		}
		// layerSwitcherContentHTML += `</div>`;
		$("#layer-switcher-content").html(layerSwitcherContentHTML);

		that.updateFilterBadges(that);
		
		$(".layer-switcher-checkbox").change(function() {
			that.layerSwitcherCheckboxChange(this);
		});
		$(".layer-switcher-radio").change(function() {
			that.layerSwitcherRadioChange(that, this);
		});
		
		$("#find").click(function(){findMaps(that);});
		
		$("#deletefind").click(function(){eliminarBusqueda(that);});

		$(".layer-switcher-layer-edit-selector").click(function() {
			if (!$(this).hasClass("layer-switcher-layer-selector-disabled")) {
				let elementId = this.id;
				let elementCollectionId = elementId.split("-");
				let layerId = elementCollectionId[elementCollectionId.length-1];
				let layer = getLayerByLayerId(that, layerId);

				if (!that._activeLayerToEdit || (layer.values_.originalLayerTitle != that._activeLayerToEdit.values_.originalLayerTitle)) {
					if (!that._activeLayerToEdit) {
						that.setMode(null);
						that.setActiveLayerToEdit(layer);
						that.clearSnapInteractions(that);
						that.setMode("EDIT");
					} else {
						if (that.hasPendingChanges(that)) {
							alertify.confirm(
								'¿Desea cambiar de capa de edición?',
								'Los cambios pendientes serán descartados.',
								function() {
									that.cancelPendingChanges(that);
									that.setMode(null);
									that.setActiveLayerToEdit(layer);
									that.clearSnapInteractions(that);
									that.setMode("EDIT");
								},
								function() {
								}
							);
						} else {
							that.cancelPendingChanges(that);
							that.setMode(null);
							that.setActiveLayerToEdit(layer);
							that.clearSnapInteractions(that);
							that.setMode("EDIT");
						}
					}
				} else {
					if (that.hasPendingChanges(that)) {
						alertify.confirm(
			        		'¿Desea salir del modo edición?',
			        		'Los cambios pendientes serán descartados.',
			        		function() {
								that.cancelPendingChanges(that);
			        			$(this).removeClass("layer-switcher-layer-selector-active");
								$(this).addClass("layer-switcher-layer-selector-inactive");
								that.clearSnapInteractions(that);
								that.setMode(null);
			        		},
			        		function() {
			        		}
						);
					} else {
						that.cancelPendingChanges(that);
						$(this).removeClass("layer-switcher-layer-selector-active");
						$(this).addClass("layer-switcher-layer-selector-inactive");
						that.clearSnapInteractions(that);
						that.setMode(null);
					}
				}
			}
		});
		
		$(".layer-switcher-layer-title").contextmenu(function(e) {
			let layerId = $(this).attr("layer-id");
			if (layerId) {
				$(`#data-toggle-${layerId}`).dropdown('toggle');
			}
			e.preventDefault();
		});
		
		$(".contextual-menu-action").click(function() {
			let action = $(this).attr("action");
			let layerId = "";
			let layerIdFiltro = "";
			let filterBy = "";
			let errorMessage = null;
			let layer = null;
			let layerTitle = "";
			
			if (action) {
				switch(action) {
					case "filter":
						filterBy = $(this).attr("filter-by");
						layerId = $(this).attr("layer-id");
						
						if (that._mode == "ADD" && that.hasPendingChanges(that)) { 
							  errorMessage = "Debe salir del modo alta, confirmar ó descartar cambios para poder aplicar filtros."; 
						  } else if (that._mode == "EDIT" && that.hasPendingChanges(that)) {
							  errorMessage = "Debe salir del modo edición, confirmar ó descartar cambios para poder aplicar filtros."; 
						  }

						if (errorMessage) {
							alertify.error(errorMessage);
						} else {
							applyCommonFilters(filterBy, layerId, that, that.applyCustomApplicationFilter)
							// that.applyCustomApplicationFilter(filterBy,
							// layerId, that, callback)
						}
					break;
					case "mostrarEtiqueta":
						layerId = $(this).attr("layer-id");
						layerIdFiltro = $(this).attr("layer-id-filtro");
						that.setLayerLabelOption(that, layerId, layerIdFiltro, true)
					break;
					case "ocultarEtiqueta":
						layerId = $(this).attr("layer-id");
						layerIdFiltro = $(this).attr("layer-id-filtro");
						that.setLayerLabelOption(that, layerId, layerIdFiltro, false)
					break;
				}
			}
		});

		$(".layer-switcher-layer-is-filtered").click(function() {
			let errorMessage = null;
			 
		    if ((that._mode == "ADD" || that._mode == "EDIT") && that.hasPendingChanges(that)) { 
				errorMessage ="Debe salir del modo edición, confirmar ó descartar cambios para poder borrar filtros."; 
			}
			
			if (errorMessage) {
				alertify.error(errorMessage);
			} else {
				let layerId = $(this).attr("layer-id");
				let layer = getLayerByLayerId(that, layerId);
				let layerTitle;
				if (layer && layer.values_ && layer.values_.title) {
					layerTitle = layer.values_.originalLayerTitle;
				}
				alertify.confirm(
		        		'Borrar Filtros',
		        		'¿Seguro que desea borrar el filtro?',
		        		function() {
		        			if (that._drawPolygonInteraction) {
		    					that._map.removeInteraction(that._drawPolygonInteraction);
		    					that._drawPolygonInteraction = null;
		    				}
		        			// debugger;
		    				that.removeFiltersToLayer(layer);
		    				that.mantengoModoEdicion(true, layerTitle);
		        		},
		        		function() {
		        		}
					);
			}
		})
		
		this.makeLayerSwitcherColapsable();
		
		if (layersToShowCheckIds.length > 0) {
			layersToShowCheckIds.forEach(checkId => {$(`#${checkId}`).click();})
		}
	}
	
	updateFilterBadges(context) {
		let that = context;
		let layerGroups = that._map.getLayers().array_;
		for (let i = (layerGroups.length-1); i >= 0; i--) {
			let oneLayerGroup = layerGroups[i];
			let layerGroupLayers = oneLayerGroup && oneLayerGroup.values_ && oneLayerGroup.values_.layers && oneLayerGroup.values_.layers.array_ ? oneLayerGroup.values_.layers.array_ : [];
			for (let j = (layerGroupLayers.length-1); j >= 0; j--) {
				let oneLayer = layerGroupLayers [j];					
				let layerId = oneLayer && oneLayer.values_ ? oneLayer.values_.layerId : null;
				let layerTitle = oneLayer && oneLayer.values_ ? oneLayer.values_.title : null;
				let layerType = oneLayer && oneLayer.values_ ? oneLayer.values_.type : null;
				let layerIsWMS = oneLayer && oneLayer.values_ ? oneLayer.values_.format == "WMS" : false;
				let layerIsWFS = oneLayer && oneLayer.values_ ? oneLayer.values_.format == "WFS" : false;
				let layerIsFilterLayer = oneLayer && oneLayer.values_ ? oneLayer.values_.isFilterLayer : false;
				let layerIsVisible = oneLayer.getVisible();
				if (layerType !== "base" && layerType !== "BASE" && !layerIsFilterLayer) {
					let filterLayer = getFilterLayerByOriginalLayerTitle(that, layerTitle);
					let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
					let filterLayerHasFeatures = filterLayer && filterLayer.getSource() && filterLayer.getSource().getFeatures() ?  filterLayer.getSource().getFeatures().length > 0 : false;
					let filterLayerIsVisible = filterLayer ? filterLayer.getVisible() : null;
					if (filterLayerIsVisible != null) {
						if (filterLayerInUse && filterLayerIsVisible) {
							$(`#layer-switcher-layer-is-filtered-${layerId}`).removeClass("layer-switcher-layer-is-filtered-hidden");
						} else if (!$(`#layer-switcher-layer-is-filtered-${layerId}`).hasClass("layer-switcher-layer-is-filtered-hidden")) {
							$(`#layer-switcher-layer-is-filtered-${layerId}`).addClass("layer-switcher-layer-is-filtered-hidden")
						}
					}
				}
			}
		}
	}
	
	makeLayerSwitcherColapsable(element) {
		let that = this;
		
		$(".layer-switcher-group-title").click(function() {
			that.openLayerSwitcherGroup(this);
		});
		
		let layerGroups = $(".layer-switcher-group");
		
		for (let i = 0; i < (layerGroups.length-1); i++) {
			let oneGroup = layerGroups[i];
			$(oneGroup).addClass("hidden-layer-switcher-group");
		}
	}
		
	openLayerSwitcherGroup(element) {
		if ($(element) && $(element)[0] && $(element)[0].parentElement) {
			if($($(element)[0].parentElement).hasClass("hidden-layer-switcher-group")) {
				$($(element)[0].parentElement).removeClass("hidden-layer-switcher-group")
			} else {
				$($(element)[0].parentElement).addClass("hidden-layer-switcher-group")
			}
		}
	}
	
	layerSwitcherCheckboxChange(element) {
		//debugger;
		let that = this;
		let elementId = element.id;
		let elementIdCollection = elementId.split("-");
		let elementLayerId = elementIdCollection[elementIdCollection.length-1];
		let layer = getLayerByLayerId(that, elementLayerId);
		let isChecked = $("#"+elementId).is(":checked")

		if (!isChecked && (that._mode == "ADD" || that._mode == "EDIT") && layer.values_.originalLayerTitle == that._activeLayerToEdit.values_.originalLayerTitle) {
			if (that.hasPendingChanges(that)) {
				alertify.confirm(
					'Descartando cambios',
					'¿Seguro que desea cancelar los cambios?',
					function() {
						that.cancelPendingChanges(that);
						that.setMode(null);
						that.removeSecondaryMenu(that);
						if(isChecked){
							document.getElementById(elementId).checked = false;
						}
						continueEvent();
					},
					function() {
						if(!isChecked){
							document.getElementById(elementId).checked = true;
							alertify.notify('Los cambios continuarán pendientes de guardar o descartar.', 'custom', 4, function(){});
						}
						else{
							document.getElementById(elementId).checked = false;
						}
						// document.getElementById("layer-checkbox-19").checked = true;
					}
				);
			} else {
				that.cancelPendingChanges(that);
				that.setMode(null);
				that.removeSecondaryMenu(that);
				if(!isChecked){
					document.getElementById(elementId).checked = false;
				}
				continueEvent();
			}
		} else {
			if (!that.hasPendingChanges(that)) {
				if(!isChecked){
					document.getElementById(elementId).checked = false;
				}
				continueEvent();
			}
		}

		function continueEvent() {
			if (element.checked) {
				$(`#layer-edit-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-disabled");
				$(`#layer-edit-selector-${elementLayerId}`).addClass("layer-switcher-layer-selector-inactive");
				$(`#layer-edit-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-active");

				$(`#layer-add-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-disabled");
				$(`#layer-add-selector-${elementLayerId}`).addClass("layer-switcher-layer-selector-inactive");
				$(`#layer-add-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-active");

				$(`#layer-info-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-disabled");
				$(`#layer-info-selector-${elementLayerId}`).addClass("layer-switcher-layer-selector-inactive");
				$(`#layer-info-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-active");
			} else if (!element.checked) {
				$(`#layer-edit-selector-${elementLayerId}`).addClass("layer-switcher-layer-selector-disabled");
				$(`#layer-edit-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-inactive");
				$(`#layer-edit-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-active");

				$(`#layer-add-selector-${elementLayerId}`).addClass("layer-switcher-layer-selector-disabled");
				$(`#layer-add-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-inactive");
				$(`#layer-add-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-active");

				$(`#layer-info-selector-${elementLayerId}`).addClass("layer-switcher-layer-selector-disabled");
				$(`#layer-info-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-inactive");
				$(`#layer-info-selector-${elementLayerId}`).removeClass("layer-switcher-layer-selector-active");
			}

			let filterLayer = getFilterLayerByOriginalLayerTitle(that, layer.values_.title);

			if (!filterLayer || !filterLayer.getSource() || !filterLayer.values_ || !filterLayer.values_.inUse) {
				filterLayer = null;
			}

			if (layer == that._activeLayerToEdit) {
				that.setActiveLayerToEdit(null);
			}

			let layerOriginalLayerTitle = layer && layer.values_ ? layer.values_.originalLayerTitle : null;
			let activeLayerToAddOriginalLayerTitle = that._activeLayerToAdd && that._activeLayerToAdd.values_ ? that._activeLayerToAdd.values_.originalLayerTitle : null;

			if (layerOriginalLayerTitle == activeLayerToAddOriginalLayerTitle) {
				that.setActiveLayerToAdd(null);
			}

			that.layerSwitcherLayerChange(that, element, false, filterLayer);
		}
	}
	
	layerSwitcherRadioChange(context, element) {
		this.layerSwitcherLayerChange(context, element, true, null);
	}
	
	layerSwitcherLayerChange(context, element, isBaseLayer, filterLayer) {
		//debugger;
		let that = context;
		let elementId = element.id;
		if (elementId) {
			let elementIdCollection = elementId.split("-");
			let layerId = elementIdCollection[elementIdCollection.length-1];
			let layer = getLayerByLayerId(this, layerId);
			if (isBaseLayer) {
				this.hideBaseLayers();
			} else {
				this.updateActiveLayersToConsult();
			}
			if (filterLayer) {
				filterLayer.setVisible(element.checked);
				layer.setVisible(false);
			} else {
				layer.setVisible(element.checked);
			}
			if ($("#layer-switcher-layer-reference-" + layerId)){
				if (element.checked) {
					$("#layer-switcher-layer-reference-" + layerId).removeClass("layer-switcher-layer-reference-hidden");
				} else {
					$("#layer-switcher-layer-reference-" + layerId).addClass("layer-switcher-layer-reference-hidden");
				}
			}
		} else {
			let action = element.checked ? "prendido" : "apagado";
			let elementType = isBaseLayer ? "radiobutton" : "checkbox";
			console.error(`Se ha ${action} un ${elementType} del selector de capas sin Id asignado.`);
		}
		this.updateFilterBadges(this);
		if (that.snaps && that.snaps.length > 0) {
			that.createSnapInteractions(that);
		}
		that.refreshSnapInteractions(that);
	}


	/*
	 * Exports
	 */
	exportToPNG() {
		
		var hoy = new Date();
		var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
		var hora = hoy.getHours() + ':' + hoy.getMinutes();

		// this._exportButtonsDisabled = true;
        document.body.style.cursor = 'progress';
        this._map.once('postrender', function(event) {
            let canvas = document.getElementsByClassName('ol-viewport')[0].getElementsByTagName('canvas')[0]; // event.context.canvas;
            if (navigator.msSaveBlob) {
            	navigator.msSaveBlob(canvas.msToBlob(), 'map ' + fecha + ' ' + hora+'.png');
        	} else {
        		canvas.toBlob(function(blob) {
        			saveAs(blob, 'map ' + fecha + ' ' + hora+'.png');
        		});
            }
            // this._exportButtonsDisabled = false;
            document.body.style.cursor = 'auto';
        });
        this._map.renderSync();
	}
	
	exportToCSV() {
		this.exportLayerToFormat(WCMapExportCSVURL)
	}

	exportToGeoJson() {
		this.exportLayerToFormat(WCMapExportGeoJSONURL)
	}

	exportToKML() {
		this.exportLayerToFormat(WCMapExportKMLURL)
	}
	
	exportToSHP(){
		this.exportLayerToFormat(WCMapExportSHPURL)
	}

	exportLayerToFormat(WCMapExportFormatURL) {
		let that = this;
		let visibleLayers = getWFSVisibleLayers(that);
		urlsFile = new Array();
		let visibleLayersWMS = getWMSVisibleLayers(that);
		let extentActual = this._map.getView().calculateExtent(this._map.getSize());

		if ((visibleLayers && visibleLayers.length > 0) || ((visibleLayersWMS && visibleLayersWMS.length > 0) ) ) {
			let exportedLayersAmount = 0;
			if (visibleLayersWMS && visibleLayersWMS.length > 0){
				
				exportedLayersAmount = visibleLayersWMS.length;
				visibleLayersWMS.forEach(oneVisibleLayer => {
					let pknombre=getLayerPK(that, oneVisibleLayer.values_.originalLayerTitle);
					console.log("visibleLayersWMS")
					console.log("capa: " + oneVisibleLayer.values_.originalLayerTitle)
					console.log("pk: " + pknombre)
					if(pknombre == undefined)
					{
						exportedLayersAmount--;
					}
					else{
						let featuresPk = [];
						let body = {
							tabla : oneVisibleLayer.values_.databaseTableName,
							Origen_datos: oneVisibleLayer.values_.origenDatos
						};
	
						$.ajax({
							type: "POST",
							url: WCMapSelectTableURL,
							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(body),
							success: (Data) => {
								
								Data.forEach(oneFeature=> {
									let boxFeature = oneFeature['box'];
									if (boxFeature == undefined)
										boxFeature = oneFeature['BOX'];
									if (compareBoxExtent(boxFeature, extentActual)) {
										let pkvalor =  oneFeature[pknombre];
										featuresPk.push(pkvalor);
									}								
								});
								let databaseTableName = oneVisibleLayer && oneVisibleLayer.values_ && oneVisibleLayer.values_.databaseTableName ? oneVisibleLayer.values_.databaseTableName : "";
								let fuenteDB = oneVisibleLayer && oneVisibleLayer.values_ && oneVisibleLayer.values_.fuenteDB ? oneVisibleLayer.values_.fuenteDB : "";
								let dbms = oneVisibleLayer && oneVisibleLayer.values_ && oneVisibleLayer.values_.dbms ? oneVisibleLayer.values_.dbms : "";
								if (featuresPk.length > 0) {
									exportLayer(WCMapExportFormatURL, dbms, fuenteDB, databaseTableName, featuresPk, exportedLayersAmount*100,urlsFile,oneVisibleLayer.values_.title);
								}
							},
							error: (error) => {
								console.error("[wc-map.js] - visibleLayersWMS - SelectTable - ajax - error | error:");
								console.error(error);
								that.showMessage("Error", "<p>Error al selecionar los pkvalor.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1026.</small></p>");
							},
							context: that
						});
					}
				});
			}

			if(visibleLayers && visibleLayers.length > 0){
				
				visibleLayers.forEach(oneVisibleLayer => {
					let features = oneVisibleLayer && oneVisibleLayer.getSource() && oneVisibleLayer.getSource().getFeatures() ? oneVisibleLayer.getSource().getFeatures() : null;
					let featuresPk = [];
					let pknombre=getLayerPK(that, oneVisibleLayer.values_.originalLayerTitle);
					console.log("visibleLayers")
					console.log("capa: " + oneVisibleLayer.values_.originalLayerTitle)
					console.log("pk: " + pknombre)
					if(pknombre == undefined)
					{
						//exportedLayersAmount--;
					}
					else{
						if (features) {
							features.forEach (oneFeature => {
								let extentFeature;
								if (oneFeature.values_.the_geom)
									extentFeature = oneFeature.values_.the_geom.extent_;
								else if (oneFeature.values_.THE_GEOM)
									extentFeature = oneFeature.values_.THE_GEOM.extent_;
								else
									extentFeature = oneFeature.values_.geometry.extent_;
								if (compareExtents(extentFeature, extentActual)) {
									let pkvalor =  oneFeature.values_[pknombre];
									featuresPk.push(pkvalor);
								}
							});
	
							let databaseTableName = oneVisibleLayer && oneVisibleLayer.values_ && oneVisibleLayer.values_.databaseTableName ? oneVisibleLayer.values_.databaseTableName : "";
							let fuenteDB = oneVisibleLayer && oneVisibleLayer.values_ && oneVisibleLayer.values_.fuenteDB ? oneVisibleLayer.values_.fuenteDB : "";
							let dbms = oneVisibleLayer && oneVisibleLayer.values_ && oneVisibleLayer.values_.dbms ? oneVisibleLayer.values_.dbms : "";
							if (featuresPk.length > 0) {
								exportLayer(WCMapExportFormatURL, dbms, fuenteDB, databaseTableName, featuresPk, exportedLayersAmount*100,urlsFile,oneVisibleLayer.values_.title);
								exportedLayersAmount++;
							}
						}
					}
				});
			}
			
			if (exportedLayersAmount == 0) {
				alertify.error("No se han encontrado datos en las capas WFS visibles para poder exportar.");
			}
			else{
				let datosUrlFormat = WCMapExportFormatURL.split("/");
				if(datosUrlFormat[datosUrlFormat.length-1] !== "shp"){
					waitforZip(exportedLayersAmount,exportedLayersAmount*100);
				}				
			}
		} else {
			alertify.error("No se han encontrado capas WFS o WMS visibles para poder exportar.");
		}
	}
	
	/*
	 * exportToSHP() { let that = this; let visibleLayers =
	 * getWFSVisibleLayers(that); urlsFile = new Array(); let visibleLayersWMS =
	 * getWMSVisibleLayers(that);
	 * 
	 * if ((visibleLayers && visibleLayers.length > 0) || ((visibleLayersWMS &&
	 * visibleLayersWMS.length > 0) ) ) { let exportedLayersAmount = 0;
	 * 
	 * if(visibleLayersWMS && visibleLayersWMS.length > 0){ exportedLayersAmount =
	 * visibleLayersWMS.length; visibleLayersWMS.length
	 * visibleLayersWMS.forEach(oneVisibleLayer => { let gids = []; let body = {
	 * tabla : oneVisibleLayer.values_.databaseTableName, Origen_datos:
	 * oneVisibleLayer.values_.origenDatos };
	 * 
	 * $.ajax({ type: "POST", url: WCMapSelectTableURL, dataType: "json",
	 * contentType: "application/json", data: JSON.stringify(body), success:
	 * (Data) => { Data.forEach(oneFeature=> { let gid = oneFeature.gid if (gid ==
	 * undefined){ gid = oneFeature.GID }
	 * 
	 * gids.push(gid); }); let databaseTableName = oneVisibleLayer &&
	 * oneVisibleLayer.values_ && oneVisibleLayer.values_.databaseTableName ?
	 * oneVisibleLayer.values_.databaseTableName : ""; let fuenteDB =
	 * oneVisibleLayer && oneVisibleLayer.values_ &&
	 * oneVisibleLayer.values_.fuenteDB ? oneVisibleLayer.values_.fuenteDB : "";
	 * let dbms = oneVisibleLayer && oneVisibleLayer.values_ &&
	 * oneVisibleLayer.values_.dbms ? oneVisibleLayer.values_.dbms : ""; if
	 * (gids.length > 0) { exportLayer(WCMapExportSHPURL, dbms, fuenteDB,
	 * databaseTableName, gids,
	 * exportedLayersAmount*100,urlsFile,oneVisibleLayer.values_.title); }
	 * 
	 *  }, error: (error) => { console.error("[wc-map.js] - visibleLayersWMS -
	 * SelectTable - ajax - error | error:"); console.error(error);
	 * that.showMessage("Error", "<p>Error al selecionar los gid.</p><p>Intente
	 * nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro.
	 * Error: 1026.</small></p>"); }, context: that });
	 * 
	 * 
	 * }); }
	 * 
	 * if(visibleLayers && visibleLayers.length > 0){
	 * 
	 * visibleLayers.forEach(oneVisibleLayer => { let features = oneVisibleLayer &&
	 * oneVisibleLayer.getSource() && oneVisibleLayer.getSource().getFeatures() ?
	 * oneVisibleLayer.getSource().getFeatures() : null; let gids = [];
	 * 
	 * if (features) { features.forEach (oneFeature => { let gid = oneFeature &&
	 * oneFeature.values_ && oneFeature.values_.gid ? oneFeature.values_.gid :
	 * null; if (gid) { gids.push(gid); } else{ gid = oneFeature &&
	 * oneFeature.values_ && oneFeature.values_.GID ? oneFeature.values_.GID :
	 * null; if (gid) { gids.push(gid); } } });
	 * 
	 * let databaseTableName = oneVisibleLayer && oneVisibleLayer.values_ &&
	 * oneVisibleLayer.values_.databaseTableName ?
	 * oneVisibleLayer.values_.databaseTableName : ""; let fuenteDB =
	 * oneVisibleLayer && oneVisibleLayer.values_ &&
	 * oneVisibleLayer.values_.fuenteDB ? oneVisibleLayer.values_.fuenteDB : "";
	 * let dbms = oneVisibleLayer && oneVisibleLayer.values_ &&
	 * oneVisibleLayer.values_.dbms ? oneVisibleLayer.values_.dbms : ""; if
	 * (gids.length > 0) { exportLayer(WCMapExportSHPURL, dbms, fuenteDB,
	 * databaseTableName, gids,
	 * exportedLayersAmount*100,urlsFile,oneVisibleLayer.values_.title);
	 * exportedLayersAmount++; } } }); }
	 * 
	 * if (exportedLayersAmount == 0) { alertify.error("No se han encontrado
	 * datos en las capas WFS visibles para poder exportar."); } else{
	 * waitforZip(exportedLayersAmount,exportedLayersAmount*100); } } else {
	 * alertify.error("No se han encontrado capas WFS o WMS visibles para poder
	 * exportar."); } }
	 */
	
	mantengoModoEdicion(quitoFiltro, tituloLayerPantalla){
		// debugger;
		let that = this;
		let actualMode = that._mode;
		if(actualMode == "EDIT"){
			let layer = that._activeLayerToEdit;
			let layerTitle="";
			let layerId;
			if (layer && layer.values_ && layer.values_.title) {
				layerTitle = layer.values_.originalLayerTitle;
			} 
			if(layerTitle==tituloLayerPantalla){
				if(!quitoFiltro){
					that.cancelPendingChanges(that);
				}
				else{
					layer = getLayerByNameOrTitle(that, layerTitle);
					layer.setVisible(true);
				}
				$(`[layereditselectorlayertitle="${layerTitle}"]`).removeClass("layer-switcher-layer-selector-active");
				$(`[layereditselectorlayertitle="${layerTitle}"]`).addClass("layer-switcher-layer-selector-inactive");
				that.clearSnapInteractions(that);
				that.setMode(null);
				that.setActiveLayerToEdit(layer);
				that.setMode("EDIT");
			}
		}
	}
}

async function confirmarGuardarLuegoDeTraslado(that, oneFeature) {
	let changeToProcess = new PendingChange("UPDATE", that._activeLayerToEdit, oneFeature, "PENDING", false, true);
	that.addPendingChange(that, changeToProcess);
	if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
		that.processPendingChanges(that);
	}
	const id = oneFeature.id_;
	const index = that.featuresInUse.findIndex(f => f.id_ === id);
	if (index !== -1) {
		that.featuresInUse.splice(index, 1); // Si la feature ya estaba, la saco
	}
	if (!that._deletingVertices) {
		that.featuresInUse.push(oneFeature);
	}
	
	let layerTitle = that._activeLayerToEdit.values_.originalLayerTitle;
	if (typeof mostrarMensajeLuegoDeEditarGeometria != "undefined" && mostrarMensajeLuegoDeEditarGeometria.find(c => (c.layerTitle == layerTitle))) {
		let cartelMensaje = mostrarMensajeLuegoDeEditarGeometria.find(c => (c.layerTitle == layerTitle));
		
		let muestroCartelMensaje = await cartelMensaje.muestroMensaje(that);
		console.log(muestroCartelMensaje);
		if(muestroCartelMensaje == true){
			that.showMessage(cartelMensaje.titulo, "<p>"+cartelMensaje.mensaje+"</p>");
		}
	}
	
	
}

function confirmarGuardarLuegoDeBorrar(that, oneFeature) {
	let changeToProcess = new PendingChange("DELETE", that._activeLayerToEdit, that.selectedFeatures[0], "PENDING", false, true);
	that.addPendingChange(that, changeToProcess);
	if (changeToProcess && changeToProcess.layer && changeToProcess.layer.getSource()) {
		changeToProcess.feature.setStyle(new ol.style.Style({}));
	}
	if (that.select && that.select.getFeatures()) {
		that.select.getFeatures().clear();
	}
	if (changeToProcess && changeToProcess.layer && changeToProcess.layer.values_ && changeToProcess.layer.values_.autocommit) {
		that.processPendingChanges(that);
	}
}

function siHayQuePasarAHistorico(){
	hayQuePasarAHistorico = true;
}

function siHayQueEjecutarAccionLuegoDeBorrar(){
	hayQueEjecutarAccionLuegoDeBorrar = true;
}

window.customElements.define('wc-map', WCMap);
