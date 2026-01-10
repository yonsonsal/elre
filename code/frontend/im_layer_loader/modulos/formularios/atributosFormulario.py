
import qgis
from qgis.core import *
from qgis.gui import *

from ..servicios.serviciosCapas import ServiciosCapas
from ..utilidades.funcionesExportacion import FuncionesExportacion
from ..utilidades.funcionesGenericas import FuncionesGenericas

class AtributosFormularios :

	@staticmethod
	def atributoRequerido(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)
		layer.setConstraintExpression(field_idx, atributo + ' IS NOT NULL')
	
	@staticmethod
	def atributoConstraint(nombreCapa, atributo, constraint):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)
		layer.setConstraintExpression(field_idx, constraint)

	@staticmethod
	def atributoSoloLectura(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)
		form_config = layer.editFormConfig()
		form_config.setReadOnly(field_idx, True)
		layer.setEditFormConfig(form_config)

	@staticmethod
	def ocultarAtributo(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)
		widget_setup = QgsEditorWidgetSetup('Hidden', {})
		layer.setEditorWidgetSetup(field_idx, widget_setup)
		AtributosFormularios.setColumnaVisibleTablaValores(nombreCapa, atributo, False)

	@staticmethod
	def setColumnaVisibleTablaValores(nombreCapa, columnName, visible):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		config = layer.attributeTableConfig()
		columns = config.columns()
		for column in columns:
			if column.name == columnName:
				column.hidden = not visible
				break
		config.setColumns( columns )
		layer.setAttributeTableConfig( config )

	@staticmethod
	def cargaDateAtributo(nombreCapa, atributo, requerido):
		allowNull = True
		if requerido:
			allowNull = False
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		config = {'allow_null': allowNull, 'calendar_popup': True, 'display_format': 'dd/MM/yyyy', 'field_format': 'yyyy-MM-dd', 'field_iso_format': False}
		field_idx = layer.fields().indexFromName(atributo)
		widget_setup = QgsEditorWidgetSetup('DateTime', config)
		layer.setEditorWidgetSetup(field_idx, widget_setup)

	@staticmethod
	def cargaCodigueraAtributo(nombreCapa, atributo, list_values):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		config = {'map' : dict(list_values)}
		widget_setup = QgsEditorWidgetSetup('ValueMap', config)
		field_idx = layer.fields().indexFromName(atributo)
		layer.setEditorWidgetSetup(field_idx, widget_setup)
		
	@staticmethod
	def cargaTextAreaAtributo(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		config = {'IsMultiline': 'True'}
		field_idx = layer.fields().indexFromName(atributo)
		widget_setup = QgsEditorWidgetSetup('TextEdit', config)
		layer.setEditorWidgetSetup(field_idx, widget_setup)

	@staticmethod
	def cargaTextEditAtributo(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		config = {'IsMultiline': 'False'}
		field_idx = layer.fields().indexFromName(atributo)
		widget_setup = QgsEditorWidgetSetup('TextEdit', config)
		layer.setEditorWidgetSetup(field_idx, widget_setup)
		
	@staticmethod
	def cargaCheckBoxAtributo(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		config = {'CheckedState': 'true', 'UncheckedState': 'false'}
		field_idx = layer.fields().indexFromName(atributo)
		widget_setup = QgsEditorWidgetSetup('CheckBox', config)
		layer.setEditorWidgetSetup(field_idx, widget_setup)

	@staticmethod
	def configuraLabel(nombreCapa, atributo, label):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)
		layer.setFieldAlias(field_idx, label)

	@staticmethod
	def resetCampoPredeterminado(nombreCapa, atributo):
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)

		default_value_obj = QgsDefaultValue('', False)
		layer.setDefaultValueDefinition(field_idx, default_value_obj)

	@staticmethod
	def configuraCampoDefault(nombreCapa, atributosCapa, atributo, persistible, nombreUsuario, aplicacion, valorCalculado):
		expresionCampoDefault = ""
		#expresionCampoDefault='getNombreMunicipioDadosXY( $x, $y )'
		if "python" in valorCalculado:
			funcion = valorCalculado.split("::")[1]
			expresionCampoDefault = funcion
		else:
			nombreTabla = atributosCapa['nombreTabla']
			pk = atributosCapa['pk']
			expresionCampoDefault="getCampoDefault( "+"'"+nombreTabla+"'"+", "+"'"+pk+"'"+", "+"'"+atributo+"'"+","+"'"+nombreUsuario+"'"+", "+"'"+aplicacion+"'"+"  )"

		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
		field_idx = layer.fields().indexFromName(atributo)

		default_value_obj = QgsDefaultValue(expresionCampoDefault, persistible)
		layer.setDefaultValueDefinition(field_idx, default_value_obj)	

	@staticmethod
	def cargarCamposCalculados(nombreUsuario, nombreCapa, atributosCapa, atributosFormulario, aplicacion):

		diccionarioCamposCalculados = dict()
		for clave, valor in atributosFormulario.items():
			valorCalculado = ""
			mostrar = False
			persistible = False

			if "valorCalculado" in valor:
				valorCalculado = valor["valorCalculado"]
			if "persistible" in valor:
				persistible = valor["persistible"]
			if "show" in valor:
				mostrar = valor["show"]

			if valorCalculado != "" and mostrar and not persistible:
				diccionarioCamposCalculados[valor["nombre"]]=valor["label"]

		cantidadCamposCalculados = len(diccionarioCamposCalculados)

		if cantidadCamposCalculados > 0:
			url = FuncionesGenericas.getUrlServicios(aplicacion)
			nombreActionCamposCalculados = "Ver Campos Calculados"
			nombreCortoActionCamposCalculados = "Ver Campos Calculados"
			layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]

			actionManager = layer.actions()
			actions = actionManager.actions()
			if len(actions) > 0:
				for a in actions:
					if a.name() == nombreActionCamposCalculados:
						layer.actions().removeAction(a.id())

			nombreTabla = atributosCapa['nombreTabla']
			pk = atributosCapa['pk']
			geometry = "the_geom"
			if pk.isupper():
				geometry = "THE_GEOM"
			comilla = "'"
			dobleComilla = '"'
			mas = "+"
			abre = comilla + dobleComilla + comilla + mas
			cierra = mas + comilla + dobleComilla + comilla
			text_comand = "from qgis.utils import iface"
			text_comand += "\nfrom qgis.PyQt import QtWidgets"
			text_comand += "\nimport requests"
			text_comand += "\nimport json"
			text_comand += "\n"
			text_comand += "\npry=QgsProject.instance()"
			text_comand += "\nurl = '" + url + "'"
			text_comand += "\n"
			text_comand += "\nlayer = iface.activeLayer()"
			text_comand += "\nuser = layer.source().split(' ')[0].split('=')[1].replace('\\'','') "
			text_comand += "\ngeom = [% "+abre+" geom_to_wkt(  $geometry, 10 ) "+cierra+" %]"
			text_comand += "\n"
			text_comand += "\nnombreTabla = '" + nombreTabla +"'"
			text_comand += "\n"
			text_comand += "\nheaders = {'Accept': 'application/json'}"
			text_comand += "\n"
			text_comand += "\ndata = {'"+geometry+"': geom}"
			text_comand += '\nif str([%  '+dobleComilla+pk+dobleComilla+'  %]) != '+dobleComilla+dobleComilla+' and str([%  '+dobleComilla+pk+dobleComilla+'  %]) != '+dobleComilla+'0'+dobleComilla+' : '
			text_comand += "\n	data = {'"+pk+"' : ([%  "+dobleComilla+pk+dobleComilla+"  %]), '"+geometry+"': geom}"
			text_comand += "\nurlPost = url+'getCalcFields?tabla='+nombreTabla+'&username='+user"
			text_comand += "\nresponse = requests.post(urlPost, json=data, verify=False, headers=headers)"
			text_comand += "\ncamposCalculados = response.json()"
			text_comand += "\n"
			text_comand += "\nQtWidgets.QMessageBox.information(None, 'Campos Calculados', "
			i = 1
			for nombre, etiqueta in diccionarioCamposCalculados.items():
				if i == cantidadCamposCalculados:
					text_comand += "\n'"+etiqueta+": ' + camposCalculados['"+nombre+"']"
				else:
					text_comand += "\n'"+etiqueta+": ' + camposCalculados['"+nombre+"'] + '\\n' + "
				i=i+1
			text_comand += "\n)"

			#LAS VERSIONES NUEVAS DE QGIS >= 3.30 REQUIEREN SE PASE EL Qgis.AttributeActionType
			#LAS ANTERIORES VERSIONES < 3.30 REQUIEREN EL ENUMERADO
			try:
				actionType = Qgis.AttributeActionType.GenericPython
			except:
				actionType = 1

			camposCalculadosAction = QgsAction(actionType,
											   nombreActionCamposCalculados,
											   text_comand,
											   None,
											   capture=False,
											   shortTitle=nombreCortoActionCamposCalculados,
											   actionScopes={'Form', 'Canvas', 'Field', 'Feature'},
											   notificationMessage=''
											   )
			layer.actions().addAction(camposCalculadosAction)

	@qgsfunction(args='auto', group='CamposDefault', usesgeometry=True, referenced_columns=[])
	def getCampoDefault(nombreTabla, pk, atributo, nombreUsuario, aplicacion, feature, parent):
		geom = feature.geometry().asWkt()

		valuePk = feature.attribute(pk)
		geometry = "the_geom"
		if pk.isupper():
			geometry = "THE_GEOM"
		data = {geometry: geom}
		if pk != "" and valuePk is not None and valuePk != qgis.core.NULL:
			if type(valuePk) == int or type(valuePk) == float:
				valuePk = int(valuePk)
			data = {geometry: geom, pk: valuePk}
		if atributo != "" and feature.attribute(atributo) is not None and feature.attribute(atributo) != qgis.core.NULL:
			dato = feature.attribute(atributo)
		else:
			dato = ServiciosCapas.obtenerValorCalculado(nombreTabla, nombreUsuario, data, atributo, aplicacion)
		return dato

	@staticmethod
	def cargarAccionParaVerInfoRelacionada(nombreCapa, capaReferenciada, nombreAtributo, label, pk):
		if label == "":
			label = nombreAtributo

		nombreAction = "Ver Info " + nombreCapa + " ("+label+")"
		nombreCortoAction = "Ver Info " + nombreCapa + " ("+label+")"
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]

		actionManager = layer.actions()
		actions = actionManager.actions()
		if len(actions) > 0:
			for a in actions:
				if a.name() == nombreAction:
					layer.actions().removeAction(a.id())

		comilla = "'"
		dobleComilla = '"'
		barra = "\\"
		text_comand = "from qgis.utils import iface"
		text_comand += "\nfrom qgis.PyQt import QtWidgets"
		text_comand += "\n"
		text_comand += "\ngidCapaBusco = None"
		text_comand += '\nif str([%   '+dobleComilla+nombreAtributo+dobleComilla+'  %]) != '+dobleComilla+dobleComilla+':'
		text_comand += "\n  gidCapaBusco = str([%  "+dobleComilla+nombreAtributo+dobleComilla+"  %]) "
		text_comand += "\n  layer_name = '" + capaReferenciada + "'"
		text_comand += "\n  attribute_name = '" + pk + "'"
		text_comand += "\n  layer = QgsProject.instance().mapLayersByName(layer_name)[0]"
		text_comand += "\n  layer.rollBack()"
		text_comand += "\n  search_value = gidCapaBusco"
		text_comand += "\n  print(search_value)"
		text_comand += "\n  expression = QgsExpression(f'"+dobleComilla+"{attribute_name}"+dobleComilla+" = "+barra+comilla+"{search_value}"+barra+comilla+comilla+")"
		text_comand += "\n  if expression.hasParserError():"
		text_comand += '\n    print("Error en la expresion:", expression.parserErrorString())'
		text_comand += "\n  else:"
		text_comand += "\n    request = QgsFeatureRequest(expression)"
		text_comand += "\n    feature_iterator = layer.getFeatures(request)"
		text_comand += "\n    encontre=False"
		text_comand += "\n    for element in feature_iterator:"
		text_comand += "\n      iface.openFeatureForm(layer, element)"
		text_comand += "\n      encontre=True"
		text_comand += "\n      break"
		text_comand += "\n    if not encontre:"
		text_comand += "\n      QtWidgets.QMessageBox.information(None, 'Abrir Formulario', 'No se encontró elemento ' + search_value + '.')"

		#LAS VERSIONES NUEVAS DE QGIS >= 3.30 REQUIEREN SE PASE EL Qgis.AttributeActionType
		#LAS ANTERIORES VERSIONES < 3.30 REQUIEREN EL ENUMERADO
		try:
			actionType = Qgis.AttributeActionType.GenericPython
		except:
			actionType = 1

		objAction = QgsAction(actionType,
										   nombreAction,
										   text_comand,
										   None,
										   capture=False,
										   shortTitle=nombreCortoAction,
										   actionScopes={'Form', 'Canvas', 'Field', 'Feature'},
										   notificationMessage=''
										   )
		layer.actions().addAction(objAction)
	@staticmethod
	def cargarAccionParaRelacionarElemento(nombreCapa, capaReferenciada, nombreAtributo, label, pk, aplicacion):

		if label == "":
			label = nombreAtributo

		nombreAction = "Asociar " + label + " a " + nombreCapa
		nombreCortoAction = "Asociar " + label + " a " + nombreCapa
		layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]

		actionManager = layer.actions()
		actions = actionManager.actions()
		if len(actions) > 0:
			for a in actions:
				if a.name() == nombreAction:
					layer.actions().removeAction(a.id())

		nombreCapa = aplicacion + ":" + nombreCapa
		archivo_accion = "relacionarElemento.txt"
		nombreArchivo  = FuncionesGenericas.obtenerPathArchivoComand(archivo_accion)

		file1 = nombreArchivo
		fw = open(file1, 'r')
		t_c = fw.read()
		text_comand = t_c.replace("capaReferenciada_a_remplazar", '\''+ capaReferenciada + '\'')
		text_comand = text_comand.replace("pk_a_remplazar", '\''+ pk + '\'')
		text_comand = text_comand.replace("nombreCapa_a_remplazar", '\''+ nombreCapa + '\'')
		text_comand = text_comand.replace("nombreAtributo_a_remplazar", '\''+ nombreAtributo + '\'')

		fw.close()

		#LAS VERSIONES NUEVAS DE QGIS >= 3.30 REQUIEREN SE PASE EL Qgis.AttributeActionType
		#LAS ANTERIORES VERSIONES < 3.30 REQUIEREN EL ENUMERADO
		try:
			actionType = Qgis.AttributeActionType.GenericPython
		except:
			actionType = 1

		objAction = QgsAction(actionType,
							  nombreAction,
							  text_comand,
							  None,
							  capture=False,
							  shortTitle=nombreCortoAction,
							  actionScopes={'Form', 'Canvas', 'Field', 'Feature'},
							  notificationMessage=''
							  )
		layer.actions().addAction(objAction)
		
	@staticmethod   
	def cargaCodigueraAtributoCapa(layerName, capaCodiguera, field, pk, value, desc, filter, allowNull):
		config = {'AllowMulti': False,
			'AllowNull': allowNull,
			'FilterExpression': filter,
			'Key': pk,
			'Layer': '',
			'NofColumns': 1,
			'OrderByValue': True,
			'UseCompleter': False,
			'Value': value,
			'Description': desc}

		layer = QgsProject.instance().mapLayersByName(layerName)[0]
		target_layer = QgsProject.instance().mapLayersByName(capaCodiguera)[0]
		config['Layer'] = target_layer.id()
		field_idx = layer.fields().indexFromName(field)
		widget_setup = QgsEditorWidgetSetup('ValueRelation',config)
		layer.setEditorWidgetSetup(field_idx, widget_setup)
            
