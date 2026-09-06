package uy.gub.montevideo.gis.geomvd.geoserverext;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import javax.servlet.http.HttpServletRequest;
import org.geoserver.platform.GeoServerResourceLoader;
import org.geoserver.rest.RestBaseController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sirve el plugin QGIS como repositorio propio (plugins.xml + zip) para que se instale/actualice
 * desde QGIS (Plugin Manager > Settings > Plugin Repositories), en vez de "Install from ZIP" manual.
 * Los archivos viven en data_dir (plugineta-config/plugin-repo/), no en el jar de la extensión —
 * publicar una version nueva es reemplazar el .zip y editar repo.properties, sin recompilar nada.
 *
 * Queda bajo el mismo prefijo /rest/plugineta/** que el resto de la extensión, así que hereda la
 * misma regla de seguridad (IS_AUTHENTICATED_FULLY, ver rest.properties) — en QGIS, el repositorio
 * se agrega con una Authentication Configuration (Basic) igual que cualquier capa del plugin.
 */
@RestController
@RequestMapping(path = RestBaseController.ROOT_PATH + "/plugineta/repo")
public class PluginetaRepoController extends RestBaseController {

    private static final String[] REPO_DIR = {"plugineta-config", "plugin-repo"};

    private final GeoServerResourceLoader resourceLoader;

    public PluginetaRepoController(GeoServerResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping("/plugins.xml")
    public ResponseEntity<byte[]> plugins(HttpServletRequest request) throws IOException {
        Properties repo = loadRepoProperties();
        String repoRoot = baseUrl(request) + RestBaseController.ROOT_PATH + "/plugineta/repo/";
        String downloadUrl = repoRoot + repo.getProperty("fileName");

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.append("<plugins>\n");
        xml.append("  <pyqgis_plugin name=\"").append(esc(repo.getProperty("name")))
                .append("\" version=\"").append(esc(repo.getProperty("version"))).append("\">\n");
        xml.append("    <description>").append(esc(repo.getProperty("description"))).append("</description>\n");
        xml.append("    <about>").append(esc(repo.getProperty("about"))).append("</about>\n");
        xml.append("    <version>").append(esc(repo.getProperty("version"))).append("</version>\n");
        xml.append("    <qgis_minimum_version>").append(esc(repo.getProperty("qgisMinimumVersion")))
                .append("</qgis_minimum_version>\n");
        xml.append("    <homepage>").append(esc(repo.getProperty("homepage"))).append("</homepage>\n");
        xml.append("    <file_name>").append(esc(repo.getProperty("fileName"))).append("</file_name>\n");
        xml.append("    <author_name>").append(esc(repo.getProperty("author"))).append("</author_name>\n");
        xml.append("    <download_url>").append(esc(downloadUrl)).append("</download_url>\n");
        xml.append("    <experimental>").append(esc(repo.getProperty("experimental", "False"))).append("</experimental>\n");
        xml.append("    <deprecated>").append(esc(repo.getProperty("deprecated", "False"))).append("</deprecated>\n");
        xml.append("    <tracker>").append(esc(repo.getProperty("tracker"))).append("</tracker>\n");
        xml.append("    <repository>").append(esc(repoRoot + "plugins.xml")).append("</repository>\n");
        xml.append("  </pyqgis_plugin>\n");
        xml.append("</plugins>\n");

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("application/xml;charset=UTF-8"))
                .body(xml.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/{fileName:.+\\.zip}")
    public ResponseEntity<byte[]> download(@PathVariable String fileName) throws IOException {
        File dir = resourceLoader.findOrCreateDirectory(REPO_DIR);
        File zip = new File(dir, fileName);
        if (!zip.isFile()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.valueOf("application/zip"))
                .body(readAllBytes(zip));
    }

    private Properties loadRepoProperties() throws IOException {
        File dir = resourceLoader.findOrCreateDirectory(REPO_DIR);
        File propsFile = new File(dir, "repo.properties");
        Properties props = new Properties();
        try (InputStream in = new FileInputStream(propsFile)) {
            props.load(in);
        }
        return props;
    }

    /**
     * Respeta X-Forwarded-Proto/Host (ngrok/Cloudflare Tunnel los setean) para que download_url
     * apunte al hostname público real, no al localhost:8080 interno del contenedor.
     */
    private String baseUrl(HttpServletRequest request) {
        String proto = request.getHeader("X-Forwarded-Proto");
        if (proto == null || proto.isEmpty()) {
            proto = request.getScheme();
        }
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isEmpty()) {
            host = request.getServerName();
            int port = request.getServerPort();
            if (port != 80 && port != 443) {
                host = host + ":" + port;
            }
        }
        return proto + "://" + host + request.getContextPath();
    }

    private static byte[] readAllBytes(File file) throws IOException {
        try (InputStream in = new FileInputStream(file)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) {
                out.write(buf, 0, n);
            }
            return out.toByteArray();
        }
    }

    private static String esc(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
