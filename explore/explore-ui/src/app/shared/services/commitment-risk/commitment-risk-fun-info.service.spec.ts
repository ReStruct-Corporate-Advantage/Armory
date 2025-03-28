import {of} from 'rxjs';
import {Http2BmsService} from '..';
import {TestBed} from '@angular/core/testing';
import {CommitmentRiskFundInfoService} from '@services/commitment-risk/commitment-risk-fund-info.service';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {DateValue} from '@blk/explore-ui-core';

describe('CommitmentRiskFundInfoService', () => {
    let service: CommitmentRiskFundInfoService;

    const httpServiceStub = {
        post$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: httpServiceStub}]
        });
        service = TestBed.inject(CommitmentRiskFundInfoService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // test case for fetchPrivateFunds
    it('should fetchPrivateFunds', done => {
        const httpSpy = jest.spyOn(httpServiceStub, 'post$').mockReturnValue(of({
            data: [{'DESCRIPTION': 'test', 'CUSIP': 'BRS123', 'EXCLUDED': false}]
        }));
        service.fetchPrivateFunds(new Portfolio('PEP', new DateValue()), 'base')
            .subscribe((payload) => {
                expect(payload).toEqual([{
                    secDesc: 'test',
                    cusip: 'BRS123',
                    isDisabled: false
                }]);
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(1);
                done();
            });
    });

});
