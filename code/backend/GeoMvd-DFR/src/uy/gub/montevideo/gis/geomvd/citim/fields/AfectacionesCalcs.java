package uy.gub.montevideo.gis.geomvd.citim.fields;


import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

public class AfectacionesCalcs {

    private static String datasourcePg = "nucleoDS";

    public static String getPadron(String geometria, Usuario usuario) throws Exception {
		
		String query = "select padron " + 
				"from mdg_parcelas pd where " + 
				"_st_contains(pd.the_geom, (select ST_GeomFromText('"+geometria+"',32721)))";

		return Datahandler.selectOneValue(datasourcePg, query, usuario);
	}
}
