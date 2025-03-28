
import { Subject } from 'rxjs';
import { FavoriteVersioning } from '../interfaces/favorite-versioning.interface';

export class CoreFavoriteVersioningStore {

  static viewUsageTypeAction$: Subject<FavoriteVersioning> = new Subject<FavoriteVersioning>;
  static favoriteVersionLogAction$: Subject<FavoriteVersioning> = new Subject();

}
