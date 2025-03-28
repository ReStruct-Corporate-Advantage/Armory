import {Workspace} from '@models/workspace/workspace.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {BaseFavoriteChange, FavoriteConflict} from '@models/favorite/base-favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {FavoriteDisplayEnum, FavoriteType} from '@blk/explore-ui-core';
import {SavableChange} from '@interfaces/savable-change.interface';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';

/**
 * Holds favorite changes at the workspace level and lower
 */
export class WorkspaceFavoriteChange extends BaseFavoriteChange<Workspace, WorkpadFavoriteChange> implements SavableChange {
    // is workspace changed selected to be saved, will always be true since workspace must be saved in Save Workspace modal
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
    favoriteDisplayType = FavoriteDisplayEnum.WORKSPACE;
    // Same favoriteDisplayType can be different favoriteType based on the widgetType and WidgetInput type and name.
    // eg> REPORT, RISK_REPORT, RETURN_REPORT, MULTI_REPORT, BREAKDOWN, FAC_BKD, etc.
    favoriteType = FavoriteType.WORKSPACE;

    // true => save workspace + save selected nested changes underneath the Workspace, false => save only workspace
    isSaveNested = true;

    // flag indicating if this workspace favorite itself is modified
    isWorkspaceFavoriteContentModified: boolean;
     // over view of summary of version changes
    changeSummaryDetails?: string;
    //Detailed summary of version changes that are updated with in the workspace
    changeSummary?: string;
    userPermGrps: string[];
    // flag representing if missing user perm text should be shown as an error state
    showMissingUserPermError: boolean;
    lastUpdatedBy: string;
    dateLastUpdated: string;

    constructor(workspaceFavorite: Workspace) {
        super(workspaceFavorite);
        BaseFavoriteChange.initializeSavableFavorite(workspaceFavorite, this, true);
    }

    /**
     * Updates selection of this favorite change and all children
     */
    updateSelected(_isSelected: boolean): void {
        // NOT IMPLEMENTED
    }

    /**
     * Counts number of changes at current level and below
     */
    getChangesCount(): number {
        // if workspace is previously saved and modified, include in the count
        let count = this.value.id && this.isWorkspaceFavoriteContentModified ? 1 : 0;
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
        if (!this.isSaveNested) {
            // ignore any conflicts if not saving nested changes
            return;
        }
        // workspace favorite will never conflict, so only look at nested components
        this.nestedChanges.forEach(change => change.checkSavingConflicts(ids, conflicts));
    }

    /**
     * Unselect the favorite if it matches the ID and is being SaveMode.SAVE
     * @param favoriteIds Favorite ids to unselect
     */
    unselectById(favoriteIds: Set<number|string>): void {
        if (favoriteIds.has(this.value.id) && this.saveMode === SaveMode.SAVE) {
            this.isSelected = false;
        }
        this.nestedChanges.forEach(change => change.unselectById(favoriteIds));
    }

    /**
     * Checks if favorite meets the perm group requirement if it is being saved as enterprise
     */
    isEnterprisePermGroupReqMet(): boolean {
        return BaseFavoriteChange.checkEnterprisePermRequirementOnChange(this) &&
            this.nestedChanges.every(change => change.isEnterprisePermGroupReqMet());
    }
}
