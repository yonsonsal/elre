if (!proj4.defs("EPSG:32721")) {
	proj4.defs("EPSG:32721","+proj=utm +zone=21 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs");
	proj4.defs("http://www.opengis.net/gml/srs/epsg.xml#32721","+proj=utm +zone=21 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs");
}

$.datetimepicker.setLocale('es');

Array.prototype.unicos = function () {
	  return this.filter((valor, indice) => {
	    return this.indexOf(valor) === indice;
	  });
	}
