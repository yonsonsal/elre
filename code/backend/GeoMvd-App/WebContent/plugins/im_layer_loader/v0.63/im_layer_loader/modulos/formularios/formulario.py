from .atributosFormulario import AtributosFormularios
from .codigueras import Codigueras
from qgis.core import *
from qgis.PyQt import QtWidgets
from ..utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class Formulario :

	def __configurarAtributo(self, nombreUsuario, nombreCapa, atributosCapa, datosAtributo, aplicacion, codigueras):
		from ...IM_layer_loader import IMLayerLoader

		tipo = ""
		mostrar = False
		soloLectura = False
		requerido = True
		nombreAtributo = ""
		presentation = ""
		valorCalculado = ""
		persistible = False
		label = ""

		if "tipo" in datosAtributo:
		    tipo = datosAtributo["tipo"]
		if "nombre_bd" in datosAtributo:
		    nombreAtributo = datosAtributo["nombre_bd"]
		if "label" in datosAtributo:
			label = datosAtributo["label"]
		if "show" in datosAtributo:
		    mostrar = datosAtributo["show"]
		if "read_only" in datosAtributo:
		    soloLectura = datosAtributo["read_only"]	
		if "NILLABLE" in datosAtributo:
		    requerido = not datosAtributo["NILLABLE"]
		if "presentation" in datosAtributo:
		    presentation = datosAtributo["presentation"]
		if "valorCalculado" in datosAtributo:
			valorCalculado = datosAtributo["valorCalculado"]
		if "persistible" in datosAtributo:
			persistible = datosAtributo["persistible"]

		if nombreAtributo != "":
			if mostrar:
				#Reseteamos los campos predeterminados porque se guardan en algun cache y puede generar problemas
				AtributosFormularios.resetCampoPredeterminado(nombreCapa, nombreAtributo)

				if tipo == "imm.gis.core.feature.ExternalAttribute":
					capaCodiguera = datosAtributo["capa_referenciada"]
					valoresCodiguera = Codigueras.procesarDatosCapaCodiguera(nombreUsuario, capaCodiguera, aplicacion, codigueras)
					if valoresCodiguera is not None:
						AtributosFormularios.cargaCodigueraAtributo(nombreCapa, nombreAtributo, valoresCodiguera)
					else:
						IMLayerLoader.erroresEnCodigueras.append((nombreUsuario, nombreCapa, nombreAtributo, capaCodiguera, codigueras, aplicacion))
						logger.error(f'Error en carga/conf de codiguera. nombreCapa: {nombreCapa}. capaCodiguera: {capaCodiguera}. nombreAtributo:{nombreAtributo}')
						print(f'Error en carga/conf de codiguera. nombreCapa: {nombreCapa}. capaCodiguera: {capaCodiguera}. nombreAtributo:{nombreAtributo}')
						QtWidgets.QMessageBox.information(None, "Configuración de capas",
													  f'Problema asociado a la configuración de la capa {nombreCapa} y los datos de {capaCodiguera}', QtWidgets.QMessageBox.Ok)
				elif tipo == "java.util.Date":
					AtributosFormularios.cargaDateAtributo(nombreCapa, nombreAtributo, requerido)
				elif tipo == "java.lang.String" and presentation == "TEXT_AREA":
					AtributosFormularios.cargaTextAreaAtributo(nombreCapa, nombreAtributo)
				elif tipo == "java.lang.Boolean":
					AtributosFormularios.cargaCheckBoxAtributo(nombreCapa, nombreAtributo)
				elif tipo == "imm.gis.core.feature.FeatureReferenceAttribute":
					AtributosFormularios.cargaTextEditAtributo(nombreCapa, nombreAtributo)
					capaReferenciada = datosAtributo["capa_referenciada"]
					#le agrego a la capa "nombreCapa" la accion de ver el formulario
					#de un elemento de la capa "capaReferenciada" por el atributo nombreAtributo
					AtributosFormularios.cargarAccionParaVerInfoRelacionada(nombreCapa, capaReferenciada, nombreAtributo, label, "gid")
					#Invocamos de forma similar a lo anterior
					#para disparar la accion que relaciona un elemento de una capa ("capaReferenciada")
					#a la capa ("nombreCapa") en la que estamos parados
					AtributosFormularios.cargarAccionParaRelacionarElemento(nombreCapa, capaReferenciada, nombreAtributo, label, "gid", aplicacion)
				elif tipo == "imm.gis.core.feature.ExternalAttributeRelacionValor":
					capaReferenciada = datosAtributo["capa_referenciada"]
					valoresCodiguera = Codigueras.obtenerDatosCapaCodigueraRelacionValores(nombreUsuario, capaReferenciada, aplicacion)
					cod = valoresCodiguera[0]
					value = valoresCodiguera[1]
					AtributosFormularios.cargaCodigueraAtributoCapa(nombreCapa, aplicacion+":"+capaReferenciada, nombreAtributo, cod, value, '', '', not requerido)

				if soloLectura:
					AtributosFormularios.atributoSoloLectura(nombreCapa, nombreAtributo)
				if tipo != "java.util.Date" and requerido:
					AtributosFormularios.atributoRequerido(nombreCapa, nombreAtributo)
				if valorCalculado != "" and persistible:
					AtributosFormularios.configuraCampoDefault(nombreCapa, atributosCapa, nombreAtributo, persistible, nombreUsuario, aplicacion, valorCalculado)
				if label != "":
					AtributosFormularios.configuraLabel(nombreCapa, nombreAtributo, label)
			else:
				AtributosFormularios.ocultarAtributo(nombreCapa, nombreAtributo)

	@staticmethod
	def configurarFormulario(nombreUsuario, nombreCapa, atributosCapa, atributos, aplicacion, codigueras):
		form = Formulario()
		for clave, valor in atributos.items():
			form.__configurarAtributo(nombreUsuario, nombreCapa, atributosCapa, valor, aplicacion, codigueras)
		AtributosFormularios.cargarCamposCalculados(nombreUsuario, nombreCapa, atributosCapa, atributos, aplicacion)

	@staticmethod
	def cargarCapaChild(capaPadre, campoRefPadre, capaHija, campoRefHija):
        #SI EXISTIA LA RELACION LA BORRO PARA LUEGO VOLVER A CREARLA	
		Formulario.eliminoRelacion(capaPadre+"_"+capaHija)
		Formulario.agregoRelacion(capaPadre, campoRefPadre, capaHija, campoRefHija)


	# Elimina la relación Maestro Detalle
	@staticmethod
	def eliminoRelacion(idRelacion):
		QgsProject.instance().relationManager().removeRelation(idRelacion)

	#Agrega la relación Maestro Detalle
	@staticmethod
	def agregoRelacion(nombre_capa_maestro, campo_clave_maestro, nombre_capa_detalle, campo_clave_detalle, nombre_relacion=None):
		# Configura los nombres y campos de las capas de maestro y detalle
		id_relacion = nombre_capa_maestro+"_"+nombre_capa_detalle # Nombre de la relación
		if nombre_relacion is None :
			nombre_relacion = nombre_capa_detalle # Nombre de la relación

		# Obtiene las capas por nombre desde el proyecto
		capa_maestro = QgsProject.instance().mapLayersByName(nombre_capa_maestro)[0]
		capa_detalle = QgsProject.instance().mapLayersByName(nombre_capa_detalle)[0]

		# Crea la relación
		relacion = QgsRelation()
		relacion.setReferencedLayer(capa_maestro.id())
		relacion.setReferencingLayer(capa_detalle.id())
		relacion.addFieldPair(campo_clave_detalle,campo_clave_maestro)
		relacion.setId(id_relacion)
		relacion.setName(nombre_relacion)
		QgsProject.instance().relationManager().addRelation( relacion )
		
