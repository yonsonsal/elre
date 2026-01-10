from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface

from .funcionesBicicircuitos import FuncionesBicicircuitos
from .funcionesEstaciones import FuncionesEstaciones
from .funcionesTalleres import FuncionesTalleres
from .funcionesBicicletarios import FuncionesBicicletarios


class FuncionesBicis:

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesEstaciones.getCantidadEspacios)
        factory.registerFunction(FuncionesEstaciones.getHoraIni)
        factory.registerFunction(FuncionesEstaciones.getHoraFin)
        factory.registerFunction(FuncionesEstaciones.getActivo)
        factory.registerFunction(FuncionesEstaciones.getObservaciones)
        factory.registerFunction(FuncionesTalleres.getNombreTalleres)
        factory.registerFunction(FuncionesTalleres.getHorariosTalleres)
        factory.registerFunction(FuncionesTalleres.getServiciosTalleres)
        factory.registerFunction(FuncionesBicicircuitos.getDescripcionBicicircuitos)
        factory.registerFunction(FuncionesBicicircuitos.getSentidoBicicircuitos)
        factory.registerFunction(FuncionesBicicircuitos.getAnchoBicicircuitos)
        factory.registerFunction(FuncionesBicicircuitos.getActivoBicicircuitos)
        factory.registerFunction(FuncionesBicicletarios.getActivoBicicletarios)
        factory.registerFunction(FuncionesBicicletarios.getNombreBicicletarios)
        factory.registerFunction(FuncionesBicicletarios.getCantidadModulosBicicletarios)
        factory.registerFunction(FuncionesBicicletarios.getObservacionesBicicletarios)
        factory.registerFunction(FuncionesBicicletarios.getUbicacionBicicletarios)