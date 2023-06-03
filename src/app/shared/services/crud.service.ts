import { Firestore, collectionData } from '@angular/fire/firestore';
import { City } from '../services/city';
import { Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc } from '@firebase/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private firestore: Firestore) { }

  async addCity(city: City) {
    const cityRef = doc(this.firestore, `cities/${city.uid}`);
    const docSnap = await getDoc(cityRef);

    if (!docSnap.exists()) {
      return setDoc(cityRef, city);
    } else {
      return;
    }
  }

  getCities(): Observable<City[]> {
    const placeRef = collection(this.firestore, 'cities');
    return collectionData(placeRef, { idField: 'id' }) as Observable<City[]>;
  }

  deleteCity(city: City) {
    const placeDocRef = doc(this.firestore, `cities/${city.uid}`);
    return deleteDoc(placeDocRef);
  }
}
