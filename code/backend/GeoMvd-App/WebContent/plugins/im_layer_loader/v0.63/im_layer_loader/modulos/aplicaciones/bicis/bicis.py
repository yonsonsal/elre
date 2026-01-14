from .funcionesBicis import FuncionesBicis


class Bicis:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesBicis.disponibilizarFuncionesParaExpresiones()

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]