from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesEstaciones:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getCantidadEspacios(feature, parent):
        cantidadActual = feature.attribute("cantidad")
        cantidad = 0
        if cantidadActual is not None:
            cantidad = cantidadActual
        return cantidad

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHoraIni(feature, parent):
        horaIniActual = feature.attribute("hora_ini")
        horaIni = "00.00hs"
        if horaIniActual is not None:
            horaIni = horaIniActual
        return horaIni

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getHoraFin(feature, parent):
        horaFinActual = feature.attribute("hora_fin")
        horaFin = "00.00hs"
        if horaFinActual is not None:
            horaFin = horaFinActual
        return horaFin

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getActivo(feature, parent):
        activoActual = feature.attribute("activo")
        activo = 1 
        if activoActual is not None:
            activo = activoActual
        return activo

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getObservaciones(feature, parent):
        obsActual = feature.attribute("observaciones")
        obs = "" 
        if obsActual is not None:
            obs = obsActual
        return obs