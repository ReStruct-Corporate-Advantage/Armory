import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreFavoriteConstants, CoreFavoriteUtils} from '@blk/explore-ui-core';
import {AuxValuePairLabelPositionEnum} from '@blk/aladdin-angular-components';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';

/**
 * Displays the root favorite that all nested changes fall under, either report or workspace
 */
@Component({
    selector: 'app-root-favorite-item',
    templateUrl: './root-favorite-item.component.html',
    styleUrls: ['./root-favorite-item.component.scss']
})
export class RootFavoriteItemComponent implements OnChanges {
    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;

    // Root favorite change
    @Input() favoriteChange: SavableFavoriteChange;
    // flag indicating if this root item is the root of the modal (Report in Save Report Modal/Workspace in Save Workspace Modal)
    // also allows favorite to be selectable for saving (Report inside of Save Workspace)
    @Input() isModalRootItem = true;

    // flag indicating if favorite is an admin favorite and user can overwrite it
    isAdminOrGlobalFavorite: boolean;
    // flag indicating if favorite owned by the current user (or ADMIN favorite and current user is trying to edit w/ perms)
    isOtherOwnerFavorite: boolean;
    // Owner's display name
    ownerDisplayName: string;
    // Owner's display text
    ownerDisplayText: string;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.favoriteChange) {
            this.ownerDisplayText = CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.favoriteChange.value.owner);
            this.ownerDisplayName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.favoriteChange.value.owner, this.favoriteChange.userPermGrps);
            this.isAdminOrGlobalFavorite = CoreFavoriteUtils.isAdminOrGlobalFavorite(this.favoriteChange.value.owner);
            this.isOtherOwnerFavorite = !this.isAdminOrGlobalFavorite && !CoreFavoriteUtils.isOwnerCurrentUser(this.favoriteChange.value.owner);
        }
    }

    toggleSaveRootSelected(): void {
        this.favoriteChange.isSelected = !this.favoriteChange.isSelected;
    }

}
