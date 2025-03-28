import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {Favorite} from '@blk/explore-ui-core';

export class FavoriteStore {

    /*
        TODO - we should think about adding in a cache of the AbstractFavoriteConfig that is created so that we would only create the object once.
        This would then allow us to only have 1 instance of a breakdown, or other fav, created and used in all places.
        Then if a fav was updated it would reflect in all places at once
    */

    static folderFavCache: Map<string, FavoriteFolderItem> = new Map<string, FavoriteFolderItem>();
    static slimFavCache: Map<string, Favorite[]> = new Map<string, Favorite[]>();
    static userFavCache: Map<string, Favorite> = new Map<string, Favorite>();

    /**
     * Get favorite from slimFavCache by either ID/name
     * return favorite if duplicated ID/title;
     */
    static getFavoriteFromCache(login: string, favType: string, favTitle?: string, favId?: number|string): Favorite {
        const cacheKey = FavoriteUtils.getCacheKey(login, favType);
        const slimFavoriteList = FavoriteStore.slimFavCache.get(cacheKey);
        if (!slimFavoriteList || (!favTitle && !favId)) {
            return undefined;
        }
        return favTitle ? slimFavoriteList.find(fav => fav.title === favTitle) : slimFavoriteList.find(fav => fav.id === favId);
    }

    /**
     * Update slimFavCache
     */
    static updateSlimFavCache(newFav: Favorite, originalFavId: number, saveFav = false): void {
        const cacheKey = FavoriteUtils.getCacheKey(newFav.owner, newFav.type);
        const slimFavoriteList = FavoriteStore.slimFavCache.get(cacheKey);

        if (!slimFavoriteList) {
            return;
        }

        if (originalFavId !== newFav.id && !saveFav) {
            // if adding new personal favorite, then add to slimFavoriteList
            slimFavoriteList.push(newFav);
        } else {
            // if title is updated then update the title in the slimFavoriteList
            for (const fav of slimFavoriteList) {
                if (originalFavId === fav.id) {
                    fav.title = newFav.title || fav.title;
                    fav.enterpriseDescription = newFav.enterpriseDescription;
                    if (saveFav) {
                        fav.id = newFav.id;
                    }
                    break;
                }
            }
        }

        FavoriteStore.slimFavCache.set(cacheKey, slimFavoriteList);
    }
}
