package uy.gub.montevideo.gis.geomvd.util;

import org.jboss.resteasy.util.Base64;
import org.jboss.security.Base64Encoder;

import java.io.IOException;
import java.util.StringTokenizer;

public class EncriptionUtils {

    private static String FIXED_KEY = "REPLACEWITHENCRYPTION";

    public static String getEncodedToken(String value) throws IOException {
        return Base64Encoder.encode(value + ":" + FIXED_KEY);
    }

    public static String getDecodedToken(String token) throws IOException {
        //Split username and key tokens
        final StringTokenizer tokenizer = new StringTokenizer(new String(Base64.decode(token)), ":");
        final String username = tokenizer.nextToken();
        final String fixedkey = tokenizer.nextToken();
        if (fixedkey.equals(FIXED_KEY))
            return username;
        else
            return null;
    }

}
