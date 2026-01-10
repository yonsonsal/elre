from qgis.core import *
from qgis.gui import *

from .funcionesElementos import FuncionesElementos
from .funcionesGateway import FuncionesGateway
from .funcionesNodosControladores import FuncionesNodosControladores
from .funcionesPuntosAlimentacion import FuncionesPuntosAlimentacion
from .funcionesTramosLineas import FuncionesTramosLineas
from .funcionesPuestas import FuncionesPuestas
from .funcionesLuminarias import FuncionesLuminarias


class FuncionesUtap:
    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesGateway.getMarca)
        factory.registerFunction(FuncionesGateway.getModelo)
        factory.registerFunction(FuncionesGateway.getFabricante)
        factory.registerFunction(FuncionesGateway.getTecnologia)
        factory.registerFunction(FuncionesElementos.getTipoElemento)
        factory.registerFunction(FuncionesNodosControladores.getMarca)
        factory.registerFunction(FuncionesNodosControladores.getModelo)
        factory.registerFunction(FuncionesNodosControladores.getFabricante)
        factory.registerFunction(FuncionesNodosControladores.getTecnologia)
        factory.registerFunction(FuncionesNodosControladores.getTipoControl)
        factory.registerFunction(FuncionesPuntosAlimentacion.getTipoConexion)
        factory.registerFunction(FuncionesPuntosAlimentacion.getTipoAlimentacion)
        factory.registerFunction(FuncionesTramosLineas.getTipoConductor)
        factory.registerFunction(FuncionesTramosLineas.getTipoCable)
        factory.registerFunction(FuncionesTramosLineas.getTipoTendido)
        factory.registerFunction(FuncionesPuestas.getTipoSoporte)
        factory.registerFunction(FuncionesPuestas.getInterdistancia)
        factory.registerFunction(FuncionesPuestas.getAlturaSoporte)
        factory.registerFunction(FuncionesPuestas.getDistanciaCalzada)
        factory.registerFunction(FuncionesLuminarias.getMarcaLuminaria)
        factory.registerFunction(FuncionesLuminarias.getModeloLuminaria)
        factory.registerFunction(FuncionesLuminarias.getFabricanteLuminaria)
        factory.registerFunction(FuncionesLuminarias.getTipoControl)
        factory.registerFunction(FuncionesLuminarias.getInstalador)
        factory.registerFunction(FuncionesLuminarias.getColorCarcasa)
        factory.registerFunction(FuncionesLuminarias.getModeloBrazo)
        factory.registerFunction(FuncionesLuminarias.getTemperaturaColor)
        factory.registerFunction(FuncionesLuminarias.getTipologia)
        factory.registerFunction(FuncionesLuminarias.getTipoLampara)
        
    @staticmethod
    def setearRestricciones():
        FuncionesPuntosAlimentacion.setearRestricciones()
        FuncionesLuminarias.setearRestricciones()
        FuncionesPuestas.setearRestricciones()
        FuncionesTramosLineas.setearRestricciones()

