from qgis.utils import iface
from PyQt5.QtWidgets import QMenu, QAction, QPushButton, QVBoxLayout, QComboBox, QCompleter, QLineEdit, QMessageBox
from qgis.core import QgsProject, QgsMapLayerType, QgsExpression,QgsFeatureRequest, QgsDefaultValue
from qgis.gui import QgsGui
from PyQt5.QtWidgets import QFileDialog

import os
import requests
import json
import re

from requests.auth import HTTPBasicAuth

from .funcionesCitim import FuncionesCitim
from ...properties.configProperties import ConfigProperties
from ...seguridad.funcionesAutenticacion import FuncionesAutenticacion

from ...utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class ManejadorAlfresco:

    @staticmethod
    def subirArchivo(usr, pas):

        link = ""
        id_nodo = None
        alfresco_u, alfresco_p = FuncionesAutenticacion.autenticarAlfresco(usr, pas)
        if not (alfresco_u is None):

            ruta_absoluta_file = ManejadorAlfresco.seleccionarArchivoLocal()
            if ruta_absoluta_file != '':
                link, id_nodo = ManejadorAlfresco.subirArchivoAlfresco(ruta_absoluta_file, alfresco_u, alfresco_p)
            else:
                print("La ruta es vacia")
        else:
            logger.error(f'Error en autenticacion de alfrsco con usuario:{usr} y archivo. Subir Archivo')
            QMessageBox.critical(None, "Autenticaciónn en Imnube", "El usuario o contraseña de Imnube son incorrectos", QMessageBox.Ok)

        return link, id_nodo

    @staticmethod
    def seleccionarArchivoLocal():

        # Crear un diálogo de selección de archivo
        file_dialog = QFileDialog()
        file_dialog.setFileMode(QFileDialog.ExistingFile)

        # Mostrar el diálogo y esperar a que el usuario seleccione un archivo
        selected_file, _ = file_dialog.getOpenFileName(None, 'Seleccionar archivo', '', 'Archivos (*.*)')
        path = ""
        # Verificar si el usuario ha seleccionado un archivo
        if selected_file:
            if os.path.exists(selected_file):
                # Obtener la ruta absoluta del archivo seleccionado
                ruta_completa = os.path.abspath(selected_file)
                path = ruta_completa

        return path

    @staticmethod
    def subirArchivoAlfresco(archivo_local, usr, pas):

        salida_link = ""
        salida_id_nodo = None
        response = None

        nombre_archivo = os.path.basename(archivo_local).split('.')[0]

        # Configuración de Alfresco
        url_base = ConfigProperties.getPropery("Imnube", "urlBaseImnube")
        id_nodo = ConfigProperties.getPropery("Imnube", "idNodeCarpeta")
        alfresco_url_crear_nodo = f'{url_base}/nodes/{id_nodo}/children'
        url_base_publico = ConfigProperties.getPropery("Imnube", "urlBasePublico")

        alfresco_url_shared_link = f'{url_base}/shared-links'

        try:
            # Configuración de las credenciales
            auth = HTTPBasicAuth(usr, pas)

            # Subir el archivo a Alfresco
            with open(archivo_local, 'rb') as file:
                files = {'filedata': file}
                nodo_data = {"overwrite": "true"}
                response = requests.post(alfresco_url_crear_nodo, auth=auth, data=nodo_data, files=files)

            if response.status_code == 201:
                #print(f"Archivo {archivo_local} subido con éxito a Alfresco.")
                data = response.json()
                response.close()
                nodo_id = data["entry"]["id"]
                salida_id_nodo = nodo_id

                # Datos JSON que deseas enviar en el cuerpo de la solicitud
                datos_json = {
                    "nodeId": f"{nodo_id}"
                }

                # Convertir los datos JSON a formato de cadena
                datos_json_str = json.dumps(datos_json)

                # Cabeceras para la solicitud POST
                headers = {
                    "Content-Type": "application/json"
                }
                response_link = None
                try:
                    response_link = requests.post(alfresco_url_shared_link, auth=auth, data=datos_json_str, headers=headers)
                    data_link = response_link.json()
                    if response_link.status_code == 409:
                        shared_id = re.search(r'\[(.+?)\]', data_link["error"]["errorKey"]).group(1)
                        # print(f'EXISTE 409 {shared_id}, y ademas el nombre {nombre_archivo})')
                    else:
                        shared_id = data_link["entry"]["id"]
                        # print(f'NO EXISTE 409 {shared_id}, y ademas el nombre {nombre_archivo})')
                    salida_link = f'{url_base_publico}/{shared_id}'
                except Exception as error:
                    # print(f'Error en ": {type(error).__name__} : {error}')
                    logger.error(f'Error en la conexion de generación link publico alfresco: {type(error).__name__} : {error}. url: {alfresco_url_shared_link}. out:{response_link}')
            else:
                print(f"ELSE Error al subir el archivo {archivo_local} a Alfresco. Código de estado: {response.status_code}")
        except Exception as error:
            print(f'Error en": {type(error).__name__} : {error}')
            logger.error(f'Error en la conexion de alta archivo alfrecso: {type(error).__name__} : {error}. url: {alfresco_url_crear_nodo}. out:{response}')
            QMessageBox.critical(None, "Alta archivo Imnube", "Se produjo un error al subir el archivo a Alfresco", QMessageBox.Ok)

        return salida_link, salida_id_nodo

    @staticmethod
    def bajarArchivo(id_nodo, usr, pas):
        response = None
        try:
            alfresco_u, alfresco_p = FuncionesAutenticacion.autenticarAlfresco(usr, pas)

            if not (alfresco_u is None):
                url_base = ConfigProperties.getPropery("Imnube", "urlBaseImnube")

                delete_url = f'{url_base}/nodes/{id_nodo}'

                auth = HTTPBasicAuth(alfresco_u, alfresco_p)

                response = requests.delete(delete_url, auth=auth)
                if response.status_code == 204:
                    print(f"El archivo con ID {id_nodo} fue eliminado correctamente.")
                else:
                    print(f"Error al intentar eliminar el archivo. Código de estado: {response.status_code}")
                    logger.error(f"Error al intentar eliminar el archivo. Código de estado: {response.status_code}")
            else:
                logger.error(f'Error en autenticacion de alfrsco con usuario:{usr} y archivo. Bajar Archivo')

        except Exception as error:
            print(f'Error en": {type(error).__name__} : {error}')
            logger.error(f'Error en la conexion de borrado archivo alfresco: {type(error).__name__} : {error}. url: {delete_url}. out:{response}')
