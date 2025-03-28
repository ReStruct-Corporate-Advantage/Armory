import { Component, Input } from '@angular/core';
import { CoreFavoriteConstants } from '@blk/explore-ui-core';

@Component({
    selector: 'app-shared-favorite-status-badge',
    templateUrl: './shared-favorite-status-badge.component.html',
    styleUrls: ['./shared-favorite-status-badge.component.scss']
})
export class SharedFavoriteStatusBadgeComponent {
    @Input() fav: any;

    protected readonly CoreFavoriteConstants = CoreFavoriteConstants;

}