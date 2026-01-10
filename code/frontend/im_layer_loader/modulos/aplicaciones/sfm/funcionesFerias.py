from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

from ...formularios.formulario import Formulario

class FuncionesFerias:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def calcularBarrioFeria(feature, parent):
        capa_barrios = QgsProject.instance().mapLayersByName("sfm:c_sf_barrios")[0]
        
        nom_barrio = 'El área de la feria no está contenida en ningún barrio.'
        if feature.isValid() and feature.geometry():
            areaFeria = 0
            for barrio in capa_barrios.getFeatures():
                if barrio.geometry().contains(feature.geometry()):
                    nom_barrio = barrio["BARRIO"]
                    break
                elif barrio.geometry().intersects(feature.geometry()):
                    if barrio.geometry().intersection(feature.geometry()).area() > areaFeria:
                        areaFeria = barrio.geometry().intersection(feature.geometry()).area()
                        nom_barrio = barrio["BARRIO"]
        return nom_barrio   

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getResponsableFeria(feature, parent):
        datoActual = feature.attribute("COD_RESPONSABLE")
        dato = "A"
        if datoActual is not None:
            dato = datoActual
        return dato
    
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getNumeroFeria(feature, parent):
        datoActual = feature.attribute("NRO_FERIA")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getDiaFeria(feature, parent):
        datoActual = feature.attribute("COD_DIA")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getAmbitoTerritorialFeria(feature, parent):
        datoActual = feature.attribute("COD_COMUNAL")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoFeria(feature, parent):
        datoActual = feature.attribute("COD_TIPO")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato
        
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHoraArmadoFeria(feature, parent):
        datoActual = feature.attribute("ARMADO")
        dato = "500"
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHoraComienzoFeria(feature, parent):
        datoActual = feature.attribute("HORA_COMIENZO")
        dato = "500"
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHoraFinFeria(feature, parent):
        datoActual = feature.attribute("HORA_FIN")
        dato = "500"
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHoraLevantadoFeria(feature, parent):
        datoActual = feature.attribute("LEVANTADO")
        dato = "500"
        if datoActual is not None:
            dato = datoActual
        return dato
        
    
