function getLayerFiltersHTML(layerName, layerId, loadCustomAppFiltersCallback, context, layerIsWFS) {
    let genericFiltersHTML = getGenericFiltersHTML(layerId);
    let customAppFiltersHTML = loadCustomAppFiltersCallback(layerName, layerId);
    let layerOptions = ``;
    
    if(layerIsWFS){
    	layerOptions = getLayerOptionsHTML(layerName, layerId, context)
	}
    
    if (genericFiltersHTML.length>0 || customAppFiltersHTML.length>0) {
        return `
                <span class="dropdown-toggle" id="data-toggle-${layerId}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></span>
                <ul class="dropdown-menu" aria-labelledby="data-toggle-${layerId}">
                    `
        	+ layerOptions
        	+	`
                    <li class="dropdown-submenu">
                        <a class="dropdown-item dropdown-toggle cursor-pointer">Filtros ▼</a>
                        <ul class="dropdown-menu dropdown-menu-submenu">
                `
            + genericFiltersHTML
            + customAppFiltersHTML
            +   `
                        </ul>
                    </li>
                </ul>
            `;
    } else
        return "";
}

function getGenericFiltersHTML(layerId) {
    return `
            <!--<li>
                <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="avanzado">Búsqueda avanzada</a>
            </li>-->
            <li>
                <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="personalizado">Filtros personalizados</a>
            </li>
        `;
}

function applyCommonFilters(filterBy, layerId, context, callback) {
    console.log("[filterHelper.js] - applyCommonFilters | Start");
    let that = context;
    let layer = getLayerByLayerId(that, layerId);
    let layerTitle = layer && layer.values_ ? layer.values_.title : null;

    if (filterBy==='personalizado') {
        console.log("[filterHelper.js] - applyCommonFilters | filterBy = 'personalizado'");
        let title = `Filtrado sobre capa ${layerTitle ? layerTitle : ''}`;
        let content = getCommonFiltersForm(that, layer);
        let okAction = applyCommonFilters2;
        let cancelAction = null;
        let okButtonText = "Filtrar";
        let cancelButtonText = "Cancelar";
        let cancelButtonMustCloseModal = true;
        let okButtonMustCloseModal = false;
        let size = "lg";
        let backdrop = true;
        let keyboard = false;
        that.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

        let expression = getFilterExpressionApplied(that, layer);
        $("#commonFiltersExpression").val(expression);

        $(".queryCapableAttributeClickableLabel").click(function() {
            let nombreBD = $(this).attr("nombrebd");
            let nombreParaMostrar = $(this).attr("nombreParaMostrar"); 
            let tipoDato = $(this).attr("usage");
            $("#layerAttributesLOVContainer").html("");
            if(tipoDato==="LOV" || tipoDato==="LOV_IS_LAZY"){
            	let capaReferenciada = $(this).attr("capaReferenciada");
            	addTextToCommonFiltersExpressionLOV(capaReferenciada);
            }
            addTextToCommonFiltersExpression(nombreParaMostrar);
        });

        $(".commonFiltersFormButton").click(function() {
            let nombreParaMostrar = $(this).attr("nombreParaMostrar");
            addTextToCommonFiltersExpression(nombreParaMostrar);
        });

    } else if (filterBy==='avanzado') {
        console.log("[filterHelper.js] - applyCommonFilters | filterBy = 'avanzado'");
        callback(filterBy, layerId, that, null);
    } else {
        callback(filterBy, layerId, that, null);
    }

    function applyCommonFilters2() {
        console.log("[filterHelper.js] - applyCommonFilters - applyCommonFilters2 | Start");
        let filterExpression = $("#commonFiltersExpression").val();
        filterExpression = filterExpression.trim();

        if (filterExpression && filterExpression.length > 0) {
            let expressionIsValid = validateCommonFiltersExpression(filterExpression);
            if (expressionIsValid) {
                let layerQueryCapableAttributes = getQueryCapableAttributesFromLayer(that, layer);
                let formattedFilterExpression = formatFilterExpression(filterExpression, layerQueryCapableAttributes);
                that.addFilterToLayer(layerTitle, {filterType: 'CLIENT_SIDE', filterKey: 'COMMON_FILTERS', filterName: 'Personalizado', filter: formattedFilterExpression, originalFilterExpression: filterExpression});
                that.closeGeneralModal();
                callback(filterBy, layerId, that, null);
            } else {
                alertify.error("La expresión del filtro no es correcta.");
            }
        } else {
            alertify.error("Debe escribir el filtro que desea aplicar.");
        }
    }

    // callback(filterBy, layerId, that, null);
}

function startAdvancedSearch(context) {
    let that = context;
    let title = `Búsqueda avanzada`;
    let content = getAdvancedSearchForm(that);
    let okAction = null;
    let cancelAction = popupClosed;
    let okButtonText = "";
    let cancelButtonText = "Cerrar";
    let cancelButtonMustCloseModal = true;
    let okButtonMustCloseModal = false;
    let size = "full";
    let backdrop = true;
    let keyboard = false;

    if (!that._busquedaAvanzada) {
        that._busquedaAvanzada = {
            layer1: undefined,
            layer2: undefined,
            buffer1: undefined,
            buffer2: undefined,
            method: undefined,
            layer1InputValues: {},
            layer2InputValues: {},
            olFilter1: undefined,
            olFilter2: undefined,
            layer1DataBaseResults: undefined,
            layer2DataBaseResults: undefined
        }
    }

    function popupClosed() {
        context.firstAdvancedSearchLayerFiltered = false;
        context.secondAdvancedSearchLayerFiltered = false;
    }
    that.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

    if (that._busquedaAvanzada.layer1) {
        drawAttributesFormContent(that, that._busquedaAvanzada.layer1,1);
    }
    if (that._busquedaAvanzada.layer2) {
        drawAttributesFormContent(that, that._busquedaAvanzada.layer2,2);
    }

    $('#searchFormLayer1').on('change', function() {
        that._busquedaAvanzada.layer1InputValues = {};
        that._busquedaAvanzada.layer1 = this.value;
        $("#contentButtonSearchForm1").html("");
        drawAttributesFormContent(that, this.value,1);
        $('#contentSearchResults1').html("")
        $('#searchResultCount1').html('0 registros');
        that.firstAdvancedSearchLayerFiltered = false;
        checkViewResultsAdvancedSearchButtonDisabled(that);
    });
    $('#searchFormLayer2').on('change', function() {
        that._busquedaAvanzada.layer2InputValues = {};
        that._busquedaAvanzada.layer2 = this.value;
        $("#contentButtonSearchForm2").html("");
        drawAttributesFormContent(that, this.value, 2);
        $('#contentSearchResults2').html("")
        $('#searchResultCount2').html('0 registros');
        that.secondAdvancedSearchLayerFiltered = false; 
        checkViewResultsAdvancedSearchButtonDisabled(that);
    });
    $('#searchFormMethod').on('change', function() {
        that._busquedaAvanzada.method = this.value;
        checkViewResultsAdvancedSearchButtonDisabled(that);
    });

    $('#mostrarEnMapa').click(function() {
    	// debugger;
        context.closePopup();
        loader();
        let filterLayer2 = undefined;
        let parser = new jsts.io.WKTReader();
        if (that._busquedaAvanzada && that._busquedaAvanzada.layer1DataBaseResults && that._busquedaAvanzada.layer1DataBaseResults.length > 0) {
            let filteredGIDs = '[';
            
            let layer1PK = getLayerPK(that, that._busquedaAvanzada.layer1);
        	let pk1LowerCase =layer1PK;
        	if (layer1PK) {
                layer1PK = layer1PK.toUpperCase();
            }
            
            let layer2PK = getLayerPK(that, that._busquedaAvanzada.layer2);
            let pk2LowerCase = layer2PK;
            if (layer2PK) {
                layer2PK = layer2PK.toUpperCase();
            }
            
            if ( that._busquedaAvanzada.layer2DataBaseResults && that._busquedaAvanzada.layer2DataBaseResults.length > 0) {
                let buffer1 = $("#buffer-layer-1").val();
                let buffer2 = $("#buffer-layer-2").val();
                if (buffer1) {
                    that._busquedaAvanzada.buffer1 = buffer1;
                }
                if (buffer2) {
                    that._busquedaAvanzada.buffer2 = buffer2;
                }
                let numericBuffer1 = buffer1 && !isNaN(buffer1) ? parseInt(buffer1, 10) : 0;
                let numericBuffer2 = buffer2 && !isNaN(buffer2) ? parseInt(buffer2, 10) : 0;
                let filteredGIDs2 = '[';
                let i = 0;
                
                while (i < that._busquedaAvanzada.layer1DataBaseResults.length) {
                    let oneResult1 = that._busquedaAvanzada.layer1DataBaseResults[i];
                    let oneResult1WKTGeometry = oneResult1.wkt_geom || oneResult1.WKT_GEOM;
                    let jstsGeomOne = null;
                    if (oneResult1WKTGeometry) {
                        jstsGeomOne = parser.read(oneResult1WKTGeometry);
                        if (numericBuffer1) {
                            jstsGeomOne = jstsGeomOne.buffer(numericBuffer1);
                        }
                    }
                    let oneResult1Added = false;
                    let j = 0;
                    while (/* !oneResult1Added && */ j < that._busquedaAvanzada.layer2DataBaseResults.length) {
                        let oneResult2 = that._busquedaAvanzada.layer2DataBaseResults[j];
                        let oneResult2WKTGeometry = oneResult2.wkt_geom || oneResult2.WKT_GEOM;
                        let jstsGeomTwo = null;
                        if (oneResult2WKTGeometry) {
                            jstsGeomTwo = parser.read(oneResult2WKTGeometry);
                            if (numericBuffer2) {
                                jstsGeomTwo = jstsGeomTwo.buffer(numericBuffer2);
                            }
                        }

                        let intersection = null;
                        if (jstsGeomOne && jstsGeomTwo) {
                            intersection = jstsGeomOne.intersection(jstsGeomTwo);
                        }

                        let resultsIntersect =
                            intersection &&
                            (
                                (
                                    intersection._shell && intersection._shell._points &&
                                    intersection._shell._points._coordinates &&
                                    intersection._shell._points._coordinates.length > 0
                                ) ||
                                (
                                    intersection._coordinates &&
                                    intersection._coordinates._coordinates &&
                                    intersection._coordinates._coordinates.length > 0
                                ) ||
                                (
                                    intersection._points &&
                                    intersection._points._coordinates &&
                                    intersection._points._coordinates.length > 0
                                ) ||
                                (
                                    // Línea con línea
                                    intersection._geometries &&
                                    intersection._geometries.length > 0
                                )
                            );

                        if (resultsIntersect) {
                            // filteredGIDs += (oneResult1.gid ||
							// oneResult1.GID) + ',';
                            // filteredGIDs2 += (oneResult2.gid ||
							// oneResult2.GID) + ',';
                        	filteredGIDs += (oneResult1[pk1LowerCase] || oneResult1[layer1PK]) + ',';
                            filteredGIDs2 += (oneResult2[pk2LowerCase] || oneResult2[layer2PK]) + ',';
                            oneResult1Added = true;
                        }
                        j++;
                    }
                    i++;
                }
                if (filteredGIDs2.endsWith(',')) {
                    filteredGIDs2 = filteredGIDs2.substring(0,filteredGIDs2.length-1);
                }
                filteredGIDs2 += ']';
                
                let filter2 = `${filteredGIDs2.toString()}.indexOf(featureValues.${layer2PK}) > -1`;
                let filter = filter2;
                context.addFilterToLayer(that._busquedaAvanzada.layer2, {filterType: 'CLIENT_SIDE', filterKey: 'BUSQUEDA_AVANZADA', filterName: 'Búsqueda Avanzada', filter});
            } else {
                // No hay interseccion, solo se filtra la capa 1
                that._busquedaAvanzada.layer1DataBaseResults.forEach(r => {
                    filteredGIDs += (r[pk1LowerCase] || r[layer1PK]) + ',';
                })
            }
            if (filteredGIDs.endsWith(',')) {
                filteredGIDs = filteredGIDs.substring(0,filteredGIDs.length-1);
            }
            filteredGIDs += ']';
            
            let filter = `${filteredGIDs.toString()}.indexOf(featureValues.${layer1PK}) > -1`;
            let layer1 = getLayerByNameOrTitle(that, that._busquedaAvanzada.layer1);
            if (layer1) {
                if (layer1.values_ && layer1.values_.isWFS) {
                    context.addFilterToLayer(that._busquedaAvanzada.layer1, {filterType: 'CLIENT_SIDE', filterKey: 'BUSQUEDA_AVANZADA', filterName: 'Búsqueda Avanzada', filter});
                } else  if (layer1.values_ && layer1.values_.format == "WMS") {
                    context.addFilterToLayer(that._busquedaAvanzada.layer1, {filterType: 'CLIENT_SIDE', filterKey: 'BUSQUEDA_AVANZADA', filterName: 'Búsqueda Avanzada', filter});
                }
            }
        }

        let filterLayer = getFilterLayerByOriginalLayerTitle(context, that._busquedaAvanzada.layer1);
        
        
        
       // let layer2 = getLayerByNameOrTitle(that,
		// that._busquedaAvanzada.layer2);
        
      // layer2.setVisible(true);
		// Tras aplicar un filtro, como la capa se prende, si el checkbox del
		// selector no estaba marcado, le hacemos click.
	// let layerId = layer2 && layer2.values_ ? layer2.values_.layerId : null;
	// if (layerId) {
	// if(!$(`#layer-checkbox-${layerId}`).is(":checked")) {
	// $(`#layer-checkbox-${layerId}`).click();
	// }
	// }
        
        console.log(context._filters);
        context.applyFiltersFromArray(filterLayer);
        
        if (that._busquedaAvanzada.layer2){
        	console.log(that._busquedaAvanzada.layer2);
        	let filterLayer2 = getFilterLayerByOriginalLayerTitle(context, that._busquedaAvanzada.layer2);
        	context.applyFiltersFromArray(filterLayer2);
        }
        
    })
}

function drawAttributesFormContent(context, layerTitle, searchNo) {
    let content = '';
    if (layerTitle && layerTitle.length > 1) {
        let layer = getLayerByNameOrTitle(context, layerTitle);
        let atributos = getQueryCapableAttributesFromLayer(context, layer);
        let queryAtributos = [];

        console.log(context._busquedaAvanzada);

        atributos.forEach(a => {
        	
        	let contentToReturn = ``;
        	
        	let nombreBD = a.nombre_bd;
        	let inputId = `inputAdvSearch-${searchNo}-${nombreBD}`;

            content += `<label for="inputAdvSearch-${searchNo}-${nombreBD}" class="col-sm-6 control-label">${a.label || a.nombreParaMostrar || a.nombre}</label>`;
            content +=			`<div class="col-sm-6">`;
            
            let inputValue = context._busquedaAvanzada[`layer${searchNo}InputValues`][inputId] ? context._busquedaAvanzada[`layer${searchNo}InputValues`][inputId] : '';
            console.log(inputId);
            console.log(inputValue);

            if (a["usage"]==="LOV" && comboData) {
                for (let i = 0; i < comboData.length; i++) {
                    let oneComboData = comboData[i];
                    if (oneComboData['Codiguera'] === a["capa_referenciada"]) {
                        contentToReturn +=		`<select id="${inputId}" class="form-control">`;
                        contentToReturn +=		`<option value="" selected></option>`;
                        oneComboData['Data'].forEach(oneData => {
                        	let oneDataValue = null;
                            let oneDataLabel = null;
                            for (let key in oneData) {
                            	// recorro los campos de la BD de la codiguera y
								// me quedo con el valor del que dice que es el
								// comboValue en la capa ori de la codiguera
                                if (key==oneComboData['comboValue']){
                                    oneDataValue = oneData[key];
                                }
                                // recorro los campos de la BD de la codiguera y
								// me quedo con el valor del que dice que es el
								// comboLabel en la capa ori de la codiguera
                                if (key==oneComboData['comboLabel']){
                                	oneDataLabel = oneData[key];
                                }
                            }
                            contentToReturn +=		`<option value="${oneDataValue}">${oneDataLabel}</option>`;
                        });
                        contentToReturn +=		`</select>`;
                        content +=contentToReturn;
                        break;
                    }
                }
            }
            else if (a["usage"]==="LOV_IS_LAZY" && comboData) {
                for (let i = 0; i < comboData.length; i++) {
                    let oneComboData = comboData[i];
                    if (oneComboData['Codiguera'] === a["capa_referenciada"]) {
                        contentToReturn +=		`<input list="${inputId}-list" name="${inputId}" id="${inputId}" class="form-control">`;
                        contentToReturn += 		`<datalist id="${inputId}-list">`;
                        contentToReturn +=		`<option data-value="" value="" selected></option>`;
                        oneComboData['Data'].forEach(oneData => {
                        	let oneDataValue = null;
                            let oneDataLabel = null;
                            for (let key in oneData) {
                            	// recorro los campos de la BD de la codiguera y
								// me quedo con el valor del que dice que es el
								// comboValue en la capa ori de la codiguera
                                if (key==oneComboData['comboValue']){
                                    oneDataValue = oneData[key];
                                }
                                // recorro los campos de la BD de la codiguera y
								// me quedo con el valor del que dice que es el
								// comboLabel en la capa ori de la codiguera
                                if (key==oneComboData['comboLabel']){
                                	oneDataLabel = oneData[key];
                                }
                            }
                            contentToReturn +=		`<option data-value="${oneDataValue}" value="${oneDataLabel}"></option>`;
                        });
                        contentToReturn +=		`</datalist>`;
                        content +=contentToReturn;
                        break;
                    }
                }
            }
            else{
            	content +=				`<input class="form-control" id="${inputId}" nombreAtt="${nombreBD}" value="${inputValue}" />`;
            }
            
            content +=			`</div>`;
            queryAtributos.push(nombreBD);
        })
        
        let contentButtonSearch = '';
        contentButtonSearch +=			`<div class="col-sm-12"><button id="buscarFiltroBusqAvanzada${searchNo}" type="button" class="btn btn-default">Buscar</button></div>`;
        $("#contentButtonSearchForm"+searchNo).html(contentButtonSearch);
        
        $("#contentSearchForm"+searchNo).html(content);
        
        $('#buscarFiltroBusqAvanzada'+searchNo).click(function() {
            $('#contentSearchResults'+searchNo).html("Buscando...");
            // debugger;
            let filterSQL = '';
            let filtrosOL = [];
            atributos.forEach(a => {
                let inputId = "inputAdvSearch-" + searchNo + '-' +  a.nombre_bd;
                let value = $(`#${inputId}`).val();
                
                if(a.usage==="LOV_IS_LAZY"){
                	if(value!=="")
					{
                		value = document.querySelector("#"+inputId+"-list option[value='"+value+"']").dataset.value;
					}
                }
                
                context._busquedaAvanzada[`layer${searchNo}InputValues`][inputId] = value;

                if (value && value.length>0) {
                	if(a.tipo==="java.lang.String")
                	{
                		let busquedaMayuscula = value.toUpperCase();
            			filterSQL += ' upper(' + a.nombre_bd + ") like '%" + busquedaMayuscula + "%' AND";
                	} else{
                		filterSQL += ' ' + a.nombre_bd + "='" + value + "' AND";
                	}
                    filtrosOL.push(ol.format.filter.equalTo(a.nombre_bd, value));
                }
            })
            if (filterSQL.endsWith("AND"))
                filterSQL = filterSQL.slice(0,-3);
            let layerInfo = getLayerInfo(context, layerTitle);
            let body = {
                tabla : layer.values_.databaseTableName,
                Origen_datos: layer.values_.fuenteDB,
                dbms: layerInfo.dbms,
                atributos: queryAtributos,
                filter: filterSQL
            };
            $.ajax({
                type: "POST",
                url: WCMapSelectMultipleURL,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(body),
                success: (data) => {
                    // Respuesta de llamada ejecutada al hacer click en un botón
					// de búsqueda de una capa (lado derecho o izquierdo del
					// popup)
                    // Creo la tabla de resultados
                    let table = '<table  class="table" style="width: 100%"><thead><tr>';
                    atributos.forEach(a => {
                        table += `<th>${a.label || a.nombreParaMostrar || a.nombre}<th/>`
                    })
                    table += "</tr></thead>"
                    if (data && data.length > 0) {
                        context._busquedaAvanzada[`layer${searchNo}DataBaseResults`] = data;
                        data.forEach((row) => {
                        	table += `<tr ${layerInfo.pk}="${row[layerInfo.pk]}">`
                            atributos.forEach(a => {
                            	
                            	let v = layerInfo.dbms==='POSTGIS' ? row[a.nombre_bd] : (a.nombre_bd?row[a.nombre_bd.toUpperCase()]:'');
                            	
                            	if (a["usage"]==="LOV" && comboData) {
                            		let valorEtiqueta = null;
                                    for (let i = 0; i < comboData.length; i++) {
                                        let oneComboData = comboData[i];
                                        if (oneComboData['Codiguera'] === a["capa_referenciada"]) {
                                        	// debugger;
                                            oneComboData['Data'].forEach(oneData => {
                                            	let oneDataValue = null;
                                                let oneDataLabel = null;
                                                if(v==oneData[oneComboData['comboValue']]){
                                                	oneDataValue = oneData[oneComboData['comboValue']];
                                                    oneDataLabel = oneData[oneComboData['comboLabel']];
                                                    valorEtiqueta = oneDataLabel;
                                                }
                                            });
                                            break;
                                        }
                                    }
                                    table +=  `<td>${valorEtiqueta&&valorEtiqueta!='undefined'?valorEtiqueta:''}<td/>`;
                                }
                            	else if (a["usage"]==="LOV_IS_LAZY" && comboData) {
                            		// debugger;
                            		let valorEtiqueta = null;
                                    for (let i = 0; i < comboData.length; i++) {
                                        let oneComboData = comboData[i];
                                        if (oneComboData['Codiguera'] === a["capa_referenciada"]) {
                                            oneComboData['Data'].forEach(oneData => {
                                            	let oneDataValue = null;
                                                let oneDataLabel = null;
                                                if(v==oneData[oneComboData['comboValue']]){
                                                	oneDataValue = oneData[oneComboData['comboValue']];
                                                    oneDataLabel = oneData[oneComboData['comboLabel']];
                                                    valorEtiqueta = oneDataLabel;
                                                }
                                            });
                                            break;
                                        }
                                    }
                                    table +=  `<td>${valorEtiqueta&&valorEtiqueta!='undefined'?valorEtiqueta:''}<td/>`;
                                }
                            	else{
                                    table +=  `<td>${v&&v!='undefined'?v:''}<td/>`;
                            	}
                            })
                            table += `<tr/>`
                        })
                    }
                    table += "</tr></thead></table>"

                    if (filtrosOL.length===1) {
                        context._busquedaAvanzada[`olFilter${searchNo}`] = filtrosOL[0];
                    } else if(filtrosOL.length>1) {
                        // context._busquedaAvanzada[`olFilter${searchNo}`] =
						// ol.format.filter.and(filtrosOL);
                        context._busquedaAvanzada[`olFilter${searchNo}`] = filtrosOL;
                    }

                    $('#contentSearchResults'+searchNo).html(table)
                    if (data)
                        $('#searchResultCount'+searchNo).html(data.length + ' registros');
                    if (data && data.length > 0) {
                        if (searchNo === 1) {
                            context.firstAdvancedSearchLayerFiltered = true;
                        } else if (searchNo === 2) {
                            context.secondAdvancedSearchLayerFiltered = true;
                        }
                    }



                    checkViewResultsAdvancedSearchButtonDisabled(context);
                },
                error: (error) => {
                    console.error("[filterHelper.js] - SelectMultiple - ajax - error | error:");
                    console.error(error);
                    context.showMessage("Error", "<p>Error cargando los datos.</p><p>Intente nuevamente o contacte al administrador.</p>" +
                    		"<p>Una posible causante es que se haya superado la capacidad de la memoria, redefina su filtro.</p>" +
                    		"<p style='text-align: right;'><small>Nro. Error: 1031.</small></p>");
                },
                context: context
            })

        });
    } else {
        $("#contentSearchForm"+searchNo).html(content);
    }
}

function checkViewResultsAdvancedSearchButtonDisabled(context) {
    if (context.firstAdvancedSearchLayerFiltered) {
        if (

            (!context._busquedaAvanzada.method && context.secondAdvancedSearchLayerFiltered) ||
            (context._busquedaAvanzada.method && !context.secondAdvancedSearchLayerFiltered)
        )  {
            $('#mostrarEnMapa')[0].disabled = true;
        } else {
            $('#mostrarEnMapa')[0].disabled = false;
        }
        if (context._busquedaAvanzada.method && context.secondAdvancedSearchLayerFiltered) {
            $('#buffer-layer-1')[0].disabled = false;
            $('#buffer-layer-2')[0].disabled = false;
        } else {
            $('#buffer-layer-1')[0].disabled = true;
            $('#buffer-layer-2')[0].disabled = true;
        }
    } else {
        $('#mostrarEnMapa')[0].disabled = true;
        $('#buffer-layer-1')[0].disabled = true;
        $('#buffer-layer-2')[0].disabled = true;
    }
}

function getAdvancedSearchForm(context) {
    let that = context;
    let content = ``;
    content +=  `<div id="advancedSearchForm" style="padding: 0 10px;">`;
    content +=      `<div class="row" style="margin-bottom: 10px;">`;
    content +=          `<div class="col-xs-4" >
                            <h3 class="col-xs-12">Capa 1</h3>
                            <select class="form-control" id="searchFormLayer1">
                                <option value="" ${that._busquedaAvanzada && that._busquedaAvanzada.layer1 ? '' : 'selected'}>Seleccione...</option>
                            `;
    that.layersInfo.filter(layer => !layer.data.esCodiguera).forEach(layer => {
            let ldetail = getLayerByNameOrTitle(context, layer.layerTitle);
            if (ldetail && layerCanBeConsulted(ldetail))
                content +=      `<option value="${layer.layerTitle}" ${that._busquedaAvanzada && that._busquedaAvanzada.layer1 === layer.layerTitle ? 'selected' : ''}>${layer.layerTitle}</option>`;
    })
    content +=          `</select></div>`;
    content +=          `<div class="col-xs-4 row">
                            <div class="col-xs-12">
                                <h3 class="col-xs-12">Operación</h3>
                                <select class="form-control" id="searchFormMethod">
                                    <option value="" ${that._busquedaAvanzada && that._busquedaAvanzada.method ? '' : 'selected'}>Seleccione...</option>
                                    <option value="intersection"  ${that._busquedaAvanzada && that._busquedaAvanzada.method === 'intersection' ? 'selected' : ''}>Intersectar</option>
                                </select>
                            </div>
                            <div class="col-xs-12 row" style="margin-top: 10px; padding-right: 0;">
                                <div class="col-xs-6" style="padding-right: 0;">
                                    <div class="input-group">
                                        <input id="buffer-layer-1" type="number" class="form-control" placeholder="Buffer capa 1" value="${that._busquedaAvanzada && that._busquedaAvanzada.buffer1 ? that._busquedaAvanzada.buffer1 : ''}" disabled="disabled">
                                        <span class="input-group-addon">mts.</span>
                                    </div>
                                </div>
                                <div class="col-xs-6" style="padding-right: 0;">
                                    <div class="input-group">
                                        <input id="buffer-layer-2" type="number" class="form-control" placeholder="Buffer capa 2" value="${that._busquedaAvanzada && that._busquedaAvanzada.buffer2 ? that._busquedaAvanzada.buffer2 : ''}" disabled="disabled">
                                        <span class="input-group-addon">mts.</span>
                                    </div>
                                </div>
                            </div>
                        </div>`;
    content +=          `<div class="col-xs-4" >
                            <h3 class="col-xs-12">Capa 2</h3>
                            <select class="form-control" id="searchFormLayer2">
                                <option value=""  ${that._busquedaAvanzada && that._busquedaAvanzada.layer2 ? '' : 'selected'}>Seleccione...</option>
                            `;
                that.layersInfo.filter(layer => !layer.data.esCodiguera).forEach(layer => {
                    let ldetail = getLayerByNameOrTitle(context, layer.layerTitle);
                    if (ldetail && layerCanBeConsulted(ldetail))
                        content += `<option value="${layer.layerTitle}"  ${that._busquedaAvanzada && that._busquedaAvanzada.layer2 === layer.layerTitle ? 'selected' : ''}>${layer.layerTitle}</option>`;
                })
    content +=          `</select></div>`;
    content +=      `</div> <hr/>`;
    content +=      `<div class="row" style="margin-bottom: 10px;">`;
    content +=          `<div id="contentButtonSearchForm1" class="col-xs-6"> `
    content +=          `</div>`;
    content +=          `<div id="contentButtonSearchForm2" class="col-xs-6"> `
    content +=          `</div>`;
    content +=      `</div> <hr/>`;
    content +=      `<div class="row" style="margin-bottom: 10px;">`;
    content +=          `<div id="contentSearchForm1" class="col-xs-6" style="height: 170px; overflow-y: auto;"> `
    content +=          `</div>`;
    content +=          `<div id="contentSearchForm2" class="col-xs-6" style="height: 170px; overflow-y: auto;"> `
    content +=          `</div>`;
    content +=      `</div> <hr/>`;
    content +=      `<div class="row" style="margin-bottom: 10px;">`;
    content +=          `<div id="contentSearchResults1" class="col-xs-6" style="height: 300px; overflow-y: auto;"> `
    content +=          `</div>`;
    content +=          `<div id="contentSearchResults2" class="col-xs-6" style="height: 300px; overflow-y: auto;"> `
    content +=          `</div>`;
    content +=      `</div></hr>`;
    content +=      `<div class="row" style="margin-bottom: 10px;">`;
    content +=          `<div id="contentSearchActions1" class="col-xs-6"> `
    content +=              `<div class="col-sm-12"><label id="searchResultCount1">0 registros</label></div>`
    content +=              '<div class="col-sm-12"><button id="mostrarEnMapa" type="button" class="btn btn-default" disabled="disabled">Ver en el mapa</button></div>'
    content +=          `</div>`;
    content +=          `<div id="contentSearchActions1" class="col-xs-6"> `
    content +=              `<div class="col-sm-12"><label id="searchResultCount2">0 registros</label></div>`
    content +=          `</div>`;
    content +=      `</div>`;


    return content;
}

function getCommonFiltersForm(context, layer) {
    let that = context;
    let content = ``;

    let queryCapableAttributes = getQueryCapableAttributesFromLayer(that, layer);

    content +=  `<div id="commonFiltersForm" style="padding: 0 10px;">`;
    content +=      `<div class="row" style="margin-bottom: 10px;">`;
    content +=          `<div id="layerAttributesContainer" class="col-xs-4" style="max-height: 160px; overflow-y: auto;">`;
    for (let i = 0; i < queryCapableAttributes.length; i++) {
        let oneQueryCapableAttribute = queryCapableAttributes[i];
        let nombreParaMostrar = oneQueryCapableAttribute.nombreParaMostrar || oneQueryCapableAttribute.nombre || oneQueryCapableAttribute.nombre_bd;
        let nombreBD = oneQueryCapableAttribute.nombre_bd;
        let usage = oneQueryCapableAttribute.usage ? oneQueryCapableAttribute.usage : "";
        let capaReferenciada = oneQueryCapableAttribute.capa_referenciada ? oneQueryCapableAttribute.capa_referenciada : "";
        if (nombreParaMostrar && nombreBD) {
            content +=      `<a class="label label-default queryCapableAttributeClickableLabel" style="display: block; margin-bottom: 5px; font-size: small; font-weight: normal;" nombrebd="${nombreBD}" usage="${usage}" capaReferenciada="${capaReferenciada}" nombreParaMostrar="${nombreBD}">${nombreParaMostrar} (${nombreBD})</a>`;
        }
    }
    content +=          `</div>`;

    content +=          `<div id="buttonsContainer" class="col-xs-4">`;
    content +=              `<div class="btn-group btn-group-justified" role="group">`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="=">=</button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar=">">></button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="<"><</button></div>`;
    content +=              `</div>`;
    content +=              `<div class="btn-group btn-group-justified" role="group">`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="<="><=</button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar=">=">>=</button></div>`;
    // content += `<div class="btn-group" role="group"><button type="button"
	// class="btn btn-default commonFiltersFormButton"
	// nombreParaMostrar="<>"><></button></div>`;
    content +=              `</div>`;
    content +=              `<div class="btn-group btn-group-justified" role="group">`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="AND">AND</button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="OR">OR</button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="NOT">NOT</button></div>`;
    content +=              `</div>`;
    content +=              `<div class="btn-group btn-group-justified" role="group">`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="LIKE">LIKE</button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar="(">(</button></div>`;
    content +=                  `<div class="btn-group" role="group"><button type="button" class="btn btn-default commonFiltersFormButton" nombreParaMostrar=")">)</button></div>`;
    content +=              `</div>`;
    content +=          `</div>`;
    
    content +=          `<div id="layerAttributesLOVContainer" class="col-xs-4" style="max-height: 160px; overflow-y: auto;">`;
    content +=          `</div>`;

    content +=          `<div class="col-xs-4">`;
    content +=          `</div>`;
    content +=      `</div>`;

    content +=      `<div class="row">`;
    content +=          `<div id="expressionContainer">`;
    content +=              `<textarea class="form-control" id="commonFiltersExpression" rows="5"></textarea>`;
    content +=              `<p><small><b>Atención:</b></small><br><small>Todos los atributos, operadores, valores y/o paréntesis deben estar separados por un espacio en blanco.</small></p>`;
    content +=              `<p><small><b>Ejemplo:</b></small><br><small>atributo_numerico < 20 AND ( NOT ( atributo_texto = "Texto de prueba" OR atributo_numerico_2 = 50 ) OR atributo_texto_2 LIKE "Otro texto de prueba" )</small></p>`;
    content +=          `</div>`;
    content +=      `</div>`;
    content +=  `</div>`;

    return content;
}

function getFilterExpressionApplied(context, layer) {
    let that = context;
    let expression = ``;
    let layerName = layer && layer.values_ ? layer.values_.originalLayerTitle : null;
    if (that._filters && layerName) {
        let filterLayerFound = false;
        let i = 0;
        while (i < that._filters.length && !filterLayerFound) {
            let oneLayerToFilter = that._filters[i];
            if (layerName == oneLayerToFilter.layerName) {
                filterLayerFound = true;
                let commonFilterFound = false;
                let j = 0;
                while (j < oneLayerToFilter.filters.length && !commonFilterFound) {
                    let oneFilter = oneLayerToFilter.filters[j];
                    if (oneFilter.filterKey && oneFilter.filterKey == "COMMON_FILTERS") {
                        commonFilterFound = true;
                        expression = oneFilter.originalFilterExpression;
                    }
                    j++;
                }
            }
            i++;
        }
    }

    return expression;
}

function addTextToCommonFiltersExpression(text) {
    let currentText = $("#commonFiltersExpression").val();
    if (currentText) {
        currentText = currentText.trim();
        if (currentText.length > 0) {
            currentText += " ";
        }
    }
    currentText += text + " ";
    $("#commonFiltersExpression").val(currentText);
}

function addTextToCommonFiltersExpressionLOV(nombreCapa) {
	
	 if (comboData) {
         for (let i = 0; i < comboData.length; i++) {
             let oneComboData = comboData[i];
             if (oneComboData['Codiguera'] === nombreCapa) {
                 oneComboData['Data'].forEach(oneData => {
                 	let oneDataValue = null;
                     let oneDataLabel = null;
                     let contenido =``;
                     for (let key in oneData) {
                     	// recorro los campos de la BD de la codiguera y me
						// quedo con el valor del que dice que es el comboValue
						// en la capa ori de la codiguera
                         if (key==oneComboData['comboValue']){
                             oneDataValue = oneData[key];
                         }
                         // recorro los campos de la BD de la codiguera y me
							// quedo con el valor del que dice que es el
							// comboLabel en la capa ori de la codiguera
                         if (key==oneComboData['comboLabel']){
                         	oneDataLabel = oneData[key];
                         }
                     }
                     contenido +=      `<a class="label label-default commonFiltersFormLOV" style="text-align:left; display: block; margin-bottom: 5px; font-size: small; font-weight: normal;" value="${oneDataValue}">(${oneDataValue}) - ${oneDataLabel}</a>`;
                     $("#layerAttributesLOVContainer").append(contenido);
                 });
             }
         }
         $(".commonFiltersFormLOV").click(function() {
             let value = $(this).attr("value");
             if(isNaN(value)){
            	 value = '"'+value+'"';
             }
             addTextToCommonFiltersExpression(value);
         });
     }
}

function validateCommonFiltersExpression(expression) {
    let expressionIsValid = true;

    // ToDo: Validar expresión

    return expressionIsValid;
}

function formatFilterExpression(filterExpression, layerQueryCapableAttributes) {
	
    filterExpression = replaceAll(filterExpression, " = ", " === ");
    // filterExpression = replaceAll(filterExpression, " <> ", " !== ");
    filterExpression = replaceAll(filterExpression, " AND ", " && ");
    filterExpression = replaceAll(filterExpression, " OR ", " || ");
    filterExpression = replaceAll(filterExpression, " NOT ", " !");
    if (filterExpression.startsWith('NOT ')) {
        filterExpression = "!" + filterExpression.substring(4);
    }
     
    for (let i = 0; i < layerQueryCapableAttributes.length; i++) {
        let oneQueryCapableAttribute = layerQueryCapableAttributes[i];
        let nombreBD = oneQueryCapableAttribute.nombre_bd;
        
        if(oneQueryCapableAttribute.tipo==="java.lang.String")
    	{
        	filterExpression = replaceAll(filterExpression, `${nombreBD}`, `featureValues.${nombreBD.toUpperCase()}.toUpperCase()`);
        	filterExpression = replaceAll(filterExpression, `featureValues.${nombreBD.toUpperCase()}.toUpperCase() LIKE `, `( featureValues.${nombreBD.toUpperCase()}.toUpperCase() && featureValues.${nombreBD.toUpperCase()}.toUpperCase() LIKE `);
    	} else{
    		filterExpression = replaceAll(filterExpression, `${nombreBD}`, `featureValues.${nombreBD.toUpperCase()}`);
    		filterExpression = replaceAll(filterExpression, `featureValues.${nombreBD.toUpperCase()} LIKE `, `( featureValues.${nombreBD.toUpperCase()} && featureValues.${nombreBD.toUpperCase()} LIKE `);
    	}
        let colExpression = filterExpression.split('"');
        if(colExpression.length>1)
    	{
        	for (let i = 0; i < colExpression.length; i++) {
        		if(i%2!=0){     			
        			let expression = colExpression[i];
        			filterExpression = replaceAll(filterExpression, expression, expression.toUpperCase());
        		}
        	}
    	}
        
    }

    let hasLike = filterExpression.toUpperCase().indexOf("LIKE") > -1;
    let hasError = false;
    while (hasLike && !hasError) {
        let likeIndex = filterExpression.toUpperCase().indexOf("LIKE");
        let firstQuotationMark = -1;
        let secondQuotationMark = -1;
        if (likeIndex > -1) {
            firstQuotationMark = filterExpression.indexOf('"', likeIndex+4);
            if (firstQuotationMark > -1) {
                secondQuotationMark = filterExpression.indexOf('"', firstQuotationMark+1);
                if (secondQuotationMark == -1) {
                    hasError = true;
                }
            } else {
                hasError = true;
            }
        }
        if (!hasError) {
            filterExpression = filterExpression.substring(0,likeIndex-1) + '.includes(' + filterExpression.substring(firstQuotationMark,secondQuotationMark+1) + ') )' + filterExpression.substring(secondQuotationMark+1);
            hasLike = filterExpression.toUpperCase().indexOf("LIKE") > -1;
        }

        // Elimino los dobles espacios en blanco
        let hasDoubleWhiteSpace = filterExpression.toUpperCase().indexOf("  ") > -1;
        while (hasDoubleWhiteSpace) {
            filterExpression = replaceAll(filterExpression, "  ", " ");
            hasDoubleWhiteSpace = filterExpression.toUpperCase().indexOf("  ") > -1;
        }
    }

    return filterExpression;
}

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}
