from qgis.core import QgsProject

from .funcionesDfr import FuncionesDfr
from .filtrosDfr import FiltrosDfr
from ...utilidades.funcionesGenericas import FuncionesGenericas


class Dfr:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesDfr.disponibilizarFuncionesParaExpresiones()

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]

        if layerName == "dfr:E_DF_POSICIONES_RECORRIDO":
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
            FuncionesDfr.conectarFuncionesRollbackPosicionesRecorrido(layer)

            FiltrosDfr.agregarFiltrosPredefinidos(layer, layerName)



