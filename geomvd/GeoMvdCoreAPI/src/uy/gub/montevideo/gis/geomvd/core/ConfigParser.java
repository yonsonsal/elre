package uy.gub.montevideo.gis.geomvd.core;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.*;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

public class ConfigParser{

	// lectura de los archivos .app para su utilizacion	
	private static ConfigParser instance; // =  new ConfigParser();
	
	private static Map<String,ConfigParser> instanceMap; // =  new ConfigParser();

	public static void init(String APPLICATION_NAME) {
		if (instance==null) {
			instance = new ConfigParser(APPLICATION_NAME, "APP");
		}
	}

	private ConfigParser(String APPLICATION_NAME, String tipoApp) {
		try {
			CustomLogger.log().info("Inicializando Configuracion " + APPLICATION_NAME);
			
			if(tipoApp.equalsIgnoreCase("APP")) {
				GetPropertyValues.initProperties(APPLICATION_NAME);
			}
			
			if(!APPLICATION_NAME.equalsIgnoreCase("geomvd")) {
				leerDatos(APPLICATION_NAME, tipoApp);
			}
		} catch (ParserConfigurationException | SAXException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static  ConfigParser getInstanceAppMap(String APPLICATION_NAME) {

		if (instanceMap==null) {
			instanceMap = new HashMap<String,ConfigParser>();
		}
		if (instanceMap.get(APPLICATION_NAME)==null ){
			instanceMap.put(APPLICATION_NAME, new ConfigParser(APPLICATION_NAME, "API"));
		}
		return instanceMap.get(APPLICATION_NAME);

	}

	private List<Capa> appData = new ArrayList<Capa>();
	private List<Layer> layersAPP = new  ArrayList<Layer>();
	private String codiguerasJSON;
	
	private void leerDatos(String APPLICATION_NAME, String tipoApp) throws ParserConfigurationException, SAXException, IOException {
		List<Document> doc_app = new ArrayList<Document>();
		
		Map<String, Document> doc_ori = new LinkedHashMap<String,  Document>();
		Map<String, Document> doc_xml = new LinkedHashMap<String,  Document>();
		
		String basePath = "";
		if(tipoApp.equalsIgnoreCase("API")) {
			basePath = GetPropertyValues.getInstance().getConfigBasePath() + "/" + APPLICATION_NAME;
		}
		else {
			basePath = GetPropertyValues.getInstance().getConfigBasePath();
		}
		File files = new File(basePath);
		//CustomLogger.log().info("Leyendo configuracion desde:" + basePath);
		if (files==null || !files.exists()) {
			CustomLogger.log().error("No se puede acceder a los archivos de configuracion en: " + basePath);
			return;
		}
		
		Document doc;
		DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
		for (File ficheroEntrada : files.listFiles()) {
	       
			String fileName = ficheroEntrada.getName();
			File file = new File(Paths.get(basePath, fileName).toString());
			try {
				//CustomLogger.log().info("Leyendo archivo " + fileName);
				
				String[] parts = fileName.split("\\.");
				
				if (parts[parts.length-1].equals("app")){
					doc = builder.parse(file);
					doc.getDocumentElement().normalize();
					doc_app.add(doc);
				}
				else if (parts[parts.length-1].equals("ori")){
					doc = builder.parse(file);
					doc.getDocumentElement().normalize();
					doc_ori.put(fileName, doc);
				}
				else if (parts[parts.length-1].equals("xml")){
					doc = builder.parse(file);
					doc.getDocumentElement().normalize();
					doc_xml.put(fileName, doc);
				}
			
			} catch (SAXException | FileNotFoundException e) {
				// Se agrega try-catch para que la aplicacion levante aun si hay problemas con algun archivo
				CustomLogger.log().error("Error leyento configuracion de: " + fileName);
				e.printStackTrace();
			}
		}

//////////Recoro los documentos para generar el mapa con las aplicaciones y sus capas   ///////////////////////////////////////////////////
		
		for (Document doc_aux :doc_app) {
			NodeList nodeList =	doc_aux.getElementsByTagName("aplicacion");
			Node data = nodeList.item(0).getAttributes().getNamedItem("nombre");
			String aplicacion = data.getNodeValue();
			nodeList =	doc_aux.getElementsByTagName("capa");
			
			Map<String, Capa> capasMAP = new LinkedHashMap<String,  Capa>();
			List<Capa> capas = new ArrayList<Capa>();
			
			int cant = nodeList.getLength();
		
			Capa capa;
			
			//CustomLogger.log().info("Leyendo app " + aplicacion + "|Capas:" + cant);
			
			for (int i = 0; i < cant; i++) {
				
				capa = new Capa();
				
				Map<String, AtributoCapa> atributos = new LinkedHashMap<String,  AtributoCapa>();
				try {
					
					Node current = nodeList.item(i);
					data = current.getAttributes().getNamedItem("nombre");
					capa.setNombre(data != null?data.getNodeValue():null);

					//CustomLogger.log().info("Leyendo capa " + capa.getNombre());
					
					////Busco el md donde esta definida los atributos de la capa///////
					
					data = current.getAttributes().getNamedItem("metadata");
					if (data != null) {
						Document mdAux = doc_xml.get(data.getNodeValue());
						analyzingMD(mdAux, capa, atributos);
					}
					///Fin de analisis y obtener datos del md///////////////////////////
					
					////Busco el ori donde esta definida los datos de la capa///////
					
					data = current.getAttributes().getNamedItem("datos");
					Document ori = doc_ori.get(data.getNodeValue());
					analyzingORI(ori,atributos,capa);
					
					///Fin de analisis y obtener datos del ori///////////////////////////
					
					data = current.getAttributes().getNamedItem("roleedit");
					capa.setRoleedit(data != null?data.getNodeValue():null);
					
					data = current.getAttributes().getNamedItem("roleeditparcial");
					capa.setRoleeditparcial(data != null?data.getNodeValue():null);
					
					data = current.getAttributes().getNamedItem("visible");
					capa.setVisible(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):false);
					
					data = current.getAttributes().getNamedItem("editable");
					capa.setEditable(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					data = current.getAttributes().getNamedItem("geomedit");
					capa.setGeomedit(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					data = current.getAttributes().getNamedItem("alta");
					capa.setAlta(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					data = current.getAttributes().getNamedItem("baja");
					capa.setBaja(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					
					data = current.getAttributes().getNamedItem("autocommit");
					capa.setAutocommit(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):false);
					
					data = current.getAttributes().getNamedItem("canSplit");
					capa.setCanSplit(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					
					data = current.getAttributes().getNamedItem("canDeleteVertex");
					capa.setCanDeleteVertex(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					
					data = current.getAttributes().getNamedItem("canClone");
					capa.setCanClone(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):true);
					
					data = current.getAttributes().getNamedItem("canMerge");
					capa.setCanMerge(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):false);
					
					data = current.getAttributes().getNamedItem("tipo");
					capa.setTipo(data != null?data.getNodeValue():null);
					
					data = current.getAttributes().getNamedItem("estilo");
					capa.setEstilo(data != null?data.getNodeValue():null);
					
					
					
					capas.add(capa);
					capasMAP.put(capa.getNombre(), capa);
				
				} catch (Exception e) {
					CustomLogger.log().error("Ocurrio un error leyendo el archivo de capa :" + capa.getNombre() + ":" + e.getMessage());
					e.printStackTrace();
				}

			}
			
			Collections.reverse(capas);
			
			for (Capa auxCap: capas) {				
				for(Map.Entry<String, AtributoCapa> entry : auxCap.getAtributos().entrySet()) {
				    AtributoCapa value = entry.getValue();
				    
				    if (value.getCapaReferenciada() != null) {
				    	Capa cap = capasMAP.get(value.getCapaReferenciada());
				    	value.setCapa(cap);
				    	
				    	if (value.getTipo().contains("ExternalAttribute")) {
							cap.setEsCodiguera(true);
						}
				    	
				    }
				}		
				
				//atributosJSON.put(auxCap.getNombre(), generateAtributoJSON(auxCap));
			}

			appData = capas;
			setCodiguerasJSON(generateCodiguerasJSON(capas));
			
		}
	}
	
	
	
	
	private String generateCodiguerasJSON(List<Capa> capasAPP) {
		List<Capa> codigereas = new ArrayList<Capa>();
				
		for (Capa cp : capasAPP){
			if (cp.isEsCodiguera()) {
				codigereas.add(cp);
			}
		}
		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String json = gson.toJson(codigereas);

		return json;
	}
	
	

	////////////////////////////////////////////////////////////////////////
	///////Funciones auxiliares para el analisis de los archivos////////////
	////////////////////////////////////////////////////////////////////////
	private void analyzingORI(Document ori, Map<String, AtributoCapa> atributos,Capa capa ) {
		NodeList nodeListORI = ori.getElementsByTagName("atributo");//elemento
		
		int cantAtr = nodeListORI.getLength();
		
		Node data;
		
		for (int j = 0; j < cantAtr; j++) {
			
			AtributoCapa acapa;
			Node atri = nodeListORI.item(j);
			data = atri.getAttributes().getNamedItem("nombre");
			acapa = atributos.get(data.getNodeValue());

			if (acapa != null) {
				data = atri.getAttributes().getNamedItem("tipo");
				if (data != null) 
					acapa.setTipo(data.getNodeValue());		
				
				data = atri.getAttributes().getNamedItem("nillable");
				if (data != null) 
					acapa.setNillable(data.getNodeValue().toUpperCase().equals("TRUE"));	
				
				data = atri.getAttributes().getNamedItem("capa_referenciada");
				if (data != null) 
					acapa.setCapaReferenciada(data.getNodeValue());
				
				data = atri.getAttributes().getNamedItem("consultable");
				if (data != null) 
					acapa.setConsultable(data.getNodeValue().toUpperCase().equals("TRUE"));
				
				data = atri.getAttributes().getNamedItem("nombre_mostrar");
				if (data != null) 
					acapa.setNombreParaMostrar(data.getNodeValue());
				
				data = atri.getAttributes().getNamedItem("valorCalculado");
				if (data != null) 
					acapa.setValorCalculado(getNodeValue(atri, "valorCalculado"));
				
				
				data = atri.getAttributes().getNamedItem("persistible");
				if (data != null) 
					acapa.setPersistible(data.getNodeValue().toUpperCase().equals("TRUE"));
				
				data = atri.getAttributes().getNamedItem("validador");
				if (data != null) 
					acapa.setValidador(getNodeValue(atri, "validador"));
				
			}
			else {
				acapa = new AtributoCapa();
				acapa.setNombre(data != null?data.getNodeValue():null);			
				acapa.setTipo(getNodeValue(atri, "tipo"));
				
				data = atri.getAttributes().getNamedItem("nillable");
				acapa.setNillable(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):null);

				acapa.setCapaReferenciada(getNodeValue(atri, "capa_referenciada"));
				
				data = atri.getAttributes().getNamedItem("consultable");
				acapa.setConsultable(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):null);
				
				acapa.setNombreParaMostrar(getNodeValue(atri, "nombre_mostrar"));
				
				acapa.setValorCalculado(getNodeValue(atri, "valorCalculado"));
				
				data = atri.getAttributes().getNamedItem("persistible");
				acapa.setPersistible(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):false);
				
				acapa.setValidador(getNodeValue(atri, "validador"));
			
				atributos.put(acapa.getNombre(), acapa);
				
			}
			
		}
		
		nodeListORI = ori.getElementsByTagName("capa");//elemento
		if (nodeListORI.getLength() != 0) {
			data = nodeListORI.item(0).getAttributes().getNamedItem("grupo");
			capa.setGrupo(data != null?data.getNodeValue():null);
		}
		
		nodeListORI = ori.getElementsByTagName("atributo_tabla");//elemento
		cantAtr = nodeListORI.getLength();
		for (int j = 0; j < cantAtr; j++) {
			Node atri = nodeListORI.item(j);
			data = atri.getAttributes().getNamedItem("nombre_capa");
			
			if (data != null) {
				AtributoCapa acapa = atributos.get(data.getNodeValue());
				if (acapa != null) {
					acapa.setNombre_bd(getNodeValue(atri, "nombre_bd"));
				}
			}
		}
		capa.setAtributos(atributos);
				
		nodeListORI = ori.getElementsByTagName("workspace");//elemento
		if (nodeListORI.getLength() != 0) {
			DatosCapa dc = new DatosCapa();
			Node atri = nodeListORI.item(0);

			dc.setWorkspace(getNodeValue(atri, "nombre"));
			dc.setTipo(getNodeValue(atri, "tipo"));

			String epsg = getNodeValue(atri, "epsg");
			if (epsg == null || epsg.isEmpty()) {
				epsg = GetPropertyValues.getInstance().getValue("defaultEpsg");
			}
			dc.setEpsg(epsg);

			if (dc.getTipo().equals("WFS")){
				nodeListORI = ori.getElementsByTagName("style");//elemento
				atri = nodeListORI.item(0);
				capa.setStrokeColor(getNodeValue(atri, "strokeColor"));
				capa.setStrokeWidth(getNodeValue(atri, "strokeWidth"));
				capa.setFillColor(getNodeValue(atri, "fillColor"));
			}
			
			nodeListORI = ori.getElementsByTagName("capapublicada");//elemento
			atri = nodeListORI.item(0);
			dc.setLayer(getNodeValue(atri, "nombre"));
			dc.setNombreMostrar(getNodeValue(atri, "nombre_mostrar"));
			dc.setTilesOrigin(getNodeValue(atri, "tilesOrigin"));
			
			nodeListORI = ori.getElementsByTagName("origen_datos");//elemento
			if (nodeListORI.getLength() != 0) {
				data = nodeListORI.item(0).getAttributes().getNamedItem("tipo");
				dc.setTipoOrigen(data != null?data.getNodeValue():null);
				
				data = nodeListORI.item(0).getAttributes().getNamedItem("source");
				dc.setSource(data != null?data.getNodeValue():null);
				
				data = nodeListORI.item(0).getAttributes().getNamedItem("url");
				dc.setURL(data != null?data.getNodeValue():null);
			}
							
			capa.setDatos(dc);///seteo datoscapa en capa
		}
		else {
			nodeListORI = ori.getElementsByTagName("origen_datos");//elemento
			
			if (nodeListORI.getLength() != 0) {
				DatosCapa dc = new DatosCapa();

				dc.setTipoOrigen(getNodeValue(nodeListORI.item(0), "tipo"));

				dc.setSource(getNodeValue(nodeListORI.item(0), "source"));

				dc.setURL(getNodeValue(nodeListORI.item(0), "url"));

				dc.setTipo(getNodeValue(nodeListORI.item(0), "format"));

				dc.setLayer(getNodeValue(nodeListORI.item(0), "layer"));

				dc.setFormatToService(getNodeValue(nodeListORI.item(0), "formatToService"));
								
				capa.setDatos(dc);///seteo datoscapa en capa	
			}
			
		}
		
		nodeListORI = ori.getElementsByTagName("fuente");//elemento
		
		if (nodeListORI.getLength() != 0) {
			capa.setFuenteBD(getNodeValue(nodeListORI.item(0), "nombre"));

			capa.setDbms(getNodeValue(nodeListORI.item(0), "tipo"));
		}
		
		nodeListORI = ori.getElementsByTagName("tabla");//elemento
		
		if (nodeListORI.getLength() != 0) {
			capa.setNombreTabla(getNodeValue(nodeListORI.item(0), "nombre"));

			if (capa.getNombreTabla() != null && capa.getDatos() != null && capa.getDatos().getEpsg() != null) {
				SridRegistry.put(capa.getNombreTabla(), capa.getDatos().getEpsg());
			}

			capa.setNombreSecuencia(getNodeValue(nodeListORI.item(0), "secuencia"));

			capa.setPk(getNodeValue(nodeListORI.item(0), "pk"));
				
			capa.setComboValue(getNodeValue(nodeListORI.item(0), "comboValue") != null ? getNodeValue(nodeListORI.item(0), "comboValue") : capa.getPk());
			
			capa.setComboLabel(getNodeValue(nodeListORI.item(0), "comboLabel") != null ? getNodeValue(nodeListORI.item(0), "comboLabel") : null);
		}

	}
	
	private void analyzingMD(Document md, Capa capa, Map<String, AtributoCapa> atributos ) {
		NodeList nodeListMD =	md.getElementsByTagName("attribute");
		int cantAtr = nodeListMD.getLength();
		Node data;
		for (int i=0; i<cantAtr;i++) {
			Node atri = nodeListMD.item(i);
			
			AtributoCapa acapa = new AtributoCapa();
			
			acapa.setNombre(getNodeValue(atri, "name"));
			
			acapa.setUsage(getNodeValue(atri, "usage"));
			
			acapa.setPresentation(getNodeValue(atri, "presentation"));
			
			acapa.setReferenced_layer(getNodeValue(atri, "referenced_layer"));
			
			data = atri.getAttributes().getNamedItem("query_capable");
			acapa.setQuery_capable(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):null);
			
			acapa.setLabe(getNodeValue(atri, "label"));
			
			acapa.setSize(getNodeValue(atri, "size"));
			
			acapa.setColumns(getNodeValue(atri, "columns"));
			
			data = atri.getAttributes().getNamedItem("read_only");
			acapa.setRead_only(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):null);
			
			acapa.setRole_edit(getNodeValue(atri, "role_edit"));
			
			data = atri.getAttributes().getNamedItem("show");
			acapa.setShow(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):false);
			
			data = atri.getAttributes().getNamedItem("with_time");
			acapa.setWithtime(data != null?data.getNodeValue().toUpperCase().equals("TRUE"):null);

			acapa.setNoExportTo(getNodeValue(atri, "no_export_to"));
			
			acapa.setItsintheMD(true);
			
			atributos.put(acapa.getNombre(), acapa);
		}
		nodeListMD = md.getElementsByTagName("child");
		
		if (nodeListMD.getLength() != 0) {
			Node child = nodeListMD.item(0);
			Child hijo = new Child();
			
			hijo.setLayer(getNodeValue(child, "layer"));

			hijo.setParent_id_attribute(getNodeValue(child, "parent_id_attribute"));
			
			capa.setChild(hijo);
		}
	}

	public String findAttributeType(String tableName, String attName) {
		for (Capa capa : appData) {
			if (capa.getNombreTabla() != null && capa.getNombreTabla().equals(tableName))
				for (AtributoCapa a : capa.getAtributos().values())
					if (a.getNombre_bd() != null && a.getNombre_bd().toUpperCase().equals(attName.toUpperCase()))
						return a.getTipo();
		}
		return null;
	}
	
	
	private String getNodeValue(Node atri, String attributeName) {
		Node data = atri.getAttributes().getNamedItem(attributeName);
		return data != null?data.getNodeValue():null;
	}

///////////////////////////////////////////////////	
/////////////gets and sets//////////////////////////	
//////////////////////////////////////////////////////	


	public Capa findCapaByTableName(String tableName) {
		for(Capa capa : appData) {
			if (capa.getNombreTabla()!=null && capa.getNombreTabla().equals(tableName))
				return capa;
		}
		return null;
	}
	
	public Capa findCapa(String layer) {
		for(Capa capa : appData)
			if (capa.getNombre().equals(layer))
				return capa;
		return null;
	}

	public Map<String, String> getCalcFields(String tableName) {
		Map<String, String> calcFieldsMap = new HashMap<String, String>();
		Capa c = findCapaByTableName(tableName);
		for(AtributoCapa a : c.getAtributos().values()){
			if (a.getValorCalculado()!=null && a.getValorCalculado().length()>0){
				calcFieldsMap.put(a.getNombre(), a.getValorCalculado());
			} 		
		}
		return calcFieldsMap;
	}

	public Map<String, String> getCalcFieldsNotPersistiblesAndToExportCSV(String tableName) {
		Map<String, String> calcFieldsMap = new HashMap<String, String>();
		Capa c = findCapaByTableName(tableName);
		for (AtributoCapa a : c.getAtributos().values()) {
			if (a.getValorCalculado() != null && a.getValorCalculado().length() > 0
					&& (a.getPersistible() == null || !a.getPersistible())
					&& (a.getNoExporTo() == null || !a.getNoExporTo().equals("csv"))) {
				calcFieldsMap.put(a.getNombre(), a.getValorCalculado());
			}
		}
		return calcFieldsMap;
	}
	
	public List<Capa> getAppData() {
		return appData;
	}

	public String getCodiguerasJSON() {
		return codiguerasJSON;
	}

	public void setCodiguerasJSON(String codiguerasJSON) {
		this.codiguerasJSON = codiguerasJSON;
	}

	public static ConfigParser getInstance() {
		return instance;
	}
	
	public List<Layer> getLayersAPP() {
		return layersAPP;
	}


}
