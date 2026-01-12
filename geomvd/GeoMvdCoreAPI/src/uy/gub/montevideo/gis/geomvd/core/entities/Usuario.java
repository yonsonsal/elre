package uy.gub.montevideo.gis.geomvd.core.entities;


public class Usuario {
	
	private String roles;
	private String username;
	private String idAuditoria;

	public Usuario(String username, String roles, String idAuditoria) {
		this.roles = roles;
		this.username = username;
		this.idAuditoria = idAuditoria;
	}
	public String getRoles() {
		return roles;
	}
	public void setRoles(String role) {
		this.roles = role;
	}
	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String getIdAuditoria() {  return idAuditoria; }
	public void setIdAuditoria(String idAuditoria) { this.idAuditoria = idAuditoria; }
}
