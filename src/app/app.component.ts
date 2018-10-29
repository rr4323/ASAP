import { Component, OnInit } from '@angular/core';
declare let L;
declare let tomtom:any;
‌
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(){

  }

    ngOnInit() {
        const map = tomtom.L.map('map', {
          key: 'InogZul7UB1kDbMsLBkYDyTWmG6UcipP',
          basePath: 'sdk',
          center: [ 52.360306, 4.876935 ],
          zoom: 15,
          source : 'raster'
        });
        var languageLabel = L.DomUtil.create('label');
        languageLabel.innerHTML = 'Maps language';
        var languageSelector = tomtom.languageSelector.getHtmlElement(tomtom.globalLocaleService, 'maps');
        languageLabel.appendChild(languageSelector);
        tomtom.controlPanel({
            position: 'bottomright',
            title: 'Settings',
            collapsed: true,
            closeOnMapClick: false
        })
            .addTo(map)
            .addContent(languageLabel);
            map.once(L.Map.Events.ATTRIBUTION_LOAD_END, function(event) {
            var attributions = [
                '<a href="https://www.tomtom.com/mapshare/tools/" target="_blank">Report map issue</a>',
                '<a href="//www.tomtom.com/en_gb/legal/privacy/" id="privacy_link" target="_blank">Privacy</a>'
            ];
            map.attributionControl.setPosition('bottomleft');
            map.attributionControl.removeAttribution(event.data);
            attributions.unshift(event.data);
            map.attributionControl.addAttribution(attributions.join(' | '));
        });
        

    }
}
