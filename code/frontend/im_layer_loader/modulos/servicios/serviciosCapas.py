import qgis
from qgis.core import *
from qgis.gui import *

from .serviciosRest import ServiciosRest
from ..utilidades.funcionesGenericas import FuncionesGenericas


class ServiciosCapas :

	@staticmethod
	def _obtenerPassword(nombreUsuario):
		# La contraseña no viaja como parámetro por las llamadas (requeriría cambiar la firma
		# de varias funciones de formularios/*.py). Se recupera del Auth Manager de QGIS, donde
		# ya queda guardada por FuncionesAutenticacion.cargarAutenticacionBasic al hacer login
		# (misma config, id = nombreUsuario). Ver plan de migración de plataforma, Fase 4.
		am = QgsApplication.authManager()
		cfg = QgsAuthMethodConfig()
		am.loadAuthenticationConfig(nombreUsuario, cfg, True)
		return cfg.config('password')

	@staticmethod
	def obtenerValorCalculado(tabla, nombreUsuario, data, atributo, aplicacion):
		#print("busco : " + atributo)
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		password = ServiciosCapas._obtenerPassword(nombreUsuario)
		responseAtributos = ServiciosRest.invocarRestPostAuth(url+"getCalcFields?tabla="+tabla+"&username="+nombreUsuario, data, nombreUsuario, password)
		#print(responseAtributos)
		return responseAtributos[atributo]

	@staticmethod
	def obtenerAtributosCapa(nombreUsuario, nombreCapa, aplicacion):
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		password = ServiciosCapas._obtenerPassword(nombreUsuario)
		responseAtributos = ServiciosRest.invocarRestGetAuth(url+"atributocapaformat?username="+nombreUsuario+"&capa="+nombreCapa, nombreUsuario, password)
		return responseAtributos

	@staticmethod
	def obtenerCodiguerasData(nombreUsuario, aplicacion):
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		password = ServiciosCapas._obtenerPassword(nombreUsuario)
		responseCodiguera = ServiciosRest.invocarRestGetAuth(url+"codiguerasdata?username="+nombreUsuario, nombreUsuario, password)
		return responseCodiguera

	@staticmethod
	def obtenerDatosParaExportarCSV(dbms, datasource, tabla, nombreUsuario, aplicacion, data):
		url = FuncionesGenericas.getUrlServicios(aplicacion)
		responseFile = ServiciosRest.invocarRestPostCSV(f"{url}reportes/csv/{dbms}/{datasource}/{tabla}?username={nombreUsuario}", data)
		return responseFile