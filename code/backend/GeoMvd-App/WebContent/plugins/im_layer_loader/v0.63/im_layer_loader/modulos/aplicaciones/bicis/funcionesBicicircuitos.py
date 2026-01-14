from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesBicicircuitos:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoBicicircuitos(feature, parent):
        tipoActual = feature.attribute("tipo")
        tipo = 1
        if tipoActual is not None:
            tipo = tipoActual
        return tipo

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getDescripcionBicicircuitos(feature, parent):
        descripcionActual = feature.attribute("descripcion")
        descripcion = ""
        if descripcionActual is not None:
            descripcion = descripcionActual
        return descripcion

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getSentidoBicicircuitos(feature, parent):
        sentidoActual = feature.attribute("sentido")
        sentido = 1
        if sentidoActual is not None:
            sentido = sentidoActual
        return sentido

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getAnchoBicicircuitos(feature, parent):
        anchoActual = feature.attribute("ancho")
        ancho = 0
        if anchoActual is not None:
            ancho = anchoActual
        return ancho

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getActivoBicicircuitos(feature, parent):
        activoActual = feature.attribute("activo")
        activo = 1
        if activoActual is not None:
            activo = activoActual
        return activo