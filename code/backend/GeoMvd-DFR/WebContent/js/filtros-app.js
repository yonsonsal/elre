var filterBy = function (filterBy, layerId, context) {
    console.log(filterBy);

    let layer = getLayerByLayerId(context, layerId);
    let layerTitle = layer && layer.values_ ? layer.values_.title : null;

    let title = "Seleccione los datos para filtrar";
    let content = "";
    let cancelAction = null;
    let okButtonText = "Filtrar";
    let cancelButtonText = "Cancelar";
    let cancelButtonMustCloseModal = true;
    let okButtonMustCloseModal = false;
    let size = "full";
    let backdrop = "static";
    let keyboard = false;

    if (filterBy === 'turno') {

        let okAction = filterByTurno;

        content += `
            <div>
                <span id="layer-id-container" hidden>${layerId}</span>
                <form>
                    <div class="form-group">
                        <label for="selectTurno">Seleccionar turno</label>
                        <select class="form-control" id="selectTurnoZonaRecorrido">
                            <option value="" selected>Seleccione...</option>
                            <option value="Matutino">Matutino</option>
                            <option value="Vespertino">Vespertino</option>
                            <option value="Nocturno">Nocturno</option>
                            <option value="Sin Turno">Sin turno</option>    
                        </select>
                    </div>                    
                </form>
            </div>
        `;
        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
    } else if (filterBy === 'viajePlanificado') {
        let okAction = filterByViajePlanificado;
        title = "Filtro"
        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
           <h4>¿Quiere filtrar por viaje planificado?</h4>
        </div>
    `;
        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

    } else if (filterBy === 'circuito') {

        let okAction = filterByCircuito;

        content += `
            <div>
                <span id="layer-id-container" hidden>${layerId}</span>
                <form>
                    <div class="form-group">
                        <label for="selectCircuito">Seleccionar Circuito</label>
                        <select class="form-control" id="selectCircuito">
                            <option value="" selected>Seleccione...</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>    
                        </select>
                    </div>                    
                </form>
            </div>
        `;
        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

    } else if (filterBy === 'municipioRutaRecorridoR') {

        let okAction = filterByMunicipioRutaRecorrido;

        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
            <form>
                <div class="form-group">
                    <label for="selectMunicipio">Municipio</label>
                    <select class="form-control" id="selectMunicipio">
                        <option value="" selected>Seleccione...</option>                          
                    </select>
                    </div>
                    <div class ="form-group">
                        <label for="selectRecorrido">Recorrido</label>
                        <select class="form-control" id="selectRecorrido">
                            <option value="" selected>Seleccione...</option>
                        </select>
                    </div>
                </form>
            </div>                    
        </div>
        `;

        getMunicipiosParaRutasRecorridos().then((data) => {
            let municipios = data;
            let optionsMunicipios = `<option value="" selected>Seleccione...</option>`;
            if (municipios && municipios.length > 0) {
                municipios.forEach(unMunicipio => {
                    optionsMunicipios += `
                    <option value="${unMunicipio.MUNICIPIO}">${unMunicipio.MUNICIPIO}</option>
                `;
                });
                $("#selectMunicipio").html(optionsMunicipios);
            }
        }).catch((error) => {
            console.error("Error en getMunicipiosParaRutasRecorridosPlanificados | error:");
            console.error(error);
        });

        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

        $('#selectMunicipio').on('change', function () {
            let optionsCircuitos = `<option value="" selected>Seleccione...</option>`;

            if (!this.value || this.value.length == 0) {
                $("#selectRecorrido").html(optionsCircuitos);
            } else {
                getCircuitosByMunicipio(this.value).then((data) => {
                    let circuitos = data;
                    if (circuitos && circuitos.length > 0) {
                        circuitos.forEach(unCircuito => {
                            optionsCircuitos += `
                                        <option value="${unCircuito.NOMENCLATURA_CIRCUITO}">${unCircuito.NOMENCLATURA_ABREVIADA}</option>
                                    `;
                        });
                    }
                    $("#selectRecorrido").html(optionsCircuitos);
                }).catch((error) => {
                    console.error("Error en getCircuitosByMunicipio | error:");
                    console.error(error);
                });
            }
        });      

    } else if (filterBy === 'municipioRutaRecorridoRP') {
        let okAction = filterByMunicipioRutaRecorridoPlanificado;

        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
            <form>
                <div class="form-group">
                    <label for="selectMunicipio">Municipio</label>
                    <select class="form-control" id="selectMunicipio">
                        <option value="" selected>Seleccione...</option>                            
                    </select>
                    </div>
                    <div class ="form-group">
                        <label for="selectRecorrido">Recorrido</label>
                        <select class="form-control" id="selectRecorrido">
                            <option value="" selected>Seleccione...</option>
                        </select>
                    </div>
                </form>
            </div>                    
        </div>
        `;

        getMunicipiosParaRutasRecorridosPlanificados().then((data) => {
            let municipios = data;
            let optionsMunicipios = `<option value="" selected>Seleccione...</option>`;
            if (municipios && municipios.length > 0) {
                municipios.forEach(unMunicipio => {
                    optionsMunicipios += `
                    <option value="${unMunicipio.MUNICIPIO}">${unMunicipio.MUNICIPIO}</option>
                `;
                });
                $("#selectMunicipio").html(optionsMunicipios);
            }
        }).catch((error) => {
            console.error("Error en getMunicipiosParaRutasRecorridosPlanificados | error:");
            console.error(error);
        });

        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

        $('#selectMunicipio').on('change', function () {
            let optionsCircuitos = `<option value="" selected>Seleccione...</option>`;

            if (!this.value || this.value.length == 0) {
                $("#selectRecorrido").html(optionsCircuitos);
            } else {
                getCircuitosPlanificadosByMunicipio(this.value).then((data) => {
                    let circuitos = data;
                    if (circuitos && circuitos.length > 0) {
                        circuitos.forEach(unCircuito => {
                            optionsCircuitos += `
                                        <option value="${unCircuito.NOMENCLATURA_CIRCUITO}">${unCircuito.NOMENCLATURA_ABREVIADA}</option>
                                    `;
                        });
                    }
                    $("#selectRecorrido").html(optionsCircuitos);
                }).catch((error) => {
                    console.error("Error en getCircuitosPlanificadosByMunicipio | error:");
                    console.error(error);
                });
            }
        });
    }
    else if (filterBy === 'tipoResiduoMD') {
        let okAction = filterByTipoResiduoMobiliarioDecaux;

        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
            <form>
                <div class="form-group">
                    <label for="selectTipoResiduo">Tipo Residuo</label>
                    <select class="form-control" id="selectTipoResiduo">
                        <option value="" selected>Seleccione...</option>                            
                    </select>
                    </div>
                </form>
            </div>                    
        </div>
        `;

        getTipoResiduoMobiliarioDecaux().then((data) => {
            let tiposResiduos = data;
            let optionsTiposResiduos = `<option value="" selected>Seleccione...</option>`;
            if (tiposResiduos && tiposResiduos.length > 0) {
            	tiposResiduos.forEach(unTipoResiudo => {
            		optionsTiposResiduos += `
                    <option value="${unTipoResiudo.cod_cont}">${unTipoResiudo.nombre_cont}</option>
                `;
                });
                $("#selectTipoResiduo").html(optionsTiposResiduos);
            }
        }).catch((error) => {
            console.error("Error en getTipoResiduoMobiliarioDecaux | error:");
            console.error(error);
        });

        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
    } else if (filterBy === 'municipioRutaRecorridoPR') {

        let okAction = filterByMunicipioPosicionesRecorrido;

        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
            <form>
                <div class="form-group">
                    <label for="selectMunicipio">Municipio</label>
                    <select class="form-control" id="selectMunicipio">
                        <option value="" selected>Seleccione...</option>                            
                    </select>
                    </div>
                    <div class ="form-group">
                        <label for="selectRecorrido">Recorrido</label>
                        <select class="form-control" id="selectRecorrido">
                            <option value="" selected>Seleccione...</option>
                        </select>
                    </div>
                </form>
            </div>                    
        </div>
        `;

        getMunicipiosParaPosicionesRecorridos().then((data) => {
            let municipios = data;
            let optionsMunicipios = `<option value="" selected>Seleccione...</option>`;
            if (municipios && municipios.length > 0) {
                municipios.forEach(unMunicipio => {
                    optionsMunicipios += `
                        <option value="${unMunicipio.MUNICIPIO}">${unMunicipio.MUNICIPIO}</option>
                    `;
                });
                $("#selectMunicipio").html(optionsMunicipios);
            }
        }).catch((error) => {
            console.error("Error en getMunicipiosParaPosicionesRecorridos | error:");
            console.error(error);
        });

        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

        $('#selectMunicipio').on('change', function () {
            let optionsCircuitos = `<option value="" selected>Seleccione...</option>`;

            if (!this.value || this.value.length == 0) {
                $("#selectRecorrido").html(optionsCircuitos);
            } else {
                getCircuitosPosicionesRecorridoByMunicipio(this.value).then((data) => {
                    let circuitos = data;
                    if (circuitos && circuitos.length > 0) {
                        circuitos.forEach(unCircuito => {
                            optionsCircuitos += `
                                        <option value="${unCircuito.NOMENCLATURA_CIRCUITO}">${unCircuito.NOMENCLATURA_ABREVIADA}</option>
                                    `;
                        });
                    }
                    optionsCircuitos += `
                        <option value="Todas">Todas las zonas</option>
                    `;
                    $("#selectRecorrido").html(optionsCircuitos);
                }).catch((error) => {
                    console.error("Error en getCircuitosPosicionesRecorridoByMunicipio | error:");
                    console.error(error);
                });
            }
        });
    } else if (filterBy === 'municipioRutaRecorridoPRH') {

        let okAction = filterByMunicipioPosicionesRecorridoHistorico;

        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
            <form>
                <div class="form-group">
                    <label for="selectMunicipio">Municipio</label>
                    <select class="form-control" id="selectMunicipio">
                        <option value="" selected>Seleccione...</option>                            
                    </select>
                    </div>
                    <div class ="form-group">
                        <label for="selectRecorrido">Recorrido</label>
                        <select class="form-control" id="selectRecorrido">
                            <option value="" selected>Seleccione...</option>
                        </select>
                    </div>
                </form>
            </div>                    
        </div>
        `;

        getMunicipiosParaPosicionesRecorridosHistorico().then((data) => {
            let municipios = data;
            let optionsMunicipios = `<option value="" selected>Seleccione...</option>`;
            if (municipios && municipios.length > 0) {
                municipios.forEach(unMunicipio => {
                    optionsMunicipios += `
                        <option value="${unMunicipio.MUNICIPIO}">${unMunicipio.MUNICIPIO}</option>
                    `;
                });
                $("#selectMunicipio").html(optionsMunicipios);
            }
        }).catch((error) => {
            console.error("Error en getMunicipiosParaPosicionesRecorridosHistorico | error:");
            console.error(error);
        });

        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

        $('#selectMunicipio').on('change', function () {
            let optionsCircuitos = `<option value="" selected>Seleccione...</option>`;

            if (!this.value || this.value.length == 0) {
                $("#selectRecorrido").html(optionsCircuitos);
            } else {
                getCircuitosPosicionesRecorridoHistoricoByMunicipio(this.value).then((data) => {
                    let circuitos = data;
                    if (circuitos && circuitos.length > 0) {
                        circuitos.forEach(unCircuito => {
                            optionsCircuitos += `
                                        <option value="${unCircuito.NOMENCLATURA_CIRCUITO}">${unCircuito.NOMENCLATURA_ABREVIADA}</option>
                                    `;
                        });
                    }
                    optionsCircuitos += `
                        <option value="Todas">Todas las zonas</option>
                    `;
                    $("#selectRecorrido").html(optionsCircuitos);
                }).catch((error) => {
                    console.error("Error en getCircuitosPosicionesRecorridoHistoricoByMunicipio | error:");
                    console.error(error);
                });
            }
        });
    } else if (filterBy === 'municipioRutaRecorridoPRP') {
        let okAction = filterByMunicipioPosicionRecorridoPlanificado;

        content += `
        <div>
            <span id="layer-id-container" hidden>${layerId}</span>
            <form>
                <div class="form-group">
                    <label for="selectMunicipio">Municipio</label>
                    <select class="form-control" id="selectMunicipio">
                        <option value="" selected>Seleccione...</option>                            
                    </select>
                    </div>
                    <div class ="form-group">
                        <label for="selectRecorrido">Recorrido</label>
                        <select class="form-control" id="selectRecorrido">
                            <option value="" selected>Seleccione...</option>
                        </select>
                    </div>
                </form>
            </div>                    
        </div>
        `;

        getMunicipiosParaRutasRecorridosPlanificados().then((data) => {
            let municipios = data;
            let optionsMunicipios = `<option value="" selected>Seleccione...</option>`;
            if (municipios && municipios.length > 0) {
                municipios.forEach(unMunicipio => {
                    optionsMunicipios += `
                    <option value="${unMunicipio.MUNICIPIO}">${unMunicipio.MUNICIPIO}</option>
                `;
                });
                $("#selectMunicipio").html(optionsMunicipios);
            }
        }).catch((error) => {
            console.error("Error en getMunicipiosParaRutasRecorridosPlanificados | error:");
            console.error(error);
        });

        context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);

        $('#selectMunicipio').on('change', function () {
            let optionsCircuitos = `<option value="" selected>Seleccione...</option>`;

            if (!this.value || this.value.length == 0) {
                $("#selectRecorrido").html(optionsCircuitos);
            } else {
                getCircuitosPlanificadosByMunicipio(this.value).then((data) => {
                    let circuitos = data;
                    if (circuitos && circuitos.length > 0) {
                        circuitos.forEach(unCircuito => {
                            optionsCircuitos += `
                                        <option value="${unCircuito.NOMENCLATURA_CIRCUITO}">${unCircuito.NOMENCLATURA_ABREVIADA}</option>
                                    `;
                        });
                    }
                    $("#selectRecorrido").html(optionsCircuitos);
                }).catch((error) => {
                    console.error("Error en getCircuitosPlanificadosByMunicipio | error:");
                    console.error(error);
                });
            }
        });
    } else if (filterBy === 'personalizado') {
        console.log("[filtros-app.js] - filterBy | filterBy = 'personalizado'");
        let map = document.getElementById("wc-map");
        let filterLayer = getFilterLayerByOriginalLayerTitle(map, layerTitle);
        map.applyFiltersFromArray(filterLayer, null);
    }
}

var loadCustomAppFiltersCallback = function (layerName, layerId) {
    // console.log('Cargando filtros custom para capa ', layerName, layerId)
    if (layerName === "Zonas Recorrido") {
        return `
                <li>
                    <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="turno">Por turno</a>
                </li>
                <li>
                    <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="viajePlanificado">Por viaje planificado</a>
                </li>
				`;
    } else if (layerName === "Contenedores CAP") {
        return `
        <li>
            <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="circuito">Circuito</a>
        </li>
		`;
    } else if (layerName === "Rutas Recorrido" || layerName === "Rutas Recorrido - Planificado" || layerName === "Posiciones Recorrido" || layerName === "Posiciones Recorrido Histórico" || layerName === "Posiciones Recorrido - Planificado") {
        switch (layerName) {
            case "Rutas Recorrido":
                layerFilter = "R"
                break;
            case "Rutas Recorrido - Planificado":
                layerFilter = "RP"
                break;
            case "Posiciones Recorrido":
                layerFilter = "PR"
                break;
            case "Posiciones Recorrido Histórico":
                layerFilter = "PRH"
                break;
            case "Posiciones Recorrido - Planificado":
                layerFilter = "PRP"
                break;
            default:
                break;
        }
        return `
        <li>
            <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="municipioRutaRecorrido${layerFilter}">Por municipio y recorrido</a>
        </li>
		`;
    }  else if (layerName === "Mobiliario Decaux") {
        return `
        <li>
            <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" action="filter" filter-by="tipoResiduoMD">Tipo Residuo</a>
        </li>
		`;
    }
    else return "";
}

function filterByTurno() {
    let map = document.getElementById("wc-map");
    let turno = $("#selectTurnoZonaRecorrido").val();
    getIdFiltroTurnosZonasRecorrido(turno).then(data => {
        let codigos = [];
        data.forEach(element => {
            codigos.push(element['NOMENCLATURA_CIRCUITO']);
        });
        let filtroZonasRecorrido = getFilterLayerByOriginalLayerTitle(map, 'Zonas Recorrido');
        const filtroZonasRecorridoPorTurnosDoneCallback = (features) => {
            console.log('iniciando fitro zonas recorrido por turnos callback', features)
            if (codigos) {
                features = features.filter(f => {
                    if (f.get('COD_RECORRIDO'))
                        return codigos.includes(f.get('COD_RECORRIDO').toString());
                    else
                        return false;
                })
                console.log('terminado fitro zonas recorrido por turnos callback', features);
                map.addFilterToLayer('Zonas Recorrido', {});
            }
            return features;
        }
        map.applyFiltersFromArray(filtroZonasRecorrido, filtroZonasRecorridoPorTurnosDoneCallback, false);
    }).catch((error) => {
        console.log("Error en getIdFiltroTurnosZonasRecorrido | error:");
        console.log(error);
    });

    map.closeGeneralModal();
}

function filterByViajePlanificado() {
    console.log("Filtrar por viaje planificado");
    let map = document.getElementById("wc-map");
    getIdFiltroViajesPlanificadosZonasRecorrido().then(data => {
        let codigos = [];
        data.forEach(element => {
            codigos.push(element['NOMENCLATURA_CIRCUITO']);
        });
        let filtroZonasRecorrido = getFilterLayerByOriginalLayerTitle(map, 'Zonas Recorrido');
        const filtroZonasRecorridoPorViajePlanificadoDoneCallback = (features) => {
            console.log('iniciando fitro zonas recorrido por viaje planificado callback', features)
            if (codigos) {
                features = features.filter(f => {
                    if (f.get('COD_RECORRIDO'))
                        return codigos.includes(f.get('COD_RECORRIDO').toString());
                    else
                        return false;
                })
                console.log('terminado fitro zonas recorrido por turnos callback', features);
                map.addFilterToLayer('Zonas Recorrido', {});
            }
            return features;
        }
        map.applyFiltersFromArray(filtroZonasRecorrido, filtroZonasRecorridoPorViajePlanificadoDoneCallback, false);
    }).catch((error) => {
        console.log("Error en getIdFiltroViajesPlanificadosZonasRecorrido | error:");
        console.log(error);
    });

    map.closeGeneralModal();
}

function filterByCircuito() {
    let map = document.getElementById("wc-map");
    let circuito = $("#selectCircuito").val();

    let layerId = $("#layer-id-container").html();
    if (circuito !== "") {
        if (layerId && layerId.length > 0) {
            const layerTitle = getLayerByLayerId(map, layerId).values_.title;

            const filtro = ol.format.filter.equalTo('CIRCUITO', circuito);
            map.addFilterToLayer(layerTitle, { filterType: 'GEOSERVER', filterKey: 'CIRCUITO', filterName: 'CIRCUITO', filter: filtro });

            let filterLayer = getFilterLayerByOriginalLayerTitle(map, layerTitle);
            map.applyFiltersFromArray(filterLayer, null);
            map.closeGeneralModal();
        } else {
            alertify.error("Ha ocurrido un error al identificar la capa con la que se quiere trabajar. Por favor, intente nuevamente.");
            map.closeGeneralModal();
        }
    }
    else {
        alertify.error("Debe seleccionar un Circuito.");
    }
}

function filterByMunicipioRutaRecorrido() {
    console.log("Filtrar por municipio ruta recorrido");
    let map = document.getElementById("wc-map");
    let circuito = $("#selectRecorrido").val();
    let filtroRutasRecorrido = getFilterLayerByOriginalLayerTitle(map, 'Rutas Recorrido');
    const filtroRutasRecorridoDoneCallback = (features) => {
        console.log('iniciando fitro rutas recorrido callback', features)
        if (circuito) {
            features = features.filter(f => {
                if (f.get('NOM_RUT'))
                    return circuito.includes(f.get('NOM_RUT').toString());
                else
                    return false;
            })
            console.log('terminado fitro rutas recorrido callback', features);
            map.addFilterToLayer('Rutas Recorrido', {});
        }
        return features;
    }
    map.applyFiltersFromArray(filtroRutasRecorrido, filtroRutasRecorridoDoneCallback, false);

    map.closeGeneralModal();
}

function filterByMunicipioRutaRecorridoPlanificado(){
    console.log("Filtrar por municipio ruta recorrido planificado");
    let map = document.getElementById("wc-map");
    let circuito = $("#selectRecorrido").val();
    let filtroRutasRecorridoPlanificado = getFilterLayerByOriginalLayerTitle(map, 'Rutas Recorrido - Planificado');

    const filtroRutasRecorridoPlanificadoDoneCallback = (features) => {
        console.log('iniciando fitro rutas recorrido planificado callback', features)
        if (circuito) {
            features = features.filter(f => {
                if (f.get('NOM_RUT'))
                    return circuito.includes(f.get('NOM_RUT').toString());
                else
                    return false;
            })
            console.log('terminado fitro rutas recorrido callback', features);
            map.addFilterToLayer('Rutas Recorrido', {});
        }
        return features;
    }
    map.applyFiltersFromArray(filtroRutasRecorridoPlanificado, filtroRutasRecorridoPlanificadoDoneCallback, false);

    map.closeGeneralModal();
}

function filterByTipoResiduoMobiliarioDecaux() {
    console.log("Filtrar por tipo residuo");
    let map = document.getElementById("wc-map");
    let tipoResiduo = $("#selectTipoResiduo").val();
    let filtroTipoResiduo = getFilterLayerByOriginalLayerTitle(map, 'Mobiliario Decaux');
    const filtroTipoResiduoDoneCallback = (features) => {
        console.log('iniciando fitro tipo residuo callback ' + tipoResiduo, features)
        if (tipoResiduo) {
            features = features.filter(f => {
                if (f.get('tipo_residuo'))
                    return tipoResiduo.includes(f.get('tipo_residuo').toString());
                else
                    return false;
            })
            console.log('terminado fitro tipo residuo callback', features);
            map.addFilterToLayer('Mobiliario Decaux', {});
        }
        return features;
    }
    map.applyFiltersFromArray(filtroTipoResiduo, filtroTipoResiduoDoneCallback, false);

    map.closeGeneralModal();
}

function filterByMunicipioPosicionesRecorrido() {
    console.log("Filtrar por municipio posiciones recorrido");
    let map = document.getElementById("wc-map");
    let circuito = $("#selectRecorrido").val();
    let filtroPosicionesRecorrido = getFilterLayerByOriginalLayerTitle(map, 'Posiciones Recorrido');

    let filtroPosicionesRecorridoDoneCallback;

    if (circuito == "Todas") {
        let municipio = $("#selectMunicipio").val();
        filtroPosicionesRecorridoDoneCallback = (features) => {
            console.log('iniciando fitro posiciones recorrido  callback', features)
            if (circuito) {
                features = features.filter(f => {
                    if (f.get('COD_MUNICIPIO'))
                        return municipio.includes(f.get('COD_MUNICIPIO').toString());
                    else
                        return false;
                })
                console.log('terminado fitro Posiciones recorrido callback', features);
                map.addFilterToLayer('Posiciones Recorrido', {});
            }
            return features;
        }
    } else {
        filtroPosicionesRecorridoDoneCallback = (features) => {
            console.log('iniciando fitro posiciones recorrido  callback', features)
            if (circuito) {
                features = features.filter(f => {
                    if (f.get('COD_RECORRIDO'))
                        return circuito.includes(f.get('COD_RECORRIDO').toString());
                    else
                        return false;
                })
                console.log('terminado fitro Posiciones recorrido callback', features);
                map.addFilterToLayer('Posiciones Recorrido', {});
            }
            return features;
        }
    }

    map.applyFiltersFromArray(filtroPosicionesRecorrido, filtroPosicionesRecorridoDoneCallback, false);

    map.closeGeneralModal();
}

function filterByMunicipioPosicionesRecorridoHistorico() {
    console.log("Filtrar por municipio posiciones recorrido Historico");
    let map = document.getElementById("wc-map");
    let circuito = $("#selectRecorrido").val();
    let filtroPosicionesRecorridoHistorico = getFilterLayerByOriginalLayerTitle(map, 'Posiciones Recorrido Histórico');

    let filtroPosicionesRecorridoHistoricoDoneCallback;

    if (circuito == "Todas") {
        let municipio = $("#selectMunicipio").val();
        filtroPosicionesRecorridoHistoricoDoneCallback = (features) => {
            console.log('iniciando fitro posiciones recorrido  callback', features)
            if (circuito) {
                features = features.filter(f => {
                    if (f.get('COD_MUNICIPIO'))
                        return municipio.includes(f.get('COD_MUNICIPIO').toString());
                    else
                        return false;
                })
                console.log('terminado fitro rutas recorrido callback', features);
                map.addFilterToLayer('Posiciones Recorrido Histórico', {});
            }
            return features;
        }
    } else {
    	filtroPosicionesRecorridoHistoricoDoneCallback = (features) => {
            console.log('iniciando fitro posiciones recorrido  callback', features)
            if (circuito) {
                features = features.filter(f => {
                    if (f.get('COD_RECORRIDO'))
                        return circuito.includes(f.get('COD_RECORRIDO').toString());
                    else
                        return false;
                })
                console.log('terminado fitro rutas recorrido Historico callback', features);
                map.addFilterToLayer('Posiciones Recorrido Histórico', {});
            }
            return features;
        }
    }

    map.applyFiltersFromArray(filtroPosicionesRecorridoHistorico, filtroPosicionesRecorridoHistoricoDoneCallback, false);

    map.closeGeneralModal();
}

function filterByMunicipioPosicionRecorridoPlanificado(){
    console.log("Filtrar por municipio ruta posicion planificado");
    let map = document.getElementById("wc-map");
    let circuito = $("#selectRecorrido").val();
    let filtroPosicionesRecorridoPlanificado = getFilterLayerByOriginalLayerTitle(map, 'Posiciones Recorrido - Planificado');
    const filtroPosicionesRecorridoPlanificadoDoneCallback = (features) => {
        console.log('iniciando fitro posiciones recorrido planificado callback', features)
        if (circuito) {
            features = features.filter(f => {
                if (f.get('COD_RECORRIDO'))
                    return circuito.includes(f.get('COD_RECORRIDO').toString());
                else
                    return false;
            })
            console.log('terminado fitro posiciones recorrido callback', features);
            map.addFilterToLayer('Posiciones Recorrido - Planificado', {});
        }
        return features;
    }
    map.applyFiltersFromArray(filtroPosicionesRecorridoPlanificado, filtroPosicionesRecorridoPlanificadoDoneCallback, false);

    map.closeGeneralModal();
}