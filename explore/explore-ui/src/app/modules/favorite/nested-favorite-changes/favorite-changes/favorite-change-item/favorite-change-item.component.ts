import {Component, Input, OnInit} from '@angular/core';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {AuxValuePairLabelPositionEnum} from '@blk/aladdin-angular-components';
import {CoreFavoriteConstants, CoreFavoriteUtils} from '@blk/explore-ui-core';

/**
 * One favorite change line item, shows any modified children favorites as nested
 */
@Component({
    selector: 'app-favorite-change-item',
    templateUrl: './favorite-change-item.component.html',
    styleUrls: ['./favorite-change-item.component.scss']
})
export class FavoriteChangeItemComponent implements OnInit {

    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;

    // current favorite change
    @Input() favoriteChange: FavoriteChange;
    // the level this item is nested at
    @Input() level = 0;

    // flag indicating if favorite owned by the current user (ADMIN/GLOBAL considered different user)
    isOwnerCurrentUser: boolean;
    // Owner's display name
    ownerDisplayName: string;

    ngOnInit(): void {
        this.isOwnerCurrentUser = CoreFavoriteUtils.isOwnerCurrentUser(this.favoriteChange.value.owner);
        this.ownerDisplayName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.favoriteChange.value.owner);
    }

    /**
     * Called when the save selected checkbox is changed
     */
    updateSelectedState(): void {
        this.favoriteChange.isSelected = !this.favoriteChange.isSelected;
    }

}
