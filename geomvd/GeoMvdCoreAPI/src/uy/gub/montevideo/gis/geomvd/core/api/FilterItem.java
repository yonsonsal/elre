package uy.gub.montevideo.gis.geomvd.core.api;

import java.util.HashMap;

public class FilterItem {

	public int gid;
	public HashMap<String,String> properties;

	public FilterItem() {
		properties = new HashMap<String, String>();
	}
	
	public FilterItem(int gid) {
		this.gid = gid;
		properties = new HashMap<String, String>();
	}

	public int getGid() {
		return gid;
	}

	public void setGid(int gid) {
		this.gid = gid;
	}

	public HashMap<String, String> getProperties() {
		return properties;
	}

	public void setProperties(HashMap<String, String> properties) {
		this.properties = properties;
	}
	
	
	
}
