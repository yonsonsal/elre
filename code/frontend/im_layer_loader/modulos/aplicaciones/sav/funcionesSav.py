from qgis.core import *
from qgis.gui import *
from qgis.PyQt import QtWidgets
import time
import logging
from PyQt5.QtWidgets import QProgressDialog, QMessageBox

from .funcionesPalmeras import FuncionesPalmeras

class FuncionesSav:

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesPalmeras.calcularMunicipioSav)

