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
        
        if layerName == "sfm:e_sf_feria":
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            FuncionesSfm.conectarFuncionesFerias(layer)
        
    @staticmethod
    def completarConfigAplicacion(*args):
        FuncionesSfm.setearRestricciones()

