package uy.gub.montevideo.gis.geomvd.geoserverext;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.geoserver.rest.RestBaseController;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.json.JSONArray;
import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.ConfigParser;
import uy.gub.montevideo.gis.geomvd.core.Datahandler;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;

/**
 * Endpoints de diagnóstico para confirmar que GeoServer descubre la extensión (Fase 1.2) y que
 * la resolución de config vía GeoServerResourceLoader + JNDI funciona end-to-end (Fase 2.4).
 * Sin lógica de negocio real todavía (eso es la Fase 3).
 */
@RestController
@RequestMapping(path = RestBaseController.ROOT_PATH + "/plugineta", produces = MediaType.APPLICATION_JSON_VALUE)
public class PluginetaPingController extends RestBaseController {

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("status", "ok", "extension", "PluginetaGeoserverExt");
    }

    @GetMapping("/ping/config")
    public Map<String, Object> pingConfig(@RequestParam(defaultValue = "workspace-demo") String appName) {
        List<Capa> capas = ConfigParser.getInstanceAppMap(appName).getAppData();
        List<String> nombres = capas.stream().map(Capa::getNombre).collect(Collectors.toList());
        return Map.of("appName", appName, "capasCargadas", capas.size(), "nombres", nombres);
    }

    @GetMapping("/ping/db")
    public Map<String, Object> pingDb() throws Exception {
        Usuario diagUser = new Usuario("plugineta-diag", null, null);
        JSONArray rs = Datahandler.selectAsJSONArray("pluginetaDS", "select gid from example_data.zones limit 3", false, diagUser);
        return Map.of("status", "ok", "filas", rs.length());
    }

    @GetMapping("/ping/jndi")
    public Map<String, Object> pingJndi() throws Exception {
        List<String> encontrados = new java.util.ArrayList<>();
        javax.naming.Context ctx = new javax.naming.InitialContext();
        listRecursive(ctx, "java:comp/env", encontrados);
        return Map.of("bindings", encontrados);
    }

    private void listRecursive(javax.naming.Context ctx, String path, List<String> out) {
        try {
            javax.naming.NamingEnumeration<javax.naming.NameClassPair> list = ctx.list(path);
            while (list.hasMore()) {
                javax.naming.NameClassPair ncp = list.next();
                String childPath = path + "/" + ncp.getName();
                out.add(childPath + " (" + ncp.getClassName() + ")");
                if (ncp.getClassName().contains("Context")) {
                    listRecursive(ctx, childPath, out);
                }
            }
        } catch (Exception e) {
            out.add(path + " -> ERROR: " + e);
        }
    }
}
