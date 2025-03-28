import {Http2BmsService} from '../bms';
import {catchError, map} from 'rxjs/operators';
import {Observable, of, throwError} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {cloneDeep} from 'lodash';
import {Injectable} from '@angular/core';
import {ColumnConfig} from '@blk/explore-ui-core';

/**
 * Service to get columns for a particular report from backend
 */
@Injectable({
    providedIn: 'root'
})
export class ReportColumnService {

    /**
     * Cache of report name and columns present in the report
     */
    static columnDataCache: Map<string, Array<ColumnConfig>> = new Map<string, Array<ColumnConfig>>();

    /**
     * Constructor
     */
    constructor(private http2BmsService: Http2BmsService) {}

    /**
     * Gets the report columns for the given type.
     */
    getColumnListFromReport(name: string): Observable<Array<ColumnConfig>> {
        // Try and get the report from the local cache.
        let columns = ReportColumnService.columnDataCache.get(name);
        if (columns) {
            // Got one so return a faked promise with the value in it.
            return of(cloneDeep(columns));
        }
        columns = [];
        return this.http2BmsService.get$('reportColumns', new HttpParams().set('name', name)).pipe(
            map((payload: any): any => {
                payload.data.forEach((col: any) => {
                    columns.push(ColumnConfig.createColumn(col.columnTag, col.uses, col.columnTag));
                });
                ReportColumnService.columnDataCache.set(name, cloneDeep(columns));
                return columns;
            }),
            catchError(error => throwError(error))
        );
    }
}

