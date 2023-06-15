import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { CrudService } from '../shared/services/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel, MatExpansionPanelState } from '@angular/material/expansion';

import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { City } from '../shared/services/city';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  hora: string | undefined;
  diaSemana: string | undefined;
  diaMesAno: string | undefined;
  public showProfilePanel: boolean = false;
  public showFavsPanel: boolean = false;
  userData: any;
  displayName: string | undefined;
  photoURL: string | undefined;
  email: string | undefined;
  name: string | undefined;
  surname: string | undefined
  @ViewChild('profilePanel') profilePanel: ElementRef | undefined;
  @ViewChild('favPanel', { static: false })
  favPanel!: ElementRef;
  fromLogin: boolean | undefined;
  @ViewChild(MatExpansionPanel) panel!: MatExpansionPanel;

  private favoriteCitiesSubscription: Subscription | undefined;

  favoriteCities: City[] = [];

  constructor(
    public authService: AuthService,
    private dialog: MatDialog,
    public router: Router,
    private storage: Storage,
    private crudService: CrudService
  ) { }

  public goToInitialPage(): void {
    this.router.navigate(['/list/']);
  }



  ngOnInit() {
    if (this.authService.userData) {
      //console.log(this.authService.userData);
      this.userData = this.authService.userData;
      this.displayName = this.capitalizarPrimeraLetra(this.userData.displayName);
      const [name, surname] = this.displayName!.split(' ');
      this.name = this.capitalizarPrimeraLetra(name);
      this.surname = this.capitalizarPrimeraLetra(surname);
      this.photoURL = this.userData.photoURL;
      this.email = this.userData.email;


    }



    this.favoriteCitiesSubscription = this.crudService
      .showUserFavorites()
      .subscribe(
        (cities: City[]) => {
          //console.log(cities); // Verificar si se obtienen los datos correctamente
          this.favoriteCities = cities;
        },
        (error) => {
          console.error(error);
        }
      );

    this.updateFavoriteCities();

    this.actualizarFechaHora();

    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
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

  actualizarFechaHora() {
    const fechaActual = new Date();

    const hora = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    const segundos = fechaActual.getSeconds();

    const minutosFormateados = minutos < 10 ? `0${minutos}` : minutos.toString();
    const segundosFormateados = segundos < 10 ? `0${segundos}` : segundos.toString();

    this.hora = `${hora}:${minutosFormateados}:${segundosFormateados}`;

    // Obtener el día de la semana actual y capitalizar la primera letra
    const opcionesDiaSemana = { weekday: 'long' };
    const diaSemana = fechaActual.toLocaleDateString('es-ES', opcionesDiaSemana as Intl.DateTimeFormatOptions);
    this.diaSemana = this.capitalizeFirstLetter(diaSemana);

    // Obtener el día del mes, mes y año actual y capitalizar la primera letra de los meses
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();

    this.diaMesAno = `${dia} de ${this.capitalizeFirstLetter(this.getMonthNameSpanish(mes))} de ${año}`;
  }

  getMonthNameSpanish(month: number): string {
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return monthNames[month];
  }

  capitalizeFirstLetter(str: string): string {
    if (str && str.length > 0) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return '';
    }
  }


  openlogOutDialog(): void {

    if (this.showFavsPanel) {
      this.showFavsPanel = false;
    }
    if (this.showProfilePanel) {
      this.showProfilePanel = false;
    }

    const dialogData: ConfirmDialogData = {
      title: 'Cerrar sesión',
      message: '¿Está seguro de cerrar sesión?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se hizo clic en "Yes"
        this.authService.SignOut();
      } else {
        return;
      }
    });
  }

  openDeleteFavDialog(city: City): void {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar Favorito',
      message: 'Se eliminará ' + city.name + ' de favoritos'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se hizo clic en "Yes"
        this.removeCityFromFavorite(city);
      } else {
        return;
      }
    });
  }

  removeCityFromFavorite(city: City): void {
    this.crudService
      .removeCityFromFavorites(city)
      .then(() => {
        //console.log('City removed from favorites successfully');
        this.updateFavoriteCities();
      })
      .catch((error) => {
        console.error('Error removing city from favorites:', error);
      });
  }

  openChangePasswordDialog(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Cambiar de contraseña',
      message: 'Será redirigido a la pantalla de restablecer contraseña'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se hizo clic en "Yes"
        this.router.navigate(['/forgot-password'], { queryParams: { fromLogin: true } });
      } else {
        return;
      }
    });
  }

  dataURLtoBlob(dataURL: string): Blob | null {
    if (!dataURL) {
      return null;
    }

    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);

    if (mimeMatch && mimeMatch.length) {
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new Blob([u8arr], { type: mime });
    }

    return null;
  }

  onclick(cityId: string) {
    if (cityId) {
      this.router.navigate(['/map/' + cityId]);
    }
  }

  openEditDialog(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Cambiar imagen de perfil',
      message: 'Seleccione una nueva imagen o elimine la foto existente',
      showModifyOption: true,
      showDeleteOption: true,
      photoURL: this.photoURL // Pasar el valor actual del photoURL al diálogo
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '800px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se hizo clic en "Aceptar"
        if (dialogData.photoURL !== undefined) { // Comprobar si photoURL no es null ni undefined
          if (dialogData.photoURL !== this.photoURL) { // Verificar si es una nueva imagen
            if (dialogData.photoURL !== null) { // Verificar si photoURL no es null
              // Si hay una nueva imagen seleccionada
              const blob = this.dataURLtoBlob(dialogData.photoURL);
              if (blob) {
                const storageRef = ref(this.storage, `users/${this.authService.userData.displayName}`);
                uploadBytes(storageRef, blob).then(() => {
                  getDownloadURL(storageRef).then(downloadURL => {
                    this.authService.updatePhotoURL(downloadURL).then(() => {
                      // El photoURL se actualizó correctamente
                      this.photoURL = downloadURL; // Actualizar el valor de photoURL en el componente
                    }).catch(error => {
                      // Ocurrió un error al actualizar el photoURL
                      console.error(error);
                    });
                  }).catch(error => {
                    // Ocurrió un error al obtener la URL de descarga de la imagen
                    console.error(error);
                  });
                }).catch(error => {
                  // Ocurrió un error al subir la imagen al almacenamiento de Firebase
                  console.error(error);
                });
              } else {
                // El valor de photoURL no es un Data URL válido
                console.error('El valor de photoURL no es un Data URL válido');
              }
            } else {
              // No se seleccionó una nueva imagen, pero se eliminó la imagen existente
              this.authService.updatePhotoURL(null).then(() => {
                // El photoURL se actualizó correctamente
                this.photoURL = undefined; // Actualizar el valor de photoURL en el componente a undefined
                const storageRef = ref(this.storage, `users/${this.authService.userData.displayName}`);
                deleteObject(storageRef).then(() => {
                  this.authService.userData.photoURL = undefined;
                  this.authService.userData.providerData[0].photoURL = undefined;
                  // La imagen se eliminó correctamente
                }).catch(error => {
                  // Ocurrió un error al eliminar la imagen del almacenamiento de Firebase
                  console.error(error);
                });
              }).catch(error => {
                // Ocurrió un error al actualizar el photoURL
                console.error(error);
              });
            }
          } else {
            // Es la misma imagen, no se necesita actualizar
          }
        } else {
          // El valor de photoURL es null o undefined
          console.error('El valor de photoURL es null o undefined');
        }
      } else {
        // Se hizo clic en "Cancelar" o se cerró el diálogo sin realizar ninguna acción
      }
    });
  }

  toggleProfilePanel(): void {
    this.showProfilePanel = !this.showProfilePanel;
    this.showFavsPanel = false;
  }

  toggleFavsPanel(): void {
    this.resizeApp();
    this.showFavsPanel = !this.showFavsPanel;
    this.showProfilePanel = false;
  }
  addCityToFavorite(city: City): void {
    this.crudService
      .addCityToFavorites(city)
      .then(() => {
        //console.log('City added to favorites successfully');
        this.updateFavoriteCities(); // Llama a la función para actualizar la lista
      })
      .catch((error) => {
        console.error('Error adding city to favorites:', error);
      });
  }

  updateFavoriteCities(): void {
    this.crudService.getFavoriteCities().subscribe((favoriteCities: City[]) => {
      this.favoriteCities = favoriteCities;
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.resizeApp(); // Llamada al método resizeApp cuando se redimensiona la ventana
  }

  resizeApp() {
    const windowH = window.innerHeight;
    const windowW = window.innerWidth;
    const rest = 115;

    const displayContent = document.getElementById("container");
    if (displayContent) {
      displayContent.style.height = (windowH - rest) + "px";
    }
  }

}
