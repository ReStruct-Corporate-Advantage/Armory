import {AssetType, CalendarDateUtils, ConfigTypeFactory, CoreDefinitionStore, DateValue, ExpostSettings, FavoriteType, PortfolioDefaults, TimePeriod, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {
    AdvancedRiskSettings,
    DefaultRiskSettings,
    EconomySettings,
    ExposureSettings,
    PositionModeType
} from '@blk/explore-ui-risk';
import {ColumnSectorRule, CustomFilter, CustomSector} from '@blk/explore-ui-breakdown';
import * as benchMockJson from '../../../../mocks/benchMock.json';
import * as benchMockJson2 from '../../../../mocks/benchMock2.json';
import * as portMockJson from '../../../../mocks/portMock.json';
import * as praadaCannedAttributionMethodsMock from '../../../../mocks/praadaCannedAttributionMethodsMock.json';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {DefinitionsStore} from '../../stores';
import {SplitPositionType} from '../definitions/column-definitions/split-position-types.model';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';
import {MandateSettings} from '../mandate/mandate-settings.model';
import {SplitPositionSettings} from '../split-position-settings.model';
import {Benchmark} from './benchmark.model';
import {Portfolio} from './portfolio.model';
import {FilterScaling} from '@blk/explore-ui-risk';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {DecisionLevelConfig} from '@models/portfolio/decisionLevels/decision-level-config.model';

describe('Portfolio', () => {
    beforeAll(() => {
        CalendarDateUtils.setIndexHistoryLookbackDate('03/10/2011');
        CalendarDateUtils.setExposureLookbackDate('03/10/2014');
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });
    /**
     * Test case for the method getDefaultDateObject
     */
    it('should be created', () => {
        // id not present - will result in a normal portfolio
        const port: Portfolio = new Portfolio('IP', null, false, 'International Paper', null);
        expect(port instanceof Portfolio).toBe(true);
        expect(port.portName).toBe('IP');
        expect(port.isIndexResearchPortfolio).toBeFalsy();
        expect(port.title).toBeFalsy();
        expect(port.id).toBeFalsy();
    });

    /**
     * Test case for copyFrom
     */
    it('tests copyFrom', () => {
        const port: Portfolio = new Portfolio();
        port.deserialize(portMockJson);
        port.benchmarks = [];
        const bench1: Benchmark = new Benchmark(benchMockJson);
        const bench2: Benchmark = new Benchmark(benchMockJson2);
        port.benchmarks.push(bench1);
        port.benchmarks.push(bench2);
        const newPort: Portfolio = new Portfolio();
        newPort.copyFrom(port);
        expect(port.equals(newPort)).toBe(true);
        expect(newPort.benchmarks.length).toBe(2);
        newPort.benchmarks.forEach((benchmark, index) => expect(newPort.benchmarks[index].equals(port.benchmarks[index])));
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        ConfigTypeFactory.registerConfigType(Portfolio.configType, Portfolio);
        const port: Portfolio = new Portfolio();
        port.deserialize(portMockJson);
        let saved = port.serialize(true);
        expect(saved.currency).toBe(portMockJson.currency);
        let newPort = new Portfolio();
        newPort.deserialize(saved);
        expect(port.equals(newPort)).toBe(true);
        newPort = ConfigTypeFactory.createConfig(saved, saved.configType);
        expect(port.equals(newPort)).toBe(true);
        // Check name from prism favorite is set as portfolio title
        saved.name = 'Prism title';
        saved.title = '';
        newPort = new Portfolio();
        newPort.currency = 'JPY';
        newPort.deserialize(saved);
        expect(newPort.title).toBe('Prism title');
        expect(newPort.currency).toBe('JPY');
        // Save only dateStringValue in case of relative dates
        port.datePicker = new DateValue({
            calCode: 'GREEN_PKG',
            dateString: true,
            dateStringValue: 'T-10',
            date: '10-Mar-2019'
        });
        saved = port.serialize(true);
        newPort = new Portfolio();
        newPort.deserialize(saved);
        expect(newPort.datePicker.date).toBe(undefined);

        // If something was saved with a date but had dateString as true then also date is undefined;
        saved.datePicker.date = '10-Mar-2019';
        saved.portfolioGroup = true;
        saved.portfolios = [new Portfolio().serialize(), new Portfolio().serialize()];
        newPort = new Portfolio();
        newPort.deserialize(saved);
        expect(newPort.datePicker.date).toBe(undefined);
        expect(newPort.portfolios).toBeDefined();
        expect(newPort.portfolios.length).toBe(2);
    });

    /**
     *
     */
    it('Test updateBenchmarks', () => {
        const port = new Portfolio('IP');
        let benchmarks: any[];
        let bench: Benchmark;

        benchmarks = [
            {
                order: 2,
                name: 'LAGGFWD',
                type: BenchmarkConstants.PERFORM,
                portfolio: null
            },
            {
                order: 1,
                name: 'lEH_AGG',
                type: 'RISK',
                portfolio: null
            },
            {
                order: 0,
                name: 'LEHTSYFWD',
                type: BenchmarkConstants.PERFORM,
                portfolio: null
            },
            {
                order: 1,
                name: 'SNP500',
                type: 'MARKET'
            }
        ];

        port.deserialize({benchmarks});

        port.updateBenchmarks();

        benchmarks.forEach((benchmark, index) => expect(port.benchmarks[index].equals(benchmark)).toBe(true));
        bench = Benchmark.create('RISK', 1, 'lEH_AGG');

        expect(bench.equals(port.benchmark)).toBe(true);
        expect(port.market === 'SNP500').toBe(true);

        // Case2 - No RISK bench present so would default to NONE
        benchmarks = [
            {
                order: 2,
                name: 'LAGGFWD',
                type: BenchmarkConstants.PERFORM,
                portfolio: null
            },
            {
                order: 0,
                name: 'LEHTSYFWD',
                type: BenchmarkConstants.PERFORM,
                portfolio: null
            }
        ];
        port.benchmark = undefined;
        port.deserialize({benchmarks});

        port.updateBenchmarks();

        benchmarks.forEach((benchmark, index) => expect(port.benchmarks[index].equals(benchmark)).toBe(true));
        bench = new Benchmark({
            type: BenchmarkConstants.NONE_BENCH
        });
        expect(bench.equals(port.benchmark)).toBe(true);

        // Case3 - Already present bench from the list
        port.benchmark = Benchmark.create(BenchmarkConstants.PERFORM, 0, 'LEHTSYFWD');
        bench = port.benchmark;

        port.updateBenchmarks();

        benchmarks.forEach((benchmark, index) => expect(port.benchmarks[index].equals(benchmark)).toBe(true));
        expect(bench.equals(port.benchmark)).toBe(true);

        // Case4 - Already present none bench
        port.benchmark = Benchmark.create('None');
        bench = port.benchmark;

        port.updateBenchmarks();

        benchmarks.forEach((benchmark, index) => expect(port.benchmarks[index].equals(benchmark)).toBe(true));
        expect(bench.equals(port.benchmark)).toBe(true);

        const adhocPortGroup = new AdhocPortGroup();
        adhocPortGroup.isPortfolioGroup = true;
        adhocPortGroup.adhocParams = new AdhocPortParams();
        adhocPortGroup.updateBenchmarks();
        expect(adhocPortGroup.benchmarks.length).toBe(0);
        expect(adhocPortGroup.benchmark.type).toEqual('None');
    });

    describe('Test updateBenchmarks for port group', () => {
        let port: Portfolio;
        let benchmarks: any[];
        let bench: Benchmark;

        it('Test updateBenchmarks for port group', function () {
            port = new Portfolio('IP');
            port.isPortfolioGroup = true;
            benchmarks = [
                {
                    name: BenchmarkConstants.BENCH_PRIMARY,
                    type: BenchmarkConstants.BENCH_AGGREGATE,
                    order: 1
                },
                {
                    name: BenchmarkConstants.BENCH_SECONDARY,
                    type: BenchmarkConstants.BENCH_AGGREGATE,
                    order: 2
                }
            ];

            port.updateBenchmarks();

            benchmarks.forEach((benchmark, index) => expect(port.benchmarks[index].equals(benchmark)).toBe(true));
            bench = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 1, BenchmarkConstants.BENCH_PRIMARY);
            expect(bench.equals(port.benchmark)).toBe(true);

            // Already present bench from the list
            port.benchmark = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, null, BenchmarkConstants.BENCH_PRIMARY);
            port.updateBenchmarks();
            expect(port.benchmark.name).toBe(BenchmarkConstants.BENCH_PRIMARY);
            expect(port.benchmark.type).toBe(BenchmarkConstants.BENCH_AGGREGATE);
            expect(port.benchmark.order).toBe(1);

            // Already present none bench
            port.benchmark = Benchmark.create('None');
            bench = port.benchmark;

            port.updateBenchmarks();

            expect(bench.equals(port.benchmark)).toBe(true);
        });

        /**
         *
         */
        it('Test updateBenchmarks - switching from a port group to a portfolio', () => {
            port = new Portfolio('CORE-HQ');
            port.isPortfolioGroup = true;

            port.updateBenchmarks();

            bench = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 1, BenchmarkConstants.BENCH_PRIMARY);
            expect(bench.equals(port.benchmark)).toBe(true);
            port = new Portfolio('IP');
            port.isPortfolioGroup = false;
            benchmarks = [
                {
                    order: 2,
                    name: 'LAGGFWD',
                    type: BenchmarkConstants.PERFORM,
                    portfolio: null
                },
                {
                    order: 1,
                    name: 'lEH_AGG',
                    type: 'RISK',
                    portfolio: null
                },
                {
                    order: 0,
                    name: 'LEHTSYFWD',
                    type: BenchmarkConstants.PERFORM,
                    portfolio: null
                },
                {
                    order: 1,
                    name: 'SNP500',
                    type: 'MARKET'
                }
            ];
            port.deserialize({benchmarks});

            port.updateBenchmarks();

            bench = Benchmark.create('RISK', 1, 'lEH_AGG');
            expect(bench.equals(port.benchmark)).toBe(true);
        });

        /**
         *
         */
        it('Test updateBenchmarks - switching from a portfolio to port group', () => {
            port = new Portfolio('IP');
            port.isPortfolioGroup = false;
            benchmarks = [
                {
                    order: 2,
                    name: 'LAGGFWD',
                    type: BenchmarkConstants.PERFORM,
                    portfolio: null
                },
                {
                    order: 1,
                    name: 'lEH_AGG',
                    type: 'RISK',
                    portfolio: null
                },
                {
                    order: 0,
                    name: 'LEHTSYFWD',
                    type: BenchmarkConstants.PERFORM,
                    portfolio: null
                },
                {
                    order: 1,
                    name: 'SNP500',
                    type: 'MARKET'
                }
            ];
            port.deserialize({benchmarks});

            port.updateBenchmarks();

            bench = Benchmark.create('RISK', 1, 'lEH_AGG');
            expect(bench.equals(port.benchmark)).toBe(true);
            port = new Portfolio('CORE-HQ');
            port.isPortfolioGroup = true;

            port.updateBenchmarks();

            bench = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 1, BenchmarkConstants.BENCH_PRIMARY);
            expect(bench.equals(port.benchmark)).toBe(true);
        });

        it('should not create duplicated benchmarks', () => {
            port = new Portfolio('BATS-AG');
            port.isPortfolioGroup = true;
            port.updateBenchmarks();

            benchmarks = [
                {
                    name: BenchmarkConstants.BENCH_PRIMARY,
                    type: BenchmarkConstants.BENCH_AGGREGATE,
                    order: 1
                },
                {
                    name: BenchmarkConstants.BENCH_SECONDARY,
                    type: BenchmarkConstants.BENCH_AGGREGATE,
                    order: 2
                }
            ];

            expect(port.benchmarks).toEqual(benchmarks);

            port.updateBenchmarks();
            port.updateBenchmarks();
            port.updateBenchmarks();

            expect(port.benchmarks).toEqual(benchmarks);
        });
    });

    /**
     *
     */
    it('Test setDefaultPerformanceSettings', () => {
        // When port defaults are set those are read
        const port = new Portfolio('IP', new DateValue({date: '11/03/2016'}));
        port.portfolioDefaults = new PortfolioDefaults();
        port.loadPortfolioDefaultSettings();

        expect(port.performanceSettings.timePeriod.shortName === 'MTD').toBe(true);
        expect(port.performanceSettings.timePeriod.timePeriodName === 'Month To Date').toBe(true);

        const samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
        const statisticPeriod = new TimePeriod('1 Year', 1, 'Years');

        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = samplingPeriod;
        expostSettings.statisticPeriods = [statisticPeriod];
        expostSettings.isNetReturns = false;
        expostSettings.isLogNormal = false;
        expect(port.expostSettings.equals(expostSettings)).toBe(true);

        port.expostSettings.statisticPeriods = [new TimePeriod('2 Year', 1, 'Years')];
        expostSettings.statisticPeriods = [new TimePeriod('2 Year', 1, 'Years')];
        expect(port.expostSettings.equals(expostSettings)).toBe(true);
    });

    it('Test setDefaultPerformanceSettings when widget settings already defined', () => {
        // When port defaults are set those are read
        const port = new Portfolio('IP', new DateValue({date: '11/03/2016'}));
        port.portfolioDefaults = new PortfolioDefaults();

        const samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
        const statisticPeriod = new TimePeriod('2 Year', 1, 'Years');

        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = samplingPeriod;
        expostSettings.statisticPeriods = [statisticPeriod];
        expostSettings.isNetReturns = false;
        expostSettings.isLogNormal = false;

        port.expostSettings = expostSettings;
        port.loadPortfolioDefaultSettings();

        expect(port.expostSettings.equals(expostSettings)).toBe(true);
    });

    /**
     *
     */
    it('tests setPortfolioRiskSettings - both default settings present', () => {
        const port = new Portfolio();
        port.deserialize(portMockJson);

        expect(port.portfolioRiskSettings).toBeUndefined();

        port.setPortfolioRiskSettings();

        expect(port.portfolioRiskSettings).toBeDefined();
        expect(port.portfolioRiskSettings.exposureRiskSettings instanceof ExposureSettings).toBeTruthy();
        expect(port.portfolioRiskSettings.economyRiskSettings instanceof EconomySettings).toBeTruthy();
        expect(port.portfolioRiskSettings.advancedRiskSettings instanceof AdvancedRiskSettings).toBeTruthy();

        // Test for portDefaultRiskSettings and OrgDefaultRiskSettings
        expect((port.portfolioRiskSettings.advancedRiskSettings).assetClassCovariance).toBe(port.orgDefaultRiskSettings.assetClassCovariance);
        expect((port.portfolioRiskSettings.advancedRiskSettings).dxsBlock).toBe(port.portDefaultRiskSettings.dxsBlock);
        expect((port.portfolioRiskSettings.advancedRiskSettings).filterScaling).toBe(FilterScaling.PORTFOLIO_NAV);
    });

    /**
     *
     */
    it('tests setPortfolioRiskSettings - default settings absent', () => {
        const port = new Portfolio();
        port.deserialize(portMockJson);
        port.portDefaultRiskSettings = undefined;

        expect(port.portfolioRiskSettings).toBeUndefined();

        port.setPortfolioRiskSettings();

        expect(port.portfolioRiskSettings).toBeDefined();
        expect(port.portfolioRiskSettings.exposureRiskSettings instanceof ExposureSettings).toBeTruthy();
        expect(port.portfolioRiskSettings.economyRiskSettings instanceof EconomySettings).toBeTruthy();
        expect(port.portfolioRiskSettings.advancedRiskSettings instanceof AdvancedRiskSettings).toBeTruthy();
    });

    /**
     *
     */
    it('test addPortfolioSettingRequestParams', () => {
        const port = new Portfolio();
        const requestParams: any = {};
        const lookThroughSettings: LookThroughSettings = new LookThroughSettings();
        lookThroughSettings.isLookThroughEnabled = true;
        lookThroughSettings.isBenchLookThroughEnabled = true;
        lookThroughSettings.ltSecurityTypes = ['FUND', 'ETF', 'FUTURE_INDEX', 'SYNTH_CAP'];
        lookThroughSettings.ltProxies = ['RISK_PROXY', 'FUND', 'PRIMARY_BENCHMARK', 'LOOKTHROUGH_PROXY'];
        port['addPortfolioSettingRequestParams'](requestParams, null, undefined, lookThroughSettings);

        expect(Object.keys(requestParams).length).toBe(4);
        expect(requestParams).toEqual({
            isLookthroughEnabled: true,
            isBenchLookthroughEnabled: true,
            ltSecurityTypes: 'FUND,ETF,FUTURE_INDEX,SYNTH_CAP',
            ltSecurityProxyTypes: 'RISK_PROXY,FUND,PRIMARY_BENCHMARK,LOOKTHROUGH_PROXY'
        });
    });

    it('pass filter and filterTargetType if filter is defined', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const port = new Portfolio('test_ticker', new DateValue({date: '03/10/2016', calCode: 'GreenPkg'}));
        const requestParams: any = {};

        port.addRequestParams(requestParams);
        // Filter is not defined so don't add compositionFilter & filterTargetType to request
        expect(requestParams.filterTargetType).toBeUndefined();
        expect(requestParams.compositionFilter).toBeUndefined();

        port.filter = new CustomFilter();
        port.filter.customSector = new CustomSector();

        const columnSectorRule = new ColumnSectorRule();
        columnSectorRule.columnName = 'CUSIP';
        columnSectorRule.columnTag = 'cusip';
        columnSectorRule.comparisonType = 'Equals';

        port.filter.customSector.rule = columnSectorRule;

        port.addRequestParams(requestParams);
        expect(requestParams.filterTargetType).toBe('BOTH');
        expect(requestParams.compositionFilter).toBe(JSON.stringify({
            'breakdown': {
                'subSectors': [{
                    'breakdownRuleType': 'CustomSector',
                    'includeOtherBucket': true,
                    'rule': {
                        'colTag': 'cusip',
                        'colTitle': 'CUSIP',
                        'compType': 'Equals',
                        'customSectorType': 'Attributes',
                        'ruleType': 'Rule'
                    },
                }]
            }
        }));
    });

    /**
     * Test basic parameters are created properly
     */
    it('create basic params check', () => {
        // Create the portfolio to perform the tests on.
        const port = new Portfolio('test_ticker', new DateValue({date: '03/10/2016', calCode: 'GreenPkg'}));
        port.portName = 'test_ticker';
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';

        const requestParams: any = {};
        port.addRequestParams(requestParams);
        expect(requestParams).toEqual(expect.objectContaining({
            portfolio: 'test_ticker',
            fullPortfolioName: 'test_fullname',
            portfolioIdentifier: 'test_name',
            forDate: '03/10/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            splitPositionTypes: '',
            positionMode: 'AS_OF_W'
        }));
    });

    it('create basic params check when benchmark name is not to be sent', () => {
        // Create the portfolio to perform the tests on.
        const port = new Portfolio('test_ticker', new DateValue({date: '03/10/2016', calCode: 'GreenPkg'}));
        port.portName = 'test_ticker';
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';

        let requestParams: any = {};
        port.benchmark = new Benchmark({type: BenchmarkConstants.BENCH_TYPE_RISK, order: 1, name: 'Test'});
        port.addRequestParams(requestParams);
        expect(requestParams).toEqual(expect.objectContaining({
            portfolio: 'test_ticker',
            fullPortfolioName: 'test_fullname',
            portfolioIdentifier: 'test_name',
            forDate: '03/10/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            splitPositionTypes: '',
            positionMode: 'AS_OF_W',
            benchSelection: BenchmarkConstants.BENCH_TYPE_RISK,
            benchOrder: 1
        }));

        requestParams = {};
        port.benchmark = new Benchmark({type: BenchmarkConstants.BENCH_AGGREGATE, order: 1, name: 'Primary'});
        port.addRequestParams(requestParams);
        expect(requestParams).toEqual(expect.objectContaining({
            portfolio: 'test_ticker',
            fullPortfolioName: 'test_fullname',
            portfolioIdentifier: 'test_name',
            forDate: '03/10/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            splitPositionTypes: '',
            positionMode: 'AS_OF_W',
            benchSelection: BenchmarkConstants.BENCH_AGGREGATE,
            benchOrder: 1
        }));

        requestParams = {};
        port.benchmark = new Benchmark({type: BenchmarkConstants.NONE_BENCH, order: 1, name: 'Primary'});
        port.addRequestParams(requestParams);
        expect(requestParams).toEqual(expect.objectContaining({
            portfolio: 'test_ticker',
            fullPortfolioName: 'test_fullname',
            portfolioIdentifier: 'test_name',
            forDate: '03/10/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            splitPositionTypes: '',
            positionMode: 'AS_OF_W',
            benchSelection: BenchmarkConstants.NONE_BENCH,
            benchOrder: 1
        }));
    });

    it('create basic params check - when CalCode is not set in the portfolio', () => {
        // Create the portfolio to perform the tests on.
        const port = new Portfolio('test_ticker', new DateValue({date: '03/10/2016'}));
        port.portName = 'test_ticker';
        port.fullName = 'test_fullname';
        port.title = 'test_name';
        port.currency = 'USD';
        port.portfolioDefaults = new PortfolioDefaults({calendar: 'GreenPkg'});

        const requestParams: any = {};
        port.addRequestParams(requestParams);
        delete requestParams.portId;
        expect(requestParams).toEqual({
            portfolio: 'test_ticker',
            fullPortfolioName: 'test_fullname',
            portfolioIdentifier: 'test_name',
            forDate: '03/10/2016',
            currency: 'USD',
            holidayCalendar: 'GreenPkg',
            includeAliasPortfolios: false,
            splitPositionTypes: '',
            positionMode: 'AS_OF_W'
        });
    });

    /**
     *
     */
    it('should generate unique portId', () => {
        const port = new Portfolio('PEP', DateValue.newRelativeDate('T-1'));
        port.portId = '';
        port.generateUniquePortId();
        expect(port.portId.length).toBe(18);
        expect(port.portId.substr(0, 3)).toEqual(port.portName);
    });

    /**
     *
     */
    it('doDeserialize test case', () => {
        // Initialization of dummy split-setting
        const data: any = {
            name: 'XC',
            description: 'FX CSWAP',
            defaultSelected: true,
            splitSubTypeDesc: 'CASH FXCSWAP'
        };
        const splitPosition = new SplitPositionType(data);
        DefinitionsStore.splitPositionType = [splitPosition];

        const port = new Portfolio('PEP', DateValue.newRelativeDate('T-1'));
        port.deserialize(portMockJson);

        // As portMockJson doesn't have any splitSettings then splitPositionSettings won't get update with empty input
        expect(port.splitPositionSettings.selectedPositionTypes[0]).toBe('XC');

        const splitSetting = new SplitPositionSettings();
        splitSetting.selectedPositionTypes = ['Dummy name1', 'Dummy name2'];
        const dummyJsonForSplitSetting = {splitPositionTypes: splitSetting};
        port.deserialize(dummyJsonForSplitSetting);

        // Expected result should have splitPositionType with Dummy Name
        expect(port.splitPositionSettings.selectedPositionTypes[0]).toBe('Dummy name1');
        expect(port.splitPositionSettings.selectedPositionTypes[1]).toBe('Dummy name2');
    });

    it('doDeserialize test case for positionMode', () => {
        const port = new Portfolio('PEP', DateValue.newRelativeDate('T-1'));
        port.deserialize(portMockJson);
        // As portMockJson doesn't have positionModeSettings
        expect(port.positionModeSettings.positionModeSelection).toEqual(PositionModeType.AS_OF_W);

        const data: any = {};
        data.positionMode = 'GPX';
        const dummyJsonForPositionModeSettings = {positionModeSettings: data};
        port.deserialize(dummyJsonForPositionModeSettings);
        expect(port.positionModeSettings.positionModeSelection).toEqual(PositionModeType.GPX);
    });

    it('doDeserialize test case for decisionlevels', () => {
        const port = new Portfolio('PEP', DateValue.newRelativeDate('T-1'));
        const data: any = {};
        data.decisionLevelsConfig = {
            portTreeDecisionLevel: 1
        };
        const decisionLevelConfig = new DecisionLevelConfig();
        decisionLevelConfig.portTreeDecisionLevelOption = 1;
        port['doDeserialize'](data);
        expect(port.decisionLevelsConfig).toEqual(decisionLevelConfig);
    });

    it('doDeserialize test case for factorAttributionSettings', () => {
        const port = new Portfolio('PEP', DateValue.newRelativeDate('T-1'));
        port.deserialize(portMockJson);
        // As portMockJson doesn't have factorAttributionSettings
        expect(port.factorAttributionSettings).toBeDefined();
        expect(port.factorAttributionSettings).not.toBeNull();

        const data: any = {};
        data.factorAttributionType = 'FI_MANDATE';
        const dummyJsonForFactorAttributionSettings = {factorAttributionSettings: data};
        port.deserialize(dummyJsonForFactorAttributionSettings);
        expect(port.factorAttributionSettings.factorAttributionType).toEqual(AssetType.FI_MANDATE);
    });

    describe('to test custom filter in deserialize', () => {
        const port = new Portfolio('PEP', DateValue.newRelativeDate('T-1'));
        let dummyJsonForDataFilter: any;

        it('when data.filter is of type customFilter', () => {
            const customFilter = new CustomFilter();
            dummyJsonForDataFilter = {filter: customFilter, applyFilterTo: 'PORTFOLIO'};
            port.deserialize(dummyJsonForDataFilter);
            expect(port.filter).toBe(dummyJsonForDataFilter.filter);

            // In any case applyFilter will be populated what dummyJson will contain
            expect(port.applyFilterTo).toBe('PORTFOLIO');
        });

        it('when data.filter is not of customFilter', () => {
            dummyJsonForDataFilter = {filter: new CustomSector()};
            port.deserialize(dummyJsonForDataFilter);

            // By default includeOtherBucket is true when we call it's constructor
            expect(port.filter.customSector.includeOtherBucket).toBeTruthy();
            expect(port.filter.customSector.children.length).toBe(0);
        });

        it('when compositionSetting is populated', () => {
            dummyJsonForDataFilter = {compositionSetting: {filter: {breakdown: {}}, applyFilterTo: 'BOTH'}};
            port.deserialize(dummyJsonForDataFilter);
            // We'll new CustomFilter in our port.filter
            expect(port.filter).toStrictEqual(new CustomFilter());
            expect(port.applyFilterTo).toBe('BOTH');

            // If breakdown setting passed in filter.data
            dummyJsonForDataFilter = {compositionSetting: {filter: {data: {breakdown: {}}}, applyFilterTo: 'ACTIVE'}};
            port.deserialize(dummyJsonForDataFilter);
            // We'll new CustomFilter in our port.filter
            expect(port.filter).toStrictEqual(new CustomFilter());
            expect(port.applyFilterTo).toBe('ACTIVE');
        });
    });

    /**
     *
     */
    it('getPortfolioHeaderTitle', () => {
        const port: Portfolio = new Portfolio();
        port.portName = 'PEP';
        expect(port.getPortfolioHeaderTitle()).toBe(port.portName);

        port.title = 'PEP(Title)';
        expect(port.getPortfolioHeaderTitle()).toBe(port.title);

        port.title = 'MHYBBCAUDH';
        port.fullName = 'ICE BofA U.S. High Yield, BB-B, Constrained, 100% AUD Hedged Index';
        const displayTitle = 'ICE BofA U.S. High Yield, BB-B, Constrained, 100% ...';
        expect(port.getPortfolioHeaderTitle()).toBe(displayTitle);
    });

    /**
     *
     */
    it('isCustomPortGroup', () => {
        // Undefined name
        expect(new Portfolio().isCustomPortGroup()).toStrictEqual(false);

        // Null name
        expect(new Portfolio(null).isCustomPortGroup()).toStrictEqual(false);

        // Blank name
        expect(new Portfolio('').isCustomPortGroup()).toStrictEqual(false);

        // Normal port
        expect(new Portfolio('IP').isCustomPortGroup()).toStrictEqual(false);

        // Various custom port groups
        expect(new Portfolio(',IP').isCustomPortGroup()).toStrictEqual(true);
        expect(new Portfolio('IP,').isCustomPortGroup()).toStrictEqual(true);
        expect(new Portfolio('IP,PEP').isCustomPortGroup()).toStrictEqual(true);
        expect(new Portfolio('   IP  ,  PEP  ').isCustomPortGroup()).toStrictEqual(true);
    });

    it('setDefaultBenchmark test case', () => {
        // When portfolio has benchmark of 'Other' we shouldn't assign benchmark of type NONE
        const port: Portfolio = new Portfolio();

        port.benchmark = Benchmark.create('Other', undefined, 'BELSH');
        port['setDefaultBenchmark']();
        expect(port.benchmark.type).toBe('Other');
        expect(port.benchmark.name).toBe('BELSH');
    });

    it('tests isInitialized', () => {
        const port = new Portfolio('IP');
        expect(port.isInitialized()).toBeFalsy();

        port.fullName = 'abc';
        expect(port.isInitialized()).toBeTruthy();

        port.portfolioDefaults = new PortfolioDefaults();
        expect(port.isInitialized()).toBeTruthy();

        port.portDefaultRiskSettings = new DefaultRiskSettings();
        expect(port.isInitialized()).toBeTruthy();

        port.orgDefaultRiskSettings = new DefaultRiskSettings();
        expect(port.isInitialized()).toBeTruthy();
    });

    // Test createDefaultAttributionSettings
    it('createDefaultAttributionSettings', () => {
        // When port defaults are set those are read
        const port = new Portfolio('IP');
        port.assetType = 'FI_MANDATE';
        port.mandateSettings = new MandateSettings();
        port.mandateSettings.settings.set('ATTRIBUTION_TYPE', 'FIXED_INCOME_DXS');
        let attributionSettings = port.createDefaultAttributionSettings();
        expect(attributionSettings.cannedMethod === 'FIXED_INCOME_DXS').toBe(true);

        // When port defaults are not read, Column service provides list of available canned settings and the first among them that matches the asset type of portfolio is used
        port.mandateSettings = new MandateSettings();
        CoreDefinitionStore.praadaCannedAttributionMethods = praadaCannedAttributionMethodsMock.options as any;
        attributionSettings = port.createDefaultAttributionSettings();
        expect(attributionSettings.cannedMethod === 'FIXED_INCOME').toBe(true);

        // if asset type is also not defined, we default to MULTI_ASSET
        port.assetType = '';
        attributionSettings = port.createDefaultAttributionSettings();
        expect(attributionSettings.cannedMethod === 'MULTI_ASSET').toBe(true);
    });

    // Test createDefaultAttributionSettings
    it('createDefaultFactorAttributionSettings', () => {
        // When port defaults are set those are read
        const port = new Portfolio('IP');
        port.assetType = 'FI_MANDATE';
        port.mandateSettings = new MandateSettings();
        port.mandateSettings.settings.set(FavoriteType.MANDATE, AssetType.EQUITY);
        let factorAttributionSettings = port.createDefaultFactorAttributionSettings();
        expect(factorAttributionSettings.factorAttributionType === AssetType.EQUITY).toBe(true);

        // When port defaults are not read, set to assetType
        port.mandateSettings = new MandateSettings();
        factorAttributionSettings = port.createDefaultFactorAttributionSettings();
        expect(factorAttributionSettings.factorAttributionType === AssetType.FI_MANDATE).toBe(true);

        // if asset type is also not defined, we default to MULTI_ASSET
        port.assetType = '';
        factorAttributionSettings = port.createDefaultFactorAttributionSettings();
        expect(factorAttributionSettings.factorAttributionType === AssetType.MULTI_ASSET).toBe(true);
    });

});
