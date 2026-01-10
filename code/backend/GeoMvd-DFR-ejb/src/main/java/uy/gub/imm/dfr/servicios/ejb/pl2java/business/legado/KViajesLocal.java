package uy.gub.imm.dfr.servicios.ejb.pl2java.business.legado;

import java.math.BigDecimal;
import java.util.Date;
import javax.ejb.Local;
import uy.gub.imm.pl2java.exception.Pl2JavaException;

@Local
public interface KViajesLocal { 

	public void actPosicionesTramos() throws Pl2JavaException;

	public void actPosicionesRecorrido() throws Pl2JavaException;

	}
