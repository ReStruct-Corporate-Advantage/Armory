import {Injectable} from '@angular/core';
import {Http2BmsService} from '@services/bms';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {RequestConstants} from '@constants/request.constants';
import {map} from 'rxjs/operators';
import {HttpUtils} from '@utils/http.utils';

/**
 * ExploreColumnSearchService used in search columns
 */
@Injectable({
    providedIn: 'root'
})
export class ExploreColumnSearchService {

    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * Function to perform the search operation for the given searchString
     * @param searchString  Text to search
     * @param searchType  define search type
     */
    searchColumns$(searchString: string, searchType?: string, widgetType?: string, rows?: number, filter?: string, loadingMessage?: string): Observable<any> {
        let params = new HttpParams({
            fromObject: {
                searchParam: searchString,
                searchBy: searchType,
                widget: widgetType,
                rows: rows.toString(),
                categoryFilter: filter
            }
        });

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }

        return this.http2BmsService.get$(RequestConstants.COLUMN_SEARCH, params).pipe(
            map((payload: any): any => {
                const gridData = payload.data.ColumnDefinitions;
                gridData.forEach(cd => cd.score = parseFloat(cd.score));
                return gridData;
            })
        );
    }
}
