import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { AuthService } from '../shared/services/auth.service';

export interface ConfirmDialogData {
  title: string;
  message: string;
  showModifyOption?: boolean;
  showDeleteOption?: boolean;
  photoURL?: string | null;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  file: any;
  selectedImage: any;
  loading: boolean = false;
  urlImage!: string;
  localPhotoURL: string | null = null; // Variable local para almacenar la URL de la imagen seleccionada

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    public storage: Storage,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }

  ngOnInit() {
    //console.log(this.data.photoURL);
    this.localPhotoURL = this.data.photoURL ?? null; // Asignar el valor inicial de photoURL a la variable local
  }

  closeDialog(result: boolean): void {
    this.dialogRef.close(result);
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    this.previewImage(this.file);
  }

  previewImage(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const url = e.target.result;
      this.data.photoURL = url;
    };

    if (file) {
      reader.readAsDataURL(file);
      setTimeout(() => {
        this.authService.loading = false;
      }, 1000);
    } else {
      this.data.photoURL = null;
      this.authService.loading = false;
    }

  }

  deleteImage(): void {
    this.data.photoURL = null;
    this.resetFileInput();
  }

  resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

}
