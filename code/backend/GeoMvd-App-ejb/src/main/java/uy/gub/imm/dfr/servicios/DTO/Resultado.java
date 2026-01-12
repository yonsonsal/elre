package uy.gub.imm.dfr.servicios.DTO;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAccessType;

@XmlRootElement(name = "resultado-ingreso")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(propOrder = { "codigo", "descripcion"})
public class Resultado implements Serializable {

	private static final long serialVersionUID = 6963040037143856534L;
	
	@XmlElement(name = "codigo")
	private long codigo;
	@XmlElement(name = "descripcion")
	private String descripcion;
	
	public Resultado() {
		super();		
	}
	
	
	public Resultado(long codigo, String descripcion) {
		super();
		this.codigo = codigo;
		this.descripcion = descripcion;
	}


	public long getCodigo() {
		return codigo;
	}
	public void setCodigo(long codigo) {
		this.codigo = codigo;
	}
	public String getDescripcion() {
		return descripcion;
	}
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}
}
	
