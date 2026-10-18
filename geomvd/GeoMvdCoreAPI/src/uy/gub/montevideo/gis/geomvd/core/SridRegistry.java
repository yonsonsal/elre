package uy.gub.montevideo.gis.geomvd.core;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mapa tabla -> EPSG, poblado por ConfigParser al leer cada .ori. Permite que las clases *Calcs
 * (invocadas por reflection, firma fija {String, Usuario}) consulten el SRID real de una capa sin
 * que haga falta agregarles un parámetro nuevo — ver plan de soporte multi-CRS, Fase 5.
 */
public class SridRegistry {

    private static final Map<String, String> registry = new ConcurrentHashMap<>();

    /**
     * SRID de la tabla que está siendo procesada en el hilo actual. Las clases *Calcs se invocan
     * por reflection con una firma fija ({String, Usuario}, ver ReflectionCalcs) que no admite
     * agregarles un parámetro de tabla/SRID — este ThreadLocal es cómo se les hace llegar el
     * contexto sin romper esa firma ni la de ReflectionCalcs/injectCalcFields. Lo setea/limpia
     * quien conoce la tabla (PluginetaLayersController.getCalcFields) alrededor de la llamada a
     * ReflectionCalcs.injectCalcFields.
     */
    private static final ThreadLocal<String> current = new ThreadLocal<>();

    private SridRegistry() {
    }

    public static void put(String nombreTabla, String epsg) {
        registry.put(nombreTabla, epsg);
    }

    public static String get(String nombreTabla) {
        return registry.get(nombreTabla);
    }

    public static void setCurrent(String epsg) {
        current.set(epsg);
    }

    public static String getCurrent() {
        return current.get();
    }

    public static void clearCurrent() {
        current.remove();
    }
}
