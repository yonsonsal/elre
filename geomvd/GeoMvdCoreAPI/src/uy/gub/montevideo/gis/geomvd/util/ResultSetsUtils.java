package uy.gub.montevideo.gis.geomvd.util;

import java.util.Comparator;
import java.util.Map;

public class ResultSetsUtils {

    public static class Comparators {
        public static Comparator<Map<String,String>> MAP_ROW_INDEX = new Comparator<Map<String,String>>() {
            @Override
            public int compare(Map<String,String> o1, Map<String,String> o2) {
                int index_1 = Integer.parseInt(o1.get("_index"));
                int index_2 = Integer.parseInt(o2.get("_index"));
                return Integer.compare(index_1, index_2);
            }
        };
    }

}
