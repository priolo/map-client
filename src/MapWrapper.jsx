// react
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./MapWrapper.module.css"
// openlayers
import { Map, View, Feature } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource, OSM, XYZ } from 'ol/source'
import { Draw, Link, Snap, defaults as defaultInteractions } from "ol/interaction"
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import { GeoJSON } from 'ol/format';


function MapWrapper({
	mode
}) {

	const mapRef = useRef()

	const getRef = useCallback(async node => {

		//const rasterLayer = createRasterLayerOSM()
		const rasterLayer = createRasterLayerArcgis()
		const iconsLayer = createIconsLayer()
		const drawLayer = createDrawLayer()
		const vectorGeoJsonLayer = createFeatureLayerFromGEOJson()
		const drawInteraction = createDrawInteraction(drawLayer.getSource(), null)
		const linkInteraction = new Link()
		const snapInteraction = createSnapInteraction(vectorGeoJsonLayer)

		const map = new Map({
			target: node,
			layers: [rasterLayer, iconsLayer, drawLayer, vectorGeoJsonLayer],

			// questa view poi sara' sostituita su "loadend" sotto
			view: new View({
				// 	projection: 'EPSG:3857',
				center: [-13378949, 5943751],
				zoom: 11,
			}),

			controls: [],
			// in questa maniera cancella tutte le interazioni di default...
			//interactions: [drawInteraction, linkInteraction],
			// altrimenti posso fare cosi'!
			interactions: defaultInteractions().extend([drawInteraction, linkInteraction, snapInteraction])
		})

		// ... invece cosi' lascio le interazioni base (drag&drop, well, etc etc)
		// map.addInteraction(drawInteraction)
		// map.addInteraction(linkInteraction)
		// map.addInteraction(snapInteraction)

		// quando la mappa è stata creata e quindi ci sono anche la "features"...
		map.on("loadend", () => {
			// ...centra la mappa sulla prima feature 
			const features = vectorGeoJsonLayer.getSource().getFeatures()
			map.getView().fit(features[0].getGeometry().getExtent(), { padding: [10, 10, 10, 10] })
		})

	}, [])

	return (<div
		ref={getRef}
		className={styles.container}
	/>)
}

export default MapWrapper

function createFeatureLayerFromGEOJson() {
	// features in this layer will be snapped to
	const layer = new VectorLayer({
		source: new VectorSource({
			format: new GeoJSON(),
			url: 'fire.json',
			//features: new GeoJSON().readFeatures(/** GEOJson */),
		}),
		style: {
			'fill-color': 'rgba(255, 0, 0, 0.3)',
			'stroke-color': 'rgba(255, 0, 0, 0.9)',
			'stroke-width': 0.5,
		},
	});
	return layer
}

function createIconsLayer() {
	const iconStyle = new Style({
		image: new Icon({
			anchor: [0.5, 0.5],
			src: 'vite.svg',
		}),
	})

	const feature = new Feature({
		//type: "icon",
		geometry: new Point([-122.60315, 37.905639, 449.2]),
	})
	feature.setStyle(iconStyle)

	const layer = new VectorLayer({
		source: new VectorSource({
			features: [
				feature,
			]
		}),
		// style: function (feature) {
		// 	return styles[feature.get('type')];
		// },
	})

	return layer
}

function createDrawLayer() {
	// this is were the drawn features go
	const layer = new VectorLayer({
		source: new VectorSource(),
		style: {
			'stroke-color': 'rgba(100, 255, 0, 1)',
			'stroke-width': 2,
			'fill-color': 'rgba(100, 255, 0, 0.3)',
		},
	});

	return layer
}

function createRasterLayerArcgis() {
	const layer = new TileLayer({
		source: new XYZ({
			attributions:
				'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
				'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
			url:
				'https://server.arcgisonline.com/ArcGIS/rest/services/' +
				'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		}),
	});
	return layer
}

function createRasterLayerOSM() {
	const layer = new TileLayer({ source: new OSM() })
	return layer
}

function createDrawInteraction(source, traceSource) {
	const drawInteraction = new Draw({
		type: "Polygon", // LineString
		source,
		trace: true,
		traceSource,
		style: {
			'stroke-color': 'rgba(255, 255, 100, 0.5)',
			'stroke-width': 1.5,
			'fill-color': 'rgba(255, 255, 100, 0.25)',
			'circle-radius': 6,
			'circle-fill-color': 'rgba(255, 255, 100, 0.5)',
		},
	});
	return drawInteraction
}

function createSnapInteraction(source) {
	const snapInteraction = new Snap({ source });
	return snapInteraction
}