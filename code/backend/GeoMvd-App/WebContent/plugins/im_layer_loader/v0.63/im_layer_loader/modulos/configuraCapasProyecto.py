from qgis.core import QgsMapLayerType
from qgis.core import QgsProject

from .formularios.accionesFormulario import AccionesFormulario
from .formularios.codigueras import Codigueras
from .servicios.serviciosCapas import ServiciosCapas
from .formularios.formulario import Formulario
from .utilidades.funcionesExportacion import FuncionesExportacion
from .utilidades.funcionesGenericas import FuncionesGenericas
from .utilidades.funcionesMapa import FuncionesMapa
from .utilidades.logger import SafePluginLogger

from datetime import datetime, timedelta
from collections import defaultdict


logger = SafePluginLogger.init_logger()

def agrupar_capas_worksp(capas_map_layer):
	grup_wrkspaces = defaultdict(list)
	for capa in capas_map_layer:
		prefijo = capa.name().split(':')[0]
		grup_wrkspaces[prefijo].append(capa)
	return grup_wrkspaces

class ConfiguraCapasProyecto :

	def __procesarDatosCapa(self, nombreUsuario, nombreCapa, workspace, codigueras):
		retorno = ""
		atributosCapa = ServiciosCapas.obtenerAtributosCapa(nombreUsuario, nombreCapa, workspace)
		if atributosCapa is not None:
			atributosFormulario = atributosCapa["atributos"]
			Formulario.configurarFormulario(nombreUsuario, nombreCapa, atributosCapa, atributosFormulario, workspace, codigueras)
			#PARA DETECTAR SI LA CAPA ES EDITABLE O NO VEMOS EL ATRIBUTO EDITABLE DEL .APP
			#SI VIENE QUE ES FALSE LA MARCAMOS COMO SOLE LECTURA, SINO QUEDA POR DEFECTO EDITABLE (PARA WFS)
			editable = atributosCapa["editable"]
			if not editable:
				FuncionesMapa.setCapaSoloLectura(nombreCapa, True)
			
			if "child" in atributosCapa:			
				atributosChild = atributosCapa["child"]
				#Formulario.cargarCapaChild('gep:e_ep_papeleras','gid','gep:e_ep_inspeccion_papeleras','gid_papelera')
				print(workspace+":"+nombreCapa)
				print(atributosCapa["pk"])
				print(workspace+":"+atributosChild["layer"])
				print(atributosChild["parent_id_attribute"])
				Formulario.cargarCapaChild(nombreCapa,atributosCapa["pk"],workspace+":"+atributosChild["layer"],atributosChild["parent_id_attribute"])				
			
			retorno = ""
		else:
			retorno = "No Existe Metadata De La Capa: " + nombreCapa
		
		return retorno

	@staticmethod
	def configuraCapasProyecto():
		retorno = ""
		if len(QgsProject.instance().mapLayers().values()) > 0:

			wrkspcs = agrupar_capas_worksp(QgsProject.instance().mapLayers().values())

			for workspace, layers in wrkspcs.items():

				flag_una_vez_x_workspace = True
				codigueras = None

				for layer in layers:

					#for layer in QgsProject.instance().mapLayers().values():
					if layer.type() == QgsMapLayerType.VectorLayer and len(layer.name().split(":")) > 1:
						#workspace = ""
						layername = ""
						if len(layer.name().split(":")) > 1:
							workspace, layername = FuncionesGenericas.getLayerName(layer.name())
							layer.setName(layername)

						nombreUsuario = FuncionesGenericas.getUserLayer(layer.source())
						nombreCapa = layer.name()

						conf = ConfiguraCapasProyecto()
						if flag_una_vez_x_workspace:
							codigueras = Codigueras.obtenerDatosCodiguerasWorkspace(nombreUsuario, workspace)
							flag_una_vez_x_workspace = False

						retornoString = conf.__procesarDatosCapa(nombreUsuario, nombreCapa, workspace, codigueras)

						if nombreCapa == "e_citim_proyectos":
							AccionesFormulario.cargarAccionSubirArchivoImnube(nombreCapa, workspace)

						if retornoString!="":
							retorno += "\n"+retornoString
						if workspace != "":
							layer.setName(workspace+":"+layername)

		else:
			retorno = "\nNo Existen Capas Agregadas"
		return retorno
