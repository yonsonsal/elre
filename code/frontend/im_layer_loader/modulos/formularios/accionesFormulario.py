
import qgis
from qgis.core import *
from qgis.gui import *

from ..servicios.serviciosCapas import ServiciosCapas
from ..utilidades.funcionesExportacion import FuncionesExportacion
from ..utilidades.funcionesGenericas import FuncionesGenericas

class AccionesFormulario:
    
    @staticmethod
    def cargarAccionSubirArchivoImnube( nombreCapa, aplicacion):

        nombreAction = "Subir Archivo"
        #nombreCortoAction = "Asociar " + label + " a " + nombreCapa
        nombreCortoAction = "Subir Archivo"
        layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]

        actionManager = layer.actions()
        actions = actionManager.actions()
        if len(actions) > 0:
            for a in actions:
                if a.name() == nombreAction:
                    layer.actions().removeAction(a.id())

        nombreCapa = aplicacion + ":" + nombreCapa

        archivo_accion = "subirArchivoImnube.txt"
        nombreArchivo  = FuncionesGenericas.obtenerPathArchivoComand(archivo_accion)

        file1 = nombreArchivo
        fw = open(file1, 'r')
        text_comand = fw.read()
        text_comand = text_comand.replace("nombreCapa_a_remplazar", '\''+ nombreCapa + '\'')
        fw.close()

        #LAS VERSIONES NUEVAS DE QGIS >= 3.30 REQUIEREN SE PASE EL Qgis.AttributeActionType
        #LAS ANTERIORES VERSIONES < 3.30 REQUIEREN EL ENUMERADO
        try:
            actionType = Qgis.AttributeActionType.GenericPython
        except:
            actionType = 1

        objAction = QgsAction(actionType,
                              nombreAction,
                              text_comand,
                              None,
                              capture=False,
                              shortTitle=nombreCortoAction,
                              actionScopes={'Form', 'Canvas', 'Field', 'Feature'},
                              notificationMessage=''
                              )
        layer.actions().addAction(objAction)