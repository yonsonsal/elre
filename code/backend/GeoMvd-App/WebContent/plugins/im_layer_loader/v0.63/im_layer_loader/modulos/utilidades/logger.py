import logging
from logging.handlers import TimedRotatingFileHandler  # Alternativa más estable
import os
from qgis.core import QgsApplication

class SafePluginLogger:
    _initialized = False
    _handler = None

    @classmethod
    def init_logger(cls):
        if cls._initialized:
            return logging.getLogger("plugin_logger")

        try:
            log_dir = os.path.join(QgsApplication.qgisSettingsDirPath(), "logs")
            os.makedirs(log_dir, exist_ok=True)

            cls._handler = TimedRotatingFileHandler(
                filename=os.path.join(log_dir, "plugineta.log"),
                when="midnight",        # Rota cada medianoche
                backupCount=30,
                encoding="utf-8",
                utc=False               # o True si querés que la fecha sea UTC
            )


            formatter = logging.Formatter(
                "%(asctime)s [%(levelname)s] - %(funcName)s():%(lineno)d - %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            cls._handler.setFormatter(formatter)

            logger = logging.getLogger("plugin_logger")
            logger.setLevel(logging.INFO)

            # Eliminar otros handlers previamente agregados
            for h in logger.handlers[:]:
                logger.removeHandler(h)

            logger.addHandler(cls._handler)

            cls._initialized = True
            return logger

        except Exception as e:
            print(f"Error configurando logger: {str(e)}")
            return logging.getLogger("dummy_logger")


    @classmethod
    def shutdown_logger(cls):
        logger = logging.getLogger("plugin_logger")
        if cls._handler:
            logger.removeHandler(cls._handler)
            cls._handler.close()
            cls._handler = None
        cls._initialized = False
