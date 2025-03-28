import {TestBed} from '@angular/core/testing';
import {ExploreResponseConfig} from '@interfaces/response.interface';
import {Http2BmsService} from '@services/bms';
import {CompositionDataService} from './composition-data.service';
import {FavoriteService} from '@services/favorite';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {of} from 'rxjs';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import * as ruleBasePortMock from '@mocks/ruleBasedPortfolio1.json';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {RuleFactory} from '../../../../factories/rule.factory';
import {CompositionConstants} from '@constants/composition.constants';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {HoldingChangeFactory} from '../../../../factories/holding-change.factory';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {Breakdown, BreakdownInitializer, ColumnSector} from '@blk/explore-ui-breakdown';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {CompositionUtils} from '@utils/composition.utils';
import {BeforeAfterDataRequestPayload} from '@interfaces/before-after-data-request-payload.interface';
import {HoldingChangeResponse} from '@models/portfolio/composition/holding-change-response.model';
import {HttpParams} from '@angular/common/http';
import {HttpUtils} from '@utils/http.utils';
import {IndexWeight} from '@models/portfolio/index-weight.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {
    AbstractConfig,
    ColumnConstants,
    CoreUserMetaDataStore,
    DateValue,
    FavoriteType,
    ResponseData,
    UserMetaData
} from '@blk/explore-ui-core';
import {NotificationService} from '@services/notification';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';

describe('CompositionDataService', () => {
    let service: CompositionDataService;

    const httpServiceStub = {
        post$: jest.fn()
    };

    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    const notificationServiceStub = {
        warning: jest.fn()
    };

    const serializeBeforeAfterPayload: BeforeAfterDataRequestPayload = {
        type: 'composition',
        portfolio: 'IP',
        benchmark: 'BUSAGGCOVF',
        benchSelection: 'RISK',
        benchOrder: 1,
        forDate: '03/09/2016',
        currency: 'USD',
        columns: [
            {
                columnTag: 'cusip',
                columnKey: 'cusip',
                positionColumnType: 'ALL',
                identifierColumn: true
            },
            {
                columnTag: 'security_description',
                columnKey: 'sec_desc',
                positionColumnType: 'ALL',
                optionValues: {
                    secDescDisplay: undefined
                }
            },
            {
                columnTag: 'pct_mv',
                columnKey: 'pct_mv',
                positionColumnType: 'PORT'
            },
            {
                columnTag: 'notional_mv',
                columnKey: 'notional_mv',
                positionColumnType: 'PORT'
            },
            {
                columnTag: 'pct_notional_val',
                columnKey: 'pct_notional_val',
                positionColumnType: 'PORT'
            },
            {
                columnTag: 'market_val',
                columnKey: 'market_val',
                positionColumnType: 'PORT'
            },
            {
                columnTag: 'quantity',
                columnKey: 'quantity',
                positionColumnType: 'PORT'
            },
            {
                'columnKey': 'cur_face',
                'columnTag': 'cur_face',
                'positionColumnType': 'PORT'
            }
        ],
        breakdownTree: JSON.stringify({breakdown:{breakdownTitle:'Security Group',subSectors:[{breakdownRuleType:'String',groupByColumn:{columnName:'Security Group',columnTag:'sec_group',positionColumnType:'ALL'},useNoneBuckets:true}]},title:'Security Group'}),
        holidayCalendar: 'GreenPkg',
        isSectorView: 'N',
        isRiskFactorRequest: 'N',
        isPortGroupSummaryRequest: 'N',
        isFullySpecifiedPortfolio: 'N',
        includeAliasPortfolios: false,
        holdingChanges: [],
        benchmarkHoldingChanges: [],
        adhocParams: undefined,
        dataFormat: 'COMPACT_JSON',
        splitPositionTypes: '',
        normalizedWidgetFilter: true,
        filter: JSON.stringify({breakdown:{subSectors: [{breakdownRuleType: 'CustomSector',includeOtherBucket:true,rule:{colPositionColumnType:'ALL',colTag:'sec_group',colTitle:'Security Group',colType: 'STRING',compType:'Does Not Equal',compValues:['FUND'],customSectorType:'Attributes',ruleType:'Rule',includeNullValues:false}
        ,title:'Custom Sector'}]}})
    };

    const serializedBeforeAfterPayload2: BeforeAfterDataRequestPayload = {
        type: 'composition',
        portfolio: 'IP',
        benchmark: 'BUSAGGCOVF',
        benchSelection: 'RISK',
        benchOrder: 1,
        forDate: '03/09/2016',
        currency: 'USD',
        columns: [
            {
                columnTag: 'portfolio_name',
                columnKey: 'portfolio_name',
                positionColumnType: 'ALL',
                identifierColumn: true
            },
            {
                columnTag: 'port_full_name',
                positionColumnType: 'ALL',
                columnKey: 'port_full_name'
            },
            {
                columnTag: 'nav_group',
                columnKey: 'nav_group',
                positionColumnType: 'PORT'
            },
            {
                columnTag: 'pct_nav_group',
                columnKey: 'pct_nav_group',
                positionColumnType: 'PORT'
            }
        ],
        breakdownTree: undefined,
        holidayCalendar: 'GreenPkg',
        isSectorView: 'N',
        isRiskFactorRequest: 'N',
        isPortGroupSummaryRequest: 'N',
        isFullySpecifiedPortfolio: 'N',
        includeAliasPortfolios: false,
        holdingChanges: [],
        benchmarkHoldingChanges: [],
        adhocParams: undefined,
        dataFormat: 'COMPACT_JSON',
        splitPositionTypes: '',
        normalizedWidgetFilter: true,
        filter: JSON.stringify({breakdown:{subSectors:[{breakdownRuleType:'CustomSector',includeOtherBucket:true,rule:{colPositionColumnType:'ALL',colTag:'sec_group',colTitle:'Security Group',colType:'STRING',compType:'Does Not Equal',compValues:['FUND'],customSectorType:'Attributes',ruleType:'Rule',includeNullValues:false},
        title:'Custom Sector'}]}})
    };

    beforeAll(() => {
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.SECTOR, SectorRule);
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });
        service = TestBed.inject(CompositionDataService);
    });

    beforeEach(() => {
        jest.restoreAllMocks();
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    const httpSpy = jest.spyOn(httpServiceStub, 'post$');
    const favSpy = jest.spyOn(favoriteServiceStub, 'getFavorite$');

    it('tests fetchHoldingChangesFollowedByCompositionData$', done => {
        const holdingChanges: HoldingChangeResponse = new HoldingChangeResponse();
        const compositionData: ExploreResponseConfig & { data: ResponseData } = {data: {data: []}};
        const whatIfPortfolio: WhatIfPortfolio = new WhatIfPortfolio();
        jest.spyOn(service, 'fetchHoldingChangesForRules$').mockReturnValue(of(holdingChanges));
        jest.spyOn(service, 'addHoldingChangesToPort').mockImplementation();
        jest.spyOn(service, 'fetchCompositionDataForColumns$').mockReturnValue(of(compositionData));
        service.fetchHoldingChangesFollowedByCompositionData$(whatIfPortfolio).subscribe(responseData => {
            expect(responseData === compositionData).toBeTruthy();
            expect(service.fetchHoldingChangesForRules$).toHaveBeenCalledTimes(1);
            expect(service.addHoldingChangesToPort).toHaveBeenCalledWith(holdingChanges, whatIfPortfolio);
            expect(service.fetchCompositionDataForColumns$).toHaveBeenCalledWith(whatIfPortfolio);
            done();
        });
    });

    it('tests fetchHoldingChangesForRules$ - error in response', done => {
        const whatIfPortfolio: WhatIfPortfolio = new WhatIfPortfolio();
        jest.spyOn(service, 'fetchHoldingChangesForRules$').mockReturnValue(of({
            data: null,
            status: 'failure',
            message: 'unable to run'
        } as any));
        service.fetchHoldingChangesForRules$(whatIfPortfolio).subscribe(() => {
                done();
            },
            error => expect(error).toEqual('unable to run'));
    });

    it('tests fetchHoldingChangesForRules$ - pre-mature exit - what if', done => {
        service.fetchHoldingChangesForRules$(new WhatIfPortfolio()).subscribe(holdingChangesResponse => {
            expect(httpServiceStub.post$).toHaveBeenCalledTimes(0);
            expect(holdingChangesResponse.skippedRules.length).toBe(0);
            expect(holdingChangesResponse.holdingChanges.length).toBe(0);
            done();
        });
    });

    it('tests fetchHoldingChangesForRules$ - pre-mature exit - rule based', done => {
        service.fetchHoldingChangesForRules$(new RulesBasedPortfolio()).subscribe(holdingChangesResponse => {
            expect(httpServiceStub.post$).toHaveBeenCalledTimes(0);
            expect(holdingChangesResponse.skippedRules.length).toBe(0);
            expect(holdingChangesResponse.holdingChanges.length).toBe(0);
            done();
        });
    });

    it('tests fetchHoldingChangesForRules$ - service hit', done => {
        const requestPayload: any = {};
        const ruleBasedPortfolio = new RulesBasedPortfolio();
        const params = new HttpParams();
        jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(params);
        ruleBasedPortfolio.deserialize(ruleBasePortMock);
        httpSpy.mockReturnValue(of({data: {skippedRules: [], holdingChanges: [{}]}}));
        jest.spyOn(service, 'getHoldingChangesForRulesRequestPayload').mockReturnValue(requestPayload);
        jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(new PortfolioHoldingChange());
        service.fetchHoldingChangesForRules$(ruleBasedPortfolio).subscribe(holdingChangesResponse => {
            expect(httpServiceStub.post$).toHaveBeenCalledWith('getHoldingChangesForRules', requestPayload, params);
            expect(HoldingChangeFactory.convertObjectToHoldingChange).toHaveBeenCalledTimes(1);
            expect(holdingChangesResponse.skippedRules.length).toBe(0);
            expect(holdingChangesResponse.holdingChanges.length).toBe(1);
            expect(holdingChangesResponse.holdingChanges[0] instanceof HoldingChange).toBeTruthy();
            done();
        });
    });

    it('tests fetchHoldingChangesForRules$ - error from server', done => {
        const requestPayload: any = {};
        const ruleBasedPortfolio = new AdhocPortfolio();
        const params = new HttpParams();
        jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(params);
        ruleBasedPortfolio.deserialize(ruleBasePortMock);
        httpSpy.mockReturnValue(of({status: 'Failure', message: '{\"SECURITIES_WITH_ASSET_VALIDATION_ERRORS\":[\"abc\"]}'}));
        jest.spyOn(service, 'getHoldingChangesForRulesRequestPayload').mockReturnValue(requestPayload);
        jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(new PortfolioHoldingChange());
        service.fetchHoldingChangesForRules$(ruleBasedPortfolio, [new SecurityRule('abc', 0)]).subscribe(holdingChangesResponse => {
            expect(httpServiceStub.post$).toHaveBeenCalledWith('getHoldingChangesForRules', requestPayload, params);
            expect(holdingChangesResponse.skippedRules.length).toBe(1);
            expect(holdingChangesResponse.holdingChanges.length).toBe(0);
            done();
        });
    });


    it('tests fetchHoldingChangesForRules$ - service hit - no holding changes', done => {
        const requestPayload: any = {};
        const ruleBasedPortfolio = new RulesBasedPortfolio();
        const params = new HttpParams();
        jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(params);
        ruleBasedPortfolio.deserialize(ruleBasePortMock);
        httpSpy.mockReturnValue(of({data: {skippedRules: [], holdingChanges: []}}));
        jest.spyOn(service, 'getHoldingChangesForRulesRequestPayload').mockReturnValue(requestPayload);
        jest.spyOn(HoldingChangeFactory, 'convertObjectToHoldingChange').mockReturnValue(new PortfolioHoldingChange());
        service.fetchHoldingChangesForRules$(ruleBasedPortfolio).subscribe(holdingChangesResponse => {
            expect(httpServiceStub.post$).toHaveBeenCalledWith('getHoldingChangesForRules', requestPayload, params);
            expect(HoldingChangeFactory.convertObjectToHoldingChange).toHaveBeenCalledTimes(0);
            expect(holdingChangesResponse.skippedRules.length).toBe(0);
            expect(holdingChangesResponse.holdingChanges.length).toBe(0);
            done();
        });
    });

    it('tests fetchCompositionDataForColumns$', done => {
        const params = new HttpParams();
        jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(params);
        const requestPayload: any = {};
        const whatIfPortfolio: WhatIfPortfolio = new WhatIfPortfolio();
        whatIfPortfolio.portName = 'portfolio';
        const responseData: any = {};
        httpSpy.mockReturnValue(of({data: responseData}));
        jest.spyOn(service, 'getBeforeAfterDataRequestPayload').mockReturnValue(requestPayload);
        service.fetchCompositionDataForColumns$(whatIfPortfolio).subscribe(compositionData => {
            expect(compositionData === responseData).toBeTruthy();
            expect(service.getBeforeAfterDataRequestPayload).toHaveBeenCalledWith(whatIfPortfolio);
            expect(httpServiceStub.post$).toHaveBeenCalledWith('getBeforeAfterData', requestPayload, params);
            done();
        });
    });

    it('tests fetchCompositionDataForColumns$ - composite portfolio with portfolio modelling', done => {
        jest.clearAllMocks();
        const params = new HttpParams();
        jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage').mockReturnValue(params);
        const requestPayload: any = {};
        const whatIfPortfolio: WhatIfPortfolio = new WhatIfPortfolio();
        whatIfPortfolio.portName = 'portfolio';
        whatIfPortfolio.isCompositePortfolio = true;
        const responseData2: any = {};
        httpSpy.mockReturnValue(of({data: responseData2}));
        jest.spyOn(service, 'getBeforeAfterDataRequestPayload').mockReturnValue(requestPayload);
        jest.spyOn(service, 'transformCompositionDataForComposite').mockReturnValue(responseData2);
        service.fetchCompositionDataForColumns$(whatIfPortfolio).subscribe(compositionData => {
            expect(compositionData === responseData2).toBeTruthy();
            expect(service.getBeforeAfterDataRequestPayload).toHaveBeenCalledWith(whatIfPortfolio);
            expect(service.transformCompositionDataForComposite).toHaveBeenCalledWith(whatIfPortfolio, responseData2);
            expect(httpServiceStub.post$).toHaveBeenCalledWith('getBeforeAfterData', requestPayload, params);
            done();
        });
    });

    it('tests fetchCompositionDataForColumns$ - no composition data', done => {
        const requestPayload: any = {};
        const whatIfPortfolio: WhatIfPortfolio = new WhatIfPortfolio();
        whatIfPortfolio.portName = 'portfolio';
        httpSpy.mockReturnValue(of({data: null}));
        jest.spyOn(service, 'getBeforeAfterDataRequestPayload').mockReturnValue(requestPayload);
        service.fetchCompositionDataForColumns$(whatIfPortfolio).subscribe(compositionData => {
            expect(compositionData && Object.keys(compositionData).length === 0).toBeTruthy();
            done();
        });
    });

    it('tests fetchDefaultCompositionBreakdown$ - breakdown already specified', done => {
        const rulesBasedPortfolio: RulesBasedPortfolio = new RulesBasedPortfolio();
        rulesBasedPortfolio.deserialize(ruleBasePortMock);
        service.fetchDefaultCompositionBreakdown$(rulesBasedPortfolio).subscribe(breakdown => {
            expect(rulesBasedPortfolio.compositionSetting.breakdownTree === breakdown).toBeTruthy();
            expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledTimes(0);
            done();
        });
    });

    it('tests fetchDefaultCompositionBreakdown$ - default breakdown', done => {
        const rulesBasedPortfolio: RulesBasedPortfolio = new RulesBasedPortfolio();
        rulesBasedPortfolio.mandateSettings = new MandateSettings();
        service.fetchDefaultCompositionBreakdown$(rulesBasedPortfolio).subscribe(favorite => {
            expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledTimes(0);
            const breakdown: Breakdown = favorite as Breakdown;
            expect(breakdown.title === 'Security Group').toBeTruthy();
            expect((breakdown.children[0] as ColumnSector).columnTag === 'sec_group').toBeTruthy();
            expect((breakdown.children[0] as ColumnSector).columnName === 'Security Group').toBeTruthy();
            expect((breakdown.children[0] as ColumnSector).positionColumnType === 'ALL').toBeTruthy();
            done();
        });
    });

    it('tests fetchDefaultCompositionBreakdown$ - fetches breakdown', done => {
        const breakdownToReturn: AbstractConfig = new Breakdown();
        const rulesBasedPortfolio: RulesBasedPortfolio = new RulesBasedPortfolio();
        rulesBasedPortfolio.mandateSettings = new MandateSettings();
        rulesBasedPortfolio.mandateSettings.settings.set(FavoriteType.BREAKDOWN, 'false;126');
        favSpy.mockReturnValue(of(breakdownToReturn));
        service.fetchDefaultCompositionBreakdown$(rulesBasedPortfolio).subscribe(breakdown => {
            expect(breakdown === breakdownToReturn).toBeTruthy();
            expect(favoriteServiceStub.getFavorite$).toHaveBeenCalledWith(126, null, false);
            done();
        });
    });

    it('tests addHoldingChangesToPort - has skipped rules', () => {
        const holdingChanges: HoldingChangeResponse = new HoldingChangeResponse({skippedRules: [new SecurityRule('a', 2)]});
        const whatIfPortfolio: WhatIfPortfolio = new RulesBasedPortfolio();
        const passedRules: BaseRule[] = [];
        whatIfPortfolio.datePicker = new DateValue({date: '09/05/2019'});
        jest.spyOn(whatIfPortfolio, 'setPassedRulesForEachDate').mockImplementation(() => {});
        jest.spyOn(CompositionUtils, 'calculatePassedRules').mockReturnValue(passedRules);
        jest.spyOn(whatIfPortfolio, 'addHoldingChanges');
        jest.spyOn(whatIfPortfolio, 'addNewPortfolioWeightsToCompositeIndexWeights');
        service.addHoldingChangesToPort(holdingChanges, whatIfPortfolio);
        expect(whatIfPortfolio.skippedRulesForEachDate === holdingChanges.skippedRules).toBeTruthy();
        expect(whatIfPortfolio.setPassedRulesForEachDate).toHaveBeenCalledWith(passedRules);
        expect(whatIfPortfolio.addHoldingChanges).toHaveBeenCalledTimes(1);
        expect(whatIfPortfolio.addNewPortfolioWeightsToCompositeIndexWeights).toHaveBeenCalledTimes(0);
    });

    it('tests addHoldingChangesToPort - is composite portfolio', () => {
        const holdingChanges: HoldingChangeResponse = new HoldingChangeResponse();
        const whatIfPortfolio: WhatIfPortfolio = new RulesBasedPortfolio();
        whatIfPortfolio.isCompositePortfolio = true;
        jest.spyOn(whatIfPortfolio, 'setPassedRulesForEachDate').mockImplementation(() => {});
        jest.spyOn(whatIfPortfolio, 'addHoldingChanges');
        jest.spyOn(whatIfPortfolio, 'addNewPortfolioWeightsToCompositeIndexWeights').mockImplementation(() => {});
        service.addHoldingChangesToPort(holdingChanges, whatIfPortfolio);
        expect(whatIfPortfolio.setPassedRulesForEachDate).toHaveBeenCalledTimes(1);
        expect(whatIfPortfolio.addHoldingChanges).toHaveBeenCalledTimes(1);
        expect(whatIfPortfolio.addNewPortfolioWeightsToCompositeIndexWeights).toHaveBeenCalledWith(holdingChanges.holdingChanges);
    });

    it('tests addHoldingChangesToPort - is composite portfolio, but not rule based', () => {
        const holdingChanges: HoldingChangeResponse = new HoldingChangeResponse();
        const whatIfPortfolio: WhatIfPortfolio = new WhatIfPortfolio();
        whatIfPortfolio.isCompositePortfolio = true;
        jest.spyOn(whatIfPortfolio, 'setPassedRulesForEachDate').mockImplementation(() => {});
        jest.spyOn(whatIfPortfolio, 'addHoldingChanges');
        jest.spyOn(whatIfPortfolio, 'addNewPortfolioWeightsToCompositeIndexWeights').mockImplementation(() => {});
        service.addHoldingChangesToPort(holdingChanges, whatIfPortfolio);
        expect(whatIfPortfolio.setPassedRulesForEachDate).not.toHaveBeenCalled();
        expect(whatIfPortfolio.addHoldingChanges).toHaveBeenCalledTimes(1);
        expect(whatIfPortfolio.addNewPortfolioWeightsToCompositeIndexWeights).toHaveBeenCalledWith(holdingChanges.holdingChanges);
    });

    it('tests getHoldingChangesForRulesRequestPayload', () => {
        const rulesBasedPortfolio: RulesBasedPortfolio = new RulesBasedPortfolio();
        rulesBasedPortfolio.deserialize(ruleBasePortMock);
        rulesBasedPortfolio.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        const adhocPort = new AdhocPortfolio();
        adhocPort.adhocParams = new AdhocPortParams();
        adhocPort.adhocParams.date = new DateValue({date: '02/13/2023'});
        rulesBasedPortfolio.benchmark.portfolio = adhocPort;
        expect(service.getHoldingChangesForRulesRequestPayload(rulesBasedPortfolio, rulesBasedPortfolio.compositionRules.tradeRules)).toEqual({
            portfolioName: 'IP',
            includeAliasPortfolios: false,
            benchName: 'BUSAGGCOVF',
            date: '03/09/2016',
            rules: '[{"lineItem":"ABS","newWeight":10,"ruleType":"Sector","sectorRulesInfo":[{"subSector":{"breakdownRuleType":"String","groupByColumn":{"columnName":"Security Group","columnTag":"sec_group","positionColumnType":"ALL"},"useNoneBuckets":true},"sectorValue":"ABS","sectorType":"NormalSector"}]}]',
            benchmarkHoldingChanges: [],
            portfolioHoldingChanges: [],
            compositionFilter: null,
            portfolioPositionsInHoldingChanges: false,
            adhocPortParams: undefined,
            benchmarkAdhocPortParams: {
                'currency': undefined,
                'date': {
                    'date': '02/13/2023',
                    'dateString': false
                },
                'fullName': undefined, 'isPortGroup': undefined,
                'name': undefined,
            }
        });

        rulesBasedPortfolio.benchmark = undefined;
        expect(service.getHoldingChangesForRulesRequestPayload(rulesBasedPortfolio, rulesBasedPortfolio.compositionRules.tradeRules)).toEqual({
            portfolioName: 'IP',
            includeAliasPortfolios: false,
            benchName: undefined,
            date: '03/09/2016',
            rules: '[{"lineItem":"ABS","newWeight":10,"ruleType":"Sector","sectorRulesInfo":[{"subSector":{"breakdownRuleType":"String","groupByColumn":{"columnName":"Security Group","columnTag":"sec_group","positionColumnType":"ALL"},"useNoneBuckets":true},"sectorValue":"ABS","sectorType":"NormalSector"}]}]',
            benchmarkHoldingChanges: [],
            portfolioHoldingChanges: [],
            compositionFilter: null,
            portfolioPositionsInHoldingChanges: false,
            adhocPortParams: undefined
        });
    });

    it('tests getBeforeAfterDataRequestPayload', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        BreakdownInitializer.registerBreakdownConfigTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        const rulesBasedPortfolio: WhatIfPortfolio = new RulesBasedPortfolio();

        rulesBasedPortfolio.deserialize(ruleBasePortMock);
        rulesBasedPortfolio.datePicker = new DateValue({
            date: '03/09/2016',
            calCode: 'GreenPkg',
            dateStringValue: '',
            dateString: false
        });
        expect(service.getBeforeAfterDataRequestPayload(rulesBasedPortfolio)).toEqual(serializeBeforeAfterPayload);

        rulesBasedPortfolio.compositionSetting.breakdownTree = undefined;
        serializeBeforeAfterPayload.breakdownTree = JSON.stringify({breakdown:{breakdownTitle:'Security Group',subSectors:[{breakdownRuleType:'String',groupByColumn:{columnName:'Security Group',columnTag:'sec_group',positionColumnType:'ALL'}}]},title:'Security Group'}),
            expect(service.getBeforeAfterDataRequestPayload(rulesBasedPortfolio)).toEqual(serializeBeforeAfterPayload);
        rulesBasedPortfolio.modellingType = 2;
        serializeBeforeAfterPayload.breakdownTree = 'undefined';
        expect(service.getBeforeAfterDataRequestPayload(rulesBasedPortfolio)).toEqual(serializedBeforeAfterPayload2);

        // check for benchmark
        rulesBasedPortfolio.benchmark.portfolio = new AdhocPortGroup();
        expect(service.getBeforeAfterDataRequestPayload(rulesBasedPortfolio)).toEqual(serializedBeforeAfterPayload2);

        (rulesBasedPortfolio.benchmark.portfolio as AdhocPortGroup).adhocParams = new AdhocPortParams({
            name: 'Adhoc',
            fullName: 'Adhoc Example',
            currency: 'USD',
            portMktNotional: 3,
            date: {
                date: '09/15/2022',
                dateString: true,
                dateStringValue: 'T-undefined'
            }
        });
        expect(service.getBeforeAfterDataRequestPayload(rulesBasedPortfolio)).toEqual({
            ...serializedBeforeAfterPayload2,
            benchmarkAdhocParams: {
                currency: 'USD',
                date: {
                    date: '09/15/2022',
                    dateString: true,
                    dateStringValue: 'T-undefined'
                },
                fullName: 'Adhoc Example',
                name: 'Adhoc',
                portMktNotional: 3
            },
        });
    });

    it('tests transformCompositionDataForComposite', () => {
        const rulesBasedPortfolio: WhatIfPortfolio = new RulesBasedPortfolio('MS_EU');
        rulesBasedPortfolio.indexWeights = [
            new IndexWeight({weight: 0.03, portfolio: {ticker: 'PEP'}}),
            new IndexWeight({weight: 0.04, portfolio: {ticker: 'BELSH'}})
        ];
        rulesBasedPortfolio.isCompositePortfolio = true;
        rulesBasedPortfolio.modellingType = ModellingType.PORTFOLIO;
        let compositionData: ExploreResponseConfig & { data: ResponseData } = {
            data: {data: ['MS_EU', 'MS_EU', undefined, 1, 1, 100, 200], children: undefined},
            columns: [ColumnConstants.PORTFOLIO, ColumnConstants.PORTFOLIO_NAME, ColumnConstants.PORTFOLIO_FULL_NAME, CompositionConstants.PCT_NAV_GROUP_BEFORE, CompositionConstants.PCT_NAV_GROUP_AFTER, CompositionConstants.NAV_GROUP_BEFORE, CompositionConstants.NAV_GROUP_AFTER]
        };

        compositionData = service.transformCompositionDataForComposite(rulesBasedPortfolio, compositionData);
        expect(compositionData.data.children[0]).toEqual({rowId: 2, data: ['PEP', 'PEP', undefined, 0, 3, 0, 0, 0.015, 0]});
        expect(compositionData.data.children[1]).toEqual({rowId: 3, data: ['BELSH', 'BELSH', undefined, 0, 4, 0, 0, 0.02, 0]});

        // when holding changes are present
        rulesBasedPortfolio.holdingChanges = [
            new PortfolioHoldingChange({
                lineItem: 'PEP',
                newWeight: 21,
                replacementCount: 1
            }),
            new PortfolioHoldingChange({
                lineItem: 'ACPOrt126_6',
                newWeight: 21,
                title: 'ACPORT126_6'
            }),
            new PortfolioNavSecurityHoldingChange({
                    lineItem: 'USD_CCASH',
                    newWeight: 50,
                    order: 0,
                    newMarketValue: 100,
                    changeInMarketValue: 100
                }
            )
        ];
        rulesBasedPortfolio.indexWeights.push(new IndexWeight({weight: 0.04, portfolio: {ticker: 'ACPOrt126_6-#-(ACPORT126_6)', fullName: 'ACPORT126_6'}}));
        compositionData = service.transformCompositionDataForComposite(rulesBasedPortfolio, compositionData);
        expect(compositionData.data.children[0]).toEqual({rowId: 2, data: ['PEP', 'PEP', undefined, 0, 42, 0, 0, 0.21, 0]});
        expect(compositionData.data.children[1]).toEqual({rowId: 3, data: ['BELSH', 'BELSH', undefined, 0, 4, 0, 0, 0.02, 0]});
    });
});
