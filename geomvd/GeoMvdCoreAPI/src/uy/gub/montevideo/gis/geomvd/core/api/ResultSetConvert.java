package uy.gub.montevideo.gis.geomvd.core.api;

import java.io.*;
import java.nio.charset.Charset;
import java.sql.SQLException;
import java.util.*;
import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;


import org.geotools.data.*;
import org.geotools.data.shapefile.ShapefileDumper;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.geojson.feature.FeatureJSON;
import org.geotools.geometry.jts.JTSFactoryFinder;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.locationtech.jts.geom.*;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.kml.KMLWriter;

import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.core.fields.ReflectionCalcs;
import uy.gub.montevideo.gis.geomvd.util.*;

import static uy.gub.montevideo.gis.geomvd.util.Constants.CSV_COLUMN_SEPARATOR;

public class ResultSetConvert {

	public static String toSingleResult( ResultSet rs) throws SQLException {
		String result = "";
		if(rs.next()) {
			result = rs.getString(1);
		}
		return result;
	}

	public static List<Map<String, String>> toResultMap( ResultSet rs, boolean includeNullValues) throws SQLException {
		List<Map<String,String>> result = new ArrayList<Map<String, String>>();
		ResultSetMetaData rsMeta = rs.getMetaData();
		int columnCnt = rsMeta.getColumnCount();
		List<String> columnNames = new ArrayList<String>();
		for(int i=1;i<=columnCnt;i++) {
			columnNames.add(rsMeta.getColumnName(i));
		}
		int rowCount = 0;
		while(rs.next()) {
			rowCount++;
			Map<String,String> row = new HashMap<String, String>();
			for(int i=1;i<=columnCnt;i++) {
				String key = columnNames.get(i-1);
				String value = rs.getString(i);
				if (includeNullValues && value==null)
					row.put(key, "");
				else
					row.put(key, value);
			}
			row.put("_index", String.valueOf(rowCount));
			result.add(row);
		}
		return result;
	}

	public static JSONArray toJSONArray( ResultSet rs, boolean includeNullValues ) throws SQLException {
		//Object newObject = Class.forName("oracle.xdb.XMLType").newInstance();
		JSONArray resList = new JSONArray();
        ResultSetMetaData rsMeta = rs.getMetaData();
        int columnCnt = rsMeta.getColumnCount();
        List<String> columnNames = new ArrayList<String>();
        for(int i=1;i<=columnCnt;i++) {
            columnNames.add(rsMeta.getColumnName(i));
        }
        while(rs.next()) { 
            JSONObject obj = new JSONObject();
            try {
	            Field changeMap = obj.getClass().getDeclaredField("map");
	            changeMap.setAccessible(true);
	            changeMap.set(obj, new LinkedHashMap<>());
	            changeMap.setAccessible(false);
	        } catch (IllegalAccessException | NoSuchFieldException e) {
	            //CustomLogger.log().info("Error: " + e.getMessage());
	        }
            
            for(int i=1;i<=columnCnt;i++) {
                String key = columnNames.get(i-1);
				String value = null;
				//CustomLogger.log().debug("Leyendo columna: " + key);
				try {
					value = rs.getString(i);
				} catch (Exception e) { CustomLogger.log().warn("Error reading column value: " + key); }
                if (includeNullValues && value==null)
                	obj.put(key, "");
                else
                	obj.put(key, value);
            }
			resList.put(obj);
        }
	    return resList;
 	 }

	
	public static String toJSONString( ResultSet rs, boolean includeNullValues ) throws SQLException {
		return toJSONArray(rs, includeNullValues).toString();
	}
  
  
	public static String toCSVFile(String tabla, JSONArray rs, String basePath, Usuario usuario) throws IOException {
		String path = basePath;
		Map<String, String> valoresCalculados = ConfigParser.getInstance().getCalcFieldsNotPersistiblesAndToExportCSV(tabla);
		String filename = "report-"+RandomGenerator.getString(10)+".csv";
		File file = new File(path + "/" + filename);
		FileWriter fw = new FileWriter(file);
		//CustomLogger.log().info("Guardando reporte en " + file.getAbsolutePath());
		List<String> columnNames = new ArrayList<String>();
		for(int i=0; i<rs.length();i++) {
			JSONObject obj = rs.getJSONObject(i);
			// Inyecto campos calculados
			ReflectionCalcs.injectCalcFields(obj, valoresCalculados, usuario);
			// Inicializo las columnas solo 1 vez
			String row = "";
			if (columnNames.size()==0) {
				String headers="";
				for(String k:obj.keySet()) {
					columnNames.add(k);
					headers += k+ CSV_COLUMN_SEPARATOR;
				}
				headers = StringUtils.removeLastComma(headers);
				fw.append(headers);
		        fw.append('\n');
			}
			// Recorro los datos
			for(String col:columnNames) {
				row += obj.getString(col) + CSV_COLUMN_SEPARATOR;
			}
			row = StringUtils.removeLastComma(row);
            fw.append(row);
            fw.append('\n');
		}
       fw.flush();
       fw.close();
	  String reportsURL = GetPropertyValues.getInstance().getValue(ConfigProperties.REPORTS_BASE_URL.getValue());
	  return reportsURL+filename;
  }

    public static String toKMLFile(String tabla, JSONArray rs, String path, Usuario usuario) throws Exception {
		Map<String, String> valoresCalculados = ConfigParser.getInstance().getCalcFields(tabla);
		String filename = "report-"+RandomGenerator.getString(10)+".kml";
		File file = new File(path + "/" + filename);
		FileWriter fw = new FileWriter(file);
		//CustomLogger.log().info("Guardando reporte en " + file.getAbsolutePath());
		List<String> columnNames = new ArrayList<String>();
		KMLWriter kmlWriter = new KMLWriter();
		WKTReader wktReader = new WKTReader();
		fw.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
				"<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:kml=\"http://www.opengis.net/kml/2.2\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n" +
				"<Document>");
		for(int i=0; i<rs.length();i++) {
			JSONObject obj = rs.getJSONObject(i);
			// Inyecto campos calculados
			ReflectionCalcs.injectCalcFields(obj, valoresCalculados, usuario);
			// Convierto el wkt a geom, y de ahi a KML
			Geometry g;
			try { // POSTGRES
				g = wktReader.read(obj.getString("the_geom"));
			} catch (JSONException je) { // ORACLE
				g = wktReader.read(obj.getString("THE_GEOM"));
			}
			if (g==null)
				continue;
			fw.append("<Placemark>");
			fw.append(kmlWriter.write(g));
			fw.append("</Placemark>");
			fw.append('\n');
		}
		fw.append("</Document>\n" + "</kml>");
		fw.flush();
		fw.close();
		String reportsURL = GetPropertyValues.getInstance().getValue(ConfigProperties.REPORTS_BASE_URL.getValue());
		return reportsURL+filename;
    }

	public static String toSHPFile(String tabla, JSONArray rs, String path, Usuario usuario) throws Exception {
		String filename = "report-"+RandomGenerator.getString(10);

		List<String> columnNames = new ArrayList<String>();
		GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory(null);
		DefaultFeatureCollection featureCollection = null;
		SimpleFeatureType TYPE = null;
		WKTReader wktReader = new WKTReader();
		SimpleFeatureBuilder featureBuilder = null;
		// Recorremos los datos
		for(int i=0; i<rs.length();i++) {
			JSONObject obj = rs.getJSONObject(i);
			Geometry g = obj.has("the_geom")? wktReader.read(obj.getString("the_geom")) : wktReader.read(obj.getString("THE_GEOM"));
			if (g==null)
				continue;
			// Inyecto campos calculados
			// ReflectionCalcs.injectCalcFields(obj, valoresCalculados, usuario);
			// Inicializo EL TYPE en base a las columnas solo 1 vez

			if (TYPE==null) {
				String headers="";
				for(String k:obj.keySet()) {
					if (!k.toUpperCase().equals("THE_GEOM")) {
						columnNames.add(k);
						headers += (k.length()>10?(k.substring(0,9)+Integer.toString((int)(Math.random()*10))):k) + ":String,";
					}
				}
				headers = StringUtils.removeLastComma(headers);
				TYPE = DataUtilities.createType("Location",
						"the_geom:"+ g.getGeometryType() +":srid=4326" +","+headers
				);
				featureCollection = new DefaultFeatureCollection("temp-id",TYPE);
				CustomLogger.log().debug("Exportando: "+ g.getGeometryType());
			}

			featureBuilder = new SimpleFeatureBuilder(TYPE);
			if (g.getGeometryType().equals("Point")) {
				Point p = geometryFactory.createPoint(g.getCoordinate());
				featureBuilder.add(p);
			} else if (g.getGeometryType().equals("LineString")) {
				LineString ls = geometryFactory.createLineString(g.getCoordinates());
				featureBuilder.add(ls);
			} else if (g.getGeometryType().equals("Polygon")) {
				Polygon poly = geometryFactory.createPolygon(g.getCoordinates());
				featureBuilder.add(poly);
			} else {
				CustomLogger.log().warn("No se pudo convertir geometry de tipo: "+ g.getGeometryType());
			}

			// Recorro las columnas y cargo para cada una su valor
			for(String col:columnNames) {
				if (!col.toUpperCase().equals("THE_GEOM")) {
					featureBuilder.add(obj.getString(col));
				}
			}

			SimpleFeature feature = featureBuilder.buildFeature(null);
			CustomLogger.log().debug("Exportando feature: " + featureToString(feature));
			featureCollection.add(feature);
		}

		// Generar shape
		String filePath = (new File(path + "/" + filename)).getAbsolutePath();
		//CustomLogger.log().info("Guardando reporte en " + filePath);

		ShapefileDumper dumper = new ShapefileDumper(new File(path));
		dumper.setCharset(Charset.forName("UTF8"));
		dumper.dump(filename, featureCollection);

		String reportsURL = GetPropertyValues.getInstance().getValue(ConfigProperties.REPORTS_BASE_URL.getValue());

		//CustomLogger.log().info("Guardando: "+ filePath +".shp");
		return reportsURL+filename+".shp";
	}

	public static String toGeoJsonFile(String tabla, JSONArray rs, String path, Usuario usuario) throws Exception {
		String filename = "report-"+RandomGenerator.getString(10)+".geojson";
		File file = new File(path + "/" + filename);
		FileWriter fw = new FileWriter(file);
		// GeoJSON root element
		fw.append("{ \"type\": \"FeatureCollection\", \"features\": [");
		//CustomLogger.log().info("Guardando reporte en " + file.getAbsolutePath());
		List<String> columnNames = new ArrayList<String>();
		Map<String, String> valoresCalculados = ConfigParser.getInstance().getCalcFields(tabla);
		WKTReader wktReader = new WKTReader();
		SimpleFeatureBuilder featureBuilder = null;
		SimpleFeatureType TYPE = null;
		GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory(null);
		boolean primero = true;
		for(int i=0; i<rs.length();i++) {
			JSONObject obj = rs.getJSONObject(i);
			Geometry g = obj.has("the_geom")? wktReader.read(obj.getString("the_geom")) : wktReader.read(obj.getString("THE_GEOM"));
			if (g==null)
				continue;

			if (TYPE==null) {
				String headers="";
				for(String k:obj.keySet()) {
					if (!k.toUpperCase().equals("THE_GEOM")) {
						columnNames.add(k);
						headers += (k.length()>10?(k.substring(0,9)+Integer.toString((int)(Math.random()*10))):k) + ":String,";
					}
				}
				headers = StringUtils.removeLastComma(headers);
				TYPE = DataUtilities.createType("Location",
						"the_geom:"+ g.getGeometryType() +":srid=4326" +","+headers
				);
				CustomLogger.log().debug("Exportando: "+ g.getGeometryType());
			}

			featureBuilder = new SimpleFeatureBuilder(TYPE);
			if (g.getGeometryType().equals("Point")) {
				Point p = geometryFactory.createPoint(g.getCoordinate());
				featureBuilder.add(p);
			} else if (g.getGeometryType().equals("LineString")) {
				LineString ls = geometryFactory.createLineString(g.getCoordinates());
				featureBuilder.add(ls);
			} else if (g.getGeometryType().equals("Polygon")) {
				Polygon poly = geometryFactory.createPolygon(g.getCoordinates());
				featureBuilder.add(poly);
			} else {
				CustomLogger.log().warn("No se pudo convertir geometry de tipo: "+ g.getGeometryType());
			}

			// Inyecto campos calculados
			ReflectionCalcs.injectCalcFields(obj, valoresCalculados, usuario);
			// Inicializo las columnas solo 1 vez
			Map<String, Object> properties = new HashMap<String, Object>();

			// Recorro las columnas y cargo para cada una su valor
			for(String col:columnNames) {
				if (!col.toUpperCase().equals("THE_GEOM")) {
					featureBuilder.add(obj.getString(col));
				}
			}

			SimpleFeature feature = featureBuilder.buildFeature(null);
			FeatureJSON fjson = new FeatureJSON();
			StringWriter writer = new StringWriter();
			fjson.writeFeature(feature, writer);
			String json = writer.toString();
			CustomLogger.log().debug("Exportando feature: " + json);
			fw.append(json);
			// Si no es el ultimo
			if (i+1 < rs.length())
				fw.append(",");
		}
		fw.append("]}");
		fw.flush();
		fw.close();
		String reportsURL = GetPropertyValues.getInstance().getValue(ConfigProperties.REPORTS_BASE_URL.getValue());
		return reportsURL+filename;
	}


	static private String geometryCoordsToString(Coordinate[] coordinates) {
		String result = "";
		for(Coordinate c: coordinates)
			result += c.x + " " + c.y +", ";
		if (result.endsWith(", "))
			result = result.substring(0, result.length()-2);
		return result;
	}

	static private String featureToString(SimpleFeature feature) {
		String result = "[ \n";
		for ( org.opengis.feature.Property p : feature.getProperties()) {
			result += "{ ";
			result += " name: '" + p.getName() + "',";
			result += " value: '" +p.getValue() + "',";
			result += " type: '" +p.getType().toString() + "'";
			result += " }\n";
		}
		result += ']';
		return result;
	}

}
