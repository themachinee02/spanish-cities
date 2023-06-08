import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { City } from '../services/city';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface User {
  favorites?: City[];
}

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  private favoriteCities$: BehaviorSubject<City[]> = new BehaviorSubject<City[]>([]);

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  addCity(city: City): Promise<void> {
    const cityRef = this.firestore.doc<City>(`cities/${city.uid}`);
    return cityRef.set(city);
  }

  getCities(): Observable<City[]> {
    const placeRef = this.firestore.collection<City>('cities');
    return placeRef.valueChanges({ idField: 'id' });
  }

  deleteCity(city: City): Promise<void> {
    const placeDocRef = this.firestore.doc<City>(`cities/${city.uid}`);
    return placeDocRef.delete();
  }

  addCityToFavorites(city: City): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const userId = this.authService.getUserId();
      const userRef = this.firestore.doc(`users/${userId}`);

      userRef
        .get()
        .toPromise()
        .then((doc) => {
          if (doc!.exists) {
            const userData = doc!.data() as User;
            const favorites = userData.favorites || [];

            const isCityAlreadyAdded = favorites.some((favoriteCity) => favoriteCity.name === city.name);

            if (!isCityAlreadyAdded) {

              favorites.push(city);
              userRef
                .set({ favorites }, { merge: true })
                .then(() => {
                  //console.log('City added to favorites successfully');
                  this.favoriteCities$.next(favorites); // Emitir el nuevo array de ciudades favoritas
                  resolve();
                })
                .catch((error) => {
                  console.error('Error adding city to favorites:', error);
                  reject(error);
                });
            } else {
              //console.log('City is already in favorites');
              resolve();
            }
          } else {
            //console.log('User document not found');
            reject(new Error('User document not found'));
          }
        })
        .catch((error) => {
          console.error('Error retrieving user data:', error);
          reject(error);
        });
    });
  }


  showUserFavorites(): BehaviorSubject<City[]> {
    const userId = this.authService.getUserId();
    const userRef = this.firestore.doc(`users/${userId}`);

    userRef
      .get()
      .toPromise()
      .then((doc) => {
        if (doc!.exists) {
          const userData = doc!.data() as User;
          const favorites = userData.favorites || [];
          this.favoriteCities$.next(favorites); // Emitir el array de ciudades favoritas
        } else {
          // El documento del usuario no existe, crearlo y guardar los favoritos
          const favorites: City[] = [];
          userRef
            .set({ favorites })
            .then(() => {
              //console.log('User document created and favorites saved.');
              this.favoriteCities$.next(favorites); // Emitir el array de ciudades favoritas
            })
            .catch((error) => {
              console.error('Error creating user document:', error);
              this.favoriteCities$.next([]); // Emitir un array vacío en caso de error
            });
        }
      })
      .catch((error) => {
        console.error('Error retrieving user favorites:', error);
        this.favoriteCities$.next([]); // Emitir un array vacío en caso de error
      });

    return this.favoriteCities$;
  }



  removeCityFromFavorites(city: City): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const userId = this.authService.getUserId();
      const userRef = this.firestore.doc(`users/${userId}`);

      userRef
        .get()
        .toPromise()
        .then((doc) => {
          if (doc!.exists) {
            const userData = doc!.data() as User;
            const favorites = userData.favorites || [];

            const updatedFavorites = favorites.filter((favoriteCity) => favoriteCity.name !== city.name);

            userRef
              .set({ favorites: updatedFavorites }, { merge: true })
              .then(() => {
                //console.log('City removed from favorites successfully');
                this.favoriteCities$.next(updatedFavorites); // Emitir el nuevo array de ciudades favoritas
                resolve();
              })
              .catch((error) => {
                console.error('Error removing city from favorites:', error);
                reject(error);
              });
          } else {
            //console.log('User document not found');
            reject(new Error('User document not found'));
          }
        })
        .catch((error) => {
          console.error('Error retrieving user data:', error);
          reject(error);
        });
    });
  }

  getFavoriteCities(): Observable<City[]> {
    const userId = this.authService.getUserId();
    const userRef = this.firestore.doc(`users/${userId}`);

    return userRef.valueChanges().pipe(
      map((userData: any) => (userData?.favorites || []) as City[]),
      catchError((error) => {
        console.error('Error retrieving user favorites:', error);
        return [];
      })
    );
  }
}
