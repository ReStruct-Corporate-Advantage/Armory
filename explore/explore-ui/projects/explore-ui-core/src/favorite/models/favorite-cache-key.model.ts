import {isNil} from 'lodash';

/**
 * Class use to store favorite item in the cache in FavoriteService.
 * Users both the favorite's id and owner to save into the cache.
 */

export class FavoriteCacheKey {
    // Sybase favorites have number ID, ADL favorites have UUID (string)
    id: number|string;
    private _global: boolean;
    versionId?: string;

    /**
     * Constructor for favorite that gets saved in the cache.
     */
    constructor(id: number|string, global: boolean, versionId?: string) {
        this.id = id;
        this.global = global;
        this.versionId = versionId;
    }

    /**
     * getter for _global
     */
    get global(): boolean {
        return this._global;
    }

    /**
     * setter for _global
     */
    set global(value: boolean) {
        this._global = isNil(value) ? false : value;
    }

    /**
     * Returns a string representation of the favorite cache item.
     */
    toString(): string {
        return this.global + ';' + this.id + (this.versionId ? ';' + this.versionId : '');
    }
}
