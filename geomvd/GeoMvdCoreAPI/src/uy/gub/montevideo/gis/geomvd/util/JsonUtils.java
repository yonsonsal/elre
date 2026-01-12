package uy.gub.montevideo.gis.geomvd.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.Layer;

public class JsonUtils {

    
	public static String generateJSON(List<Layer> capasAPP) {
		
		Map<String, String> grupLayer = new LinkedHashMap<String,  String>();
		
		String json = "[";
		
		
		for (Layer cp : capasAPP){
			
			if (cp.getGrupo() != null) {
				String jsonAux = grupLayer.get(cp.getGrupo());
			
				if (jsonAux == null) {
					jsonAux = "{" +
							     "\"groupTitle\": \"" + cp.getGrupo()  +  "\"," +
							     "\"groupLayers\":" + 
							     "[";
					
					jsonAux = jsonAux + cp.getJson() + ",";
					grupLayer.put(cp.getGrupo(), jsonAux);
					
					
				}
				else {
					jsonAux = jsonAux + cp.getJson() + ",";
					grupLayer.replace(cp.getGrupo(), jsonAux);
				}
			}

		}
		
		List<String> reverseOrderedKeys = new ArrayList<String>(grupLayer.keySet());
		Collections.reverse(reverseOrderedKeys);
		for (String key : reverseOrderedKeys) {
		    String value = grupLayer.get(key);
		    value = value.substring(0, value.length()-1);
		    value = value + "]},";
		    json = json + value;
		}

	
		String finAUx = "{"+
							"\"groupTitle\": \"Posicion\","+
							"\"groupLayers\": "+
							"["+
							"	{"+
							"		\"format\": \"GEOLOCATION\","+
							"		\"title\": \"Mi ubicacion\","+
							"		\"visible\": false"+
							"	}"+
							"]" +
					   "}" +
					 "]";
		
		json = json +  finAUx;
		
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		json = gson.toJson(json);
		
		
		return json;
	}
	
	public static String generateAtributoJSON(Capa cp) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		
		String json2 = gson.toJson(cp);
		
		return json2;
	}

}
