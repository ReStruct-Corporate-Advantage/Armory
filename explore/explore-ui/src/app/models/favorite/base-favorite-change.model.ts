import {
    AbstractFavoriteConfig,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum
} from '@blk/explore-ui-core';
import {SavableChange} from '@interfaces/savable-change.interface';
import {SaveMode} from '@enums/save-mode.enum';
import * as momentTz from 'moment-timezone';

/**
 * Base class for favorite changes.
 */
export abstract class BaseFavoriteChange<T, U> {
    // the current favorite (or workspace)
    value: T;
    enterpriseDescription?: string;
    // children within value object that have favorite changes
    nestedChanges: U[] = [];

    constructor(value: T) {
        this.value = value;
    }

    /**
     * Initializes the SavableFavorite params
     */
    protected static initializeSavableFavorite(favorite: AbstractFavoriteConfig, favoriteChange: SavableChange, isModalRootFavorite: boolean) {
        const userPermGrps = [...(favorite.userPermGrps || [])];
        // start with user saving as themselves
        // exception: a user can save as admin if:
        //  1. it's an admin favorite and user has admin perms
        //  2. isModalRootFavorite === true (report in Save Report Modal or workspace in Save Workspace Modal)
        const isAdminFavoriteAndSavableByUser = isModalRootFavorite && CoreFavoriteUtils.isAdminFavoriteAndSavableByUser(favorite.owner, userPermGrps);
        favoriteChange.savingUser = isAdminFavoriteAndSavableByUser ? favorite.owner : CoreUserMetaDataStore.userMetaData.login;
        const isOwnerCurrentUser = CoreFavoriteUtils.isOwnerCurrentUser(favorite.owner);
        favoriteChange.saveTitle = (isOwnerCurrentUser || isAdminFavoriteAndSavableByUser) ? favorite.title : favorite.title + ' Copy';
        favoriteChange.saveMode = (isOwnerCurrentUser || isAdminFavoriteAndSavableByUser)  ? SaveMode.SAVE : SaveMode.SAVE_AS;
        favoriteChange.userPermGrps = userPermGrps;
        favoriteChange.enterpriseDescription = favorite.enterpriseDescription;
        favoriteChange.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
        favoriteChange.dateLastUpdated = momentTz.tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
    }

    /**
     * Checks if current favorite change meets enterprise perm requirement
     * @param favoriteChange  FavoriteChange to check
     */
    protected static checkEnterprisePermRequirementOnChange(favoriteChange: SavableChange): boolean {
        // requirements met if: not being saved OR not enterprise favorite OR favorite has necessary perm group
        const isRequirementMet = !favoriteChange.isSelected ||
            favoriteChange.savingUser !== CoreFavoriteConstants.ADMIN ||
            CoreFavoriteUtils.isUserPermissionGroupIncluded(favoriteChange.userPermGrps);
        favoriteChange.showMissingUserPermError = !isRequirementMet;
        return isRequirementMet;
    }

    /**
     * Updates selection of this favorite change and all children
     */
    abstract updateSelected(isSelected: boolean): void;

    /**
     * Counts number of changes at current level and below
     */
    abstract getChangesCount(): number;

    /**
     * Determine if any favorites have been modified multiple places and user is performing "Save" on same favorite,
     * indicating there will be a conflict
     * @param ids Favorite IDs of all favorites being saved
     * @param conflicts List of favorites that are trying to be saved in multiple different places
     */
    abstract checkSavingConflicts(ids: Set<number|string>, conflicts: FavoriteConflict[]): void;

    /**
     * Unselect the favorite if it matches the ID and is being SaveMode.SAVE
     * @param favoriteIds Favorite ids to unselect
     */
    abstract unselectById(favoriteIds: Set<number|string>): void;

    /**
     * Checks if favorite meets the perm group requirement if it is being saved as enterprise
     */
    abstract isEnterprisePermGroupReqMet(): boolean;
}

export interface FavoriteConflict {
    id: number|string; // favorite ID
    title: string; // favorite title
    displayType: FavoriteDisplayEnum;
}
