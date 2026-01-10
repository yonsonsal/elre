package uy.gub.imm.dfr.servicios.ejb.pl2java.business.ejb;

import java.util.Date;
import java.math.BigDecimal;
import javax.ejb.Stateless;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.jdbc.Work;

import uy.gub.imm.dfr.servicios.ejb.pl2java.business.legado.KViajesLocal;
import uy.gub.imm.pl2java.exception.Pl2JavaException;
import uy.gub.imm.pl2java.exception.Pl2JavaExceptionUtils;

@Stateless
public class KViajesBean implements KViajesLocal { 

	@PersistenceContext(unitName="brfDS")
	private EntityManager em;

	// valor de retorno
	private Object returnValue;

	// retorno de dto de variables out
	private Object returnObject;

	private final String packagePL = "K_DF_VIAJES";
 
	public void actPosicionesTramos() throws Pl2JavaException { 
		actPosicionesTramos(null);
	}


	private void actPosicionesTramos(String[] noRollbackErrorCodes ) throws Pl2JavaException { 

		final String[] noRollbackErrorCodesLocal = noRollbackErrorCodes;
		Session sess = (Session)this.em.getDelegate();
		try
		{
			sess.doWork(new Work() {
				public void execute(Connection conn) throws SQLException, HibernateException {
        
					String sqlCall = "{ call K_DF_VIAJES.ACT_POSICIONES_TRAMOS() }  " ;

					CallableStatement stProc = conn.prepareCall(sqlCall);

					stProc.execute();
					stProc.close();
					} } );
			} catch (HibernateException e) {
				if (e.getCause() instanceof Pl2JavaException) {
					throw (Pl2JavaException)e.getCause();
				}
				throw Pl2JavaExceptionUtils.createException(packagePL,null,e.getCause().getMessage(), e.getCause(), noRollbackErrorCodes);
				}
			catch (Exception e) {
				throw new Pl2JavaException(packagePL,null,e.getMessage(), e);
		}
	} 

	public void actPosicionesRecorrido() throws Pl2JavaException { 
		actPosicionesRecorrido(null);
	}


	private void actPosicionesRecorrido(String[] noRollbackErrorCodes ) throws Pl2JavaException { 

		final String[] noRollbackErrorCodesLocal = noRollbackErrorCodes;
		Session sess = (Session)this.em.getDelegate();
		try
		{
			sess.doWork(new Work() {
				public void execute(Connection conn) throws SQLException, HibernateException {
        
					String sqlCall = "{ call K_DF_VIAJES.ACT_POSICIONES_RECORRIDO() }  " ;

					CallableStatement stProc = conn.prepareCall(sqlCall);

					stProc.execute();
					stProc.close();
					} } );
			} catch (HibernateException e) {
				if (e.getCause() instanceof Pl2JavaException) {
					throw (Pl2JavaException)e.getCause();
				}
				throw Pl2JavaExceptionUtils.createException(packagePL,null,e.getCause().getMessage(), e.getCause(), noRollbackErrorCodes);
				}
			catch (Exception e) {
				throw new Pl2JavaException(packagePL,null,e.getMessage(), e);
		}
	} 

	}
