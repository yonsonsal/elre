<aplicacion nombre="Georeferenciación de División Limpieza">  		

<!-- COMIENZO CAPAS DFR	 -->	
	 <!-- Inicio capas edicion	 -->
	 <capa nombre="E_DF_POSICIONES_RECORRIDO" datos="posicionesRecorrido.ori" editable="True" autocommit="true" visible="false" roleedit="RA_GEOSDFR_EDICION" estilo="posicionesRecorrido" metadata="posicionesRecorrido_md.xml"/>	
	 <capa nombre="E_DF_ZONA_RECORRIDO"	datos="zonasRecorrido.ori" editable="True" visible="false" roleedit="RA_GEOSDFR_EDICION" estilo="zonasRecorrido" metadata="zonasRecorrido_md.xml"/>	 
	 <capa nombre="E_DF_RUTAS_RECORRIDO"	datos="rutasRecorrido.ori" editable="True" roleedit="RA_GEOSDFR_EDICION" estilo="rutasasdadsadsRecorrido" metadata="rutasRecorrido_md.xml"/>
	 <capa nombre="E_DF_CONTENEDORES_SOTERRADOS" datos="contenedoresSoterrados.ori" editable="True" roleedit="RA_GEOSDFR_EDICION" estilo="contenedoresSoterrados" metadata="contenedoresSoterrados_md.xml"/> 
	 <capa nombre="E_DF_ZONA_RECORRIDO_PLAN"       datos="zonasRecorridoPL.ori" editable="True" roleedit="RA_GEOSDFR_EDICION" estilo="zonasRecorridoPL" metadata="zonasRecorridoPL_md.xml"/>
	 <capa nombre="E_DF_RUTAS_RECORRIDO_PLAN"       datos="rutasRecorridoPL.ori" editable="True" roleedit="RA_GEOSDFR_EDICION" estilo="rutasRecorridoPL" metadata="rutasRecorridoPL_md.xml"/>
	 <capa nombre="E_DF_POSICIONES_RECORRIDO_PL"  datos="posicionesRecorridoPL.ori" editable="True"  roleedit="RA_GEOSDFR_EDICION" estilo="posicionesRecorridoPL" metadata="posicionesRecorridoPL_md.xml"/>
	 <capa nombre="E_DF_CAP_CONTENEDORES" datos="contenedoresCAP.ori" editable="True" autocommit="true" visible="false" roleedit="RA_GEOSDFR_EDICION" estilo="point" metadata="contenedoresCAP_md.xml"/>
	 <capa nombre="E_DF_CAP_CIRCUITOS" datos="zonasCAP.ori" editable="True" autocommit="true" visible="false" roleedit="RA_GEOSDFR_EDICION" estilo="polygon" metadata="zonasCAP_md.xml"/>
	 <!-- Fin capas edicion	 -->
	 
	 <!-- Inicio capas consulta	 -->
	 <capa nombre="C_DF_ZONA_RECORRIDO_HISTORICO" 	datos="zonasRecorridoHistorico.ori" editable="false" visible="false" metadata="zonasRecorridoHistorico_md.xml"/>
	 <capa nombre="C_DF_RUTAS_RECORRIDO_HISTORICO"  datos="rutasRecorridoHistorico.ori" editable="false" metadata="rutasRecorridoHistorico_md.xml"/>
 	 <capa nombre="C_DF_POSICIONES_RECORRIDO_HISTORICO"  datos="posicionesRecorridoHistorico.ori" editable="false" metadata="posicionesRecorridoHistorico_md.xml"/>
 	 <capa nombre="C_DIRECCIONES" datos="direcciones.ori" editable="false" metadata = "direcciones_md.xml" />
	 <!-- Fin capas consulta	 -->
	 
	 <!-- Inicio codigueras	 -->
	 <capa nombre="Descripcion Regiones"	datos="descripcionRegiones.ori" visible="false" metadata="descripcionRegiones_md.xml"/>
	 <capa nombre="Descripcion Recorrido"	datos="descripcionRecorrido.ori" visible="false" metadata="descripcionRecorrido_md.xml"/>
	 <capa nombre="Nombres Municipio"	datos="nombresMunicipio.ori" visible="false" metadata="nombresMunicipio_md.xml" />
	 <capa nombre="Tipo Puntos Levante"	datos="tipoPuntosLevante.ori" visible="false" metadata="tipoPuntosLevante_md.xml"/>
	 <capa nombre="Codigo Recorrido"	datos="codigoRecorrido.ori" visible="false" metadata="codigoRecorrido_md.xml"/>
         <capa nombre="Codigo Recorrido Hist"	datos="codigoRecorridoHist.ori" visible="false" metadata="codigoRecorridoHist_md.xml"/>
	 <capa nombre="Estado Zona Recorrido"	datos="estadoZonaRecorrido.ori" visible="false" metadata="estadoZonaRecorrido_md.xml"/>
	 <capa nombre="Codigo Recorrido Planificado"	  datos="codigoRecorridoPl.ori" visible="false" metadata="codigoRecorridoPl_md.xml"/>
	 <capa nombre="Motivos Posicion Inactiva"	 datos="motivosPosicionInactiva.ori" visible="false" metadata="motivosPosicionInactiva_md.xml"/>
	 <!-- Fin codigueras	 -->
	 
<!-- FIN CAPAS DFR	 -->
	 
 </aplicacion>

