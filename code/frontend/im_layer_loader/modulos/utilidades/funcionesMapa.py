import os
import tempfile
from qgis.core import QgsPointXY
from qgis.core import QgsCoordinateReferenceSystem, QgsMapLayerStyle,QgsXmlUtils
from qgis.core import QgsMapLayerType
from qgis.core import QgsRectangle
from qgis.utils import iface
from qgis.core import QgsProject
from qgis.core import QgsRasterLayer

from ..properties.configProperties import ConfigProperties
from ..servicios.geoserverApi import GeoserverApi


class FuncionesMapa :

    @staticmethod
    def refrescarZoomCapasCanvas():
        epsg = int(ConfigProperties.getEPSG())
        QgsProject.instance().setCrs(QgsCoordinateReferenceSystem(epsg))

        # Coordenadas aproximadas del centro de Montevideo en EPSG:32721
        center_point = QgsPointXY(571304,6145224)

        # Obtenemos el canvas actual
        canvas = iface.mapCanvas()

        # Ajustar el zoom en torno a Montevideo
        extent = QgsRectangle(center_point.x() - 8000, center_point.y() - 8000, 
                            center_point.x() + 8000, center_point.y() + 8000)

        canvas.setExtent(extent)
        canvas.zoomScale(100000)

        # Refrescamos el canvas
        canvas.refresh()


    @staticmethod
    def setCapaSoloLectura(nombreCapa, readonly):
        qgs = QgsProject.instance()
        layer = qgs.mapLayersByName(nombreCapa)[0]
        layer.setReadOnly(readonly)


    @staticmethod
    def setVisibleCapaProyecto(nombreCapa, visible):
        qgs = QgsProject.instance()
        layer = qgs.mapLayersByName(nombreCapa)[0]
        qgs.layerTreeRoot().findLayer(layer.id()).setItemVisibilityChecked(visible)

    @staticmethod
    def setExpandedCapaProyecto(nombreCapa, expand):
        qgs = QgsProject.instance()
        layer = qgs.mapLayersByName(nombreCapa)[0]
        qgs.layerTreeRoot().findLayer(layer.id()).setExpanded(expand)

    @staticmethod
    def existeCapaProyecto(nombreCapa):
        qgs = QgsProject.instance()
        layers = qgs.mapLayersByName(nombreCapa)
        exist = True if layers else False
        return exist
    
    @staticmethod
    def existeGrupo(nombreGrupo):               
        root = QgsProject.instance().layerTreeRoot()
        existe = False
        for group in [child for child in root.children() if child.nodeType() == 0]:
            if group.name() == nombreGrupo:
                existe = True
        return existe
    
    @staticmethod
    def eliminaCapaProyecto(nombreCapa):
        qgs = QgsProject.instance()
        layers = qgs.mapLayersByName(nombreCapa)
        exist = True if layers else False
        if exist:
            layer = layers[0]
            qgs.removeMapLayers([layer.id()])

    @staticmethod
    def agregarCapaProyecto(layer):
        qgs = QgsProject.instance()
        qgs.addMapLayer(layer)

    @staticmethod
    def agregarCapaProyectoAGrupo(layer, grupo):
        qgs = QgsProject.instance()
        qgs.addMapLayer(layer, False)
        grupo.addLayer(layer)

    @staticmethod
    def agregarCapasBase(seccion, capa, grupo):
        url = ConfigProperties.getPropery(seccion, "url"+capa)
        nombreCapa = ConfigProperties.getPropery(seccion, "nombre"+capa)
        if not FuncionesMapa.existeCapaProyecto(nombreCapa):
            FuncionesMapa.cargaRasterLayerEnGrupo(url, nombreCapa, grupo)

    @staticmethod
    def eliminarCapasBase(cargaCapaBaseDict):
        # cargaCapaBaseDict: capa -> (seccion, seCarga) - ver ConfigProperties.getCapasBaseParaWorkspaces
        for capa, (seccion, seCarga) in cargaCapaBaseDict.items():
            nombreCapa = ConfigProperties.getPropery(seccion, "nombre"+capa)
            FuncionesMapa.eliminaCapaProyecto(nombreCapa)
        root = QgsProject.instance().layerTreeRoot()
        for group in [child for child in root.children() if child.nodeType() == 0]:
            if group.name() == 'Mapas base':
                root.removeChildNode(group)

    @staticmethod
    def activoCapaBase(cargaCapaBaseDict):
        #PRENDO LA PRIMERA CAPA BASE CONFIGURADA (Y TILDADA) QUE EXISTA EN EL PROYECTO -
        #EL ORDEN DE IMPORTANCIA ES EL ORDEN EN QUE APARECEN EN EL ARCHIVO DE CONFIG
        for capa, (seccion, seCarga) in cargaCapaBaseDict.items():
            if not seCarga:
                continue
            nombreCapa = ConfigProperties.getPropery(seccion, "nombre"+capa)
            if FuncionesMapa.existeCapaProyecto(nombreCapa):
                FuncionesMapa.setVisibleCapaProyecto(nombreCapa, True)
                break

    @staticmethod
    def cargaRasterLayer(url, nombreCapa):
        layer = QgsRasterLayer(url, nombreCapa, 'wms')
        if layer.isValid():
            FuncionesMapa.agregarCapaProyecto(layer)
            FuncionesMapa.setExpandedCapaProyecto(nombreCapa, False)
            FuncionesMapa.setVisibleCapaProyecto(nombreCapa, False)
        else:
            print("No se pudo cargar la capa: " + nombreCapa)
    
    @staticmethod
    def cargaRasterLayerEnGrupo(url, nombreCapa, grupo):
        layer = QgsRasterLayer(url, nombreCapa, 'wms')
        if layer.isValid():
            FuncionesMapa.agregarCapaProyectoAGrupo(layer, grupo)
            FuncionesMapa.setExpandedCapaProyecto(nombreCapa, False)
            FuncionesMapa.setVisibleCapaProyecto(nombreCapa, False)
        else:
            print("No se pudo cargar la capa: " + nombreCapa)

    @staticmethod
    def controlEstiloCapa(aplicacion, nombreCapa, urlGeoserver, userLogin, passLogin):
        layer = GeoserverApi.getLayerFromWorkspace(aplicacion, nombreCapa, urlGeoserver, userLogin, passLogin)
        retorno = None
        if layer is not None:
            vieneDefault = False
            vieneEstilo = False
            style = None
            try:
                if len(layer['layer']['styles']) > 0:
                    vieneEstilo = True
            except:
                vieneEstilo = False
            if vieneEstilo:
                listStyle = layer['layer']['styles']['style']
                if type(listStyle) == list:
                    style = listStyle[0]
                elif type(listStyle) == dict:
                    style = listStyle

            if not vieneEstilo:
                try:
                    if len(layer['layer']['defaultStyle']) > 0:
                        vieneDefault = True
                except:
                    vieneDefault = False
                if vieneDefault:
                    style = layer['layer']['defaultStyle']

            if vieneEstilo or vieneDefault:
                nameStyle = style.get("name")
                workspaceStyle = style.get("workspace")
                return workspaceStyle, nameStyle

        return retorno
    @staticmethod
    def cargarEstiloCapa(aplicacion, nombreCapa, urlGeoserver, userLogin, passLogin):
        #HAGO UN CONTROL PARA SABER SI LA CAPA TIENE ESTILO, SI ES POR DEFAULT O ESPECIFICO
        control = FuncionesMapa.controlEstiloCapa(aplicacion, nombreCapa, urlGeoserver, userLogin, passLogin)
        if control is not None:
            resultContent = None
            workspaceStyle = control[0]
            nameStyle = control[1]
            if workspaceStyle is not None:
                nameStyle = nameStyle.split(":")[1]
                #OBTENGO DE LA API DE GEOSERVER EL ESTILO DADO SU NOMBRE Y UN WORKSPACE
                resultContent = GeoserverApi.getSldStyleFromWorkspace(workspaceStyle, nameStyle, urlGeoserver, userLogin, passLogin)
            else:
                #OBTENGO DE LA API DE GEOSERVER EL ESTILO DADO SU NOMBRE
                resultContent = GeoserverApi.getSldStyle(nameStyle, urlGeoserver, userLogin, passLogin)

            if resultContent is not None:
                with tempfile.NamedTemporaryFile(suffix=".sld", delete=False) as f:
                    # Write the SLD data to the temporary file
                    f.write(resultContent)
                    # Get the path to the temporary file
                    temp_file_path = f.name

                layerLoad = QgsProject.instance().mapLayersByName(aplicacion+":"+nombreCapa)[0]
                layerLoad.loadSldStyle(temp_file_path)

                iface.layerTreeView().refreshLayerSymbology(layerLoad.id())

                #HAY COSAS EN LOS ESTILOS DEFINIDOS EN GEOSERVER QUE CUANDO LOS TRAEMOS A QGIS NO SON COMPATIBLES
                #the_geom no existe nunca en la capa, sino que se obtiene la geometria con $geometry

                # Obtiene el estilo de etiquetado de la capa
                estilo_etiquetado = layerLoad.labeling()
                if estilo_etiquetado is not None:
                    # Verifica si el estilo de etiquetado es rule-based labeling
                    if estilo_etiquetado.type() == 'rule-based':
                        # Obtiene las reglas de etiquetado
                        reglas_etiquetado = estilo_etiquetado.rootRule().children()
                        # Itera sobre las reglas de etiquetado para replazar the_geom si es que viene por $geometry
                        for regla in reglas_etiquetado:
                            regla.setFilterExpression(regla.filterExpression().replace('the_geom','$geometry'))

                layerLoad.triggerRepaint()