package uy.gub.montevideo.gis.geomvd.geotools;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManager;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import uy.gub.montevideo.gis.geomvd.util.ConfigProperties;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;

import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Enumeration;

import javax.servlet.ServletOutputStream;


// @WebFilter annotation removed - filter is now registered in web.xml
public class GeoserverProxy implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest requestServlet = (HttpServletRequest) request;
        HttpServletResponse responseServlet = (HttpServletResponse) response;
        String requestURI = requestServlet.getRequestURI();

        // Check if GetPropertyValues instance is initialized
        if (GetPropertyValues.getInstance() == null) {
            chain.doFilter(requestServlet, responseServlet);
            return;
        }

        String geoserverproxyURL = GetPropertyValues.getInstance().getValue(ConfigProperties.URL_GEOSERVER_PROXY.getValue());

        if (geoserverproxyURL != null && geoserverproxyURL.contains(requestURI.replace("/wms", "").replace("/wfs", ""))) {
            String requestQuery = requestServlet.getQueryString();
            String layerName = requestServlet.getParameter("LAYERS");
            String method = requestServlet.getMethod();
            if (requestURI.contains("wms") && (requestQuery.contains("GetMap") || requestQuery.contains("GetLegendGraphic") || requestQuery.contains("GetFeatureInfo"))) {
	            try{
	                String redirectURI = getServidorMapasURL(requestURI)+"?"+requestQuery;
	                responseServlet.setHeader("Content-Type", "image/png");
	                responseServlet.setHeader("Content-Disposition", "inline; filename=" + layerName +".png");
	                URL website = new URL(redirectURI);
	                ReadableByteChannel rbc = Channels.newChannel(website.openStream());
	                ServletOutputStream output = responseServlet.getOutputStream();
	                byte[] buffer = new byte[256 * 1024];
	                ByteBuffer byteBuffer = ByteBuffer.wrap(buffer);
	                for (int length = 0; (length = rbc.read(byteBuffer)) != -1;) {
	                    output.write(buffer, 0, length);
	                    byteBuffer.clear();
	                }
	            } catch(Exception e) {
	                System.out.println("Error obteniendo mapas desde el proxy " + e.getMessage());
	                e.printStackTrace();
	                chain.doFilter(requestServlet, responseServlet);
	            }
	        } else if (requestURI.endsWith("/wfs") && method.equals("POST")) {
	            try{
	                String redirectURI = getServidorMapasURL(requestURI).replace("wms", "wfs");

	                // Leer body del POST request
	                String body = null;
	                StringBuilder stringBuilder = new StringBuilder();
	                BufferedReader bufferedReader = null;

	                try {
	                    InputStream inputStream = requestServlet.getInputStream();
	                    if (inputStream != null) {
	                        bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
	                        char[] charBuffer = new char[128];
	                        int bytesRead = -1;
	                        while ((bytesRead = bufferedReader.read(charBuffer)) > 0) {
	                            stringBuilder.append(charBuffer, 0, bytesRead);
	                        }
	                    } else {
	                        stringBuilder.append("");
	                    }
	                } catch (IOException ex) {
	                    throw ex;
	                } finally {
	                    if (bufferedReader != null) {
	                        try {
	                            bufferedReader.close();
	                        } catch (IOException ex) {
	                            throw ex;
	                        }
	                    }
	                }
	                body = stringBuilder.toString();

	                //System.out.println("Redirecting POST a " + redirectURI);
	                //System.out.println("Body " + body);

	                // Comienza el redirect
	                URL url = new URL(redirectURI);

	                // Ignorar errores del certificado SSL (especifico para la IM)
	                SSLContext ctx = SSLContext.getInstance("TLS");
	                ctx.init(new KeyManager[0], new TrustManager[] {new DefaultTrustManager()}, new SecureRandom());
	                SSLContext.setDefault(ctx);
	                HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
	                conn.setHostnameVerifier(new HostnameVerifier() {
	                    @Override
	                    public boolean verify(String arg0, SSLSession arg1) {
	                        return true;
	                    }
	                });
	                // Fin ignorar errores de SSL

	                // POST
	                conn.setRequestMethod("POST");
	                copyRequestHeaders(requestServlet, conn);
	                conn.setDoOutput(true);

	                try(OutputStream os = conn.getOutputStream()) {
	                    byte[] input = body.getBytes("utf-8");
	                    os.write(input, 0, input.length);
	                }

	                // Leer RESPONSE
	                int code = conn.getResponseCode();
	        		//System.out.println("Got response code: " + code);

	        		try(BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))){
	        			StringBuilder response2 = new StringBuilder();
	        			String responseLine = null;
	        			while ((responseLine = br.readLine()) != null) {
	        				response2.append(responseLine.trim());
	        			}
	        			//System.out.println("Response body: " + response2);
	        			responseServlet.getWriter().write(response2.toString());

	        		}

	            } catch(Exception e) {
	                System.out.println("Error obteniendo mapas desde el proxy " + e.getMessage());
	                e.printStackTrace();
	                chain.doFilter(requestServlet, responseServlet);
	            }
	        } else
	        	chain.doFilter(requestServlet, responseServlet);
        } else {
            chain.doFilter(requestServlet, responseServlet);           
        }
    }
    
    protected void copyRequestHeaders(HttpServletRequest servletRequest, HttpsURLConnection connection) {
        // Get an Enumeration of all of the header names sent by the client
        @SuppressWarnings("unchecked")
        Enumeration<String> enumerationOfHeaderNames = servletRequest.getHeaderNames();
        while (enumerationOfHeaderNames.hasMoreElements()) {
          String headerName = enumerationOfHeaderNames.nextElement();
 //         System.out.println("Copiando headers: "+headerName);
          if (!headerName.equalsIgnoreCase("host") && !headerName.equalsIgnoreCase("accept-encoding"))
        	  connection.setRequestProperty(headerName, servletRequest.getHeader(headerName));
        }
      }
    
    
    private String getServidorMapasURL(String url) {
    	String result = GetPropertyValues.getInstance().getValue(ConfigProperties.URLgeoserver.getValue()) + "/wms";
        return result;
    }

    @Override
    public void destroy() {
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    public GeoserverProxy() {
    }

    private static class DefaultTrustManager implements X509TrustManager {

        @Override
        public void checkClientTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {}

        @Override
        public void checkServerTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {}

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return null;
        }
    }
}
