import {ExploreResponseConfig} from '@interfaces/response.interface';
import {PortfolioService} from './portfolio.service';
import {Http2BmsService} from '@services/bms';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {Portfolio} from '@models/portfolio/portfolio.model';
import * as portMockJson from '../../../../../mocks/portMock.json';
import * as savedPortMock from '@mocks/compositionData/savedPortfolioMock.json';
import * as adhocPortMock from '@mocks/adhocPort1.json';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {MandateStore, PortfolioStore, WorkspaceStore} from '../../../stores';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {FavoriteService} from '@services/favorite';
import {CompositionDataService} from '../../../modules/main/composition-modelling/services/composition-data.service';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {HoldingChangeResponse} from '@models/portfolio/composition/holding-change-response.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {
    AlertConstants,
    Calendar,
    CalendarDateUtils,
    DateService,
    DateValue,
    ExploreDialogParam,
    PortfolioDefaults,
    ResponseData,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {PublishStateService} from '@services/publishState/publish-state.service';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {NotificationService} from '@services/notification';

/**
 * Test cases for PortfolioService
 */
describe('PortfolioService', () => {
    let service: PortfolioService;
    let portfolio: Portfolio;

    const timePeriodData = [
        {'Value': 'DTD', 'type': 'To Date', 'interval': 'Day', 'maxPeriods': 15},
        {'Value': 'WTD', 'type': 'To Date', 'interval': 'Week', 'maxPeriods': 2},
        {'Value': 'MTD', 'type': 'To Date', 'interval': 'Month', 'maxPeriods': 15},
        {'Value': 'QTD', 'type': 'To Date', 'interval': 'Quarter', 'maxPeriods': 5},
        {'Value': 'YTD', 'type': 'To Date', 'interval': 'Year', 'maxPeriods': 1},
        {'Value': 'Days', 'type': 'Rolling', 'interval': 'Day', 'maxPeriods': 442},
        {'Value': 'Weeks', 'type': 'Rolling', 'interval': 'Week', 'maxPeriods': 63},
        {'Value': 'Months', 'type': 'Rolling', 'interval': 'Month', 'maxPeriods': 15},
        {'Value': 'Quarters', 'type': 'Rolling', 'interval': 'Quarter', 'maxPeriods': 5},
        {'Value': 'Years', 'type': 'Rolling', 'interval': 'Year', 'maxPeriods': 1},
        {'Value': 'CUSTOM', 'type': 'Custom', 'interval': null, 'maxPeriods': 1},
        {'Value': 'BDay', 'type': 'Other', 'interval': 'Business Day', 'maxPeriods': 442},
        {'Value': 'Prev. Mth', 'type': 'Other', 'interval': 'Previous Month', 'maxPeriods': 1},
        {'Value': 'Prev. Qtr', 'type': 'Other', 'interval': 'Previous Quarter', 'maxPeriods': 5},
        {'Value': 'FYTD', 'type': 'Other', 'interval': 'Fiscal Year', 'maxPeriods': 1}
    ];

    const httpServiceStub = {
        post$: jest.fn((arg?: any) => {
            if (arg instanceof Portfolio) {
                return of({data: timePeriodData});
            }
            return of({'data': portMockJson}, _async);
        })
    };

    const publishStateServiceStub = {
        fetchPublishedState$: jest.fn(() => {
            return of(null);
        })
    };

    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    const compositionDataServiceStub = {
        fetchHoldingChangesFollowedByCompositionData$: jest.fn(),
        fetchHoldingChangesForRules$: jest.fn(),
        addHoldingChangesToPort: jest.fn(),
        fetchDefaultCompositionBreakdown$: jest.fn(() => of(new Breakdown()))
    };

    const dateServiceStub = {
        parseDateString$: jest.fn(() => of(new Date()))
    };

    const notificationServiceStub = {
        openDialog: jest.fn(() => {
        })
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: CompositionDataService, useValue: compositionDataServiceStub},
                {provide: DateService, useValue: dateServiceStub},
                {provide: PublishStateService, useValue: publishStateServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });
        service = TestBed.inject(PortfolioService);
        portfolio = new Portfolio('PEP', new DateValue({date: '3/10/2016'}));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('fetchPortfolioInfoObject$ for AdhocPortfolio', () => {
        it('should add adhocPortParams as part of request if not passed in', () => {
            const adhocPortfolio = new AdhocPortfolio('PEP');
            adhocPortfolio.datePicker = DateValue.newDate('01/10/2020');
            adhocPortfolio.adhocParams = new AdhocPortParams({
                'name': 'EnMat-12.12.2020',
                'fullName': 'DWS ESG Energy Materials',
                'currency': 'USD',
                'portMktNotional': 121000000,
                'date': DateValue.newDate('03/11/2020')
            });

            const fakeHttpParams = new HttpParams();
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(fakeHttpParams);
            jest.spyOn(service['httpService'], 'post$');

            service.fetchPortfolioInfoObject$(adhocPortfolio, {isLightVersion: true, includeMandate: true});

            expect(service['httpService'].post$).toHaveBeenCalledWith(
                'portfolioInfo', {
                    'adhocPortParams':
                        {
                            'currency': 'USD',
                            'fullName': 'DWS ESG Energy Materials',
                            'name': 'EnMat-12.12.2020',
                            'portMktNotional': 121000000,
                            'date': {'date': '03/11/2020', 'dateString': false}
                        },
                    'forDate': '01/10/2020',
                    'isIndexHistoryPort': undefined,
                    'lightVersion': true,
                    'includeMandate': true,
                    'portfolio': 'PEP'
                }, fakeHttpParams);
        });

        it('should use correct holiday calendar in fetchPortfolioInfoObject', (done: any) => {
            const adhocPortfolio = new AdhocPortfolio('PEP');
            adhocPortfolio.datePicker = DateValue.newDate('01/10/2020');
            adhocPortfolio.datePicker.calCode = 'US_NYSE';
            adhocPortfolio.adhocParams = new AdhocPortParams({
                'name': 'EnMat-12.12.2020',
                'fullName': 'DWS ESG Energy Materials',
                'currency': 'USD',
                'portMktNotional': 121000000,
                'date': DateValue.newDate('03/11/2020')
            });

            const fakeHttpParams = new HttpParams();
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(fakeHttpParams);
            jest.spyOn(service['httpService'], 'post$');
            service.fetchPortfolioInfoObject$(adhocPortfolio, {isLightVersion: true, includeMandate: true}).subscribe(response => {
                console.log(response);
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(1);
                expect(response.datePicker.date).toBeDefined();
                expect(CalendarDateUtils.getDateInMoment(response.datePicker.date).format('MM/DD/YYYY')).toBe('01/10/2020');
                expect(response.datePicker.dateString).toBeFalsy();
                expect(response.datePicker.dateStringValue).toBe('T-1ME');
                expect(response.datePicker.calCode).toBe('US_NYSE');
                done();
            });
        });
    });

    describe('fetchPortfolioInformation$ Test', () => {
        describe('error handling', () => {
            it('should return throwError if portName is empty', (done: any) => {
                jest.spyOn(console, 'error');
                portfolio.portName = '';

                service.fetchPortfolioInformation$(portfolio, {isLightVersion: true, includeMandate: true})
                    .subscribe(port => {
                        expect(port === portfolio).toBeTruthy();
                        expect(console.error).toHaveBeenCalledWith('No portfolio specified');
                        done();
                    });
            });

            it('should throw throwError if response from the post request: portfolioInfo returns with no response.data', (done: any) => {
                jest.spyOn(service['httpService'], 'post$').mockReturnValue(of({}));
                portfolio.portName = 'PEP';

                service.fetchPortfolioInformation$(portfolio, {isLightVersion: true, includeMandate: true})
                    .subscribe(() => {
                    }, error => {
                        expect(error).toEqual(Error('Received exception from server'));
                        done();
                    });
            });

            it('should return throwError if httpService.post$ returns error', (done: any) => {
                jest.spyOn(service['httpService'], 'post$').mockReturnValue(throwError('Error from http'));
                portfolio.portName = 'PEP';
                service.fetchPortfolioInformation$(portfolio, {isLightVersion: true, includeMandate: true})
                    .subscribe(() => {
                    }, error => {
                        expect(error).toBe('Error from http');
                        done();
                    });
            });
        });
    });

    describe('updatePortfolioTimePeriod$ Test', () => {
        it('should update passed in portfolio\'s timePeriods', () => {
            const currentPortfolio = new Portfolio('PEP');
            currentPortfolio.datePicker = new DateValue({date: '05/18/2020'});
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(currentPortfolio);

            jest.spyOn(service['httpService'], 'post$');

            const subscription = service.updatePortfolioTimePeriod$(WorkspaceStore.getCurrentPortfolio())
                .subscribe(() => {
                    expect(WorkspaceStore.getCurrentPortfolio().timePeriods).toEqual(timePeriodData);
                });
            subscription.unsubscribe();
        });
    });

    /**
     * Tests the fetch port info call but calls it twice to ensure the cache is utilized the second time
     */
    it('Test fetchPortfolioInformation$', done => {
        jest.spyOn(MandateStore, 'getMandateSettings').mockReturnValue(new MandateSettings());
        const portCacheKey: PortfolioCacheKey = new PortfolioCacheKey('PEP', '01/10/2020', true, true);
        const portInput: Portfolio = new Portfolio('PEP', new DateValue({date: '01/10/2020'}));
        portInput.isBench = true;
        jest.spyOn(service['dateservice'], 'parseDateString$').mockReturnValue(of(new Date('01/10/2020')));
        service.fetchPortfolioInformation$(portInput, {isLightVersion: true, includeMandate: true}).subscribe(response => {
            expect(httpServiceStub.post$).toHaveBeenCalledTimes(0);
            verifyFunc(response, portInput, portCacheKey);
            expect(response.datePicker.date).toBeDefined();
            expect(CalendarDateUtils.getDateInMoment(response.datePicker.date).format('MM/DD/YYYY')).toBe('01/10/2020');
            expect(response.datePicker.dateString).toBeFalsy();
            expect(response.datePicker.dateStringValue).toBe('T-1ME');
            expect(response.datePicker.calCode).toBe('US_NYSE');
            done();
        });
    });

    it('Test fetchPortfolioInformation$ - utilizes cache', done => {
        // Initializing the cache
        const portCacheKey: PortfolioCacheKey = new PortfolioCacheKey('PEP', '01/10/2020', true, true);
        PortfolioStore.addPortfolioInfoToCache(portCacheKey, portMockJson);
        const portInput: Portfolio = new Portfolio('PEP', new DateValue({date: '01/10/2020'}));
        portInput.publishStateWrapperSubject$.getValue().isFirstLoad = false;
        service.fetchPortfolioInformation$(portInput, {isLightVersion: true, includeMandate: true}).subscribe(response => {
            expect(httpServiceStub.post$).toHaveBeenCalledTimes(0);
            verifyFunc(response, portInput, portCacheKey);
            done();
        });
    });

    describe('Test fetchPortfolioInformation$ - for saved portfolio', () => {

        let savedPortfolio: RulesBasedPortfolio;
        let ruleBasedPort: RulesBasedPortfolio;
        let updatedPort: Portfolio;

        beforeEach(() => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            savedPortfolio = new RulesBasedPortfolio();
            ruleBasedPort = new RulesBasedPortfolio('PEP');
            updatedPort = new Portfolio();
            savedPortfolio.deserialize(savedPortMock);
            ruleBasedPort.id = 126;
        });

        it('Test fetchPortfolioInformation$ - date picker is present and populated', done => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            jest.spyOn(service, 'fetchPortInfoAndCallForComposition$').mockReturnValue(of(updatedPort));
            jest.spyOn(favoriteServiceStub, 'getFavorite$').mockReturnValue(of(savedPortfolio));
            jest.spyOn(CalendarDateUtils, 'getDateInFormat');
            jest.spyOn(ruleBasedPort, 'deserialize');
            service.fetchPortfolioInformation$(ruleBasedPort, {isLightVersion: true, includeMandate: true}).subscribe(payload => {
                expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledWith(126, 'Loading What-if');
                expect(CalendarDateUtils.getDateInFormat).toHaveBeenCalled();
                expect(dateServiceStub.parseDateString$).not.toHaveBeenCalled();
                expect(ruleBasedPort.deserialize).toHaveBeenCalledWith(savedPortfolio.serialize());
                expect(service.fetchPortInfoAndCallForComposition$).toHaveBeenCalledWith(ruleBasedPort, {isLightVersion: true, includeMandate: true}, undefined, undefined, undefined, undefined);
                expect(payload === updatedPort).toBeTruthy();
                done();
            });
        });

        it('Test fetchPortfolioInformation$ - AdhocPortfolio with isPortGroup true', done => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const adhocPortfolio = new AdhocPortfolio();
            const adhocPortGroup = new AdhocPortGroup();
            adhocPortGroup.deserialize(adhocPortMock);
            adhocPortfolio.deserialize(adhocPortMock);
            adhocPortGroup.datePicker = adhocPortfolio.datePicker = new DateValue({
                date: '01/01/2020',
                calCode: 'GreenPkg',
                dateStringValue: '',
                dateString: false
            });
            adhocPortfolio.id = 1;
            adhocPortfolio.compositionSetting.breakdownTree.children = null;
            adhocPortfolio.adhocParams.isPortGroup = true;
            adhocPortfolio.portName = "Adhoc IP";
            jest.spyOn(service, 'fetchPortInfoAndCallForComposition$').mockReturnValue(of(adhocPortGroup));
            jest.spyOn(favoriteServiceStub, 'getFavorite$').mockReturnValue(of(adhocPortfolio));
            jest.spyOn(CalendarDateUtils, 'getDateInFormat');
            jest.spyOn(CalendarDateUtils, 'getDefaultDateObject').mockReturnValue(of(new DateValue({
                date: '01/01/2020',
                calCode: 'GreenPkg',
                dateStringValue: '',
                dateString: false
            })));
            service.fetchPortfolioInformation$(adhocPortfolio, {isLightVersion: true, includeMandate: true}).subscribe(payload => {
                expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledWith(1, 'Loading What-if');
                expect(payload === adhocPortGroup).toBeTruthy();
                done();
            });
        });

        // it('Test fetchPortfolioInformation$ - date picker is present but absolute date is missing', done => {
        //     savedPortfolio.datePicker.date = undefined;
        //     jest.spyOn(service, 'fetchPortInfoAndCallForComposition$').mockReturnValue(of(updatedPort));
        //     jest.spyOn(favoriteServiceStub, 'getFavorite$').mockReturnValue(of(savedPortfolio));
        //     jest.spyOn(CalendarDateUtils, 'getDateInFormat');
        //     jest.spyOn(ruleBasedPort, 'deserialize');
        //     service.fetchPortfolioInformation$(ruleBasedPort).subscribe(payload => {
        //         expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledWith(126, 'Loading What-if');
        //         expect(CalendarDateUtils.getDateInFormat).toHaveBeenCalledTimes(0);
        //         expect(dateServiceStub.parseDateString$).toHaveBeenCalledTimes(0);
        //         expect(ruleBasedPort.deserialize).toHaveBeenCalledWith(savedPortfolio.serialize());
        //         expect(service.fetchPortInfoAndCallForComposition$).toHaveBeenCalledWith(ruleBasedPort, true, undefined, undefined, undefined, undefined);
        //         expect(payload === updatedPort).toBeTruthy();
        //         done();
        //     });
        // });

        it('Test fetchPortfolioInformation$ - saved (what-if) portfolio is benchmark', done => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            ruleBasedPort.isBench = true;
            jest.spyOn(service, 'fetchPortInfoAndCallForComposition$').mockReturnValue(of(updatedPort));
            jest.spyOn(favoriteServiceStub, 'getFavorite$').mockReturnValue(of(savedPortfolio));
            jest.spyOn(CalendarDateUtils, 'getDateInFormat');
            jest.spyOn(savedPortfolio, 'deserialize');
            ruleBasedPort.datePicker = new DateValue({
                date: '01/01/2020',
                calCode: 'GreenPkg',
                dateStringValue: '',
                dateString: false
            });
            service.fetchPortfolioInformation$(ruleBasedPort, {isLightVersion: true, includeMandate: true}).subscribe(payload => {
                expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledWith(126, 'Loading What-if');
                expect(savedPortfolio.deserialize).toHaveBeenCalledWith(ruleBasedPort.serialize());
                expect(savedPortfolio.isBench).toBeTruthy();
                expect(service.fetchPortInfoAndCallForComposition$).toHaveBeenCalledWith(savedPortfolio, {isLightVersion: true, includeMandate: true}, undefined, undefined, undefined, undefined);
                expect(payload === updatedPort).toBeTruthy();
                done();
            });
        });
    });

    it('Test loadCompositionDataBased OnPortType$ - for what if portfolio (non-bench)', done => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const whatIfPort: Portfolio = new WhatIfPortfolio('', new DateValue());
        whatIfPort.isBench = false;
        const compositionData: ExploreResponseConfig & { data: ResponseData } = {data: {data: []}};
        jest.spyOn(compositionDataServiceStub, 'fetchHoldingChangesFollowedByCompositionData$').mockReturnValue(of(compositionData));
        service.loadCompositionDataBasedOnPortType$(whatIfPort).subscribe(payload => {
            expect(payload.equals(whatIfPort)).toBeTruthy();
            expect(compositionDataServiceStub.fetchDefaultCompositionBreakdown$).toHaveBeenCalledWith(whatIfPort);
            expect((payload as WhatIfPortfolio).composition === compositionData).toBeTruthy();
            done();
        });
    });

    it('Test loadCompositionDataBasedOnPortType$ - for rule based portfolio', done => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const holdingChanges: HoldingChangeResponse = new HoldingChangeResponse();
        const whatIfPort: Portfolio = new RulesBasedPortfolio('', '', new DateValue());
        whatIfPort.isBench = true;
        jest.spyOn(compositionDataServiceStub, 'fetchHoldingChangesForRules$').mockReturnValue(of(holdingChanges));
        jest.spyOn(compositionDataServiceStub, 'addHoldingChangesToPort').mockImplementation(() => {
        });
        service.loadCompositionDataBasedOnPortType$(whatIfPort).subscribe(payload => {
            expect(payload.equals(whatIfPort)).toBeTruthy();
            expect(compositionDataServiceStub.fetchDefaultCompositionBreakdown$).not.toHaveBeenCalled();
            expect(compositionDataServiceStub.fetchHoldingChangesForRules$).toHaveBeenCalledWith(whatIfPort);
            expect(compositionDataServiceStub.addHoldingChangesToPort).toHaveBeenCalledWith(holdingChanges, whatIfPort);
            done();
        });
    });

    it('test addPortInfoAndInitializePortfolio', () => {
        const port: Portfolio = new Portfolio('LEH_AGG', new DateValue({date: '01/10/2020'}));
        port.portId = '123';
        port.portfolioDefaults = new PortfolioDefaults();
        port.portfolioDefaults.calendar = 'GreenPkg';
        port.isBench = true;
        const portInfo: any = {
            ticker: 'LEH_AGG_AP',
            portfolioDefaults: {
                calendar: 'LN'
            }
        };
        service.addPortInfoAndInitializePortfolio(portInfo, port);
        expect(port.portName).toBe('LEH_AGG');
        expect(port.portId).toBe('123');
        expect(port.datePicker.calCode).toBe('LN');

        portInfo.portfolioDefaults.calendar = 'GreenPkg';
        service.addPortInfoAndInitializePortfolio(portInfo, port);
        expect(port.datePicker.calCode).toBe('LN');

    });

    it('test getPortfolioCusipData', fakeAsync(() => {
        jest.spyOn(httpServiceStub, 'post$').mockReturnValue(
            of({
                data: {
                    port1: 'brs123'
                }
            } as any)
        );
        service.getPortfolioCusipData$(['port1']).subscribe(
            (data) => {
                expect(data).toEqual({
                    port1: 'brs123'
                });
            }
        );
        tick();
        // When no data is returned
        jest.spyOn(httpServiceStub, 'post$').mockReturnValue(
            of({} as any)
        );
        service.getPortfolioCusipData$(['port1']).subscribe(
            (data) => {
                expect(data).toEqual({});
            }
        );
        tick();
        // In Case of error
        jest.spyOn(httpServiceStub, 'post$').mockImplementation((arg?: any) => {
            return throwError(new Error('Error'));
        });
        expect(service.getPortfolioCusipData$(['port1']).toPromise()).rejects.toThrow(
            'Error'
        );
        tick();
    }));

    describe('Test fetchPortInfoAndCallForComposition$', () => {
        it('calls fetchBenchmarkCompositionData$ to fetch benchmark composition', done => {
            jest.restoreAllMocks();
            const benchPortWithComposition: RulesBasedPortfolio = new RulesBasedPortfolio('Bench PEP');
            const portWithWhatIfBench: Portfolio = new Portfolio('CORE-HQ', new DateValue({date: '05/09/2018'}));
            portWithWhatIfBench.benchmark = new Benchmark({name: 'Bench PEP'});
            portWithWhatIfBench.benchmark.portfolio = new RulesBasedPortfolio('PEP', 'Rule Based PEP 1', new DateValue({date: '05/09/2018'}));
            portWithWhatIfBench.benchmark.portfolio.id = 126;
            portWithWhatIfBench.benchmark.portfolio.isBench = true;
            jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue({});
            jest.spyOn(service, 'fetchPortfolioInformation$').mockReturnValue(of(benchPortWithComposition));
            jest.spyOn(service, 'fetchBenchmarkCompositionData$');
            service.fetchPortInfoAndCallForComposition$(portWithWhatIfBench, {isLightVersion: true, includeMandate: true}).subscribe(payload => {
                expect(service.fetchBenchmarkCompositionData$).toHaveBeenCalledWith(portWithWhatIfBench);
                expect(service.fetchPortfolioInformation$).toHaveBeenCalledTimes(1);
                expect(portWithWhatIfBench.benchmark.portfolio === benchPortWithComposition).toBeTruthy();
                done();
            });
        });

        it('tests fetchBenchmarkCompositionData$ - port and what-if-bench port have same ticker', () => {
            const port: Portfolio = new Portfolio('PEP');
            const bench: Benchmark = new Benchmark({name: 'PEP'});
            bench.portfolio = new WhatIfPortfolio('PEP');
            bench.portfolio.id = 126;
            port.benchmark = bench;

            jest.spyOn(service, 'fetchPortfolioInformation$');
            jest.spyOn(service['notificationService'], 'openDialog').mockImplementation(() => {
            });
            service.fetchBenchmarkCompositionData$(port);
            expect(service.fetchPortfolioInformation$).toHaveBeenCalledTimes(0);
            expect(service['notificationService'].openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.INVALID_BENCHMARK,
                AlertConstants.BODY.INVALID_BENCHMARK_TICKER,
                AlertConstants.BTN.OK,
                null,
                null,
                expect.anything()));
        });
    });

    describe('Test publish state', () => {
        it('Test publish state is fetched when calling fetchPortInfoAndCallForComposition$', done => {
            jest.restoreAllMocks();
            jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue(null);
            jest.spyOn(service, 'fetchPortfolioInfoObject$').mockReturnValue(of(new Portfolio('PEP')));
            jest.spyOn(service, 'loadCompositionDataBasedOnPortType$').mockReturnValue(of(new Portfolio('PEP')));
            jest.spyOn(publishStateServiceStub, 'fetchPublishedState$');
            service.fetchPortInfoAndCallForComposition$(new Portfolio('PEP', new DateValue()), false).subscribe(payload => {
                expect(publishStateServiceStub.fetchPublishedState$).toHaveBeenCalled();
                done();
            });
        });

        it('Test publish state is fetched when calling fetchPortInfoAndCallForComposition$ even when data is present in cache but its first load', done => {
            jest.restoreAllMocks();
            jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue({});
            jest.spyOn(service, 'fetchPortfolioInfoObject$').mockReturnValue(of(new Portfolio('PEP')));
            jest.spyOn(service, 'loadCompositionDataBasedOnPortType$').mockReturnValue(of(new Portfolio('PEP')));
            jest.spyOn(publishStateServiceStub, 'fetchPublishedState$');
            service.fetchPortInfoAndCallForComposition$(new Portfolio('PEP', new DateValue()), {isLightVersion: false, includeMandate: true}).subscribe(payload => {
                expect(publishStateServiceStub.fetchPublishedState$).toHaveBeenCalled();
                done();
            });
        });
        //
        it('Test publish state is not called when calling fetchPortInfoAndCallForComposition$ when data is present in cache and its nit first load', done => {
            jest.restoreAllMocks();
            jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue({});
            const port = new Portfolio('PEP', new DateValue());
            port.publishStateWrapperSubject$.getValue().isFirstLoad = false;
            jest.spyOn(service, 'fetchPortfolioInfoObject$').mockReturnValue(of(port));

            jest.spyOn(service, 'loadCompositionDataBasedOnPortType$').mockReturnValue(of(port));
            jest.spyOn(publishStateServiceStub, 'fetchPublishedState$');
            service.fetchPortInfoAndCallForComposition$(port, {isLightVersion: false, includeMandate: true}).subscribe(payload => {
                expect(publishStateServiceStub.fetchPublishedState$).not.toHaveBeenCalled();
                done();
            });
        });

        it('Test publish state is not called when calling fetchPortInfoAndCallForComposition$ for bench ports', done => {
            jest.restoreAllMocks();
            jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue(null);
            const port = new Portfolio('PEP', new DateValue());
            port.isBench = true;
            jest.spyOn(service, 'fetchPortfolioInfoObject$').mockReturnValue(of(port));
            jest.spyOn(service, 'loadCompositionDataBasedOnPortType$').mockReturnValue(of(port));
            jest.spyOn(publishStateServiceStub, 'fetchPublishedState$');
            service.fetchPortInfoAndCallForComposition$(port, {isLightVersion: false, includeMandate: true}).subscribe(payload => {
                expect(publishStateServiceStub.fetchPublishedState$).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('notifyIfPortWithPosBenchOnSameDate tests', () => {
        it('test notifyIfPortWithPosBenchOnSameDate - port with positions benchmark | same date', () => {
            jest.spyOn(service['notificationService'], 'openDialog');
            const portWithPositionsBench: PortfolioWithPositions = new PortfolioWithPositions('abc');
            portWithPositionsBench.date = '05/09/2018';
            expect(service.isValidWhatIfBench(new Portfolio('abc', new DateValue({date: '05/09/2018'})), portWithPositionsBench)).toBeTruthy();
            expect(service['notificationService'].openDialog).not.toHaveBeenCalled();
        });

        it('test notifyIfPortWithPosBenchOnSameDate - port with positions benchmark | different date', () => {
            jest.spyOn(service['notificationService'], 'openDialog');
            const portWithPositionsBench: PortfolioWithPositions = new PortfolioWithPositions('abc');
            portWithPositionsBench.date = '05/08/2018';
            expect(service.isValidWhatIfBench(new Portfolio('abc', new DateValue({date: '05/09/2018'})), portWithPositionsBench)).toBeFalsy();
            expect(service['notificationService'].openDialog).toHaveBeenCalled();
        });

        it('test notifyIfPortWithPosBenchOnSameDate - regular port benchmark | same date', () => {
            jest.spyOn(service['notificationService'], 'openDialog');
            expect(service.isValidWhatIfBench(new Portfolio('abc', new DateValue({date: '05/09/2018'})), new Portfolio('abc'))).toBeTruthy();
            expect(service['notificationService'].openDialog).not.toHaveBeenCalled();
        });
    });

    it('should call chain fetchPortfolioInfoObject$ with the correct date if the initial date is wrong', (done) => {
        jest.restoreAllMocks();
        const date = new DateValue({date: '01/01/2021'});
        date.dateStringValue = 'T-1';
        portfolio = new Portfolio('PEP', date);
        jest.spyOn(service['httpService'], 'post$').mockReturnValue(of({'data': portMockJson}));
        jest.spyOn(PortfolioStore, 'getPortfolioInfoFromCache').mockReturnValue(null);
        jest.spyOn(service, 'fetchPortfolioInfoObject$');
        jest.spyOn(service['dateservice'], 'parseDateString$').mockReturnValue(of(new Date('12/31/2020')));
        jest.spyOn(CalendarDateUtils, 'getCalendarByCode').mockReturnValue(new Calendar({
            calendarCode: 'GP_HK_STD',
            calendarName: 'HK_STD'
        }));

        service.fetchPortInfoAndCallForComposition$(portfolio, {isLightVersion: true, includeMandate: true}).subscribe(() => {
            jest.spyOn(service['dateservice'], 'parseDateString$').mockReturnValue(of(new Date('12/31/2020')));
            expect(service.fetchPortfolioInfoObject$).toHaveBeenCalledTimes(2);
            done();
        });
    });

    const verifyFunc: Function = (response: Portfolio, portfolioInput: Portfolio, cacheKey: PortfolioCacheKey) => {
        expect(response instanceof Portfolio).toBeTruthy();
        expect(response === portfolioInput).toBeTruthy();
        expect(response.portName === 'PEP').toBeTruthy();
        expect(PortfolioStore.getPortfolioInfoFromCache(cacheKey)).toEqual(portMockJson);
    };
});
