from qgis.core import *
from qgis.gui import *
import gc
from PyQt5.QtWidgets import QMessageBox
from ...properties.configProperties import ConfigProperties
from .funcionesAfectaciones import FuncionesAfectaciones

class FuncionesCitim:

    @staticmethod
    def armarUnionTrazosProyecto():
        nombreCapa = "citim.alineaciones:e_citim_trazos"
        layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]

        nombreCapaJoin = "citim.alineaciones:e_citim_proyectos"
        layerJoin = QgsProject.instance().mapLayersByName(nombreCapaJoin)[0]

        # Creamos el objeto join
        joinObject = QgsVectorLayerJoinInfo()
        joinObject.setJoinLayer(layerJoin)
        joinObject.setJoinFieldName("cod_proyecto")
        joinObject.setTargetFieldName("cod_proyecto")
        joinObject.setPrefix("")
        joinObject.setDynamicFormEnabled(True)
        joinObject.setUsingMemoryCache(True)

        # Seteamos los campos que queremos obtener
        joinFieldNamesSubset = ['plano', 'link', 'titulo', 'expediente', 'fecha_real', 'fecha_apro',
                                'resolucion', 'decreto', 'planera', 'caja']
        joinObject.setJoinFieldNamesSubset(joinFieldNamesSubset)

        # Agregamos el join a la capa
        layer.addJoin(joinObject)

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesAfectaciones.getVigente)
    
    @staticmethod
    def conectarFuncionesRecargarCapa(layer):
        def recargar():
            layer.dataProvider().forceReload()
            layer.triggerRepaint()

        layer.committedFeaturesAdded.connect(recargar)
        layer.committedAttributeValuesChanges.connect(recargar)

