import {TestBed} from '@angular/core/testing';
import {PublishStateService} from './publish-state.service';
import {Http2BmsService} from '..';
import {PublishStateRequestPayload} from '@interfaces/publish-state-request-payload.interface';
import {of} from 'rxjs';
import {PublishStateItem} from '@models/publishState/publish-state-item.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';
import moment from 'moment';
import {PublishStateConstants} from '@constants/publish-state.constants';
import {PublishStateCode} from '@enums/publish-state-code.enum';
import {DateValue, TokenUtils} from '@blk/explore-ui-core';

describe('PublishStateService', () => {
    let service: PublishStateService;
    let samplePortfolio: Portfolio;
    let publishStateReqPayload: PublishStateRequestPayload;

    const publishStateResults: any[] = [{
        portfolioName: 'PEP',
        publishStateCode: 1,
        publishTime: '2020-04-01T05:40:52.000Z'
    }];

    const httpServiceStub = {
        post$: jest.fn(() => of({data: {data: publishStateResults}}))
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: httpServiceStub}]
        });
        service = TestBed.inject(PublishStateService);

        // Create a sample portfolio
        samplePortfolio = new Portfolio('PEP', new DateValue({
            date: '06/12/2019',
        }), false);
        samplePortfolio.benchmark = new Benchmark({
            name: 'MSAC_APACN',
            order: 1,
            type: 'RISK'
        });
        samplePortfolio.lookthroughSettings = new LookThroughSettings();
        samplePortfolio.lookthroughSettings.isLookThroughEnabled = true;
        samplePortfolio.lookthroughSettings.ltProxies = ['RISK_PROXY', 'FUND'];
        samplePortfolio.lookthroughSettings.ltSecurityTypes = ['FUND', 'ETF'];

        publishStateReqPayload = {
            portfolio: 'PEP',
            forDate: '06/12/2019',
            publishRequestBenchName: 'MSAC_APACN',
            publishRequestBenchSelection: 'RISK',
            isIndexHistoryPort: false,
            publishRequestBenchOrder: 1,
            isLookThroughEnabled: true,
            isBenchLookThroughEnabled: false,
            ltSecurityProxyTypes: ['RISK_PROXY', 'FUND'],
            ltSecurityTypes: ['FUND', 'ETF']
        };

    });

    it('Service  fetches and stores publish state info in portfolio', done => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        expect(service.createPublishStateRequestPayload(samplePortfolio)).toEqual(publishStateReqPayload);
        service.fetchPublishedState$(samplePortfolio).subscribe(
            port => {
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(1);
                expect(httpServiceStub.post$).toHaveBeenCalledWith('getPublishedState', publishStateReqPayload, expect.anything());
                const publishStateWrapper = port.publishStateWrapperSubject$.getValue();
                expect(publishStateWrapper.publishedStateResults.length === 1).toBeTruthy();
                const publishDate = moment('2020-04-01T05:40:52.000Z').local().format(PublishStateConstants.FORMAT_WITH_SECONDS);
                expect(publishStateWrapper.publishedStateResults[0].equals(new PublishStateItem('PEP', 1, publishDate))).toBeTruthy();
                done();
            }
        );
    });

    it('Service  fetches and stores publish state info in portfolio - with blank publishCode', done => {
        jest.resetAllMocks();
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        publishStateResults[0].publishStateCode = null;
        publishStateResults[0].publishTime = null;

        jest.spyOn(httpServiceStub, 'post$').mockReturnValue(of({data: {data: publishStateResults}}));
        service.fetchPublishedState$(samplePortfolio).subscribe(
            port => {
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(1);
                expect(httpServiceStub.post$).toHaveBeenCalledWith('getPublishedState', publishStateReqPayload, expect.anything());
                const publishStateWrapper = port.publishStateWrapperSubject$.getValue();
                expect(publishStateWrapper.publishedStateResults.length === 1).toBeTruthy();
                expect(publishStateWrapper.publishedStateResults[0].equals(new PublishStateItem('PEP', PublishStateCode.UNPUBLISHED, PublishStateConstants.NOT_APPLICABLE))).toBeTruthy();
                done();
            }
        );
    });

    it('Service  fetches and stores publish state info in portfolio - obsolete QC Data as old one was N/A state', done => {
        jest.resetAllMocks();
        publishStateResults[0].publishTime = '2020-04-01T05:40:52.000Z';
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        jest.spyOn(httpServiceStub, 'post$').mockReturnValue(of({data: {data: publishStateResults}}));
        samplePortfolio.publishStateWrapperSubject$.getValue().publishedStateResults[0].publishDate = PublishStateConstants.NOT_APPLICABLE;
        service.fetchPublishedState$(samplePortfolio).subscribe(
            port => {
                expect(httpServiceStub.post$).toHaveBeenCalledWith('getPublishedState', publishStateReqPayload, expect.anything());
                const publishStateWrapper = port.publishStateWrapperSubject$.getValue();
                expect(publishStateWrapper.isQCDataObsolete).toBeTruthy();
                done();
            }
        );
    });

    it('Service  fetches and stores publish state info in portfolio - obsolete QC Data as old one has smaller publish date', done => {
        jest.resetAllMocks();
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        jest.spyOn(httpServiceStub, 'post$').mockReturnValue(of({data: {data: publishStateResults}}));
        samplePortfolio.publishStateWrapperSubject$.getValue().isQCDataObsolete = false;
        samplePortfolio.publishStateWrapperSubject$.getValue().publishedStateResults[0].publishDate = moment('2020-04-01T05:30:52.000Z').local().format(PublishStateConstants.FORMAT_WITH_SECONDS);
        service.fetchPublishedState$(samplePortfolio).subscribe(
            port => {
                expect(httpServiceStub.post$).toHaveBeenCalledWith('getPublishedState', publishStateReqPayload, expect.anything());
                const publishStateWrapper = port.publishStateWrapperSubject$.getValue();
                expect(publishStateWrapper.isQCDataObsolete).toBeTruthy();
                done();
            }
        );
    });
});
