from qgis.core import *
from qgis.gui import *
from qgis.PyQt import QtWidgets
import time
import logging
from PyQt5.QtWidgets import QProgressDialog, QMessageBox

from .funcionesFerias import FuncionesFerias


class FuncionesSfm:

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesFerias.calcularBarrioFeria)
        factory.registerFunction(FuncionesFerias.getResponsableFeria)
        factory.registerFunction(FuncionesFerias.getNumeroFeria)
        factory.registerFunction(FuncionesFerias.getDiaFeria)
        factory.registerFunction(FuncionesFerias.getAmbitoTerritorialFeria)
        factory.registerFunction(FuncionesFerias.getTipoFeria)
        factory.registerFunction(FuncionesFerias.getHoraArmadoFeria)
        factory.registerFunction(FuncionesFerias.getHoraComienzoFeria)
        factory.registerFunction(FuncionesFerias.getHoraFinFeria)
        factory.registerFunction(FuncionesFerias.getHoraLevantadoFeria)
       
        
    @staticmethod
    def setearRestricciones():
        ferias = QgsProject.instance().mapLayersByName("sfm:e_sf_feria")[0]
                
        field_idx1 = ferias.fields().indexFromName("NRO_FERIA")        
        ferias.setConstraintExpression(field_idx1, "NRO_FERIA > 0 AND NRO_FERIA < 100")
    
    @staticmethod
    def despuesAgregarFeria(featureId):
        try:
            layerName="sfm:e_sf_feria"
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            
            feature = layer.getFeature(featureId)
            if feature.attribute("GID") is not None:
                gid = feature.attribute("GID")
            else:
                gid = 0
            nro = int(feature.attribute("NRO_FERIA"))
            tipo = int(feature.attribute("COD_TIPO"))
            responsable = feature.attribute("COD_RESPONSABLE")
            dia = int(feature.attribute("COD_DIA"))
            comunal = int(feature.attribute("COD_COMUNAL"))
            codigo = str(responsable)+str(dia)
            if comunal < 10:
                codigo = codigo+"0"+str(comunal)
            else:
                codigo = codigo+str(comunal)
            if nro < 10:
                codigo = codigo+"0"+str(nro)
            else:
                codigo = codigo+str(nro)
                
            for feria in layer.getFeatures():
                if feria["GID"] != gid and feria["COD_FERIA"] == codigo and int(feria["COD_TIPO"]) == tipo:
                    QtWidgets.QMessageBox.information(None, "Plugineta", "Ya existe una feria para los datos ingresados, se duplica código.", QtWidgets.QMessageBox.Ok)
                    break          
                
            feature.setAttribute("COD_FERIA", codigo)
            layer.updateFeature(feature)

        except Exception as error:
            print(f"{error}" )    
    
    
    @staticmethod
    def despuesModificarAtributosFeria(featureId, idx, value):
        try:
            layerName="sfm:e_sf_feria"
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            field_idx_nro_feria = layer.fields().indexFromName("NRO_FERIA")
            field_idx_cod_comunal = layer.fields().indexFromName("COD_COMUNAL")
            field_idx_cod_responsable = layer.fields().indexFromName("COD_RESPONSABLE")
            field_idx_cod_dia = layer.fields().indexFromName("COD_DIA")

            if idx == field_idx_nro_feria or idx == field_idx_cod_comunal or idx == field_idx_cod_responsable or idx == field_idx_cod_dia:
            
                feature = layer.getFeature(featureId)
                nro = int(feature.attribute("NRO_FERIA"))
                tipo = int(feature.attribute("COD_TIPO"))
                gid = feature.attribute("GID")
                responsable = feature.attribute("COD_RESPONSABLE")
                dia = int(feature.attribute("COD_DIA"))
                comunal = int(feature.attribute("COD_COMUNAL"))
                codigo = str(responsable)+str(dia)
                if comunal < 10:
                    codigo = codigo+"0"+str(comunal)
                else:
                    codigo = codigo+str(comunal)
                if nro < 10:
                    codigo = codigo+"0"+str(nro)
                else:
                    codigo = codigo+str(nro)
                
                for feria in layer.getFeatures():
                    if feria["GID"] != gid and feria["COD_FERIA"] == codigo and int(feria["COD_TIPO"]) == tipo:
                        QtWidgets.QMessageBox.information(None, "Plugineta", "Ya existe una feria para los datos ingresados, se duplica código.", QtWidgets.QMessageBox.Ok)
                        break          
                
                feature.setAttribute("COD_FERIA", codigo)
                layer.updateFeature(feature)
                
        except Exception as error:
            print(f"{error}" )
        
    @staticmethod
    def conectarFuncionesFerias(layer):
        layer.featureAdded.connect(FuncionesSfm.despuesAgregarFeria)          
        layer.attributeValueChanged.connect(FuncionesSfm.despuesModificarAtributosFeria)
    
              
