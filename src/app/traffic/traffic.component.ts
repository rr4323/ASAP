import { Component, OnInit } from '@angular/core';
declare var tomtom:any;
declare var L;
@Component({
  selector: 'app-traffic',
  templateUrl: './traffic.component.html',
  styleUrls: ['./traffic.component.css']
})
export class TrafficComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    var trafficOptions = {
            style: 's3',
            refresh: 5000,
            key: 'InogZul7UB1kDbMsLBkYDyTWmG6UcipP',
            diff: true
        };
        var trafficFlowOptions = {
            key: 'InogZul7UB1kDbMsLBkYDyTWmG6UcipP',
            refresh: 180000
        };

        var map = tomtom.map('map', {
            key: 'InogZul7UB1kDbMsLBkYDyTWmG6UcipP',
            source: ['vector', 'raster'],
            basePath: 'sdk',
            traffic: trafficOptions,
            trafficFlow: trafficFlowOptions,
            center: [51.50276, -0.12634],
            zoom: 10
        });

        var languageLabel = L.DomUtil.create('label');
        languageLabel.innerHTML = 'Maps language';
        var languageSelector = tomtom.languageSelector.getHtmlElement(tomtom.globalLocaleService, 'maps');
        languageLabel.appendChild(languageSelector);
        var languageWarning = L.DomUtil.create('label', 'warning');
        languageWarning.innerHTML = 'Language selection is only possible for vector map tiles.';
        tomtom.controlPanel({
            position: 'bottomright',
            title: 'Settings',
            collapsed: true,
            closeOnMapClick: false
        })
            .addTo(map)
            .addContent(languageLabel)
            .addContent(languageWarning);

        tomtom.controlPanel({
            position: 'topright',
            title: null,
            show: null,
            close: null,
            collapsed: false,
            closeOnMapClick: false
        })
            .addTo(map)
            .addContent(document.getElementById('map').nextElementSibling);

        function centerOnMarker(trafficIncidentsLayer) {
            trafficIncidentsLayer.on('click', function(event) {
                var marker = event.propagatedFrom;
                map.setView(marker.getLatLng(), map.getZoom());
            });
        }

        var layers = L.MapUtils.findLayersByName('trafficIncidents', map);
        if (layers.length) {
            centerOnMarker(layers[0]);
        }

        function toggleLayer(layerName) {
            var layer = tomtom.L.MapUtils.findLayersByName(layerName, map)[0];
            var newTrafficLayer;
            if (!layer) {
                if (layerName === 'trafficWithIncidents') {
                    newTrafficLayer = new L.TomTomTrafficWithIncidentsLayer(trafficOptions);
                    map.addLayer(newTrafficLayer);
                    centerOnMarker(newTrafficLayer.incidentsLayer);
                } else {
                    map.addLayer(new L.TomTomTrafficFlowLayer(trafficFlowOptions));
                }
            } else {
                map.removeLayer(layer);
            }
        }

        function updateBaseLayer() {
            map.setMapSource(this.value);
            if (this.value === 'vector') {
                languageLabel.classList.remove('disabled');
                languageSelector.disabled = false;
            } else if (this.value === 'raster') {
                languageLabel.classList.add('disabled');
                languageSelector.disabled = true;
            }
        }
        document.getElementById('baseLayer').onchange = updateBaseLayer;

        (function initializeTileSwitcher() {
            var select = document.getElementById('baseLayer');
            var layers = map.getBaseLayers();

            function newOption(value, label, selected) {
                var option = document.createElement('option');
                option.value = value;
                option.text = label;
                if (selected) {
                    option.selected = 'selected';
                }
                return option;
            }

            layers.raster && select.appendChild(newOption('raster', 'Raster'));
            layers.vector && select.appendChild(newOption('vector', 'Vector', 'selected'));
        })();
  }

}
