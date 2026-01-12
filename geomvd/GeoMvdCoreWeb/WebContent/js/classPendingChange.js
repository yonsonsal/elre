class PendingChange {
	constructor (type, layer, feature, status, showSuccessMessage, showErrorMessage) {
		/*
			Atributo: type
			Valores aceptados: CREATE | UPDATE | DELETE
			Uso: En base al valor de este atributo, se define qué método se encarga de procesar el cambio
		*/
		this.type = type;

		/*
			Atributo: typesToShow
			Valores aceptados: Un array de String. Strings con valores: CREATE | UPDATE | DELETE
			Uso: En base al valor de este atributo, se define qué método se encarga de procesar el cambio
		*/
		this.typesToShow = [type];

		/*
			Atributo: layer
			Valores aceptados: Un objeto del tipo ol.layer.Vector
			Uso: De los valores de la capa se obtendrá información necesaria para poder relaizar las operaciones correspondientes
		 */
		this.layer = layer;

		/*
			Atributo: feature
			Valores aceptados: Un objeto del tipo ol.Feature
			Uso: Este será el elemento con el que se quiere trabajar. De acá se sacará información necesaria para poder realizar las operaciones correspondientes
		 */
		this.feature = feature;

		/*
			Atributo: showSuccessMessage
			Valores aceptados: true | false
			Uso: Determina si se deben mostrar o no mensajes de éxito luego de procesar el cambio y en caso de que no arroje errores
		 */
		this.showSuccessMessage = showSuccessMessage;

		/*
			Atributo: showErrorMessage
			Valores aceptados: true | false
			Uso: Determina si se deben mostrar o no mensajes de error luego de procesar el cambio y en caso de que arroje errores
		 */
		this.showErrorMessage = showErrorMessage;

		/*
			Atributo: status
			Valores aceptados: PENDING | PROCESSED | WITH_ERROR
			Uso: Se utilizará para saber el estado del cambio, PENDING (aún no procesado), PROCESSED (procesado sin errores), WITH_ERROR (procesado con errores)
		 */
		this.status = status;

		/*
			Atributo: ignorable
			Valores aceptados: true | false
			Uso: Se utilizará para marcar algún cambio para ser ignorado a la hora de procesar los pendientes. Los cambios marcados como ignorables, se dejarán PROCESSED sin realizar ninguna otra acción.
		 */
		this.ignorable = false;
	}

	/*
		Atributo: children
		Valores aceptados: Un objeto del tipo PendingChangeChildrenData
		Uso: Se utiliza para agregar (en caso se que sea necesario) información para ABM de elementos en la capa hija.
	 */
	setChildren(value) {
		this.children = value;
	}

	hasTypeToShow(type) {
		let filteredTypes = this.typesToShow.filter(otts => otts === type);
		return filteredTypes && filteredTypes.length > 0;
	}
}

class PendingChangeChildrenData {
	constructor (tableName, fkName, pkName) {
		this.tabla = tableName;
		this.fknombre = fkName;
		this.pknombre = pkName;
		/*
		Atributo: hijos
		Valores aceptados: Un array de objetos del tipo PendingChangeChild
		Uso: Se utiliza para guardar aquellos elementos que deben ser agregados, modificados o eliminados de la capa hija.
	 */
		this.hijos = [];
	}
}

class PendingChangeChild {
	constructor (mode, pkValue, attributes) {
		this.metodo = mode;
		this.pkvalor = pkValue;
		if (attributes) {
			this.atributos = attributes;
		}
	}
}