from qgis.core import QgsVectorLayer, QgsRasterLayer
from qgis.core import QgsProject
from qgis.core import QgsDataSourceUri

from .aplicaciones.aplicaciones import Aplicaciones
from .seguridad.funcionesAutenticacion import FuncionesAutenticacion
from .servicios.geoserverApi import GeoserverApi
from .servicios.serviciosCapas import ServiciosCapas
from .utilidades.funcionesExportacion import FuncionesExportacion
from .utilidades.funcionesMapa import FuncionesMapa
from .properties.configProperties import ConfigProperties


class CargaCapasProyecto :

    def __cargarCapasWorkspace(self, aplicacion, userLogin, passLogin, sobreEscribirCapas):
        retorno = ""

        urlGeoserver = ConfigProperties.getPropery("Geoserver", "urlApi")
        urlWFS = ConfigProperties.getPropery("Geoserver", "urlComplementoWFS")

        #INVOCO LA API DE GEOSERVER PARA TRAERME LAS CAPAS DE UN WORKSPACE DETERMINADO
        layers = GeoserverApi.getLayersFromWorkspace(aplicacion, urlGeoserver, userLogin, passLogin)
        if layers is not None:
            FuncionesAutenticacion.cargarAutenticacionBasic(userLogin, passLogin)
            vieneMetadataWorkspace = False
            try:
                if len(layers['layers']['layer']) > 0:
                    vieneMetadataWorkspace = True
            except:
                vieneMetadataWorkspace = False
            if vieneMetadataWorkspace:
                cargoAlgunaCapa=False
                
                #ACA AGREGAMOS LA PARTE PARA ARMAR EL GRUPO POR WS
                root = QgsProject.instance().layerTreeRoot()
                if not FuncionesMapa.existeGrupo(aplicacion):
                    grupoCapasBase = root.addGroup(aplicacion) 
                    grupoCapasBase.setIsMutuallyExclusive(False)
                else:
                    grupoCapasBase = root.findGroup(aplicacion)
                grupoCapasBase.setExpanded(False)
                #FIN DE LOGICA PARA GRUPO
                
                for layer in layers['layers']['layer']:
                    nombreCapa = layer['name']
                    capa = aplicacion+":"+nombreCapa

                    atributosCapa = ServiciosCapas.obtenerAtributosCapa(userLogin, nombreCapa, aplicacion)
                    esWFS=True

                    if atributosCapa is not None:
                        tipo = atributosCapa["datos"]["tipo"]
                        if tipo is not None and tipo.upper() == "WMS":
                            esWFS=False

                    if esWFS:
                        wfs_url = urlGeoserver+urlWFS
                        dsu = QgsDataSourceUri()
                        dsu.setParam( 'url', wfs_url)
                        dsu.setParam( 'typename', capa)
                        dsu.setAuthConfigId(userLogin)
                        # creo la capa
                        layerToLoad = QgsVectorLayer(dsu.uri(), capa, "WFS")
                    else:
                        uri_config = {
                            "crs": "EPSG:32721",
                            "format": "image/png",
                            "layers": capa,
                            "url": urlGeoserver+"/wms",
                            "styles": None,
                        }
                        uri = QgsDataSourceUri()
                        for key, val in uri_config.items():
                            uri.setParam(key, val)
                        uri.setAuthConfigId(userLogin)

                        layerToLoad = QgsRasterLayer(str(uri.encodedUri(), "utf-8"), capa, "wms")
                        
                    # si la capa es valida la cargo
                    if layerToLoad.isValid():
                        if sobreEscribirCapas:
                            FuncionesMapa.eliminaCapaProyecto(capa)
                        if not FuncionesMapa.existeCapaProyecto(capa):
                            FuncionesMapa.agregarCapaProyectoAGrupo(layerToLoad, grupoCapasBase)
                            FuncionesMapa.setExpandedCapaProyecto(capa, False)

                            try:
                                visible = atributosCapa["visible"]
                            except:
                                visible = False
                            FuncionesMapa.setVisibleCapaProyecto(capa, visible)
                            #UNA VEZ AGREGADA LA CAPA, LE CARGO EL ESTILO DEFINIDO EN GEOSERVER
                            if esWFS:
                                FuncionesMapa.cargarEstiloCapa(aplicacion, nombreCapa, urlGeoserver, userLogin, passLogin)
                            #ACA LLAMARIA AL MODULO DE LAS APLICACIONES
                            Aplicaciones.procesarCapasAplicacion(aplicacion, capa)

                            if atributosCapa is not None and "pk" in atributosCapa:
                                FuncionesExportacion.cargarOpcionExportarCSV(aplicacion, capa, userLogin, atributosCapa)

                        cargoAlgunaCapa = True

                    # si la capa no es valida para el usuario anoto el mensaje
                    else:
                        retorno += "\n"+"El usuario " + userLogin + " no puede cargar la capa " + capa
                # si cargue alguna capa, borro el mensaje que venia guardando para no interrumpir el proceso
                if cargoAlgunaCapa:
                    Aplicaciones.procesarAplicacion(aplicacion)
                    retorno = ""
            else:
                retorno += "\n" + "No se pudo recuperar las capas del workspace " + aplicacion
        else:
            retorno += "\n" + "No se pudo recuperar las capas del workspace " + aplicacion
        return retorno



    def __cargarCapasBase(self, cargaCapaBaseDict):
        FuncionesMapa.eliminarCapasBase(cargaCapaBaseDict)                    
        for capaBase in cargaCapaBaseDict.items():
            capa = capaBase[0]
            seCarga = capaBase[1]
            if seCarga:
                root = QgsProject.instance().layerTreeRoot()
                if not FuncionesMapa.existeGrupo("Mapas base"):
                    grupoCapasBase = root.addGroup("Mapas base") 
                    grupoCapasBase.setIsMutuallyExclusive(True)
                else:
                    grupoCapasBase = root.findGroup("Mapas base")
                FuncionesMapa.agregarCapasBase(capa, grupoCapasBase)
        #PRENDO UNA DE LAS CAPAS ACTIVAS SI ES QUE HAY
        FuncionesMapa.activoCapaBase()

    @staticmethod
    def cargaCapasProyecto(workSpacesSelected, userLogin, passLogin, cargaCapaBaseDict, sobreEscribirCapas):
        retorno=""
        cargaCapas = CargaCapasProyecto()
        for item in workSpacesSelected:
            workspace = item.text().lower()
            retorno += cargaCapas.__cargarCapasWorkspace(workspace, userLogin, passLogin, sobreEscribirCapas)
        
        cargaCapas.__cargarCapasBase(cargaCapaBaseDict)
        return retorno
