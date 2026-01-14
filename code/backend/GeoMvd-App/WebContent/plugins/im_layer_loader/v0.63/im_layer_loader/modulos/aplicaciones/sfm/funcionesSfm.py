from qgis.core import *
from qgis.gui import *
import time
import logging
from PyQt5.QtWidgets import QProgressDialog, QMessageBox



class FuncionesSfm:

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesSfm.calcularBarrioSfm)

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def calcularBarrioSfm(feature, parent):
        capa_barrios = QgsProject.instance().mapLayersByName("sfm:c_sf_barrios")[0]
        
        nom_barrio = 'No especificado'
        if feature.isValid() and feature.geometry():
            for barrio in capa_barrios.getFeatures():
                if barrio.geometry().contains(feature.geometry()):
                    nom_barrio = barrio["BARRIO"]
        return nom_barrio            
