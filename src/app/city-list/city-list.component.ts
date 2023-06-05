import { Component } from '@angular/core';
import { City } from '../shared/services/city';
import { CrudService } from '../shared/services/crud.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss']
})
export class CityListComponent {


  cities: City[];
  city: City | undefined;
  uid: string | undefined;

  constructor(
    private crudService: CrudService,
    private dialog: MatDialog,
    public router: Router
  ) {
    this.cities = [{
      name: '',
      description: '',
      latitude: undefined,
      longitude: undefined,
      image: '',
      uid: ''
    }];
  }

  ngOnInit(): void {
    this.crudService.getCities().subscribe(cities => {
      this.cities = cities;


      if (this.uid) {
        const cityChosen = cities.find(x => x.uid === this.uid);
        if (cityChosen) {
          this.city = cityChosen;
        }
      }
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
    console.log(city);
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

        this.crudService.deleteCity(city);
      } else {
        return;
      }
    });
  }

}
