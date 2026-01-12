function getWKTFromFeatureFiltro(featureOri) {
	
	return (new ol.format.WKT()).writeFeature(featureOri);
}

function getWKTFromFeature(featureOri) {
	
	return (new ol.format.WKT()).writeFeature(featureOri);
}

function getWKTFromGeometry(geom) {
	let wkt;
	if (geom) {
		let newgeom = removeZFromGeometry(geom.clone(), "Point")
		wkt = (new ol.format.WKT()).writeGeometry(newgeom);
	}
	return wkt;
}

function getFeatureGID(feature) {
	return feature && feature.values_ && (feature.values_.gid || feature.values_.GID) ? feature.values_.gid || feature.values_.GID : null
}

function removeZFromFeature(feature, geometryType) {
	let geometry = feature.getGeometry();
	if (geometry && geometry.layout && geometry.layout === "XYZ") {
		feature.setGeometry(removeZFromGeometry(geometry, geometryType));
	}
	return feature;
}

function removeZFromGeometry(geometry, geometryType) {
	if (geometry && geometry.layout && geometry.layout === "XYZ") {
		let originalCoordinates = geometry.flatCoordinates;
		let newCoordinates = [];
		let XYCoordinates = [];
		for (let i = 0; i < originalCoordinates.length; i++) {
			if ((i + 1) % 3 != 0) {
				XYCoordinates.push(originalCoordinates[i]);
				if (i == originalCoordinates.length-1) {
					if (geometryType == "LineString" || geometryType == "Polygon") {
						newCoordinates.push(XYCoordinates);
					} else if (geometryType == "Point") {
						newCoordinates = XYCoordinates;
					}
				}
			} else {
				if (geometryType == "LineString" || geometryType == "Polygon") {
					newCoordinates.push(XYCoordinates);
				} else if (geometryType == "Point") {
					newCoordinates = XYCoordinates;
				}
				XYCoordinates = [];
			}
		}

		let newGeometry = null;
		if (geometryType == "LineString") {
			newGeometry = new ol.geom.LineString(newCoordinates, "XY");
		} else if (geometryType == "Point") {
			newGeometry = new ol.geom.Point(newCoordinates, "XY");
		} else if (geometryType == "Polygon") {
			newGeometry = new ol.geom.Polygon([newCoordinates], "XY");
		}

		return newGeometry;
	}

	return geometry;
}