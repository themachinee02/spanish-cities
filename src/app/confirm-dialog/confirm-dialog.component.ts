import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

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

  tempImageDesktop = {
    image: null
  };
  file: any;
  selectedImage: any;
  loading: boolean = false;
  urlImage!: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    public storage: Storage,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }

  ngOnInit() {
    console.log(this.data.photoURL);
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
      this.data.photoURL = e.target.result;
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }


  deleteImage(): void {
    this.data.photoURL = null;
  }

}
