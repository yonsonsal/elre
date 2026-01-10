from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

from ...formularios.formulario import Formulario

class FuncionesPuestas:
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoSoporte(feature, parent):
        datoActual = feature.attribute("cod_tipo_puesta")
        dato = "CLTExxxyyy"
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getAlturaSoporte(feature, parent):
        datoActual = feature.attribute("altura_soporte")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getDistanciaCalzada(feature, parent):
        datoActual = feature.attribute("dist_calzada")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getInterdistancia(feature, parent):
        datoActual = feature.attribute("interdistancia")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato
        
    @staticmethod
    def setearRestricciones():
        puestas = QgsProject.instance().mapLayersByName("utap:e_utap_puesta")[0]
        
        ptosalimentacion = QgsProject.instance().mapLayersByName("utap:e_utap_punto_alimentacion")[0]
        

#        rel = QgsRelation()
#        rel.setId("relacion_puestas alimentacion")
#        rel.setName("Puestas - PtosAlimentacion")
#        rel.setReferencingLayer(ptosalimentacion.id())   # Hija
#        rel.setReferencedLayer(puestas.id())   # Padre
#        rel.addFieldPair("gid", "punto_alimentacion")  # hijo, padre
#        rel.setStrength(QgsRelation.Composition)

#        QgsProject.instance().relationManager().addRelation(rel)

        Formulario.agregoRelacion("utap:e_utap_puesta","punto_alimentacion","utap:e_utap_punto_alimentacion","gid",'pto alimentacion de puesta')

        field_idx1 = puestas.fields().indexFromName("id_punto_alimentacion")        
        puestas.setConstraintExpression(field_idx1, "array_length(relation_aggregate('pto alimentacion de puesta', 'array_agg', 'gid')) > 0")
        
        
