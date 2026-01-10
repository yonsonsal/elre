from qgis.core import QgsProject
from .funcionesGep import FuncionesGep
from ...formularios.atributosFormulario import AtributosFormularios
from ...utilidades.funcionesGenericas import FuncionesGenericas


class Gep:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]

    @staticmethod
    def completarConfigAplicacion(*args):
        FuncionesGep.armarRelacionesMaestroDetalle()