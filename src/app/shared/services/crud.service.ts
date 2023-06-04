import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { collection, doc, setDoc, DocumentData, DocumentSnapshot, deleteDoc } from 'firebase/firestore';
import { City } from '../services/city';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
import { Query } from '@angular/fire/compat/firestore';


@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private firestore: AngularFirestore) { }

  async addCity(city: City) {
    const cityRef = this.firestore.doc<City>(`cities/${city.uid}`);
    const docSnap = await cityRef.get().toPromise();

    if (!docSnap!.exists) {
      return cityRef.set(city);
    } else {
      return;
    }
  }

  getCities(): Observable<City[]> {
    const placeRef = this.firestore.collection<City>('cities');
    return placeRef.valueChanges({ idField: 'id' });
  }

  deleteCity(city: City) {
    const placeDocRef = this.firestore.doc<City>(`cities/${city.uid}`);
    return placeDocRef.delete();
  }
}
