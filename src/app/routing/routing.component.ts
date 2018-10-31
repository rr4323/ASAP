import { Component, OnInit } from '@angular/core';
declare var tomtom:any;
declare var L;

@Component({
  selector: 'app-routing',
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.css']
})
export class RoutingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    //Setting TomTom keys
    tomtom.routingKey('InogZul7UB1kDbMsLBkYDyTWmG6UcipP');
    tomtom.searchKey('InogZul7UB1kDbMsLBkYDyTWmG6UcipP');

    // Creating map
    var map = tomtom.L.map('map', {
        key: 'InogZul7UB1kDbMsLBkYDyTWmG6UcipP',
        source: 'vector',
        basePath: 'sdk'
    });
    map.zoomControl.setPosition('topright');

    var unitSelector = tomtom.unitSelector.getHtmlElement(tomtom.globalUnitService);
    var languageSelector = tomtom.languageSelector.getHtmlElement(tomtom.globalLocaleService, 'search');

    var unitRow = document.createElement('div');
    var unitLabel = document.createElement('label');
    unitLabel.innerHTML = 'Unit of measurement';
    unitLabel.appendChild(unitSelector);
    unitRow.appendChild(unitLabel);
    unitRow.className = 'input-container';

    var langRow = document.createElement('div');
    var langLabel = document.createElement('label');
    langLabel.innerHTML = 'Search language';
    langLabel.appendChild(languageSelector);
    langRow.appendChild(langLabel);
    langRow.className = 'input-container';

    tomtom.controlPanel({
        position: 'bottomright',
        title: 'Settings',
        collapsed: true
    })
        .addTo(map)
        .addContent(unitRow)
        .addContent(langRow);

    // Relocating zoom buttons
    map.zoomControl.setPosition('bottomleft');

    // Adding the route widget
    var routeOnMapView = tomtom.routeOnMap({
        // Options for the route start marker
        startMarker: {
            icon: tomtom.L.icon({
                iconUrl: '<your-tomtom-sdk-base-path>/../img/start.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        },
        // Options for the route end marker
        endMarker: {
            icon: tomtom.L.icon({
                iconUrl: '<your-tomtom-sdk-base-path>/../img/end.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }
    }).addTo(map);

    // Creating route inputs widget
    var routeInputsInstance = tomtom.routeInputs({location: false})
        .addTo(map);

    // Connecting the route inputs widget with the route widget
    routeInputsInstance.on(routeInputsInstance.Events.LocationsFound, function(eventObject) {
        routeOnMapView.draw(eventObject.points);
    });

    routeInputsInstance.on(routeInputsInstance.Events.LocationsCleared, function(eventObject) {
        routeOnMapView.draw(eventObject.points);
    });

  }


}
