from qgis.core import QgsProject
from .funcionesCitim import FuncionesCitim
from ...formularios.atributosFormulario import AtributosFormularios
from ...utilidades.funcionesGenericas import FuncionesGenericas


class CitimAlineaciones:

    @staticmethod
    def procesarAplicacion(*args):
        workspace = args[0]
        FuncionesCitim.disponibilizarFuncionesParaExpresiones()

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = args[0]
        layerName = args[1]
        if layerName == "citim.alineaciones:e_citim_afectaciones":
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            FuncionesCitim.conectarFuncionesRecargarCapa(layer)

    @staticmethod
    def completarConfigAplicacion(*args):
        FuncionesCitim.armarUnionTrazosProyecto()
        AtributosFormularios.cargaDateAtributo('citim.alineaciones:e_citim_trazos', 'fecha_real', False)
        AtributosFormularios.cargaDateAtributo('citim.alineaciones:e_citim_trazos', 'fecha_apro', False)
        AtributosFormularios.atributoConstraint('citim.alineaciones:e_citim_afectaciones', 'fecha_certificado', 'fecha_certificado <= now()')