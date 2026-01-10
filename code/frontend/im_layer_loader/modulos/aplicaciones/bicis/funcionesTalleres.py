from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesTalleres:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getNombreTalleres(feature, parent):
        nombreActual = feature.attribute("nombre")
        nombre = ""
        if nombreActual is not None:
            nombre = nombreActual
        return nombre

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHorariosTalleres(feature, parent):
        horariosActual = feature.attribute("horarios")
        horarios = ""
        if horariosActual is not None:
            horarios = horariosActual
        return horarios

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getServiciosTalleres(feature, parent):
        serviciosActual = feature.attribute("servicios")
        servicios = ""
        if serviciosActual is not None:
            servicios = serviciosActual
        return servicios