from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

from ...formularios.formulario import Formulario

class FuncionesLuminarias:
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoLampara(feature, parent):
        datoActual = feature.attribute("cod_tipo_lampara")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getModeloLuminaria(feature, parent):
        datoActual = feature.attribute("codmodelo")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getMarcaLuminaria(feature, parent):
        datoActual = feature.attribute("cod_marca")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getFabricanteLuminaria(feature, parent):
        datoActual = feature.attribute("cod_fabricante")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getModeloBrazo(feature, parent):
        datoActual = feature.attribute("cod_modelo_brazo")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipologia(feature, parent):
        datoActual = feature.attribute("cod_tipologia")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getInstalador(feature, parent):
        datoActual = feature.attribute("cod_instalador")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoControl(feature, parent):
        datoActual = feature.attribute("cod_tipo_control")
        dato = 2
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTemperaturaColor(feature, parent):
        datoActual = feature.attribute("cod_temp_color")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getColorCarcasa(feature, parent):
        datoActual = feature.attribute("cod_color_carcasa")
        dato = 2
        if datoActual is not None:
            dato = datoActual
        return dato
        
           
    @staticmethod
    def setearRestricciones():
        luminarias = QgsProject.instance().mapLayersByName("utap:e_utap_luminaria")[0]
        
        puestas = QgsProject.instance().mapLayersByName("utap:e_utap_puesta")[0]

#        rel = QgsRelation()
#        rel.setId("relacion luminarias puestas")
#        rel.setName("Luminarias - Puestas")
#        rel.setReferencingLayer(puestas.id())   # Hija
#        rel.setReferencedLayer(luminarias.id())   # Padre
#        rel.addFieldPair("gid", "id_puesta")  # hijo, padre
#        rel.setStrength(QgsRelation.Composition)

#        QgsProject.instance().relationManager().addRelation(rel)
        
        Formulario.agregoRelacion("utap:e_utap_luminaria","id_puesta","utap:e_utap_puesta","gid",'puesta de luminaria')
        
        field_idx1 = luminarias.fields().indexFromName("id_puesta")
        field_idx2 = luminarias.fields().indexFromName("id_nodo_controlador")
        luminarias.setConstraintExpression(field_idx1, "(NOT (id_puesta <> '' AND id_nodo_controlador <> '') OR NOT (id_puesta IS NOT NULL AND id_nodo_controlador IS NOT NULL)) AND array_length(relation_aggregate('puesta de luminaria', 'array_agg', 'gid')) > 0 ")
        luminarias.setConstraintExpression(field_idx2, "NOT (id_puesta <> '' AND id_nodo_controlador <> '') OR NOT (id_puesta IS NOT NULL AND id_nodo_controlador IS NOT NULL)")
        
