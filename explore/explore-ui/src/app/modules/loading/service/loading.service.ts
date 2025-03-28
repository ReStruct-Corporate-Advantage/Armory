import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import * as fromLoading from '../store/loading.reducer';
import {LoadingMessageInfo} from '@models/loading-message-info.model';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    constructor(private store: Store<{}>) { }

    /**
     * get loading status from the store
     */
    isLoading$(): Observable<any> {
        return this.store.select(fromLoading.getLoadingStatus);
    }

    /**
     * get current loading message from the store
     */
    getLoadingMessageInfo$(): Observable<LoadingMessageInfo> {
        return this.store.select(fromLoading.getCurrentLoadingMessage);
    }
}
