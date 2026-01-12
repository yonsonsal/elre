package uy.gub.montevideo.gis.geomvd.core.api;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

import uy.gub.montevideo.gis.geomvd.util.StringUtils;

public class ReportFilter {
	public List<String> gids;
	public HashMap<String,String> filters;
	public String columns;
	
	public ReportFilter() {
		filters = new LinkedHashMap<String,String>();
		gids= new ArrayList<String>();
	}

	public HashMap<String, String> getFilters() {
		return filters;
	}

	public void setFilters(HashMap<String, String> filters) {
		this.filters = filters;
	}

	public List<String> getGids() {
		return gids;
	}

	public void setGids(List<String> gids) {
		this.gids = gids;
	}

	public String getIdsAsString() {
		String result = "";
		for(String gid: gids)
			result += gid + ",";
		result = StringUtils.removeLastComma(result);
		return result;
	}
		
	
}
