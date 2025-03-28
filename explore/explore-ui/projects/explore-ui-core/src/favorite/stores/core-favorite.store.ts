import {Favorite} from '../models/favorite.model';
import {BehaviorSubject} from 'rxjs';
import {FavoriteStatusUpdate} from '../interfaces/favorite-status-update.interface';

export class CoreFavoriteStore {
    static favoriteCache: Map<string, Favorite> = new Map<string, Favorite>();

    static favSavedNotifier$ = new BehaviorSubject<number|string>(null);

    static  favStatusUpdateAction$ = new BehaviorSubject<FavoriteStatusUpdate>(null);
}
