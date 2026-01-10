from qgis.core import *
from qgis.gui import *
import gc
from PyQt5.QtWidgets import QMessageBox
from ...formularios.formulario import Formulario

class FuncionesGep:

    @staticmethod
    def armarRelacionesMaestroDetalle():
        Formulario.cargarCapaChild('gep:e_ep_papeleras','gid','gep:e_ep_inspeccion_papeleras','gid_papelera')
        Formulario.cargarCapaChild('gep:e_ep_relojes_termometros','gid','gep:e_ep_inspeccion_relojes','gid_reloj')
        Formulario.cargarCapaChild('gep:e_ep_soportes_bicicletas','gid','gep:e_ep_inspeccion_soportes_bicicletas','gid_soporte_bicicleta')
        #Formulario.cargarCapaChild('gep:e_ep_banios','gid','gep:e_ep_inspeccion_banios','gid_banio')
        Formulario.cargarCapaChild('gep:e_ep_bebederos','gid','gep:e_ep_inspeccion_bebederos','gid_bebedero')