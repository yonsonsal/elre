async function getCalcFields(values, tabla) {
    let _geometry = getWKTFromGeometry(values.the_geom || values.THE_GEOM || values.geometry);
    // Remove OL geometry attributes cause is not "stringifyable", but add a WKT representation of the geom for calc fields that need it
    let v = {...values, ...{ "__proto__": null, the_geom: null, THE_GEOM: null, geometry: null, _geometry: _geometry }};
    return new Promise((resolve, reject) => {
        // Get Calculated Field values
        $.ajax({
            type: "POST",
            url: WCMapGetCalcFieldURL + '?tabla=' + tabla,
            contentType: "application/json",
            data: JSON.stringify(v),
            success: function (valuesCalc) {
                //Inject calc values
                let merged = {...values, ...valuesCalc};
                resolve(merged)
            },
            error: function (e) {
                reject(e)
            }
        });
    });
}

function checkPersistentFields(isAlta, atributos, mergedValues) {
    if (isAlta) {
        for (let key in atributos) {
            if (atributos[key].persistible==true) {
                console.log('Campo calculado persistible> ', atributos[key].nombre_bd, atributos[key].nombre, mergedValues[atributos[key].nombre])
                mergedValues[atributos[key].nombre_bd] = mergedValues[atributos[key].nombre]; //Si es insert y es un campo calculado persistible, le pongo el valor por defecto
            // Los campos calculados no persistibles no tienen nombre_bd
            // Los campos calculados si persistibles tiene el valor por defecto va con el atributo "nombre", y el valor guardado va con el atributo nombre_bd
            }
        }
    }
}

function openLayerDataPopup(context, layer, values, isAlta=false) {
    let that = context;
    let layerId = that.getLayerId(layer);
    let layerTitle = layer.values_.originalLayerTitle;

    let title = layerTitle || "Ingreso de datos";
    let content = "";
    let okAction = that.saveFormDataChanges;
    let cancelAction = that.closePopup();
    let okButtonText = "Confirmar";
    let cancelButtonText = "Descartar";
    let cancelButtonMustCloseModal = true;
    let okButtonMustCloseModal = false;
    let size = "full";
    let backdrop = "static";
    let keyboard = false;

    if (!that.childIdentification) {
        that.childIdentification = 0;
    }
    $.ajax({
        type: "GET",
        url: WCMapGetLayerURL + '?capa=' + layerTitle,
        success: async function(data) {
            if (data && data['atributos']) {
                that.attributesToSave = [];
                that.childrenToSave = [];
                that.childLayerToSave = null;

                let childLayerTitle = data['child'] && data['child']['layer'] ? data['child']['layer'] : null;
                let childLayerFK = data['child'] && data['child']['parent_id_attribute'] ? data['child']['parent_id_attribute'] : null;
                let parentsToLoadChildren = [];
                let pk = data.pk;
                let pkValue = that.selectedFeatures && that.selectedFeatures.length > 0 && that.selectedFeatures[0].values_ ? that.selectedFeatures[0].values_[pk]: null;

                if (pkValue)
                	title += ` | ${pk}: ${pkValue}`;
                let merged = values;
                if (values!=null){
                    merged = await getCalcFields(values , data['nombreTabla'])
                    checkPersistentFields(isAlta, data['atributos'], merged);
                }
                content += `<form class="form-horizontal">`;
                for (let key in data['atributos']) {
                    content += getInputFromAttribute(that, data['atributos'][key], merged, false, data['nombreTabla']);
                }
                content += `</form>`;

                if (childLayerTitle && childLayerFK && pkValue) {
                    content += 	`<div id="children-table-container-${pkValue}" style="margin-top: 20px;" class="text-center">`;
                    content += 		`<p>Cargando hijos...</p>`;
                    content += 	`</div>`;
                    parentsToLoadChildren.push(pkValue);
                }

                that.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

                if (childLayerTitle && childLayerFK && parentsToLoadChildren && parentsToLoadChildren.length > 0) {
                    setTimeout(
                        drawChildren(that, data, childLayerTitle, childLayerFK, parentsToLoadChildren, isAlta),
                        500
                    );
                }

            } else {
                that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1005.</small></p>");
            }
        },
        error: function(error) {
            console.error("[wc-map.js] - openLayerDataPopup - ajax - error | error:");
            console.error(error);
            that.showMessage("Error", "<p>No se ha podido acceder a la estructura de la capa.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1004.</small></p>");
        },
        context: that
    });
}

function drawChildren(context, data, childLayerTitle, childLayerFK, parentsToLoadChildren, isAlta) {
    let that = context;
    let childTableName = null;
    let childAttributes = null;
    $.ajax({
        type: "GET",
        url: WCMapGetLayerURL + '?capa=' + childLayerTitle,
        success: (childData) => {
            childTableName = childData && childData['nombreTabla'] ? childData['nombreTabla'] : null;
            childAttributes = childData && childData['atributos'] ? childData['atributos'] : null;         
            let canAddChild = childData && childData.alta === false ? false : true;
            let canDeleteChild = childData && childData.baja === false ? false : true;
            let canEditChild = childData && childData.editable === false ? false : true;
            if (childTableName && childTableName.length > 0) {
                parentsToLoadChildren.forEach(onePKValue => {
                    let body = {
                        tabla : childTableName,
                        pknombre : childLayerFK,
                        pkvalor : onePKValue,
                        Origen_datos: data['Origen_datos']
                    };
                    that.childrenToSave =  [];
                    that.childLayerToSave = childData;
                    let childrenHTML =              `<hr><hr>`;                   
                    if (typeof habilitarBotonAgregarChild == 'function') {
                        puedoCargar = habilitarBotonAgregarChild(childLayerTitle, childTableName, context);
                    } else {
                        puedoCargar = true;
                    }
                    if(puedoCargar)              
                        childrenHTML +=                 `<button type="button" id="child-add-button" class="btn btn-success btn-xs"${canAddChild === false ? " disabled" :""}>Agregar una línea <span class="fa fa-plus" aria-hidden="true"></span></button>`;
                    childrenHTML +=	                `<table id="children-table" class="table table-striped table-condensed">`;
                    childrenHTML +=	                    getChildrenTableHead(childData, true, false);
                    childrenHTML +=		                `<tbody id="children-table-body">`;
                    if (!isAlta) {
                        $.ajax({
                            type: "POST",
                            url: WCMapSelectTableURL,
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(body),
                            success: (childrenData) => {
                                let lastChildrenIndex = 0;                                
                                if (childrenData && childrenData.length > 0) {
                                    if(typeof darPrioridad == 'function'){
                                        childrenData = darPrioridad(childrenData, childLayerTitle);
                                    }
                                    childrenData.forEach((ocd, ocdIndex) => {
                                        let childIsDeleted = !!that.getChildWithPendingChangeByMethod(that, ocd[childData.pk],"delete");
                                        let childWithChanges = that.getChildWithPendingChangeByMethod(that, ocd[childData.pk],"update");
                                        if (!childIsDeleted) {
                                            if (childWithChanges) {
                                                setChangesInChild(ocd, childWithChanges);
                                            }
                                            let childIdentification = ocd[data['child']['parent_id_attribute']] + "_" + ocdIndex;
                                            childrenHTML +=	    `<tr id="table-row-${childIdentification}">`;
                                            that.childrenToSave.push({"id": `table-row-${childIdentification}`, "mode": "none", "originalData": ocd});
                                            for (let key in childAttributes) {
                                                childrenHTML += getTDInputFromAttribute(that, childIdentification, childAttributes[key], ocd, !canEditChild, childTableName);
                                            }
                                            childrenHTML +=			`<td><button type="button" childIdentification=${childIdentification} class="btn btn-danger btn-xs child-delete-button"${canDeleteChild === false ? " disabled" :""}><span class="fa fa-trash-alt" aria-hidden="true"></span></button></td>`;
                                            childrenHTML +=		`</tr>`;
                                        }
                                        lastChildrenIndex = ocdIndex;
                                    });
                                }
                                let childrenToAdd = that.getChildrenToAddFromFather(that, onePKValue);

                                // ToDo: Solucionar el problema de que se duplican las altas al abrir y confirmar un formulario con altas pendientes.
                                if (childrenToAdd && childrenToAdd.length > 0) {
                                    lastChildrenIndex++;
                                    childrenToAdd.forEach((octa, octaIndex) => {
                                        let childIdentification = onePKValue + "_" + (octaIndex + lastChildrenIndex);
                                        childrenHTML +=	    `<tr id="table-row-${childIdentification}">`;
                                        that.childrenToSave.push({"id": `table-row-${childIdentification}`, "mode": "insert", "originalData": octa, "isNewAndReadOnly": true});

                                        for (let key in childAttributes) {
                                            childrenHTML +=         getTDInputFromAttribute(that, childIdentification, childAttributes[key], octa, true, childTableName);
                                        }
                                        childrenHTML +=			`<td><button type="button" childIdentification=${childIdentification} class="btn btn-danger btn-xs child-delete-button"${canDeleteChild === false ? " disabled" :""}><span class="fa fa-trash-alt" aria-hidden="true"></span></button></td>`;
                                        childrenHTML +=		`</tr>`;
                                    });
                                }

                                childrenHTML +=		    `</tbody>`;
                                childrenHTML +=		`</table>`;
                                $(`#children-table-container-${onePKValue}`).html(childrenHTML);
                                $(".child-delete-button:not([disabled])").click(function () {
                                    let childIdentification = $(this).attr('childIdentification');

                                    if ($(`#table-row-${childIdentification}`) && $(`#table-row-${childIdentification}`).length > 0) {
                                        $(`#table-row-${childIdentification}`).remove();
                                        that.changeModeFromChildrenData(that, `table-row-${childIdentification}`, "delete")
                                    }
                                    else {
                                        $(`#table-row-frontend_${this.childIdentification}`).remove();
                                        that.changeModeFromChildrenData(that, `table-row-frontend_${childIdentification}`, "delete")
                                    }
                                });

                                if (canAddChild) {
                                    $("#child-add-button").click(function() {
                                        that.childIdentification++;
                                        let newRow = `<tr id="table-row-frontend_${that.childIdentification}">`;
                                        that.childrenToSave.push({"id": `table-row-frontend_${that.childIdentification}`, "mode": "insert", "isNew": true});
                                        for(let key in childAttributes) {
                                            newRow += getTDInputFromAttribute(that, ("frontend_" + that.childIdentification), childAttributes[key], null, false, childTableName);
                                        }
                                        newRow +=			`<td><button type="button" childIdentification=${that.childIdentification} class="btn btn-danger btn-xs child-delete-button"${canDeleteChild === false ? " disabled" :""}><span class="fa fa-trash-alt" aria-hidden="true"></span></button></td>`;
                                        newRow +=		`</tr>`;
                                        $("#children-table-body").append(newRow);
                                        
                                        $(".child-delete-button").unbind('click');

                                        $(".child-delete-button:not([disabled])").click(function () {
                                            let childIdentification = $(this).attr('childIdentification');
                                            if ($(`#table-row-${childIdentification}`) && $(`#table-row-${childIdentification}`).length > 0) {
                                                $(`#table-row-${childIdentification}`).remove();
                                                that.changeModeFromChildrenData(that, `table-row-${childIdentification}`, "delete")
                                            } else {
                                                $(`#table-row-frontend_${childIdentification}`).remove();
                                                that.changeModeFromChildrenData(that, `table-row-frontend_${childIdentification}`, "delete")
                                            }
                                        });
                                        if (typeof habilitarBotonAgregarChild == 'function') {
                                            puedoCargar = habilitarBotonAgregarChild(childLayerTitle, childTableName, context);
                                        } else {
                                            puedoCargar = true;
                                        }
                                        if(!puedoCargar){
                                            $(`#child-add-button`).addClass("hidden");
                                        }
                                    });
                                }
                            },
                            error: (error) => {
                                console.error("[wc-map.js] - openLayerDataPopup - SelectTable - ajax - error | error:");
                                console.error(error);
                                that.showMessage("Error", "<p>Uno de los hijos ha fallado en su carga.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1026.</small></p>");
                            },
                            context: that
                        });
                    }
                });
            } else {
                that.showMessage("Error", "<p>No se ha podido cargar la información de la capa de los hijos.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1025.</small></p>");
            }
        },
        error: (error) => {
            console.error("[wc-map.js] - openLayerDataPopup - SelectTable - ajax - error | error:");
            console.error(error);
            that.showMessage("Error", "<p>No se ha podido cargar la información de la capa de los hijos.</p><p>Intente nuevamente o contacte al administrador.</p><p style='text-align: right;'><small>Nro. Error: 1024.</small></p>");
        },
        context: that
    });
}

function setChangesInChild (originalChildData, newValues) {
    console.log(originalChildData);
    console.log(newValues);
    if (originalChildData && newValues && newValues.atributos && newValues.atributos.length > 0) {
        for (let key in originalChildData) {
            let i = 0;
            let attributeFound = false;
            while (!attributeFound && i < newValues.atributos.length) {
                let oneAttribute = newValues.atributos[i];
                if (key == oneAttribute.nombre_atributo) {
                    attributeFound = true;
                    originalChildData[key] = oneAttribute.valor;
                }
                i++;
            }
        }
    }
}

function getInputTypeFromAttributeType(attributeType,withtime) {
    let type = `text`;

    if (attributeType && attributeType.length > 0) {
        switch(attributeType) {
            case 'java.lang.String':
                type = "text";
                break;
            case 'java.util.Date':
                type = "date";
                if (withtime){
                    type = "datetime-local";
                }
                break;
            case 'java.lang.Integer':
                type = "number";
                break;
        }
    }
    return type;
}

function getChildrenTableHead(data, createActionsColumn = false, forceReadOnly = false) {
    let contentToReturn = ``;
    let attributes = data && data.atributos ? data.atributos : null;

    if (attributes) {
        contentToReturn +=	`<thead>`;
        contentToReturn +=		`<tr>`;
        for(let key in attributes) {
            let attribute = attributes[key];
            let attributeNameToShow = attribute['label'] || attribute['nombreParaMostrar'] || attribute['nombre'];
            let attributeIsRequired = attribute['NILLABLE'] !== true;
            if (!forceReadOnly) {
                forceReadOnly = attribute['read_only'] === true;
            }

            if (attribute && attribute['show'] !== false) {
                contentToReturn += `<th class="text-center">${attributeNameToShow}${attributeIsRequired && !forceReadOnly ? '<span style="color: #ff0000;"> *</span>' : ''}</th>`;
            }
        }
        if (createActionsColumn) {
            contentToReturn +=			`<th class="text-center">Acciones</th>`;
        }
        contentToReturn +=		`<tr>`;
        contentToReturn +=	`<thead>`;
    }

    return contentToReturn;
}

function getInputFromAttribute(context, attribute, values, forceReadOnly = false, tableName) {
    let that = context;
    let contentToReturn = ``;
    let attributeName = attribute['nombre'];
    let attributeNameToShow = attribute['label'] || attribute['nombreParaMostrar'] || attribute['nombre'];
    let attributeDatabaseColumnName = attribute['nombre_bd']  || attribute['nombre'];
    let inputType = getInputTypeFromAttributeType(attribute['tipo'],attribute['withtime']);
    let attributeIsRequired = attribute['NILLABLE'] !== true;
    if (!forceReadOnly) {
        forceReadOnly = attribute['read_only'] === true;
    }
    let size = "10";
    if (attribute['size'] && attribute['size'].length > 0) {
        if (attribute['size'] === "1" || attribute['size'] === "2" || attribute['size'] === "3" || attribute['size'] === "4" || attribute['size'] === "5" || attribute['size'] === "6" || attribute['size'] === "7" || attribute['size'] === "8" || attribute['size'] === "9") {
            size = attribute['size'];
        }
    }
    if (!forceReadOnly || (forceReadOnly && context._mode != "ADD")) {
        if (attribute && (attribute['show'] != false || attribute.valorCalculado)) {
            let attributeValue = null;
            if (values) {
                for(let key in values) {
                    if ((attribute.nombre_bd && key.toUpperCase() === attribute.nombre_bd.toUpperCase()) ||
                        attribute.valorCalculado && attribute.valorCalculado.length>0 && key.toUpperCase() === attribute.nombre.toUpperCase() ||
                        attribute.valorCalculado == undefined && attribute.nombre_bd == undefined && key.toUpperCase() === attribute.nombre.toUpperCase()) {
                        attributeValue = values[key];
                        if (attributeValue != null){
                        	if (inputType == 'datetime-local') {
                        		let fechaHoraResta = null;
                        		
                        		if ( !Modernizr.inputtypes['datetime-local']){
                        			fechaHoraResta = restarHorasafecha(attributeValue,3,true);
								}
								else{
									fechaHoraResta = restarHorasafecha(attributeValue,3,false);
									fechaHoraResta = fechaHoraResta.replace(" ","T");
								}
                        		//let hr = restarHoras(attributeValue.substring(11, 16),3);
                        		
								//attributeValue = attributeValue.substring(0, 11) + hr;
								attributeValue = fechaHoraResta;
								
								if(!Modernizr.inputtypes['datetime-local']) {
									
									attributeValue= attributeValue.split("T");
									var fecha = attributeValue[0].split("-");
									
									attributeValue = fecha[2] + "/" + fecha[1] + "/" + fecha[0] + " " + attributeValue[1] ;
									
									idNotFunddatetimelocal.push("input-" + attributeDatabaseColumnName);
							    }
							}
							else if (inputType == 'date'){
								attributeValue = attributeValue.substring(0, 10);
							}
                        }
                        else if (context._mode != "INFO" && attributeIsRequired){
                        	if (inputType == 'datetime-local') {
                        		//attributeValue = '2021-10-14 16:19:00';
                        		attributeValue = obtenerFechaInicialDefault(inputType);
							}
							else if (inputType == 'date' && attributeIsRequired){
								//attributeValue = '2021-10-14';
								attributeValue = obtenerFechaInicialDefault(inputType);
							}
                        }
                        break;
                    }
                }
            }
            
            if (attribute && attribute['usage'] && attribute['usage'] === "LOV") {
                let referencedLayer = attribute['capa_referenciada'];
                if (comboData) {
                    for (let i = 0; i < comboData.length; i++) {
                        let oneComboData = comboData[i];
                        if (oneComboData['Codiguera'] === referencedLayer) {
                            contentToReturn +=	`<div class="form-group">`;
                            contentToReturn +=		`<label for="input-${attributeDatabaseColumnName}" class="col-sm-2 control-label">${attributeNameToShow}${attributeIsRequired && !forceReadOnly ? '<span style="color: red;"> *</span>' : ''}</label>`;
                            contentToReturn +=		`<div class="col-sm-${size}">`;
                            contentToReturn +=			`<select id="input-${attributeDatabaseColumnName}" class="form-control" originalValue="${attributeValue}" ` + (forceReadOnly ? `disabled` : ``) + `>`;
                            oneComboData['Data'].forEach(oneData => {
                            	let oneDataValue = null;
                                let oneDataLabel = null;
                                for (let key in oneData) {
                                	//recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboValue en la capa ori de la codiguera
                                    if (key==oneComboData['comboValue']){
                                        oneDataValue = oneData[key];
                                    }
                                    //recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboLabel en la capa ori de la codiguera
                                    if (key==oneComboData['comboLabel']){
                                    	oneDataLabel = oneData[key];
                                    }
                                }
                                contentToReturn +=		`<option value="${oneDataValue}"` + (oneDataValue == attributeValue ? `selected` : ``) + `>${oneDataLabel}</option>`;
                            });
                            contentToReturn +=			`</select>`;
                            contentToReturn +=		`</div>`;
                            contentToReturn +=	`</div>`;
                            break;
                        }
                    }
                }
            } else if (attribute && attribute['usage'] && attribute['usage'] === "LOV_IS_LAZY") {
            	/*contentToReturn += `<label for="browser">Choose your browser from the list:</label>
									<input list="browsers" name="browser" id="browser">
									<datalist id="browsers">
									  <option data-value="1" value="Edge">
									  <option data-value="2" value="Firefox">
									  <option data-value="3" value="Chrome">
									  <option data-value="4" value="Opera">
									  <option data-value="5" value="Safari">
									</datalist>`;
            	//let label = document.getElementById("browser").value;
            	//let val = document.querySelector("#browsers option[value='"+label+"']").dataset.value;
            	//si me viene el originalValue entonces document.querySelector("#browsers option[data-value='"+originalValue+"']").value;
            	*/
            	let referencedLayer = attribute['capa_referenciada'];
                if (comboData) {
                	let encontreValor=false;
                	let script='';
                    for (let i = 0; i < comboData.length; i++) {
                        let oneComboData = comboData[i];
                        if (oneComboData['Codiguera'] === referencedLayer) {
                            contentToReturn +=	`<div class="form-group">`;
                            contentToReturn +=		`<label for="input-${attributeDatabaseColumnName}" class="col-sm-2 control-label">${attributeNameToShow}${attributeIsRequired && !forceReadOnly ? '<span style="color: red;"> *</span>' : ''}</label>`;
                            contentToReturn +=		`<div class="col-sm-${size}">`;
                            contentToReturn +=			`<input list="input-${attributeDatabaseColumnName}-list" name="input-${attributeDatabaseColumnName}" id="input-${attributeDatabaseColumnName}" class="form-control" originalValue="${attributeValue}" ` + (forceReadOnly ? `disabled` : ``) + `>`;
                            contentToReturn += 			`<datalist id="input-${attributeDatabaseColumnName}-list">`;
                            oneComboData['Data'].forEach(oneData => {
                            	let oneDataValue = null;
                                let oneDataLabel = null;
                                for (let key in oneData) {
                                	//recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboValue en la capa ori de la codiguera
                                    if (key==oneComboData['comboValue']){
                                        oneDataValue = oneData[key];
                                    }
                                    //recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboLabel en la capa ori de la codiguera
                                    if (key==oneComboData['comboLabel']){
                                    	oneDataLabel = oneData[key];
                                    }
                                }
                                if(oneDataValue == attributeValue && !encontreValor){
                                	encontreValor=true;
                                	script = `<script>
                                	document.getElementById("input-${attributeDatabaseColumnName}").value=document.querySelector("#input-${attributeDatabaseColumnName}-list option[data-value='${oneDataValue}']").value;
                                	</script>`
                                }
                                contentToReturn +=		`<option data-value="${oneDataValue}" value="${oneDataLabel}"` + (oneDataValue == attributeValue ? `selected` : ``) + `></option>`;
                            });
                            contentToReturn +=			`</datalist>`;
                            contentToReturn +=		`</div>`;
                            contentToReturn +=	`</div>`;
                            contentToReturn +=script;
                            break;
                        }
                    }
                }
            } else if (attribute && attribute['presentation'] && attribute['presentation'] === "TEXT_AREA") {
                if(!attributeValue || (attributeValue.length > 0 && (attributeValue.toUpperCase() == "NULL" || attributeValue.toUpperCase() == "UNDEFINED"))) {
                    attributeValue = "";
                }

                contentToReturn +=		`<div class="form-group" ` + (attribute['show']!=false ? `` : `hidden`) + `>`;
                contentToReturn +=			`<label for="input-${attributeDatabaseColumnName}" class="col-sm-2 control-label">${attributeNameToShow}${attributeIsRequired && !forceReadOnly ? '<span style="color: red;"> *</span>' : ''}</label>`;
                contentToReturn +=			`<div class="col-sm-${size}">`;
                contentToReturn +=				`<textarea type="${inputType}" class="form-control" id="input-${attributeDatabaseColumnName}" value="${attributeValue}" originalValue="${attributeValue}"` + (forceReadOnly ? `disabled` : ``) + `>${attributeValue}</textarea>`;
                contentToReturn +=			`</div>`;
                contentToReturn +=		`</div>`;
            } else if (attribute && attribute['presentation'] && attribute['presentation'] === "URL") {
                if(!attributeValue || (attributeValue.length > 0 && (attributeValue.toUpperCase() == "NULL" || attributeValue.toUpperCase() == "UNDEFINED"))) {
                    attributeValue = "";
                }

                contentToReturn +=		`<div class="form-group" ` + (attribute['show']!=false ? `` : `hidden`) + `>`;
                contentToReturn +=			`<label for="input-${attributeDatabaseColumnName}" class="col-sm-2 control-label">${attributeNameToShow}${attributeIsRequired && !forceReadOnly ? '<span style="color: red;"> *</span>' : ''}</label>`;
                contentToReturn +=			`<div class="col-sm-${size}">`;
                if(context._mode == "INFO"){
                		contentToReturn +=				`<a style="font-style: italic; color:blue" class="form-control" id="input-${attributeDatabaseColumnName}" href="${attributeValue}" target="_blank" originalValue="${attributeValue}"` + (forceReadOnly ? `disabled` : ``) + `>${attributeValue}</a>`;
                } else{
                	contentToReturn +=				`<input type="url" pattern="https://.*" style="font-style: italic; color:blue" class="form-control" id="input-${attributeDatabaseColumnName}" value="${attributeValue}" originalValue="${attributeValue}"` + (forceReadOnly ? `disabled` : ``) + `/>`;
                }
                
                contentToReturn +=			`</div>`;
                contentToReturn +=		`</div>`;
            }
            else {
                if(!attributeValue || (attributeValue.length > 0 && (attributeValue.toUpperCase() == "NULL" || attributeValue.toUpperCase() == "UNDEFINED"))) {
                    attributeValue = "";
                }
            	
                if(attributeValue == "" && attributeIsRequired && (inputType == 'datetime-local' ||inputType == 'date') && context._mode != "INFO")
            	{
                	attributeValue = obtenerFechaInicialDefault(inputType);          	
            	}
                
                contentToReturn +=		`<div class="form-group" ` + (attribute['show']!=false ? `` : `hidden`) + `>`;
                contentToReturn +=			`<label for="input-${attributeDatabaseColumnName}" class="col-sm-2 control-label">${attributeNameToShow}${attributeIsRequired && !forceReadOnly ? '<span style="color: red;"> *</span>' : ''}</label>`;
                contentToReturn +=			`<div class="col-sm-${size}">`;
                if (inputType == 'date')
                    contentToReturn += `<input type="${inputType}" max="9999-12-31" class="form-control" id="input-${attributeDatabaseColumnName}" value="${attributeValue}" originalValue="${attributeValue}"` + (forceReadOnly ? `disabled` : ``) + `/>`;
                else if (inputType == 'datetime-local')
                    contentToReturn += `<input type="${inputType}" max="9999-12-31T23:59" class="form-control" id="input-${attributeDatabaseColumnName}" value="${attributeValue}" originalValue="${attributeValue}"` + (forceReadOnly ? `disabled` : ``) + `/>`;
                else
                    contentToReturn += `<input type="${inputType}" class="form-control" id="input-${attributeDatabaseColumnName}" value="${attributeValue}" originalValue="${attributeValue}"` + (forceReadOnly ? `disabled` : ``) + `/>`;
                contentToReturn +=			`</div>`;
                contentToReturn +=		`</div>`;
            }
            
            if (!forceReadOnly) {
                that.attributesToSave.push(attributeDatabaseColumnName);
            }
        }
    }
    return contentToReturn;
}

function getTDInputFromAttribute(context, childIdentification, attribute, values, forceReadOnly = false, tableChildName, numerador) {
	let that = context;
    let contentToReturn = ``;
    let attributeName = attribute['nombre'];
    let attributeNameToShow = attribute['label'] || attribute['nombreParaMostrar'] || attribute['nombre'];
    let attributeDatabaseColumnName = attribute['nombre_bd'];
    let inputId = "input-" + attributeDatabaseColumnName + (childIdentification ? ("-" + childIdentification) : "-"+numerador);
    let inputType = getInputTypeFromAttributeType(attribute['tipo'],attribute['withtime']);
    let attributeIsRequired = attribute['NILLABLE'] !== true;
    if (!forceReadOnly) {
        forceReadOnly = attribute['read_only'] === true;
    }
    if (attribute && attribute['show'] !== false) {
        let attributeValue = null;
        if (values) {
            if (values.atributos) {
                // Si los valores que llegan vienen de un elemento dado de alta y aún no guardado
                let found = false;
                let i = 0;
                while (!found && i < values.atributos.length) {
                    let oneAttribute = values.atributos[i];
                    if (oneAttribute.nombre_atributo && oneAttribute.nombre_atributo == attribute.nombre_bd) {
                        attributeValue = oneAttribute.valor;
                        if (inputType == 'datetime-local') {
                            attributeValue = attributeValue.substring(0, 16);
                        }
                        else if (inputType == 'date') {
                            attributeValue = attributeValue.substring(0, 10);
                        }
                        found = true;
                    }
                    i++;
                }
            } else {
                // Si los valores que llegan vienen de la base.
                for (let key in values) {
                    if ((attribute.nombre_bd && key.toUpperCase() === attribute.nombre_bd.toUpperCase()) ||
                        attribute.valorCalculado && attribute.valorCalculado.length > 0 && key.toUpperCase() === attribute.nombre.toUpperCase() ||
                        attribute.valorCalculado == undefined && attribute.nombre_bd == undefined && key.toUpperCase() === attribute.nombre.toUpperCase()) {
                        attributeValue = values[key];
                        if (inputType == 'datetime-local') {
                            attributeValue = attributeValue.substring(0, 16);
                        }
                        else if (inputType == 'date') {
                            attributeValue = attributeValue.substring(0, 10);
                        }
                        break;
                    }
                }
            }
        }

        if ((inputType == 'datetime-local' || inputType == 'date') && forceReadOnly && attributeValue) {
            attributeValue = attributeValue.replace('T', ' ');
        }

        if (attribute && attribute['usage'] && attribute['usage'] === "LOV") {
            let referencedLayer = attribute['capa_referenciada'];
            if (comboData) {
            	if (typeof cargarDatoDefaultAlAtributo == 'function' && attributeValue == null) {
                    attributeValue = cargarDatoDefaultAlAtributo(attributeName, tableChildName, context);
                }
                for (let i = 0; i < comboData.length; i++) {
                    let oneComboData = comboData[i];
                    if (oneComboData['Codiguera'] === referencedLayer) {
                    	contentToReturn +=	`<td>`;
                        contentToReturn +=	`<div>`;
                        contentToReturn +=		`<select id="${inputId}" class="form-control"` + (forceReadOnly ? `disabled` : ``) + `>`;
                        oneComboData['Data'].forEach(oneData => {
                        	let oneDataValue = null;
                            let oneDataLabel = null;
                            for (let key in oneData) {
                            	//recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboValue en la capa ori de la codiguera
                                if (key==oneComboData['comboValue']){
                                    oneDataValue = oneData[key];
                                }
                                //recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboLabel en la capa ori de la codiguera
                                if (key==oneComboData['comboLabel']){
                                	oneDataLabel = oneData[key];
                                }
                            }
                            contentToReturn +=		`<option value="${oneDataValue}"` + (oneDataValue == attributeValue ? `selected` : ``) + `>${oneDataLabel}</option>`;
                        });
                        contentToReturn +=		`</select>`;
                        contentToReturn +=	`</div>`;
                        contentToReturn +=	`</td>`;
                        break;
                    }
                }
            }
        }
        else if (attribute && attribute['usage'] && attribute['usage'] === "LOV_IS_LAZY") {
        	//debugger;
            let referencedLayer = attribute['capa_referenciada'];
            if (comboData) {
            	let encontreValor=false;
            	let script='';
                for (let i = 0; i < comboData.length; i++) {
                    let oneComboData = comboData[i];
                    if (oneComboData['Codiguera'] === referencedLayer) {
                    	contentToReturn +=	`<td>`;
                        contentToReturn +=	`<div>`;
                        contentToReturn +=		`<input list="${inputId}-list" name="${inputId}" id="${inputId}" class="form-control" ` + (forceReadOnly ? `disabled` : ``) + `>`;
                        contentToReturn += 		`<datalist id="${inputId}-list">`;
                        oneComboData['Data'].forEach(oneData => {
                        	let oneDataValue = null;
                            let oneDataLabel = null;
                            for (let key in oneData) {
                            	//recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboValue en la capa ori de la codiguera
                                if (key==oneComboData['comboValue']){
                                    oneDataValue = oneData[key];
                                }
                                //recorro los campos de la BD de la codiguera y me quedo con el valor del que dice que es el comboLabel en la capa ori de la codiguera
                                if (key==oneComboData['comboLabel']){
                                	oneDataLabel = oneData[key];
                                }
                            }
                            
                            if(oneDataValue == attributeValue && !encontreValor){
                            	encontreValor=true;
                            	//debugger;
                            	script = `<script>
                            	document.getElementById("${inputId}").value=document.querySelector("#${inputId}-list option[data-value='${oneDataValue}']").value;
                            	</script>`
                            }
                            contentToReturn +=		`<option data-value="${oneDataValue}" value="${oneDataLabel}"` + (oneDataValue == attributeValue ? `selected` : ``) + `></option>`;                            
                        });
                        contentToReturn +=		`</datalist>`;
                        contentToReturn +=	`</div>`;
                        contentToReturn +=	`</td>`;
                        contentToReturn +=script;
                        break;
                    }
                }
            }
        }else {
            if(!attributeValue || (attributeValue.length > 0 && (attributeValue.toUpperCase() == "NULL" || attributeValue.toUpperCase() == "UNDEFINED"))) {
                attributeValue = "";
            }
            
            if(attributeValue == "" && attributeIsRequired && (inputType == 'datetime-local' ||inputType == 'date') && context._mode != "INFO")
        	{
            	attributeValue = obtenerFechaInicialDefault(inputType);          	
        	}

            if (typeof cargarDatoDefaultAlAtributo == 'function' && attributeValue == '') {
                attributeValue = cargarDatoDefaultAlAtributo(attributeName, tableChildName, context);
            }

            contentToReturn +=	`<td>`

            if (forceReadOnly) {
                contentToReturn +=		`<div>`;
                contentToReturn +=			`${attributeValue}`;
                contentToReturn +=		`</div>`;
            } else {
                contentToReturn +=		`<div>`;
                contentToReturn +=			`<input type="${inputType}" class="form-control" id="${inputId}" value="${attributeValue}"/>`;
                contentToReturn +=		`</div>`;
                setTimeout(function(){changeModeFromChildrenUpdate(that,"table-row-" + childIdentification)},1000);
                
            }
            contentToReturn +=	`</td>`
        }
    }

   

    return contentToReturn;
}

function changeModeFromChildrenUpdate(context, childIdentification){
	$( "#"+ childIdentification ).change(function() {
		context.changeModeFromChildrenData(context, childIdentification, "update");
	});
	
}

function setdatetimepicker() {
    if (idNotFunddatetimelocal.length != 0){
        idNotFunddatetimelocal.forEach(
            function(id) {
                let inputvalue = $('#' + id)[0].value
                $('#' + id).datetimepicker({value:inputvalue, format: 'd/m/Y H:i'});

            }
        );
    }
    if(!Modernizr.inputtypes['datetime-local']) {
        $("input[type=datetime-local]").datetimepicker({mask: true, format: 'd/m/Y H:i'});
    }
}
