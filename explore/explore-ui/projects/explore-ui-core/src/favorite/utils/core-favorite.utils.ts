import {CoreFavoriteConstants} from '../constants';
import {FavoriteCacheKey} from '../models/favorite-cache-key.model';
import {FavoriteOwnerEnum, FavoriteType, SerializeFavoriteType} from '../enums';
import {isNumber} from 'lodash';
import {CoreUserMetaDataStore} from '../../user-meta-data/core-user-meta-data.store';
import {TokenConstants} from '../../definition/token/token.constants';
import {TokenUtils} from '../../definition/token/token.utils';
import {AbstractFavoriteConfig} from '../models/abstract-favorite-config.model';

export class CoreFavoriteUtils {
    /**
     * Combines favorite owner and global indicator together for cache lookup.
     */
    static getFavoriteKey(isGlobal: boolean, id: number | string, versionId?: string): FavoriteCacheKey {
        return new FavoriteCacheKey(id, isGlobal, versionId);
    }

    /**
     * Returns a flag that determines whether the favorites owner is global.
     */
    static isGlobalFavorite(owner: string): boolean {
        return owner === CoreFavoriteConstants.GLOBAL_USER;
    }

    /**
     * Returns if we are trying to serialize an object when detecting favorite changes
     */
    static isFavoriteChangeDetection(isNested?: boolean | SerializeFavoriteType) {
        return isNumber(isNested) && (isNested === SerializeFavoriteType.FAVORITE_CHANGE_DETECTION || isNested === SerializeFavoriteType.FAVORITE_CHANGE_DETECTION_LINK);
    }

    /**
     * Converts the favorite owner string into FavoriteOwnerEnum
     */
    static getFavoriteOwnerType(owner: string): FavoriteOwnerEnum {
        const currentUser = CoreUserMetaDataStore.userMetaData.login;

        if (!owner) {
            return FavoriteOwnerEnum.NONE;
        }

        switch (owner) {
            case currentUser:
                return FavoriteOwnerEnum.SELF;
            case CoreFavoriteConstants.ADMIN:
                return FavoriteOwnerEnum.ADMIN;
            case CoreFavoriteConstants.GLOBAL_USER:
                return FavoriteOwnerEnum.GLOBAL;
            default:
                return FavoriteOwnerEnum.TEAM;
        }
    }

    /**
     * Returns true if the favorite owner is the current user or favorite not previously saved
     * @param favoriteOwner  Owner of the favorite
     */
    static isOwnerCurrentUser(favoriteOwner: string): boolean {
        const ownerType = CoreFavoriteUtils.getFavoriteOwnerType(favoriteOwner);
        return ownerType === FavoriteOwnerEnum.SELF || ownerType === FavoriteOwnerEnum.NONE;
    }

    /**
     * Returns true if the current user has perms to update an admin favorite
     * @param favoriteOwner  Owner of the favorite
     * @param favoritePermissions  Permissions of the favorite owner
     */
    static isAdminFavoriteAndSavableByUser(favoriteOwner: string, favoritePermissions: string[]): boolean {
        const isAdminFavorite = CoreFavoriteUtils.getFavoriteOwnerType(favoriteOwner) === FavoriteOwnerEnum.ADMIN;
        const isCurrentUserAdminPermed = CoreUserMetaDataStore.userMetaData.canUserSaveEnterpriseFavorites();
        const isCurrentUserPermissioned = !favoritePermissions?.length || CoreFavoriteUtils.isUserPermissionGroupIncluded(favoritePermissions);
        return isAdminFavorite && isCurrentUserAdminPermed && isCurrentUserPermissioned;
    }

    /**
     * Check to ensure that at least one of the user's permission groups is included in the selected permission groups
     */
    static isUserPermissionGroupIncluded(selectedPermissionGroups: string[]): boolean {
        const userPermissionGroups = CoreUserMetaDataStore.userMetaData.userPermissionGroups || [];
        return !!selectedPermissionGroups?.length && selectedPermissionGroups?.some(permissionGroup => userPermissionGroups.includes(permissionGroup));
    }

    /**
     * Returns true if the favorite is an ADMIN or GLOBAL favorite
     * @param favoriteOwner  Owner of the favorite
     */
    static isAdminOrGlobalFavorite(favoriteOwner: string): boolean {
        return favoriteOwner === CoreFavoriteConstants.ADMIN || favoriteOwner === CoreFavoriteConstants.GLOBAL_USER;
    }

    /**
     * Returns the display name for the favorite owner
     * @param favoriteOwner  Owner of the favorite
     */
    static getFavoriteOwnerDisplayName(owner: string, userPermGrps?: string[]): string {
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS) &&
        owner === CoreFavoriteConstants.ADMIN && userPermGrps?.length > 0) {
            const allPermissionGroups: { text: string, value: string }[] = CoreUserMetaDataStore.userMetaData.allEnterprisePermissionGroups || [];
            const displayUserPermGrps = [];
            allPermissionGroups.forEach(permissionGroup => {
                if (userPermGrps.includes(permissionGroup.value)) {
                    displayUserPermGrps.push(permissionGroup.text);
                }
            });
            return displayUserPermGrps.join(', ');
        } else {
            if (owner === CoreFavoriteConstants.ADMIN) {
                return 'Enterprise';
            } else if (owner === CoreFavoriteConstants.GLOBAL_USER) {
                return 'Aladdin';
            }
        }
        return owner;
    }

    /**
     * Ensures numerical Ids are properly cast to type number
     */
    static castFavoriteId(favoriteId: number | string): number | string {
        return isNaN(+favoriteId) ? favoriteId : +favoriteId;
    }

    /**
     * Returns true if the favorite can be saved to ADL
     */
    static isADLFavorite(type: string, owner: string): boolean {
        return TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS) &&
            owner === CoreFavoriteConstants.ADMIN &&
            !this.isSybaseOnlyFavorite(type);
    }

    public static isSybaseOnlyFavorite(type: string): boolean {
        const sybaseOnlyFavTypes: string[] = [
            FavoriteType.MANDATE_MAP,
            FavoriteType.BATCH_REPORT,
            FavoriteType.SCHEDULED_BATCH,
            FavoriteType.WHATIF_RULES,
            FavoriteType.WHATIF_POS,
            FavoriteType.ADHOC_PORT,
            FavoriteType.ADHOC_PG,
            FavoriteType.adhocPortfolio,
            FavoriteType.OPTO_SETTINGS
        ];
        return sybaseOnlyFavTypes.includes(type);
    }

    public static showFavStatusTagMenu(favorite: AbstractFavoriteConfig) {
        return CoreFavoriteUtils.isStatusTagFeatureAllowed(favorite) && CoreUserMetaDataStore.userMetaData.canUserSaveEnterpriseFavorites() ;
    }

    public static isStatusTagFeatureAllowed(favorite: AbstractFavoriteConfig) {
        return favorite?.isADLFavorite() && favorite.owner === CoreFavoriteConstants.ADMIN && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_STATUS_TAGS);
    }

    public static showFavStatusTag(favorite: AbstractFavoriteConfig) {
        return  (favorite.statusTag === CoreFavoriteConstants.FAVORITE_STATUS.DECOMMISSIONED || favorite.statusTag === CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW)
            && CoreFavoriteUtils.isStatusTagFeatureAllowed(favorite);
    }
}
