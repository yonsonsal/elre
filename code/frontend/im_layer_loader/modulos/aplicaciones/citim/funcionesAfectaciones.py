from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog
from qgis.utils import iface
from datetime import datetime

class FuncionesAfectaciones:
    
    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getVigente(feature, parent):
        datoActual = feature.attribute("vigente")
        dato = True
        if datoActual is not None:
            fecha_certificado = feature.attribute("fecha_certificado").toPyDateTime()
            # La fecha actual
            hoy = datetime.now()
            # Calcula la diferencia en días
            diferencia_dias = (hoy - fecha_certificado).days
            # Determina el valor de 'vigente' basado en la diferencia de días
            if diferencia_dias > 30:
                dato = False
            else:
                dato = datoActual
        return dato
    