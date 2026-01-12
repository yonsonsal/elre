var controladorTiempo = "";

function likecalle(){
	let nomCalle = $("#calles")[0].value.trim();
	
	let dataList = $('#likecalles');
	
	if (1 < nomCalle.length)
		$.get(WCMapcalleLikenombreURL + "?nomCalle=" + nomCalle)
		.done(function(response) {
			comboFindCalle = "";
			dataList.empty();
			dataList = dataList[0];
						
			if (response ) {
				comboFindCalle = response;
				
				comboFindCalle.forEach(function(item) {
			        // Creando un option por cada calle.
			        var option = document.createElement('option');
			        option.value = item.nombre;
			        option.dataset.value = item.codigo;
			        dataList.appendChild(option);
				});
			}
	
		})
		.fail(function() {
			alertify.error("Ha ocurrido un error al cargar las calles. Por favor, intente nuevamente.");
		}); 		
}

function buscarCallesControl(){ 
	clearTimeout(controladorTiempo);
	controladorTiempo = setTimeout(likecalle, 250);
}

function likebarrio(){
	let nomBarrio = $("#barrios")[0].value.trim();
	let dataList = $('#likebarrios');
	
	comboFindBarrio = "";

	if (1 < nomBarrio.length)
		$.get(WCMapbarrioLikenombreURL + "?nomBarrio=" + nomBarrio)
		.done(function(response) {
						
			if (response ) {
				comboFindBarrio = response;
				dataList.empty();
				dataList = dataList[0];
				
				comboFindBarrio.forEach(function(item) {
			        // Creando un option por cada barrio.
			        var option = document.createElement('option');
			        option.value = item.nombre;
			        option.dataset.value = item.codigo;
			        dataList.appendChild(option);
				});
			}
		})
		.fail(function() {
			alertify.error("Ha ocurrido un error al cargar los barrios. Por favor, intente nuevamente.");
		}); 		
}

function buscarnombreLugarControl(){ 
	clearTimeout(controladorTiempo);
	controladorTiempo = setTimeout(likelugaresInteres, 250);
}

function likelugaresInteres(){
	let lugar = $("#lugaresInteres")[0].value;
	let lugNom = "";
	let nombreLugar = $("#nombreLugar")[0].value.trim();
	
	if (lugar == 0){
		lugNom = "lugaresDeInteres";
	}
	else if (lugar == 1){
		lugNom = "cultura";
	}
	else if (lugar == 2){
		lugNom = "deporte";
	}
	else if (lugar == 3){
		lugNom = "educacion";
	}
	else if (lugar == 4){
		lugNom = "nombresDeEspacioLibre";
	}
	else if (lugar == 5){
		lugNom = "monumentos";
	}
	else if (lugar == 6){
		lugNom = "patrimonio";
	}
	else if (lugar == 7){
		lugNom = "playas";
	}
	else if (lugar == 8){
		lugNom = "salud";
	}
	let dataList = $('#likelugaresInteres');
	
	comboFindLugarInteres = "";

	if (1 < nombreLugar.length)
		
		$.get(WCMaplugarDeInteresLikenombreURL + "?lugar=" + lugNom + "&nombre=" + nombreLugar)
		.done(function(response) {
						
			if (response ) {
				comboFindLugarInteres = response;
				dataList.empty();
				dataList = dataList[0];
				
				comboFindLugarInteres.forEach(function(item) {
			        // Creando un option por cada lugar.
			        var option = document.createElement('option');
			        option.value = item.nombre;
			        
			        //SI VIENE EN 0 ES PORQUE EN EL COMBO ESTABA EN TODOS, POR LO CUAL TENGO QUE VER A QUE TIPO PERTENECE
					//EN ESTOS CASOS YO LO GUARDO DISTINTO AL dataset.value Y VOY A TENER QUE HACER SPLIT
			        if(lugar == 0){
			        	option.dataset.value = item.codigo + "#" + item.descSubtipo;	
			        }
			        else
		        	{	
			        	option.dataset.value = item.codigo;		        	
		        	}
			        dataList.appendChild(option);
				});
			}
		})
		.fail(function() {
			alertify.error("Ha ocurrido un error al cargar los " + lugNom + ". Por favor, intente nuevamente.");
		}); 		
}

function buscarBarriosControl(){ 
	clearTimeout(controladorTiempo);
	controladorTiempo = setTimeout(likebarrio, 250);
}

function likeesquinas(){
	let nomCalle = document.getElementById("calles").value.trim();
	
	if (nomCalle != null && nomCalle != ""){
		let codigo = null;
		if(document.querySelector("#likecalles option[value='"+nomCalle+"']")){
			codigo = document.querySelector("#likecalles option[value='"+nomCalle+"']").dataset.value;
		}
		if(codigo){
			let dataListEsq = $('#likeesquinas');
			
			$.get(WCMapesquinabycalleURL + "?codigoCalle=" + codigo)
			.done(function(response) {
				comboFindEsquinas = "";
				dataListEsq.empty();
				dataListEsq = dataListEsq[0];
				
				if (response) {
					comboFindEsquinas = response;
					
					comboFindEsquinas.forEach(function(item) {
						
						 // Creando un option por cada esquina.
				        var option = document.createElement('option');
				        option.value = item.nombre;
				        option.dataset.value = item.codigo;
				        dataListEsq.appendChild(option);
					});
				}
			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar las esquinas. Por favor, intente nuevamente.");
			});
		}
		else{
			alertify.error("La Calle no existe");
		}
	}
	else{
		alertify.error("La Calle no existe");
	}
}

function changeBusqueda(){
	
	let tfind = $("#selectTfind")[0].value;
	
	if (tfind == 1){
		$("#esquinas").hide();
		$("#padron").hide();
		$("#calles").show();
		$("#nropuerta").show();
		$("#ccz").hide();
		$("#barrios").hide();
		$("#municipios").hide();
		$("#lugaresInteres").hide();
		$("#nombreLugar").hide();
	}
	else if (tfind == 2){
		$("#esquinas").show();
		$("#padron").hide();
		$("#calles").show();
		$("#nropuerta").hide();
		$("#ccz").hide();
		$("#barrios").hide();
		$("#municipios").hide();
		$("#lugaresInteres").hide();
		$("#nombreLugar").hide();
	}
	else if (tfind == 3){
		$("#esquinas").hide();
		$("#padron").show();
		$("#calles").hide();
		$("#nropuerta").hide();
		$("#ccz").hide();
		$("#barrios").hide();
		$("#municipios").hide();
		$("#lugaresInteres").hide();
		$("#nombreLugar").hide();
	}
	else if (tfind == 4){
		$("#esquinas").hide();
		$("#padron").hide();
		$("#calles").hide();
		$("#nropuerta").hide();
		cargarCcz();
		$("#ccz").show();
		$("#barrios").hide();
		$("#municipios").hide();
		$("#lugaresInteres").hide();
		$("#nombreLugar").hide();
	}
	else if (tfind == 5){
		$("#esquinas").hide();
		$("#padron").hide();
		$("#calles").hide();
		$("#nropuerta").hide();
		$("#ccz").hide();
		$('#likebarrios').empty();
		$("#barrios").show();
		$("#municipios").hide();
		$("#lugaresInteres").hide();
		$("#nombreLugar").hide();
	}
	else if (tfind == 6){
		$("#esquinas").hide();
		$("#padron").hide();
		$("#calles").hide();
		$("#nropuerta").hide();
		$("#ccz").hide();
		$("#barrios").hide();
		cargarMunicipios();
		$("#municipios").show();
		$("#lugaresInteres").hide();
		$("#nombreLugar").hide();
	}
	else if (tfind == 7){
		$("#esquinas").hide();
		$("#padron").hide();
		$("#calles").hide();
		$("#nropuerta").hide();
		$("#ccz").hide();
		$("#barrios").hide();
		$("#municipios").hide();
		$("#lugaresInteres").show();
		$("#nombreLugar").show();
	}
	
	let mapa = parseInt($("#map").css('height'));
	let buscador = parseInt($("#layer-switcher-find").css('height'));
	let valor;
	
	valor = mapa - buscador;
	
	$("#sidebar-layer-switcher").css("height",valor+"px");
}

function changeLugaresInteres(){
	$("#nombreLugar")[0].value = "";
	$('#likelugaresInteres').empty();
}

function formatoFechafecha(fecha,isdatetime){
	let arrfecha;
	if (isdatetime){
		arrfecha = fecha.split(" ");
	}
	else{
		arrfecha = fecha.split("T");
	}
	
	
	let arrdate = arrfecha[0].split("-");
	
	let time = arrfecha[1].split(":");
	
	let horas = time[0];
	let minutos = time[1];
	
	let d = new Date(arrdate[0] + "-" + arrdate[1] + "-" + arrdate[2] + "T" + horas + ':' + minutos+':00');
	
	return d.format("yyyy-mm-dd HH:MM");
	
}

function obtenerFechaInicialDefault(inputType){
	let fechaRetorno;
	let hoy = new Date();
	
	let mes = hoy.getMonth() + 1;
	let dia = hoy.getDate();
	
	let hora = hoy.getHours();
	let minutos = hoy.getMinutes();
	
	let horaRetorno = (hora < 10 ? '0' + hora : hora) + ':' + (minutos < 10 ? '0'+minutos : minutos) + ':00';
	
	fechaRetorno = hoy.getFullYear() + '-' + ( mes < 10 ? '0'+mes : mes ) + '-' + ( dia < 10 ? '0'+dia : dia );
	
	if (inputType == 'datetime-local') {
		fechaRetorno = fechaRetorno + 'T' + horaRetorno;
	}

	return fechaRetorno;
}

function restarHorasafecha(fecha,horasresta,isdatetime){
	let arrfecha;
	let restoHora = true;
	if (isdatetime){
		arrfecha = fecha.split(" ");
	}
	else{
		arrfecha = fecha.split("T");
		if(arrfecha.length==1){
			arrfecha = fecha.split(" ");
			restoHora = false;
		}
	}
	
	let arrdate = arrfecha[0].split("-");
	
	let time = arrfecha[1].split(":");
	
	let horas = time[0];
	let minutos = time[1];
	
	let d = new Date(arrdate[0] + "-" + arrdate[1] + "-" + arrdate[2] + "T" + horas + ':' + minutos+':00');
	
	if(restoHora){
		d.setHours(d.getHours() - horasresta);
	}
	
	return d.format("yyyy-mm-dd HH:MM");
	
}


function restarHoras(hrs,horasresta){
	
	let time = hrs.split(":");
	
	let hora = parseInt(time[0]) - horasresta;
	
	return hora.toString() + ":" + time[1];
	
}

/* Función que suma o resta días a una fecha, si el parámetro
días es negativo restará los días*/
function sumarDias(fecha, dias){
	fecha.setDate(fecha.getDate() + dias);
	return fecha;
}

//QUIERO SABER SI LA FECHA DESDE ES MENOR O IGUAL A LA FECHA HASTA
//TIENEN QUE VENIR EN FORMATO AAAA-MM-DD
function compararFecha(fechaDesde, fechaHasta){
	let retorno = true;
	let arrDateDesde = fechaDesde.split("-");
	let arrDateHasta = fechaHasta.split("-");
	
	let f1 = new Date(arrDateDesde[0], arrDateDesde[1]-1, arrDateDesde[2]);
	let f2 = new Date(arrDateHasta[0], arrDateHasta[1]-1, arrDateHasta[2]);
	
	if(f1 > f2){
		retorno = false;
	}
	return retorno;
}

function exportLayer(url, dbms, datasource, layername, featuresPk, delay,urls,capa) {
	let generateReportURL= url + '/' + dbms +'/' + datasource + '/' + layername;
	let body = '{"gids":[';
	featuresPk.forEach(pk => {body += '"' + pk + '",'});
	body = body.substr(0, body.length-1);
	body += ']}';
	
	$.ajax({
		type: "POST",
        url: generateReportURL,
        dataType: "text",
        contentType: "application/json",
        data: body,
    	success: (data) => {
    		var nomAux = data.split("/");
			let nomArchivo = nomAux[nomAux.length -1];
			
			var hoy = new Date();
			var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
			var hora = hoy.getHours() + ':' + hoy.getMinutes();

    		if (nomArchivo.endsWith("shp")) {	//Si es un shapefile, agregar los archivos asociados (dbf, prj, )!
    			//window.open(data, '_blank');
				//window.open(data.replace(".shp",".dbf"), '_blank');
				//window.open(data.replace(".shp",".shx"), '_blank');
				//window.open(data.replace(".shp",".prj"), '_blank');
				
				/*urls.push([capa + " " + fecha + " " + hora + ".shp",data]);
				urls.push([capa + " " + fecha + " " + hora + ".dbf",data.replace(".shp",".dbf")]);
				urls.push([capa + " " + fecha + " " + hora + ".shx",data.replace(".shp",".shx")]);
				urls.push([capa + " " + fecha + " " + hora + ".prj",data.replace(".shp",".prj")]);
				*/
				
    			//esto es nuevo y lo hago para poder invocar a una fomra de generar zip a partir de la url de cada archivo
    			//solo lo usariamos para formato shp
				let urlFilesSHP= new Array();
				urlFilesSHP.push(data);
				urlFilesSHP.push(data.replace(".shp",".dbf"));
				urlFilesSHP.push(data.replace(".shp",".shx"));
				urlFilesSHP.push(data.replace(".shp",".prj"));
				
				saveToZip("SHP_"+capa + " " + fecha + " " + hora, urlFilesSHP);
				
    		} else{
    			nomArchivo = nomArchivo.split(".")[1];
    			urls.push([capa + " " + fecha + " " + hora + "." + nomArchivo,data]);
    		}
				
			console.log('Exportando archivo ', nomArchivo)
    		//openInNewTab(data, delay);
    	},
		error: (error) => {
           console.error("[actions.js] - exportLayer - ajax - error | error:");
           console.error(error);
           alertify.error('Ha ocurrido un error al descargar el reporte.');
       }
   });
}

function eliminarBusqueda(context){
	let that = context;
	let map = that._map;
	if (capa) {
		map.removeLayer(capa);
	}
	
	$("#esquinas").hide();
	$("#padron").hide();
	$("#calles").show();
	$("#nropuerta").show();
	$("#ccz").hide();
	$("#barrios").hide();
	$("#municipios").hide();
	$("#lugaresInteres").hide();
	$("#nombreLugar").hide();

	$("#padron")[0].value = null;
	$("#calles")[0].value = null;
	$("#esquinas")[0].value = null;
	$("#nropuerta")[0].value = null;
	$("#ccz")[0].value = null;
	$("#barrios")[0].value = null;
	$("#municipios")[0].value = null;
	$("#lugaresInteres")[0].value = null;
	$("#nombreLugar")[0].value = null;

	$('#likecalles').empty();
	$('#likeesquinas').empty();
	$('#likebarrios').empty();
	$('#likelugaresInteres').empty();
	$("#selectTfind option[value=1]").attr("selected",true);
	$("#selectTfind")[0].value = 1
	$("#lugaresInteres")[0].value = 0;

	let mapa = parseInt($("#map").css('height'));
	let buscador = parseInt($("#layer-switcher-find").css('height'));
	let valor;
	
	valor = mapa - buscador;
	
	$("#sidebar-layer-switcher").css("height",valor+"px");
}

function findMaps(context){
	let that = context;
	let tfind = $("#selectTfind")[0].value;
	if (tfind == 1){
		buscarPorCalleyPuerta(that);
	}
	else if (tfind == 2){
		buscarEsquina(that);
	}
	else if (tfind == 3){
		buscarPadron(that)
	}
	else if (tfind == 4){
		buscarCCZ(that)
	}
	else if (tfind == 5){
		buscarBarrio(that)
	}
	else if (tfind == 6){
		buscarMunicipio(that)
	}
	else if (tfind == 7){
		buscarLugarInteres(that)
	}
}

function buscarPorCalleyPuerta(context){
	let that = context;
	let map = that._map;
	let nomCalle = document.getElementById("calles").value.trim();
	let nropuerta = $('#nropuerta')[0].value.trim();
	
	if(nomCalle !== "" && nropuerta !== ""){
		let codigo = null;
		
		if(document.querySelector("#likecalles option[value='"+nomCalle+"']")){
			codigo = document.querySelector("#likecalles option[value='"+nomCalle+"']").dataset.value;
		}

		if (codigo){
			$.get(WCMapubicacioncallebycodigoandnropuertaURL + "?codigo=" + codigo + "&nropuerta=" + nropuerta)
				.done(function(response) {

					if (response ) {
						let coor = response.geoJSON.coordinates;

						that.setPositionByCenter(coor, 20);

						let marcador = new ol.Feature({
							geometry: new ol.geom.Point(
									coor// En dónde se va a ubicar
							),
						});

						// Agregamos icono
						marcador.setStyle(new ol.style.Style({
							image: new ol.style.Circle({
								radius: 12,
								stroke: new ol.style.Stroke({
									color: '#fff'
								}),
								fill: new ol.style.Fill({
									color: 'red'
								})
							})
						}));

						if (capa) {
							map.removeLayer(capa);
						}


						capa = new ol.layer.Vector({
							source: new ol.source.Vector({
								features: [marcador] // A la capa le ponemos los marcadores
							}),
						});
						// Y agregamos la capa al mapa
						map.addLayer(capa);
					}

				})
				.fail(function() {
					alertify.error("Ha ocurrido un error al cargar las calles. Por favor, intente nuevamente.");
				});
		}
		else if (!codigo){
			alertify.error("La Calle no existe.");
		}
	}
	else{
		alertify.error("Debe ingresar Calle y Nro. de Puerta");
	}
}

function buscarEsquina(context){
	let that = context;
	let map = that._map;
	let nomCalle = document.getElementById("calles").value.trim();
	let esquina = document.getElementById("esquinas").value.trim();
	
	if(nomCalle !== "" && esquina !== ""){
		let codigo = null;
		let codigo2 = null;
		if(document.querySelector("#likecalles option[value='"+nomCalle+"']")){
			codigo = document.querySelector("#likecalles option[value='"+nomCalle+"']").dataset.value;
		}

		if(document.querySelector("#likeesquinas option[value='"+esquina+"']")){
			codigo2 = document.querySelector("#likeesquinas option[value='"+esquina+"']").dataset.value;
		}

		if (codigo && codigo2){
			$.get(WCMapubicacionesquinaURL + "?codigoCalle1=" + codigo + "&codigoCalle2=" + codigo2)
				.done(function(response) {

					if (response ) {
						let coor = response.geoJSON.coordinates;

						that.setPositionByCenter(coor, 20);

						let marcador = new ol.Feature({
							geometry: new ol.geom.Point(
									coor// En dónde se va a ubicar
							),
						});

						// Agregamos icono
						marcador.setStyle(new ol.style.Style({
							image: new ol.style.Circle({
								radius: 12,
								stroke: new ol.style.Stroke({
									color: '#fff'
								}),
								fill: new ol.style.Fill({
									color: 'red'
								})
							})
						}));

						if (capa) {
							map.removeLayer(capa);
						}


						capa = new ol.layer.Vector({
							source: new ol.source.Vector({
								features: [marcador] // A la capa le ponemos los marcadores
							}),
						});
						// Y agregamos la capa al mapa
						map.addLayer(capa);
					}

				})
				.fail(function() {
					alertify.error("Ha ocurrido un error al ubicar las coordenadas de la esquina. Por favor, intente nuevamente.");
				});
		}
		else if (!codigo){
			alertify.error("La Calle no existe.");
		}
		else if (!codigo2){
			alertify.error("La Esquina no cruza a la Calle seleccionada.");
		}
	}
	else{
		alertify.error("Debe ingresar Calle y Esquina.");
	}
}

function buscarPadron(context){
	let that = context;
	let map = that._map;
	let padron = $('#padron')[0].value.trim();

	if (padron && padron!==""){
		$.get(WCMapubicacionpadronpoligonoURL + "?padron=" + padron)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					var polygon = new ol.geom.Polygon(coor);

					let marcador = new ol.Feature(polygon);

					let _myStroke = new ol.style.Stroke({
						color : 'red',
						width : 3
					});

					let _myFill = new ol.style.Fill({
						color: '#f58181'
					});

					let myStyle = new ol.style.Style({
						stroke : _myStroke,
						fill : _myFill
					});

					// Agregamos icono
					marcador.setStyle(myStyle);

					if (capa) {
						map.removeLayer(capa);
					}

					capa = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: [marcador] // A la capa le ponemos los marcadores
						}),
					});
					// Y agregamos la capa al mapa
					map.addLayer(capa);

				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar las calles. Por favor, intente nuevamente.");
			});


		$.get(WCMapubicacionpadronURL + "?padron=" + padron)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					that.setPositionByCenter(coor, 20);
				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar el centro del padron. Por favor, intente nuevamente.");
			});
	}
	else{
		alertify.error("Debe ingresar Padron.");
	}
}

function cargarCcz(){
	
    let select = document.getElementById('ccz');
    select.innerHTML="";
	comboFindCCZ = "";

	$.get(WCMapcczURL)
	.done(function(response) {
					
		if (response ) {
			comboFindCCZ = response;
			
			comboFindCCZ.forEach(function(item) {
		        // Creando un option por cada ccz.
		        var option = document.createElement('option');
		        option.value = item.numero;
		        option.innerHTML = item.numero;
		        select.appendChild(option);
			});
		}
	})
	.fail(function() {
		alertify.error("Ha ocurrido un error al cargar los ccz. Por favor, intente nuevamente.");
	}); 
}

function buscarCCZ(context){
	let that = context;
	let map = that._map;
	let ccz = $('#ccz')[0].value.trim();

	if (ccz && ccz!==""){
		
		$.get(WCMapubicacioncczpoligonoURL + "?ccz=" + ccz)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					var polygon = new ol.geom.Polygon(coor);

					let marcador = new ol.Feature(polygon);

					let _myStroke = new ol.style.Stroke({
						color : 'red',
						width : 3
					});

					let _myFill = new ol.style.Fill({
						color: 'transparent'
					});

					let myStyle = new ol.style.Style({
						stroke : _myStroke,
						fill : _myFill
					});

					// Agregamos icono
					marcador.setStyle(myStyle);

					if (capa) {
						map.removeLayer(capa);
					}


					capa = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: [marcador] // A la capa le ponemos los marcadores
						}),
					});
					// Y agregamos la capa al mapa
					map.addLayer(capa);

				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar CCZ. Por favor, intente nuevamente.");
			});
		

		$.get(WCMapubicacioncczURL + "?ccz=" + ccz)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					that.setPositionByCenter(coor, 15);
				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar el centro del CCZ. Por favor, intente nuevamente.");
			});
	}
	else{
		alertify.error("Debe ingresar CCZ.");
	}
}

function buscarBarrio(context){
	let that = context;
	let map = that._map;
	let barrio = $('#barrios')[0].value.trim();

	if (barrio && barrio!==""){
		
		if(document.querySelector("#likebarrios option[value='"+barrio+"']")){
			codigo = document.querySelector("#likebarrios option[value='"+barrio+"']").dataset.value;
		}
		
		$.get(WCMapubicacionbarriopoligonoURL + "?codBarrio=" + codigo)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					var polygon = new ol.geom.Polygon(coor);

					let marcador = new ol.Feature(polygon);

					let _myStroke = new ol.style.Stroke({
						color : 'red',
						width : 3
					});

					let _myFill = new ol.style.Fill({
						color: 'transparent'
					});

					let myStyle = new ol.style.Style({
						stroke : _myStroke,
						fill : _myFill
					});

					// Agregamos icono
					marcador.setStyle(myStyle);

					if (capa) {
						map.removeLayer(capa);
					}

					capa = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: [marcador] // A la capa le ponemos los marcadores
						}),
					});
					// Y agregamos la capa al mapa
					map.addLayer(capa);

				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar Barrio. Por favor, intente nuevamente.");
			});
		

		$.get(WCMapubicacionbarrioURL + "?codBarrio=" + codigo)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					that.setPositionByCenter(coor, 15);
				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar el centro del Barrio. Por favor, intente nuevamente.");
			});
	}
	else{
		alertify.error("Debe ingresar Barrio.");
	}
}

function cargarMunicipios(){
	
    let select = document.getElementById('municipios');
    select.innerHTML="";
	comboFindMunicipios = "";

	$.get(WCMapmunicipiosURL)
	.done(function(response) {
					
		if (response ) {
			comboFindMunicipios = response;
			
			comboFindMunicipios.forEach(function(item) {
		        // Creando un option por cada municipio.
		        var option = document.createElement('option');
		        option.value = item.nombre;
		        option.innerHTML = item.nombre;
		        select.appendChild(option);
			});
		}
	})
	.fail(function() {
		alertify.error("Ha ocurrido un error al cargar los municipios. Por favor, intente nuevamente.");
	}); 
}

function buscarMunicipio(context){
	let that = context;
	let map = that._map;
	let municipio = $('#municipios')[0].value;

	if (municipio && municipio!==""){
		
		$.get(WCMapubicacionmunicipiopoligonoURL + "?municipio=" + municipio)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					var polygon = new ol.geom.Polygon(coor);

					let marcador = new ol.Feature(polygon);

					let _myStroke = new ol.style.Stroke({
						color : 'red',
						width : 3
					});

					let _myFill = new ol.style.Fill({
						color: 'transparent'
					});

					let myStyle = new ol.style.Style({
						stroke : _myStroke,
						fill : _myFill
					});

					// Agregamos icono
					marcador.setStyle(myStyle);

					if (capa) {
						map.removeLayer(capa);
					}


					capa = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: [marcador] // A la capa le ponemos los marcadores
						}),
					});
					// Y agregamos la capa al mapa
					map.addLayer(capa);

				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar Municipio. Por favor, intente nuevamente.");
			});
		

		$.get(WCMapubicacionmunicipioURL + "?municipio=" + municipio)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					that.setPositionByCenter(coor, 15);
				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar el centro del Municipio. Por favor, intente nuevamente.");
			});
	}
	else{
		alertify.error("Debe ingresar Municipio.");
	}
}

function buscarLugarInteres(context){
	let that = context;
	let map = that._map;
	let lugar = $("#lugaresInteres")[0].value;
	let lugNom = "";
	let tieneGeometria = false;
	let marcaPunto = false;
	let urlGeometria="";
	let urlPunto="";
	let nombreLugar = $("#nombreLugar")[0].value.trim();
	
	if (lugar == 0){
		lugNom = "lugaresDeInteres";
	}
	else if (lugar == 1){
		lugNom = "cultura";
		marcaPunto = true;
		urlPunto = WCMapubicacionCulturaURL;
	}
	else if (lugar == 2){
		lugNom = "deporte";
		marcaPunto = true;
		urlPunto = WCMapubicacionDeporteURL;
	}
	else if (lugar == 3){
		lugNom = "educacion";
		marcaPunto = true;
		urlPunto = WCMapubicacionEducacionURL;
	}
	else if (lugar == 4){
		lugNom = "nombresDeEspacioLibre";
		tieneGeometria = true;
		urlGeometria = WCMapubicacionEspacioLibrepoligonoURL;
		urlPunto = WCMapubicacionEspacioLibreURL;
	}
	else if (lugar == 5){
		lugNom = "monumentos";
		marcaPunto = true;
		urlPunto = WCMapubicacionMonumentosURL;
	}
	else if (lugar == 6){
		lugNom = "patrimonio";
		tieneGeometria = true;
		urlGeometria = WCMapubicacionPatrimoniopoligonoURL;
		urlPunto = WCMapubicacionPatrimonioURL;
	}
	else if (lugar == 7){
		lugNom = "playas";
		tieneGeometria = true;
		urlGeometria = WCMapubicacionPlayapoligonoURL;
		urlPunto = WCMapubicacionPlayaURL;
	}
	else if (lugar == 8){
		lugNom = "salud";
		marcaPunto = true;
		urlPunto = WCMapubicacionSaludURL;
	}

	if (nombreLugar && nombreLugar!==""){
		
		if(document.querySelector("#likelugaresInteres option[value='"+nombreLugar+"']")){
			
			//SI VIENE EN 0 ES PORQUE EN EL COMBO ESTABA EN TODOS, POR LO CUAL TENGO QUE VER A QUE TIPO PERTENECE
			//EN ESTOS CASOS YO LO GUARDO DISTINTO AL dataset.value Y VOY A TENER QUE HACER SPLIT
			if(lugar == 0){
				//item.codigo + "#" + item.descSubtipo;
				let dataSetValue = document.querySelector("#likelugaresInteres option[value='"+nombreLugar+"']").dataset.value.split("#");
				codigo = dataSetValue[0];
				let descSubtipo = dataSetValue[1].trim();
				if (descSubtipo === "CULTURA"){
						lugNom = "cultura";
						marcaPunto = true;
						urlPunto = WCMapubicacionCulturaURL;
				}
				else if (descSubtipo === "DEPORTE"){
					lugNom = "deporte";
					marcaPunto = true;
					urlPunto = WCMapubicacionDeporteURL;
				}
				else if (descSubtipo === "EDUCACION"){
					lugNom = "educacion";
					marcaPunto = true;
					urlPunto = WCMapubicacionEducacionURL;
				}
				else if (descSubtipo === "ESPACIO LIBRE"){
					lugNom = "nombresDeEspacioLibre";
					tieneGeometria = true;
					urlGeometria = WCMapubicacionEspacioLibrepoligonoURL;
					urlPunto = WCMapubicacionEspacioLibreURL;
				}
				else if (descSubtipo === "MONUMENTO"){
					lugNom = "monumentos";
					marcaPunto = true;
					urlPunto = WCMapubicacionMonumentosURL;
				}
				else if (descSubtipo === "PATRIMONIO"){
					lugNom = "patrimonio";
					tieneGeometria = true;
					urlGeometria = WCMapubicacionPatrimoniopoligonoURL;
					urlPunto = WCMapubicacionPatrimonioURL;
				}
				else if (descSubtipo === "PLAYA"){
					lugNom = "playas";
					tieneGeometria = true;
					urlGeometria = WCMapubicacionPlayapoligonoURL;
					urlPunto = WCMapubicacionPlayaURL;
				}
				else if (descSubtipo === "SALUD"){
					lugNom = "salud";
					marcaPunto = true;
					urlPunto = WCMapubicacionSaludURL;
				}
			}
			else{
				codigo = document.querySelector("#likelugaresInteres option[value='"+nombreLugar+"']").dataset.value;
			}
		}
		
		if(tieneGeometria){
			$.get(urlGeometria + "?codigo=" + codigo)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;

					var polygon = new ol.geom.MultiPolygon(coor);

					let marcador = new ol.Feature(polygon);

					let _myStroke = new ol.style.Stroke({
						color : 'red',
						width : 3
					});

					let _myFill = new ol.style.Fill({
						color: 'transparent'
					});

					let myStyle = new ol.style.Style({
						stroke : _myStroke,
						fill : _myFill
					});

					// Agregamos icono
					marcador.setStyle(myStyle);

					if (capa) {
						map.removeLayer(capa);
					}

					capa = new ol.layer.Vector({
						source: new ol.source.Vector({
							features: [marcador] // A la capa le ponemos los marcadores
						}),
					});
					// Y agregamos la capa al mapa
					map.addLayer(capa);
				}
			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar el lugar De Interes " + lugNom + ". Por favor, intente nuevamente.");
			});
		}
		
		$.get(urlPunto + "?codigo=" + codigo)
			.done(function(response) {

				if (response ) {
					let coor = response.geoJSON.coordinates;
					
					that.setPositionByCenter(coor, 15);
					
					if(marcaPunto){
						let marcador = new ol.Feature({
							geometry: new ol.geom.Point(
									coor // En dónde se va a ubicar
							),
						});

						// Agregamos icono
						marcador.setStyle(new ol.style.Style({
							image: new ol.style.Circle({
								radius: 12,
								stroke: new ol.style.Stroke({
									color: '#fff'
								}),
								fill: new ol.style.Fill({
									color: 'red'
								})
							})
						}));

						if (capa) {
							map.removeLayer(capa);
						}

						capa = new ol.layer.Vector({
							source: new ol.source.Vector({
								features: [marcador] // A la capa le ponemos los marcadores
							}),
						});
						// Y agregamos la capa al mapa
						map.addLayer(capa);
					}					
				}

			})
			.fail(function() {
				alertify.error("Ha ocurrido un error al cargar el centro del lugar De Interes " + lugNom + ". Por favor, intente nuevamente.");
			});
	}
	else{
		alertify.error("Debe ingresar ugar De Interes " + lugNom);
	}
}

function loader(){
	$.blockUI({
		message: '<div><img style="width: 100%;" src="external/img/loading.gif" /></div>' ,
		css: {
			border: 'none',
			padding: '15px',
			backgroundColor: 'transparent',
			'-webkit-border-radius': '10px',
			'-moz-border-radius': '10px',
			opacity: 1,
			top:  ($(window).height() - 150) /2 + 'px',
			left: ($(window).width() - 150) /2 + 'px',
			width: '150px'
		},
		baseZ: 15000
	});
}

function notEnter(){
	$(document).ready(function() {
	    $("input").keypress(function(e) {
	        if (e.which == 13) {
	            return false;
	        }
	    });
	});
}

function logout(){
	window.location.href = window.location.href + "?GLO=true";
}

function closeLoader(){
	$.unblockUI()
} 

$(document).ajaxStart(function(a) {
	loader();
});

$(document).ajaxStop(function() {
	closeLoader();
});


