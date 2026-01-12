package uy.gub.montevideo.gis.geomvd.util;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;

public class CustomLogger {

	private static Logger logger;
	
	public static Logger log() {
		if (logger==null) {
			logger = Logger.getLogger(CustomLogger.class);
			logger.setLevel(Level.DEBUG);
		}
		return logger;
	}
}
