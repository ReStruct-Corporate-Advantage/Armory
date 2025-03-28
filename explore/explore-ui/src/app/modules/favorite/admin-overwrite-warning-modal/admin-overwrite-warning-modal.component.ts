import {Component, Input} from '@angular/core';
import {
    CoreCommonConstants,
    CoreFavoriteConstants,
    FavoriteDisplayEnum,
    ModalDirective
} from '@blk/explore-ui-core';

/**
 * Admin Overwrite Warning Modal Component
 *  Once users click "Continue" on this modal, the save summaries modal will be opened to continue saving.
 */
@Component({
    selector: 'app-admin-overwrite-warning-modal',
    templateUrl: './admin-overwrite-warning-modal.component.html',
    styleUrls: ['./admin-overwrite-warning-modal.component.scss']
})
export class AdminOverwriteWarningModalComponent extends ModalDirective<boolean> {

    readonly CoreCommonConstants = CoreCommonConstants;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;

    @Input() favoriteDisplayType: FavoriteDisplayEnum;
}
