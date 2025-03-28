import {FavoriteStatus} from '../constants';
import {AbstractFavoriteConfig} from '../models/abstract-favorite-config.model';

export interface FavoriteStatusUpdate {
  favorite: AbstractFavoriteConfig;
  favoriteType: string;
  statusUpdateCallback?: (status: FavoriteStatus) => void;
}
