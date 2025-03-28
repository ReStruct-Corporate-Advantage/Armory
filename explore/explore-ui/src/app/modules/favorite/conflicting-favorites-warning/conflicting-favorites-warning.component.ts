import {Component, Input} from '@angular/core';
import {CoreCommonConstants, CoreFavoriteConstants, ModalDirective} from '@blk/explore-ui-core';
import {FavoriteConflict} from '@models/favorite/base-favorite-change.model';

@Component({
  selector: 'app-conflicting-favorites-warning',
  templateUrl: './conflicting-favorites-warning.component.html',
  styleUrls: ['./conflicting-favorites-warning.component.scss']
})
export class ConflictingFavoritesWarningComponent extends ModalDirective<boolean> {

    readonly CoreCommonConstants = CoreCommonConstants;
    readonly FAVORITE_DISPLAY_NAMES = CoreFavoriteConstants.FAVORITE_DISPLAY_NAMES;

    @Input() header: string;
    @Input() message: string;
    @Input() continueSaving = true;
    // list of conflicting favorites, title + type
    @Input() conflictingFavorites: FavoriteConflict[];
}
