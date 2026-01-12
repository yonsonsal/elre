package uy.gub.montevideo.gis.geomvd.core.fields;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;

public class GeometryCalcs {

    public static double getLength(Geometry geometry){
        return geometry.getLength();
    }

    public static Geometry getFromWKT(String geometryWKT) throws ParseException {
        WKTReader wktReader = new WKTReader();
        return wktReader.read(geometryWKT);
    }

}
