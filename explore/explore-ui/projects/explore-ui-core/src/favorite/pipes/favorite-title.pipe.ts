import {Pipe, PipeTransform} from '@angular/core';
import {CoreFavoriteConstants} from '../constants';

/**
 * Update Favorite Title
 *
 *  if a label is for button, then we capitalize first letter of each word,
 *  and if a label is for link (or anything else), then we sentence case the label.
 *
 * @example:
 *   {{'Workspace' | favoriteHeader: 'My'}}
 *   formats to: 'My workspace'
 */
@Pipe({name: 'favoriteTitle'})
export class FavoriteTitlePipe implements PipeTransform {
    transform(value: string, type: string): string {


        switch (type) {
            case CoreFavoriteConstants.TITLE:
                return value + ' ' + type;

            case CoreFavoriteConstants.SEARCH:
                return type + ' ' + value.toLowerCase();

            case CoreFavoriteConstants.LOAD:
            case CoreFavoriteConstants.SAVE:
                return (value === CoreFavoriteConstants.COLUMN_SET_LOWER) ? type + ' ' + CoreFavoriteConstants.SET : type + ' ' + value;

            default:
                return type + ' ' + value.toLowerCase();
        }
    }
}
