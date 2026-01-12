function updateLayersInfoArray(context, layerTitles) {
	let that = context;
	that.layersInfo = []
	if (layerTitles) {
		for (let i = 0; i < layerTitles.length; i++) {
			let oneLayerTitle = layerTitles[i];
			$.ajax({
				type: "GET",
				url: WCMapGetLayerURL + '?capa=' + oneLayerTitle,
				success: function (data) {
					if (data) {
						that.layersInfo.push({layerTitle: oneLayerTitle, data});
					}
				}
			});
		}
	}
}

function addRequiredAttributes(feature, fidName, layer) {
    // Para todos, se genera un id autogenerado
    const tempUID = 'temp-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    feature.set(fidName, tempUID);
    // Atributos especificos para cada capa (por FKs)

    return tempUID;
}

function cargarCapas(map) {
	$.ajax({
		url: apiURL + "/layers",
		type: "GET",
		success: function(response) {
			let layers = "";
			if (response) {
				layers = response;
			}
			
			if (JSON.parse(layers).length == 1){
				setInterval(function(){logout(); }, 10000);
				alertify
				  .alert("Usuario invalido","El usuario no tiene los permisos para ingresar al sistema!!!", function(){
					  logout();
				  });
				
			}
			else{
				console.log('this=map layerHelper' + map)
				map.layers = layers;
			}

		},
		error: function(err) {
			alert("Ha ocurrido un error al cargar las capas. Por favor, intente nuevamente.");
		}
	});
}

async function loadLayersIntoGroups(layers, baseLayers, filterLayers, map, urlGeoserverMap) {
	let layerGroups = [];
	let layerId = 0;
	for (let i = 0; i < layers.length; i++) {
		let oneLayerGroup = layers[i];
		let groupLayers = [];
		for (let j = 0; j < oneLayerGroup.groupLayers.length; j++) {
			let oneLayer = oneLayerGroup.groupLayers[j];
			let layer = null;
			layerId++;
			let geometryTypeSplited = oneLayer.tipogeometria ? oneLayer.tipogeometria.split(".") : null;
			let geometryType = geometryTypeSplited ? geometryTypeSplited[geometryTypeSplited.length -1] : null;

			if (oneLayer.tipo === "base") {
				baseLayers.push(oneLayer);
			}
			//console.log("vengo con la capa " + oneLayer.nombre)
			if (oneLayer.tipoOrigen === "OL") {
				switch(oneLayer.source) {
					case "OSM":
						layer = new ol.layer.Tile({
							layerId,
							title: oneLayer.nombre,
							visible: oneLayer.visible,
							type: oneLayer.tipo,
							source: new ol.source.OSM()
						});
						break;
					case "TileImage":
						layer = new ol.layer.Tile({
							layerId,
							title: oneLayer.nombre,
							visible: oneLayer.visible,
							type: oneLayer.tipo,
							source:  new ol.source.TileImage({
								url: oneLayer.url
							})
						});
						break;
					case "XYZ":
						layer = new ol.layer.Tile({
							layerId,
							title: oneLayer.nombre,
							visible: oneLayer.visible,
							type: oneLayer.tipo,
							source:  new ol.source.XYZ({
								url: oneLayer.url,
								crossOrigin: "Anonymous"
							})
						});
						break;
					case "TileWMS":
						layer = new ol.layer.Tile({
							layerId,
							title: oneLayer.nombre,
							visible: oneLayer.visible,
							type: oneLayer.tipo,
							source:   new ol.source.TileWMS({
								url: oneLayer.url,
								params: {
									"FORMAT": oneLayer.formatToService,
									"VERSION": oneLayer.version,
									tiled: oneLayer.tiled,
									LAYERS: oneLayer.layers
								}
							})
						});
						break;
					default:
						console.log("Se ha intentado agregar una capa con formato " + oneLayer.source + ", el cual no está contemplado en el componente wc-map.");
						break;
				}
			} else {
				switch(oneLayer.format) {
					case "WMS":
						const WMStypeName = oneLayer.workspace+':'+oneLayer.capa;
						const WMSviewProjection = map.getView().getProjection();
						const WMSviewCenter = map.getView().getCenter();
						let WMSgeoserverStyles = await getWFSLayerStyles(oneLayer);

						layer = new ol.layer.Tile({
							layerId,
							title: oneLayer.title,
							originalLayerTitle: oneLayer.title,
							visible: oneLayer.visible,
							editable: oneLayer.editabe,
							type: oneLayer.tipo,
							typeName: WMStypeName,
							srsName: oneLayer.srsName,
							format: oneLayer.format,
							layerURL: oneLayer.url,
							layer: oneLayer.layers,
							layerWorkspace: oneLayer.workspace,
							layerName: oneLayer.capa,
							databaseTableName: oneLayer.nombreTabla,
							origenDatos: oneLayer.fuenteDB,
							fuenteDB: oneLayer.fuenteDB,
							dbms: oneLayer.dbms,
							geometryType: geometryType,
							styles: oneLayer.estilo ? oneLayer.estilo : "",
							url: oneLayer.url,
							WFSurl: urlGeoserverMap ? urlGeoserverMap + '/wfs': '',
							source: new ol.source.TileWMS({
								url: oneLayer.url,
								params: {
									"FORMAT": oneLayer.formatToService,
									"VERSION": oneLayer.version,
									tiled: oneLayer.tiled,
									STYLES: oneLayer.estilo ? oneLayer.estilo : "",
									opacity: oneLayer.opacity,
									LAYERS: oneLayer.layers.startsWith(':') ? oneLayer.layers.substring(1) : oneLayer.layers,
									tilesOrigin: oneLayer.tilesOrigin
								}
							})
						});

						if (oneLayer && !oneLayer.tipo || (oneLayer.tipo && oneLayer.tipo != "base")) {
							layerId++;
							let WMSfilterLayer = new ol.layer.Vector({
								layerId,
								name: "FILTER_LAYER_" + oneLayer.title,
								title: "Filtros " + oneLayer.title,
								originalLayerTitle: oneLayer.title,
								visible: true,
								editable: false,
								alta: false,
								baja: false,
								type: oneLayer.type,
								isWFS: true,
								url: urlGeoserverMap ? urlGeoserverMap + '/wfs': '',
								srsName: oneLayer.srsName,
								fuenteDB: oneLayer.fuenteDB,
								dbms: oneLayer.dbms,
								databaseTableName: oneLayer.nombreTabla,
								format: oneLayer.format,
								typeName: WMStypeName,
								layerWorkspace: oneLayer.workspace,
								layerName: oneLayer.capa,
								origenDatos: oneLayer.fuenteDB,
								mostrarEtiquetas:true,
								// geometryType: geometryType,
								// strokeColor: oneLayer.strokeColor,
								// strokeWidth: oneLayer.strokeWidth,
								// fillColor: oneLayer.fillColor,
								autocommit: false,
								canSplit: false,
								canDeleteVertex: false,
								canClone: false,
								canMerge:false,
								geomEdit: false,
								styles: oneLayer.estilo ? oneLayer.estilo : "",
								timestamp: new Date().getTime(),
								source: new ol.source.Vector({wrapX: false}),
								isFilterLayer: true,
								inUse: false
							});
							setTimeout(generateLayerStyles(WMSgeoserverStyles,WMSfilterLayer,WMSviewProjection,WMSviewCenter,oneLayer.estilo ? oneLayer.estilo : null), 250);

							
							filterLayers.push(WMSfilterLayer);
						}
						break;
					case "WFS":
						const typeName = oneLayer.workspace+':'+oneLayer.capa;
						const viewProjection = map.getView().getProjection();
						const viewCenter = map.getView().getCenter();
						let geoserverStyles = await getWFSLayerStyles(oneLayer);
						if(!oneLayer.mostrarEtiquetas){
							oneLayer.mostrarEtiquetas=true;
						}
						layer = new ol.layer.Vector({
							layerId,
							title: oneLayer.title,
							originalLayerTitle: oneLayer.title,
							visible: oneLayer.visible,
							editable: oneLayer.editabe,
							alta: oneLayer.alta === true || oneLayer.alta === false ? oneLayer.alta : oneLayer.editabe,
							baja: oneLayer.baja === true || oneLayer.baja === false ? oneLayer.baja : oneLayer.editabe,
							type: oneLayer.type,
							isWFS: true,
							url: oneLayer.url,
							srsName: oneLayer.srsName,
							fuenteDB: oneLayer.fuenteDB,
							dbms: oneLayer.dbms,
							format: oneLayer.format,
							typeName: typeName,
							layerWorkspace: oneLayer.workspace,
							layerName: oneLayer.capa,
							databaseTableName: oneLayer.nombreTabla,
							origenDatos: oneLayer.fuenteDB,
							geometryType: geometryType,
							strokeColor: oneLayer.strokeColor,
							strokeWidth: oneLayer.strokeWidth,
							fillColor: oneLayer.fillColor,
							autocommit: oneLayer.autocommit,
							canSplit: oneLayer.canSplit,
							canDeleteVertex: oneLayer.canDeleteVertex,
							canClone: oneLayer.canClone,
							canMerge: (oneLayer.canMerge ? oneLayer.canMerge:false),
							geomEdit: oneLayer.geomedit,
							styles: oneLayer.estilo ? oneLayer.estilo : "",
							mostrarEtiquetas:true,
							source: new ol.source.Vector({
								loader: function (extent) {
									$.ajax(oneLayer.url, {
										type: 'GET',
										data: {
											service: oneLayer.service,
											version: oneLayer.version,
											request: 'GetFeature',
											typename: typeName,
											srsname: oneLayer.srsName,
											bbox: extent.join(',') + ',' + oneLayer.srsName
										}
									}).done(function (response) {
										layer.getSource().addFeatures(new ol.format.WFS().readFeatures(response));
										setTimeout(generateLayerStyles(geoserverStyles,layer,viewProjection,viewCenter,oneLayer.estilo ? oneLayer.estilo : null), 250);
									});
								},
								strategy: ol.loadingstrategy.bbox,
								projection: 'EPSG:32721'
							})
						});

						layerId++;
						let filterLayer = new ol.layer.Vector({
							layerId,
							name: "FILTER_LAYER_" + oneLayer.title,
							title: "Filtros " + oneLayer.title,
							originalLayerTitle: oneLayer.title,
							visible: true,
							editable: oneLayer.editabe,
							alta: oneLayer.alta === true || oneLayer.alta === false ? oneLayer.alta : oneLayer.editabe,
							baja: oneLayer.baja === true || oneLayer.baja === false ? oneLayer.baja : oneLayer.editabe,
							type: oneLayer.type,
							isWFS: true,
							url: oneLayer.url,
							srsName: oneLayer.srsName,
							fuenteDB: oneLayer.fuenteDB,
							dbms: oneLayer.dbms,
							databaseTableName: oneLayer.nombreTabla,
							format: oneLayer.format,
							typeName: typeName,
							layerWorkspace: oneLayer.workspace,
							layerName: oneLayer.capa,
							origenDatos: oneLayer.fuenteDB,
							geometryType: geometryType,
							strokeColor: oneLayer.strokeColor,
							strokeWidth: oneLayer.strokeWidth,
							fillColor: oneLayer.fillColor,
							autocommit: oneLayer.autocommit,
							canSplit: oneLayer.canSplit,
							canDeleteVertex: oneLayer.canDeleteVertex,
							canClone: oneLayer.canClone,
							canMerge: (oneLayer.canMerge ? oneLayer.canMerge:false),
							geomEdit: oneLayer.geomedit,
							styles: oneLayer.estilo ? oneLayer.estilo : "",
							timestamp: new Date().getTime(),
							source: new ol.source.Vector({wrapX: false}),
							isFilterLayer: true,
							inUse: false,
							mostrarEtiquetas:true
						});
						setTimeout(generateLayerStyles(geoserverStyles,filterLayer,viewProjection,viewCenter,oneLayer.estilo ? oneLayer.estilo : null), 250);

						filterLayers.push(filterLayer);
						break;
					case "GEOLOCATION":
						let view = map.getView();
						let geolocation = new ol.Geolocation({
							trackingOptions: {
								enableHighAccuracy: true
							},
							projection: view.getProjection()
						});

						geolocation.on('change', function() {});

						geolocation.on('error', function(error) {
							console.error("Geolocation error:")
							console.error(error.message);
						});

						let accuracyFeature = new ol.Feature();

						geolocation.on('change:accuracyGeometry', function() {
							accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
						});

						let positionFeature = new ol.Feature();

						positionFeature.setStyle(new ol.style.Style({
							image: new ol.style.Circle({
								radius: 6,
								fill: new ol.style.Fill({
									color: '#3399CC'
								}),
								stroke: new ol.style.Stroke({
									color: '#fff',
									width: 2
								})
							})
						}));

						geolocation.on('change:position', function() {
							let coordinates = geolocation.getPosition();
							positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
						});

						geolocation.setTracking(true);

						layer = new ol.layer.Vector({
							layerId,
							map: map,
							title: oneLayer.title,
							visible: oneLayer.visible,
							source: new ol.source.Vector({
								features: [accuracyFeature, positionFeature]
							}),
							format: oneLayer.format
						});
						break;
					default:
						console.log("Se ha intentado agregar una capa con formato " + oneLayer.format + ", el cual no está contemplado en el componente wc-map.");
						break;
				}
			}
			if (layer) {
				groupLayers.push(layer);
			}
		}

		let layerGroup = new ol.layer.Group({
			title: oneLayerGroup.groupTitle,
			layers: groupLayers
		});

		layerGroups.push(layerGroup);
	}
	return layerGroups;
}

async function getFeaturesInfo(evt, that) {
	let layersToConsult = that._activeLayersToConsult;
	that.attributesToSave = [];
	
	if (layersToConsult && layersToConsult.length > 0) {
		let i = 0;
		let elementFound = false;
		let dataToPopup = { hasData: false, wmsData: null, wfsData: null };

		let parentData = null;
		let layerAttributes = null;
		let childLayerTitle = null;
		let childLayerFK = null;
		let parentsToLoadChildren = [];
		let nombreTabla = null;
		let capaTitle = "";
		while (!elementFound && i < layersToConsult.length) {
			let oneLayerToConsult = layersToConsult[i];
			capaTitle = oneLayerToConsult.values_.title;

			let layerTitle = oneLayerToConsult && oneLayerToConsult.values_ ? oneLayerToConsult.values_.originalLayerTitle : "";
			if (!layerTitle || layerTitle == "") {
				layerTitle = oneLayerToConsult.values_.title;
			}
			let data = getLayerInfo(that, layerTitle); // esto tiene la data de la capa. E.g. title , params, etc....
			parentData = data;
			if (data && data['atributos']) {
				layerAttributes = data['atributos'];
				childLayerTitle = data['child'] && data['child']['layer'] ? data['child']['layer'] : null;
				childLayerFK = data['child'] && data['child']['parent_id_attribute'] ? data['child']['parent_id_attribute'] : null;
				nombreTabla = data['nombreTabla'];
				parentsToLoadChildren = [];

				if (
					// Si la capa es WMS pido los datos al GeoServer
					!oneLayerToConsult.values_.isFilterLayer && (
					(
							oneLayerToConsult.values_ && oneLayerToConsult.values_.format && oneLayerToConsult.values_.format == "WMS") ||
							(data.datos && data.datos.tipo && data.datos.tipo == "WMS")
					)
				) {
					let view = that._map.getView();
					let viewResolution = view.getResolution();
					let layerSource = oneLayerToConsult.getSource();
					if (layerSource.getGetFeatureInfoUrl) {
						let url = layerSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:32721', {'INFO_FORMAT': 'application/json'});
						if (url) {
							url = url + '&FEATURE_COUNT=1000';
							await getFeatureInfo(url).then(await async function (getFeatureInfoData) {
								if (getFeatureInfoData) {
									let json = getFeatureInfoData;
									if (isJsonParsable(json)) {
										json = JSON.parse(getFeatureInfoData.toString());
									}

									if (json && json.features && json.features.length > 0) {
										let features = json.features;
										dataToPopup.hasData = true;
										dataToPopup.wmsData = features;
										elementFound = true;
									}
								}
							}).catch((error) => {
								console.error("Error en getFeatureInfo | error:");
								console.error(error);
							});
						}
					}
					
				} else if (
					// Si la capa es WFS, ya tengo los datos en memoria
					oneLayerToConsult.values_ && oneLayerToConsult.values_.isWFS ||
					oneLayerToConsult.values_.isFilterLayer
				) {
					let features = [];
					that._map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
						if (layer == oneLayerToConsult) {
							features.push(feature);
							elementFound = true;
						}
					});
					if (features && features.length > 0) {
						dataToPopup.hasData = true;
						dataToPopup.wfsData = features;
					}
				}
			} else {
				that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1010.</small></p>");
			}
			i++;
		}

		let title = "No se han encontrado datos",
			content = `<p>No se han encontrado datos para la capa y coordenadas seleccionadas.</p>`,
			okAction = null,
			cancelAction = null,
			okButtonText = null,
			cancelButtonText = "Cerrar",
			cancelButtonMustCloseModal = true,
			okButtonMustCloseModal = false,
			size = null,
			backdrop = true,
			keyboard = true;
		if (dataToPopup && dataToPopup.hasData && dataToPopup.wmsData) {
			title = "Información del elemento: " + capaTitle;
			content = ``;
			size = "FULL";
			let headerContent = '';

			headerContent +=		`<ul class="nav nav-tabs" id="nav-tab-header" role="tablist">`;

			content +=	`<div class="tab-content" id="nav-tab-content" style="margin-top: 20px; padding: 0 20px;">`;
			let featureIndex = 0;
			for (let i = 0; i < dataToPopup.wmsData.length; i++) {
				let oneFeature = dataToPopup.wmsData[i];
				if (oneFeature.properties) {
					let values = oneFeature.properties;
					let merged = values;
					if (nombreTabla){
						merged = await getCalcFields(values, nombreTabla);
					}

					if (oneFeature.properties[parentData.pk] == undefined){
						oneFeature.properties[parentData.pk] = i +1;
					}
					else if(parentData.pk != undefined && oneFeature.properties[parentData.pk] != undefined){
						oneFeature.properties[parentData.pk] =oneFeature.properties[parentData.pk];
					}

					headerContent +=	(`<li class="` + (featureIndex == 0 ? ` active` : ``) + `"><a class="nav-item nav-link` + (featureIndex == 0 ? ` active` : ``) + `" id="nav-tab-${featureIndex}" data-toggle="tab" href="#nav-content-${featureIndex}" role="tab" aria-controls="nav-content-${featureIndex}" aria-selected="` + (featureIndex == 0 ? `true` : `false`) + `"> ` + (oneFeature.properties[parentData.pk]) + `</a></li>`);
					content +=	(`<div class="tab-pane fade` + (featureIndex == 0 ? ` in active` : ``) + `" id="nav-content-${featureIndex}" role="tabpanel" aria-labelledby="nav-tab-${featureIndex}">`);
					content +=		`<form class="form-horizontal">`;
					for (let key in layerAttributes) {
						content += getInputFromAttribute(that, layerAttributes[key], merged, true, nombreTabla);
					}
					content +=		`</form>`;

					if (childLayerTitle && childLayerFK) {
						content += 	`<div id="children-table-container-${feature.values_[parentData.pk]}" style="margin-top: 20px;" class="text-center">`;
						content += 		`<p>Cargando hijos...</p>`;
						content += 	`</div>`;
						parentsToLoadChildren.push(feature.values_[parentData.pk]);
					}

					content +=	`</div>`;
				}
				featureIndex++;
			}
			headerContent +=	`</ul>`;
			content +=	`</div>`;
			content = headerContent + content;
		} else if (dataToPopup && dataToPopup.hasData && dataToPopup.wfsData) {
			/* Dibujo los datos del padre (maestro) */
			title = "Información del elemento: " + capaTitle;
			content = ``;
			size = "FULL";
			let headerContent = '';

			headerContent +=		`<ul class="nav nav-tabs" id="nav-tab-header" role="tablist">`;

			content +=	`<div class="tab-content" id="nav-tab-content" style="margin-top: 20px; padding: 0 20px;">`;
			let featureIndex = 0;
			for (let i = 0; i < dataToPopup.wfsData.length; i++) {
				let oneFeature = dataToPopup.wfsData[i];
				if (oneFeature.values_) {
					let values = oneFeature.values_;
					let merged = values;
					if (nombreTabla){
						merged = await getCalcFields(values, nombreTabla);
					}

					if (oneFeature.values_[parentData.pk] == undefined){
						oneFeature.values_[parentData.pk] = i +1;
					}

					headerContent +=	(`<li class="` + (featureIndex == 0 ? ` active` : ``) + `"><a class="nav-item nav-link` + (featureIndex == 0 ? ` active` : ``) + `" id="nav-tab-${featureIndex}" data-toggle="tab" href="#nav-content-${featureIndex}" role="tab" aria-controls="nav-content-${featureIndex}" aria-selected="` + (featureIndex == 0 ? `true` : `false`) + `"> ` + (oneFeature.values_[parentData.pk]) + `</a></li>`);
					content +=	(`<div class="tab-pane fade` + (featureIndex == 0 ? ` in active` : ``) + `" id="nav-content-${featureIndex}" role="tabpanel" aria-labelledby="nav-tab-${featureIndex}">`);
					content +=		`<form class="form-horizontal">`;
					for (let key in layerAttributes) {
						content += getInputFromAttribute(that, layerAttributes[key], merged, true);
					}
					content +=		`</form>`;

					if (childLayerTitle && childLayerFK) {
						content += 	`<div id="children-table-container-${oneFeature.values_[parentData.pk]}" style="margin-top: 20px;" class="text-center">`;
						content += 		`<p>Cargando hijos...</p>`;
						content += 	`</div>`;
						parentsToLoadChildren.push(oneFeature.values_[parentData.pk]);
					}

					content +=	`</div>`;
				}
				featureIndex++;
			}
			headerContent +=	`</ul>`;
			content +=	`</div>`;
			content = headerContent + content;

			// Cargo y dibujo los hijos (detalle)
			if (childLayerTitle && childLayerFK && parentsToLoadChildren && parentsToLoadChildren.length > 0) {
				setTimeout(function () {
					let childTableName = null;
					let childAttributes = null;
					$.ajax({
						type: "GET",
						url: WCMapGetLayerURL + '?capa=' + childLayerTitle,
						success: (childData) => {
							childTableName = childData && childData['nombreTabla'] ? childData['nombreTabla'] : null;
							childAttributes = childData && childData['atributos'] ? childData['atributos'] : null;
							if (childTableName && childTableName.length > 0) {
								parentsToLoadChildren.forEach(onePKValue => {
									let body = {
										tabla: childTableName,
										pknombre: childLayerFK,
										pkvalor: onePKValue,
										Origen_datos: parentData['Origen_datos']
									};
									$.ajax({
										type: "POST",
										url: WCMapSelectTableURL,
										dataType: "json",
										contentType: "application/json",
										data: JSON.stringify(body),
										success: (childrenData) => {
											let childrenHTML = `<table class="table table-striped table-condensed">`;
											childrenHTML += getChildrenTableHead(childData, false, true);
											if (childrenData && childrenData.length > 0) {
												if(typeof darPrioridad == 'function'){
													childrenData = darPrioridad(childrenData, childLayerTitle);
												}
												let numerador = 0;
												childrenData.forEach((ocd, ocdIndex) => {
													let childIdentification = ocd[parentData['child']['parent_id_attribute']] + "_" + ocdIndex;
													childrenHTML += `<tr id="table-row-${childIdentification}">`;
													for (let key in childAttributes) {
														childrenHTML += getTDInputFromAttribute(that, null, childAttributes[key], ocd, true, null, numerador);
													}
													numerador = numerador+1;
													childrenHTML += `</tr>`;
												});
											}
											childrenHTML += `</table>`;

											$(`#children-table-container-${onePKValue}`).html(childrenHTML);
										},
										error: (error) => {
											console.error("[wc-map.js] - consultLayer - SelectTable - ajax - error | error:");
											console.error(error);
											that.showMessage("Error", "<p>Uno de los hijos ha fallado en su carga.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1023.</small></p>");
										},
										context: that
									});
								});
							} else {
								that.showMessage("Error", "<p>No se ha podido cargar la información de la capa de los hijos.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1022.</small></p>");
							}
						},
						error: (error) => {
							console.error("[wc-map.js] - consultLayer - SelectTable - ajax - error | error:");
							console.error(error);
							that.showMessage("Error", "<p>No se ha podido cargar la información de la capa de los hijos.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1021.</small></p>");
						},
						context: that
					});
				}, 100);
			}
		}

		that.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
	} else {
		console.error("Error 1000: Se ha llegado al método de consulta de una capa sin tener ninguna capa consultable encendida.");
	}
}

function getFilterLayerByOriginalLayerTitle(context, originalLayerTitle) {
	let that = context;
	let filterLayer = null;
	
	const layerGroups = that && that._map ? that._map.getLayers().array_ : null;
	for (let i = 0;layerGroups && i < layerGroups.length; i++) {
		const layerGroup = layerGroups[i].values_;
		if (layerGroup.layers) {
			const layers = layerGroup.layers.array_;

			if (layerGroup && layerGroup.name && layerGroup.name === 'LAYER_GROUP_TO_FILTERS') {
				for (let j = 0; j < layers.length; j++) {
					const oneLayer = layers[j];
					if (oneLayer && oneLayer.values_ && oneLayer.values_.name && oneLayer.values_.name === ("FILTER_LAYER_" + originalLayerTitle)) {
						filterLayer = oneLayer;
						break;
					}
				}
			}
		}
	}
	
	return filterLayer;
}

function getLayerByLayerId(context, layerId) {
	let that = context;
	let layer = null;
	const layerGroups = that._map.getLayers().array_;
	for (let i = 0; i < layerGroups.length && layer == null; i++) {
		const layerGroup = layerGroups[i].values_;
		if (layerGroup.layers) {
			const layers = layerGroup.layers.array_;

			for (let j = 0; j < layers.length && layer == null; j++) {
				const oneLayer = layers[j];
				if (oneLayer.values_ && oneLayer.values_  && oneLayer.values_.layerId == layerId) {
					layer = oneLayer;
				}
			}				
		}
	}
	
	return layer;
}

function getLayerByNameOrTitle(context, nameOrTitle) {
	let that = context;
	let found = false;
	let originalLayer = null;
	
	const layerGroups = that._map.getLayers().array_;
	for (let i = 0; i < layerGroups.length && !found; i++) {
		const layerGroup = layerGroups[i].values_;
		if (layerGroup.layers) {
			const layers = layerGroup.layers.array_;
			for (let j = 0; j < layers.length && !found; j++) {
				const oneLayer = layers[j];
				if (oneLayer && oneLayer.values_ && oneLayer.values_.name && oneLayer.values_.name === nameOrTitle) {
					originalLayer = oneLayer;
					found = true;
				} else if (oneLayer && oneLayer.values_ && oneLayer.values_.title && oneLayer.values_.title === nameOrTitle) {
					originalLayer = oneLayer;
					found = true;
				}
			}
		}
	}
	
	return originalLayer;
}

function getWFSVisibleLayers(context) {
	let that = context;
	let layersToReturn = [];
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
			if (layerType !== "base" && layerType !== "BASE" && layerIsWFS && !layerIsFilterLayer ) {
				let filterLayer = getFilterLayerByOriginalLayerTitle(that, layerTitle);
				let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
				let filterLayerHasFeatures = filterLayer && filterLayer.getSource() && filterLayer.getSource().getFeatures() ?  filterLayer.getSource().getFeatures().length > 0 : false;
				let filterLayerIsVisible = filterLayer.getVisible();
				if (filterLayerInUse && filterLayerIsVisible) {
					layersToReturn.push(filterLayer);
				} else if (layerIsVisible) {
					layersToReturn.push(oneLayer);
				}
			}
			else if (layerType !== "base" && layerType !== "BASE" && layerIsWMS  && !layerIsFilterLayer ){
				let filterLayer = getFilterLayerByOriginalLayerTitle(that, layerTitle);
				let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
				let filterLayerHasFeatures = filterLayer && filterLayer.getSource() && filterLayer.getSource().getFeatures() ?  filterLayer.getSource().getFeatures().length > 0 : false;
				let filterLayerIsVisible = filterLayer.getVisible();
				if (filterLayerInUse && filterLayerIsVisible) {
					layersToReturn.push(filterLayer);
				} 
			}
		}
	}
	return layersToReturn;
}

function getWMSVisibleLayers(context) {
	let that = context;
	let layersToReturn = [];
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
			if (layerType !== "base" && layerType !== "BASE" && layerIsWMS  && !layerIsFilterLayer && !layerIsWFS && layerIsVisible ){
				let filterLayer = getFilterLayerByOriginalLayerTitle(that, layerTitle);
				let filterLayerInUse = filterLayer && filterLayer.values_ ? filterLayer.values_.inUse : false;
				let filterLayerHasFeatures = filterLayer && filterLayer.getSource() && filterLayer.getSource().getFeatures() ?  filterLayer.getSource().getFeatures().length > 0 : false;
				let filterLayerIsVisible = filterLayer.getVisible();
				if (!filterLayerInUse || !filterLayerIsVisible) {
					layersToReturn.push(oneLayer);
				} 
			}
		}
	}
	return layersToReturn;
}

function getWFSLayerStyles(layer) {
	let layerName = layer.workspace + ":" + layer.capa;
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "GET",
			url: WCMapGetWFSLayerStyles + '&layers=' + layerName,
			contentType: "application/xml",
			success: function (successData) {
				resolve(successData);
			},
			error: function (error) {
				console.log('[layerHelper.js] - getWFSLayerStyles | error:');
				console.log(error);
				reject(error);
			}
		});
	});
}

function generateLayerStyles(text,layer,viewProjection,viewCenter,estilo) {
	let sldObject = SLDReader.Reader(text);
	
	if (sldObject.layers){
		let sldLayer = SLDReader.getLayer(sldObject);
		let style;

		if (estilo != null) {
			style = SLDReader.getStyle(sldLayer,estilo);
		} else {
			style = SLDReader.getStyle(sldLayer);
		}
		
		let featureTypeStyle = null;
		
		if( style && style.featuretypestyles && style.featuretypestyles[0]){
			let N = style.featuretypestyles.length;
			
			for (let i = 1;i<N;i++){
				style.featuretypestyles[0].rules = style.featuretypestyles[0].rules.concat(style.featuretypestyles[i].rules);
			}
			
			featureTypeStyle =style.featuretypestyles[0];
		}
		
		if (featureTypeStyle) {
			layer.setStyle(SLDReader.createOlStyleFunction(featureTypeStyle, {
				convertResolution: viewResolution => {
					return ol.proj.getPointResolution(viewProjection, viewResolution, viewCenter);
				},
				imageLoadedCallback: () => {
					// Signal OpenLayers to redraw the layer when an image icon has loaded.
					// On redraw, the updated symbolizer with the correct image scale will be used to draw the icon.
					layer.changed();
				},
				layerId: layer.values_.layerId
			}));
		}
	}
}

function getGeoserverStyleByStylesAndLayerStyleName(geoServerStyles, layerStyleName) {
	let geoServerStyle = null;
	let geoServerStylesIsArray = Array.isArray(geoServerStyles);
	if (!geoServerStylesIsArray) {
		if (geoServerStyles["sld:Name"] == layerStyleName) {
			geoServerStyle = geoServerStyles;
		}
	} else {
		let i = 0;
		while (geoServerStyle == null && i < geoServerStyles.length) {
			if (geoServerStyles[i]["sld:Name"] == layerStyleName) {
				geoServerStyle = geoServerStyles[i];
			}
			i++;
		}
	}
	return geoServerStyle;
}

function buildWFSStyleFromGeoServerStyleJSON(feature, geoServerStyleJSON) {
	let style = null;

	if (geoServerStyleJSON) {
		let featureTypeStyle = geoServerStyleJSON["sld:FeatureTypeStyle"];
		if (!Array.isArray(featureTypeStyle)) {
			let rule = featureTypeStyle["sld:Rule"];
			if (!Array.isArray(rule)) {
				let pointSymbolizer = rule["sld:PointSymbolizer"];
				let lineSymbolizer = rule["sld:LineSymbolizer"];
				let polygonSymbolizer = rule["sld:PolygonSymbolizer"];

				if (pointSymbolizer) {
					let graphic = pointSymbolizer["sld:Graphic"];
					let pointSize = graphic ? graphic["sld:Size"] : null;
					let pointFill = graphic && graphic["sld:Mark"] && graphic["sld:Mark"]["sld:Fill"] && graphic["sld:Mark"]["sld:Fill"]["sld:CssParameter"] ? graphic["sld:Mark"]["sld:Fill"]["sld:CssParameter"]["#text"] : null;
					let pointStroke = graphic && graphic["sld:Mark"] && graphic["sld:Mark"]["sld:Stroke"] && graphic["sld:Mark"]["sld:Stroke"]["sld:CssParameter"] ? graphic["sld:Mark"]["sld:Stroke"]["sld:CssParameter"] : null;
					let pointStrokeColor = getCssParameterByname(pointStroke, "stroke");
					let pointStrokeWidth = getCssParameterByname(pointStroke, "stroke-width");

					let circleObject = {};
					if (pointSize) {
						circleObject["radius"] = pointSize;
					}
					if (pointFill) {
						circleObject["fill"] = new ol.style.Fill({
							color: pointFill
						})
					}
					let strokeObject = null;
					if (pointStrokeColor || pointStrokeWidth) {
						let strokeObject2 = {};
						if (pointStrokeColor) {
							strokeObject2["color"] = pointStrokeColor;
						}
						if (pointStrokeWidth) {
							strokeObject2["width"] = pointStrokeWidth;
						}
						strokeObject = new ol.style.Stroke(strokeObject2);
					}
					if (strokeObject) {
						circleObject["stroke"] = strokeObject;
					}

					style = new ol.style.Style({
						image: new ol.style.Circle(circleObject)
					});
				} else if (lineSymbolizer) {
					let lineStroke = lineSymbolizer && lineSymbolizer["sld:Stroke"] && lineSymbolizer["sld:Stroke"]["sld:CssParameter"] ? lineSymbolizer["sld:Stroke"]["sld:CssParameter"] : null;
					let lineStrokeColor = getCssParameterByname(lineStroke, "stroke");
					let lineStrokeWidth = getCssParameterByname(lineStroke, "stroke-width");

					let strokeObject = null;
					if (lineStrokeColor || lineStrokeWidth) {
						let strokeObject2 = {};
						if (lineStrokeColor) {
							strokeObject2["color"] = lineStrokeColor;
						}
						if (lineStrokeWidth) {
							strokeObject2["width"] = lineStrokeWidth;
						}
						strokeObject = new ol.style.Stroke(strokeObject2);
					}

					style = new ol.style.Style({
						stroke: strokeObject
					});
				} else if (polygonSymbolizer) {
					let polygonStroke = polygonSymbolizer && polygonSymbolizer["sld:Stroke"] && polygonSymbolizer["sld:Stroke"]["sld:CssParameter"] ? polygonSymbolizer["sld:Stroke"]["sld:CssParameter"] : null;
					let polygonStrokeColor = getCssParameterByname(polygonStroke, "stroke");
					let polygonStrokeWidth = getCssParameterByname(polygonStroke, "stroke-width");
					let polygonFill = polygonSymbolizer && polygonSymbolizer["sld:Fill"] && polygonSymbolizer["sld:Fill"]["sld:CssParameter"] ? polygonSymbolizer["sld:Fill"]["sld:CssParameter"] : null;
					let polygonFillColor = getCssParameterByname(polygonFill, "fill");

					let strokeObject = null;
					if (polygonStrokeColor || polygonStrokeWidth) {
						let strokeObject2 = {};
						if (polygonStrokeColor) {
							strokeObject2["color"] = polygonStrokeColor;
						}
						if (polygonStrokeWidth) {
							strokeObject2["width"] = polygonStrokeWidth;
						}
						strokeObject = new ol.style.Stroke(strokeObject2);
					}

					let styleObject = {};
					if (strokeObject) {
						styleObject["stroke"] = strokeObject;
					}

					let fillObject = null;
					if (polygonFillColor) {
						fillObject = new ol.style.Fill({
							color: polygonFillColor
						})
					}
					if (fillObject) {
						styleObject["fill"] = fillObject;
					}

					style = new ol.style.Style(
						styleObject
					);
				}
			} else {
				// console.log("[layerHelper.js] - buildWFSStyleFromGeoServerStyleJSON - rule is array | rule:");
				// console.log(rule);
				// ToDo: Ver cómo manejamos el caso en el que rule es un array
			}
		} else {
			// console.log("[layerHelper.js] - buildWFSStyleFromGeoServerStyleJSON - featureTypeStyle is array | featureTypeStyle:");
			// console.log(featureTypeStyle);
			// ToDo: Ver cómo manejamos el caso en el que featureTypeStyle es un array
		}
	}
	return style;
}

function getCssParameterByname(cssParameterCollection, name) {
	let cssParameterValue = null;
	if (cssParameterCollection) {
		if (Array.isArray(cssParameterCollection)) {
			for (let i = 0; i < cssParameterCollection.length; i++) {
				let oneCssParameter = cssParameterCollection[i];
				if (oneCssParameter["@name"] == name) {
					cssParameterValue = oneCssParameter["#text"];
					break;
				}
			}
		} else {
			if (cssParameterCollection["@name"] == name) {
				cssParameterValue = cssParameterCollection["#text"];
			}
		}
	}
	return cssParameterValue;
}

function getLayerInfo(context, layerTitle) {
	let that = context;
	if (layerTitle && that.layersInfo && that.layersInfo.length > 0) {
		return that.layersInfo.find(l => l.layerTitle === layerTitle)
	}
	return undefined;
}

function getQueryCapableAttributesFromLayer(context, layer) {
	let that = context;
	let queryCapableAttributes = [];
	let layerTitle = layer && layer.values_ ? layer.values_.title : null;
	if (layerTitle && that.layersInfo && that.layersInfo.length > 0) {
		let layerFound = false;
		let i = 0;
		while (!layerFound && i < that.layersInfo.length) {
			let oli = that.layersInfo[i];
			if (oli.layerTitle == layerTitle) {
				layerFound = true;
				let layerAttributes = oli.data && oli.data.atributos ? oli.data.atributos : null;
				if (layerAttributes) {
					for (let key in layerAttributes) {
						let oneAttribute = layerAttributes[key];
						if (oneAttribute.query_capable == true) {
							queryCapableAttributes.push(oneAttribute);
						}
					}
				}
			}
			i++;
		}
	}
	return queryCapableAttributes;
}

function getReadOnlyAttributesFromLayer(context, layer) {
	let that = context;
	let readOnlyAttributes = [];
	let layerTitle = layer && layer.values_ ? layer.values_.title : null;
	if (layerTitle && that.layersInfo && that.layersInfo.length > 0) {
		let layerFound = false;
		let i = 0;
		while (!layerFound && i < that.layersInfo.length) {
			let oli = that.layersInfo[i];
			if (oli.layerTitle == layerTitle) {
				layerFound = true;
				let layerAttributes = oli.data && oli.data.atributos ? oli.data.atributos : null;
				if (layerAttributes) {
					for (let key in layerAttributes) {
						let oneAttribute = layerAttributes[key];
						if (oneAttribute.read_only == true) {
							readOnlyAttributes.push(oneAttribute);
						}
					}
				}
			}
			i++;
		}
	}
	return readOnlyAttributes;
}

function getLayerInfo(context, layerTitle) {
	let that = context;
	let layerInfo = null;
	if (layerTitle && that.layersInfo && that.layersInfo.length > 0) {
		let i = 0;
		while (!layerInfo  && i < that.layersInfo.length) {
			let oli = that.layersInfo[i];
			if (oli.layerTitle == layerTitle) {
				layerInfo = oli.data;
			}
			i++;
		}
	}
	return layerInfo;
}

function layerIsEditable(layer) {
	let isEditable = true;

	let layerType = layer && layer.values_ ? layer.values_.type : null;
	let isFilterLayer = layer && layer.values_ ? layer.values_.isFilterLayer : false;
	let isPositionLayer = layer && layer.values_ ? (layer.values_.format == "GEOLOCATION") : false;
	let isWFS = layer && layer.values_ ? layer.values_.isWFS : false;

	if (layer && layer.values_ && layer.values_.editable === false) {
		isEditable = false;
	}
	if (layerType === "base" && layerType === "BASE") {
		isEditable = false;
	}
	if (isFilterLayer) {
		isEditable = false;
	}
	if (isPositionLayer) {
		isEditable = false;
	}
	if (!isWFS) {
		isEditable = false;
	}

	return isEditable;
}

function layerCanBeConsulted(layer) {
	let canBeConsulted = true;

	let layerType = layer && layer.values_ ? layer.values_.type : null;
	let isFilterLayer = layer && layer.values_ ? layer.values_.isFilterLayer : false;
	let isPositionLayer = layer && layer.values_ ? (layer.values_.format == "GEOLOCATION") : false;
	let isBaseLayer = layerType == "base" || layerType == "BASE";

	if (isBaseLayer) {
		canBeConsulted = false;
	}
	if (isFilterLayer) {
		canBeConsulted = false;
	}
	if (isPositionLayer) {
		canBeConsulted = false;
	}

	return canBeConsulted;
}

function getLayerPK(context, layerTitle) {
	let that = context;
	let pk = null;
	if (layerTitle && that.layersInfo && that.layersInfo.length > 0) {
		let i = 0;
		while (!pk  && i < that.layersInfo.length) {
			let oli = that.layersInfo[i];
			if (oli.layerTitle == layerTitle) {
				pk = oli.data.pk;
			}
			i++;
		}
	}
	return pk;
}

function getVisibleLayerSinFiltro(filterLayerName, context) {
	let layerName = filterLayerName.slice(8);
	let layer = getLayerByNameOrTitle(context, layerName);
	return layer.getVisible();
}