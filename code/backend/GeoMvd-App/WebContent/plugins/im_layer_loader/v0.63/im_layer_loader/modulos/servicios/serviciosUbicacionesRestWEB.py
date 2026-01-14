from qgis.core import *
from qgis.gui import *

from .serviciosRest import ServiciosRest
from ..properties.configProperties import ConfigProperties


@qgsfunction(args='auto', group='ServiciosUbicacionesApiRest', usesgeometry=True, referenced_columns=[])
def getNombreMunicipioDadosXY(x, y, feature, parent):
    servicio = "municipios/municipioPunto?x="+str(x)+"&y="+str(y)
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta.get("nombre")

def getCallesNombre(nombreCalle):
    servicio = f"infoUbicacion/vias/?nombre={nombreCalle}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getEsquinasCalle(codVia, nombreEsquina):
    servicio = f"infoUbicacion/esquinas/{codVia}?nombre={nombreEsquina}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getPosicionEsquina(codVia1, codVia2):
    servicio = f"esquinas/posicion/{codVia1}/{codVia2}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getPosicionCalleNumero(codVia1, numeroPuerta):
    servicio = f"direcciones/posicion/{codVia1}/{numeroPuerta}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getPadronGeometria(padron):
    servicio = f"padrones/geometria/{padron}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getPadronCentroide(padron):
    servicio = f"padrones/centroide/{padron}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getMunicipios():
    servicio = "municipios/todos/"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getMunicipioGeometria(municipio):
    servicio = f"municipios/geometria/{municipio}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getMunicipioCentroide(municipio):
    servicio = f"municipios/centroide/{municipio}"
    respuesta = getServicioUbicacionesRestWEB(servicio)
    return respuesta

def getServicioUbicacionesRestWEB(servicio):
    url = ConfigProperties.getPropery("ServicioRest", "urlubicacionesRestWEB")
    response = ServiciosRest.invocarRestGet(url+servicio)
    return response