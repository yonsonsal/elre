import requests
from PyQt5.QtWidgets import QMessageBox
from requests.auth import HTTPBasicAuth
import json
from PyQt5.QtWidgets import QMessageBox
from ..utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class ServiciosRest :

	@staticmethod
	def invocarRestGet(urlServicio):

		try:
			headers = {'Accept': 'application/json'}
			response = None  # Inicializamos la variable para usarla más adelante
			with requests.get(urlServicio, headers=headers) as response:
				response.raise_for_status()  # Lanza excepción para códigos de error HTTP (4xx y 5xx)
				return response.json()  # Devuelve el JSON parseado si ok
		except requests.exceptions.HTTPError as error:
			# Manejo de errores HTTP específicos
			if response is not None and response.status_code == 404:
				logger.error(
					f'Error 404: No se encuentra la metadata. '
					f'status_code: {response.status_code}, response.text: {response.text}, '
					f'reason: {response.reason}, url: {urlServicio}')
			else:
				logger.error(
					f'Error HTTP en el request. Tipo: {type(error).__name__}, Detalle: {error}, '
					f'url: {urlServicio}, response: {response.text if response else "N/A"}')
			return None
		except requests.exceptions.RequestException as error:
			# Manejo de errores de conexión, timeout u otros relacionados con requests
			logger.error(
				f'Error en la solicitud. Tipo: {type(error).__name__}, Detalle: {error}, url: {urlServicio}')
			return None
		except json.JSONDecodeError as error:
			# Manejo de errores al parsear JSON
			logger.error(
				f"Error al parsear JSON: {error}. URL: {urlServicio}, "
				f"Respuesta: {response.text if response else 'N/A'}")
			return None
		except Exception as error:
			# Manejo de errores inesperados
			logger.error(
				f"Error inesperado. Tipo: {type(error).__name__}, Detalle: {error}, url: {urlServicio}")
			return None

	@staticmethod
	def invocarRestGetAuth(urlServicio, usuario, password):
		try:
			headers = {'Accept': 'application/json'}
			auth=HTTPBasicAuth(usuario, password)
			response = requests.get(urlServicio, headers=headers, auth=auth)
			return response.json()
		except Exception as error:
			logger.error(f'Error en la red. En "invocarRestGetAuth" en ServiciosRest: {type(error).__name__} : {error}. urlServicio: {urlServicio}')
			return None

	@staticmethod
	def invocarRestGetAuthSld(urlServicio, usuario, password):
		try:
			headers = {'Accept': 'application/vnd.ogc.sld+xml'}
			auth=HTTPBasicAuth(usuario, password)
			response = requests.get(urlServicio, headers=headers, auth=auth)
			return response.content
		except Exception as error:
			logger.error(f'Error en la red. En "invocarRestGetAuthSld" en ServiciosRest: {type(error).__name__} : {error}. urlServicio: {urlServicio}')
			return None

	@staticmethod
	def invocarRestPost(urlServicio, data):
		try:
			headers = {'Accept': 'application/json'}
			response = requests.post(urlServicio, json=data, headers=headers)
			return response.json()
		except Exception as error:
			logger.error(f'Error en la red. En "invocarRestPost" en ServiciosRest: {type(error).__name__} : {error}. urlServicio: {urlServicio}')
			return None

	@staticmethod
	def invocarRestPostAuth(urlServicio, data, usuario, password):
		try:
			headers = {'Accept': 'application/json'}
			auth = HTTPBasicAuth(usuario, password)
			response = requests.post(urlServicio, json=data, headers=headers, auth=auth)
			return response.json()
		except Exception as error:
			logger.error(f'Error en la red. En "invocarRestPostAuth" en ServiciosRest: {type(error).__name__} : {error}. urlServicio: {urlServicio}')
			return None

	@staticmethod
	def invocarRestPostCSV(urlServicio, data):
		try:
			headers = {'Accept': 'text/csv'}
			response = requests.post(urlServicio, json=data, stream=True, headers=headers)
			return response
		except Exception as error:
			logger.error(f'Error en la red. En "invocarRestPostCSV" en ServiciosRest: {type(error).__name__} : {error}. urlServicio: {urlServicio}')
			return None