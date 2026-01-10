from qgis.core import QgsProject
from .funcionesSav import FuncionesSav


class Sav:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesSav.disponibilizarFuncionesParaExpresiones()
        

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]

