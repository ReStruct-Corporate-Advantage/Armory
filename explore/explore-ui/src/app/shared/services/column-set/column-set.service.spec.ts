import {ColumnSetService} from './column-set.service';
import {of} from 'rxjs';
import {Http2BmsService} from '..';
import {TestBed} from '@angular/core/testing';
import {ColumnSetStore} from '../../../stores/column-set.store';
import {ReportingColumn} from '@models/reporting-column/reporting-column.model';
import {ColumnConfig} from '@blk/explore-ui-core';

describe('ColumnSetService', () => {
    let service: ColumnSetService;

    const httpServiceStub = {
        get$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: httpServiceStub}]
        });
        service = TestBed.inject(ColumnSetService);
    });

    beforeEach(() => {
        ColumnSetStore.cache.clear();
        jest.clearAllMocks();
    });

    /**
     * fetchReport
     */
    it('should fetchReport', done => {
        expect(ColumnSetStore.cache.size).toEqual(0);
        const columnData = {columnTag: 'market_value', uses: 'All'};
        const httpSpy = jest.spyOn(httpServiceStub, 'get$').mockReturnValue(of({
            data: [columnData]
        }));
        const reportColumn = new ReportingColumn(columnData);
        service.fetchColumnData$('PRISM_ENHANCED_B_FX_ATTRIBUTION')
            .subscribe(() => {
                expect(ColumnSetStore.cache['PRISM_ENHANCED_B_FX_ATTRIBUTION']).toEqual([reportColumn]);
                expect(httpServiceStub.get$).toHaveBeenCalledTimes(1);
                done();
            });
    });

    it('should fetchReport - get report Columns from cache', done => {
        const col = new ColumnConfig({columnTag: 'market_val'});
        ColumnSetStore.cache['PRISM_ENHANCED_B_FX_ATTRIBUTION'] = col;
        const httpSpy = jest.spyOn(httpServiceStub, 'get$').mockReturnValue(of({
            data: 'SampleReport'
        }));
        service.fetchColumnData$('PRISM_ENHANCED_B_FX_ATTRIBUTION')
            .subscribe((payload) => {
                expect(payload).toEqual(col);
                expect(httpServiceStub.get$).toHaveBeenCalledTimes(0);
                done();
            });
    });
});
