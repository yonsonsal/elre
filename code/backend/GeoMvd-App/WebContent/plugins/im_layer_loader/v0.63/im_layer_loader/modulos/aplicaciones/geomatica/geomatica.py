from .funcionesGeomatica import FuncionesGeomatica


class Geomatica:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesGeomatica.disponibilizarFuncionesParaExpresiones()

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]