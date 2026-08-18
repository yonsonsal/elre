<aplicacion nombre="Plugineta">

<!-- COMIENZO CAPAS PLUGINETA DEMO 4326 (PoC multi-CRS) -->
<!-- El "nombre" de cada <capa> tiene que coincidir con el layer real de GeoServer
     (ConfigParser.findCapa se busca por el nombre que devuelve GeoserverApi.getLayersFromWorkspace,
     no por un alias propio) -->

	<capa nombre="points_of_interest" datos="poi.ori" editable="True" metadata="poi_md.xml" />
	<capa nombre="streets" datos="streets.ori" editable="True" metadata="streets_md.xml" />
	<capa nombre="zones" datos="zones.ori" editable="True" metadata="zones_md.xml" />

<!-- FIN CAPAS PLUGINETA -->

</aplicacion>
