from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

class FuncionesElementos:
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoElemento(feature, parent):
        datoActual = feature.attribute("cod_tipo_elemento")
        dato = 1
        if datoActual is not None:
            dato = datoActual
        return dato