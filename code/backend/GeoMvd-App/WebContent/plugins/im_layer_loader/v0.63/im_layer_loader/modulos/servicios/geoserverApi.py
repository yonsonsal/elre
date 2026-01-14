from .serviciosRest import ServiciosRest

class GeoserverApi :

    @staticmethod
    #OBTIENE LOS WORKSPACES DE UN USUARIO
    def getWorkspacesUser(urlGeoserver, username, password):
        url = f"{urlGeoserver}/rest/workspaces.json"
        result = ServiciosRest.invocarRestGetAuth(url, username, password)
        return result

    @staticmethod
    #OBTIENE LAS CAPAS DE UN WORKSPACE
    def getLayersFromWorkspace(workspace, urlGeoserver, username, password):
        url = f"{urlGeoserver}/rest/workspaces/{workspace}/layers.json"
        result = ServiciosRest.invocarRestGetAuth(url, username, password)
        return result

    @staticmethod
    #OBTIENE LOS DATOS DE UNA CAPA, DADA LA CAPA Y EL WORKSPACE
    def getLayerFromWorkspace(workspace, layer, urlGeoserver, username, password):
        url = f"{urlGeoserver}/rest/workspaces/{workspace}/layers/{layer}.json"
        result = ServiciosRest.invocarRestGetAuth(url, username, password)
        return result

    @staticmethod
    #OBTIENE LOS ESTILOS DE UNA CAPA, DADA LA CAPA Y EL WORKSPACE
    def getLayerStylesFromWorkspace(workspace, layer, urlGeoserver, username, password):
        url = f"{urlGeoserver}/rest/workspaces/{workspace}/layers/{layer}/styles.json"
        result = ServiciosRest.invocarRestGetAuth(url, username, password)
        return result

    @staticmethod
    #OBTIENE LOS DATOS DE UN ESTILO DADO EL NOMBRE DEL ESTILO Y EL WORKSPACE
    def getSldStyleFromWorkspace(workspace, style, urlGeoserver, username, password):
        url = f"{urlGeoserver}/rest/workspaces/{workspace}/styles/{style}"
        result = ServiciosRest.invocarRestGetAuthSld(url, username, password)
        return result

    @staticmethod
    #OBTIENE LOS DATOS DE UN ESTILO DADO EL NOMBRE DEL ESTILO
    def getSldStyle(style, urlGeoserver, username, password):
        url = f"{urlGeoserver}/rest/styles/{style}"
        result = ServiciosRest.invocarRestGetAuthSld(url, username, password)
        return result