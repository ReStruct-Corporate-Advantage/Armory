import {Injectable} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteService} from '@services/favorite/favorite.service';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {CoreFavoriteUtils, CoreUserMetaDataStore} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteStore} from '@stores/favorite.store';
import {HttpParams} from '@angular/common/http';
import {Http2BmsService} from '@services/bms';

/**
 * Favorite Tree service to generate data for favorite tree
 */
@Injectable({
    providedIn: 'root'
})
export class FavoriteTreeService {
    constructor(private httpService: Http2BmsService, private favoriteService: FavoriteService) {
    }

    /**
     * Save favorite folder structure
     */
    saveFavoriteFolderStructure$(favoriteFolderItemToSave: FavoriteFolderItem, type: string, owner?: string): Observable<any> {
        let id = +favoriteFolderItemToSave.favoriteId;

        const fav: any = {
            id,
            type,
            owner: owner || CoreUserMetaDataStore.userMetaData.login,
            data: JSON.stringify(favoriteFolderItemToSave.serialize())
        };

        const dataToSave: any = {
            data: fav,
            isGlobalFav: CoreFavoriteUtils.isGlobalFavorite(owner)
        };

        // Call the webservice to save the data.
        return this.httpService.post$('saveFolderStructure', dataToSave, null)
            .pipe(
                map((payload: any) => {
                    id = (payload.data.data && payload.data.data.id ) ? payload.data.data.id : payload.data.id;
                    favoriteFolderItemToSave.favoriteId = id;
                    // Put the favorite id back into the cache.
                    const cacheKey = FavoriteUtils.getCacheKey(owner, type);
                    FavoriteStore.folderFavCache.set(cacheKey, favoriteFolderItemToSave);

                    return {
                        status: payload.status,
                        message: payload.message,
                        favoriteId: id,
                        owner,
                        type
                    };
                }),
                catchError((error: Error) => {
                    // Log that an error happened and then return a failed promise.
                    console.error('Failed to save favorite folder structure:  ', owner, type, error);
                    return throwError(error);
                })
            );
    }

    /**
     * Get favoriteTreeData after combining the required requests
     */
    getFullFavoriteTreeData$(favoriteTreeOwner: string, favType: string, favTreeType: string, isAladdinTemplate: boolean): Observable<any> {
        const favoriteData: Observable<any>[] = [this.getFavoriteFolderStructure$(favoriteTreeOwner, favTreeType, isAladdinTemplate)];

        // NOTE: For the case when it's a portfolio folder, we have more than one favorite type in picture
        // and in order to keep the favorites of what if types other than the one the modal (save/load) concerns with
        // we need to make call to fetch slim favorites for them all.
        const slimFavorites$ = favTreeType === FavoriteConstants.PORTFOLIO_FOLDER
            ? forkJoin(
                Array.from(CompositionConstants.WHAT_IF_FAVORITE_TYPES.keys())
                    .map(portFavType => this.favoriteService.getSlimFavorites$(
                        favoriteTreeOwner,
                        portFavType,
                        'Getting What-if Favorites',
                        CompositionConstants.TYPES_TO_FETCH_DATE_FIELD.indexOf(portFavType) !== -1 ? 'date' : null
                    ))
            )
            : this.favoriteService.getSlimFavorites$(favoriteTreeOwner, favType);

        favoriteData.push(slimFavorites$);

        // this returns [favoriteFolder, slimFavorites]
        return forkJoin(favoriteData);
    }

    /**
     * Gets the list folder structure for the user and type combo.
     * @param owner: refers to who created the favorites
     * @param type refers to the type of favorite
     */
    getFavoriteFolderStructure$(owner: string, type: string, isAladdinTemplate?: boolean): Observable<FavoriteFolderItem> {
        // if cacheKey, return it from cache
        const cacheKey = FavoriteUtils.getCacheKey(owner, type);
        if (FavoriteStore.folderFavCache.has(cacheKey)) {
            console.log('loaded ' + cacheKey + ' from cache');
            return of(this.processFolderFavorite(FavoriteStore.folderFavCache.get(cacheKey), isAladdinTemplate));
        }

        return this.httpService.get$('getFavoriteForTypeAndUser', this.createHttpParams(owner, type)).pipe(
            map((payload: any) => {
                if (!payload || !payload.data) {
                    throw throwError('Failed to get favorite folder structure');
                }

                let item: FavoriteFolderItem = null;
                if (payload.data.data) {
                    item = new FavoriteFolderItem(JSON.parse(decodeURI(payload.data.data)));

                    // If the root item is not a folder then wrap it in one.
                    // The reason we have added this is a user somehow has a favorite with a root items as a
                    // favorite and this causes an issue rendering the tree.
                    if (item.type !== FavoriteConstants.FOLDER) {
                        const favoriteFolder = new FavoriteFolderItem();
                        favoriteFolder.type = FavoriteConstants.FOLDER;
                        favoriteFolder.children.push(item);
                        item = favoriteFolder;
                    }

                    item.favoriteId = payload.data.id;
                    // Add the id to the cache for when/if we save it.
                    FavoriteStore.folderFavCache.set(cacheKey, item);
                }
                return this.processFolderFavorite(item, isAladdinTemplate);
            }),
            catchError(error => {
                console.error('Failed to get favorite folder structure:  ', owner, type, error);
                return throwError(error);
            }));
    }

    private createHttpParams(owner: string, type: string): HttpParams {
        return new HttpParams({
          fromObject: {
            owner,
            type,
            isGlobalFav: CoreFavoriteUtils.isGlobalFavorite(owner).toString()
          }
        });
      }

    /**
     * Gets the list folder structure for the user and type combo.
     * @param owner: refers to who created the favorites
     * @param type refers to the type of favorite
     */
    checkFavoriteInFolderStructure$(owner: string, type: string, favoriteId: number): Observable<boolean> {

       return this.httpService.get$('getFavoriteForTypeAndUser', this.createHttpParams(owner, type)).pipe(
            map((response: any) => {
                let item: FavoriteFolderItem = null;
                if (response.data.data) {
                    item = new FavoriteFolderItem(JSON.parse(decodeURI(response.data.data)));

                    return (this.checkFavoriteInTree(item, favoriteId));
                }
            }), catchError((error: Error) => {
                console.error('Failed to get favorite getFavoriteForTypeAndUser for folder check:  ', error);
                return throwError(error);
            })
        );
    }

    private checkFavoriteInTree(item: FavoriteFolderItem, favoriteId: number): boolean {
        if (item.favoriteId === favoriteId) {
          return true;
        }

        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            if (this.checkFavoriteInTree(child, favoriteId)) {
              return true;
            }
          }
        }

        return false;
      }

    /**
     * Process favorite folder item.
     */
    private processFolderFavorite(folderFavoriteData: FavoriteFolderItem, isAladdinTemplate: boolean): FavoriteFolderItem {
        // creates an empty tree structure if empty
        if (!folderFavoriteData) {
            folderFavoriteData = new FavoriteFolderItem({type: FavoriteConstants.FOLDER});
        } else if (isAladdinTemplate) {
            // This is to hide the very top folder (CURATED LAYOUTS) for load global layout (aladdin template).
            folderFavoriteData = folderFavoriteData.children[0];
        }
        return folderFavoriteData;
    }
}
