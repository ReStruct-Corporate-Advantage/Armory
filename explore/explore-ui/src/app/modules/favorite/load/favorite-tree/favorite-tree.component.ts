import {Component} from '@angular/core';
import {FavoriteTreeDirective} from '../../favorite-tree.directive';

/**
 * Favorite Tree Component
 */
@Component({
    selector: 'app-favorite-tree',
    templateUrl: './favorite-tree.component.html',
    styleUrls: []
})
export class FavoriteTreeComponent extends FavoriteTreeDirective {
}
