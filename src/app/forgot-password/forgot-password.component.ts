import { Component, OnInit } from '@angular/core';
import { AuthService } from "../shared/services/auth.service";
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent implements OnInit {

  noEmail: boolean = false;

  fromLogin: boolean | undefined;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.fromLogin = params['fromLogin'] === 'true';
    });
    this.authService.showMessageError = false;
    this.authService.showMessageOK = false;
    this.noEmail = false;
    this.resizeApp();
  }


  resetPassword() {
    const passwordResetEmail = (<HTMLInputElement>document.getElementById('passwordResetEmail')).value;
    this.authService.showMessageError = false;
    this.authService.showMessageOK = false;
    this.noEmail = false;
    if (passwordResetEmail && passwordResetEmail != null) {
      this.authService.ForgotPassword(passwordResetEmail);
    } else {
      this.noEmail = true;
    }
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

}
