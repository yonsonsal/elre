import os
import configparser

class ConfigProperties:

	def __cargarAmbiente(self):
		config = configparser.ConfigParser(interpolation=None)
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
		config = configparser.ConfigParser(interpolation=None)
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
	def getSeccionCapasBase(workspace):
		"""Seccion de CapasBase efectiva para un workspace: "CapasBase:<workspace>" si existe
		(capas base propias, ej. workspace-demo-4326), si no la seccion [CapasBase] por defecto
		(hoy las capas de Montevideo, pensada para workspace-demo)."""
		confProp = ConfigProperties()
		ambiente = confProp.__cargarAmbiente()
		prop = confProp.__cargarProperties(ambiente)
		seccionWorkspace = "CapasBase:" + workspace
		if prop.has_section(seccionWorkspace):
			return seccionWorkspace
		return "CapasBase"

	@staticmethod
	def getCapasBaseKeys(workspace):
		"""Sufijos (ej. "CapaBaseIM") de las capas base configuradas para el workspace, en el
		orden en que aparecen en el archivo de config (ver getSeccionCapasBase)."""
		confProp = ConfigProperties()
		ambiente = confProp.__cargarAmbiente()
		prop = confProp.__cargarProperties(ambiente)
		seccion = ConfigProperties.getSeccionCapasBase(workspace)
		prefijo = "nombre"
		return [opcion[len(prefijo):] for opcion in prop.options(seccion) if opcion.startswith(prefijo)]

	@staticmethod
	def getCapasBaseParaWorkspaces(workspaces):
		"""Lista ordenada y sin duplicados (por nombre visible) de las capas base a mostrar
		para el/los workspace(s) seleccionado(s). Cada entrada es (seccion, capa, nombre,
		porDefecto) - porDefecto sale de la clave opcional "default<capa>" (true/false); si no
		esta presente se asume True (compatible con el comportamiento historico: todas tildadas)."""
		entradas = []
		nombresVistos = set()
		for workspace in workspaces:
			seccion = ConfigProperties.getSeccionCapasBase(workspace)
			for capa in ConfigProperties.getCapasBaseKeys(workspace):
				nombre = ConfigProperties.getPropery(seccion, "nombre" + capa)
				if nombre in nombresVistos:
					continue
				nombresVistos.add(nombre)
				claveDefault = "default" + capa
				porDefecto = True
				if ConfigProperties.hasOption(seccion, claveDefault):
					porDefecto = ConfigProperties.getPropery(seccion, claveDefault).strip().lower() == "true"
				entradas.append((seccion, capa, nombre, porDefecto))
		return entradas


	@staticmethod
	def getVersion():
		config = configparser.ConfigParser(interpolation=None)
		config.read(os.path.join(os.path.dirname(__file__), '../../metadata.txt'))
		version = config.get('general', 'version')
		return version

	@staticmethod
	def getEPSG():
		config = configparser.ConfigParser(interpolation=None)
		config.read(os.path.join(os.path.dirname(__file__), '../../metadata.txt'))
		epsg = config.get('general', 'epsg')
		return epsg