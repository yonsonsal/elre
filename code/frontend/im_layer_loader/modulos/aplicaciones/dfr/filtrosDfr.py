from PyQt5.QtCore import QStringListModel, Qt, pyqtSignal
from PyQt5.uic.properties import QtCore

from qgis.utils import iface
from PyQt5.QtWidgets import QMenu, QAction, QPushButton, QVBoxLayout, QComboBox, QCompleter, QLineEdit
from qgis.core import QgsProject, QgsMapLayerType, QgsExpression,QgsFeatureRequest, QgsDefaultValue


class FiltrosDfr:
    
    @staticmethod
    def agregarFiltrosPredefinidos(layer, layerName):
        
        my_actionA = QAction("Municipio A", iface.mainWindow())
        my_actionB = QAction("Municipio B", iface.mainWindow())
        my_actionC = QAction("Municipio C", iface.mainWindow())
        my_actionCH = QAction("Municipio CH", iface.mainWindow())
        my_actionD = QAction("Municipio D", iface.mainWindow())
        my_actionE = QAction("Municipio E", iface.mainWindow())
        my_actionF = QAction("Municipio F", iface.mainWindow())
        my_actionG = QAction("Municipio G", iface.mainWindow())
        
        my_actionA.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","A"))
        iface.addCustomActionForLayerType(my_actionA, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionA, layer)
        
        my_actionB.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","B"))
        iface.addCustomActionForLayerType(my_actionB, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionB, layer)
        
        my_actionC.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","C"))
        iface.addCustomActionForLayerType(my_actionC, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionC, layer)
        
        my_actionCH.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","CH"))
        iface.addCustomActionForLayerType(my_actionCH, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionCH, layer)
        
        my_actionD.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","D"))
        iface.addCustomActionForLayerType(my_actionD, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionD, layer)
        
        my_actionE.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","E"))
        iface.addCustomActionForLayerType(my_actionE, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionE, layer)
        
        my_actionF.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","F"))
        iface.addCustomActionForLayerType(my_actionF, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionF, layer)
        
        my_actionG.triggered.connect(lambda: FiltrosDfr.filtrarPorAtributo(layer,"COD_MUNICIPIO","G"))
        iface.addCustomActionForLayerType(my_actionG, "Filtrar por Municipio", QgsMapLayerType(0), False)
        iface.addCustomActionForLayer(my_actionG, layer)


    @staticmethod
    def filtrarPorAtributo(layer, nombreAtributo, valorAtributo):
       
       expresion_filtro = QgsExpression(f'"{nombreAtributo}" = \'{valorAtributo}\'')
       layer.setSubsetString(expresion_filtro.expression())
       layer.triggerRepaint()

