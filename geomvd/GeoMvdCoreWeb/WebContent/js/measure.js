function getMeasureLayer(context, isPolygon) {
    let that = context;
    let layerToReturn = null;
    let isNew = false;
    let layers = that._map.getLayers().array_;

    if (isPolygon) {
        for (let i = 0; i < layers.length; i++) {
            let values = layers[i].values_;
            if (values && values.name && values.name === "polygonMeasure") {
                layerToReturn = layers[i];
                break;
            }
        }

        if (!layerToReturn){
            isNew = true;

            layerToReturn = new ol.layer.Vector({
                name: 'polygonMeasure',
                source: new ol.source.Vector(),
                visible: true,
                map:that._map,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 204, 51, 0.1)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                })
            });
        }
    } else {
        for (let i = 0; i < layers.length; i++) {
            let values = layers[i].values_;
            if (values && values.name && values.name === "lineMeasure") {
                layerToReturn = layers[i];
                break;
            }
        }

        if (!layerToReturn){
            isNew = true;
            layerToReturn = new ol.layer.Vector({
                name: 'lineMeasure',
                source: new ol.source.Vector(),
                visible: true,
                map:that._map,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 0, 0, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ff0000',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ff0000'
                        })
                    })
                })
            });
        }
    }

    return { layerIsNew: isNew,	layer: layerToReturn };
}

function clearMeasure(context) {
    let that = context;
    let polygonMeasureVectorLayerResponse = getMeasureLayer(that, true);
    let lineMeasureVectorLayerResponse = getMeasureLayer(that, false);

    let polygonMeasureVectorLayer = polygonMeasureVectorLayerResponse.layer;
    let lineMeasureVectorLayer = lineMeasureVectorLayerResponse.layer;

    if(polygonMeasureVectorLayer){
        polygonMeasureVectorLayer.getSource().clear();
    }
    if(lineMeasureVectorLayer){
        lineMeasureVectorLayer.getSource().clear();
    }

    let ol_selectable_collection = $(".ol-selectable");
    for(let i = 0; i < ol_selectable_collection.length; i++) {
        let oneSelectable = ol_selectable_collection[i];
        if (oneSelectable.innerText){
            $(oneSelectable).remove();
        }
    }
}

function startMeasure(context) {
    let that = context;
    if (!that._isMeasuring) {
        if(!that._polygonMeasureCounter || that._polygonMeasureCounter == 0) {
            that._polygonMeasureCounter = 1;
        }
        if(!that._lineMeasureCounter || that._lineMeasureCounter == 0) {
            that._lineMeasureCounter = 1;
        }
        that._isMeasuring = true;

        let map = that._map;

        let polygonMeasureVectorLayerResponse = getMeasureLayer(that, true);
        let lineMeasureVectorLayerResponse = getMeasureLayer(that, false);

        let polygonMeasureVectorLayer = polygonMeasureVectorLayerResponse.layer;
        let lineMeasureVectorLayer = lineMeasureVectorLayerResponse.layer;

        let polygonSource = polygonMeasureVectorLayer.getSource();
        let lineSource = lineMeasureVectorLayer.getSource();
        let wgs84Sphere = new ol.Sphere(6378137);
        let sketch;
        that.helpTooltipElement = null;
        that.helpTooltip = null;
        that.measureTooltipElementPolygon = null;
        that.measureTooltipElementLine = null;
        that.measureTooltipPolygon = null;
        that.measureTooltipLine = null;
        let continueMsg = 'Click para continuar midiendo';
        let pointerMoveHandler = function(evt) {
            if (evt.dragging) {
                return;
            }

            let helpMsg = 'Click para comenzar a medir';

            if (sketch) {
                let geom = (sketch.getGeometry());
                helpMsg = continueMsg;
            }

            that.helpTooltipElement.innerHTML = helpMsg;
            that.helpTooltip.setPosition(evt.coordinate);

            that.helpTooltipElement.classList.remove('hidden');
        };

        map.on('pointermove', pointerMoveHandler);

        map.getViewport().addEventListener('mouseout', function() {
            that.helpTooltipElement.classList.add('hidden');
        });

        function createHelpTooltip() {
            if (that.helpTooltipElement) {
                that.helpTooltipElement.parentNode.removeChild(that.helpTooltipElement);
            }
            that.helpTooltipElement = document.createElement('div');
            that.helpTooltipElement.className = 'tooltip hidden';
            that.helpTooltip = new ol.Overlay({
                element: that.helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left'
            });
            map.addOverlay(that.helpTooltip);
        }

        let geodesicMeasure = that._geodesicMeasure;

        let formatArea = function(polygon) {
            let area;
            if (geodesicMeasure) {
                let sourceProj = map.getView().getProjection();
                let geom = (polygon.clone().transform(
                    sourceProj, 'EPSG:4326'));
                let coordinates = geom.getLinearRing(0).getCoordinates();
                area = Math.abs(wgs84Sphere.geodesicArea(coordinates));

            } else { area = polygon.getArea(); }

            let output;

            // Pidieron que quede siempre en metros
            //if (area > 10000) {
            //	output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
            //} else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
            //}

            return output;
        };
        let formatLength = function(line) {
            let length;
            if (geodesicMeasure) {
                let coordinates = line.getCoordinates();
                length = 0;
                let sourceProj = map.getView().getProjection();
                for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                    let c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                    let c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                    length += wgs84Sphere.haversineDistance(c1, c2);
                }
            } else { length = Math.round(line.getLength() * 100) / 100; }

            let output;

            // Pidieron que quede siempre en metros
            //if (length > 100) {
            //	output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
            //} else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
            //}

            return output;
        };

        function addInteractionPolygonMeasure() {
            let type ='Polygon';

            that.drawPolygonMeasure = new ol.interaction.Draw({
                source: polygonSource,
                type: (type),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.7)'
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        })
                    })
                })
            });
            map.addInteraction(that.drawPolygonMeasure);

            createMeasureTooltip(true);
            createHelpTooltip();

            let listener;
            that.drawPolygonMeasure.on('drawstart',
                function(evt) {
                    sketch = evt.feature;

                    let tooltipCoord = evt.coordinate;

                    listener = sketch.getGeometry().on('change', function(evt) {
                        let geom = evt.target;
                        let output;
                        if (geom instanceof ol.geom.Polygon) {
                            output = formatArea(geom);
                            tooltipCoord = geom.getInteriorPoint().getCoordinates();
                        } else if (geom instanceof ol.geom.LineString) {
                            output = formatLength(geom);
                            tooltipCoord = geom.getLastCoordinate();
                        }
                        that.measureTooltipElementPolygon.innerHTML = output;
                        that.measureTooltipPolygon.setPosition(tooltipCoord);
                    });
                },
                that
            );

            that.drawPolygonMeasure.on('drawend', function() {
                that.measureTooltipElementPolygon.className = 'tooltip tooltip-static tooltip-static-polygon';
                that.measureTooltipPolygon.setOffset([0, -7]);
                sketch = null;

                setTimeout(function() {
                    let polygonFeatures = polygonSource.getFeatures();
                    if (polygonFeatures && polygonFeatures.length > 0) {
                        for (let i = 0; i < polygonFeatures.length; i++) {
                            let onePolygonFeature = polygonFeatures[i];
                            if (!onePolygonFeature.id_) {
                                onePolygonFeature.id_ = (that._polygonMeasureCounter-1);
                            }
                        }
                    }

                    /*let lineFeatures = lineSource.getFeatures();
                    if (lineFeatures && lineFeatures.length > 0) {
                        for (let i = 0; i < lineFeatures.length; i++) {
                            let oneLineFeature = lineFeatures[i];
                            if (!oneLineFeature.id_) {
                                oneLineFeature.id_ = (that._measureCounter-1);
                            }
                        }
                    }*/
                }, 500);

                that.measureTooltipElementPolygon.id = ("polygon-measure-tooltip-" + that._polygonMeasureCounter);
                that.measureTooltipElementPolygon.addEventListener("dblclick", function(e) {
                    let elementIdCollection = this.id.split("-");
                    let layerId = elementIdCollection[elementIdCollection.length-1];

                    let polygonFeatures = polygonSource.getFeatures();
                    if (polygonFeatures && polygonFeatures.length > 0) {
                        for (let i = 0; i < polygonFeatures.length; i++) {
                            let onePolygonFeature = polygonFeatures[i];
                            if (onePolygonFeature.id_ == layerId) {
                                polygonSource.removeFeature(onePolygonFeature);
                                break;
                            }
                        }
                    }
                    this.parentNode.removeChild(this);
                });

                that._polygonMeasureCounter++;

                that.measureTooltipElementPolygon = null;
                that.helpTooltipElement.parentNode.removeChild(that.helpTooltipElement);
                ol.Observable.unByKey(listener);
                map.removeInteraction(that.drawPolygonMeasure);
                that._isMeasuring = false;
            },that);
        }

        function addInteractionLineMeasure() {
            let type = 'LineString';

            that.drawLineMeasure = new ol.interaction.Draw({
                source: lineSource,
                type: (type),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.7)'
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        })
                    })
                })
            });
            map.addInteraction(that.drawLineMeasure);

            createMeasureTooltip(false);
            createHelpTooltip();

            let listener;
            that.drawLineMeasure.on('drawstart',
                function(evt) {
                    // set sketch
                    sketch = evt.feature;

                    /** @type {ol.Coordinate|undefined} */
                    let tooltipCoord = evt.coordinate;

                    listener = sketch.getGeometry().on('change', function(evt) {
                        let geom = evt.target;
                        let output;
                        if (geom instanceof ol.geom.Polygon) {
                            output = formatArea(geom);
                            tooltipCoord = geom.getInteriorPoint().getCoordinates();
                        } else if (geom instanceof ol.geom.LineString) {
                            output = formatLength(geom);
                            tooltipCoord = geom.getLastCoordinate();
                        }
                        that.measureTooltipElementLine.innerHTML = output;
                        that.measureTooltipLine.setPosition(tooltipCoord);
                    });
                },
                that
            );

            that.drawLineMeasure.on('drawend', function() {
                that.measureTooltipElementLine.className = 'tooltip tooltip-static tooltip-static-line';
                that.measureTooltipLine.setOffset([0, -7]);
                sketch = null;

                setTimeout(function() {
                    /*let polygonFeatures = polygonSource.getFeatures();
                    if (polygonFeatures && polygonFeatures.length > 0) {
                        for (let i = 0; i < polygonFeatures.length; i++) {
                            let onePolygonFeature = polygonFeatures[i];
                            if (!onePolygonFeature.id_) {
                                onePolygonFeature.id_ = (that._measureCounter-1);
                            }
                        }
                    }*/

                    let lineFeatures = lineSource.getFeatures();
                    if (lineFeatures && lineFeatures.length > 0) {
                        for (let i = 0; i < lineFeatures.length; i++) {
                            let oneLineFeature = lineFeatures[i];
                            if (!oneLineFeature.id_) {
                                oneLineFeature.id_ = (that._lineMeasureCounter-1);
                            }
                        }
                    }
                }, 500);

                that.measureTooltipElementLine.id = ("line-measure-tooltip-" + that._lineMeasureCounter);
                that.measureTooltipElementLine.addEventListener("dblclick", function(e) {
                    let elementIdCollection = this.id.split("-");
                    let layerId = elementIdCollection[elementIdCollection.length-1];
                    let lineFeatures = lineSource.getFeatures();

                    if (lineFeatures && lineFeatures.length > 0) {
                        for (let i = 0; i < lineFeatures.length; i++) {
                            let oneLineFeature = lineFeatures[i];
                            if (oneLineFeature.id_ == layerId) {
                                lineSource.removeFeature(oneLineFeature);
                                break;
                            }
                        }
                    }

                    this.parentNode.removeChild(this);
                });

                that._lineMeasureCounter++;

                that.measureTooltipElementLine = null;
                // helpTooltipElement.parentNode.removeChild(helpTooltipElement);//
                // Como esto ya lo hace cuando termina de dibujar el
                // polígono, no es necesario hacerlo nuevamente.
                ol.Observable.unByKey(listener);
                map.removeInteraction(that.drawLineMeasure);
            },that);
        }

        function createMeasureTooltip(isPolygon) {
            if (isPolygon) {
                if (that.measureTooltipElementPolygon) {
                    that.measureTooltipElementPolygon.parentNode.removeChild(that.measureTooltipElementPolygon);
                }
                that.measureTooltipElementPolygon = document.createElement('div');
                that.measureTooltipElementPolygon.className = 'tooltip tooltip-measure';
                that.measureTooltipPolygon = new ol.Overlay({
                    element: that.measureTooltipElementPolygon,
                    offset: [0, -15],
                    positioning: 'bottom-center'
                });
                map.addOverlay(that.measureTooltipPolygon);
            } else {
                if (that.measureTooltipElementLine) {
                    that.measureTooltipElementLine.parentNode.removeChild(that.measureTooltipElementLine);
                }
                that.measureTooltipElementLine = document.createElement('div');
                that.measureTooltipElementLine.className = 'tooltip tooltip-measure';
                that.measureTooltipLine = new ol.Overlay({
                    element: that.measureTooltipElementLine,
                    offset: [0, -15],
                    positioning: 'bottom-center'
                });
                map.addOverlay(that.measureTooltipLine);
            }

        }

        addInteractionPolygonMeasure();
        if (polygonMeasureVectorLayerResponse.layerIsNew) {
            that._map.addLayer(polygonMeasureVectorLayer);
        }
        addInteractionLineMeasure();
        if (lineMeasureVectorLayerResponse.layerIsNew) {
            that._map.addLayer(lineMeasureVectorLayer);
        }
    }
}

function stopMeasure(context) {
    let that = context;
    that._map.removeInteraction(that.drawLineMeasure);
    that._map.removeInteraction(that.drawPolygonMeasure);
    that._isMeasuring = false;
    if (that.helpTooltipElement) {
        that.helpTooltipElement.parentNode.removeChild(that.helpTooltipElement);
    }
    if (that.measureTooltipElementPolygon) {
        that.measureTooltipElementPolygon.parentNode.removeChild(that.measureTooltipElementPolygon);
    }
    if (that.measureTooltipElementLine) {
        that.measureTooltipElementLine.parentNode.removeChild(that.measureTooltipElementLine);
    }
    // ToDo: Ver el caso en el que sólo se terminó de dibujar la línea, pero se sigue dibujando el polígono y se cancela la medición.
    //  está pasando que la línea no se borra junto con la información de la medida.
}