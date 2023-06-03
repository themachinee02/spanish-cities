import { Component } from '@angular/core';
import { City } from '../shared/services/city';
import { CrudService } from '../shared/services/crud.service';
import * as L from 'leaflet';
import { marker, tileLayer } from 'leaflet';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-city-map',
  templateUrl: './city-map.component.html',
  styleUrls: ['./city-map.component.scss']
})
export class CityMapComponent {

  private unsuscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private crudService: CrudService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  uid: string | null | undefined;
  cityChosen: City | undefined;

  ngOnInit(): void {

    console.log(this.activatedRoute.snapshot.params);
    this.uid = this.activatedRoute.snapshot.paramMap.get('id');
    this.getCity();

  }

  getCity() {
    this.crudService.getCities().pipe(takeUntil(this.unsuscribe)).subscribe(cities => {

      if (cities.length > 0) {
        this.uid = this.capitalizarPrimeraLetra(this.uid!);
        console.log(this.uid);
        this.cityChosen = cities.find(x => x.uid === this.uid);
        console.log(this.cityChosen);
        if (this.cityChosen) {
          this.createMap(this.cityChosen);
        }
      }

    });
  }

  capitalizarPrimeraLetra(str: string): string {
    if (str.length === 0) {
      return str;
    }

    const palabras = str.split(' ');

    const palabrasCapitalizadas = palabras.map((palabra) => {
      if (palabra.length === 0) {
        return palabra;
      }

      const primeraLetra = palabra.charAt(0).toUpperCase();
      const restoDePalabra = palabra.slice(1).toLowerCase();

      return primeraLetra + restoDePalabra;
    });

    return palabrasCapitalizadas.join(' ');
  }
  createMap(city: City) {
    const lat = city.latitude;
    const long = city.longitude;
    const name = city.name;

    if (lat && long && name) {
      var map = L.map('map').setView([lat, long], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      var icon = new L.Icon.Default();
      icon.options.shadowSize = [0, 0];
      L.marker([lat, long], { icon: icon }).addTo(map)
        .bindTooltip(name, {
          permanent: true,
          direction: 'top',
          offset: [-15, 0]
        })
        .openTooltip();
    }
  }


}
