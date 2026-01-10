package uy.gub.imm.dfr.business.ejb.interfaces;

import java.math.BigDecimal;
import java.util.Date;
import javax.ejb.Remote;
import uy.gub.imm.pl2java.exception.Pl2JavaException;

@Remote
public interface KViajesRemote { 

	public void actPosicionesTramos() throws Pl2JavaException;

	public void actPosicionesRecorrido() throws Pl2JavaException;

	}
