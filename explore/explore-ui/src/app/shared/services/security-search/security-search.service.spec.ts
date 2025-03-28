import {TestBed} from '@angular/core/testing';

import {SecuritySearchService} from './security-search.service';
import {Http2BmsService} from '..';
import {Observable, of} from 'rxjs';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';

describe('SecuritySearchService', () => {
    let service: SecuritySearchService;
    let http2BmsServiceStub;

    const jsonMockData = {
        data: [
            {
                cusip: '037833100',
                desc1: 'APPLE INC',
                desc2: '',
                desc3: '',
                secGroup: 'EQUITY',
                secType: 'EQUITY',
                ticker: 'AAPL'
            }
        ]
    };

    beforeEach(() => {
        http2BmsServiceStub = {
            post$: jest.fn((): Observable<any> => {
                return of(jsonMockData);
            })
        };

        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: http2BmsServiceStub}]
        });

        service = TestBed.inject(SecuritySearchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('searchSecurity$ Test', () => {
        it('should call post from http2BmsService and deserialize result', done => {
            jest.spyOn(http2BmsServiceStub, 'post$');
            service.searchSecurity$('AAPL', null).subscribe(result => {
                expect(result.length).toBe(1);
                expect(result[0].cusip).toBe(jsonMockData.data[0].cusip);
                done();
            });
        });

        it('should call post from http2BmsService for updateDesignateValue and deserialize result', done => {
            jest.spyOn(http2BmsServiceStub, 'post$');
            const rules: BaseRule[] = [];
            rules.push(new SecurityRule('AAPL', 5, 'TRADING_UNITS'));
            service.updateDesignateValue$(rules, '05/04/2018', 'TRADING_UNITS', 'USD', false).subscribe(result => {
                expect(result.designateValue).toBe(undefined);
                done();
            });
        });

        it('should return empty array if invalid response', done => {
            service['http2BmsService'].post$ = jest.fn((): Observable<any> => of({}));
            service.searchSecurity$('AAPL', null).subscribe(result => {
                expect(result.length).toBe(0);
                done();
            });
        });
    });
});
