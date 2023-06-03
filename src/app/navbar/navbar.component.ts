import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

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
  userData: any;
  displayName: string | undefined;
  photoURL: string | undefined;

  @ViewChild('profilePanel') profilePanel: ElementRef | undefined;

  constructor(
    public authService: AuthService,
    private dialog: MatDialog,
    public router: Router,
    private storage: Storage
  ) { }

  public goToInitialPage(): void {
    this.router.navigate(['/list/']);
  }

  ngOnInit() {

    setTimeout(() => {
      if (this.authService.userData && this.authService.userData.photoURL) {
        this.userData = this.authService.userData;
        this.displayName = this.userData.displayName;
        this.photoURL = this.userData.photoURL;
        console.log(this.photoURL);
      }
    }, 1000);

    this.actualizarFechaHora();

    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
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
    const diaSemana = fechaActual.toLocaleDateString(undefined, opcionesDiaSemana as Intl.DateTimeFormatOptions);
    this.diaSemana = this.capitalizeFirstLetter(diaSemana);

    // Obtener el día del mes, mes y año actual y capitalizar la primera letra de los meses
    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleString('default', { month: 'long' });
    const año = fechaActual.getFullYear();

    this.diaMesAno = `${dia} de ${this.capitalizeFirstLetter(mes)} de ${año}`;
  }

  capitalizeFirstLetter(str: string): string {
    if (str && str.length > 0) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return '';
    }
  }

  openlogOutDialog(): void {
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
          if (dialogData.photoURL) {
            // Si hay una nueva imagen seleccionada
            const blob = this.dataURLtoBlob(dialogData.photoURL);
            if (blob) {
              const storageRef = ref(this.storage, `perfil-img/${this.authService.userData.displayName}`);
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
              const storageRef = ref(this.storage, `perfil-img/${this.authService.userData.displayName}`);
              deleteObject(storageRef).then(() => {
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
          // El valor de photoURL es null o undefined
          console.error('El valor de photoURL es null o undefined');
        }
      } else {
        // Se hizo clic en "Cancelar" o se cerró el diálogo sin realizar ninguna acción
      }
    });
  }






  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (
      this.profilePanel &&
      !this.profilePanel.nativeElement.contains(event.target as Node) &&
      !(event.target instanceof HTMLElement && event.target.classList.contains('profile'))
    ) {
      this.showProfilePanel = false;
    }
  }

}
