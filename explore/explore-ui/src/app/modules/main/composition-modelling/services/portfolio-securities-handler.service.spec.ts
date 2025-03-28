import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import * as compositionDataMock from '@mocks/compositionData/compositionDataMock.json';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';
import {RuleUnit} from '@enums/rule-unit.enum';
import {HttpParams} from '@angular/common/http';
import {of} from 'rxjs';
import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';
import {TestBed} from '@angular/core/testing';
import {Http2BmsService} from '@services/bms';
import {NotificationService} from '@services/notification';
import {PortfolioSecuritiesHandlerService} from './portfolio-securities-handler.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {ErrorTypeConstants, UIErrorParameters} from "@blk/explore-ui-core";

describe('PortfolioSecuritiesHandlerService', () => {
    let service: PortfolioSecuritiesHandlerService;

    const httpServiceStub = {
        post$: jest.fn()
    };

    const notificationServiceStub = {
        error: jest.fn()
    };

    const cachingServiceStub = {
        addDataToCache: jest.fn(),
        getDataFromCache$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: ExploreCachingService, useValue: cachingServiceStub}
            ]
        });
        service = TestBed.inject(PortfolioSecuritiesHandlerService);
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    let httpSpy = null;
    let cacheServiceSpy = null;
    let cacheServiceAddSpy = null;

    describe('fetchHoldingChangesForPortSecuritiesRules$ Tests', () => {
        const whatIfPortfolio: PortfolioWithPositions = new PortfolioWithPositions('portfolio', {date: '09/04/2018'} as any);
        whatIfPortfolio.composition = JSON.parse(JSON.stringify(compositionDataMock));
        let initialMock = JSON.parse(JSON.stringify(compositionDataMock));
        let portSecuritiesRules: BaseRule[] = [
            new PortfolioSecuritiesRule({
                lineItem: 'portfolio2',
                newWeight: 10,
                ruleUnit: RuleUnit.MARKET_VALUE
            })
        ];

        const reqObject = {
            'portfolio': 'portfolio2',
            'forDate': '09/04/2018',
            'dataFormat': 'COMPACT_JSON',
            'isSectorView': 'Y',
            'columns': [
                {
                    'columnTag': 'market_val',
                    'positionColumnType': 'PORT'
                }
            ]
        };

        // callback for scenario 1 & 1.2
        const commonCallBackExcerpt = (holdingChangesResponse, done) => {
            expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(5);
            expect(holdingChangesResponse.data.children[holdingChangesResponse.data.children.length - 2].data)
                .toEqual(['portfolio2', null, null, 0.1, 0.1, null, 11779947.740246, 11779947.740246, null, 0.1, 0.1, null, 11779947.740246, 11779947.740246, null, null, null]);
            expect(holdingChangesResponse.data.children[holdingChangesResponse.data.children.length - 1].data)
                .toEqual(['Cash Offset', null, null, -0.1, -0.1, null, -11779947.740246, -11779947.740246, null, -0.1, -0.1, null, -11779947.740246, -11779947.740246, null, null, null]);
            done();
        };

        it('tests fetchHoldingChangesForPortSecuritiesRules$ - NAV% contribution', done => {
            // scenario 1 - non-zero rule with existing position data
            httpSpy = jest.spyOn(httpServiceStub, 'post$');
            cacheServiceSpy = jest.spyOn(cachingServiceStub, 'getDataFromCache$');

            httpSpy
                .mockImplementation((command, payload) => {
                    if (command === 'portfolioInfo') {
                        if (payload.portfolio === 'portfolio') {
                            return of({
                                data: {
                                    ticker: 'portfolio',
                                    portfolios: [{ticker: 'GALIC-106'}, {ticker: 'FFH-FIT'}]
                                }
                            });
                        } else if (payload.portfolio === 'portfolio2') {
                            return of({data: {ticker: 'portfolio2'}});
                        }
                    } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                        return of({data: {data: {data: [1234]}}});
                    }
                });

            cacheServiceSpy
                .mockReturnValueOnce(of({data: {data: {data: {data: [1234]}}}}));

            service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules)
                .subscribe(holdingChangesResponse => {
                    expect(httpSpy).not.toHaveBeenCalledWith('getPrismData', reqObject, expect.any(HttpParams));
                    commonCallBackExcerpt(holdingChangesResponse, done);
                });
        });

        describe('tests fetchHoldingChangesForPortSecuritiesRules$ on common http response', () => {
            httpSpy = jest.spyOn(httpServiceStub, 'post$');
            cacheServiceSpy = jest.spyOn(cachingServiceStub, 'getDataFromCache$');

            httpSpy
                .mockImplementation((command, payload) => {
                    if (command === 'portfolioInfo') {
                        if (payload.portfolio === 'portfolio2') {
                            return of({data: {ticker: 'portfolio2'}});
                        }
                    } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                        return of({data: {data: {data: [1234]}}});
                    }
                });

            cacheServiceSpy
                .mockReturnValueOnce(of({data: {data: {data: {data: [1234]}}}}));

            it('tests fetchHoldingChangesForPortSecuritiesRules$ - NAV contribution', done => {
                // scenario 1.2 - non-zero rule with existing position data, but this has NAV instead of NAV%
                // Given the new weight provided, it should yield the same record as in previous case with NAV%
                whatIfPortfolio.holdingChanges = [new PortfolioSecuritiesHoldingChange()];
                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, [
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio2',
                        newWeight: 11779947.740246,
                        ruleUnit: RuleUnit.NOTIONAL_MV
                    })
                ]).subscribe(holdingChangesResponse => {
                    expect(httpSpy).not.toHaveBeenCalledWith('getPrismData', reqObject, expect.any(HttpParams));
                    commonCallBackExcerpt(holdingChangesResponse, done);
                });
            });

            it('tests fetchHoldingChangesForPortSecuritiesRules$ 2', done => {
                // change the weight from 10 to 5
                portSecuritiesRules[0].newWeight = 5;
                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(2);
                    expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(5);
                    done();
                });
            });

            it('tests fetchHoldingChangesForPortSecuritiesRules$ 3', done => {
                // change the weight to 0
                portSecuritiesRules[0].newWeight = 0;
                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(2);
                    expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(0);
                    done();
                });
            });

            it('tests fetchHoldingChangesForPortSecuritiesRules$ 4', done => {
                // scenario 2 - zero weight rule with existing position data
                whatIfPortfolio.composition = JSON.parse(JSON.stringify(compositionDataMock));
                portSecuritiesRules = [
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio2',
                        newWeight: 0,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    })
                ];

                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(2);
                    expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(0);
                    done();
                });
            });
        });

        it('tests fetchHoldingChangesForPortSecuritiesRules$ 5 - refreshCacheResponse true', done => {
            // scenario 3 - non-zero weight with no position data
            httpSpy = jest.spyOn(httpServiceStub, 'post$');
            cacheServiceSpy = jest.spyOn(cachingServiceStub, 'getDataFromCache$');
            cacheServiceAddSpy = jest.spyOn(cachingServiceStub, 'addDataToCache');

            httpSpy
                .mockImplementation((command, payload) => {
                    if (command === 'portfolioInfo') {
                        if (payload.portfolio === 'portfolio2') {
                            return of({data: {ticker: 'portfolio2'}});
                        }
                    } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                        return of({data: {data: {data: [null]}}});
                    }
                });

            whatIfPortfolio.composition = JSON.parse(JSON.stringify(compositionDataMock));
            portSecuritiesRules = [
                new PortfolioSecuritiesRule({
                    lineItem: 'portfolio2',
                    newWeight: 5,
                    ruleUnit: RuleUnit.MARKET_VALUE
                })
            ];

            service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules, true).subscribe(holdingChangesResponse => {
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(4);
                expect(notificationServiceStub.error).toHaveBeenLastCalledWith('portfolio2 does not have position data for the given date', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ADD_RECORDS_FOR_PORTFOLIO_SECURITIES_ERROR, true);
                expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(0);
                done();
            });
        });

        describe('tests the check for adding portfolio securities records - cyclic dependencies', () => {
            it('tests when next portfolio has an underlying portfolio, added already', done => {
                whatIfPortfolio.holdingChanges = [new PortfolioSecuritiesHoldingChange()];

                portSecuritiesRules = [
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio2',
                        newWeight: 5,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    }),
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio3',
                        newWeight: 3,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    })
                ];

                httpSpy = jest.spyOn(httpServiceStub, 'post$');
                cacheServiceSpy = jest.spyOn(cachingServiceStub, 'getDataFromCache$');

                httpSpy
                    .mockImplementation((command, payload) => {
                        if (command === 'portfolioInfo') {
                            if (payload.portfolio === 'portfolio3') {
                                return of({
                                    data: {
                                        ticker: 'portfolio3',
                                        portfolios: [{ticker: 'portfolio2'}]
                                    }
                                });
                            } else if (payload.portfolio === 'portfolio2') {
                                return of({data: {ticker: 'portfolio2'}});
                            }
                        } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                            return of({data: {data: {data: [1234]}}});
                        }
                    });

                cacheServiceSpy
                    .mockReturnValue(of({data: {data: {data: {data: [1234]}}}}));

                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(5);
                    expect(notificationServiceStub.error).toHaveBeenLastCalledWith('Cyclic dependencies found in: portfolio3', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR, true);
                    expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(5);
                    done();
                });
            });

            it('tests when next portfolio is an underlying portfolio of an added portfolio', done => {
                whatIfPortfolio.holdingChanges = [new PortfolioSecuritiesHoldingChange()];
                whatIfPortfolio.portToUnderLyingPortsMap.delete('portfolio2');
                whatIfPortfolio.composition = JSON.parse(JSON.stringify(compositionDataMock));

                initialMock = JSON.parse(JSON.stringify(compositionDataMock));

                portSecuritiesRules = [
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio3',
                        newWeight: 3,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    }),
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio2',
                        newWeight: 5,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    })
                ];

                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules, true).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(9);
                    expect(notificationServiceStub.error).toHaveBeenLastCalledWith('Cyclic dependencies found in: portfolio2', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR, true);
                    expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(5);
                    done();
                });
            });

            it('tests when next portfolio is not found - does not have portfolio info', done => {
                whatIfPortfolio.holdingChanges = [new PortfolioSecuritiesHoldingChange()];
                whatIfPortfolio.portToUnderLyingPortsMap.delete('portfolio3');
                whatIfPortfolio.composition = JSON.parse(JSON.stringify(compositionDataMock));

                initialMock = JSON.parse(JSON.stringify(compositionDataMock));

                httpSpy = jest.spyOn(httpServiceStub, 'post$');
                httpSpy
                    .mockImplementation((command, payload) => {
                        if (command === 'portfolioInfo') {
                            if (payload.portfolio === 'portfolio2') {
                                return of({data: null, message: 'test msg error'});
                            }
                        } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                            return of({data: {data: {data: [null]}}});
                        }
                    });

                portSecuritiesRules = [
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio2',
                        newWeight: 5,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    })
                ];

                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules, true).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(11);
                    expect(notificationServiceStub.error).toHaveBeenLastCalledWith('test msg error: portfolio2', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR, true);
                    expect(holdingChangesResponse.data.children.length).toEqual(initialMock.data.children.length);
                    done();
                });
            });

            it('tests when next portfolio is top level portfolio itself', done => {
                whatIfPortfolio.holdingChanges = [new PortfolioSecuritiesHoldingChange()];

                httpSpy = jest.spyOn(httpServiceStub, 'post$');
                httpSpy
                    .mockImplementation((command, payload) => {
                        if (command === 'portfolioInfo') {
                            if (payload.portfolio === 'portfolio') {
                                return of({data: {ticker: 'portfolio'}});
                            }
                        } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                            return of({data: {data: {data: [12345]}}});
                        }
                    });

                portSecuritiesRules = [
                    new PortfolioSecuritiesRule({
                        lineItem: 'portfolio',
                        newWeight: 5,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    })
                ];

                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(11);
                    expect(notificationServiceStub.error).toHaveBeenLastCalledWith('Cyclic dependencies found in: portfolio', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_NOTIFY_ON_BAD_PORT_SECURITIES_ERROR, true);
                    expect(holdingChangesResponse.data.children.length).toEqual(initialMock.data.children.length);
                    done();
                });
            });

            it('tests when next portfolio is already part of top level portfolio', done => {
                whatIfPortfolio.holdingChanges = [new PortfolioSecuritiesHoldingChange()];

                httpSpy = jest.spyOn(httpServiceStub, 'post$');
                httpSpy
                    .mockImplementation((command, payload) => {
                        if (command === 'portfolioInfo') {
                            if (payload.portfolio === 'GALIC-106') {
                                return of({data: {ticker: 'GALIC-106'}});
                            }
                        } else if (command === DataRequestConstants.DATA_REQUEST_URL.BASE) {
                            return of({data: {data: {data: [12345]}}});
                        }
                    });

                portSecuritiesRules = [
                    new PortfolioSecuritiesRule({
                        lineItem: 'GALIC-106',
                        newWeight: 5,
                        ruleUnit: RuleUnit.MARKET_VALUE
                    })
                ];

                service.fetchHoldingChangesForPortSecuritiesRules$(whatIfPortfolio, portSecuritiesRules).subscribe(holdingChangesResponse => {
                    expect(httpServiceStub.post$).toHaveBeenCalledTimes(12);
                    expect(holdingChangesResponse.data.children.length - initialMock.data.children.length).toEqual(5);
                    done();
                });
            });

            it('tests getLeafLevelPortNamesForPortData', done => {
                const underlyingPortNames = new Set<string>();
                const portData = [
                    {
                        ticker: 'PORT-R',
                        portfolios: [
                            {
                                ticker: 'PORT-A'
                            },
                            {
                                ticker: 'PORT-B'
                            }
                        ]
                    },
                    {
                        ticker: 'PORT-Q',
                        portfolios: [
                            {
                                ticker: 'PORT-C'
                            }
                        ]
                    }
                ];
                service.getLeafLevelPortNamesForPortData(portData, underlyingPortNames);
                expect(underlyingPortNames.size).toEqual(3);
                expect(underlyingPortNames.has('PORT-R')).toBeFalsy();
                expect(underlyingPortNames.has('PORT-Q')).toBeFalsy();
                done();
            });
        });
    });
});
