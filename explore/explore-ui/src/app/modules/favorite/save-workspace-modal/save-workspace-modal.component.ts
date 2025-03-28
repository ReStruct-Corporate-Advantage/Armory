import {Component, OnInit} from '@angular/core';
import {AuxDynamicPositionEnum} from '@blk/aladdin-angular-components';

import {WorkspaceStore} from '@stores/workspace.store';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {
    FolderFavoriteTreeService
} from '../nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import { CommonUtils } from '@blk/explore-ui-core';
import { BulkSavingModalDirective } from '../bulk-saving-modal.directive';
/**
 * Modal for saving workspace and all nested changes
 */
@Component({
    selector: 'app-save-workspace-modal',
    templateUrl: './save-workspace-modal.component.html',
    styleUrls: ['./save-workspace-modal.component.scss'],
    providers: [FolderFavoriteTreeService]
})
export class SaveWorkspaceModalComponent extends BulkSavingModalDirective<WorkspaceFavoriteChange> implements OnInit {
    readonly AuxDynamicPositionEnum = AuxDynamicPositionEnum;

    // index of the selected workpad
    selectedWorkpadIndex = 0;
    selectedWorkpadChange: WorkpadFavoriteChange;
    favType: string;

    ngOnInit(): void {
        this.changedFavoritesTree = this.favoriteChangeDetectionService.getWorkspaceChangedFavoritesTree(WorkspaceStore.getWorkspace(), this.flattenedFavoriteChanges);
        this.selectedWorkpadChange = this.changedFavoritesTree.nestedChanges[0];
        this.favType = CommonUtils.getInSentenceCase(this.changedFavoritesTree.favoriteType);
        this.getAllSlimFavorites();
        super.ngOnInit();
    }

    /**
     * Toggles the saving of nested changes
     */
    onSaveNestedChangesToggled(): void {
        this.changedFavoritesTree.isSaveNested = !this.changedFavoritesTree.isSaveNested;
    }

    /**
     * Gets name of workpad.  Either portfolio name or report group name.
     */
    getWorkpadName(workpad: BaseWorkpad): string {
        if (workpad instanceof FlatWorkpad) {
            return workpad.portfolio.getDisplayTitle();
        } else if (workpad instanceof ReportGroup) {
            return workpad.title;
        }
        return '';
    }

    /**
     * Updates the selected workpad index
     * @param selectedIndex new selected index
     */
    onWorkpadChanged(selectedIndex: number): void {
        this.selectedWorkpadIndex = selectedIndex;
        this.selectedWorkpadChange = this.changedFavoritesTree.nestedChanges[this.selectedWorkpadIndex];
    }

    validateSelectionAndSave(): void {
        if (!this.changedFavoritesTree.isSaveNested) {
            // if not saving nested changes, unselect all nested before checking for conflicts/duplicate titles
            this.changedFavoritesTree.nestedChanges.forEach(workpadChange => workpadChange.updateSelected(false));
        }
        super.validateSelectionAndSave();
    }

}
