import {AbstractFavoriteConfig} from '../models/abstract-favorite-config.model';
import {Favorite} from '../models/favorite.model';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {Observable} from 'rxjs';
import { FavoriteUserDetails } from './favorite-user-details.interface';
import {SaveFavoriteResult} from './save-favorite-result.interface';

/**
 * FavoriteServiceInterface
 * Library Consumers need to implement this interface and provide the token: FAVORITE_SERVICE_TOKEN
 */
export interface FavoriteServiceInterface {

    saveFavorite$(favorite: Favorite, owner?: string): Observable<SaveFavoriteResult>;

    /**
     * Common reusable method to quick save favorites
     */
    quickSaveFavorite$(favoriteConfig: AbstractFavoriteConfig, favoriteToSave: Favorite, owner: string): Observable<boolean>;

    /**
     * Delete favorite
     */
    deleteFavorite$(id: number|string, favType: string, favName: string, owner: string): Observable<void>;

    /**
     * Method to get a favorite from the server.  Also optionally allows the caller to force a refresh of the cache item.
     */
    getFavorite$(id: number|string, loadingMessage?: string, isGlobalFavorite?: boolean, forceRefresh?: boolean): Observable<AbstractConfig>;

    /**
     * Gets the favorite object by type and user (favorite's owner and mandate settings)
     */
    getFavoriteByTypeAndUser$(type: string, owner: string, loadingMessage?: string): Observable<Favorite>;

    /**
     * This method will load full favorite objects for a user and type.
     * e.g: Load all 'SCHEDULED_BATCH' for user '_ADMIN'
     */
    getAllFavorites$(owner: string | string[], type: string, loadingMessage?: string): Observable<AbstractConfig[]>;

    /**
     * This method will load slim favorite info for a user and type.
     * e.g: Load all 'WIDGETS_REPORT' for user 'abc'
     * NOTE:  The data element of the favorite will be null.
     */
    getSlimFavorites$(owner: string | string[], type: string, loadingMessage?: string): Observable<Favorite[]>;

     /**
     * Method to get a favorite versions from the server.
     */
     getFavoriteVersion$(id: number|string, loadingMessage?: string, isGlobalFavorite?: boolean, forceRefresh?: boolean): Observable<AbstractConfig>;
    /**
     * Gets the enterprise permission group
     */
    getEnterprisePermGroups$(owner: string): Observable<string[]>;

    /**
    * Gets the top users of the selected workspace
    * minDate : YYYY-MM-DD
    * maxDate : YYYY-MM-DD
    */
   getFavoriteUsers$(id: number|string, minDate: string, maxDate: string, topUserCount: number, favType: string, loadingMessage?: string): Observable<FavoriteUserDetails[]>;
}
