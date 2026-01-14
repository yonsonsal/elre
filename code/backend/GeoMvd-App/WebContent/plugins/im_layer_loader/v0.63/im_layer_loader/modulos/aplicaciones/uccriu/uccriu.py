from qgis.core import QgsProject
from .funcionesUccriu import FuncionesUccriu


class Uccriu:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesUccriu.disponibilizarFuncionesParaExpresiones()        

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]
        
        if layerName == "uccriu:e_v_uccriu_obras_programadas":
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            FuncionesUccriu.conectarFuncionesAddOrModifyObrasProg(layer)
        
    @staticmethod
    def completarConfigAplicacion(*args):
        print("pasa completar funciones uccriu")
        FuncionesUccriu.filtrarDescripcionRemocion()
