import {Component, EventEmitter, Input, Output} from '@angular/core';
import { AuxValuePairLabelPositionEnum } from '@blk/aladdin-angular-components';
import { CoreFavoriteUtils } from '../../utils'

/**
 * @Deprecated  Replaced by <explore-core-load-new-favorite-buttons /> in Explore v3.4
 */
@Component({
    selector: 'explore-core-load-save-favorite-buttons',
    templateUrl: './load-save-favorite-buttons.component.html',
    styleUrls: ['./load-save-favorite-buttons.component.scss']
})
export class LoadSaveFavoriteButtonsComponent {
    @Input() favDisplayName: string;
    @Input() favoriteTitle?: string;
    @Input() favoriteOwner?: string;

    @Output() saveButtonClicked = new EventEmitter();
    @Output() loadButtonClicked = new EventEmitter();

    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;

    ownerDisplayName: string;

    /**
     * On load button clicked
     */
    onLoadButtonClicked(event): void {
        event.preventDefault();
        this.loadButtonClicked.emit();
        if (this.favoriteOwner) {
            this.ownerDisplayName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.favoriteOwner);
        }
    }

    /**
     * On save button clicked
     */
    onSaveButtonClicked(event): void {
        event.preventDefault();
        this.saveButtonClicked.emit();
    }
    
}
