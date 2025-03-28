import {Injectable} from '@angular/core';
import {Http2BmsService} from '../bms/http2bms.service';
import {map} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {ColumnSetStore} from '../../../stores/column-set.store';
import {ReportingColumn} from '@models/reporting-column/reporting-column.model';

@Injectable({
    providedIn: 'root'
})
export class ColumnSetService {

    constructor(private httpService: Http2BmsService) { }

    /**
     * Gets the report columns for the given type.
     */
    fetchColumnData$(name: string): Observable<ReportingColumn[]> {
        // Try and get the report from the local cache.
        let report = ColumnSetStore.getReportColumnsFromCache(name);
        if (report) {
            // Got one so return a faked Observable with the value in it.
            return of(report);
        }
        const params = new HttpParams({fromObject: {name}});
        return this.httpService.get$('reportColumns', params)
            .pipe(map((response: any) => {
                // Create the report.
                report = response.data;

                // Add the item to the cache.
                ColumnSetStore.addReportColumnsToCache(name, report);

                const reportingColumnReport = [];
                report.forEach((column) => reportingColumnReport.push(new ReportingColumn(column)));
                return reportingColumnReport;
            }));
    }
}
