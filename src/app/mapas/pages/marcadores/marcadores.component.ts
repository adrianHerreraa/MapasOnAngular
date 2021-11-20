import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as mapboxgl  from "mapbox-gl";

interface markersInterface {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        width: 100%;
        height: 100%;
      }

      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }

      li {
        cursor: pointer;
      }
    `
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;

  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  centerCoordinates: [number, number] = [ -101.19170430318367, 19.702345831142505 ];

  // Arreglo de marcadores.
  marcadores: markersInterface[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.centerCoordinates,
      zoom: this.zoomLevel,
    });

    this.readLocalStorage();

    /*Elemento personalizado para poner en lugar de un pin generico.
      puedes crear un diseño personalizado.
    */
    /*const markerHTML: HTMLElement = document.createElement('div');
    markerHTML.innerHTML = 'Mi casa'; */

    /*const marker = new mapboxgl.Marker()
      .setLngLat( this.centerCoordinates )
      .addTo( this.mapa ); */

  }

  addNewMarker(){

    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const newMarker = new mapboxgl.Marker({
      draggable: true,
      color,
    })
      .setLngLat( this.centerCoordinates )
      .addTo( this.mapa );

    this.marcadores.push({
      color: color,
      marker: newMarker,
    });

    this.saveMarkersOnLocalStorage();

    newMarker.on('dragend', () => {
      this.saveMarkersOnLocalStorage();
    });

  }

  goToMarker( marker: markersInterface ){
    this.mapa.flyTo({
      center: marker.marker!.getLngLat(),
    });
  }


  saveMarkersOnLocalStorage(){

    const lngLatArr: markersInterface[] = [];

    this.marcadores.forEach( (m) => {
      
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({
        color: color,
        centro: [lng, lat],
      });

      localStorage.setItem('markers', JSON.stringify(lngLatArr));

    });
  }

  readLocalStorage(){
    
    if( !localStorage.getItem('markers') ){
      return;
    }else{
      const lngLatArr: markersInterface[] = JSON.parse( localStorage.getItem('markers')! );

      lngLatArr.forEach( (m) => {
        
        const marker = new mapboxgl.Marker({
          color: m.color,
          draggable: true,
        })
        .setLngLat(m.centro!)
        .addTo(this.mapa);

        this.marcadores.push({
          marker: marker,
          color: m.color,
        });

        marker.on('dragend', () => {
          this.saveMarkersOnLocalStorage();
        });

      });
      
    }

  }

  borrarMarcador( i: number ){
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);
    this.saveMarkersOnLocalStorage();
  }


}
