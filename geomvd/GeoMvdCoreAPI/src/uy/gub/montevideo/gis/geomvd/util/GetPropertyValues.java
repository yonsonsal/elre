package uy.gub.montevideo.gis.geomvd.util;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

public class GetPropertyValues {

	private Path configBasePath;
	private Path configBasePathGeomvd;
	private Properties prop;
	private Properties propGeomvd;
	public static GetPropertyValues instance = null;
	public static GetPropertyValues instanceGeomvd = null;

	public static void initProperties(String applicationName) {
		if (instance == null) {
			try {
				instance = new GetPropertyValues(applicationName);
			} catch (IOException e) {
				System.out.println("Exception: " + e);
			}
		}
		getInstanceGeomvd();
		/*if (instanceGeomvd == null) {
			try {
				instanceGeomvd = new GetPropertyValues("geomvd");
			} catch (IOException e) {
				System.out.println("Exception: " + e);
			}
		}*/
	}

	public static GetPropertyValues getInstance() {
		return instance;
	}
	
	public static GetPropertyValues getInstanceGeomvd() {
		if (instanceGeomvd == null) {
			try {
				instanceGeomvd = new GetPropertyValues("geomvd");
			} catch (IOException e) {
				System.out.println("Exception: " + e);
			}
		}
		return instanceGeomvd;
	}

	protected GetPropertyValues(String applicationName) throws IOException {
		FileInputStream inputStream = null;
		FileInputStream inputStreamGeomvd = null;
		try {
			prop = new Properties();
			this.configBasePath = Paths.get(System.getProperty("jboss.server.config.dir"),"apps",applicationName) ;
			Path filepath = Paths.get(configBasePath.toString(), "config.properties" ) ;
			String fileName = filepath.toString();
			inputStream = new FileInputStream(fileName);
			if (inputStream != null) {
				prop.load(inputStream);
			} else {
				throw new FileNotFoundException("property file '" + fileName + "' not found");
			}
			
			propGeomvd = new Properties();
			this.configBasePathGeomvd = Paths.get(System.getProperty("jboss.server.config.dir"),"apps","geomvd") ;
			Path filepathGeomvd = Paths.get(configBasePath.toString(), "config.properties" ) ;
			String fileNameGeomvd = filepathGeomvd.toString();
			inputStreamGeomvd = new FileInputStream(fileNameGeomvd);
			if (inputStreamGeomvd != null) {
				propGeomvd.load(inputStreamGeomvd);
			} else {
				throw new FileNotFoundException("property file '" + fileNameGeomvd + "' not found");
			}
			//CustomLogger.log().info("Cargadas las properties: " + prop.toString());

		} catch (Exception e) {
			System.out.println("Exception: " + e);
		} finally {
			if (inputStream!=null)
				inputStream.close();
			if (inputStreamGeomvd!=null)
				inputStreamGeomvd.close();
		}
	}
	
	public String getValue(String key){
		return prop.getProperty(key);		
	}
	
	public String getValueGeomvd(String key){
		return propGeomvd.getProperty(key);		
	}

	public String getConfigBasePath() { return this.configBasePath.toString(); }
	
	public String getConfigBasePathGeomvd() { return this.configBasePathGeomvd.toString(); }
}