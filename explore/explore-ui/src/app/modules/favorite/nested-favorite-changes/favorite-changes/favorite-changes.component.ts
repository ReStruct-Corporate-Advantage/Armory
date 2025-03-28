import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FavoriteChange} from '@models/favorite/favorite-change.model';

/**
 * Container that holds all the nested favorite changes
 */
@Component({
    selector: 'app-favorite-changes',
    templateUrl: './favorite-changes.component.html',
    styleUrls: ['./favorite-changes.component.scss']
})
export class FavoriteChangesComponent implements OnChanges {

    // All nested favorite changes under root item (report or workspace)
    @Input() favoriteChanges: FavoriteChange[];

    // flag indicating if all favorites are owned by the current user (ADMIN/GLOBAL considered different user)
    allFavesOwnedByCurrentUser = true;

    // is Select All checked
    isSelectAll = true;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.favoriteChanges) {
            this.allFavesOwnedByCurrentUser = this.favoriteChanges.every(favChange => favChange.allFavesOwnedByCurrentUser());
        }
    }

    /**
     * Called when Select All is toggled
     */
    onSelectAllChanged(): void {
        this.isSelectAll = !this.isSelectAll;
        this.favoriteChanges.forEach(change => change.updateSelected(this.isSelectAll));
    }
}
