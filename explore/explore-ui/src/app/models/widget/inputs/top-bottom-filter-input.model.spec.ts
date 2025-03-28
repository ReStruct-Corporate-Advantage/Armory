import {TopBottomFilterInput} from './top-bottom-filter-input.model';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {
    ClimateScenarioAvailableOptions,
    ConfigTypeFactory,
    CoreDefinitionStore,
    NamedScenario
} from '@blk/explore-ui-core';
import {
    ClimateScenario,
    ClimateScenariosColumnOption,
    OverrideDateColumnOption,
    ScenarioColumnOption
} from '@blk/explore-ui-column-option';

/**
 * Top Bottom Filter Input tests
 */
describe('TopBottomFilterInput test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions({
            'assumptions': {
                'RCP 4.5': {
                    'mean': ['2020', '2050']
                },
                'RCP 8.5': {
                    'mean': ['2020', '2050'],
                    '0.83': ['2020', '2050']
                }
            },
            'transitionAssumptions': {
                'NGFS': {
                    'Orderly': ['2020'],
                    'Disorderly': ['2020']
                },
                'Regulatory': {
                    'NYC': ['2020']
                }
            },
            'decodeMap': {
                'RCP 4.5': 'Expected Emissions',
                'RCP 8.5': 'High Emissions',
                'mean': 'Average Risk',
                '0.83': 'Tail end Risk',
                '2020': 'Today',
                'NYC': 'New York City Local Law 97'
            },
            'optionsSortOrder': {
                'Physical': {
                    'type': ['RCP 4.5', 'RCP 8.5'],
                    'percentile': ['mean', '0.83']
                },
                'Transition': {
                    'type': ['NGFS', 'Regulatory'],
                    'percentile': ['Orderly', 'Disorderly']
                }
            }
        });
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput();
        topBottomFilterInput.top = 1;
        topBottomFilterInput.columnKey = 'pct_mv_1';
        topBottomFilterInput.positionColumnType = 'PORT';
        topBottomFilterInput.columnTag = 'pct_mv';
        topBottomFilterInput.title = 'Market Value% PRIOR_DATE';
        topBottomFilterInput.withinSectorLevel = true;

        const overrideDate = new OverrideDateColumnOption();
        overrideDate.overrideDateTypes = ['PRIOR_DATE'];
        topBottomFilterInput.childColumnOptions.set(OverrideDateColumnOption.CONFIG_TYPE, overrideDate);

        // Convert the object to string and then back to json again.
        let serializedData: any = topBottomFilterInput.serialize();

        let newTopBottomFilterInput: TopBottomFilterInput = ConfigTypeFactory.createConfig(serializedData, TopBottomFilterInput.configType, false);
        // Validate that the before and after are the same.
        expect(newTopBottomFilterInput.top).toBe(topBottomFilterInput.top);
        expect(newTopBottomFilterInput.columnKey).toBe(topBottomFilterInput.columnKey);
        expect(newTopBottomFilterInput.positionColumnType).toBe(topBottomFilterInput.positionColumnType);
        expect(newTopBottomFilterInput.columnTag).toBe(topBottomFilterInput.columnTag);
        expect(newTopBottomFilterInput.title).toBe(topBottomFilterInput.title);
        expect(newTopBottomFilterInput.withinSectorLevel).toBe(topBottomFilterInput.withinSectorLevel);
        expect(newTopBottomFilterInput.childColumnOptions.size).toEqual(1);
        expect((newTopBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).overrideDateTypes).toEqual(overrideDate.overrideDateTypes);

        serializedData = {
            data: serializedData
        };

        newTopBottomFilterInput = ConfigTypeFactory.createConfig(serializedData, TopBottomFilterInput.configType, false);
        // Validate that the before and after are the same.
        expect(newTopBottomFilterInput.top).toBe(topBottomFilterInput.top);
        expect(newTopBottomFilterInput.columnKey).toBe(topBottomFilterInput.columnKey);
        expect(newTopBottomFilterInput.positionColumnType).toBe(topBottomFilterInput.positionColumnType);
        expect(newTopBottomFilterInput.columnTag).toBe(topBottomFilterInput.columnTag);
        expect(newTopBottomFilterInput.title).toBe(topBottomFilterInput.title);
        expect(newTopBottomFilterInput.withinSectorLevel).toBe(topBottomFilterInput.withinSectorLevel);
        expect(newTopBottomFilterInput.childColumnOptions.size).toEqual(1);
        expect((newTopBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).overrideDateTypes).toEqual(overrideDate.overrideDateTypes);

        serializedData = {
            topBottomFilter: serializedData.data
        };

        newTopBottomFilterInput = ConfigTypeFactory.createConfig(serializedData, TopBottomFilterInput.configType, false);
        // Validate that the before and after are the same.
        expect(newTopBottomFilterInput.top).toBe(topBottomFilterInput.top);
        expect(newTopBottomFilterInput.columnKey).toBe(topBottomFilterInput.columnKey);
        expect(newTopBottomFilterInput.positionColumnType).toBe(topBottomFilterInput.positionColumnType);
        expect(newTopBottomFilterInput.columnTag).toBe(topBottomFilterInput.columnTag);
        expect(newTopBottomFilterInput.title).toBe(topBottomFilterInput.title);
        expect(newTopBottomFilterInput.withinSectorLevel).toBe(topBottomFilterInput.withinSectorLevel);
        expect(newTopBottomFilterInput.childColumnOptions.size).toEqual(1);
        expect((newTopBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).overrideDateTypes).toEqual(overrideDate.overrideDateTypes);
    });

    /**
     * Test case for deserialize. In case the required fields are present in data.data. (Legacy)
     */
    it('Test deserialize - data is present in data.data', function() {

        const data: any = {
            'inputType': 'topBottomFilter',
            'data': {
                'columnTag': 'pct_notional_val',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_notional_val_1489772580788',
                'top': 5,
                'overrideDate': 'PRIOR_DATE',
                'title': 'Notional Market Value% PRIOR_DATE'
            }
        };

        const topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput(data);
        // Validate
        expect(topBottomFilterInput).not.toBeUndefined();
        expect(topBottomFilterInput).not.toBeNull();
        expect(topBottomFilterInput.top).toBe(5);
        expect(topBottomFilterInput.columnKey).toBe('pct_notional_val_1489772580788');
        expect(topBottomFilterInput.positionColumnType).toBe('PORT');
        expect(topBottomFilterInput.columnTag).toBe('pct_notional_val');
        expect(topBottomFilterInput.title).toBe('Notional Market Value% PRIOR_DATE');
        expect(topBottomFilterInput.childColumnOptions.size).toEqual(1);
        expect((topBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).overrideDateTypes[0]).toEqual('PRIOR_DATE');
    });

    it('should test deserialize legacy favorite and broken favorite with custom date', () => {
        // Legacy favorite
        let data: any = {
            'inputType': 'topBottomFilter',
            'data': {
                'columnTag': 'pct_notional_val',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_notional_val_1489772580788',
                'top': 5,
                'overrideDate': 'T-2',
                'title': 'Notional Market Value% T-2'
            }
        };

        let topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput(data);
        // Validate
        expect(topBottomFilterInput.title).toBe('Notional Market Value% T-2');
        expect((topBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).overrideDateTypes[0]).toEqual('CUSTOM');
        expect((topBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).customOverrideDateLabel).toEqual('T-2');

        // Broken favorite
        data = {
            bottom: 10,
            childColumnOptions: {
                overrideDateColumnOption: {
                    configType: "overrideDateColumnOption",
                    endDate: {dateString: false},
                    overrideDateTypes: ['T-2'],
                    showAttribution: false,
                    startDate: {dateString: false}
                }
            },
            columnKey: "pct_mv_fbd14b0c2a7c494",
            columnTag: "pct_mv",
            configType: "topBottomFilter",
            positionColumnType: "ACTIVE",
            sectorLevel: true,
            title: "Active Market Value % T-2",
            top: 10,
            withinSectorLevel: false
        }

        topBottomFilterInput = new TopBottomFilterInput(data);
        // Validate
        expect(topBottomFilterInput.title).toBe('Active Market Value % T-2');
        expect((topBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).overrideDateTypes[0]).toEqual('CUSTOM');
        expect((topBottomFilterInput.childColumnOptions.get(OverrideDateColumnOption.CONFIG_TYPE) as OverrideDateColumnOption).customOverrideDateLabel).toEqual('T-2');
    });

    /**
     * Test case for method isValidTopBottomFilter
     */
    it('Test isValidTopBottomFilter - enabled', function() {
        const filter = {
            'top': 1,
            'columnTag': 'pct_mv',
            'positionColumnType': 'PORT',
            'inputType': 'topBottomFilter',
            'data': {},
            'columnKey': 'pct_mv_1'
        };
        const isEnabled: boolean = TopBottomFilterInput.isValidTopBottomFilter(filter);
        expect(isEnabled).toBeTruthy();
    });

    /**
     * Test case for method isValidTopBottomFilter
     */
    it('Test isValidTopBottomFilter - disabled', function() {
        const filter = {
            'top': null,
            'columnTag': 'pct_mv',
            'positionColumnType': 'PORT',
            'inputType': 'topBottomFilter',
            'data': {},
            'columnKey': 'pct_mv_1'
        };
        const isEnabled: boolean = TopBottomFilterInput.isValidTopBottomFilter(filter);
        expect(isEnabled).toBeFalsy();
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1: TopBottomFilterInput = new TopBottomFilterInput();
        const model2: TopBottomFilterInput = new TopBottomFilterInput();
        expect(model1.equals(model2)).toBeTruthy();

        // Different column key
        model1.columnKey = 'market_val_1';
        model1.columnTag = 'market_val';
        model1.positionColumnType = 'PORT';
        model1.sectorLevel = false;
        model1.withinSectorLevel = false;
        model1.top = 2;
        model1.bottom = 3;

        model2.columnKey = 'market_val_2';
        model2.columnTag = 'market_val';
        model2.positionColumnType = 'PORT';
        model2.sectorLevel = false;
        model2.withinSectorLevel = false;
        model2.top = 2;
        model2.bottom = 3;
        expect(model1.equals(model2)).toBeFalsy();

        // Different column tag
        model2.columnKey = model1.columnKey;
        model2.columnTag  = 'cusip';
        expect(model1.equals(model2)).toBeFalsy();

        // Different positionColumnType
        model2.columnTag = model1.columnTag;
        model2.positionColumnType  = 'BENCH';
        expect(model1.equals(model2)).toBeFalsy();

        // Different sectorLevel
        model2.positionColumnType = model1.positionColumnType;
        model2.sectorLevel  = true;
        expect(model1.equals(model2)).toBeFalsy();

        // Different top
        model2.sectorLevel = model1.sectorLevel;
        model2.top  = 7;
        expect(model1.equals(model2)).toBeFalsy();

        // Different bottom
        model2.top = model1.top;
        model2.bottom  = 7;
        expect(model1.equals(model2)).toBeFalsy();

        // Different override Date
        model2.bottom  = model1.bottom;
        const overrideDateColOption = new OverrideDateColumnOption();
        overrideDateColOption.overrideDateTypes = ['PRIOR_DAY'];
        model2.childColumnOptions.set(OverrideDateColumnOption.CONFIG_TYPE, overrideDateColOption);
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same now
        model1.childColumnOptions = model2.childColumnOptions;
        expect(model1.equals(model2)).toBeTruthy();

        // Different withinSectorLevel
        model2.withinSectorLevel = true;
        expect(model1.equals(model2)).toBeFalsy();
    });

    /**
     * Test case for method reset
     */
    it('Test reset', function() {
        const model1: TopBottomFilterInput = new TopBottomFilterInput();

        // Different column key
        model1.columnKey = 'market_val_1';
        model1.columnTag = 'market_val';
        model1.positionColumnType = 'PORT';
        model1.sectorLevel = false;
        model1.top = 2;
        model1.bottom = 3;
        model1.childColumnOptions.set(OverrideDateColumnOption.CONFIG_TYPE, new OverrideDateColumnOption());
        model1.reset();
        expect(model1.equals(new TopBottomFilterInput())).toBeTruthy();
    });

    /**
     * Test case for method addRequestParams
     */
    it('Test addRequestParams', function() {
        const model1: TopBottomFilterInput = new TopBottomFilterInput();

        model1.columnKey = 'market_val_1';
        model1.columnTag = 'market_val';
        model1.positionColumnType = 'PORT';
        model1.sectorLevel = false;
        model1.withinSectorLevel = true;
        model1.top = 2;
        model1.bottom = 3;
        let requestParams = new Map <string, any>();
        model1.addRequestParams(requestParams, 'topBottomFilter');
        expect(requestParams['topBottomFilter']).toEqual({
            'bottom': 3,
            'childColumnOptions': {},
            'columnKey': 'market_val_1',
            'columnTag': 'market_val',
            'positionColumnType': 'PORT',
            'sectorLevel': false,
            'withinSectorLevel': true,
            'top': 2
        });

        const model2: TopBottomFilterInput = new TopBottomFilterInput();

        model2.columnKey = 'notional_market_val_1';
        model2.columnTag = 'notional_market_val';
        model2.positionColumnType = 'PORT';
        model2.sectorLevel = false;
        model2.top = 7;
        model2.bottom = 8;
        requestParams = new Map <string, any>();
        model2.addRequestParams(requestParams);
        expect(requestParams['topBottomFilter']).toEqual({
            'bottom': 8,
            'childColumnOptions': {},
            'columnKey': 'notional_market_val_1',
            'columnTag': 'notional_market_val',
            'positionColumnType': 'PORT',
            'sectorLevel': false,
            'top': 7
        });
    });

    /**
     * Test case for method addRequestParams for invalid filter
     */
    it('Test addRequestParams with Empty Object', function() {
        const model1: TopBottomFilterInput = new TopBottomFilterInput();
        const requestParams = new Map <string, any>();
        model1.addRequestParams(requestParams, 'topBottomFilter');
        expect(requestParams['topBottomFilter']).toBeUndefined();
    });

    it('should serialize/deserialize with climate scenario', () => {
        const scenario = new ClimateScenario();
        scenario.scenarioPercentile = 'mean';
        scenario.scenarioPercentileDisplayName = 'Average Risk';
        scenario.scenarioType = 'RCP 4.5';
        scenario.scenarioTypeDisplayName = 'Expected Emissions';
        scenario.scenarioYear = '2020';
        scenario.scenarioYearDisplayName = 'Today';

        const topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput();
        topBottomFilterInput.top = 1;
        topBottomFilterInput.columnKey = 'pc_prepay_rate_1y';
        topBottomFilterInput.positionColumnType = 'PORT';
        topBottomFilterInput.columnTag = 'pc_prepay_rate_1y';
        topBottomFilterInput.title = 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today';
        topBottomFilterInput.withinSectorLevel = true;
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario = [scenario];
        topBottomFilterInput.childColumnOptions.set(ClimateScenariosColumnOption.CONFIG_TYPE, climateScenariosColumnOption);

        // Convert the object to string and then back to json again.
        const serializedData: any = topBottomFilterInput.serialize();

        const newTopBottomFilterInput: TopBottomFilterInput = ConfigTypeFactory.createConfig(serializedData, TopBottomFilterInput.configType, false);
        // Validate that the before and after are the same.
        expect(newTopBottomFilterInput.top).toBe(topBottomFilterInput.top);
        expect(newTopBottomFilterInput.columnKey).toBe(topBottomFilterInput.columnKey);
        expect(newTopBottomFilterInput.positionColumnType).toBe(topBottomFilterInput.positionColumnType);
        expect(newTopBottomFilterInput.columnTag).toBe(topBottomFilterInput.columnTag);
        expect(newTopBottomFilterInput.title).toBe(topBottomFilterInput.title);
        expect(newTopBottomFilterInput.withinSectorLevel).toBe(topBottomFilterInput.withinSectorLevel);
        expect(newTopBottomFilterInput.childColumnOptions.size).toEqual(1);
        expect(newTopBottomFilterInput.childColumnOptions.has(ClimateScenariosColumnOption.CONFIG_TYPE));
        expect((newTopBottomFilterInput.childColumnOptions.get(ClimateScenariosColumnOption.CONFIG_TYPE) as ClimateScenariosColumnOption)).toEqual(climateScenariosColumnOption);
    });

    it('should addRequestParams with climate scenario', () => {
        const scenario = new ClimateScenario();
        scenario.scenarioPercentile = 'mean';
        scenario.scenarioPercentileDisplayName = 'Average Risk';
        scenario.scenarioType = 'RCP 4.5';
        scenario.scenarioTypeDisplayName = 'Expected Emissions';
        scenario.scenarioYear = '2020';
        scenario.scenarioYearDisplayName = 'Today';

        const topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput();
        topBottomFilterInput.top = 1;
        topBottomFilterInput.columnKey = 'pc_prepay_rate_1y';
        topBottomFilterInput.positionColumnType = 'PORT';
        topBottomFilterInput.columnTag = 'pc_prepay_rate_1y';
        topBottomFilterInput.title = 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today';
        topBottomFilterInput.withinSectorLevel = true;
        const climateScenariosColumnOption = new ClimateScenariosColumnOption();
        climateScenariosColumnOption.climateScenario = [scenario];
        topBottomFilterInput.childColumnOptions.set(ClimateScenariosColumnOption.CONFIG_TYPE, climateScenariosColumnOption);

        // Convert the object to string and then back to json again.
        const requestParams = new Map<string, any>();
        topBottomFilterInput.addRequestParams(requestParams);
        expect(requestParams['topBottomFilter']).toEqual({
            'childColumnOptions': {
                'pClimateScenarioSettings': {
                    'scenarioOptions': [{
                        'scenarioPercentile': 'mean',
                        'scenarioPercentileDisplayName': 'Average Risk',
                        'scenarioType': 'RCP 4.5',
                        'scenarioTypeDisplayName': 'Expected Emissions',
                        'scenarioYear': '2020',
                        'scenarioYearDisplayName': 'Today'
                    }],
                }
            },
            'columnKey': 'pc_prepay_rate_1y',
            'columnTag': 'pc_prepay_rate_1y',
            'positionColumnType': 'PORT',
            'title': 'Physical Climate Adj. 1 Year CPR Expected Emissions Average Risk Today',
            'top': 1,
            'withinSectorLevel': true
        });
    });

    it('should addRequestParams with stress scenario', () => {
        const scenario = new NamedScenario();
        scenario.enabled = true;
        scenario.name = 'Stock Market Drop Global';
        scenario.code = 'MS_WORLD';
        scenario.description = '1% probability movement of MSCI World Market Down';
        const scenariosColumnOption = new ScenarioColumnOption();
        scenariosColumnOption.nameScenarios.push(scenario);

        const topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput();
        topBottomFilterInput.top = 1;
        topBottomFilterInput.columnKey = 'rfv_strss_pnl_pt_abs_6613e8066d4f498';
        topBottomFilterInput.positionColumnType = 'PORT';
        topBottomFilterInput.columnTag = 'rfv_strss_pnl_pt_abs';
        topBottomFilterInput.title = 'Monetary Stress P&L Stock Market Drop Global';
        topBottomFilterInput.withinSectorLevel = true;
        const stressScenariosColumnOption = new ScenarioColumnOption();
        stressScenariosColumnOption.nameScenarios = [scenario];
        topBottomFilterInput.childColumnOptions.set(ScenarioColumnOption.CONFIG_TYPE, stressScenariosColumnOption);

        // Convert the object to string and then back to json again.
        const requestParams = new Map<string, any>();
        topBottomFilterInput.addRequestParams(requestParams);
        expect(requestParams['topBottomFilter']).toEqual({
            'childColumnOptions': {
                'scenarioSettings': {
                    'scenarioList': [{
                        'scenCode': 'MS_WORLD',
                        'scenDescription': '1% probability movement of MSCI World Market Down',
                        'scenName': 'Stock Market Drop Global',
                        'type': 'NamedScenario'
                    }]
                }
            },
            'columnKey': 'rfv_strss_pnl_pt_abs_6613e8066d4f498',
            'columnTag': 'rfv_strss_pnl_pt_abs',
            'positionColumnType': 'PORT',
            'title': 'Monetary Stress P&L Stock Market Drop Global',
            'top': 1,
            'withinSectorLevel': true
        });
    });

    it('Test shouldSkipSerialize', () => {
        const topBottomFilterInput: TopBottomFilterInput = new TopBottomFilterInput();
        expect(topBottomFilterInput.shouldSkipSerialize()).toBeFalsy();
    });
});
