import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';


export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsDontMatch: true };
    } else {
      return null;
    }
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  existsErrorEmail: boolean = false;
  existsErrorName: boolean = false;
  existsErrorSurname: boolean = false;
  existsErrorPassword: boolean = false;
  existsErrorConfirmPassword: boolean = false;
  existEmail: boolean = false;

  loading: boolean = false;


  registerForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      surnames: ['', Validators.required],

    },
    { validators: passwordsMatchValidator() }
  );

  constructor(public authService: AuthService, private fb: FormBuilder) { }
  ngOnInit(): void {
    this.resizeApp();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.resizeApp(); // Llamada al método resizeApp cuando se redimensiona la ventana
  }


  resizeApp() {
    const windowH = window.innerHeight;
    const windowW = window.innerWidth;
    const rest = 73;

    const displayContent = document.getElementById("displayContent");
    if (displayContent) {
      displayContent.style.height = (windowH - rest) + "px";
    }
  }



  signUpViaEmail() {
    this.loading = true;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.authService.checkEmailExistence(this.registerForm.value.email)
        .then((exists) => {
          if (exists) {
            this.existEmail = true;
            this.existsErrorEmail = false;
            this.existsErrorConfirmPassword = false;
            this.existsErrorSurname = false;
            this.existsErrorName = false;
            this.existsErrorPassword = false;
            this.loading = false;
          } else {
            this.authService.SignUp(this.registerForm.value);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.existsErrorEmail = this.registerForm.controls['email'].invalid;
      this.existsErrorConfirmPassword = this.registerForm.controls['confirmPassword'].invalid;
      this.existsErrorSurname = this.registerForm.controls['surnames'].invalid;
      this.existsErrorName = this.registerForm.controls['name'].invalid;
      this.existsErrorPassword = this.registerForm.controls['password'].invalid;
      this.existEmail = false;
      this.loading = false;
    }
  }



  googleLogin() {
    this.authService.GoogleAuth(this.registerForm.value);
  }

}

