import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Http2BmsService} from '../bms/http2bms.service';
import {RequestConstants} from '../../../constants';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';

/**
 * ExploreIndexSearchService requests the indexes that are displayed in the Index Research tab in the Add Portfolio Modal
 */
@Injectable({
    providedIn: 'root'
})
export class ExploreIndexSearchService {

    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * Function to perform the search operation for the indexes
     */
    searchIndex$(showLoading?: boolean): Observable<SearchedIndexData> {
       const params = showLoading ? HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), 'Loading Indexes') : undefined;
        return this.http2BmsService.get$(RequestConstants.INDEX_SEARCH, params).pipe(
            map((payload: any): any => {
                return payload.data;
            })
        );
    }
}

/**
 * data from indexSearchService.searchIndex$
 */
export interface SearchedIndexData {
    searchResults: IndexSearchItem[];
}

/**
 * each individual index from indexSearchService.searchIndex$
 */
export class IndexSearchItem {
    fullName: string;
    CLASS_TYPE: string;
    familyTree: IndexSearchItem[];
    ticker: string;
}
