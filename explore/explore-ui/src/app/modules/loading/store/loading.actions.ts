import {Action} from '@ngrx/store';
import {LoadingMessageInfo} from '@models/loading-message-info.model';

export enum LoadingActionTypes {
    ADD_LOADING_MESSAGE = '[Loading] Add Loading Message',
    REMOVE_LOADING_MESSAGE = '[Loading] Remove Loading Message'
}

/**
 * Add LoadingMessage Message Action
 */
export class AddLoadingMessage implements Action {
    readonly type = LoadingActionTypes.ADD_LOADING_MESSAGE;

    constructor(public payload: { key: string, messageInfo: LoadingMessageInfo }) {
    }
}

/**
 * Remove LoadingMessage Message Action
 */
export class RemoveLoadingMessage implements Action {
    readonly type = LoadingActionTypes.REMOVE_LOADING_MESSAGE;

    constructor(public payload: { key: string }) {
    }
}

export type LoadingActions = AddLoadingMessage | RemoveLoadingMessage;
