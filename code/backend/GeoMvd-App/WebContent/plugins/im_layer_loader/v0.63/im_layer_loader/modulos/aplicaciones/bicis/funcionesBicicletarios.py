from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface
class FuncionesBicicletarios:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getActivoBicicletarios(feature, parent):
        activoActual = feature.attribute("activo")
        activo = 1
        if activoActual is not None:
            activo = activoActual
        return activo

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getCantidadModulosBicicletarios(feature, parent):
        cantidadActual = feature.attribute("cantidad")
        cantidad = 0
        if cantidadActual is not None:
            cantidad = cantidadActual
        return cantidad
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getUbicacionBicicletarios(feature, parent):
        ubicacionActual = feature.attribute("ubicacion")
        ubicacion = 1
        if ubicacionActual is not None:
            ubicacion = ubicacionActual
        return ubicacion

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getObservacionesBicicletarios(feature, parent):
        observacionesActual = feature.attribute("observaciones")
        observaciones = "Clasificación por estadía: \nPuntos de sujeción: "
        if observacionesActual is not None:
            observaciones = observacionesActual
        return observaciones

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getNombreBicicletarios(feature, parent):
        nombreActual = feature.attribute("nombre_ubicacion")
        nombre = ""
        if nombreActual is not None:
            nombre = nombreActual
        return nombre