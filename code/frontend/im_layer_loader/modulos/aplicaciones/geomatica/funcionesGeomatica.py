from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from .funcionesEspaciosLibres import FuncionesEspaciosLibres


class FuncionesGeomatica:

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesEspaciosLibres.getEstadoEspaciosLIbres)
        factory.registerFunction(FuncionesEspaciosLibres.getTipoEspacioEspaciosLIbres)