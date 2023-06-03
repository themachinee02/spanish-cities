import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Subscription, interval } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent {

  private verificationInterval: Subscription | undefined;
  public enviada: boolean | undefined;

  fromRegister: boolean | undefined;

  constructor(public authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.fromRegister = params['fromRegister'] === 'true';
    });
    this.startVerificationInterval();
  }

  ngOnDestroy() {
    this.stopVerificationInterval();
  }

  startVerificationInterval() {
    this.verificationInterval = interval(5000).subscribe(() => {
      const emailVerified = this.authService.checkEmailVerification();
      if (emailVerified) {
        this.router.navigate(['/login']);
      }
    });
  }

  stopVerificationInterval() {
    if (this.verificationInterval) {
      this.verificationInterval.unsubscribe();
    }
  }

  resendVerification() {
    this.authService.SendVerificationMail();
    this.enviada = true;

    setTimeout(() => {
      this.enviada = false;
    }, 5000);
  }
}
