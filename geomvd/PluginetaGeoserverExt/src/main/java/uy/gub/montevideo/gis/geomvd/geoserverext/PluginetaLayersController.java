package uy.gub.montevideo.gis.geomvd.geoserverext;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.geoserver.rest.RestBaseController;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.core.SridRegistry;
import uy.gub.montevideo.gis.geomvd.core.fields.ReflectionCalcs;
import uy.gub.montevideo.gis.geomvd.util.JsonUtils;
import uy.gub.montevideo.gis.geomvd.util.RolesUtils;

/**
 * Port a GeoServer (extensión nativa, Spring MVC) de los endpoints de {@code DFRPublicLayerService}
 * (JAX-RS, código/backend/GeoMvd-App) que consume el plugin QGIS real. Mismo camino de negocio,
 * sin tocar GeoMvdCoreAPI: ConfigParser/SecurityHelper/RolesUtils/JsonUtils quedan intactos, solo
 * cambia la capa de anotaciones REST (plan de migración de plataforma, Fase 3).
 *
 * Único cambio de comportamiento real respecto al original: el username efectivo se toma del
 * usuario ya autenticado por GeoServer (LDAP) en vez de leerse sin validar desde un query param.
 *
 * El export CSV (antes {@code reportes/csv/{dbms}/{datasource}/{tabla}}) NO se porta: decisión
 * explícita del usuario (17/8/2026) — es una feature heredada de una arquitectura anterior; con
 * WFS-T editando directo contra GeoServer, ese export lo puede hacer QGIS nativamente.
 */
@RestController
@RequestMapping(path = RestBaseController.ROOT_PATH + "/plugineta/public/{appName}/layers")
public class PluginetaLayersController extends RestBaseController {

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getName() != null) ? auth.getName().toUpperCase() : "ANONYMOUS";
    }

    @GetMapping(path = "/atributocapaformat", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAtributoCapa(@PathVariable String appName, @RequestParam String capa, HttpServletRequest req) {
        ConfigParser data = ConfigParser.getInstanceAppMap(appName);
        Usuario user = SecurityHelper.getCurrentUser(currentUsername(), req);

        Capa capaAux = data.findCapa(capa);
        if (capaAux == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La capa : " + capa + " no tiene metadata");
        }

        capaAux = RolesUtils.getCapaswithRolesPlugineta(capaAux, user);
        return ResponseEntity.ok(JsonUtils.generateAtributoJSON(capaAux));
    }

    @GetMapping(path = "/codiguerasdata", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCodiguerasData(@PathVariable String appName, HttpServletRequest req) {
        ConfigParser data = ConfigParser.getInstanceAppMap(appName);
        Usuario user = SecurityHelper.getCurrentUser(currentUsername(), req);

        String codigueras = data.getCodiguerasJSON();
        JSONArray codArray = new JSONArray();
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        JsonArray convertedObject = gson.fromJson(codigueras, JsonArray.class);
        try {
            int cantCodi = convertedObject.size();
            int i = 0;
            while (i < cantCodi) {
                String datasource = convertedObject.get(i).getAsJsonObject().get("Origen_datos").getAsString();
                String tabla = convertedObject.get(i).getAsJsonObject().get("nombreTabla").getAsString();
                String pk = convertedObject.get(i).getAsJsonObject().get("pk").getAsString();
                String comboValue = convertedObject.get(i).getAsJsonObject().get("comboValue") != null
                        ? convertedObject.get(i).getAsJsonObject().get("comboValue").getAsString() : pk;
                String comboLabel = convertedObject.get(i).getAsJsonObject().get("comboLabel") != null
                        ? convertedObject.get(i).getAsJsonObject().get("comboLabel").getAsString() : "";
                String sql = "select * from " + tabla + " order by " + pk;
                JSONArray result = Datahandler.selectAsJSONArray(datasource, sql, false, user);
                String codi = convertedObject.get(i).getAsJsonObject().get("Nombre Capa").getAsString();

                JSONObject codiguera = new JSONObject();
                codiguera.put("Codiguera", codi);
                codiguera.put("comboValue", comboValue);
                codiguera.put("comboLabel", comboLabel);
                codiguera.put("Data", result == null ? new JSONArray() : result);
                codArray.put(codiguera);
                i++;
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
        return ResponseEntity.ok(codArray.toString());
    }

    @PostMapping(path = "/getCalcFields", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCalcFields(@PathVariable String appName, @RequestParam String tabla, HttpServletRequest req)
            throws java.io.IOException {
        // Nota: no se usa @RequestBody (ni Object ni String) porque el RequestMappingHandlerAdapter
        // de GeoServer registra convertidores XStream para el body de las peticiones REST, que
        // interpretan la primera clave del JSON como nombre de clase (CannotResolveClassException)
        // independientemente del tipo Java declarado. Se lee el body crudo directo del
        // HttpServletRequest, evitando por completo la resolución de HttpMessageConverter de Spring.
        Usuario user = SecurityHelper.getCurrentUser(currentUsername(), req);

        String body = req.getReader().lines().collect(java.util.stream.Collectors.joining());
        JSONObject object = new JSONObject(body);
        // Contexto de SRID para las clases *Calcs (ver plan multi-CRS, Fase 5): la firma fija de
        // ReflectionCalcs.invoke() ({String, Usuario}) no admite pasar la tabla/SRID como
        // parámetro, así que se publica via ThreadLocal en SridRegistry alrededor del cálculo.
        SridRegistry.setCurrent(SridRegistry.get(tabla));
        try {
            Map<String, String> valoresCalculados = ConfigParser.getInstanceAppMap(appName).getCalcFields(tabla);
            ReflectionCalcs.injectCalcFields(object, valoresCalculados, user);
            return ResponseEntity.ok(object.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } finally {
            SridRegistry.clearCurrent();
        }
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getLayers(@PathVariable String appName, HttpServletRequest req) {
        ConfigParser data = ConfigParser.getInstanceAppMap(appName);
        Usuario user = SecurityHelper.getCurrentUser(currentUsername(), req);
        return ResponseEntity.ok(JsonUtils.generateJSON(RolesUtils.getLayerswithRolesPlugineta(data.getAppData(), user)));
    }
}
