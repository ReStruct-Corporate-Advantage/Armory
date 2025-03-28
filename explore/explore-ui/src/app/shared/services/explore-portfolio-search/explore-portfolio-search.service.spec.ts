import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';

import {ExplorePortfolioSearchService, PortSearchItemCallback} from './explore-portfolio-search.service';
import {Http2BmsService} from '@services/bms';
import {async as _async} from 'rxjs/internal/scheduler/async';

describe('PortfolioSearchService', () => {
    let service: ExplorePortfolioSearchService;

    const http2BmsServiceStub = {
        get$: jest.fn(() => {
            return of({}, _async);
        })
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: http2BmsServiceStub}]
        });
        service = TestBed.inject(ExplorePortfolioSearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('searchPortfolio$ Test', () => {
        it('should call get from http2BmsService', () => {
            jest.spyOn(http2BmsServiceStub, 'get$');
            service.searchPortfolio$('PEP');

            expect(http2BmsServiceStub.get$).toHaveBeenCalled();
        });
    });

    describe('enableWhatIfSearch tests', () => {
        const callback1 = jest.fn((item, callback) => {});
        const callback2: PortSearchItemCallback = (item) => {};
        it('tests if callback are called', () => {
            let favAction = service.enableWhatIfSearch([callback1, callback2], true);
            favAction.callback(123, 'loading fav', false, false, 'A-#-123');
            expect(callback1.mock.calls[0][1] === callback2).toBeTruthy();

            callback1.mockClear();
            favAction = service.enableWhatIfSearch(callback1);
            favAction.callback(123, 'loading fav', false, false, 'A-#-123');
            expect((callback1.mock.calls[0] as any[]).length === 1).toBeTruthy();
        });
    });
});
