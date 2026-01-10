from qgis.core import QgsApplication, QgsAuthMethodConfig

from ...modulos.properties.configProperties import ConfigProperties
from ..utilidades.logger import SafePluginLogger

logger = SafePluginLogger.init_logger()

class FuncionesAutenticacion:

    @staticmethod
    def cargarAutenticacionBasic(username, password):
        am = QgsApplication.authManager()
        namesAU = [name for name in am.availableAuthMethodConfigs().keys()]

        if username in namesAU:
            # Eliminar la configuración de autenticación
            am.removeAuthenticationConfig(username)

        #Creamos la configuración de autenticación
        cfg = QgsAuthMethodConfig()
        cfg.setId(username)
        cfg.setName(username)
        cfg.setMethod('Basic')
        cfg.setConfig('username', username)
        cfg.setConfig('password', password)
        am.storeAuthenticationConfig(cfg)

    @staticmethod
    def autenticarAlfresco(usr, pas):
        if ConfigProperties.getPropery("Ambiente", "avisoTest") == "S":
            try:
                usr_des = ConfigProperties.getPropery('Imnube', 'usr')
                pass_des = ConfigProperties.getPropery('Imnube', 'pass')
                #test
                return pass_des, usr_des

            except Exception as error:
                print(f"Usuario o contraseña de alfreso incorrecto {type(error).__name__} : {error}')")
                logger.error(f'Error en autenticacion de alfrsco con usuario:{usr} y archivo. FuncionesAutenticacion.autenticarAlfresco')
                return None, None
        else:
            #Produccion
            return usr, pas