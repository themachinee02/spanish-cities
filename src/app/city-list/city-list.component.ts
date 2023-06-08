import { Component, OnInit } from '@angular/core';
import { City } from '../shared/services/city';
import { CrudService } from '../shared/services/crud.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss']
})
export class CityListComponent implements OnInit {
  cities: City[];
  city: City | undefined;
  uid: string | undefined;
  favoriteCities: City[] = []; // Lista de ciudades favoritas del usuario actual

  constructor(
    private crudService: CrudService,
    public authService: AuthService,
    private dialog: MatDialog,
    public router: Router
  ) {
    this.cities = [];
  }

  ngOnInit(): void {
    this.uid = this.authService.getUserId();

    this.crudService.getCities().subscribe(cities => {
      this.cities = cities;

      if (this.uid) {
        const cityChosen = cities.find(x => x.uid === this.uid);
        if (cityChosen) {
          this.city = cityChosen;
        }
      }

      // Obtener las ciudades favoritas del usuario actual
      this.crudService.getFavoriteCities().subscribe(favoriteCities => {
        this.favoriteCities = favoriteCities;

        // Actualizar la propiedad isFavorite de las ciudades
        this.updateCityFavorites();
      });
    });
  }

  onclick(cityId: string) {
    if (cityId) {
      this.router.navigate(['/map/' + cityId]);
    }
  }

  createCity(): void {
    this.router.navigate(['/create/']);
  }

  async onClickDelete(city: City) {
    //console.log(city);
    const response = await this.crudService.deleteCity(city);
    response;
  }

  openDeleteDialog(city: City): void {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar ciudad',
      message: '¿Está seguro de eliminar ' + city.name + '?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crudService.deleteCity(city);
      } else {
        return;
      }
    });
  }

  openFavDialog(city: City): void {
    const dialogData: ConfirmDialogData = {
      title: 'Añadir a favoritos',
      message: 'Se va a agregar ' + city.name + ' a favoritos.'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crudService.addCityToFavorites(city).then(() => {
          city.isFavorite = true; // Actualizar la propiedad isFavorite cuando se añade la ciudad a favoritos
        });
      } else {
        return;
      }
    });
  }

  // Actualizar la propiedad isFavorite de las ciudades
  private updateCityFavorites(): void {
    this.cities.forEach(city => {
      //this.authService.loading = false;
      city.isFavorite = this.favoriteCities.some(favoriteCity => favoriteCity.name === city.name);
    });
  }
}
