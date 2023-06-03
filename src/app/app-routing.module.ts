import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { CreateCityComponent } from './create-city/create-city.component';
// route guard
import { AuthGuard } from './shared/guard/auth.guard';
import { CityListComponent } from './city-list/city-list.component';
import { CityMapComponent } from './city-map/city-map.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';



const routes: Routes = [
  { path: "", redirectTo: '/login', pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent, pathMatch: "full" },
  { path: "forgot-password", component: ForgotPasswordComponent, pathMatch: "full" },
  //{ path: "home", component: HomeComponent, canActivate: [AuthGuard] },
  { path: "verify-email", component: VerifyEmailComponent },
  { path: "create", component: CreateCityComponent, canActivate: [AuthGuard] },
  { path: "list", component: CityListComponent, canActivate: [AuthGuard] },
  { path: "map/:id", component: CityMapComponent, canActivate: [AuthGuard] }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
