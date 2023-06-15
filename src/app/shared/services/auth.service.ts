import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { City } from './city';
import { ConfirmDialogData } from 'src/app/confirm-dialog/confirm-dialog.component';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;
  public showMessageOK: boolean = false;
  public showMessageError: boolean = false;
  public emailVerified: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public errorCredentials: boolean = false;
  public userNotExists: boolean = false;
  loading: boolean = false;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        this.userData = JSON.parse(localStorage.getItem('user')!);
        this.updateUserDataWithPhotoURL();
      } else {
        localStorage.setItem('user', 'null');
        this.userData = JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  // Sign in with email/password
  SignIn(userData: User) {
    //this.loading = true;
    this.errorCredentials = false;
    this.userNotExists = false;
    return this.afAuth
      .signInWithEmailAndPassword(userData.email, userData.password)
      .then((result) => {
        this.afAuth.authState.subscribe((user) => {
          if (result.user?.emailVerified !== true) {
            this.router.navigate(['/verify-email'], { queryParams: { fromRegister: false } });
          } else {
            this.userData = user;
            this.ngZone.run(() => {
              this.router.navigate(['/list']);
            });
          }
        });
      })
      .catch((error) => {
        if (error.code === 'auth/wrong-password') {
          this.errorCredentials = true;
          this.userNotExists = false;
        } else if (error.code === 'auth/user-not-found') {
          this.errorCredentials = false;
          this.userNotExists = true;
        }
      });
  }



  // Sign up with email/password
  SignUp(userData: User) {
    return this.afAuth.createUserWithEmailAndPassword(userData.email, userData.password)
      .then(() => {

        this.SendVerificationMail();
        this.SetUserData(userData);
      }).catch((error) => {
      })
  }

  //Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        const user = JSON.parse(localStorage.getItem('user')!);
        user.emailVerified = false;
        localStorage.setItem('user', JSON.stringify(user));
        this.router.navigate(['/verify-email'], { queryParams: { fromRegister: true } });
      });
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    this.showMessageOK = false;
    this.showMessageError = false;
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        this.showMessageOK = true;
      })
      .catch((error) => {
        this.showMessageError = true;
      });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

  // Sign in with Google
  GoogleAuth(userData: User) {
    return this.AuthLogin(new GoogleAuthProvider(), userData);
  }

  AuthLogin(provider: any, userData: User) {
    return this.afAuth.signInWithPopup(provider)
      .then(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.router.navigate(['../../list']);
          });
        }, 500);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`user/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      password: user.password,
      name: user.name,
      surnames: user.surnames,
    };

    // Obtener el objeto User de AngularFireAuth
    const currentUser = this.afAuth.currentUser;
    if (currentUser) {
      currentUser
        .then((userAuth) => {
          // Actualizar el perfil del usuario en Firebase Authentication
          //console.log(userAuth);
          userAuth!.updateProfile({
            displayName: `${user.name} ${user.surnames}`
          })
            .then(() => {
              //console.log('Perfil de usuario actualizado correctamente en Firebase Authentication');
            })
            .catch((error) => {
              //console.error('Error al actualizar el perfil de usuario en Firebase Authentication:', error);
            });
        })
        .catch((error) => {
          //console.error('Error al obtener el objeto User de AngularFireAuth:', error);
        });
    } else {
      //console.error('No se ha encontrado el usuario actual en AngularFireAuth');
    }

    //console.log(userData);
    return userRef.set(userData, { merge: true });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['../../login']);
    });
  }

  private updateUserDataWithPhotoURL() {
    if (this.userData && this.userData.photoURL) {
      const image = new Image();
      image.onload = () => {
        // La imagen existe en Firebase Storage, no se necesita hacer nada
      };
      image.onerror = () => {
        // La imagen no existe en Firebase Storage, se actualiza el valor en el servicio y en el localStorage
        this.userData.photoURL = null;
        localStorage.setItem('user', JSON.stringify(this.userData));
      };
      image.src = this.userData.photoURL;
    }
  }

  public checkEmailVerification(): boolean {

    const currentUserPromise = this.afAuth.currentUser;
    if (currentUserPromise) {
      currentUserPromise.then((currentUser) => {
        currentUser!.reload().then(() => {
          currentUser!.getIdToken().then(() => {
            const user = currentUser!.toJSON();
            localStorage.setItem('user', JSON.stringify(user));
            //console.log(user);
          });
        });
      }).catch((error: any) => {
        console.error('Error al verificar el correo electrónico:');
      });
    }

    const user = JSON.parse(localStorage.getItem('user')!);
    return user && user.emailVerified;
  }

  getUserId(): string {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user.uid;
  }

  updatePhotoURL(photoURL: string | null): Promise<void> {
    const currentUser = this.afAuth.currentUser;
    if (currentUser) {
      return currentUser.then(user => {
        return user!.updateProfile({ photoURL }).then(() => {
          this.userData = user; // Actualizar el objeto this.userData con el usuario actualizado
          localStorage.setItem('user', JSON.stringify(this.userData));
          if (photoURL === null) {
            localStorage.removeItem('userPhoto');
          }
        });
      });
    }
    throw new Error('Usuario no encontrado');
  }

  public navigateToLogin() {
    this.router.navigate(['/login']);
  }

  checkEmailExistence(email: string): Promise<boolean> {
    return this.afAuth.fetchSignInMethodsForEmail(email)
      .then((signInMethods) => {
        return signInMethods.length > 0;
      })
      .catch((error) => {
        // Manejar errores aquí
        console.error('Error al verificar el correo electrónico:', error);
        return false;
      });
  }
}
