import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  existsError: boolean = false;
  userNotExists: boolean = false;
  fromLogin: boolean = false;

  registerForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    }
  );

  constructor(public authService: AuthService, private fb: FormBuilder, private router: Router) { }
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
    this.existsError = false;
    this.userNotExists = false;
    if (!this.registerForm.valid) {
      this.existsError = true;
      return;
    }
    this.authService.SignIn(this.registerForm.value);
    setTimeout(() => {
      if (this.authService.errorCredentials) {
        this.existsError = true;
      } else if (this.authService.userNotExists) {
        this.userNotExists = true;
      }
      else {
        this.userNotExists = false;
        this.existsError = false;
      }
    }, 500);
  }

  resetPassword() {
    this.router.navigate(['/forgot-password'], { queryParams: { fromLogin: false } });
  }
  googleLogin() {
    this.authService.GoogleAuth(this.registerForm.value);
  }

}
