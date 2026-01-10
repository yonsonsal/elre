import os
import configparser

class ConfigProperties:

	def __cargarAmbiente(self):
		config = configparser.ConfigParser()
		config.read(os.path.join(os.path.dirname(__file__), '../../metadata.txt'))
		ambiente = config.get('general', 'ambiente')
		return ambiente

	def __cargarProperties(self, ambiente):
		thisfolder = os.path.dirname(os.path.abspath(__file__))
		initfile = None
		if ambiente == "local":
			initfile = os.path.join(thisfolder, 'config.local.properties')
		elif ambiente == "desarrollo":
			initfile = os.path.join(thisfolder, 'config.desa.properties')
		elif ambiente == "produccion":
			initfile = os.path.join(thisfolder, 'config.prod.properties')
		config = configparser.ConfigParser()
		config.read(initfile)
		return config
	
	@staticmethod
	def getPropery(seccion, propiedad):
		confProp = ConfigProperties()
		ambiente = confProp.__cargarAmbiente()
		prop = confProp.__cargarProperties(ambiente)
		return prop.get(seccion, propiedad)

	@staticmethod
	def hasOption(seccion, propiedad):
		confProp = ConfigProperties()
		ambiente = confProp.__cargarAmbiente()
		prop = confProp.__cargarProperties(ambiente)
		return prop.has_option(seccion, propiedad)


	@staticmethod
	def getVersion():
		config = configparser.ConfigParser()
		config.read(os.path.join(os.path.dirname(__file__), '../../metadata.txt'))
		version = config.get('general', 'version')
		return version

	@staticmethod
	def getEPSG():
		config = configparser.ConfigParser()
		config.read(os.path.join(os.path.dirname(__file__), '../../metadata.txt'))
		epsg = config.get('general', 'epsg')
		return epsg