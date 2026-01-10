from PyQt5.QtGui import QColor
from qgis._core import QgsPolygon, QgsSymbol
from qgis.utils import iface

from ..servicios import serviciosUbicacionesRestWEB
from PyQt5.QtCore import Qt, pyqtSignal
#SACO LO DE ABAJO
from PyQt5.uic.properties import QtCore
from qgis.core import QgsVectorLayer, QgsPointXY, QgsGeometry, QgsFeature, QgsMarkerSymbol, QgsSvgMarkerSymbolLayer, QgsSingleSymbolRenderer
from ..servicios.serviciosUbicacionesRestWEB import getCallesNombre, getEsquinasCalle, getPosicionEsquina, \
    getPosicionCalleNumero, getPadronGeometria, getPadronCentroide, getMunicipioGeometria, getMunicipioCentroide, \
    getMunicipios
from PyQt5.QtWidgets import QPushButton, QComboBox, QCompleter, QLineEdit, QMessageBox
from qgis.PyQt import QtWidgets
from PyQt5 import uic
#from qgis.PyQt import uic
from qgis.PyQt import QtCore
from qgis.PyQt.QtWidgets import QDialog
import os
from qgis.core import QgsProject, QgsRectangle
from .logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class FuncionesBusqueda:

    @staticmethod
    def obtenerCallesPorNombre(nombreCalle):
        try:
            callesDict = {}
            calles = getCallesNombre(nombreCalle)
            if calles is not None:
                for calle in calles:
                    callesDict[calle['codigo']] = calle['nombre']
                return callesDict
            else:
                return None
        except Exception as error:
            logger.error(f'Error generico red. En "obtenerCallesPorNombre" en funcionesBusqueda: {type(error).__name__} : {error}. nombreCalle: {nombreCalle}.')

    @staticmethod
    def obtenerEsquinasCalle(codVia, nombreEsquina):
        esquinasDict = {}
        esquinas = getEsquinasCalle(codVia, nombreEsquina)
        if esquinas is not None:
            for esquina in esquinas:
                esquinasDict[esquina['codigo']] = esquina['nombre']
            return esquinasDict
        else:
            return None

    @staticmethod
    def obtenerPosicionEsquina(codVia1, codVia2):
        posicion = getPosicionEsquina(codVia1, codVia2)
        if (posicion is not None) and ('geoJSON' in posicion):
            return posicion['geoJSON']['coordinates']
        else:
            return None

    @staticmethod
    def obtenerPosicionCalleNumero(codVia1, numeroPuerta):
        posicion = getPosicionCalleNumero(codVia1, numeroPuerta)
        if (posicion is not None) and ('geoJSON' in posicion):
            return posicion['geoJSON']['coordinates']
        else:
            return None

    @staticmethod
    def obtenerPadronGeometria(numeroPadron):
        poligono = getPadronGeometria(numeroPadron)
        if (poligono is not None) and ('geoJSON' in poligono):
            return poligono['geoJSON']['coordinates']
        else:
            return None

    @staticmethod
    def obtenerPadronCentroide(numeroPadron):
        centroide = getPadronCentroide(numeroPadron)
        if (centroide is not None) and ('geoJSON' in centroide):
            return centroide['geoJSON']['coordinates']
        else:
            return None

    @staticmethod
    def obtenerMunicipios():
        municipiosDict = {}
        municipios = getMunicipios()
        if municipios is not None:
            for mun in municipios:
                municipiosDict[mun['nombre']] = mun['nombre']
            return municipiosDict
        else:
            return None

    @staticmethod
    def obtenerMunicipioGeometria(municipio):
        poligono = getMunicipioGeometria(municipio)
        if (poligono is not None) and ('geoJSON' in poligono):
            return poligono['geoJSON']['coordinates']
        else:
            return None

    @staticmethod
    def obtenerMunicipioCentroide(municipio):
        centroide = getMunicipioCentroide(municipio)
        if (centroide is not None) and ('geoJSON' in centroide):
            return centroide['geoJSON']['coordinates']
        else:
            return None

    @staticmethod
    def dibujaBusquedaCalle(x, y):
        nombreCapa = "Busqueda"
        nombreGrupo = "Busquedas"
        qgs = QgsProject.instance()

        # Obtener el CRS (Sistema de Referencia de Coordenadas) del proyecto
        crs = qgs.crs()
        epsg_code = crs.authid()

        # Verificar si el grupo ya existe, si es así, lo eliminamos
        root = qgs.layerTreeRoot()
        group = root.findGroup(nombreGrupo)
        if group is not None:
            root.removeChildNode(group)

        # Crear nuevamente el grupo en la parte superior
        group = root.insertGroup(0, nombreGrupo)  # Insertar el grupo como el primero en la lista

        # Crear la capa en memoria
        layer = QgsVectorLayer("Point?crs=" + epsg_code, nombreCapa, "memory")
        QgsProject.instance().addMapLayer(layer, False)  # False para no añadir directamente a la raíz
        group.insertLayer(0, layer)  # Insertar la capa en el grupo

        # Obtener los id de las búsquedas anteriores y borrarlas si existen
        feature_ids = [feature.id() for feature in layer.getFeatures()]
        layer.dataProvider().deleteFeatures(feature_ids)

        # Crear el punto dado las coordenadas
        point = QgsPointXY(x, y)

        # Crear la geometría del feature desde el punto
        feature = QgsFeature()
        feature.setGeometry(QgsGeometry.fromPointXY(point))

        # Agregar el punto a la capa
        layer.dataProvider().addFeature(feature)

        # Establecer el ícono SVG para el punto
        thisfolder = os.path.dirname(os.path.abspath(__file__))
        pathIcon = os.path.join(thisfolder, '../../map_icon_marker.svg')
        
        # Crear una capa de símbolo SVG
        symbol_layer = QgsSvgMarkerSymbolLayer(pathIcon)
        symbol_layer.setSize(10)  # Ajustar el tamaño del marcador

        # Crear el símbolo usando la capa de símbolo
        symbol = QgsMarkerSymbol()
        symbol.changeSymbolLayer(0, symbol_layer)

        # Crear un renderizador con símbolo categorizado
        renderer = QgsSingleSymbolRenderer(symbol)
        layer.setRenderer(renderer)

        # Refrescar la capa
        layer.triggerRepaint()

        # Obtener el canvas del mapa
        map_canvas = iface.mapCanvas()

        # Calcular el extent dinámico alrededor del punto
        buffer_distance = 200  # Ajustar este valor según el nivel de zoom deseado
        extent = QgsRectangle(point.x() - buffer_distance, point.y() - buffer_distance,
                            point.x() + buffer_distance, point.y() + buffer_distance)

        # Ajustar el zoom dinámicamente según el extent del punto
        map_canvas.setExtent(extent)

        # Refrescar el canvas para actualizar la vista
        map_canvas.refresh()


    @staticmethod
    def dibujaBusquedaPolygon(coordenadas, centroideX, centroideY, zoomCentroide):
        nombreCapa = "Busqueda"
        nombreGrupo = "Busquedas"
        qgs = QgsProject.instance()

        # Get the CRS (Coordinate Reference System) of the project
        crs = qgs.crs()
        epsg_code = crs.authid()

        # Verificar si el grupo ya existe, si es así, lo eliminamos
        root = qgs.layerTreeRoot()
        group = root.findGroup(nombreGrupo)
        if group is not None:
            root.removeChildNode(group)

        # Crear nuevamente el grupo en la parte superior
        group = root.insertGroup(0, nombreGrupo)  # Insertar el grupo como el primero en la lista

        # Crear la capa en memoria
        layer = QgsVectorLayer("Polygon?crs=" + epsg_code, nombreCapa, "memory")
        QgsProject.instance().addMapLayer(layer, False)  # False para no añadir directamente a la raíz
        group.insertLayer(0, layer)  # Insertar la capa en el grupo

        # Obtener los id de las búsquedas anteriores y borrarlas si existen
        feature_ids = [feature.id() for feature in layer.getFeatures()]
        layer.dataProvider().deleteFeatures(feature_ids)

        # Crear la geometría del polígono
        polygon = QgsGeometry.fromPolygonXY([[QgsPointXY(pair[0], pair[1]) for pair in coordenadas]])

        # Crear el feature y agregar la geometría
        feature = QgsFeature()
        feature.setGeometry(polygon)
        layer.dataProvider().addFeature(feature)

        # Establecer el símbolo de la capa
        symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        fill_color = QColor(255, 0, 0)
        fill_color.setAlpha(80)
        symbol.setColor(fill_color)

        # Añadir el contorno
        stroke_color = QColor(236, 66, 66)
        stroke_width = 0.5
        symbol.symbolLayer(0).setStrokeColor(stroke_color)
        symbol.symbolLayer(0).setStrokeWidth(stroke_width)

        # Asignar el renderizador
        renderer = QgsSingleSymbolRenderer(symbol)
        layer.setRenderer(renderer)

        # Refrescar la capa
        layer.triggerRepaint()

        # Obtener el canvas del mapa
        map_canvas = iface.mapCanvas()

        # Obtener el extent dinámico del polígono
        extent = layer.extent()

        # Expandir ligeramente el extent para dar margen alrededor del polígono
        margin_factor = 0.10  # Un 10% de margen alrededor
        x_margin = (extent.xMaximum() - extent.xMinimum()) * margin_factor
        y_margin = (extent.yMaximum() - extent.yMinimum()) * margin_factor

        extent.setXMinimum(extent.xMinimum() - x_margin)
        extent.setXMaximum(extent.xMaximum() + x_margin)
        extent.setYMinimum(extent.yMinimum() - y_margin)
        extent.setYMaximum(extent.yMaximum() + y_margin)

        # Establecer el extent calculado en el canvas del mapa
        map_canvas.setExtent(extent)
        map_canvas.refresh()



    @staticmethod
    def funcionBusquedaUbicaciones():
        thisfolder = os.path.dirname(os.path.abspath(__file__))
        ui_file_path = os.path.join(thisfolder, '../../busquedas.ui')
        class CustomLineEdit(QLineEdit):
            enterPressed = pyqtSignal()  # Custom signal for "Enter" key press

            def __init__(self, parent=None):
                super().__init__(parent)

            def keyPressEvent(self, event):
                super().keyPressEvent(event)
                if event.key() == QtCore.Qt.Key_Enter or event.key() == QtCore.Qt.Key_Return:
                    self.enterPressed.emit()

        # Custom dialog class
        class MyFormDialog(QDialog):
            def keyPressEvent(self, event):
                if event.key() == QtCore.Qt.Key_Enter or event.key() == QtCore.Qt.Key_Return:
                    #NO QUIERO QUE SE LLAME AL ACCEPT()
                    pass
                else:
                    super().keyPressEvent(event)
            def __init__(self, parent=None):
                super(MyFormDialog, self).__init__(parent)
                # Load the .ui file into the dialog
                uic.loadUi(ui_file_path, self)

                self.cb_calles_tab1 = self.findChild(QComboBox, "cb_calles_tab1")
                self.le_nroPuerta = self.findChild(QLineEdit, "le_nroPuerta")
                self.cb_calles_tab2 = self.findChild(QComboBox, "cb_calles_tab2")
                self.cb_esquinas_tab2 = self.findChild(QComboBox, "cb_esquinas_tab2")
                self.le_nroPadron = self.findChild(QLineEdit, "le_nroPadron")
                self.cb_municipio_tab4 = self.findChild(QComboBox, "cb_municipio_tab4")

                municipios = FuncionesBusqueda.obtenerMunicipios()
                if municipios is not None:
                    for value, key in municipios.items():
                        self.cb_municipio_tab4.addItem(key, value)
                else:
                    QMessageBox.critical(None, "Obtener Municipios", "Se produjo un error en la red o en el servicio\nal obtener los Municipios", QMessageBox.Ok)

                self.buscar_dir_tab1.findChild(QPushButton, "buscar_dir_tab1")
                self.buscar_dir_tab1.clicked.connect(lambda: self.buscarDireccion(1))
                self.buscar_dir_tab2.findChild(QPushButton, "buscar_dir_tab2")
                self.buscar_dir_tab2.clicked.connect(lambda: self.buscarDireccion(2))
                self.buscar_pad_tab3.findChild(QPushButton, "buscar_pad_tab3")
                self.buscar_pad_tab3.clicked.connect(lambda: self.buscarPadron())
                self.buscar_mun_tab4.findChild(QPushButton, "buscar_mun_tab4")
                self.buscar_mun_tab4.clicked.connect(lambda: self.buscarMunicipio())

                line_edit_dir_tab1 = CustomLineEdit()
                completer_dir_tab1 = QCompleter({}, line_edit_dir_tab1)
                completer_dir_tab1.setCaseSensitivity(Qt.CaseInsensitive)
                completer_dir_tab1.setFilterMode(Qt.MatchContains)
                line_edit_dir_tab1.setCompleter(completer_dir_tab1)

                line_edit_dir_tab2 = CustomLineEdit()
                completer_dir_tab2 = QCompleter({}, line_edit_dir_tab2)
                completer_dir_tab2.setCaseSensitivity(Qt.CaseInsensitive)
                completer_dir_tab2.setFilterMode(Qt.MatchContains)
                line_edit_dir_tab2.setCompleter(completer_dir_tab2)

                line_edit_esq_tab2 = CustomLineEdit()
                completer_esq_tab2 = QCompleter({}, line_edit_esq_tab2)
                completer_esq_tab2.setCaseSensitivity(Qt.CaseInsensitive)
                completer_esq_tab2.setFilterMode(Qt.MatchContains)
                line_edit_esq_tab2.setCompleter(completer_esq_tab2)

                self.cb_calles_tab1.setLineEdit(line_edit_dir_tab1)
                self.cb_calles_tab1.setFocus()
                self.cb_calles_tab2.setLineEdit(line_edit_dir_tab2)
                self.cb_esquinas_tab2.setLineEdit(line_edit_esq_tab2)

                # Connect the custom signal to a specific action
                line_edit_dir_tab1.enterPressed.connect(lambda: self.on_enter_pressed(1))
                line_edit_dir_tab2.enterPressed.connect(lambda: self.on_enter_pressed(2))
                line_edit_esq_tab2.enterPressed.connect(lambda: self.on_enter_pressed(3))

            def on_enter_pressed(self, opcion):
                #opcion 1 me llaman de line_edit_dir_tab1
                #opcion 2 me llaman de line_edit_dir_tab2
                #opcion 3 me llaman de line_edit_esq_tab2
                try:
                    if opcion == 1:
                        text_input = self.cb_calles_tab1.lineEdit().text()
                        direcciones = FuncionesBusqueda.obtenerCallesPorNombre(text_input)
                        if direcciones is not None:
                            if len(direcciones) > 0:
                                line_edit_dir_tab1 = CustomLineEdit()
                                completer_dir_tab1 = QCompleter(list(direcciones.values()), line_edit_dir_tab1)
                                completer_dir_tab1.setCaseSensitivity(Qt.CaseInsensitive)
                                completer_dir_tab1.setFilterMode(Qt.MatchContains)
                                line_edit_dir_tab1.setCompleter(completer_dir_tab1)
                                line_edit_dir_tab1.enterPressed.connect(lambda: self.on_enter_pressed(1))
                                self.cb_calles_tab1.setLineEdit(line_edit_dir_tab1)
                                self.cb_calles_tab1.clear()
                                for value, key in direcciones.items():
                                    self.cb_calles_tab1.addItem(key, value)

                            else:
                                self.cb_calles_tab1.clear()
                                QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "No se han econtrado resultados para " + text_input)
                        else:
                            QMessageBox.critical(None, "Conexion con servicios", "Se produjo un error en la red o en el servicio web", QMessageBox.Ok)

                    elif opcion == 2:
                        text_input = self.cb_calles_tab2.lineEdit().text()
                        direcciones = FuncionesBusqueda.obtenerCallesPorNombre(text_input)
                        if direcciones is not None:
                            if len(direcciones) > 0:
                                line_edit_dir_tab2 = CustomLineEdit()
                                completer_dir_tab2 = QCompleter(list(direcciones.values()), line_edit_dir_tab2)
                                completer_dir_tab2.setCaseSensitivity(Qt.CaseInsensitive)
                                completer_dir_tab2.setFilterMode(Qt.MatchContains)
                                line_edit_dir_tab2.setCompleter(completer_dir_tab2)
                                line_edit_dir_tab2.enterPressed.connect(lambda: self.on_enter_pressed(2))
                                self.cb_calles_tab2.setLineEdit(line_edit_dir_tab2)
                                self.cb_calles_tab2.clear()
                                for value, key in direcciones.items():
                                    self.cb_calles_tab2.addItem(key, value)
                            else:
                                self.cb_calles_tab2.clear()
                                QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "No se han econtrado resultados para " + text_input)
                        else:
                            QMessageBox.critical(None, "Conexion con servicios", "Se produjo un error en la red o en el servicio web", QMessageBox.Ok)
                    else:
                        codVia1 = self.cb_calles_tab2.currentData()
                        text_input = self.cb_esquinas_tab2.lineEdit().text()
                        if codVia1 is not None:
                            # VER SI ES NONE
                            direcciones = FuncionesBusqueda.obtenerEsquinasCalle(codVia1, text_input)
                            if direcciones is not None:
                                if len(direcciones) > 0:
                                    line_edit_esq_tab2 = CustomLineEdit()
                                    completer_esq_tab2 = QCompleter(list(direcciones.values()), line_edit_esq_tab2)
                                    completer_esq_tab2.setCaseSensitivity(Qt.CaseInsensitive)
                                    completer_esq_tab2.setFilterMode(Qt.MatchContains)
                                    line_edit_esq_tab2.setCompleter(completer_esq_tab2)
                                    line_edit_esq_tab2.enterPressed.connect(lambda: self.on_enter_pressed(3))
                                    self.cb_esquinas_tab2.setLineEdit(line_edit_esq_tab2)
                                    self.cb_esquinas_tab2.clear()
                                    for value, key in direcciones.items():
                                        self.cb_esquinas_tab2.addItem(key, value)
                                else:
                                    self.cb_esquinas_tab2.clear()
                                    QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "No se han econtrado resultados para:\nCodVia: " + str(codVia1) + ":\nEsquina " + text_input)
                            else:
                                QMessageBox.critical(None, "Conexion con servicios", "Se produjo un error en la red o en el servicio web", QMessageBox.Ok)
                        else:
                            self.cb_esquinas_tab2.clear()
                            QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "Debe ingresar nombre de calle ")
                except Exception as error:
                    logger.error(f'Error generico red. En "presion enter" en funcionesbusqueda: {type(error).__name__} : {error}')


            def buscarDireccion(self, tab):
                x = 0.0
                y = 0.0
                if tab == 1:
                    codVia1 = self.cb_calles_tab1.currentData()
                    nroPuerta = self.le_nroPuerta.text()
                    if codVia1 is not None and nroPuerta != "":
                        posicion = FuncionesBusqueda.obtenerPosicionCalleNumero(codVia1, nroPuerta)
                        if posicion is not None:
                            x = posicion[0]
                            y = posicion[1]
                        else:
                            QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "No se han econtrado resultados para:\nCodVia: "+ str(codVia1) + "\nNroPuerta: " + str(nroPuerta))
                    else:
                        QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "Debe ingresar Calle y Nro. Puerta")
                else:
                    codVia1 = self.cb_calles_tab2.currentData()
                    codVia2 = self.cb_esquinas_tab2.currentData()
                    if codVia1 is not None and codVia2 is not None:
                        posicion = FuncionesBusqueda.obtenerPosicionEsquina(codVia1, codVia2)
                        if posicion is not None:
                            x = posicion[0]
                            y = posicion[1]
                        else:
                            QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "No se han econtrado resultados para:\nCodVia1: "+ str(codVia1) + "\nCodVia2: " + str(codVia2))
                    else:
                        QtWidgets.QMessageBox.information(None, "Busqueda Direcciones", "Debe ingresar Calle y Esquina")
                if x > 0.0 and y > 0.0:
                    FuncionesBusqueda.dibujaBusquedaCalle(x, y)
                    self.close()

            def buscarPadron(self):
                x = 0.0
                y = 0.0
                coordenadas = {}
                nroPadron = self.le_nroPadron.text()
                if nroPadron != "":
                    coordenadas = FuncionesBusqueda.obtenerPadronGeometria(nroPadron)
                    if coordenadas is not None and len(coordenadas) > 0:
                        coordenadas = coordenadas[0]
                        centroide = FuncionesBusqueda.obtenerPadronCentroide(nroPadron)
                        if centroide is not None:
                            x = centroide[0]
                            y = centroide[1]
                        else:
                            QtWidgets.QMessageBox.information(None, "Busqueda Padron", "No se han econtrado resultados para:\nPadron: "+ str(nroPadron))
                    else:
                        QtWidgets.QMessageBox.information(None, "Busqueda Padron", "No se han econtrado resultados para:\nPadron: "+ str(nroPadron))
                else:
                    QtWidgets.QMessageBox.information(None, "Busqueda Padron", "Debe ingresar Nro. Padron")

                if x > 0.0 and y > 0.0:
                    FuncionesBusqueda.dibujaBusquedaPolygon(coordenadas, x, y, True)
                    self.close()

            def buscarMunicipio(self):
                x = 0.0
                y = 0.0
                coordenadas = {}
                municipio = self.cb_municipio_tab4.currentData()
                if municipio is not None:
                    if municipio != "":
                        coordenadas = FuncionesBusqueda.obtenerMunicipioGeometria(municipio)
                        if coordenadas is not None and len(coordenadas) > 0:
                            coordenadas = coordenadas[0]
                            centroide = FuncionesBusqueda.obtenerMunicipioCentroide(municipio)
                            if centroide is not None:
                                x = centroide[0]
                                y = centroide[1]
                            else:
                                QtWidgets.QMessageBox.information(None, "Busqueda Municipio", "No se han econtrado resultados para:\nMunicipio: " + municipio)
                        else:
                            QtWidgets.QMessageBox.information(None, "Busqueda Municipio", "No se han econtrado resultados para:\nMunicipio: " + municipio)
                    else:
                        QtWidgets.QMessageBox.information(None, "Busqueda Municipio", "Debe ingresar Municipio")
                else:
                    QMessageBox.critical(None, "Buscar Municipios", "Se produjo un error en la red o en el servicio\nal obtener los Municipios", QMessageBox.Ok)

                if x > 0.0 and y > 0.0:
                    FuncionesBusqueda.dibujaBusquedaPolygon(coordenadas, x, y, False)
                    self.close()

        # Create an instance of the dialog
        form_dialog = MyFormDialog()

        # Show the dialog
        form_dialog.exec_()