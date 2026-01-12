function renderWCMapHTML() {
    let html = ``;

    html += mousePositionStyle();
    html += overviewMapStyle();
    html += scaleLineStyle();
    html += measureStyle();
    html += sidebarLyerSwitcherStyle();
    html +=	generalInfoStyle();
    html += pendingChangesStyle();
    html += generalModalStyle();
    html += secondaryMenuStyle();

    html += `
			<div id="sidebar-layer-switcher">
				<div id="layer-switcher-content"></div>
				<div id="layer-switcher-find" >
					<a id="botonBuscar" href="#colapsable"  class="btn btn-info" data-toggle="collapse">Buscar por ubicación</a>
					<div id="colapsable" style="padding: 3px;" class="collapse">
						<select id="selectTfind" name="select" onchange="changeBusqueda()" style="width: 100%;height: 23px;font-size:9pt;">
						  <option value="1" selected>Calle y Nro. puerta</option> 
						  <option value="2" >Esquina</option>
						  <option value="3">Padron</option>
						  <option value="4">CCZ</option>
						  <option value="5">Barrio</option>
						  <option value="6">Municipio</option>
						  <option value="7">Lugar de Interes</option>
						</select>
						
						<input type="text" id="calles" name="calles" list="likecalles" onkeypress="buscarCallesControl();" placeholder="Nombre de una calle" class="findInputtext" style="text-align: left;">
						<datalist id="likecalles">
						</datalist>
						
						<input type="text" id="esquinas" name="esquinas" list="likeesquinas"  onfocus="likeesquinas();" placeholder="Esquina" class="findInputtext" style="display:none; text-align: left;">
						<datalist id="likeesquinas">
						</datalist>
						
				  		<input type="text" id="nropuerta" name="nropuerta" placeholder="Nro. de puerta" class="findInputtext" style="text-align: left;">
				  		<input type="text" id="padron" name="padron" placeholder="Padron" class="findInputtext" style="display:none; text-align: left;">
				  		
				  		<select id="ccz" class="findInputtext" name="ccz" style="display:none; text-align: left;">
						  
						</select>
				  		
				  		<input type="text" id="barrios" name="barrios" list="likebarrios" onkeypress="buscarBarriosControl();" placeholder="Nombre de un barrio" class="findInputtext" style="display:none; text-align: left;">
						<datalist id="likebarrios">
						</datalist>
						
						<select id="municipios" class="findInputtext" name="municipios" style="display:none; text-align: left;">
						  
						</select>
						
						<select id="lugaresInteres" name="lugaresInteres" onchange="changeLugaresInteres()" style="display:none; margin-top: 5px; width: 100%;height: 23px;font-size:9pt;">
						  <option value="0" selected>Todos</option> 
						  <option value="1">Cultura</option> 
						  <option value="2">Deporte</option>
						  <option value="3">Educacion</option>
						  <option value="4">Espacio Libre</option>
						  <option value="5">Monumento</option>
						  <option value="6">Patrimonio</option>
						  <option value="7">Playa</option>
						  <option value="8">Salud</option>
						</select>			
						<input type="text" id="nombreLugar" name="nombreLugar" list="likelugaresInteres" onkeypress="buscarnombreLugarControl();" placeholder="Nombre" class="findInputtext" style="display:none; text-align: left;">
				  		<datalist id="likelugaresInteres">
						</datalist>
				  		
				  		<button id="deletefind" >Limpiar</button>
				  		<button id="find" >Buscar</button>
			  		</div>
				</div>
			</div>
			
			<div id="map-container">
				<div id="map" class="map" style="width: 100%; height: 100%; position:absolute">
					<div id="control-sidebar-layer-switcher"><div>
				</div>
			</div>
			
			<wc-toolbar id="wc-toolbar" showOnHover="false"></wc-toolbar>
			
			<div id="new-buttons-container"></div>
			
			<div id="general-info" class="hidden">
				<div class="general-info-line">
					<span class="general-info-line-label">Modo seleccionado:</span>
					<span id="selected-mode" class="general-info-line-data">Ninguno</span>
					<span id="clear-selected-mode" class="clear-selected-mode-hidden"><i class="fas fa-times"></i></span>
				</div>
				<div class="general-info-line">
					<span class="general-info-line-label">Capa para edición:</span>
					<span id="selected-layer-to-edit" class="general-info-line-data">Ninguna</span>
				</div>
			</div>
			
			<div id="pending-changes" class="hidden">
				<p>Cambios realizados</p>
				<table>
					<thead>
						<tr>
							<th>Tipo</th>
							<th>Estado</th>
						</tr>
					</thead>
					<tbody id="pending-change-table-body">
					</tbody>
				</table>
			</div>
    
			<div id="modal-select-layer-to-filter" class="modal fade" tabindex="-1" role="dialog">
				<div class="modal-dialog modal-sm" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal">&times;</button>
							<h4 class="modal-title">¿Sobre qué capa desea filtrar?</h4>
						</div>
						<div id="modal-select-layer-to-filter-body" class="modal-body">
						</div>
						<div class="modal-footer">
							<button id="modal-select-layer-to-filter-button-cancel" type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
							<button id="modal-select-layer-to-filter-button-select" type="button" class="btn btn-primary">Seleccionar</button>
						</div>
					</div>
				</div>
			</div>
			
			<div id="general-modal" class="modal fade" tabindex="-1" role="dialog">
				<div id="general-modal-dialog" class="modal-dialog" role="document">
					<div id="general-modal-content" class="modal-content">
					</div>
				</div>
			</div>
		`;

    return html;
}

function updatePendingChangesCard(context) {
    let that = context;
    let pendingChangeTableBodyContent = ``;

    if (that.pendingChangesToProcess && that.pendingChangesToProcess.length > 0) {
        that.pendingChangesToProcess.forEach((onePendingChange, index) => {
            let types = [];
            onePendingChange.typesToShow.forEach(otts => {
                switch (otts) {
                    case "CREATE":
                        types.push("Creación");
                        break;
                    case "UPDATE":
                        types.push("Modificación");
                        break;
                    case "DELETE":
                        types.push("Eliminación");
                        break;
                }
            });
            let status = "";
            switch (onePendingChange.status) {
                case "PENDING":
                    status = "Pendiente";
                    break;
                case "PROCESSED":
                    status = "Procesada";
                    break;
                case "WITH_ERROR":
                    status = "Falló";
                    break;
            }
            pendingChangeTableBodyContent +=    `
                                                    <tr class="${onePendingChange.status}">
                                                        <td>
                                                `;
            types.forEach(oneType => {
                pendingChangeTableBodyContent +=    `
                                                            <span style="display: block;">${oneType}</span>
                                                    `;
            });
            pendingChangeTableBodyContent +=    `
                                                        </td>
                                                        <td>${status}</td>
                                                    </tr>
                                                `;
        });
        if ($("#pending-changes").hasClass("hidden")) {
            //$("#pending-changes").removeClass("hidden");
        }
    } else {
        if (!$("#pending-changes").hasClass("hidden")) {
            $("#pending-changes").addClass("hidden");
        }
    }

    $("#pending-change-table-body").html(pendingChangeTableBodyContent);
}

function getLayerOptionsHTML(layerName, layerId, context) {
	layerTitle = "FILTER_LAYER_" + layerName;

	layer = getLayerByNameOrTitle(context, layerTitle);
	layerIdFiltro = "";
	if(layer){
		layerIdFiltro = layer.values_.layerId;
	}
    return `
                <li class="dropdown-submenu">
                    <a class="dropdown-item dropdown-toggle cursor-pointer">Etiquetas ▼</a>
                    <ul class="dropdown-menu dropdown-menu-submenu">
                    	<li>
			                <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" layer-id-filtro="${layerIdFiltro}" action="mostrarEtiqueta">Mostrar</a>
			            </li>
			            <li>
			                <a class="dropdown-item cursor-pointer contextual-menu-action" layer-id="${layerId}" layer-id-filtro="${layerIdFiltro}" action="ocultarEtiqueta">Ocultar</a>
			            </li>
    				</ul>
                </li>
        `;
}
