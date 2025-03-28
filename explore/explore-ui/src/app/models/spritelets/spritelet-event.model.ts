import {GetContextMenuItemsParams, GetMainMenuItemsParams} from 'ag-grid-community';

/**
 * Model class representing a spritelet launch event
 */
export class SpriteletEvent {
    constructor(public actionName: string, public params: GetContextMenuItemsParams | GetMainMenuItemsParams, public callbackMethodName?: string, public actionType?: string) {
    }
}
