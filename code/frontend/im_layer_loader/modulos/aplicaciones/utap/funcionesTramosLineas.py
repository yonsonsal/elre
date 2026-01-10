from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesTramosLineas:
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoConductor(feature, parent):
        datoActual = feature.attribute("cod_tipo_conductor")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoCable(feature, parent):
        datoActual = feature.attribute("cod_tipo_cable")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoTendido(feature, parent):
        datoActual = feature.attribute("cod_tipo_tendido")
        dato = "ST"
        if datoActual is not None:
            dato = datoActual
        return dato
   
    @staticmethod
    def armarUnionTipoConductor():
        nombreCapa = "utap:e_utap_tramo_linea"
        layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]

        nombreCapaJoin = "utap:c_utap_tipo_conductor"
        layerJoin = QgsProject.instance().mapLayersByName(nombreCapaJoin)[0]

        # Creamos el objeto join
        joinObject = QgsVectorLayerJoinInfo()
        joinObject.setJoinLayer(layerJoin)
        joinObject.setJoinFieldName("cod_tipo_conductor")
        joinObject.setTargetFieldName("tipo_conductor")
        joinObject.setPrefix("")
        joinObject.setDynamicFormEnabled(True)
        joinObject.setUsingMemoryCache(True)

        # Seteamos los campos que queremos obtener
        joinFieldNamesSubset = ['tipo_conductor', 'desc_corta_tipo_conductor', 'desc_tipo_conductor']
        joinObject.setJoinFieldNamesSubset(joinFieldNamesSubset)

        # Agregamos el join a la capa
        layer.addJoin(joinObject)
        
        
    @staticmethod
    def setearRestricciones():
        layer = QgsProject.instance().mapLayersByName("utap:e_utap_tramo_linea")[0]

        field_idx1 = layer.fields().indexFromName("gid")        
        layer.setConstraintExpression(field_idx1, "")
        
        
        
        
        
        
