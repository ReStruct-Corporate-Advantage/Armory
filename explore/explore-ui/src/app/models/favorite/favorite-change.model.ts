import {AbstractFavoriteConfig, CoreFavoriteUtils, FavoriteDisplayEnum, FavoriteType} from '@blk/explore-ui-core';
import {BaseFavoriteChange, FavoriteConflict} from '@models/favorite/base-favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {SavableChange} from '@interfaces/savable-change.interface';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';

/**
 * Represents one favorite change, consisting of the modified favorite and any child favorites that have changed
 */
export class FavoriteChange extends BaseFavoriteChange<AbstractFavoriteConfig, FavoriteChange> implements SavableChange {
    // is favorite changed selected to be saved
    isSelected = true;
    // In the bulk saving process, if any failed requests need to be resubmitted, we don't want to resubmit the success ones.
    isSaved: boolean;
    // favorite title to save
    saveTitle: string;
    // method of saving
    saveMode: SaveMode;
    // Saving user can be "personal/admin/global" and can change from one to another with "SaveAs" option.
    savingUser: string;
    // new favorite id of the favorite - this is needed for duplicate title handling for SaveAs where the old and new favorite ids are different
    newFavoriteId: number;
    // The sequence of execution for the savingOrders is asynchronous, beginning with savingOrder 0, then 1, then 2, and so forth.
    savingOrder: number;
    // original favoriteFolderItem of the config (for folder saving / saveAs)
    // In case of saveAs, original favorite should hold the original title and favoriteId, while the new favorite should hold the title and new favoriteId.
    originalFavoriteFolderItem: FavoriteFolderItem;
    // type of the favorite, used for displaying the type of favorite that has been modified
    favoriteDisplayType: FavoriteDisplayEnum;
    // Same favoriteDisplayType can be different favoriteType based on the widgetType and WidgetInput type and name.
    // eg> REPORT, RISK_REPORT, RETURN_REPORT, MULTI_REPORT, BREAKDOWN, FAC_BKD, etc.
    favoriteType: FavoriteType;
    // favoriteDescription holds value for global layout template permissioning.
    favoriteDescription: string;
    // over view of summary of Favorite changes
    changeSummaryDetails?: string;
    // Detailed summary of version changes that are updated with in the Favorite
    changeSummary?: string;
    userPermGrps: string[];
    // flag representing if missing user perm text should be shown as an error state
    showMissingUserPermError: boolean;
    lastUpdatedBy: string;
    dateLastUpdated: string;

    constructor(favorite: AbstractFavoriteConfig, favoriteDisplayType: FavoriteDisplayEnum, favoriteType: FavoriteType, isModalRootFavorite = false) {
        super(favorite);
        this.favoriteDisplayType = favoriteDisplayType;
        this.favoriteType = favoriteType;
        BaseFavoriteChange.initializeSavableFavorite(favorite, this, isModalRootFavorite);
    }

    /**
     * Returns true if favoriteChange and all nested changes are owned by current user
     */
    allFavesOwnedByCurrentUser(): boolean {
        return CoreFavoriteUtils.isOwnerCurrentUser(this.value.owner) && this.nestedChanges.every(favChange => favChange.allFavesOwnedByCurrentUser());
    }

    /**
     * Updates selection of this favorite change and all children
     */
    updateSelected(isSelected: boolean): void {
        this.isSelected = isSelected;
        this.nestedChanges.forEach(change => change.updateSelected(isSelected));
    }

    /**
     * Counts number of changes at current level and below
     */
    getChangesCount(): number {
        // if a change has not been previously saved, do not include in the count (showing unsaved report in Save Workspace modal)
        let count = this.value.id ? 1 : 0;
        this.nestedChanges.forEach(nestedChange => {
            count += nestedChange.getChangesCount();
        });
        return count;
    }

    /**
     * Determine if any favorites have been modified multiple places and user is performing "Save" on same favorite,
     * indicating there will be a conflict
     * @param ids Favorite IDs of all favorites being saved
     * @param conflicts List of favorites that are trying to be saved in multiple different places
     */
    checkSavingConflicts(ids: Set<number|string>, conflicts: FavoriteConflict[]): void {
        // saving conflict can only exist if the favorite is selected to be saved, has previously been saved, and is being saved as Save
        if (this.isSelected && this.value.id && this.saveMode === SaveMode.SAVE) {
            const isConflict = ids.has(this.value.id);
            if (isConflict && !conflicts.find(conflict => conflict.id === this.value.id)) {
                // add favorite info if there is a conflict and it has not been previously included in list of conflicts
                conflicts.push({
                    id: this.value.id,
                    title: this.value.title,
                    displayType: this.favoriteDisplayType
                });
            } else if (!isConflict) {
                ids.add(this.value.id);
            }
        }
        this.nestedChanges.forEach(change => change.checkSavingConflicts(ids, conflicts));
    }

    /**
     * Unselect the favorite if it matches the ID and is being SaveMode.SAVE
     * @param favoriteIds Favorite id sto unselect
     */
    unselectById(favoriteIds: Set<number|string>): void {
        if (favoriteIds.has(this.value.id) && this.saveMode === SaveMode.SAVE) {
            this.isSelected = false;
        }
        this.nestedChanges.forEach(change => change.unselectById(favoriteIds));
    }

    isEnterprisePermGroupReqMet(): boolean {
        return BaseFavoriteChange.checkEnterprisePermRequirementOnChange(this) &&
            this.nestedChanges.every(change => change.isEnterprisePermGroupReqMet());
    }
}
