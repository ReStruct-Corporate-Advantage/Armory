import {createFeatureSelector, createSelector} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {LoadingActions, LoadingActionTypes} from './loading.actions';
import {LoadingMessage} from '../../../models/loading-message.model';

export function loadingReducer(state: LoadingState = initialLoadingState, action: LoadingActions) {
    switch (action.type) {
        // add a LoadingMessage and update latestLoadingMessage on the store
        case LoadingActionTypes.ADD_LOADING_MESSAGE:
            return loadingAdapter.addOne(new LoadingMessage(action.payload.key, action.payload.messageInfo), state);

        // remove a LoadingMessage and update latestLoadingMessage on the store
        case LoadingActionTypes.REMOVE_LOADING_MESSAGE:
            return loadingAdapter.removeOne(action.payload.key, state);

        // DEFAULT CASE
        default:
            return state;
    }
}

const loadingState = createFeatureSelector<LoadingState>('loading');

/**
 * Entity Adapter
 */
const loadingAdapter: EntityAdapter<LoadingMessage> = createEntityAdapter<LoadingMessage>({
    selectId: (model: LoadingMessage) => model.key
});

/**
 * Initial State
 */
export const initialLoadingState = loadingAdapter.getInitialState({});

/**
 * Get current loading status
 */
export const getLoadingStatus = createSelector(loadingState, state => {
    return state.ids.length > 0;
});

/**
 * Get current loading message
 */
export const getCurrentLoadingMessage = createSelector(loadingState, state => {
    return state.entities[state.ids[0]]?.messageInfo;
});

/**
 * LoadingState Interface
 */
interface LoadingState extends EntityState<LoadingMessage> {
}
