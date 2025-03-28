import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {FundSectoringService} from './fund-sectoring.service';
import {PortfolioService} from '@services/portfolio';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {IndexWeight} from '@models/portfolio/index-weight.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {of} from 'rxjs';
import {FundSectoringTableRecord} from '@blk/explore-ui-breakdown';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import FundSectoringConfig from '../../../../assets/fund-sectoring-config/fund-sectoring-config.json';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {SplitPositionSettings} from '@models/split-position-settings.model';
import {DateValue} from '@blk/explore-ui-core';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';

describe('FundSectoringService', () => {
    let fundSectoringService: FundSectoringService;
    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn()
    };
    const exploreDataRequestServiceStub = {
        getData$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: ExploreDataRequestService, useValue: exploreDataRequestServiceStub}
            ]
        });
        fundSectoringService = TestBed.inject(FundSectoringService);
    });

    it('Test getIndexSectorTableRecords$', <any>fakeAsync(() => {
        let portfolioInfoReturned = new Portfolio();
        const indexWeight1 = new IndexWeight();
        indexWeight1.portfolioPortName = 'MS_UH';
        indexWeight1.portfolioFullName = 'Index portfolio Info MS_UH';
        indexWeight1.portfolioCusip = 'BRS123';
        const indexWeight2 = new IndexWeight();
        indexWeight2.portfolioPortName = 'MS_NP';
        indexWeight2.portfolioFullName = 'Index portfolio Info MS_NP';
        indexWeight2.portfolioCusip = 'BRS321';
        portfolioInfoReturned.indexWeights = [indexWeight1, indexWeight2];
        const portfolio = new Portfolio();
        portfolio.benchmark = Benchmark.create('Test');
        portfolio.benchmark.name = 'Test Benchmark';
        portfolioServiceStub.fetchPortfolioInformation$.mockReturnValue(of(portfolioInfoReturned));
        let tableRecords: FundSectoringTableRecord[] = [];
        fundSectoringService.getIndexSectorTableRecords$(portfolio).subscribe(
            (records: FundSectoringTableRecord[]) => {
                tableRecords = records;
            }
        );
        tick();
        expect(tableRecords[0]).toEqual({nodeName: 'MS_UH', description: 'Index portfolio Info MS_UH', cusip: 'BRS123', nodePath: ['MS_UH']});
        expect(tableRecords[1]).toEqual({nodeName: 'MS_NP', description: 'Index portfolio Info MS_NP', cusip: 'BRS321', nodePath: ['MS_NP']});
    }));
    it('Test getFundSectorTableRecords$', <any>fakeAsync(() => {
        const portfolio = new Portfolio();
        portfolio.portName = 'PEP';
        portfolio.datePicker = new DateValue();
        portfolio.datePicker.calCode = 'USD';
        portfolio.splitPositionSettings = new SplitPositionSettings();
        portfolio.lookthroughSettings = new LookThroughSettings();
        let tableRecords: FundSectoringTableRecord[] = [];
        let dataRequest: ExploreDataRequest = {} as any;
        exploreDataRequestServiceStub.getData$.mockImplementation(
            (widgetDataRequest: ExploreDataRequest) => {
                dataRequest = widgetDataRequest;
                return of({
                    data: {
                        children: [
                            {
                                cusip_0: 'fund1',
                                sec_desc: 'Fund1 Description'
                            },
                            {
                                cusip_0: 'fund2',
                                sec_desc: 'Fund2 Description'
                            },
                        ]
                    }
                });
            }
        );
        fundSectoringService.getFundSectorTableRecords$(portfolio).subscribe(
            (records: FundSectoringTableRecord[]) => {
                tableRecords = records;
            }
        );
        tick();
        expect(dataRequest.requestParams[0]['filter']).toEqual(JSON.stringify(FundSectoringConfig.fundsRequestParams.filter));
        expect(dataRequest.requestParams[0]['columns']).toEqual(FundSectoringConfig.fundsRequestParams.columns);
        expect(tableRecords[0]).toEqual({nodeName: 'fund1', description: 'Fund1 Description', nodePath: ['fund1']});
        expect(tableRecords[1]).toEqual({nodeName: 'fund2', description: 'Fund2 Description', nodePath: ['fund2']});
        exploreDataRequestServiceStub.getData$.mockReturnValueOnce(of({}));
        fundSectoringService.getFundSectorTableRecords$(portfolio).subscribe(
            (records: FundSectoringTableRecord[]) => {
                tableRecords = records;
            }
        );
        tick();
        expect(tableRecords).toEqual([]);
    }));

    it('Test getPortfolioSectorTableRecords$', <any>fakeAsync(() => {
        const portfolioInfoReturned = new Portfolio();
        portfolioInfoReturned.portName = 'Core-HQ';
        portfolioInfoReturned.cusip = 'BRS123';
        portfolioInfoReturned.fullName = 'Core HQ';
        const childPortfolio1 = new Portfolio();
        childPortfolio1.portName = 'Galic';
        childPortfolio1.cusip = 'BRS1231';
        childPortfolio1.fullName = 'Galic Description';
        const childPortfolio2 = new Portfolio();
        childPortfolio2.portName = 'FT';
        childPortfolio2.cusip = 'BRS1232';
        childPortfolio2.fullName = 'FT Description';
        portfolioInfoReturned.isPortfolioGroup = true;
        portfolioInfoReturned.portfolios = [childPortfolio1, childPortfolio2];
        const currentPortfolio = new Portfolio();
        portfolioServiceStub.fetchPortfolioInformation$.mockReturnValue(of(portfolioInfoReturned));
        let tableRecords: FundSectoringTableRecord[] = [];
        fundSectoringService.getPortfolioSectorTableRecords$(currentPortfolio).subscribe(
            (records: FundSectoringTableRecord[]) => {
                tableRecords = records;
            }
        );
        tick();
        expect(tableRecords[0]).toEqual({
            nodeName: 'Core-HQ', description: 'Core HQ', cusip: 'BRS123', nodePath: ['Core-HQ'], childRecords: [
                {nodeName: 'Galic', description: 'Galic Description', cusip: 'BRS1231', nodePath: ['Core-HQ', 'Galic']},
                {nodeName: 'FT', description: 'FT Description', cusip: 'BRS1232', nodePath: ['Core-HQ', 'FT']}
            ]
        });
        expect(tableRecords[1]).toEqual({nodeName: 'Galic', description: 'Galic Description', cusip: 'BRS1231', nodePath: ['Core-HQ', 'Galic']});
        expect(tableRecords[2]).toEqual({nodeName: 'FT', description: 'FT Description', cusip: 'BRS1232', nodePath: ['Core-HQ', 'FT']});
    }));
});
