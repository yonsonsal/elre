async function validateAttributes(layerId, atributos, attsDefinition, customValidator, context) {
    let isValid = true;
   
    let N = atributos.length;
    for (var i = 0; i< N;i++){
    	isValid = await validateAttribute(layerId, atributos[i], getAttDefintion(attsDefinition, atributos[i].nombre_atributo), customValidator, context) && isValid;
    }
    
    return isValid;
}

async function validateChildAttributes(layerId, attributes, attributesDefinition, customValidator, context, extraData) {
    let isValid = true;
    for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        isValid = await validateChildAttribute(layerId, attribute, getAttDefintion(attributesDefinition, attribute.nombre_atributo), customValidator, context, extraData) && isValid;
    }
    return isValid;
}

function getAttDefintion( attsDefinition, nombre_bd) {
    for (var attName in attsDefinition) {
        if (attsDefinition[attName].nombre_bd === nombre_bd){
        	return attsDefinition[attName]
        }
        else{
        	if (attName === nombre_bd && attsDefinition[attName].NILLABLE=== true){
            	return attsDefinition[attName]
            }
        }
    }
    return {}
}

async function validateAttribute(layerId, attribute, attDefinition, customValidator, context) {
    let valor = attribute.valor;
    let isValid = true;
    // ACA VAN LAS validaciones genericas
    isValid = verifyNotNull(attDefinition, valor) && isValid;
    isValid = verifyLength(attDefinition, valor) && isValid;
    isValid = await customValidator(layerId, attribute, valor, attribute.originalValue, context) && isValid;
    return isValid;
}

async function validateChildAttribute(layerId, attribute, attDefinition, customValidator, context, extraData) {
    let valor = attribute.valor;
    let isValid = true;
    isValid = verifyNotNull(attDefinition, valor) && isValid;
    isValid = await customValidator(layerId, attribute, valor, attribute.originalValue, context, extraData) && isValid;
    return isValid;
}

function verifyNotNull(attDefinition, valor) {
    if (attDefinition.NILLABLE !== true) {    // Si no esta el atributo nillable se asume que no puede ser vacio
         console.log('Validando not null ', getNombreAtributoParaMostrar(attDefinition))
        return assertTrue(
            valor && valor.toString().trim().length>0,
            "El atributo " + getNombreAtributoParaMostrar(attDefinition) + " no puede ser nulo."
        );
    }
    return true;
}

function verifyLength(attDefinition, valor) {
    if (attDefinition.columns && attDefinition.columns.length>0 && parseInt(attDefinition.columns)>0) {
        // console.log('Validando length ', getNombreAtributoParaMostrar(attDefinition))
        return assertTrue(valor.trim().length <= parseInt(attDefinition.columns),
            "El atributo " + getNombreAtributoParaMostrar(attDefinition) + " puede tener como máximo "+ attDefinition.columns + " caracteres.");
    }
    return true;
}

function getNombreAtributoParaMostrar(attDefinition) {
    return attDefinition.label || attDefinition.nombreParaMostrar || attDefinition.nombre;
}

function assertTrue(value, message) {
    if (!value){
        console.log(message)
        alertify.notify( message, 'error', 0, function(){}); // Notification keeps visible until clicked
        return false;
    }
    return value;
}
