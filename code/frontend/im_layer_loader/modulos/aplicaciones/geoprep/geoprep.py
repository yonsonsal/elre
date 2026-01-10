import time

from PyQt5.QtWidgets import QAction
from qgis.utils import iface


from ...utilidades.funcionesGenericas import FuncionesGenericas

class Geoprep:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]

        if layerName == "geoprep:e_pp_localescircuitos":

            nombreAccion =  "Filtrar Circuitos Repetidos"
            nombreObjetoAccion = 'FiltrarCircuitosRepetidos'
            campoFiltroDuplicado = "circuitovotacion"

            FuncionesGenericas.cargarOpcionAccionCapa(
                                        layerName,
                                        nombreAccion,
                                        nombreObjetoAccion,
                                        lambda: FuncionesGenericas.agregarFiltroDuplicadosCapa(layerName, campoFiltroDuplicado))

