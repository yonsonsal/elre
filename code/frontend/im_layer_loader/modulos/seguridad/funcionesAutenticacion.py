from qgis.core import QgsApplication, QgsAuthMethodConfig

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
