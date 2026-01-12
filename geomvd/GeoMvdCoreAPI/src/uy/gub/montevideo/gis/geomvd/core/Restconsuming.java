package uy.gub.montevideo.gis.geomvd.core;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;

import uy.gub.montevideo.gis.geomvd.util.ConfigProperties;
import uy.gub.montevideo.gis.geomvd.util.CustomLogger;
import uy.gub.montevideo.gis.geomvd.util.GetPropertyValues;


public class  Restconsuming {
	
	private static String url = GetPropertyValues.getInstance().getValue(ConfigProperties.URL_REST_SERVER.getValue());;
	
	public static String nombrecallebycodigo(String codigo) {
		String dir = url + "/vias/nombre/" + codigo;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		//CustomLogger.log().info("Consultando Nombre de Via por codigo: " + dir);
		String  response;
		try {
			response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		} catch (Exception e) {
			response = "No existe la Via con el codigo = " + codigo;
		}
		
		return response;
	}
	
	public static String nombreViabycodigo(String codigo) {
		String dir = url + "/vias/" + codigo;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		//CustomLogger.log().info("Consultando Nombre de Via por codigo: " + dir);
		String  response;
		try {
			response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		} catch (Exception e) {
			response = "No existe la Via con el codigo = " + codigo;
		}
		
		return response;
	}
	
	public static String calleLikenombre(String calle) {
		String dir = url + "/infoUbicacion/vias?nombre=" + calle;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		//CustomLogger.log().info("Consultando Via por nombre: " + dir);
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		return response;
	}

	public static String ubicacioncallebycodigoandnropuerta(String codigoCalle, String nropuerta) {
		
		String dir = url + "/direcciones/posicion/" + codigoCalle + "/" + nropuerta;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricopadron(String padron) {
		
		String dir = url + "/padrones/geometria/" + padron;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}


	public static String ubicacioncentroidepadron(String padron) {
		
		String dir = url + "/padrones/centroide/" + padron;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacioncalleesquina(String codigoCalle1, String codigoCalle2) {
		
		String dir = url + "/esquinas/posicion/" + codigoCalle1 + "/" + codigoCalle2;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String callesesquina(String codigoCalle) {
		
		String dir = url + "/infoUbicacion/esquinas/" + codigoCalle;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ccz() {
		
		String dir = url + "/CCZs/todos/";
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacioncentroidccz(String ccz) {
		
		String dir = url + "/CCZs/centroide/" + ccz;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricoccz(String ccz) {
		
		String dir = url + "/CCZs/geometria/" + ccz;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String barrioLikenombre(String barrio) {
		
		String dir = url + "/barrios/busqueda?nombre=" + barrio;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacioncentroidbarrio(String codBarrio) {
		
		String dir = url + "/barrios/centroide/" + codBarrio;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricobarrio(String codBarrio) {
		
		String dir = url + "/barrios/geometria/" + codBarrio;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String municipios() {
		
		String dir = url + "/municipios/todos/";
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
    
	public static String ubicacioncentroidmunicipio(String municipio) {
		
		String dir = url + "/municipios/centroide/" + municipio;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricomunicipio(String municipio) {
		
		String dir = url + "/municipios/geometria/" + municipio;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String lugarDeInteresLikenombre(String lugar, String nombre) {
		
		String dir = url + "/infoUbicacion/"+lugar+"?nombre=" + nombre;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacionCultura(String codigo) {
		
		String dir = url + "/cultura/posicion/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacionDeporte(String codigo) {
		
		String dir = url + "/deporte/posicion/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacionEducacion(String codigo) {
		
		String dir = url + "/educacion/posicion/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricoEspacioLibre(String codigo) {
		
		String dir = url + "/nombresDeEspacioLibre/geometria/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacioncentroidEspacioLibre(String codigo) {
		
		String dir = url + "/nombresDeEspacioLibre/centroide/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacionMonumentos(String codigo) {
		
		String dir = url + "/monumentos/posicion/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricoPatrimonio(String codigo) {
		
		String dir = url + "/patrimonio/geometria/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacioncentroidPatrimonio(String codigo) {
		
		String dir = url + "/patrimonio/centroide/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicaciongeometricoPlaya(String codigo) {
		
		String dir = url + "/playas/geometria/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacioncentroidPlaya(String codigo) {
		
		String dir = url + "/playas/centroide/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String ubicacionSalud(String codigo) {
		
		String dir = url + "/salud/posicion/" + codigo;
		
		Client client = ClientBuilder.newClient();
		
		WebTarget target = client.target(dir);
		
		String  response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		
		return response;
	}
	
	public static String direccionByXeY(Double x, Double y) {
		String dir = url + "/geodecodificacion/direccion/?x=" + x + "&y=" + y;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		String  response;
		try {
			response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		} catch (Exception e) {
			response = "No existe direccion con x = " + x + " e y = " + y;
		}
		
		return response;
	}

	public static String parqueByXeY(Double x, Double y) {
		String dir = url + "/geodecodificacion/nombreDeParque?geometria=false&x=" + x + "&y=" + y;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		String response;
		try {
			response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		} catch (Exception e) {
			response = "No existe parque con x = " + x + " e y = " + y;
		}

		return response;
	}
	
	public static String esquinaByXeY(Double x, Double y) {
		String dir = url + "/geodecodificacion/esquina?x=" + x + "&y=" + y;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		String response;
		try {
			response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		} catch (Exception e) {
			response = "No existe esquina con x = " + x + " e y = " + y;
		}

		return response;
	}
	
	public static String ubicacionByXeY(Double x, Double y, Boolean direcciones) {
		String dir = url + "/geodecodificacion/ubicacion?direcciones="+direcciones+"&x=" + x + "&y=" + y;
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target(dir);
		String response;
		try {
			response = target.request(MediaType.APPLICATION_JSON).get(String.class);
		} catch (Exception e) {
			response = "No existe ubicacion con x = " + x + " e y = " + y;
		}

		return response;
	}


}
