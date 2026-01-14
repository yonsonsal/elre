from ..servicios.serviciosCapas import ServiciosCapas

class Codigueras:

	@staticmethod
	def obtenerDatosCodiguerasWorkspace(nombreUsuario, aplicacion):
		responseCodiguera = ServiciosCapas.obtenerCodiguerasData(nombreUsuario, aplicacion)
		return responseCodiguera

	def __procesarCodiguera(self, nombreUsuario, nombreCodiguera, pkNombre, valueNombre, codigueras):
		if codigueras is not None:
			diccionarioCodiguera = dict()
			for datos in codigueras:
				if datos["Codiguera"] == nombreCodiguera:
					tuplas = datos["Data"]
					for registro in tuplas:
						if valueNombre in registro:
							diccionarioCodiguera[registro[valueNombre]]=registro[pkNombre]
			return diccionarioCodiguera
		else:
			return None

	@staticmethod
	def procesarDatosCapaCodiguera(nombreUsuario, nombreCapa, aplicacion, codigueras):
		atributosCapa = ServiciosCapas.obtenerAtributosCapa(nombreUsuario, nombreCapa, aplicacion)
		if atributosCapa is not None:
			comboValue = atributosCapa["comboValue"]
			comboDesciption = atributosCapa["comboLabel"]
			procCod = Codigueras()
			valoresCodiguera = procCod.__procesarCodiguera(nombreUsuario, nombreCapa, comboValue, comboDesciption, codigueras)
			return valoresCodiguera
		else:
			return None

	@staticmethod
	def obtenerDatosCapaCodigueraRelacionValores(nombreUsuario, nombreCapa, aplicacion):
		atributosCapa = ServiciosCapas.obtenerAtributosCapa(nombreUsuario, nombreCapa, aplicacion)
		comboValue = atributosCapa["comboValue"]
		comboDesciption = atributosCapa["comboLabel"]
		return comboValue, comboDesciption
