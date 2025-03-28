import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {BaseFavoriteChange, FavoriteConflict} from '@models/favorite/base-favorite-change.model';

/**
 * Holds favorite changes at the workpad level and lower
 */
export class WorkpadFavoriteChange extends BaseFavoriteChange<BaseWorkpad, FavoriteChange> {
    // reports within the workpad that have favorite changes (not included in BaseFavoriteChange.nestedChanges)
    modifiedReports: FavoriteChange[] = [];

    /**
     * Updates selection of this favorite change and all children
     */
    updateSelected(isSelected: boolean): void {
        this.nestedChanges.forEach(change => change.updateSelected(isSelected));
        this.modifiedReports.forEach(change => change.updateSelected(isSelected));
    }

    /**
     * Counts number of changes at current level and below
     */
    getChangesCount(): number {
        let count = 0;
        this.nestedChanges.forEach(nestedChange => {
            count += nestedChange.getChangesCount();
        });
        this.modifiedReports.forEach(modifiedReport => {
            count += modifiedReport.getChangesCount();
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
        // no conflicts in workpad, check nested favorites
        this.nestedChanges.forEach(change => change.checkSavingConflicts(ids, conflicts));
        this.modifiedReports.forEach(report => report.checkSavingConflicts(ids, conflicts));
    }

    /**
     * Unselect the favorite if it matches the ID and is being SaveMode.SAVE
     * @param favoriteIds Favorite ids to unselect
     */
    unselectById(favoriteIds: Set<number|string>): void {
        this.nestedChanges.forEach(change => change.unselectById(favoriteIds));
        this.modifiedReports.forEach(report => report.unselectById(favoriteIds));
    }

    /**
     * Checks if favorite meets the perm group requirement if it is being saved as enterprise
     */
    isEnterprisePermGroupReqMet(): boolean {
        return this.nestedChanges.every(change => change.isEnterprisePermGroupReqMet()) &&
            this.modifiedReports.every(change => change.isEnterprisePermGroupReqMet());
    }
}
