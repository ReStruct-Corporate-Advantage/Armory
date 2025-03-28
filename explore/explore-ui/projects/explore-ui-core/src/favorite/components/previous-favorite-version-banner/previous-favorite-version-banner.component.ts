import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreFavoriteUtils} from '../../utils';
import {CoreFavoriteConstants} from '../../constants';
import {CoreFavoriteStore} from '../../stores';
import {AuxNotificationStyleEnum} from '@blk/aladdin-angular-components';

@Component({
    selector: 'explore-previous-favorite-version-banner',
    templateUrl: './previous-favorite-version-banner.component.html'
})
export class PreviousFavoriteVersionBannerComponent implements OnChanges {

    protected readonly AuxNotificationStyleEnum = AuxNotificationStyleEnum;
    protected readonly PREVIOUS_VERSION_MESSAGE = 'You are using a previous version';

    @Input() favoriteId: string;
    @Input() owner: string;
    @Input() currentFavoriteVersion: string;
    @Input() previousVersionMessage = this.PREVIOUS_VERSION_MESSAGE;

    // flag to indicate if previous version banner should be shown
    isPreviousVersion = false;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.favoriteId || changes.owner || changes.currentFavoriteVersion) {
            this.updateIsPreviousVersion();
        }
    }

    /**
     * Determines if previous version banner should be displayed when favorite data updates
     */
    updateIsPreviousVersion(): void {
        // return if: not a favorite, not an enterprise favorite, or not an ADL favorite
        if (!this.favoriteId || this.owner !== CoreFavoriteConstants.ADMIN || !this.currentFavoriteVersion) {
            this.isPreviousVersion = false;
            return;
        }
        // fetch latest favorite to get the latest version
        const latestFavorite = CoreFavoriteStore.favoriteCache.get(CoreFavoriteUtils.getFavoriteKey(false, this.favoriteId).toString());
        this.isPreviousVersion = latestFavorite.latestFavoriteVersion !== this.currentFavoriteVersion;
    }
}
