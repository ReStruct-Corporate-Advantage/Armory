import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AbstractFavoriteConfig} from '../../models/abstract-favorite-config.model';

/**
 * @Deprecated  Replaced by <explore-core-favorite-details-header /> in Explore v3.4
 *
 * Favorite Label component
 * includes label title, popover icon for favorite detail, and save/load favorite buttons
 */
@Component({
    selector: 'explore-core-favorite-label',
    templateUrl: './favorite-label.component.html',
    styleUrls: ['./favorite-label.component.scss']
})
export class FavoriteLabelComponent {
    @Input() config: AbstractFavoriteConfig;
    @Input() isFavoriteType: boolean;
    @Input() favDisplayName: string;
    @Input() labelTitle: string;

    @Output() saveButtonClicked = new EventEmitter();
    @Output() loadButtonClicked = new EventEmitter();

    /**
     * On load button clicked
     */
    onLoadButtonClicked(): void {
        this.loadButtonClicked.emit();
    }

    /**
     * On save button clicked
     */
    onSaveButtonClicked(): void {
        this.saveButtonClicked.emit();
    }
}
