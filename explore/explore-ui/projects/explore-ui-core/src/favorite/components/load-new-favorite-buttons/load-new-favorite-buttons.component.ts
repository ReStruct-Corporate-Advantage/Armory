import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuxButtonTypeEnum} from '@blk/aladdin-angular-components';
import {CoreFavoriteConstants} from '../../constants';

@Component({
    selector: 'explore-core-load-new-favorite-buttons',
    templateUrl: './load-new-favorite-buttons.component.html',
    styleUrls: ['./load-new-favorite-buttons.component.scss']
})
export class LoadNewFavoriteButtonsComponent {
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    readonly CoreFavoriteConstants = CoreFavoriteConstants;

    @Input() isDisabled = false;
    @Input() showLoadOnly = false;
    @Input() newButtonLabel = CoreFavoriteConstants.FAVORITE_ACTIONS.NEW;

    @Output() loadClick = new EventEmitter();
    @Output() newClick = new EventEmitter();

    onLoadClicked(): void {
        this.loadClick.emit();
    }

    onNewClicked(): void {
        this.newClick.emit();
    }
}
