package uy.gub.montevideo.gis.geomvd.util;

public class StringUtils {
	
	public static String removeLastComma(String value) {
		return (value.endsWith(",")?value.substring(0,value.length()-1):value);
	}

	public static String removeLastCharIfMatches(String value, String end) {
		return (value.endsWith(end)?value.substring(0,value.length()-end.length()):value);
	}
	
	public static String replaceCharInputQueryValues(String value, String lista) {
	
		String[] characters = lista.split(",");
		
		for(int i=0; i<characters.length; i++) { 
			String charReplace = "";
			int caracterAscii = Integer.parseInt(characters[i]);
			String caracter = String.valueOf(((char) caracterAscii)); 
			
			switch(caracterAscii) {
				case 39://comilla
					charReplace = "´";
				break;
				case 9://tabulador
					charReplace = " ";
				break;
				case 10://saldo de linea
					charReplace = " ";
				break;
				default://el resto
					charReplace = "";
				break;
			}
			
			value = value.replace(caracter, charReplace);
		}
		
		return value;
	}
	/**
	 * 
	 * @param value
	 * @param valueof
	 * value es un string separado por ";" 
	 * valueof es un string sepado por ";"
	 * cheque que algun elemento del string value se encuentra en el estring valueof  
	 */
	public static Boolean stringincludedString(String value,String valueof) {
		
		if (value != null) {
			if (valueof != null) {
				String[] parts = value.split(";");
				String[] parts2 = valueof.split(";");
				for (String aux : parts2) {
					for (String aux2 : parts) {
						if (aux.equals(aux2)) {
							return true;
						}
					}
				}
			}
			else {
				return false;
			}
			
		}
		else {
			return true;
		}
		return false;
		
	}
	
	public static boolean isNumeric(String str) { 
		  try {  
		    Integer.parseInt(str);  
		    return true;
		  } catch(NumberFormatException e){  
		    return false;  
		  }  
		}
}

