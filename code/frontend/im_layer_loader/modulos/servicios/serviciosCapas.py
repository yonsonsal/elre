import qgis
from qgis.core import *
from qgis.gui import *

from .serviciosRest import ServiciosRest
from ..utilidades.funcionesGenericas import FuncionesGenericas


class ServiciosCapas :

	@staticmethod
	def obtenerValorCalculado(tabla, nombreUsuario, data, atributo, aplicacion):
		#print("busco : " + atributo)
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		responseAtributos = ServiciosRest.invocarRestPost(url+"getCalcFields?tabla="+tabla+"&username="+nombreUsuario, data)
		#print(responseAtributos)
		return responseAtributos[atributo]

	@staticmethod
	def obtenerAtributosCapa(nombreUsuario, nombreCapa, aplicacion):
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		responseAtributos = ServiciosRest.invocarRestGet(url+"atributocapaformat?username="+nombreUsuario+"&capa="+nombreCapa)
		return responseAtributos

	@staticmethod
	def obtenerCodiguerasData(nombreUsuario, aplicacion):
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		responseCodiguera = ServiciosRest.invocarRestGet(url+"codiguerasdata?username="+nombreUsuario)
		return responseCodiguera

	@staticmethod
	def obtenerDatosParaExportarCSV(dbms, datasource, tabla, nombreUsuario, aplicacion, data):
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		responseFile = ServiciosRest.invocarRestPostCSV(f"{url}reportes/csv/{dbms}/{datasource}/{tabla}?username={nombreUsuario}", data)
		return responseFile