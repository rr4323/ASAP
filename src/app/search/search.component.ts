
import { Component, OnInit } from '@angular/core';

declare var L;
declare var tomtom:any;


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {


  constructor() {

 }

  ngOnInit() {
    (function(tomtom) {
    tomtom.searchKey('InogZul7UB1kDbMsLBkYDyTWmG6UcipP');
      // Creating map
      var map = tomtom.L.map('map', {
          key: 'InogZul7UB1kDbMsLBkYDyTWmG6UcipP',
          source: 'vector',
          basePath: 'sdk'
      }).setView([51.49912573429843, -0.12582778930664062], 6);

    // Define your product name and version

    var resultsList = tomtom.resultsList()
        .addTo(map);
    var markersLayer = L.tomTomMarkersLayer().addTo(map);
    var geometrySearchArea;
    var searchTypesList = document.getElementById('tomtom-example-searchesList')as HTMLSelectElement;

    searchTypesList.onchange = onSelectElementChange;
    var languageSelectorPlaceholder = document.getElementById('tomtom-language-selector-placeholder');
    var languageSelector = tomtom.languageSelector.getHtmlElement(new tomtom.localeService(), 'search');
    languageSelectorPlaceholder.insertBefore(languageSelector, languageSelectorPlaceholder.firstChild);
    buildGeopolSelector();
    var latInput = document.getElementById('latParam') as HTMLInputElement;
    var lonInput = document.getElementById('lonParam') as HTMLInputElement;
    var geoBiasControl = new GeoBiasControl();
      var form = document.getElementById('form');
        form.onsubmit = function() {
        clear();
        var selectedSearch = searchTypesList.options[searchTypesList.selectedIndex].value;
        var searchCall = prepareServiceCall(selectedSearch);
        if (!searchCall) {
            return false;
        }
        searchCall.go(function(geoResponses) {
            if (selectedSearch === 'geometrySearch') {
                drawGeometrySearchArea();
            }
            if (geoResponses.length > 0) {
                draw(geoResponses);
                map.fitBounds(markersLayer.getBounds());
            } else {
                resultsList.setContent('Results not found.');
            }
        });
        return false;
    };
    function buildGeopolSelector() {
        var geopolViewSelector = tomtom.geopolViewSelector.getHtmlElement(tomtom.globalGeopolViewService, 'search');
        var geopolSelectorContainer = document.getElementById('tomtom-geopol-selector-placeholder');
        geopolViewSelector.id = 'tomtom-example-geopolViewCodesList';
        geopolSelectorContainer.appendChild(geopolViewSelector);
        var label = document.createElement('label');
        label.setAttribute('for', 'tomtom-example-geopolViewCodesList');
        label.innerText = 'Geopolitical view';
        geopolSelectorContainer.appendChild(label);
    }
    /*
    * Calculates geometry search radius based on map bounds
    */
    function calculateSearchRadius() {
        var mapBounds = map.getBounds();
        var x = mapBounds.getSouthWest().distanceTo(mapBounds.getSouthEast());
        var y = mapBounds.getSouthWest().distanceTo(mapBounds.getNorthWest());
        return x < y ? x / 2 : y / 2;
    }
    /*
    * Prepares search service call basing on passed search name.
    * Depending on the service (geometrySearch and others) there are required parameters that have to be
    * passed to the search service: e.g. geometryList requires geometryList,
    * nearbySearch requires position (for example center of a map) and radius value,
    * and rest of services requires query and position.
    */
    function prepareServiceCall(searchName) {
        var selectedLangCode = languageSelector.value;
        var queryValue = (<HTMLInputElement>document.getElementById('query')).value;
        var minFuzzyValue =(<HTMLInputElement> document.getElementById('minFuzzyLevel')).value;
        var maxFuzzyValue = (<HTMLInputElement>document.getElementById('maxFuzzyLevel')).value;
        var limitValue = (<HTMLInputElement>document.getElementById('limit')).value;
        var viewValue = (<HTMLInputElement>document.getElementById('tomtom-example-geopolViewCodesList')).value;
        var currentLocation = map.getCenter();
        var defaultOpts = {unwrapBbox: true};
        var call;
        if (searchName === 'geometrySearch') {
            var searchRadius = calculateSearchRadius();
            var geometryListValue = [{
                'type': 'CIRCLE',
                'position': currentLocation.lat + ',' + currentLocation.lng,
                'radius': searchRadius
            }];
            call = tomtom.geometrySearch(defaultOpts).query(queryValue).geometryList(geometryListValue);
        } else if (searchName === 'nearbySearch') {
            call = tomtom.nearbySearch(defaultOpts);
        } else {
            call = tomtom[searchName](defaultOpts).query(queryValue);
        }
        if (searchName === 'fuzzySearch') {
            call = call.minFuzzyLevel(minFuzzyValue);
            call = call.maxFuzzyLevel(maxFuzzyValue);
        }
        call = call.language(selectedLangCode);
        if (!geoBiasControl.configureServiceCall(searchName, call)) {
            return null;
        }
        return call
            .limit(limitValue)
            .view(viewValue);
    }
    /*
    * Get result name from response
    */
    function getResultName(result) {
        if (typeof result.poi !== 'undefined' && typeof result.poi.name !== 'undefined') {
            return result.poi.name;
        }
        if (result.nm !== '') {
            return result.nm;
        }
        return '';
    }
    /*
    * Get result address from response
    */
    function getResultAddress(result) {
        if (typeof result.address !== 'undefined') {
            var address = [];
            if (typeof result.address.freeformAddress !== 'undefined') {
                address.push(result.address.freeformAddress);
            }
            if (typeof result.address.countryCodeISO3 !== 'undefined') {
                address.push(result.address.countryCodeISO3);
            }
            return address.join(', ');
        } else if (typeof result.a2 !== 'undefined') {
            return result.a2;
        }
        return '';
    }
    /*
    * Get result distance from search center
    */
    function getResultDistance(result) {
        if (typeof result.dist !== 'undefined') {
            return result.dist;
        } else if (typeof result.ps !== 'undefined') {
            return getDistance(result.ps.split(' '));
        }
        return '';
    }
    /*
    * Prepare result element for popup and result list
    */
    function prepareResultElement(result) {
        var resultElement = new tomtom.L.DomUtil.create('div', 'geoResponse-result');
        var name = getResultName(result);
        var adress = getResultAddress(result);
        var distance = getResultDistance(result);
        if (typeof name !== 'undefined') {
            var nameWrapper = tomtom.L.DomUtil.create('div', 'geoResponse-result-name');
            nameWrapper.innerHTML = name;
            resultElement.appendChild(nameWrapper);
        }
        if (typeof adress !== 'undefined') {
            var addressWrapper = tomtom.L.DomUtil.create('div', 'geoResponse-result-address');
            addressWrapper.innerHTML = adress;
            resultElement.appendChild(addressWrapper);
        }
        if (typeof distance !== 'undefined') {
            var distanceElement = tomtom.L.DomUtil.create('div', 'geoResponse-result-distance');
            distanceElement.innerHTML = tomtom.unitFormatConverter.formatDistance(distance);
            resultElement.appendChild(distanceElement);
        }
        return resultElement;
    }
    /*
    * Calculate distance between map center and point
    */
    function getDistance(point) {
        var currentLocation = map.getCenter();
        var mapCenterPoint = tomtom.L.latLng([currentLocation.lat, currentLocation.lng]);
        return mapCenterPoint.distanceTo(point);
    }
    /*
    * Draws markers on a map (based on the search results from the service).
    */
    function draw(searchResponses) {
        var markerOpt = {
            noMarkerClustering: true
        };
        var popupOpt = {
            popupHoverContent: getResultName,
            popupContent: prepareResultElement
        };
        markersLayer.setMarkersData(searchResponses)
            .setMarkerOptions(markerOpt)
            .setPopupOptions(popupOpt)
            .addMarkers();
        resultsList.clear().unfold();
        markersLayer.getMarkers().forEach(function(markerLayer, index) {
            var point = searchResponses[index];
            var geoResponseWrapper = prepareResultElement(point);
            var viewport = point.viewport;
            resultsList.addContent(geoResponseWrapper);
            geoResponseWrapper.onclick = function() {
                if (viewport) {
                    map.fitBounds([viewport.topLeftPoint, viewport.btmRightPoint]);
                } else {
                    map.panTo(markerLayer.getLatLng());
                }
                markerLayer.openPopup();
            };
        });
        drawSearchCenterMarker();
    }
    /*
    * Draw search center positon
    */
    function drawSearchCenterMarker() {
        var searchType = searchTypesList.options[searchTypesList.selectedIndex].value;
        if (!geoBiasControl.checked() && searchType !== 'geometrySearch') {
            return;
        }
        var currentLocation = geoBiasControl.getInputLatLng();
        var markerOptions = {
            title: 'Search Center\nLatitude: ' + currentLocation[0] +
            '\nLongitude: ' + currentLocation[1],
            icon: tomtom.L.icon({
                iconUrl: '<your-tomtom-sdk-base-path>/../img/center_marker.svg',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        };
        markersLayer.addLayer(
            tomtom.L.marker([currentLocation[0], currentLocation[1]], markerOptions)
        );
    }
    /*
    * Visualizes the area that geometry search is looking for onto..
    */
    function drawGeometrySearchArea() {
        var searchRadius = calculateSearchRadius();
        var currentLocation = map.getCenter();
        geometrySearchArea = tomtom.L.circle(
            [currentLocation.lat, currentLocation.lng], searchRadius
        ).addTo(map);
    }
    /*
    * Clears markers and search results.
    */
    function clear() {
        resultsList.clear();
        markersLayer.clearLayers();
        if (geometrySearchArea) {
            map.removeLayer(geometrySearchArea);
        }
    }
    /*
    * Depending on the search type some elements should be hidden or made visible.
    * This method is called on every change on drop down menu (with search types).
    */
    function onSelectElementChange() {
        var queryParamElement = document.getElementById('queryParam');
        var minFuzzyParamElement = document.getElementById('minFuzzyParam');
        var maxFuzzyParamElement = document.getElementById('maxFuzzyParam');
        var queryInputElement = document.getElementById('query')as HTMLInputElement;
        //nearby search specific
        if (searchTypesList.options[searchTypesList.selectedIndex].value === 'nearbySearch') {
            queryParamElement.style.display = 'none';
            queryInputElement.required = false;
        } else {
            queryParamElement.style.display = 'flex';
            queryInputElement.required = true;
        }
        //fuzzy search specific
        if (searchTypesList.options[searchTypesList.selectedIndex].value === 'fuzzySearch') {
            minFuzzyParamElement.style.display = 'flex';
            maxFuzzyParamElement.style.display = 'flex';
        } else {
            minFuzzyParamElement.style.display = 'none';
            maxFuzzyParamElement.style.display = 'none';
        }
        geoBiasControl.adjustVisibility(searchTypesList.options[searchTypesList.selectedIndex].value);
    }
    /*
    * Reflect changes on the map in the input
    */
    map.on('dragend', function() {
        var center = map.getCenter();
        latInput.value = center.lat.toFixed(7);
        lonInput.value = center.lng.toFixed(7);
    });
    map.on('zoomend', function() {
        var center = map.getCenter();
        latInput.value = center.lat.toFixed(7);
        lonInput.value = center.lng.toFixed(7);
    });
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var minFuzzyElement = document.getElementById('minFuzzyLevel') as HTMLInputElement;
    var maxFuzzyElement = document.getElementById('maxFuzzyLevel') as HTMLInputElement;
    var radiusElement = document.getElementById('radius') as HTMLInputElement;
    var limitElement = document.getElementById('limit') as HTMLInputElement;
    minFuzzyElement.onchange = handleRangeUpdate;
    maxFuzzyElement.onchange = handleRangeUpdate;
    radiusElement.onchange = handleRangeUpdate;
    limitElement.onchange = handleRangeUpdate;
    latInput.onchange = function() {
        var center = geoBiasControl.getInputLatLng();
        if (center) {
            map.setView(center);
        }
    };
    lonInput.onchange = function() {
        var center = geoBiasControl.getInputLatLng();
        if (center) {
            map.setView(center);
        }
    };
    function validateMinMaxFuzzy() {
        if (minFuzzyElement.value > maxFuzzyElement.value) {
            minFuzzyElement.value = maxFuzzyElement.value;
        }
    }
    function handleRangeUpdate() {
        validateMinMaxFuzzy();
        document.getElementById('limitAmount').innerHTML = 'Limit (' +
            limitElement.value + ')';
        document.getElementById('minFuzzyLevelLabel').innerHTML = 'Min Fuzzy level (' +
            minFuzzyElement.value + ')';
        document.getElementById('maxFuzzyLevelLabel').innerHTML = 'Max Fuzzy level (' +
            maxFuzzyElement.value + ')';
        document.getElementById('radiusLabel').innerHTML = 'Radius (' +
            radiusElement.value + ' m)';
    }
    function GeoBiasControl() {
        this.geoBiasInput = document.getElementById('geoBias');
        this.geoBiasPanel = document.getElementById('geoBiasPanel');
        this.geoBiasMessage = document.getElementById('geoBiasMessage');
        this.latInput = document.getElementById('latParam');
        this.lonInput = document.getElementById('lonParam');
        this.latParam = document.getElementById('latParamElement');
        this.lonParam = document.getElementById('lonParamElement');
        this.radiusInput = document.getElementById('radius');
        this.radiusParam = document.getElementById('radiusParam');
        this.geoBiasMessageText = 'Geo Bias is turned off';
        this.state = 'SHOWN';
        this.rememberedState = null;
        var that = this;
        function turnControlOnOrOff(onOffFlag) {
            that.rememberedState = onOffFlag ? 'SHOWN' : 'HIDDEN';
            that.changeState(that.rememberedState);
        }
        this.geoBiasInput.addEventListener('click', function() {
            turnControlOnOrOff(that.geoBiasInput.checked);
        });
        this.geoBiasMessage.addEventListener('click', function changeGeoBiasCheckbox() {
            if (!that.geoBiasInput.checked) {
                that.geoBiasInput.checked = true;
                turnControlOnOrOff(true);
            }
        });
    }
    GeoBiasControl.prototype.changeState = function(state) {
        var coordinatesVisibility = 'flex';
        var geoBiasPanelVisibility = 'flex';
        var radiusVisibility = 'flex';
        var geoBiasInputDisabled = false;
        var geoBiasMessage = '';
        switch (state) {
        case 'HIDDEN': {
            coordinatesVisibility = 'none';
            radiusVisibility = 'none';
            geoBiasMessage = this.geoBiasMessageText;
            this.geoBiasInput.checked = false;
            break;
        }
        case 'INVISIBLE': {
            geoBiasPanelVisibility = 'none';
            break;
        }
        case 'NEARBY': {
            radiusVisibility = 'none';
            geoBiasInputDisabled = true;
            this.geoBiasInput.checked = true;
        }
        }
        this.state = state;
        this.radiusParam.style.display = radiusVisibility;
        this.latParam.style.display = coordinatesVisibility;
        this.lonParam.style.display = coordinatesVisibility;
        this.geoBiasPanel.style.display = geoBiasPanelVisibility;
        this.geoBiasMessage.innerText = geoBiasMessage;
        this.geoBiasInput.disabled = geoBiasInputDisabled;
    };
    GeoBiasControl.prototype.adjustVisibility = function(searchType) {
        var visibilityState = this.rememberedState;
        switch (searchType) {
        case 'geometrySearch':
            visibilityState = 'INVISIBLE';
            break;
        case 'nearbySearch':
            visibilityState = 'NEARBY';
            break;
        }
        if (visibilityState !== this.state) {
            this.changeState(visibilityState);
        }
    };
    GeoBiasControl.prototype.getInputLatLng = function() {
        var coords = [this.latInput.value, this.lonInput.value];
        if (coords.length !== 2 || !isNumber(coords[0]) || !isNumber(coords[1])) {
            tomtom.messageBox({ closeAfter: 3000 }).setContent('Incorrect position!').openOn(map);
            return false;
        }
        return [coords[0].trim(), coords[1].trim()];
    };
    GeoBiasControl.prototype.configureServiceCall = function(searchType, call) {
        if (searchType === 'geometrySearch' || (!this.geoBiasInput.checked && searchType !== 'nearbySearch')) {
            return true;
        }
        var coordinates = this.getInputLatLng();
        var radius = parseInt(this.radiusInput.value, 10);
        if (coordinates) {
            call.center(coordinates);
        } else {
            return false;
        }
        if (searchType === 'nearbySearch') {
            call.radius(10000);
        } else if (radius) {
            call.radius(radius);
        }
        return true;
    };
    GeoBiasControl.prototype.checked = function() {
        return this.geoBiasInput.checked;
	};
	})(tomtom);
      }
    }
