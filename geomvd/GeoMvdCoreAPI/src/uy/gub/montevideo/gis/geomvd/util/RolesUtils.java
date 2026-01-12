package uy.gub.montevideo.gis.geomvd.util;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import uy.gub.montevideo.gis.geomvd.core.AtributoCapa;
import uy.gub.montevideo.gis.geomvd.core.Capa;
import uy.gub.montevideo.gis.geomvd.core.Layer;
import uy.gub.montevideo.gis.geomvd.core.entities.Usuario;
import uy.gub.montevideo.gis.geomvd.core.db.SecurityHelper;

public class RolesUtils {

	public static List<String> getUserRoles(String username) throws SQLException {
		return SecurityHelper.getUserRoles(username);
	}

	public static String getUserRolesAsString(String username)  {
		String result = "";
		try {
			for (String rol : getUserRoles(username))
				result += rol + ";";
		} catch (Exception e) {
			CustomLogger.log().error("Error obteniendo roles del usuario " + username, e);
		}
		return StringUtils.removeLastCharIfMatches(result,";");
	}

    public static List<Layer> getLayerswithRoles(List<Capa> capas,Usuario user )  {
        
    	List<Layer> Layers = new ArrayList<Layer>();
    	
    	String geoserverproxyURL = GetPropertyValues.getInstance().getValue(ConfigProperties.ROL_APLICACION.getValue());
    	
    	boolean tieneRolConsulta = StringUtils.stringincludedString(user.getRoles(), geoserverproxyURL);

    	if (tieneRolConsulta) {
    		for (Capa auxCap: capas) {
				Capa capaNew = new Capa(auxCap);
				
				boolean tieneRol = false;
				Layer layer = new Layer();				
				tieneRol = isrolEditbyUser(capaNew,user,false);
				
				if (!tieneRol) {
					tieneRol = isrolEditbyUser(capaNew,user,true);
					
					capaNew.setGeomedit(false);
					capaNew.setCanSplit(false);
					capaNew.setCanDeleteVertex(false);
					capaNew.setCanClone(false);
					capaNew.setAlta(false);
					capaNew.setBaja(false);
					
					if (!tieneRol) {
						capaNew.setEditable(false);
					}
					
				}
				
				
				layer.capatoLayer(capaNew,layer);
				Layers.add(layer);
			}
    	}
			
		Collections.reverse(Layers);
		return Layers;
    	
    	
    }
    
    public static Capa getCapaswithRoles(Capa capa,Usuario user )  {

		boolean tieneRol = false;
		Capa capaNew = new Capa(capa);
			
		tieneRol = isrolEditbyUser(capaNew,user,false);
		if (!tieneRol) {
			tieneRol = isrolEditbyUser(capaNew,user,true);
			
			capaNew.setGeomedit(false);
			capaNew.setCanSplit(false);
			capaNew.setCanDeleteVertex(false);
			capaNew.setCanClone(false);
			capaNew.setAlta(false);
			capaNew.setBaja(false);
			
			if (tieneRol) {
				for (AtributoCapa a : capaNew.getAtributos().values()) {
					if (a.getRole_edit() != null) {
						a.setRead_only(!StringUtils.stringincludedString(user.getRoles(), a.getRole_edit()));
					}
					else {
						a.setRead_only(true);
					}
					
				}
				
				
			}
			else {
				
				capaNew.setEditable(false);
			}
			
		}

		return capaNew;
    	
    	
    }
    
    public static boolean isrolEditbyUser(Capa cap, Usuario user, Boolean parcial) {
    	
    	boolean tieneRol = false;
    	
    	if (!parcial && cap.getRoleedit() != null || parcial && cap.getRoleeditparcial() != null) {
    		if (user.getRoles() != null) {
    			if (parcial) {
    				tieneRol = StringUtils.stringincludedString(user.getRoles(), cap.getRoleeditparcial());
    			}
    			else {
    				tieneRol = StringUtils.stringincludedString(user.getRoles(), cap.getRoleedit());
    			}
    			
    		}  		
    	}
    	
    	return tieneRol;
    }
    
    public static boolean getTieneRolEspecifico(Usuario user, String rol )  {

		boolean tieneRol = false;
			
		tieneRol = isEspcificrolEditbyUser(user,rol);
		
		return tieneRol;
    }
    
    public static boolean isEspcificrolEditbyUser(Usuario user, String rol) {
    	
    	boolean tieneRol = false;
    	System.out.println("roles: " + user.getRoles());
    	System.out.println("rol especifico: " + rol);
    	tieneRol = StringUtils.stringincludedString(user.getRoles(), rol);
    	System.out.println("tieneRol: " + tieneRol);
    	return tieneRol;
    }
    
    /*
     * SOLO USAR DESDE EL DFRPublicLayerService para la PLUGINETA
     */
	public static List<Layer> getLayerswithRolesPlugineta(List<Capa> capas,Usuario user )  {
        
    	List<Layer> Layers = new ArrayList<Layer>();
    	
    	for (Capa auxCap: capas) {
			Capa capaNew = new Capa(auxCap);
			Layer layer = new Layer();							
			
			layer.capatoLayer(capaNew,layer);
			Layers.add(layer);
		}
			
		Collections.reverse(Layers);
		return Layers;
    }
	
	/*
     * SOLO USAR DESDE EL DFRPublicLayerService para la PLUGINETA
     */
	public static Capa getCapaswithRolesPlugineta(Capa capa,Usuario user )  {
		Capa capaNew = new Capa(capa);

		return capaNew;
    }
    

}
