from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesNodosControladores:
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTecnologia(feature, parent):
        datoActual = feature.attribute("cod_tecno")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getFabricante(feature, parent):
        datoActual = feature.attribute("cod_fabricante")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getModelo(feature, parent):
        datoActual = feature.attribute("cod_modelo")
        dato = 0
        if datoActual is not None:
            dato = datoActual
        return dato

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getMarca(feature, parent):
        datoActual = feature.attribute("cod_marca")
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