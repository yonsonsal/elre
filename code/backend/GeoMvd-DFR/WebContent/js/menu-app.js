
function loadAppCustomMenu(buttons) {
	let tieneRol = tieneRolEdicionUtilidades();
    buttons.push({
        "type": "menu",
        "id": "btn-dfr-menu",
        "tooltipText": "Utilidades dfr",
        "faIcon": "fa-tools",
        "customClass": (tieneRol?"":"disabled"),
        "buttons": [
            {
                "type": "option",
                "id": (tieneRol?"btn-dfr-pasar-circuitos-planificados-vigentes":""),
                "tooltipText": "Pasar circuitos planificados a vigentes",
                "faIcon": "fa-copy",
                "customClass": (tieneRol?"":"disabled")
            }
        ]
    });
}

//CustomActions Handler Function
function loadAppCustomMenuActions(buttonId, context) {
    switch (buttonId) {
        case 'btn-dfr-pasar-circuitos-planificados-vigentes':
        	pasarPlanifVigentePopup(context);
            break;
        default:
        	alertify.error("No tiene permisos para esta utilidad");
        	break;
    }
}

function pasarPlanifVigentePopup(context) {
    let title = "Pasar Circuitos Planificados a Vigente";
    let content = "";
    let okAction = pasarAVigentes;
    let cancelAction = null;
    let okButtonText = "Pasar circuitos a vigente";
    let cancelButtonText = "Cancelar";
    let cancelButtonMustCloseModal = true;
    let okButtonMustCloseModal = false;
    let size = "full";
    let backdrop = "static";
    let keyboard = false;
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    getCircuitosPlanif().then((getCircuitosPlanifData) => {
        let circuito = getCircuitosPlanifData;
        
        content += `
        	<div class="text-center">
		        	<table class="table table-striped table-condensed" id="tableCircuitoPlanif">
					  <thead>
						  <tr>
						  	<th class="text-center">Marcar circuitos</th>
						    <th class="text-center">Circuito</th>
						    <th class="text-center">Fecha desde</th>
						  </tr>
					  </thead>
		`;
        if (circuito && circuito.length > 0) {
            circuito.forEach(oneCircuito => {
                content += `
                			<tbody>
	                            <tr>
	                            	<td><input type="checkbox"/></td>
								    <td>${oneCircuito.COD_RECORRIDO}</td>
								    <td><input class="form-control" type="date" value=${today} max=${today} /></td>							    
								</tr>
							</tbody>                            
                `;
            });
        }
        content += `
		            </table>		       
		</div>
		`;
					 
        setTimeout(() => {
            context.openPopup(title, content, okAction, cancelAction, okButtonText, cancelButtonText, cancelButtonMustCloseModal, okButtonMustCloseModal, size, backdrop, keyboard);
        }, 1000)
    }).catch((error) => {
        console.error("Error en getCirciutosPlanif | error:");
        console.error(error);
    });
}

function pasarAVigentes(context) {
	/*	
	$("#tableCircuitoPlanif :checked").each(function(){
		let circuito = $(this).find("td:first").val();
		let fechaDesde = $(this).find("input:first").val();
		
		console.log(circuito);
		console.log(convertirFechaAEnviar(fechaDesde));
	});
*/
}

function convertirFechaAEnviar(fecha) {
    if (fecha == '') return '';
    let fechaSeparada = fecha.split('-');
    let anio = fechaSeparada[0];
    let mes = fechaSeparada[1];
    let dia = fechaSeparada[2];
    return dia + '/' + mes + '/' + anio.substring(2);
}

function tieneRolEdicionUtilidades(){
	let retorno = "";
	
	$.ajax({
		type: "GET",
		async:false, //POR DEFAULT VIENE EN TRUE, LO PONGO EN FALSE PORQUE NECESITO QUE SE ESPERE ESTA RESPUESTA
        url: apiURL + "/layers/tieneRolEdicionUtilidades",
        headers: {
        	"Accept": "application/json"
    	},
    	success: function(data) {
    		retorno = data;
		},
		error: function(error) {
           console.error("[main.js] - tieneRolEdicionUtilidades - ajax - error | error:");
           console.error(error);
       }
    });
	
	return retorno;
}
