from os import error

from qgis.PyQt import QtWidgets
from qgis.core import *
from qgis.gui import *

from PyQt5.QtWidgets import QProgressDialog, QMessageBox
from qgis.utils import iface

from .auxiliaresDfr import AuxiliaresDfr
from .calculadora_de_posiciones import CalculadoraDePosiciones
from .checkCircuito import CheckCircuito

from ...utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class FuncionesDfr:

    modificar_pos_sin_reordenar = False

    @staticmethod
    def disponibilizarFuncionesParaExpresiones():
        # Create a function factory and register the functions
        factory = QgsExpression()
        factory.registerFunction(FuncionesDfr.calcularPosicionDfr)
        factory.registerFunction(FuncionesDfr.getRegionDfr)
        factory.registerFunction(FuncionesDfr.getTipoPuntoLevanteDfr)

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getRegionDfr(feature, parent):
        regionActual = feature.attribute("REGION")
        region = 1 #Region Este
        if regionActual is not None:
            region = regionActual
        return region

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def getTipoPuntoLevanteDfr(feature, parent):
        tplActual= feature.attribute("TIPO_PUNTO_LEVANTE")
        tpl = 1 #CL
        if tplActual is not None:
            tpl = tplActual
        return tpl

    @qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
    def calcularPosicionDfr(feature, parent):
        nombreCapaPosicionesRecorrido = "dfr:E_DF_POSICIONES_RECORRIDO"
        nombreCapaRutasRecorrido = "dfr:E_DF_RUTAS_RECORRIDO"
        codRecorrido = feature.attribute("COD_RECORRIDO")
        posicionActual = feature.attribute("POSICION")

        geom = feature.geometry().asWkt()
        qgs_geom = QgsGeometry.fromWkt(geom)
        qgs_point = qgs_geom.asPoint()
        qgs_point_xy = QgsPointXY(qgs_point)
        posicion = 0
        if posicionActual is not None:
            posicion = int(posicionActual)
        else:
            try:
                logger.info(f"Se da de ALTA un punto. Se llama a calcularPosciones para Ruta: {codRecorrido}")
                calculadora = CalculadoraDePosiciones()
                posicion = calculadora.calcularPosicion(nombreCapaPosicionesRecorrido, nombreCapaRutasRecorrido, codRecorrido, qgs_point_xy )
                if posicion == -1:
                    logger.error(f'Error en "calcularPosicionDfr" al calcularPosicion. La posicion calculada fue -1. Retorno NULL')
                    posicion = None

            except Exception as error:
                posicion = None
                logger.error(f'Error en "calcularPosicionDfr" al calcularPosicion: {type(error).__name__} : {error}')
        return posicion

    @staticmethod
    def despuesAgregarPosicionesRecorrido(featureId):
        logger.info(f'Disparo Evento Alta: despuesAgregarPosicionesRecorrido - featureId: {featureId}')
        layerName="dfr:E_DF_POSICIONES_RECORRIDO"
        layer = QgsProject.instance().mapLayersByName(layerName)[0]
        feature = layer.getFeature(featureId)
        FuncionesDfr.desconectarFuncionesPosicionesRecorrido(layer)
        feature = AuxiliaresDfr.inicializoAtributosPosicionesRecorrido(feature)

        layer.updateFeature(feature)
        layer.triggerRepaint()

        #aca habria que llamar a la funcion que renumera
        reordenado = False
        codRecorrido = ""
        try:
            posicionNueva = 0

            if feature.attribute("POSICION") is not None:
                logger.info(f"Se llama a reordenar. Alta punto")
                posicionNueva = int(feature.attribute("POSICION"))
                codRecorrido = feature.attribute("COD_RECORRIDO")
                calculadora = CalculadoraDePosiciones()
                reordenado = calculadora.reordenarPuntosAlta(layerName, codRecorrido, posicionNueva)
                AuxiliaresDfr.marcarUltimaPosicionRecorridoPosicionesRecorrido(layerName, codRecorrido)
            else:
                logger.critical("Posicion obtenido del form igual a None")

        except Exception as error:
            reordenado = False
            mensaje_error = f'Error en "despuesAgregarPosicionesRecorrido": {type(error).__name__} : {error}'
            logger.error(mensaje_error)

        FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
        ok_commit = layer.commitChanges()

        if len(codRecorrido) > 0 and ok_commit:
            CheckCircuito.showCheckCircuitosSinOk(layer, codRecorrido)
        else:
            QMessageBox.critical(None, "Proceso de Alta Posicion Recorrido", "Se produjo un error al ordenar el recorrido.", QMessageBox.Ok)
            logger.error(f"No llamo a checkConsistenciaCircuito porque len(recorrido) es {len(codRecorrido)}")

        if not ok_commit:
            errs = layer.commitErrors()
            if len(errs) > 0:
                errs_msg = ', '.join(errs)
                logger.error("Errores" + f': {errs_msg}')

        else:
            logger.info("Commit ok")

        if not reordenado:
            QMessageBox.critical(None, "Proceso de Alta Posicion Recorrido", "Se produjo un error al ordenar el recorrido", QMessageBox.Ok)

        logger.info(f"Fin Evento Alta Pto: {FuncionesDfr.imprimirPosicionRecorrido(feature)}")

    @staticmethod
    def despuesBorrarPosicionesRecorrido(featureId):
        logger.info(f'Disparo Evento Baja: despuesBorrarPosicionesRecorrido(featureId:{featureId})')
        layerName="dfr:E_DF_POSICIONES_RECORRIDO"
        layer = QgsProject.instance().mapLayersByName(layerName)[0]
        feature = list(layer.dataProvider().getFeatures( QgsFeatureRequest( featureId ) ))[0]
        #aca habria que llamar a la funcion que renumera
        reordenado = False
        posicionNueva = -666
        try:
            if feature.attribute("POSICION") is not None:
                logger.info(f"Proceso BAJA de un punto. Se llama a reordenar.")
                posicionNueva = int(feature.attribute("POSICION"))
                codRecorrido = feature.attribute("COD_RECORRIDO")
                calculadora = CalculadoraDePosiciones()
                FuncionesDfr.desconectarFuncionesPosicionesRecorrido(layer)
                reordenado = calculadora.reordenarPuntosBaja(layerName, codRecorrido, posicionNueva)
                AuxiliaresDfr.marcarUltimaPosicionRecorridoPosicionesRecorrido(layerName, codRecorrido)
                FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
                layer.commitChanges()
        except Exception as error:
            mensaje_error = f'Error en "despuesBorrarPosicionesRecorrido": {type(error).__name__} : {error}. reordenado={reordenado}, posicionNueva={posicionNueva}, codRecorrido={codRecorrido}'
            reordenado = False
            logger.error(mensaje_error)

        if not reordenado:
            QMessageBox.critical(None, "Proceso Baja Posicion Recorrido", "Se produjo un error al ordenar el recorrido")
            logger.error(f'Error en <<despuesBorrarPosicionesRecorrido>> . reordenado={reordenado}, posicionNueva={posicionNueva}, codRecorrido={codRecorrido}')

    @staticmethod
    def before_commit_changes():
        logger.info(f'Dispara Evento before_commit_changes')

    @staticmethod
    def despuesModificarAtributosPosicionesRecorrido(featureId, idx, value):
        logger.info(f'Dispara Evento:Mod despuesModificarAtributosPosicionesRecorrido(featureId: {featureId}, idx:{idx}, value:{value})')
        try:
            layerName="dfr:E_DF_POSICIONES_RECORRIDO"
            layer = QgsProject.instance().mapLayersByName(layerName)[0]
            field_idx_fecha_hasta = layer.fields().indexFromName("FECHA_HASTA")
            field_idx_posicion = layer.fields().indexFromName("POSICION")

            if idx == field_idx_fecha_hasta:
                FuncionesDfr.desconectarFuncionesPosicionesRecorrido(layer)
                feature = layer.getFeature(featureId)
                posicion = int(feature.attribute("POSICION"))
                codRecorrido = feature.attribute("COD_RECORRIDO")

                feature = AuxiliaresDfr.bajaLogicaPosicionesRecorrido(feature)

                layer.updateFeature(feature)
                calculadora = CalculadoraDePosiciones()
                reordenado = calculadora.reordenarPuntosBaja(layerName, codRecorrido, posicion)
                AuxiliaresDfr.marcarUltimaPosicionRecorridoPosicionesRecorrido(layerName, codRecorrido)
                FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
                layer.commitChanges()

            if idx == field_idx_posicion:
                feature = layer.getFeature(featureId)
                posicionNueva = int(feature.attribute("POSICION"))
                gid = feature.attribute("GID")


                featureProvider = list(layer.dataProvider().getFeatures( QgsFeatureRequest( featureId ) ))[0]
                posicionVieja = int(featureProvider.attribute("POSICION"))
                if (posicionNueva < 1):
                    QtWidgets.QMessageBox.critical(None, "Error Posicion 0", "0 no es una POSICION aceptable.\nSi desea dar de baja el punto, basta con seleccionar un valor para FECHA_HASTA\ny el sistema le asignará 0 a POSICION ", QtWidgets.QMessageBox.Ok)
                    FuncionesDfr.desconectarFuncionesPosicionesRecorrido(layer)
                    layer.changeAttributeValue(featureId, idx, posicionVieja)

                    logger.critical(f"Se intenta asignar {posicionNueva} a la POSICION del punto de GID {gid} y poscicion {posicionVieja}. Accion cancelada")
                    FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
                else:
                    print(f"FuncionesDfr.modificar_pos_sin_reordenar: {FuncionesDfr.modificar_pos_sin_reordenar} evaluo ")
                    if not FuncionesDfr.modificar_pos_sin_reordenar:
                        response = QtWidgets.QMessageBox.information(None, "Modificacion", "Desea activar la modificación de posiciones automática", QtWidgets.QMessageBox.Yes|QtWidgets.QMessageBox.No)

                        if response == QMessageBox.Yes:
                            FuncionesDfr.desconectarFuncionesPosicionesRecorrido(layer)
                            logger.info(f"Se llama a reordenar. Update POSICION al punto de GID {gid}. Posicion vieja: {posicionVieja}, posicion nueva: {posicionNueva}")
                            codRecorrido = feature.attribute("COD_RECORRIDO")

                            calculadora = CalculadoraDePosiciones()
                            reordenado = calculadora.reordenarPuntosUpdate(layerName, codRecorrido, posicionNueva, gid)
                            FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
                            layer.commitChanges()
                            logger.info(f"Modificacion: ejecuto commit")
                        else:
                            print(f"voy a mano FuncionesDfr.modificar_pos_sin_reordenar: {FuncionesDfr.modificar_pos_sin_reordenar}")
                            FuncionesDfr.modificar_pos_sin_reordenar = True
                            logger.info(f"Modificacion: no llamo al reordenar")
                            pass


        except Exception as error:
            print(f"EXCEPCION SE QUEMO TODO @@@@@@@ {error}" )

    @staticmethod
    def on_before_rollback():
        logger.info("Disparo justo on_BEFORE_rollback")
        layerName="dfr:E_DF_POSICIONES_RECORRIDO"
        layer = QgsProject.instance().mapLayersByName(layerName)[0]
        FuncionesDfr.desconectarFuncionesPosicionesRecorrido(layer)
        logger.info("Disparo justo on_BEFORE_rollback termino")

    @staticmethod
    def on_after_rollback():
        logger.info("Disparo justo on_AFTER_rollback")
        layerName="dfr:E_DF_POSICIONES_RECORRIDO"
        layer = QgsProject.instance().mapLayersByName(layerName)[0]
        FuncionesDfr.conectarFuncionesPosicionesRecorrido(layer)
        FuncionesDfr.modificar_pos_sin_reordenar = False
        logger.info("Disparo justo on_AFTER_rollback termino")

    @staticmethod
    def on_committed_attribute_values_changes(layer_id, changed_attributes):
        print("Ejecuto Cambios de valores de atributos confirmados en la capa.")
        layerName="dfr:E_DF_POSICIONES_RECORRIDO"
        layer = QgsProject.instance().mapLayersByName(layerName)[0]

        recorridos = set()
        for fid, changes in changed_attributes.items():
            feature = layer.getFeature(fid)
            recorridos.add(feature.attribute("COD_RECORRIDO"))
        estructura_diseño = []
        for recorrido in recorridos:
            #(recorrdio, faltan, repetidos, mal)
            resul_check = CheckCircuito.checkConsistenciaCircuito(layer, recorrido)
            estructura_diseño.append(resul_check)

        FuncionesDfr.modificar_pos_sin_reordenar = False
        mensaje = CheckCircuito.generarMensageConsistenciaCircuito(estructura_diseño)
        if "OK" in mensaje:
            pass
        else:
            QtWidgets.QMessageBox.information(None, "Pluggineta", mensaje, QtWidgets.QMessageBox.Ok)


    @staticmethod
    def conectarFuncionesRollbackPosicionesRecorrido(layer):
        layer.beforeRollBack.connect(FuncionesDfr.on_before_rollback)
        layer.afterRollBack.connect(FuncionesDfr.on_after_rollback)

    @staticmethod
    def desconectarFuncionesRollbackPosicionesRecorrido(layer):
        layer.beforeRollBack.disconnect(FuncionesDfr.on_before_rollback)
        layer.afterRollBack.disconnect(FuncionesDfr.on_after_rollback)

    @staticmethod
    def conectarFuncionesPosicionesRecorrido(layer):
        layer.featureAdded.connect(FuncionesDfr.despuesAgregarPosicionesRecorrido)
        layer.featureDeleted.connect(FuncionesDfr.despuesBorrarPosicionesRecorrido)
        layer.attributeValueChanged.connect(FuncionesDfr.despuesModificarAtributosPosicionesRecorrido)
        layer.committedAttributeValuesChanges.connect(FuncionesDfr.on_committed_attribute_values_changes)

    @staticmethod
    def desconectarFuncionesPosicionesRecorrido(layer):
        try:
            layer.featureAdded.disconnect(FuncionesDfr.despuesAgregarPosicionesRecorrido)
        except Exception as error:
            logger.error(f'Error desconectando funcion featureAdded a la capa: {type(error).__name__} : {error}.')
        try:
            layer.featureDeleted.disconnect(FuncionesDfr.despuesBorrarPosicionesRecorrido)
        except Exception as error:
            logger.error(f'Error desconectando funcion featureDeleted a la capa: {type(error).__name__} : {error}.')
        try:
            layer.attributeValueChanged.disconnect(FuncionesDfr.despuesModificarAtributosPosicionesRecorrido)
        except Exception as error:
            logger.error(f'Error desconectando funcion attributeValueChanged a la capa: {type(error).__name__} : {error}.')
        try:
            layer.committedAttributeValuesChanges.disconnect(FuncionesDfr.on_committed_attribute_values_changes)
        except Exception as error:
            logger.error(f'Error desconectando funcion committedAttributeValuesChanges a la capa: {type(error).__name__} : {error}.')
        try:
            layer.beforeCommitChanges.disconnect(FuncionesDfr.before_commit_changes)
        except Exception as error:
            logger.error(f'Error desconectando funcion beforeCommitChanges a la capa: {type(error).__name__} : {error}.')

    @staticmethod
    def imprimirPosicionRecorrido(feature):

        resultado = ""
        # Lista de atributos específicos que queremos imprimir
        attributes = ['REGION','COD_RECORRIDO','POSICION','OBSERVACIONES',
                      'COD_MUNICIPIO','FECHA_DESDE','FECHA_HASTA','COD_MOTIVO_INACTIVA','TIPO_PUNTO_LEVANTE']

        attribute_pairs = []

        for attr in attributes:
            if attr in feature.fields().names():
                value = feature[attr]
                attribute_pairs.append(f"{attr}: {value}")
            else:
                attribute_pairs.append(f"{attr}: Campo no encontrado")

        resultado += ", ".join(attribute_pairs) + "\n"

        return resultado.strip()
