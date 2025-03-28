import {TestBed} from '@angular/core/testing';

import {ExploreIndexSearchService} from './explore-index-search.service';
import {of} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {Http2BmsService} from '..';
import {RequestConstants} from '@constants/request.constants';
import {HttpParams} from '@angular/common/http';

/**
 * Tests for the ExploreIndexSearchService service. Mainly the searchIndex$ method
 */
describe('ExploreIndexSearchService', () => {
    let service: ExploreIndexSearchService;

    const http2BmsServiceStub = {
        get$: jest.fn(() => {
            return of({}, _async);
        })
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: http2BmsServiceStub}]
        });
        service = TestBed.inject(ExploreIndexSearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('searchIndex$ Test', () => {
        it('should call get from http2BmsService', () => {
            jest.spyOn(http2BmsServiceStub, 'get$');
            service.searchIndex$();

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.INDEX_SEARCH, undefined);
            service.searchIndex$(true);
            const args = http2BmsServiceStub.get$.mock.calls[1];
            expect(args[0]).toBe(RequestConstants.INDEX_SEARCH);
            expect(args[1]).toBeInstanceOf(HttpParams);
        });
    });
});
