import {Component, OnInit} from '@angular/core';
import {CoreFavoriteConstants, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {FavoriteStore} from '@stores/favorite.store';
import {
    FolderFavoriteTreeService
} from '../nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteUtils} from '@utils/favorite.utils';
import {BulkSavingModalDirective} from '../bulk-saving-modal.directive';
/**
 * Modal for saving report and all nested changes
 */
@Component({
    selector: 'app-save-report-modal',
    templateUrl: './save-report-modal.component.html',
    styleUrls: ['./save-report-modal.component.scss'],
    providers: [FolderFavoriteTreeService]
})
export class SaveReportModalComponent extends BulkSavingModalDirective<FavoriteChange> implements OnInit {

    readonly CoreFavoriteConstants = CoreFavoriteConstants;

    ngOnInit(): void {

        // get all favorite changes
        this.changedFavoritesTree = this.favoriteChangeDetectionService.getReportChangedFavoritesTree(WorkspaceStore.getCurrentReport(), this.flattenedFavoriteChanges, true);
        if (TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_TEMPLATE_PERMISSIONING)) {
            // Since we don't have description value in the favorite config model, we need to get it from the slimFavCache.
            const globalLayouts = FavoriteStore.slimFavCache.get(FavoriteUtils.getCacheKey(CoreFavoriteConstants.GLOBAL_USER, FavoriteConstants.LAYOUT));
            this.changedFavoritesTree.favoriteDescription = globalLayouts.find(favorite => favorite.id === this.changedFavoritesTree.value.id)?.description;
        }
        this.getAllSlimFavorites();
        super.ngOnInit();
    }
}
