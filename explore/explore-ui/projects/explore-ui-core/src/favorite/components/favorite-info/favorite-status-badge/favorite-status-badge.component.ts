import {Component, Input} from '@angular/core';
import {CoreFavoriteConstants, FavoriteStatus} from '../../../constants';

@Component({
  selector: 'app-favorite-status-badge',
  templateUrl: './favorite-status-badge.component.html'
})
export class FavoriteStatusBadgeComponent {

    favoriteStatusConstants = CoreFavoriteConstants.FAVORITE_STATUS;

    @Input()
    favoriteStatus: FavoriteStatus;

}
