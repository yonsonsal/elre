from qgis.core import QgsProject, QgsFeatureRequest, QgsExpression
class AuxiliaresDfr:

    @staticmethod
    def inicializoAtributosPosicionesRecorrido(feature):
        feature.setAttribute("ULTIMA_POSICION", 0)
        return feature

    @staticmethod
    def bajaLogicaPosicionesRecorrido(feature):
        feature.setAttribute("POSICION", 0)
        feature.setAttribute("ULTIMA_POSICION", 0)
        return feature

    @staticmethod
    def marcarUltimaPosicionRecorridoPosicionesRecorrido(layerName, codigoRecorrido):
        capa = QgsProject.instance().mapLayersByName(layerName)[0]
        capa.startEditing()
        exp = QgsExpression(f"POSICION >0 and COD_RECORRIDO = '{codigoRecorrido}'")
        request = QgsFeatureRequest(exp)
        clause = QgsFeatureRequest.OrderByClause('POSICION', ascending=False)
        orderby = QgsFeatureRequest.OrderBy([clause])
        request.setOrderBy(orderby)
        features = capa.getFeatures(request)
        contador = 0
        for feature in features:
            if contador == 0:
                feature.setAttribute("ULTIMA_POSICION", 1)
            else:
                feature.setAttribute("ULTIMA_POSICION", 0)
            contador=contador+1
            capa.updateFeature(feature)
        capa.triggerRepaint()
        #capa.commitChanges()

