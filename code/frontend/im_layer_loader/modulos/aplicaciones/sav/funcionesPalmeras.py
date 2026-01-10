from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesPalmeras:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def calcularMunicipioSav(feature, parent):
        capa = QgsProject.instance().mapLayersByName("sav:c_av_municipios")[0]
        
        nom = 'No especificado'
        if feature.isValid() and feature.geometry():
            for mun in capa.getFeatures():
                if mun.geometry().contains(feature.geometry()):
                    nom = mun["municipio"]
        return nom      

   
