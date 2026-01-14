from qgis.core import *
from qgis.gui import *
import time
from PyQt5.QtWidgets import QProgressDialog, QMessageBox

from ...formularios.atributosFormulario import AtributosFormularios
from ...utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class FuncionesUccriu:

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
         # Create a function factory and register the functions
         factory = QgsExpression()
        
        
    @staticmethod
    def despuesAgregarModObrasProgramadas(featureId, idx, value):
         layerName="uccriu:e_v_uccriu_obras_programadas"
         layerOP = QgsProject.instance().mapLayersByName(layerName)[0]
         feature = layerOP.getFeature(featureId)
         nro_remocion = feature.attribute("NRO_REMOCION")
        
         expOP = QgsExpression(f"NRO_REMOCION = '{nro_remocion}'")
         requestOP = QgsFeatureRequest(expOP).setSubsetOfAttributes(['NRO_REMOCION'], layerOP.fields() )
        
         if next(layerOP.getFeatures(requestOP)) is not None:
              logger.error(f"Ya existe nro remocion")
              QMessageBox.critical(None, "Proceso de Alta Obras Programadas", "Ya existe un elemento con este numero de remocion", QMessageBox.Ok)   
              edit_buffer = layerOP.undoStack()
              if undo_stack is not None:
                   undo_stack.undo()          
    
    @staticmethod
    def conectarFuncionesAddOrModifyObrasProg(layer):
         layer.featureAdded.connect(FuncionesUccriu.despuesAgregarModObrasProgramadas)
         layer.attributeValueChanged.connect(FuncionesUccriu.despuesAgregarModObrasProgramadas)    
           
        
    @staticmethod
    def filtrarDescripcionRemocion():
         time.sleep(30)
         layerName = 'uccriu:e_v_uccriu_obras_emergencia' 
         capaCodiguera = 'uccriu:c_v_fu_ubic_tipo_remocion' 
         field = 'NRO_REMOCION' 
         pk = 'NRO_REMOCION' 
         value = 'UBIC_TREM' 
         desc = '' 
         filter = "CASE WHEN current_value('NRO_OBRA') IS NOT NULL AND current_value('NRO_OBRA') <> '' AND current_value('NRO_PERMISO') IS NOT NULL AND current_value('NRO_PERMISO') <> '' THEN current_value('NRO_OBRA') = attribute( $currentfeature, 'NRO_OBRA' ) AND current_value('NRO_PERMISO') = attribute( $currentfeature, 'NRO_PERMISO' ) WHEN (current_value('NRO_PERMISO') IS NULL OR current_value('NRO_PERMISO') = '') THEN current_value('NRO_OBRA') = attribute( $currentfeature, 'NRO_OBRA') ELSE current_value('NRO_PERMISO') = attribute( $currentfeature, 'NRO_PERMISO') END"         
         AtributosFormularios.cargaCodigueraAtributoCapa(layerName, capaCodiguera, field, pk, value, desc, filter, False)
         
         layerName = 'uccriu:e_v_uccriu_obras_programadas' 
         capaCodiguera = 'uccriu:c_v_fu_ubic_tipo_lineas_remocion' 
         field = 'NRO_REMOCION' 
         pk = 'NRO_REMOCION' 
         value = 'UBIC_TREM' 
         desc = '' 
         filter = "CASE WHEN current_value('NRO_OBRA') IS NOT NULL AND current_value('NRO_OBRA') <> '' AND current_value('NRO_PERMISO') IS NOT NULL AND current_value('NRO_PERMISO') <> '' THEN current_value('NRO_OBRA') = attribute( $currentfeature, 'NRO_OBRA' ) AND current_value('NRO_PERMISO') = attribute( $currentfeature, 'NRO_PERMISO' ) WHEN (current_value('NRO_PERMISO') IS NULL OR current_value('NRO_PERMISO') = '') THEN current_value('NRO_OBRA') = attribute( $currentfeature, 'NRO_OBRA') ELSE current_value('NRO_PERMISO') = attribute( $currentfeature, 'NRO_PERMISO') END"       
         AtributosFormularios.cargaCodigueraAtributoCapa(layerName, capaCodiguera, field, pk, value, desc, filter, False)
         
         layerName = 'uccriu:e_v_uccriu_obras_programadas_puntos' 
         capaCodiguera = 'uccriu:c_v_fu_ubic_tipo_remocion_prog' 
         field = 'NRO_REMOCION' 
         pk = 'NRO_REMOCION' 
         value = 'UBIC_TREM' 
         desc = '' 
         filter = "CASE WHEN current_value('NRO_OBRA') IS NOT NULL AND current_value('NRO_OBRA') <> '' AND current_value('NRO_PERMISO') IS NOT NULL AND current_value('NRO_PERMISO') <> '' THEN current_value('NRO_OBRA') = attribute( $currentfeature, 'NRO_OBRA' ) AND current_value('NRO_PERMISO') = attribute( $currentfeature, 'NRO_PERMISO' ) WHEN (current_value('NRO_PERMISO') IS NULL OR current_value('NRO_PERMISO') = '') THEN current_value('NRO_OBRA') = attribute( $currentfeature, 'NRO_OBRA') ELSE current_value('NRO_PERMISO') = attribute( $currentfeature, 'NRO_PERMISO') END"      
         AtributosFormularios.cargaCodigueraAtributoCapa(layerName, capaCodiguera, field, pk, value, desc, filter, False)
         

