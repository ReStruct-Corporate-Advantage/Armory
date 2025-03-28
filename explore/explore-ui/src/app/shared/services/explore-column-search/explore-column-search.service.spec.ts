import {TestBed} from '@angular/core/testing';

import {ExploreColumnSearchService} from './explore-column-search.service';
import {of} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {Http2BmsService} from '@services/bms';

describe('ExploreColumnSearchService', () => {
    let service: ExploreColumnSearchService;

    const http2BmsServiceStub = {
        get$: jest.fn(() => {
            return of({data: {ColumnDefinitions: [{ title: 'Market Value', columnTag: 'market_val', score: 0.9 }]}}, _async);
        })
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: http2BmsServiceStub}]
        });
        service = TestBed.inject(ExploreColumnSearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('searchPortfolio$ Test', () => {
        it('should call get from http2BmsService', () => {
            jest.spyOn(http2BmsServiceStub, 'get$');
            service.searchColumns$('MAR', 'SS1', 'RA', 10);

            expect(http2BmsServiceStub.get$).toHaveBeenCalled();
        });
    });
});
