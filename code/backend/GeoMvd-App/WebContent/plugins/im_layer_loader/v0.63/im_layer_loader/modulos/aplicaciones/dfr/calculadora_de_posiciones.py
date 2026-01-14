
from qgis.PyQt.QtCore import QSettings, QTranslator, QCoreApplication, QVariant
from qgis.PyQt import QtWidgets
from qgis.PyQt.QtGui import QIcon
from qgis.PyQt.QtWidgets import QAction
from qgis._core import QgsMessageLog
from PyQt5.QtWidgets import QMessageBox, QProgressDialog
from qgis.core import Qgis, QgsWkbTypes, QgsPointXY, QgsMapLayerType, QgsGeometry, QgsProject, QgsFeature, QgsVectorLayer, QgsField, QgsLineString, QgsFeatureRequest, QgsExpression

from qgis.analysis import *

from qgis.core import (QgsProcessing,
                       QgsProcessingAlgorithm,
                       QgsProcessingException,
                       QgsProcessingOutputNumber,
                       QgsProcessingParameterDistance,
                       QgsProcessingParameterFeatureSource,
                       QgsProcessingParameterVectorDestination,
                       QgsProcessingParameterRasterDestination)

from qgis import processing
from qgis.utils import iface

from ...utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class CalculadoraDePosiciones:


    #########################################################

    def auxiliarVerFeature(self, nombre_capa, tipo, feat, visible):
        capaAuxiliar = QgsVectorLayer(tipo + "?crs=EPSG:32721", nombre_capa, "memory")
        provider = capaAuxiliar.dataProvider()

        feature = QgsFeature()
        feature.setGeometry(feat.geometry())
        provider.addFeatures([feature])
        QgsProject.instance().addMapLayer(capaAuxiliar, visible)

    #########################################################

    def auxiliarVerGeometria(self, nombre_capa, tipo, geometria, visible):
        capaAuxiliar = QgsVectorLayer(tipo + "?crs=EPSG:32721", nombre_capa, "memory")
        provider = capaAuxiliar.dataProvider()

        feature = QgsFeature()
        feature.setGeometry(geometria)
        provider.addFeatures([feature])

        return capaAuxiliar

    #########################################################

    def limpiarCapasEnMemoria(self):
        for layer in QgsProject.instance().mapLayers().values():
            # Comprobar si la capa es una capa en memoria
            if layer.type() == QgsMapLayerType.VectorLayer and layer.dataProvider().name() == 'memory':
                # Quitar la capa del proyecto
                QgsProject.instance().removeMapLayer(layer)

    #########################################################

    def eliminarCapaEnMemoria(self, nombre_capa):
        try:
            layer = QgsProject.instance().mapLayersByName(nombre_capa)[0]
            # Remover la capa del proyecto
            QgsProject.instance().removeMapLayer(layer.id())
        except IndexError as error:
            pass
            #logger.error(f'Error en "eliminarCapaEnMemoria": {type(error).__name__} : {error}')
            #no borro nada

    #########################################################

    def verCapasEnMemory(self):
        print("Hay capas")
        print("Hay capas en memoria -> ", QgsProject.instance().mapLayers().values())
        capas_memoria = [capa for capa in QgsProject.instance().mapLayers().values() if capa.dataProvider().name() == 'memory']
        for capa in capas_memoria:
            print(capa.name())
        print("Si hay capas se imprimieros")

    #########################################################

    def obtenerFeatureDeCapaPorAtr(self, capa, atr, atr_valor):

        layer = QgsProject.instance().mapLayersByName(capa)[0]
        #for feture in layer_befferPorSeg.getFeatures():
        field_name = atr  # Nombre del atributo a filtrar
        field_value = atr_valor

        expPos = QgsExpression(f"{field_name} = '{field_value}'")

        request = QgsFeatureRequest(expPos)
        for feature in layer.getFeatures(request):
            return feature

            #########################################################

    def crearVerticesDeUnRecorrido(self):
        self.cap_vertices = QgsVectorLayer("Point?crs=EPSG:32721", "Vertices", "memory")

        field = QgsField("ID", QVariant.Int)
        self.cap_vertices.dataProvider().addAttributes([field])
        self.cap_vertices.updateFields()

        layer = QgsProject.instance().mapLayersByName(self.nomCapaRecorridoVigente)[0]
        expPosR = QgsExpression(f"FECHA_HASTA IS NULL AND NOM_RUT = '{self.nom_rut}'")
        requestPosR = QgsFeatureRequest(expPosR)

        for feature in layer.getFeatures(requestPosR):
            lin = feature
            break

        for i, vertex in enumerate(lin.geometry().asPolyline()):
            feature = QgsFeature()
            point = QgsPointXY(vertex.x(), vertex.y())
            feature.setGeometry(QgsGeometry.fromPointXY(point))
            feature.setAttributes([i])
            self.cap_vertices.dataProvider().addFeatures([feature])

    #########################################################

    def crearSegmentosConVertices(self):

        layerVer = self.cap_vertices

        self.cap_segmentosV = QgsVectorLayer("LineString?crs=EPSG:32721", "SegmentosV", "memory")
        provider = self.cap_segmentosV.dataProvider()
        field = QgsField("ID", QVariant.Int)
        provider.addAttributes([field])
        self.cap_segmentosV.updateFields()

        featuresV = [f for f in layerVer.getFeatures()]

        # Ordena la lista de características por un atributo
        featuresV.sort(key=lambda x: x.attribute("ID"))
        point1 = QgsFeature()
        point2 = QgsFeature()

        for i, featureV in enumerate(featuresV):
            #print("El número es ", i)
            if i == 0:
                #print("El número es par")
                point1 = QgsFeature(featureV)
            else:
                #print("El número es impar")
                point2 = QgsFeature(featureV)
                seg = QgsGeometry.fromPolylineXY([point1.geometry().asPoint(), point2.geometry().asPoint()])
                featS = QgsFeature()
                featS.setGeometry(seg)
                featS.setAttributes([i-1])
                provider.addFeatures([featS])
                point1 = point2
            self.cantidadDeSegmentosV = i


            #########################################################

    def proyectarPosicionesARecorrido(self):


        layerProyectados = QgsVectorLayer("Point?crs=EPSG:32721", "PosicionesProyectadas", "memory")


        provider = layerProyectados.dataProvider()
        field_ID = QgsField("ID", QVariant.Int)
        field_SEG = QgsField("ID_SEGMENTO", QVariant.Int)
        provider.addAttributes([field_ID, field_SEG])
        layerProyectados.updateFields()

        layerPosiciones = QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0]
        expPos = QgsExpression(f"POSICION>0 AND COD_RECORRIDO = '{self.nom_rut}'")
        requestPos = QgsFeatureRequest(expPos).setSubsetOfAttributes(['POSICION'], layerPosiciones.fields() )

        layerRecorrido = QgsProject.instance().mapLayersByName(self.nomCapaRecorridoVigente)[0]
        expPosR = QgsExpression(f"FECHA_HASTA IS NULL AND NOM_RUT = '{self.nom_rut}'")
        requestRec = QgsFeatureRequest(expPosR).setSubsetOfAttributes(['NOM_RUT'], layerRecorrido.fields() )

        recorrido = next(layerRecorrido.getFeatures(requestRec))
        geomlinea = recorrido.geometry()
        self.max_pos = 0
        for featurePos in layerPosiciones.getFeatures(requestPos):
            self.max_pos+=1
            feat = QgsFeature()

            distance, closest_point, before_vertex, after_vertex = geomlinea.closestSegmentWithContext(featurePos.geometry().asPoint())
            feat.setGeometry(QgsGeometry.fromPointXY(closest_point))
            feat.setAttributes([featurePos["POSICION"], before_vertex-1])
            provider.addFeatures([feat])


        QgsProject.instance().addMapLayer(layerProyectados, self.verCapasEnMemoria)


        #########################################################

    def detectorPosicionesMal(self):
        cont = 0
        flag = True
        dicc_pos_geomRec = {}
        while flag and cont < self.vueltas:
            lisPos_dicPosSeg = self.obtenerListaPosicionesDicSegRec()   #retorna [lista de posiciones proyectadas, dicc {Pos:id Segmento}]
            l = lisPos_dicPosSeg[0]
            #print("l:", l)
            d = lisPos_dicPosSeg[1]
            listaNegra = self.obtenerListaPoscionesMal(l)
            #print ("MAL:", listaNegra)
            logger.info(f"Lista negra pasada {cont}: {listaNegra} ")
            #print("d:", d)
            #print("Pasada :", cont)

            dicc_pos_geomRec = self.corregirListaNegra(listaNegra, d, dicc_pos_geomRec)

            if len(listaNegra) == 0:
                flag = False
            cont = cont + 1


    #########################################################

    def obtenerListaPosicionesDicSegRec(self):
        layerPosicion = QgsProject.instance().mapLayersByName("PosicionesProyectadas")[0]

        # Imprimir la lista de características ordenadas
        fueraRango = []
        listaPosiciones = []
        diccSegRec = dict()

        for segmento in range(self.cantidadDeSegmentosV):

            expPos = QgsExpression(f"ID_SEGMENTO = '{segmento}'")

            requestPos = QgsFeatureRequest(expPos).setFlags(QgsFeatureRequest.NoGeometry).setSubsetOfAttributes(['ID', 'ID_SEGMENTO'], layerPosicion.fields() )
            featuresPs = layerPosicion.getFeatures(requestPos)

            layer_sorted_posicion = sorted(featuresPs , key=lambda x: x['ID'])
            for featurePos in layer_sorted_posicion:

                listaPosiciones.append(featurePos['ID'])

                diccSegRec[featurePos['ID']] = featurePos['ID_SEGMENTO']

        return (listaPosiciones, diccSegRec)


        #########################################################

    def obtenerListaPoscionesMal (self,pts):

        #print("Hello World")
        #maxpos = (QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0]).featureCount()
        maxpos = self.max_pos

        p = 0
        s = 0
        p_ = 0
        s_ = 0

        rotos = []

        serie = list(range(1, maxpos+1))

        flag = 0
        contador = 0
        #print("serie:", len(serie), "pts:", len(pts), "maxpos:", maxpos)
        while (p < maxpos) and (s  < maxpos):
            #print("                                                 p:",p, "s:", s, "maxpos", maxpos)
            p_ = pts[p]
            s_ = serie[s]

            if p_ == s_:
                #print ("p[",p,"]=", p_, "-", s_,  "=s[",s,"]", "iguales", rotos )
                p = p + 1
                s = s + 1
            elif serie[s] in rotos :
                #print ("p[",p,"]=", p_, "-", s_, "=s[",s,"]=",  "serie[s] in rotos", rotos )
                s = s + 1
            elif pts[p] in rotos :
                #print ("p[",p,"]=", p_, "-", s_, "=s[",s,"]=",  "pts[p] in rotos", rotos )
                p = p + 1
            elif (s+1 < maxpos) and pts[p] == serie[s+1] : #falta uno
                #print ("p[",p,"]=", p_, "-", s_,  "=s[",s,"]" , "pts[p] == serie[s+1]: #falta uno", rotos)
                rotos.append(serie[s])
                s = s + 2
                p = p + 1
            elif(p+2 < maxpos) and  pts[p+1] ==  pts[p]+1 and (pts[p+2] ==  pts[p]+2):
                #print ("p[",p,"]=", p_, "-", s_,  "=s[",s,"]" , "pts[p+1](",pts[p+1],")  ==  pts[p]+1(", pts[p]+1, ") and (pts[p+2](", pts[p+2], ") ==  pts[p]+2)(",pts[p]+2,")", rotos)
                cant = self.cantSeriales(pts,p)
                if (cant <= 4 ): #si son pocos sobran p
                    #print("son poco sobran p")
                    for i in range(p, p + cant):
                        rotos.append(pts[i])
                    p = p + cant
                else: #si son muchos faltan
                    #print("son muchos faltan")
                    dif = pts[p] - serie[s]
                    for i in range(serie[s], pts[p]+1):
                        #print("agrego serie[i] ", i )
                        rotos.append(i)
                    s = s + dif + cant
                    p = p + cant
            else:
                #print ("p[",p,"]=", p_, "-",  s_, "=s[",s,"]" , "else final, uno metido", rotos)
                if not (p_ in rotos):
                    rotos.append(pts[p])
                p = p +1
        rotos = list(set(rotos))
        #print(rotos)
        return (rotos)

        #########################################################

    def cantSeriales(self, l , p):
        paro = False
        cont = 1
        while (not paro) and cont + p < len(l):
            if l[p+cont] == l[p]+cont:
                #print(cont, p+cont , l[p+cont],  p, l[p]+cont)
                cont = cont+1
            else:
                paro=True
        return cont

        #########################################################

    def corregirListaNegra(self, listaNegra, dicc_PosSeg, dicc_pos_geomRec):
        #print("listanegra", listaNegra)
        #print("dicc_PosSeg", dicc_PosSeg)
        try:
            for idPos in listaNegra:
                #print("Me ocupo del -> ", idPos)
                segmentoPos = dicc_PosSeg[idPos]

                dicc_pos_geomRec[idPos] = self.corregirPos(idPos, segmentoPos, dicc_pos_geomRec)
            #print("Termine de corregir")
            #raise ValueError("BREACKPOINT MANUAL")
        except Exception as error:
            logger.error(f'Error en "corregirListaNegra": {type(error).__name__} : {error}. idPos={idPos}, listaNegra={listaNegra}')

        return dicc_pos_geomRec

    #########################################################

    def corregirPos(self, pos, idSegmento, dicc_pos_geomRec):


        layerPtsProyectados = QgsProject.instance().mapLayersByName("PosicionesProyectadas")[0]

        layerPosiciones = QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0]
        expPos = QgsExpression(f"POSICION = {pos} AND COD_RECORRIDO = '{self.nom_rut}'")
        requestPos = QgsFeatureRequest(expPos).setSubsetOfAttributes(['POSICION'], layerPosiciones.fields() )

        featuresPos = layerPosiciones.getFeatures(requestPos)

        puntoAProyectar = next(featuresPos)

        if pos in dicc_pos_geomRec:

            capas_segmentosUnidos_segmentosSeparados = self.quitarTramoId(idSegmento, dicc_pos_geomRec[pos])
        else:

            dicc_pos_geomRec[pos] = self.cap_segmentosV.clone()
            capas_segmentosUnidos_segmentosSeparados = self.quitarTramoId(idSegmento, dicc_pos_geomRec[pos])


        capa_segmentosUnidos = capas_segmentosUnidos_segmentosSeparados[0]
        capa_segmentosSeparados = capas_segmentosUnidos_segmentosSeparados[1]

        dicc_pos_geomRec[pos] = capa_segmentosSeparados

        recorridoAmputado = next(capa_segmentosUnidos.getFeatures())

        distance, closest_point, before_vertex, after_vertex = recorridoAmputado.geometry().closestSegmentWithContext(puntoAProyectar.geometry().asPoint())

        expProy = QgsExpression(f'"ID" = {pos}')
        requestProy = QgsFeatureRequest(expProy)

        featuresPosProy = layerPtsProyectados.getFeatures(requestProy)
        puntoProyectado = next(featuresPosProy)

        geomNueva = QgsGeometry.fromPointXY(closest_point)

        layerPtsProyectados.dataProvider().changeGeometryValues({ puntoProyectado.id() : geomNueva })

        feat = QgsFeature()
        feat.setGeometry(QgsGeometry.fromPointXY(closest_point))
        segmento = self.obtenerSegmentoRecorrdioPorPuntoCercanoCapaSV(feat, capa_segmentosSeparados)
        field_idx_seg = layerPtsProyectados.fields().indexOf('ID_SEGMENTO')

        layerPtsProyectados.dataProvider().changeAttributeValues({puntoProyectado.id(): {field_idx_seg: segmento["ID"]} })

        return dicc_pos_geomRec[pos]

    #########################################################

    def quitarTramoId(self, idSegmento, layer_segmentos_copia):

        layer_segmentos_copia = self.eliminarEntidad(layer_segmentos_copia, "ID", idSegmento)

        return (self.unirCapa(layer_segmentos_copia, idSegmento), layer_segmentos_copia)  #-->retorna "LaMasUnida"

    #########################################################

    def eliminarEntidad(self, capa, atributo, idEliminar):

        expPos = QgsExpression(f'{atributo} = {idEliminar} ')

        requestPos = QgsFeatureRequest(expPos).setFlags(QgsFeatureRequest.NoGeometry)

        featuresPos = capa.getFeatures(requestPos)

        feature = next(featuresPos)

        capa.dataProvider().deleteFeatures([feature.id()])

        return capa

        #########################################################

    def unirCapa(self, capa, idSegmento):
        geometrias = [f.geometry() for f in capa.getFeatures()]

        # Creamos una nueva geometría que es la unión de todas las geometrías de la capa
        geometria_union = QgsGeometry.unaryUnion(geometrias)

        # Creamos una nueva capa con una sola entidad que representa la unión de todas las geometrías
        #capa_union = QgsVectorLayer("Polygon?crs=EPSG:4326", "Unión", "memory")

        return self.auxiliarVerGeometria("LaMasUnida" + str(idSegmento), "LineString", geometria_union, self.verCapasEnMemoria)

    #########################################################

    def obtenerSegmentoRecorrdioPorPuntoCercanoCapaSV(self, punto, layer_Segmentos):


        for feature in layer_Segmentos.getFeatures():

            if punto.geometry().buffer(0.01, 8).intersects(feature.geometry()):

                self.auxiliarVerGeometria("bufferAlpto", "Polygon", punto.geometry().buffer(0.01, 8), self.verCapasEnMemoria)
                return feature

    #########################################################

    def proyectarPtoNuevoEnRecorrido(self, capa_recorridos):

        feat_pto_nuevo = QgsFeature()

        feature = self.puntoNuevo

        feat_pto_nuevo.setGeometry(feature.geometry())

        recorridos = QgsProject.instance().mapLayersByName(capa_recorridos)[0]
        expPosR = QgsExpression(f"FECHA_HASTA IS NULL AND NOM_RUT = '{self.nom_rut}'")
        requestRec = QgsFeatureRequest(expPosR).setSubsetOfAttributes(['NOM_RUT'], recorridos.fields() )
        recorrido = next(recorridos.getFeatures(requestRec))

        self.capaPtoCerca = QgsVectorLayer("Point?crs=EPSG:32721", "PtoCerca", "memory")
        provider = self.capaPtoCerca.dataProvider()
        feat = QgsFeature()

        geomlinea = recorrido.geometry()

        gl = QgsGeometry(geomlinea)

        distance, closest_point, before_vertex, after_vertex = gl.closestSegmentWithContext(feature.geometry().asPoint())
        feat.setGeometry(QgsGeometry.fromPointXY(closest_point))
        provider.addFeatures([feat])


        line = QgsLineString([feat.geometry().asPoint(), feat_pto_nuevo.geometry().asPoint()])
        geometry = QgsGeometry.fromPolyline(line)

        layseg = QgsVectorLayer("LineString?crs=EPSG:32721", "segmento", "memory")
        providerSeg = layseg.dataProvider()

        featSeg = QgsFeature()
        featSeg.setGeometry(geometry)
        providerSeg.addFeatures([featSeg])

        QgsProject.instance().addMapLayer(layseg, self.verCapasEnMemoria)

        params = {
            'INPUT': 'segmento',
            'OUTPUT': 'memory:',
            'START_DISTANCE': 0.01,  # longitud de la extensión en unidades del sistema de coordenadas de la capa
            'END_DISTANCE': 0,
            'OUTPUT_TYPE': 0,  # tipo de capa de salida: 0 (misma geometría que la capa de entrada)
        }

        result = processing.run('qgis:extendlines', params)

        # Verifica que el geoproceso se haya ejecutado correctamente
        if result['OUTPUT']:

            layer_extended = result['OUTPUT']

            QgsProject.instance().addMapLayer(layer_extended, self.verCapasEnMemoria)


    #########################################################
    def obtenerPosicionNuevo(self):
        subSegmentos_idSeg  = self.obtenerCapaSgmentoDividido_idSegmento()

        layerSubSegmentos = subSegmentos_idSeg[0]
        idSegmento = subSegmentos_idSeg[1]
        vertice0 = subSegmentos_idSeg[2]
        vertice1 = subSegmentos_idSeg[3]
        ptoCerca = subSegmentos_idSeg[4]

        puntos_contenidosA = []
        puntos_contenidosB = []

        yaInicializoFlagA = False
        flagA = True

        if  layerSubSegmentos.featureCount() == 1: # el ptoNuevo esta en un extremo del segmento

            if (ptoCerca.geometry().distance(QgsGeometry.fromPointXY(QgsPointXY(vertice0))) <
                    ptoCerca.geometry().distance(QgsGeometry.fromPointXY(QgsPointXY(vertice1)))):
                print("estoy en A")
                flagA = False
            else:
                flagA = True
                print("estoy en B")

            yaInicializoFlagA = True

        for i, featSubSegmento in enumerate(layerSubSegmentos.getFeatures()):

            if not yaInicializoFlagA:
                if  featSubSegmento.geometry().intersects((QgsGeometry.fromPointXY(QgsPointXY(vertice0)).buffer(0.01, 15))):
                    flagA = True

                else:
                    flagA = False

                yaInicializoFlagA = True

            if flagA:
                geomA = featSubSegmento.geometry()
                puntos_contenidosA = self.obtenerPtsDeGeometria(geomA.buffer(0.01, 15))
                flagA = not flagA

            else:
                geomB = featSubSegmento.geometry()

                puntos_contenidosB =  self.obtenerPtsDeGeometria(geomB.buffer(0.01, 15))
                flagA = not flagA


        posicionHallada = self.opcionesDePoscicion(idSegmento, puntos_contenidosA, puntos_contenidosB)

        #print("@@@@@@@@  HALLADA  -> ", posicionHallada)

        return posicionHallada

    ##########################################################

    def obtenerCapaSgmentoDividido_idSegmento(self):

        #obtengo el unico punto proyectado de la capa
        layer_puntoCerca = self.capaPtoCerca
        ptoCerca = next(layer_puntoCerca.getFeatures())

        recorrido = self.obtenerSegmentoRecorrdioPorPuntoCercano(ptoCerca)
        self.auxiliarVerFeature("segmentoRec", "LineString",recorrido, self.verCapasEnMemoria)

        layer_output_recta = QgsProject.instance().mapLayersByName("output")[0]
        recta = next(layer_output_recta.getFeatures())
        self.auxiliarVerFeature("RectaDivisoria", "LineString",recta, self.verCapasEnMemoria)
        vertice0 = recorrido.geometry().vertexAt(0)
        vertice1 = recorrido.geometry().vertexAt(1)

        params = {
            'INPUT': "segmentoRec",
            'LINES': "RectaDivisoria",
            'OUTPUT': "memory:"
        }

        result = processing.run('native:splitwithlines', params)

        output_layer = result['OUTPUT']

        return (output_layer, recorrido['ID'], vertice0, vertice1, ptoCerca)

    ##########################################################
    def obtenerSegmentoRecorrdioPorPuntoCercano(self, punto):

        layer_Segmentos = self.cap_segmentosV

        for feature in layer_Segmentos.getFeatures():

            if punto.geometry().buffer(0.01, 8).intersects(feature.geometry()):

                self.auxiliarVerGeometria("bufferAlpto", "Polygon", punto.geometry().buffer(0.01, 8), self.verCapasEnMemoria)
                return feature

    ##########################################################
    def obtenerSegmentoPorID(self, id_Segmento):

        print("obtenerSegmentoPorID (idSeg)", id_Segmento)

        #layer_Segmentos = QgsProject.instance().mapLayersByName("SegmentosV")[0]
        layer_Segmentos = self.cap_segmentosV
        #for feture in layer_befferPorSeg.getFeatures():
        field_name = "ID"  # Nombre del atributo a filtrar
        field_value = id_Segmento

        #request = QgsFeatureRequest().setFilterExpression(f"{field_name} = '{field_value}'")
        exp = QgsExpression(f"{field_name} = '{field_value}'")
        request = QgsFeatureRequest(exp)
        print(request)
        for feature in layer_Segmentos.getFeatures(request):

            return feature

            ##########################################################
    def obtenerPtsDeGeometria(self, geometria):

        points_layer = QgsProject.instance().mapLayersByName('PosicionesProyectadas')[0]

        contained_points = []

        for point_feature in points_layer.getFeatures():
            point_geom = point_feature.geometry()

            if geometria.contains(point_geom):
                contained_points.append(int(point_feature['ID']))

        ordenados = sorted(contained_points)

        return (ordenados)

        ##########################################################
    def obtenerPosDeVecinoDireccion(self, id_Segmento, direccion, maxSegmentos, maxPosiciones):

        featSeg = self.obtenerSegmentoPorID(id_Segmento)
        puntos_contenidos = self.obtenerPtsDeGeometria(featSeg.geometry().buffer(0.01, 15))

        if direccion < 0: # izquierda
            if len(puntos_contenidos) != 0:
                return max(puntos_contenidos) + 1
            elif id_Segmento == 0:  #listaA = listaB = vacio
                return 1
            return self.obtenerPosDeVecinoDireccion(id_Segmento + direccion, direccion, maxSegmentos, maxPosiciones)

        elif len(puntos_contenidos) != 0:
            return min(puntos_contenidos)
        elif id_Segmento == maxSegmentos: # derecha
            return (maxPosiciones)
        else:
            return self.obtenerPosDeVecinoDireccion(id_Segmento + direccion, direccion, maxSegmentos, maxPosiciones)

            ##########################################################

    def obtenerPosDeVecinos(self, id_Segmento, maxSegmentos, maxPosiciones) :

        if id_Segmento > (maxSegmentos // 2):
            return self.obtenerPosDeVecinoDireccion(id_Segmento, +1, maxSegmentos, maxPosiciones)
        else:
            return self.obtenerPosDeVecinoDireccion(id_Segmento, -1, maxSegmentos, maxPosiciones)

    ##########################################################

    def opcionesDePoscicion(self, id_Segmento, listaA, listaB):

        maxSegmentos = self.cap_segmentosV.featureCount() - 1
        #maxPosiciones = (QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0]).featureCount()
        maxPosiciones = self.max_pos


        if len(listaA) != 0:
            posHallada = (max(listaA)+1)

        elif len(listaB) != 0:
            posHallada = min(listaB)
        elif id_Segmento == 0:  #listaA = listaB = vacio
            posHallada = 1
        elif id_Segmento == maxSegmentos:
            posHallada = (maxPosiciones +1)
        else:
            return self.obtenerPosDeVecinos( id_Segmento, maxSegmentos, maxPosiciones)

        return posHallada

    ##########################################################

    def obtenerCantidadRutasRecorrido(self, codRecorrido):

        layer = QgsProject.instance().mapLayersByName("dfr:E_DF_RUTAS_RECORRIDO")[0]
        expPosR = QgsExpression(f"FECHA_HASTA IS NULL AND NOM_RUT = '{codRecorrido}'")
        requestPosR = QgsFeatureRequest(expPosR)
        cont = len(list(layer.getFeatures(requestPosR)))

        if (cont != 1):

            mensaje_error = f"Hay {cont} recorridos asocidos a la ruta {codRecorrido}"
            QgsMessageLog.logMessage(mensaje_error, 'Plugineta-DFR', level=Qgis.Critical)
            logger.critical(mensaje_error)

        return cont

    ##########################################################################
    ################### Metodo expuesto calcular Posicion ####################

    def calcularPosicion (self, nombreCapaPosiciones, nombreCapaRecorridos, codRecorrido, ptoNuevo):
        pos = -1
        cant_ruta_recorrido = self.obtenerCantidadRutasRecorrido(codRecorrido)

        if (cant_ruta_recorrido == 1):
            try:
                self.ptoDadoAlta = 0
                self.puntoNuevo = QgsFeature()
                point = QgsPointXY(ptoNuevo.x(), ptoNuevo.y())
                self.puntoNuevo.setGeometry(QgsGeometry.fromPointXY(point))

                self.nomCapaPosicionesVigentes = nombreCapaPosiciones
                self.nomCapaRecorridoVigente = nombreCapaRecorridos
                self.nom_rut =  codRecorrido
                self.verCapasEnMemoria = False
                self.vueltas = 3

                #Si existen de pasada anterior
                self.eliminarCapaEnMemoria("PosicionesProyectadas")
                self.eliminarCapaEnMemoria("RectaDivisoria")
                self.eliminarCapaEnMemoria("output")
                self.eliminarCapaEnMemoria("segmentoRec")
                self.eliminarCapaEnMemoria("segmento")
                #print("Arranca el srcipt")

                self.crearVerticesDeUnRecorrido()      # nueva era ok->(Vertices)

                self.crearSegmentosConVertices()       # nueva era ok->(SegmentosV)

                self.proyectarPosicionesARecorrido()

                self.detectorPosicionesMal()

                self.proyectarPtoNuevoEnRecorrido(self.nomCapaRecorridoVigente) #-> (PtoCerca, segmento)

                pos = self.obtenerPosicionNuevo()

                #self.verCapasEnMemory()

                if pos == -1:
                    logger.critical(f'Error en "calcularPosicion": por= -1. Se pide ingreso de posicion manual')

            except Exception as error:
                QtWidgets.QMessageBox.information(None, "Proceso de Alta Posicion Recorrido", "Se produjo un error al obtener Posicion.\nDebe ingresarla manualmente.")
                logger.error(f'Error en "calcularPosicion": {type(error).__name__} : {error}. Se pide ingreso de posicion manual')

        else:
            mensaje_error = f"Error en Datos. Hay {cant_ruta_recorrido} recorridos asocidos a la ruta {codRecorrido}.\nDebe ingresar la posicion manualmente."
            QMessageBox.critical(None, "Proceso de Alta Posicion Recorrido", mensaje_error, QMessageBox.Ok)
            logger.error(f'Error en "calcularPosicion": mas de una ruta. Se pide ingreso de posicion manual')

        return pos

    ##########################################################

    def reposicionarAPartirDePosAlta(self, capa, posicion):

        trazaCambios = []
        modifico = ""
        try:
            if (posicion is None) or (posicion < 0):
                raise ValueError("Error posicion negativa o nula")

            #capa.startEditing()

            exp = QgsExpression(f"POSICION > {posicion} AND COD_RECORRIDO = '{self.nom_rut}'")
            expRep = QgsExpression(f"POSICION = {posicion} AND COD_RECORRIDO = '{self.nom_rut}'")
            request = QgsFeatureRequest(exp)
            requestRep = QgsFeatureRequest(expRep)


            features = list(capa.getFeatures(request))
            featuresRep = list(capa.getFeatures(requestRep))

            if len(featuresRep) > 1:
                max_feature_new_pos = max(featuresRep, key=lambda f: f.id())
                features.append(max_feature_new_pos)

                features.sort(key=lambda x: x.attribute("POSICION"))

                field_idx_pos = capa.fields().indexOf('POSICION')

                for feature in features:
                    valorActual = int(round(feature['POSICION']))
                    valorNuevo = int(round(feature['POSICION'])) + 1.0
                    capa.changeAttributeValue(feature.id(), field_idx_pos , valorNuevo)

                    trazaCambios.append([valorActual,valorNuevo])

            capa.commitChanges()
            modifico = f"modifico[viejo,nuevo]: {trazaCambios} del recorrido {self.nom_rut}"
            QgsMessageLog.logMessage( modifico, 'Plugineta-DFR', level=Qgis.Success)
            iface.messageBar().pushMessage(f"El alta y el reordenar fue exitoso a partir de: {posicion}", level=Qgis.Success, duration=3)
            logger.info(modifico)
            logger.info(f"Fin reordenar a partir de {posicion}. OK")
            return True

        except Exception as error:

            mensaje = "ERROR al reordenar por alta"
            mensaje_error = f'Error en "reposicionarAPartirDePosAlta": {type(error).__name__} : {error}'
            inputs = f"inputs capa:{capa}, posicion: {posicion}, recorrido: {self.nom_rut}"
            modifico = f"modifico[viejo,nuevo]: {trazaCambios}"
            QgsMessageLog.logMessage( mensaje, 'Plugineta-DFR', level=Qgis.Critical)
            QgsMessageLog.logMessage( mensaje_error, 'Plugineta-DFR', level=Qgis.Critical)
            QgsMessageLog.logMessage( modifico, 'Plugineta-DFR', level=Qgis.Critical)
            iface.messageBar().pushMessage(f"Error al reordenar a partir de posicion: {posicion}. {error}", level=Qgis.Critical, duration=5)
            logger.error(mensaje)
            logger.error(mensaje_error)
            logger.error(inputs)
            logger.error(modifico)

            return False


    ##########################################################################
    ################### Metodo expuesto reordenar Alta #######################

    def reordenarPuntosAlta(self, nombreCapaPosiciones, codRecorrido, posicionNueva):
        logger.info(f"Empieza reordenar a partir de {posicionNueva} (alta) del recorrido {codRecorrido}")
        self.nomCapaPosicionesVigentes = nombreCapaPosiciones
        self.nom_rut =  codRecorrido
        salida = self.reposicionarAPartirDePosAlta(QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0], posicionNueva)
        logger.info(f"Termina reordenar a partir de {posicionNueva} (alta)")
        return salida


    ##########################################################

    def reposicionarAPartirDePosBaja(self, capa, posicion):
        trazaCambios = []
        modifico = ""

        try:
            capa.startEditing()
            exp = QgsExpression(f"POSICION > {posicion} AND COD_RECORRIDO = '{self.nom_rut}'")
            request = QgsFeatureRequest(exp)

            features = list(capa.getFeatures(request))
            features.sort(key=lambda x: x.attribute("POSICION"))

            field_idx_pos = capa.fields().indexOf('POSICION')

            for feature in features:
                valorActual = int(round(feature['POSICION']))
                valorNuevo = int(round(feature['POSICION'])) - 1.0
                capa.changeAttributeValue(feature.id(), field_idx_pos , valorNuevo)
                trazaCambios.append([valorActual,valorNuevo])
            #capa.commitChanges()
            modifico = f"modifico[viejo,nuevo]: {trazaCambios} de {self.nom_rut}"
            QgsMessageLog.logMessage( modifico, 'Plugineta-DFR', level=Qgis.Success)
            iface.messageBar().pushMessage(f"La Baja y el reordenar fue exitoso a partir de: {posicion}", level=Qgis.Success, duration=3)
            logger.info(modifico)
            logger.info(f"Fin reordenar a partir de {posicion}. OK")

            return True

        except Exception as error:
            mensaje = "ERROR al reordenar por alta"
            mensaje_error = f'Error en "reposicionarAPartirDePosBaja": {type(error).__name__} : {error}'
            inputs = f"inputs capa:{capa}, posicion: {posicion}, recorrido: {self.nom_rut}"
            modifico = f"modifico[viejo,nuevo]: {trazaCambios}"
            QgsMessageLog.logMessage( mensaje, 'Plugineta-DFR', level=Qgis.Critical)
            QgsMessageLog.logMessage( mensaje_error, 'Plugineta-DFR', level=Qgis.Critical)
            QgsMessageLog.logMessage( modifico, 'Plugineta-DFR', level=Qgis.Critical)
            iface.messageBar().pushMessage(f"Error al reordenar a partir de posicion: {posicion}. {error}", level=Qgis.Critical, duration=5)
            logger.error(mensaje)
            logger.error(mensaje_error)
            logger.error(inputs)
            logger.error(modifico)

            return False

    ##########################################################################
    ################### Metodo expuesto reordenar Baja #######################

    def reordenarPuntosBaja(self, nombreCapaPosiciones, codRecorrido, posicionNueva):
        logger.info(f"Empieza reordenar a partir de {posicionNueva} (baja) de {codRecorrido}")
        self.nomCapaPosicionesVigentes = nombreCapaPosiciones
        self.nom_rut = codRecorrido
        salida = self.reposicionarAPartirDePosBaja(QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0], posicionNueva)
        logger.info(f"Termina reordenar a partir de {posicionNueva} (baja)")
        return salida


    ##########################################################

    def reposicionarAPartirDePosUpdate(self, capa, posicion, gid):

        trazaCambios = []
        modifico = ""
        try:
            if (posicion is None) :
                raise ValueError("Error posicion nula")

            #capa.startEditing()

            exp = QgsExpression(f"GID <> {gid} AND POSICION >= {posicion} AND COD_RECORRIDO = '{self.nom_rut}'")
            request = QgsFeatureRequest(exp)

            features = list(capa.getFeatures(request))
            features.sort(key=lambda x: x.attribute("POSICION"))

            field_idx_pos = capa.fields().indexOf('POSICION')

            for feature in features:
                valorActual = int(round(feature['POSICION']))
                valorNuevo = int(round(feature['POSICION'])) + 1.0
                capa.changeAttributeValue(feature.id(), field_idx_pos , valorNuevo)

                trazaCambios.append([valorActual,valorNuevo])

            modifico = f"modificaciones[viejo,nuevo]: {trazaCambios} del recorrido {self.nom_rut}"
            QgsMessageLog.logMessage( modifico, 'Plugineta-DFR', level=Qgis.Success)
            iface.messageBar().pushMessage(f"La modificación y el reordenar fue exitoso a partir de: {posicion}", level=Qgis.Success, duration=3)
            logger.info(modifico)
            logger.info(f"Fin reordenar a partir de {posicion}. Update OK")
            return True

        except Exception as error:

            mensaje = "ERROR al reordenar por alta"
            mensaje_error = f'Error en "reposicionarAPartirDePosUpdate": {type(error).__name__} : {error}'
            inputs = f"inputs capa:{capa}, posicion: {posicion}, recorrido: {self.nom_rut}, gid: {gid}"
            modifico = f"modifico[viejo,nuevo]: {trazaCambios}"
            QgsMessageLog.logMessage( mensaje, 'Plugineta-DFR', level=Qgis.Critical)
            QgsMessageLog.logMessage( mensaje_error, 'Plugineta-DFR', level=Qgis.Critical)
            QgsMessageLog.logMessage( modifico, 'Plugineta-DFR', level=Qgis.Critical)
            iface.messageBar().pushMessage(f"Error Update. En reordenar a partir de posicion: {posicion}. {error}", level=Qgis.Critical, duration=5)
            logger.error(mensaje)
            logger.error(mensaje_error)
            logger.error(inputs)
            logger.error(modifico)

            return False


    ##########################################################################
    ################### Metodo expuesto reordenar Update #######################
    
    def reordenarPuntosUpdate(self, nombreCapaPosiciones, codRecorrido, posicionNueva, gid):
        logger.info(f"Modifico el gid: {gid} con posicion nueva -> {posicionNueva}. recorrido = {codRecorrido}")
        logger.info(f"(Modificacion) Empieza reordenar a partir de {posicionNueva} con gid: {gid}. Recorrido {codRecorrido}")
        self.nomCapaPosicionesVigentes = nombreCapaPosiciones
        self.nom_rut = codRecorrido
        salida = self.reposicionarAPartirDePosUpdate(QgsProject.instance().mapLayersByName(self.nomCapaPosicionesVigentes)[0], posicionNueva, gid)
        logger.info(f"Termina reordenar a partir de {posicionNueva} (Modificacion)")
        return salida
