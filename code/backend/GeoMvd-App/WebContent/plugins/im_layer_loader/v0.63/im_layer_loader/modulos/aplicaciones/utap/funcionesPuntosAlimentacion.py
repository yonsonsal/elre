from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesPuntosAlimentacion:
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoConexion(feature, parent):
        datoActual = feature.attribute("cod_tipo_conexion")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoAlimentacion(feature, parent):
        datoActual = feature.attribute("cod_tipo_alimentacion")
        dato = "TB"
        if datoActual is not None:
            dato = datoActual
        return dato
        
    @staticmethod
    def setearRestricciones():
        layer = QgsProject.instance().mapLayersByName("utap:e_utap_punto_alimentacion")[0]

        # seteo restriccion de unicidad de campo "numero"
        field_idx = layer.fields().indexFromName("numero")	
        layer.setFieldConstraint(field_idx, QgsFieldConstraints.ConstraintUnique, True)
        layer.setConstraintExpression(field_idx, "left(\"numero\",2) = \"cod_tipo_alimentacion\"")
        
        field_idx1 = layer.fields().indexFromName("nro_cuenta")        
        layer.setConstraintExpression(field_idx1, "(length(\"nro_cuenta\") = 10 AND regexp_match(\"nro_cuenta\", '^\\\\d{10}$')) OR (\"cod_tipo_alimentacion\" = 'SE' AND length(\"nro_cuenta\") = 13 AND regexp_match(right(\"nro_cuenta\", 3), '^-\\\\d{2}$'))")
                
