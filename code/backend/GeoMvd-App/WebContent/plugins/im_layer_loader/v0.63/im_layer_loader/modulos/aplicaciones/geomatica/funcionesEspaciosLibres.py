from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface
class FuncionesEspaciosLibres:

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getEstadoEspaciosLIbres(feature, parent):
        estadoActual = feature.attribute("estado")
        estado = 1
        if estadoActual is not None:
            estado = estadoActual
        return estado

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoEspacioEspaciosLIbres(feature, parent):
        tipoEspacioActual = feature.attribute("tipo_espacio_sig")
        tipoEspacio = 3
        if tipoEspacioActual is not None:
            tipoEspacio = tipoEspacioActual
        return tipoEspacio