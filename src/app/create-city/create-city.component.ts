import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../shared/services/crud.service';
import { tileLayer } from 'leaflet';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

import * as GeoSearch from 'leaflet-geosearch';
import * as LControl from 'leaflet-control-geocoder';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-create-city',
  templateUrl: './create-city.component.html',
  styleUrls: ['./create-city.component.scss']
})
export class CreateCityComponent implements OnInit {
  formulario: FormGroup;
  latitude!: number;
  longitude!: number;
  selectedFile: any;
  urlImage!: string;
  selectedImage: string = '';
  selectedImageName: string = '';
  hasSelectedImage: boolean = false;
  isPreviewingImage: boolean = false;

  loading: boolean = false;


  existsErrorName: boolean = false;
  existsErrorLocation: boolean = false;
  existsErrorImage: boolean = false;
  file: any;


  constructor(
    private placesService: CrudService,
    private router: Router,
    public authService: AuthService,
    private storage: Storage,
    private renderer: Renderer2
  ) {
    this.formulario = new FormGroup({
      uid: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      latitude: new FormControl(null, [Validators.required]),
      longitude: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      image: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.createMap();
  }

  capitalizarPrimeraLetra(str: string): string {
    if (str.length === 0) {
      return str; // Devuelve la frase sin cambios si está vacía
    }

    const palabras = str.split(' '); // Divide la frase en palabras

    const palabrasCapitalizadas = palabras.map((palabra) => {
      if (palabra.length === 0) {
        return palabra; // Devuelve la palabra sin cambios si está vacía
      }

      const primeraLetra = palabra.charAt(0).toUpperCase();
      const restoDePalabra = palabra.slice(1).toLowerCase();

      return primeraLetra + restoDePalabra;
    });

    return palabrasCapitalizadas.join(' '); // Une las palabras capitalizadas en una frase nuevamente
  }

  send(event: Event) {
    this.authService.loading = true;
    event.preventDefault();

    if (this.formulario.controls['name'].value) {
      const palabra = this.capitalizarPrimeraLetra(this.formulario.controls['name'].value);
      this.formulario.controls['name'].setValue(palabra);
      this.formulario.controls['uid'] = this.formulario.controls['name'];
      if (this.file) {
        this.uploadImage(this.file);
      }
    }
    if (this.latitude && this.longitude) {
      this.formulario.controls['latitude'].setValue(this.latitude);
      this.formulario.controls['longitude'].setValue(this.longitude);
    }

    if (this.formulario.controls['name'].status === 'INVALID') {
      this.existsErrorName = true;
    } else { this.existsErrorName = false; }
    if (this.formulario.controls['latitude'].status === 'INVALID' && this.formulario.controls['longitude'].status === 'INVALID') {
      this.existsErrorLocation = true;
    } else { this.existsErrorLocation = false; }

    setTimeout(() => {

      if (this.urlImage && this.urlImage !== '') {
        this.formulario.controls['image'].setValue(this.urlImage);
        this.existsErrorImage = false;
      }
      if (this.formulario.controls['image'].status === 'INVALID') {
        this.existsErrorImage = true;
      } else { this.existsErrorImage = false; }
      if (this.formulario.valid) {
        this.createCity();
      }
    }, 5000);
  }

  async createCity() {

    if (this.formulario.valid) {
      //console.log(this.formulario);
      await this.placesService.addCity(this.formulario.value);
      this.formulario.reset();
      this.authService.loading = false;
      this.router.navigate(['/list/']);
    }
  }

  createMap() {
    var map = L.map('map', { zoomControl: false }).setView([40.3084322, -3.6844733], 7);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var marker: L.Marker;
    var icon = new L.Icon.Default();
    icon.options.shadowSize = [0, 0];

    map.on('click', (e) => {
      if (marker) {
        map.removeLayer(marker);
      }
      this.latitude = e.latlng.lat;
      this.longitude = e.latlng.lng;
      marker = L.marker(e.latlng, { icon: icon }).addTo(map);
      this.getPlaceName(e.latlng.lat, e.latlng.lng).then((placeName) => {
        marker.bindTooltip(placeName, { direction: 'top', permanent: true, offset: [-15, 0] }).openTooltip();
        map.setView(e.latlng);
      });
    });

    const searchControl = LControl.geocoder({
      defaultMarkGeocode: false,
      position: 'topleft',
    }).on('markgeocode', (event: any) => {
      const result = event.geocode;
      const { lat, lng } = result.center;
      this.latitude = lat;
      this.longitude = lng;

      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker([lat, lng], { icon: icon }).addTo(map);
      this.getPlaceName(lat, lng).then((placeName) => {
        marker.bindTooltip(placeName, { direction: 'top', permanent: true, offset: [-15, 0] }).openTooltip();
        map.setView([lat, lng]);
      });
    });
    searchControl.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Modificar el placeholder del input de búsqueda
    const searchInput = document.querySelector('.leaflet-control-geocoder-form input') as HTMLInputElement;
    if (searchInput) {
      searchInput.placeholder = 'Busca tu ciudad';
    }

    // Mantener el control de búsqueda siempre expandido
    const searchControlContainer = document.querySelector('.leaflet-control-geocoder.leaflet-bar.leaflet-control') as HTMLElement;
    if (searchControlContainer) {
      searchControlContainer.classList.add('leaflet-control-geocoder-expanded');
    }
  }


  getPlaceName(latitude: number, longitude: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          return data.display_name;
        } else {
          return '';
        }
      })
      .catch(error => {
        console.log(error);
        return '';
      });
  }


  onFileSelected(event: any) {
    this.file = event.target.files[0];
    this.previewImage(this.file);
  }

  uploadImage(file: File) {
    this.authService.loading = true;
    this.selectedFile = file;
    const imgRef = ref(this.storage, '/cities/' + this.formulario.controls['name'].value);

    uploadBytes(imgRef, this.selectedFile)
      .then(response => {
        this.getImage();
      })
      .catch(error => {
        console.log(error);
        this.authService.loading = false;
      });
  }

  getImage() {
    const imagesRef = ref(this.storage, '/cities/' + this.formulario.controls['name'].value);

    getDownloadURL(imagesRef)
      .then(async response => {
        this.urlImage = '';
        this.urlImage = response;
      })
      .catch(error => console.log(error));
  }

  previewImage(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      this.selectedImageName = file.name;
      this.hasSelectedImage = true;
      this.existsErrorImage = false;
    };

    reader.readAsDataURL(file);
  }

  removeImage() {
    this.isPreviewingImage = false;
    this.selectedImage = '';
    this.selectedImageName = '';
    this.hasSelectedImage = false;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.value = '';

    this.formulario.get('image')?.setValue(null);
    this.renderer.setProperty(fileInput, 'value', '');
    this.urlImage = '';
  }
}
