import {FavoriteConstants} from '@constants/favorite.constants';
import {
    AbstractConfig,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    Favorite
} from '@blk/explore-ui-core';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';

export class FavoriteUtils {
    /**
     * Get Cache key
     * eg> seakim,WORKSPACE_FOLDER
     */
    static getCacheKey(owner: string, type: string): string {
        return owner + ',' + type;
    }

    static getTypeFromCacheKey(cacheKey: string): string {
        return cacheKey.split(',')[1];
    }

    static getOwnerFromCacheKey(cacheKey: string): string {
        return cacheKey.split(',')[0];
    }

    /**
     * To decode URI in aladdin favorites
     */
    static decodeFavorite(favorite: AbstractConfig): AbstractConfig {
        for (const key in favorite) {
            if (typeof favorite[key] === 'string') {
                try {
                    favorite[key] = decodeURI(favorite[key]);
                } catch (error) {
                    console.warn(`Failed to decode URI for key "${key}": ${error.message}`);
                    // Optionally handle the error, e.g., keep the original value
                }
            }
        }
        return favorite;
    }

    /**
     * We have different naming for favorite types between the frontend and the backend.
     */
    static transformInFrontendName(favoriteType: string): string {
        switch (favoriteType) {
            case FavoriteConstants.LAYOUT:
                return FavoriteConstants.REPORT;
            case FavoriteConstants.REPORT:
                return FavoriteConstants.COLUMN_SET;
            default:
                return favoriteType;
        }
    }

    /**
     * parse the curatedReport string for id and owner field
     */
    static splitFlagIdForFavorite(flagIdStr: string): {owner: string, id: number | string} {
        const flagId = flagIdStr.split(';');
        let owner, id;
        if (flagId.length > 1) {
            owner = (flagId[0] === 'true') ? CoreFavoriteConstants.GLOBAL_USER : FavoriteConstants.ADMIN_USER;
            id = CoreFavoriteUtils.castFavoriteId(flagId[1]);
        } else {
            owner = FavoriteConstants.ADMIN_USER;
            id = CoreFavoriteUtils.castFavoriteId(flagId[0]);
        }

        return {owner, id};
    }

    /**
     * Is Aladdin template
     *  check if it is non-save mode && global layout
     */
    static isAladdinTemplate(isSaveMode: boolean, isGlobal: boolean, favType: string): boolean {
        return !isSaveMode && isGlobal && favType === FavoriteConstants.LAYOUT;
    }

    /**
     * Prepend 'Prism: ' on the header if the tool includes 'Prism'
     */
    static updateHeaderBasedOnToolName(data: FavoriteFolderItem | Favorite): string {
        return (data.tool?.includes('Prism')) ? `Prism: ${data.title}` : data.title;
    }

    /**
     * Returns true if a user is permissioned to save as _GLOBAL and they are in the correct environment
     */
    static isUserAllowedToSaveGlobal(favType: string): boolean {
        // allow in localhost for debugging and ACE. Using 'ace.' so no chance of other clients matching
        return CoreUserMetaDataStore.userMetaData.globalFavPerms &&
            FavoriteConstants.GLOBAL_ACCOUNT_FAVORITES.includes(favType) &&
            ['localhost', 'ace.'].some(env => location.hostname.toLowerCase().startsWith(env));
    }
}
