package uy.gub.montevideo.gis.geomvd.core.fields;


import org.json.JSONObject;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

public class ReflectionCalcs {

    public static String invoke(String calc, JSONObject object, Usuario usuario) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        String[] classParts = calc.split("::");
        String className = classParts[0];
        String[] methodParts = classParts[1].split("\\(");
        String methodName = methodParts[0];
        String paramName = methodParts[1].replace(")","");
        if (!object.has(paramName)){
            //CustomLogger.log().warn("ReflectionCalcs: Valor en atributo calculado no encontrado: " + paramName);
            return "";
        }
        String paramvalue = object.get(paramName).toString();
        //CustomLogger.log().info("Ejecutando reflection calc:" + className + " . " + methodName + " -> " + paramName +"="+paramvalue);
        Class<?> c = Class.forName(className);
        Class[] parameterTypes = { String.class, Usuario.class };  // Por ahora solo puede recibir un solo parametro, de tipo string (casi siempre el gid)
        Method method = c.getDeclaredMethod(methodName, parameterTypes);
        Object res = method.invoke(null, new Object[] { paramvalue, usuario });
        return res.toString();
    }


    public static void injectCalcFields(JSONObject obj, Map<String, String> valoresCalculados, Usuario usuario) {
        if (valoresCalculados != null) {
            for (String atributo : valoresCalculados.keySet()) {
                try {
                    // CustomLogger.log().info("Calculando valor para " + atributo + ":" + valoresCalculados.get(atributo));
                    String invoke = ReflectionCalcs.invoke(valoresCalculados.get(atributo), obj, usuario);
                    obj.put(atributo, invoke);
                } catch (Exception e) {
                    CustomLogger.log().error("Error calculando valor de atributo " + atributo, e);
                }
            }
        }
    }
}
