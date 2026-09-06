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

                    # CRS por capa (plan de soporte multi-CRS): el backend informa el epsg real de
                    # cada capa/workspace en "datos.epsg" (ver ConfigParser/DatosCapa). Si por algun
                    # motivo no vino (capa vieja sin recompilar, backend caido), se cae al default de
                    # instalacion en metadata.txt - nunca se asume 32721 a fuego.
                    epsgCapa = ConfigProperties.getEPSG()
                    if atributosCapa is not None:
                        tipo = atributosCapa["datos"]["tipo"]
                        if tipo is not None and tipo.upper() == "WMS":
                            esWFS=False
                        epsgCapa = atributosCapa["datos"].get("epsg") or epsgCapa

                    if esWFS:
                        # NOTA (5/9/2026): se probo "InvertAxisOrientation" acá para corregir un bug
                        # de orden de ejes en capas EPSG:4326 (WFS-T Insert declaraba
                        # srsName="urn:ogc:def:crs:EPSG::4326" - lat,lon segun spec de GeoServer -
                        # pero mandaba las coordenadas sin invertir). SE REVIRTIO: el mismo flag
                        # tambien afecta la LECTURA (GetFeature) via el parser GML de QGIS
                        # (qgsgml.cpp), y como las respuestas de lectura de este servidor usan un
                        # srsName distinto (forma "http://.../epsg.xml#4326", no URN), forzar el
                        # flag hacia terminaba invirtiendo datos de lectura que ya estaban bien -
                        # confirmado comparando esta capa cargada por el plugin vs. agregada nativa
                        # por QGIS (WFS/OGC API) contra el mismo servidor: la nativa se ve correcta,
                        # esta con el flag no.
                        #
                        # FIX REAL (5/9/2026): bug conocido y confirmado por QGIS mismo -
                        # https://github.com/qgis/QGIS/issues/57965 ("WFS-T 1.0 transactions to
                        # GeoServer have incorrect axis order when QGIS set to WFS 2.0 mode").//
                        # Con conexion WFS 2.0 (la que usa por defecto si no se fuerza version),
                        # QGIS cae a WFS-T 1.0 para las transacciones de escritura, que tiene
                        # reglas de eje distintas a WFS 1.1/2.0 - "las opciones de invertir eje no
                        # tienen ningun efecto en transacciones WFS-T 1.0 enviadas en modo WFS 2.0"
                        # (cita del propio reporte). El workaround oficial de QGIS: forzar version
                        # 1.1 en la conexion. "version" tiene que ir como parametro de nivel
                        # superior del QgsDataSourceUri (no embebido en el string de "url" - el
                        # proveedor WFS descarta ese valor sin leerlo, mismo problema que tuvo
                        # "srsname" antes).
                        wfs_url = urlGeoserver+urlWFS+"&srsname=EPSG:"+epsgCapa
                        dsu = QgsDataSourceUri()
                        dsu.setParam( 'url', wfs_url)
                        dsu.setParam( 'typename', capa)
                        dsu.setParam( 'version', '1.1.0')
                        dsu.setAuthConfigId(userLogin)
                        # creo la capa
                        layerToLoad = QgsVectorLayer(dsu.uri(), capa, "WFS")
                    else:
                        uri_config = {
                            "crs": "EPSG:"+epsgCapa,
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
        # cargaCapaBaseDict: capa -> (seccion, seCarga) - ver ConfigProperties.getCapasBaseParaWorkspaces
        FuncionesMapa.eliminarCapasBase(cargaCapaBaseDict)
        for capa, (seccion, seCarga) in cargaCapaBaseDict.items():
            if seCarga:
                root = QgsProject.instance().layerTreeRoot()
                if not FuncionesMapa.existeGrupo("Mapas base"):
                    grupoCapasBase = root.addGroup("Mapas base")
                    grupoCapasBase.setIsMutuallyExclusive(True)
                else:
                    grupoCapasBase = root.findGroup("Mapas base")
                FuncionesMapa.agregarCapasBase(seccion, capa, grupoCapasBase)
        #PRENDO UNA DE LAS CAPAS ACTIVAS SI ES QUE HAY
        FuncionesMapa.activoCapaBase(cargaCapaBaseDict)

    @staticmethod
    def cargaCapasProyecto(workSpacesSelected, userLogin, passLogin, cargaCapaBaseDict, sobreEscribirCapas):
        retorno=""
        cargaCapas = CargaCapasProyecto()
        for item in workSpacesSelected:
            workspace = item.text().lower()
            retorno += cargaCapas.__cargarCapasWorkspace(workspace, userLogin, passLogin, sobreEscribirCapas)
        
        cargaCapas.__cargarCapasBase(cargaCapaBaseDict)
        return retorno
