from qgis.core import QgsProject
from .funcionesSfm import FuncionesSfm


class Sfm:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesSfm.disponibilizarFuncionesParaExpresiones()
        

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]
        
        

