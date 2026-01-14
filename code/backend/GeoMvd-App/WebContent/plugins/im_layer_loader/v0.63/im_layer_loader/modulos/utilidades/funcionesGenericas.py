from PyQt5.QtCore import QStringListModel, Qt, pyqtSignal
from PyQt5.uic.properties import QtCore

from .logger import SafePluginLogger
from ..properties.configProperties import ConfigProperties
from qgis.utils import iface
from PyQt5.QtWidgets import QMenu, QAction, QPushButton, QVBoxLayout, QComboBox, QCompleter, QLineEdit
from qgis.core import QgsProject, QgsMapLayerType, QgsExpression,QgsFeatureRequest, QgsDefaultValue
from qgis.PyQt import QtWidgets
from PyQt5 import uic
from qgis.PyQt.QtWidgets import QDialog
import os
from pathlib import Path

from .funcionesMapa import FuncionesMapa

logger = SafePluginLogger.init_logger()

class FuncionesGenericas:

    @staticmethod
    def getUrlServicios(aplicacion):
        url = ConfigProperties.getPropery("ServicioRest", "urlCapas")
        url = url.replace("replaceAppName", aplicacion)
        return url

    @staticmethod
    def getUserLayer(source):
        substring = "user="
        user = ""
        if substring in source:
            index = source.find(substring)
            user = source[index:].split(' ')[0].split('=')[1].replace('\'', '')
        return user

    @staticmethod
    def getLayerName(nombreCapaCompleto):
        return nombreCapaCompleto.split(":")

    @staticmethod
    def agregarFiltroDuplicadosCapa(layername, field_name):
        if FuncionesMapa.existeCapaProyecto(layername):
            layer = QgsProject.instance().mapLayersByName(layername)[0]
            layer.setSubsetString('')

            # Creamos la coleccion vacia de elementos
            duplicates = []

            # recorremos todos los elementos de la capa dibujados
            for feature in layer.getFeatures():

                # Creamos una expresion para comprobar si el elemento ya tiene algun correspondiente con el mismo valor
                filter_exp = "{} = '{}'".format(field_name, feature[field_name])

                # usamos la expresion para seleccionar los elementos
                layer.selectByExpression(filter_exp)

                # chequeamos si los elementos son duplicados segun la expresion
                if layer.selectedFeatureCount() > 1:
                    duplicates.append(feature)

            distinct_elements = []

            # recorremos los elementos duplicados
            # para armar el str separado por coma segun el campo
            # que queriamos usar
            exprDuplicados = ""
            for feature in duplicates:
                if feature.attribute(field_name) not in distinct_elements:
                    distinct_elements.append(feature.attribute(field_name))

            for dict_obj in distinct_elements:
                if exprDuplicados == "":
                    exprDuplicados += str(dict_obj)
                else:
                    exprDuplicados += ','+str(dict_obj)

            expr = None
            if exprDuplicados == "":
                # creamos la expresion vacia para el filtro
                expr = QgsExpression(f'"{field_name}" = -1')
            else:
                # creamos la expresion para el filtro
                expr = QgsExpression(f'"{field_name}" IN ({exprDuplicados})')

            # agregamos el filtro a la capa
            layer.setSubsetString(expr.expression())

            # publicamos el filtro
            layer.commitChanges()
        else:
            QtWidgets.QMessageBox.information(None, "Menú Utilidades", "No se puede ejecutar Acción. No Existe la Capa: " + layername)

    @staticmethod
    def crearMenuUtilidades():
        menu = iface.mainWindow().findChild(QMenu, 'Utilidades')
        if not menu:
            menu = iface.mainWindow().menuBar().addMenu('&Utilidades')
            menu.setObjectName('Utilidades')
        return menu

    @staticmethod
    def cargarOpcionAccionCapa(layerName, nombreAccion, nombreObjetoAccion, funcion):
        my_action = QAction(nombreAccion, iface.mainWindow())
        my_action.setObjectName(nombreObjetoAccion)
        my_action.triggered.connect(funcion)
        iface.removeCustomActionForLayerType(my_action)
        iface.addCustomActionForLayerType(my_action, "Utilidades " + layerName, QgsMapLayerType(0), False)
        layer = QgsProject.instance().mapLayersByName(layerName)[0]
        iface.addCustomActionForLayer(my_action, layer)

    @staticmethod
    def cargarMenuBarUtilidades(nombreAccion, nombreObjetoAccion, funcion):
        # Create menu
        my_menu = FuncionesGenericas.crearMenuUtilidades()

        #busco a ver si ya existe
        my_action = None
        for act in my_menu.actions():
            if act.text() == nombreAccion:
                my_menu.removeAction(act)
                break
        my_action = QAction(nombreAccion, iface.mainWindow())
        my_action.setObjectName(nombreObjetoAccion)
        my_action.triggered.connect(funcion)
        # Add the QAction to the menu
        my_menu.addAction(my_action)

    @staticmethod
    def obtenerPathArchivoComand(nombre_archivo_accion):

        directorio_acciones = os.path.join(Path(__file__).parent.parent, "acciones")
        ruta_archivo_accion = os.path.join(directorio_acciones, nombre_archivo_accion)

        if not os.path.exists(ruta_archivo_accion):
            logger.error(f'Error al cargar la accion del archivo:{nombre_archivo_accion}. No existe {ruta_archivo_accion}')

        return ruta_archivo_accion

