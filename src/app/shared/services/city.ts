export class City {
  uid?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  description?: string;
  favouriteUserIds?: string[];
  id?: string;
  isFavorite?: boolean; // Nueva propiedad para controlar si la ciudad es favorita
}
