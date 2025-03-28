import {Observable, of} from 'rxjs';
import {TestBed} from '@angular/core/testing';
import {Http2BmsService} from '../bms/http2bms.service';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {ColumnConfig, PerformanceConstants} from '@blk/explore-ui-core';

/**
 * Test cases for ReportColumnService
 */
describe('ReportColumnService', () => {
    let service: ReportColumnService;

    const httpServiceStub = {
        get$: jest.fn((): Observable<any> => {
            return of({data: [{columnTag: 'wt_contr', uses: 'PORT'}, {columnTag: 'bench_wt_contr', uses: 'BENCH'}]});
        })
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: httpServiceStub}]
        });
        service = TestBed.inject(ReportColumnService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return an observable with report columns - report not present in cache', function (done: any) {
        jest.spyOn(httpServiceStub, 'get$');
        ReportColumnService.columnDataCache = new Map<string, ColumnConfig[]>();
        service.getColumnListFromReport(PerformanceConstants.PERFORMANCE_DETAILS_REPORT).subscribe((cols: ColumnConfig[]) => {
            expect(cols.length).toBe(2);
            const col1 = ColumnConfig.createColumn('wt_contr', 'PORT', 'wt_contr');
            const col2 = ColumnConfig.createColumn('bench_wt_contr', 'BENCH', 'bench_wt_contr');
            expect(cols[0].equals(col1)).toBeTruthy();
            expect(cols[1].equals(col2)).toBeTruthy();
            expect(httpServiceStub.get$).toHaveBeenCalled();
            done();
        });
    });

    it('should return an observable with report columns - report present in cache', function (done: any) {
        jest.spyOn(httpServiceStub, 'get$');
        const col1 = ColumnConfig.createColumn('wt_contr', 'PORT', 'wt_contr');
        const col2 = ColumnConfig.createColumn('bench_wt_contr', 'BENCH', 'bench_wt_contr');

        ReportColumnService.columnDataCache = new Map<string, ColumnConfig[]>();
        ReportColumnService.columnDataCache.set(PerformanceConstants.PERFORMANCE_DETAILS_REPORT, [col1, col2]);
        service.getColumnListFromReport(PerformanceConstants.PERFORMANCE_DETAILS_REPORT).subscribe((cols: ColumnConfig[]) => {
            expect(cols.length).toBe(2);
            expect(cols[0].equals(col1)).toBeTruthy();
            expect(cols[1].equals(col2)).toBeTruthy();
            expect(httpServiceStub.get$).not.toHaveBeenCalled();
            done();
        });
    });
});
