from PyQt5.QtCore import QSettings

from .plugineta.plugineta import Plugineta
from qgis.core import QgsProject, QgsExpression
import os
import shutil

from ..formularios.atributosFormulario import AtributosFormularios
from ..servicios import serviciosUbicacionesRestWEB
from ..servicios.serviciosCapas import ServiciosCapas
from ..utilidades.funcionesBusqueda import FuncionesBusqueda
from ..utilidades.funcionesExportacion import FuncionesExportacion
from ..utilidades.funcionesGenericas import FuncionesGenericas


class Aplicaciones:

    @staticmethod
    def procesarCapasAplicacion(*args):
        workspace = Aplicaciones.obtenerNombreClaseWorkspace(args[0])
        class_instance = None
        try:
            class_instance = globals()[workspace]()
        except:
            pass
        if class_instance is not None:
            if hasattr(class_instance, 'procesarCapasAplicacion'):
                class_instance.procesarCapasAplicacion(*args)
            else:
                print("No tenemos implementado el metodo procesarCapasAplicacion en la clase: " + workspace)
        else:
            print("No tenemos implementada la clase: " + workspace)

    @staticmethod
    def procesarAplicacion(*args):
        workspace = Aplicaciones.obtenerNombreClaseWorkspace(args[0])
        class_instance = None
        try:
            class_instance = globals()[workspace]()
        except:
            pass
        if class_instance is not None:
            if hasattr(class_instance, 'procesarAplicacion'):
                class_instance.procesarAplicacion(*args)
            else:
                print("No tenemos implementado el metodo procesarAplicacion en la clase: " + workspace)
        else:
            print("No tenemos implementada la clase: " + workspace)


    @staticmethod
    def cargarArchivoFunciones():
        nombreArchivo = 'serviciosUbicacionesRestWEB.py'
        # Define the path to your Python file
        thisfolder = os.path.dirname(os.path.abspath(__file__))
        origen_path = os.path.join(thisfolder, '../servicios/'+nombreArchivo)

        # Define the path to the expressions folder
        destino_path = os.path.join(thisfolder, '../../../../expressions/'+nombreArchivo)

        # Copy the file to the expressions folder
        shutil.copyfile(origen_path, destino_path)

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(AtributosFormularios.getCampoDefault)

    @staticmethod
    def agregarBusquedaUbicaciones():
        FuncionesGenericas.cargarMenuBarUtilidades(
                            "Busqueda Ubicaciones",
                            "BusquedaUbicaciones",
                            lambda: FuncionesBusqueda.funcionBusquedaUbicaciones())


    @staticmethod
    def agregarExportarLogs():
        FuncionesGenericas.cargarMenuBarUtilidades(
            "Exportar archivos Log" ,
            "ExportarArchivoLogs",
            lambda: FuncionesExportacion.exportarLogs())
            
    @staticmethod
    def completarConfigAplicaciones(*args):
        workspace = Aplicaciones.obtenerNombreClaseWorkspace(args[0])
        class_instance = None
        try:
            class_instance = globals()[workspace]()
        except:
            pass
        if class_instance is not None:
            if hasattr(class_instance, 'completarConfigAplicacion'):
                class_instance.completarConfigAplicacion(*args)
            else:
                print("No tenemos implementado el metodo completarConfigAplicacion en la clase: " + workspace)
        else:
            print("No tenemos implementada la clase: " + workspace)

    @staticmethod
    def obtenerNombreClaseWorkspace( workspace):
        # Divides el string en caso de que contenga un punto
        words = workspace.split(".")

        # Verificas si hay más de una palabra
        if len(words) > 1:
            # Aplicas capitalize() a cada palabra
            capitalized_words = [word.capitalize() for word in words]
            # Concatenas las palabras capitalizadas
            result = ''.join(capitalized_words)
        else:
            # Si solo hay una palabra, aplicas capitalize() a esa palabra
            result = workspace.capitalize()
        return result

    @staticmethod
    def existeCapaCargadaEnWorkspace(workspace):
        # Obtener todas las capas cargadas en el proyecto
        capas_cargadas = QgsProject.instance().mapLayers().values()

        # Verificar si alguna capa existe para dicho workspace
        hayCapas = False
        for capa in capas_cargadas:
            if workspace+":" in capa.name():
                hayCapas = True
                break
        return hayCapas
