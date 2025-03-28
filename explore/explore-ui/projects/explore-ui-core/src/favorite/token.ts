import {InjectionToken} from '@angular/core';
import {FavoriteServiceInterface} from './interfaces/favorite.service.interface';

export const FAVORITE_SERVICE_TOKEN = new InjectionToken<FavoriteServiceInterface>('FAVORITE_SERVICE_TOKEN');
