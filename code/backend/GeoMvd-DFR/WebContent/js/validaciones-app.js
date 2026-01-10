let WCMapValidationURL = apiURL + '/validateDFR';

const validacionesMap = [
	{
        layer: "Zonas Recorrido",
        atributo: "FECHA_HASTA",
        isValid: function(val, original_value, extraData, context, modoInterno){
            let retorno = true;
            if(original_value!==''){
            	retorno = false;
            }                    	
            return retorno;
            },
        mensaje: "No se puede editar una zona que es histórica",
        mode: 'EDIT'
    },
    {
        layer: "Zonas Recorrido",
        atributo: "the_geom",
        isValid: function (val, original_value, extraData, context) {
            let isValid = true;

            let codigoRecorrido =  (context.featuresInUse[0].values_['COD_RECORRIDO'] ? context.featuresInUse[0].values_['COD_RECORRIDO'] : '');
            
            $.ajax({
                type: "GET",
                async: false,
                url: WCMapValidationURL + "/chequeoPosicionesFueraZona?codigoRecorrido="+codigoRecorrido+"&geom="+val.replace('Z',''),
                headers: {
                    "Accept": "application/json"
                },
                success: function (data) {
                	console.log(data);
                    if (data)
                    	isValid=false;
                },
                error: function (error) {
                	console.error("Error con chequeo Zonas Recorrido");
                    console.error(error);
                }
            });
            
            console.log(isValid);
            return isValid;
        },
        mensaje: "Error: Existen posiciones de a la zona creada que quedaron fuera de los límites de la misma",
        mode: 'ADD'
    },
    {
        layer: "Zonas Recorrido",
        atributo: "the_geom",
        isValid: function (val, original_value, extraData, context) {
            let isValid = true;

            let codigoRecorrido =  (context.selectedFeat.array_[0].values_.COD_RECORRIDO ? context.selectedFeat.array_[0].values_.COD_RECORRIDO : '');
            
            $.ajax({
                type: "GET",
                async: false,
                url: WCMapValidationURL + "/chequeoPosicionesFueraZona?codigoRecorrido="+codigoRecorrido+"&geom="+val.replace('Z',''),
                headers: {
                    "Accept": "application/json"
                },
                success: function (data) {
                	console.log(data);
                    if (data)
                    	isValid=false;
                },
                error: function (error) {
                    console.error("Error con chequeo Zonas Recorrido");
                    console.error(error);
                }
            });
            
            console.log(isValid);
            return isValid;
        },
        mensaje: "Error: Existen posiciones de a la zona modificada que quedaron fuera de los límites de la misma",
        mode: 'EDIT'
    },
    {
        layer: "Posiciones Recorrido",
        atributo: "the_geom",
        isValid: function (val, original_value, extraData, context) {
            let isValid = true;
            $.ajax({
                type: "GET",
                async: false,
                url: WCMapValidationURL + "/chequeoPosicionesRegionCAP?geom="+val.replace('Z',''),
                headers: {
                    "Accept": "application/json"
                },
                success: function (data) {
                	console.log(data);
                    if (data)
                    	isValid=false;
                },
                error: function (error) {
                	console.error("Error con chequeo Region Posiciones Recorrido");
                    console.error(error);
                }
            });
            
            console.log(isValid);
            return isValid;
        },
        mensaje: "Error: se está intentando colocar una posición dentro de la zona de CAP",
        mode: 'ADD'
    },
    {
        layer: "Posiciones Recorrido",
        atributo: "the_geom",
        isValid: function (val, original_value, extraData, context) {
            let isValid = true;
            $.ajax({
                type: "GET",
                async: false,
                url: WCMapValidationURL + "/chequeoPosicionesRegionCAP?geom="+val.replace('Z',''),
                headers: {
                    "Accept": "application/json"
                },
                success: function (data) {
                	console.log(data);
                    if (data)
                    	isValid=false;
                },
                error: function (error) {
                	console.error("Error con chequeo Region Posiciones Recorrido");
                    console.error(error);
                }
            });
            
            console.log(isValid);
            return isValid;
        },
        mensaje: "Error: se está intentando colocar una posición dentro de la zona de CAP",
        mode: 'EDIT'
    },
    {
        layer: "Posiciones Recorrido",
        atributo: "FECHA_HASTA",
        isValid: function(val, original_value, extraData, context, modoInterno){
            let retorno = true;
            if(original_value!==''){
            	retorno = false;
            }                    	
            return retorno;
            },
        mensaje: "No se puede editar una Posicion que es histórica",
        mode: 'EDIT'
    },
    {
        layer: "Contenedores CAP",
        atributo: "cant_humedos",
        isValid: function(val, original_value, extraData, context, modoInterno){
            let retorno = true;
            if(val< 1){
            	retorno = false;
            }                    	
            return retorno;
            },
        mensaje: "Debe existir por lo menos un contenedor con capacidad 250 u 800 lts.",
        mode: 'ADD'
    },
    {
        layer: "Contenedores CAP",
        atributo: "cant_humedos",
        isValid: function(val, original_value, extraData, context, modoInterno){
            let retorno = true;
            if(val< 1){
            	retorno = false;
            }                    	
            return retorno;
            },
        mensaje: "Debe existir por lo menos un contenedor con capacidad 250 u 800 lts.",
        mode: 'EDIT'
    },
    {
        layer: "Zonas Recorrido - Planificado",
        atributo: "the_geom",
        isValid: function (val, original_value, extraData, context) {
            let isValid = true;
            let codigoRecorrido = (context.selectedFeat.array_[0].values_.COD_RECORRIDO ? context.selectedFeat.array_[0].values_.COD_RECORRIDO : '');
            $.ajax({
                type: "GET",
                async: false,
                url: WCMapValidationURL + "/chequeoPosicionesFueraZonaPlanificado?codigoRecorrido=" + codigoRecorrido + "&geom=" + val.replace('Z', ''),
                headers: {
                    "Accept": "application/json"
                },
                success: function (data) {
                    console.log(data);
                    if (data)
                        isValid = false;
                },
                error: function (error) {
                    console.error("Error al obtener variantes de un destino");
                    console.error(error);
                }
            });

            console.log(isValid);
            return isValid;
        },
        mensaje: "Error: Existen posiciones de a la zona modificada que quedaron fuera de los límites de la misma",
        mode: 'EDIT'
    }
]



var validateCustom = async function (layerId, atributo, valor, original_value, context, extraData) {
    let isValid = true;
    let modoInterno = (atributo.modoInterno ? atributo.modoInterno : "");
    let checkCoor = false;
    let mensaje = "";
    if (atributo.nombre_atributo == "the_geom") {
        validacionesMap.filter(v => (v.layer === layerId && atributo.nombre_atributo && v.atributo.toLowerCase() === atributo.nombre_atributo.toLowerCase() && (!v.mode || v.mode === context._mode))).map(v => {
            checkCoor = false;
            mensaje = v.mensaje;
            isValid = assertTrue(v.isValid(valor, original_value, extraData, context, modoInterno), v.mensaje) && isValid;
        })
        if (checkCoor) {
            var coord_corecta = await validarubic(valor);
            isValid = assertTrue(coord_corecta, mensaje) && isValid;
        }       
    }
    else {
        console.log('Validando campo:', layerId, atributo);
        validacionesMap.filter(v => (v.layer === layerId && atributo.nombre_atributo && v.atributo.toLowerCase() === atributo.nombre_atributo.toLowerCase() && (!v.mode || v.mode === context._mode))).map(v => {
            //           console.log('Validando campo:', layerId, atributo)
            isValid = assertTrue(v.isValid(valor, original_value, extraData, context, modoInterno), v.mensaje) && isValid;
        })
    }
    return isValid;
}

async function validarubic(point){
	var montevideo = new ol.source.TileWMS({
		  url: urlGeoserver + '/wms',
		  params: {'LAYERS': 'imm:mobile_depto_p', 'TILED': true},
		  serverType: 'geoserver',
		  crossOrigin: 'anonymous',
		});
	
	var coord = point.slice(6, -1);
	
	coord = coord.split(" ");
	
	if (coord.length > 2){
		coord = point.slice(8, point.length -2);
		coord = coord.split(" ");
		if (coord.length > 2){
			coord.pop();
		}
		
	}
	
	coord[0] = parseFloat(coord[0])
	coord[1] = parseFloat(coord[1])
	
	var url = montevideo.getGetFeatureInfoUrl(
			coord,
			10,
		    'EPSG:32721',
		    {'INFO_FORMAT': 'application/json'}
		  );
	
	var json = [];
	
	var coord_corecta;
	
	await getFeatureInfo(url).then(function (getFeatureInfoData) {
		if (getFeatureInfoData) {
			json = getFeatureInfoData;
			if (isJsonParsable(json)) {
				json = JSON.parse(getFeatureInfoData.toString());
			}
			
			if (json.features.length == 0){
				coord_corecta = false;
			}
			else{
				coord_corecta = true;
			}		

		}
	}).catch((error) => {
		console.error("Error en getFeatureInfo | error:");
		console.error(error);
	});
	
	return coord_corecta;
	
}