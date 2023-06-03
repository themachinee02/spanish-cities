import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public authService: AuthService,
    private route: Router) { }

  ngOnInit(): void { }

  navigate() {
    this.route.navigate(['/create-city']);

  }
}
