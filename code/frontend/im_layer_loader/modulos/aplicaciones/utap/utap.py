from .funcionesUtap import FuncionesUtap
from .funcionesTramosLineas import FuncionesTramosLineas


class Utap:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesUtap.disponibilizarFuncionesParaExpresiones()

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]
        
    @staticmethod
    def completarConfigAplicacion(*args):
        FuncionesTramosLineas.armarUnionTipoConductor()
        FuncionesUtap.setearRestricciones()
        
