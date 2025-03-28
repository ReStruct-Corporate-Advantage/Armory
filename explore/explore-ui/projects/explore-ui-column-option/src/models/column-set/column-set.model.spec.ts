import {
    ColumnConfig,
    ConfigState,
    ConfigTypeFactory,
    CoreTestUtils,
    TabularColumnFilters,
    UseType
} from '@blk/explore-ui-core';
import {isNil} from 'lodash';
import {ColumnOptionInitializer} from '../../column-option.initializer';
import {ColumnOptionTestUtils} from '../../test-utils/column-option-test.utils';
import {NumericColumnFormatColumnOption} from '../column-option/numeric-column-format-column-option.model';
import {ColumnSet} from './column-set.model';
import {CustomCalculationConstants} from '../../constants';
import {AggregationColumnOption} from '../column-option/aggregation-column-option.model';
import {ActiveCalculationColumnOption} from '../column-option/active-calculation-column-option.model';
import {StyleAnalysisColumnOption} from '../column-option/style-analysis-column-option.model';
import {TestUtils} from '../../../../../src/app/utils/test.utils';

/**
 * This test file tests on a ColumnSetupdateColumnFiltersFromGrid
 */
describe('ColumnSet tests', () => {
    let columnSet: ColumnSet;
    beforeAll(() => {
        ColumnOptionInitializer.registerColumnConfigTypes();
        CoreTestUtils.initDefinitions();
    });

    beforeEach((done) => {
        columnSet = new ColumnSet();
        TestUtils.initialize(done);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /**
     * Test calling serialize on the ColumnSet and then using that generated string to deserialize into a new ColumnSet and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));
        columnSet.columns[0].columnTitle = 'Market Value';
        // Convert the object to string and then back to json again.
        const serializedData = columnSet.serialize();
        const deserializedData: any = JSON.stringify(serializedData);
        const newColumnSet: ColumnSet = ConfigTypeFactory.createConfig(deserializedData, ColumnSet.configType, true);
        expect(newColumnSet.columns.length === 1).toBe(true);
        expect(newColumnSet.columns[0].columnTag).toBe('market_val');
        expect(newColumnSet.columns[0].positionColumnType).toBe('PORT');
        expect(newColumnSet.columns[0].columnTitle).toBe('Market Value');
    });

    /**
     * Test calling serialize on the ColumnSet and then using that generated string to deserialize into a new ColumnSet and test it is the same.
     */
    it('Serialize test - Additional columnState items', () => {
        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));
        columnSet.columns[0].columnTitle = 'Market Value';

        // Add in some column state objects.
        columnSet.columnState.columns.push({columnKey: 'abc', width: 50});
        columnSet.columnState.columns.push({columnKey: 'market_val', width: 50});
        columnSet.columnState.columns.push({columnKey: 'market_val|Equity|Financial', width: 100});
        columnSet.columnState.columns.push({columnKey: 'market_val_before', width: 200});

        // Convert the object to string and then back to json again.
        const serializedData = columnSet.serialize();
        const deserializedData: any = JSON.stringify(serializedData);
        const newColumnSet: ColumnSet = ConfigTypeFactory.createConfig(deserializedData, ColumnSet.configType, true);
        expect(newColumnSet.columnState.columns.length).toBe(3);
        expect(newColumnSet.columnState.columns[0].columnKey).toBe('market_val');
        expect(newColumnSet.columnState.columns[1].columnKey).toBe('market_val|Equity|Financial');
        expect(newColumnSet.columnState.columns[2].columnKey).toBe('market_val_before');
    });

    it('should serialize the columnKey as part of the column set when serializing a linked custom calc favorite', () => {
        // custom calc favorite
        const customCalcColumn = ColumnConfig.createColumn(CustomCalculationConstants.CUSTOM_CALCULATION, UseType.ALL);
        customCalcColumn.columnKey = ColumnConfig.generateColumnKey(customCalcColumn.columnTag);
        customCalcColumn.id = 12345;
        customCalcColumn.title = 'Tim Custom Calc';
        customCalcColumn.owner = 'tilee';

        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(customCalcColumn);

        const serializedColumnSet = columnSet.doSerialize(true);
        const serializedCustomCalcCol = serializedColumnSet.columns[0];
        expect(serializedCustomCalcCol.favId).toEqual(customCalcColumn.id);
        expect(serializedCustomCalcCol.columnTag).toBeUndefined();
        expect(serializedCustomCalcCol.columnKey).toEqual(customCalcColumn.columnKey);
    });

    it('should set the columnKey from the column set when deserializing a linked custom calc favorite', () => {
        // custom calc favorite
        const customCalcColumn = ColumnConfig.createColumn(CustomCalculationConstants.CUSTOM_CALCULATION, UseType.ALL);
        customCalcColumn.columnKey = ColumnConfig.generateColumnKey(customCalcColumn.columnTag);
        customCalcColumn.id = 12345;
        customCalcColumn.title = 'Tim Custom Calc';
        customCalcColumn.owner = 'tilee';

        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(customCalcColumn);

        jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig').mockReturnValue(customCalcColumn);

        const serializedColumnSet = columnSet.doSerialize(true);
        serializedColumnSet.columns[0].columnKey = ColumnConfig.generateColumnKey(customCalcColumn.columnTag);

        // when custom calc columnKey present at the ColumnSet level, it should be sourced from there
        let deserializedColumnSet = new ColumnSet(serializedColumnSet);
        let deserializedCustomCalcCol: ColumnConfig = deserializedColumnSet.columns[0];
        expect(deserializedCustomCalcCol.columnTag).toEqual(customCalcColumn.columnTag);
        expect(deserializedCustomCalcCol.optionValues).toBeDefined();
        expect(deserializedCustomCalcCol.columnKey).toEqual(serializedColumnSet.columns[0].columnKey);

        // when custom calc columnKey not present at the ColumnSet level, it should be sourced from custom calc favorite
        serializedColumnSet.columns[0].columnKey = undefined;
        deserializedColumnSet = new ColumnSet(serializedColumnSet);
        deserializedCustomCalcCol = deserializedColumnSet.columns[0];
        expect(deserializedCustomCalcCol.columnTag).toEqual(customCalcColumn.columnTag);
        expect(deserializedCustomCalcCol.optionValues).toBeDefined();
        expect(deserializedCustomCalcCol.columnKey).toEqual(customCalcColumn.columnKey);
    });

    it('should add security description column when portTreeDecisionLevel is present', () => {
        const requestParams: any = { portTreeDecisionLevel: 1 };
        const securityDescriptionColumn = ColumnConfig.createColumn('security_description');
        columnSet.columns.push(securityDescriptionColumn);

        columnSet.addRequestParams(requestParams);

        expect(requestParams['columns']).toEqual([
            securityDescriptionColumn.createRequestColumn(false, false)
        ]);
    });

    it('should add security description column when topDownCols is not empty', () => {
        const requestParams: any = { topDownCols: ['col1', 'col2'] };
        const securityDescriptionColumn = ColumnConfig.createColumn('security_description');
        columnSet.columns.push(securityDescriptionColumn);

        columnSet.addRequestParams(requestParams);

        expect(requestParams['columns']).toEqual([
            securityDescriptionColumn.createRequestColumn(false, false)
        ]);
    });

    it('should add all columns when portTreeDecisionLevel and topDownCols are not present', () => {
        const decisionBenchMap = '{"GLOB_BM_TH->BCCR":"SNP500","GLOB_BM_TH->NPAL6":"SNP100","GLOB_BM_TH->NPAL7":"SNP1000","GLOB_BM_TH->SSPF":"ILB"}';
        const requestParams: any = {decisionBenchMap};
        const column1 = ColumnConfig.createColumn('col1');
        // multi-manager enabled
        column1.optionValues = [{
            configType: 'columnBreakdown',
            multiManagerData: {'decompositionMode': 'managerSelection'},
            addRequestParams: () => {}
        }];
        const column2 = ColumnConfig.createColumn('col2');
        columnSet.columns.push(column1);
        columnSet.columns.push(column2);
        columnSet.addRequestParams(requestParams);
        expect(requestParams['columns']).toEqual([
            column1.createRequestColumn(false, false),
            column2.createRequestColumn(false, false)
        ]);
        expect(requestParams.decisionBenchMap).toEqual(decisionBenchMap);

        // multi-manager disabled
        column1.optionValues[0].multiManagerData.decompositionMode = 'none';
        columnSet.addRequestParams(requestParams);
        expect(requestParams.decisionBenchMap).toBeUndefined();
    });

    it('should handle empty columns array', () => {
        const requestParams: any = {};

        columnSet.addRequestParams(requestParams);

        expect(requestParams['columns']).toEqual([]);
    });

    it('should not allow any duplicate columnKeys when deserializing the same custom calc favorite in a ColumnSet -- LEGACY', () => {
        // custom calc favorite
        const customCalcColumn = ColumnConfig.createColumn(CustomCalculationConstants.CUSTOM_CALCULATION, UseType.ALL);
        customCalcColumn.columnKey = ColumnConfig.generateColumnKey(customCalcColumn.columnTag);
        customCalcColumn.id = 12345;
        customCalcColumn.title = 'Tim Custom Calc';
        customCalcColumn.owner = 'tilee';

        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(customCalcColumn);
        columnSet.columns.push(customCalcColumn);

        jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig').mockReturnValue(customCalcColumn);

        const serializedColumnSet = columnSet.doSerialize(true);
        serializedColumnSet.columns[0].columnKey = undefined;
        serializedColumnSet.columns[1].columnKey = undefined;

        const deserializedColumnSet = new ColumnSet(serializedColumnSet);

        expect(deserializedColumnSet.columns[0].columnKey).toEqual(customCalcColumn.columnKey);
        expect(deserializedColumnSet.columns[1].columnKey).not.toEqual(deserializedColumnSet.columns[0].columnKey);
    });

    /**
     * Test calling copyFrom
     */
    it('copyFrom test', () => {
        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));


        const newColumnSet: ColumnSet = new ColumnSet();
        newColumnSet.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));
        newColumnSet.columns.push(ColumnConfig.createColumn('duration', 'PORT'));

        columnSet.copyFrom(newColumnSet);

        expect(columnSet.columns.length).toBe(2);
    });

    /**
     * When a ColumnSet is deserialized if a column is not valid it should not be in the report.
     */
    it('testDeserializeWithInvalidColumn', () => {
        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn('cusip'));
        columnSet.columns.push(ColumnConfig.createColumn('invalid_col'));

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(columnSet.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newColumnSet: ColumnSet = ConfigTypeFactory.createConfig(deserializedData, ColumnSet.configType, true);

        expect(newColumnSet.columns.length).toBe(1);
    });

    /**
     * Tests the updateColumnFiltersFromGrid function
     */
    it('Test updateColumnFiltersFromGrid function', () => {
        const columnSet: ColumnSet = new ColumnSet();
        const column1: ColumnConfig = ColumnConfig.createColumn('market_val', 'PORT', 'market_val_1');
        const column2: ColumnConfig = ColumnConfig.createColumn('cusip', null, 'cusip_2');
        const column3: ColumnConfig = ColumnConfig.createColumn('sec_group', null, 'sec_group_3');
        const column4: ColumnConfig = ColumnConfig.createColumn('maturity_date', null, 'maturity_date_3');
        columnSet.columns.push(column1);
        columnSet.columns.push(column2);
        columnSet.columns.push(column3);
        columnSet.columns.push(column4);

        const marketValFilter = {market_val_1: {filter: 100, type: 'greaterThan'}};
        const cusipFilter = {cusip_2: {filter: '123', type: 'contains'}};
        const dateFilter = {maturity_date_3: {dateFrom: '03-15-2017', filterType: 'date', type: 'greaterThan'}};

        columnSet.updateColumnFiltersFromGrid({
            market_val_1: {filter: 100, type: 'greaterThan'},
            abc: {filter: '123', type: 'contains'},
            sec_group_3: {filter: undefined, type: 'contains'},
            maturity_date_3: {dateFrom: '03-15-2017', filterType: 'date', type: 'greaterThan'}
        }, 'cusip_2');
        expect(column1.columnFilters.columnFilters).toEqual(marketValFilter);
        expect(column2.columnFilters.columnFilters).toEqual(cusipFilter);
        expect(column3.columnFilters).toBeUndefined();
        expect(column4.columnFilters.columnFilters).toEqual(dateFilter);

        // empty filter
        columnSet.updateColumnFiltersFromGrid({}, 'cusip_2');
        expect(column1.columnFilters).toBeUndefined();
        expect(column2.columnFilters).toBeUndefined();
        expect(column3.columnFilters).toBeUndefined();
        expect(column4.columnFilters).toBeUndefined();
    });

    it('Test equals', () => {
        const model1: ColumnSet = new ColumnSet();
        const model2: ColumnSet = new ColumnSet();
        expect(model1.equals(model2)).toBeTruthy();

        // Different number of columns
        model1.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));
        model1.columns.push(ColumnConfig.createColumn('market_val', 'BENCH'));
        model2.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));
        expect(model1.equals(model2)).toBeFalsy();

        // Different columns
        model2.columns.push(ColumnConfig.createColumn('market_val', 'ACTIVE'));
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same now
        model2.columns[1].positionColumnType = 'BENCH';
        expect(model1.equals(model2)).toBeTruthy();
    });

    /**
     * Tests the getColumnFiltersInGridFormat function
     */
    it('Test addRequestColumns function', () => {
        const columnSet: ColumnSet = new ColumnSet();
        const column1: ColumnConfig = ColumnConfig.createColumn('market_val', 'PORT');
        column1.columnKey = 'market_val_1';
        column1.optionValues.push(NumericColumnFormatColumnOption.createModelLegacy(
            {
                decimalPlaces: 2,
                useThousandsSeparator: true,
                scaling: 2
            }));
        columnSet.columns.push(column1);

        const column2: ColumnConfig = ColumnConfig.createColumn('cusip');
        column2.columnKey = 'cusip_2';
        column2.columnFilters = new TabularColumnFilters();
        columnSet.columns.push(column2);

        const requestParams: any = {};
        columnSet.addRequestParams(requestParams, 'column');
        expect(requestParams).toEqual({
            column: [{
                columnTag: 'market_val',
                columnKey: 'market_val_1',
                positionColumnType: 'PORT',
                title: 'Market Value',
                optionValues: {
                    decimalPlaces: 2,
                    useThousandsSeparator: true,
                    scaling: 2
                }
            },
                {
                    columnKey: 'cusip_2',
                    columnTag: 'cusip'
                }]
        });
    });

    /**
     * Tests the addRequestColumns for Style Analysis column
     */
    it('Test addRequestColumns function for style analysis column', () => {
        const columnSet: ColumnSet = new ColumnSet();
        const column1: ColumnConfig = ColumnConfig.createColumn('forecast_growth', 'PORT');
        column1.columnKey = 'forecast_growth_1';
        column1.optionValues.push(new StyleAnalysisColumnOption({
            'measures': {
                'dps_growth_fy1_1': {
                    'columnTag': 'dps_growth_fy1',
                    'positionColumnType': 'ALL',
                    'title': 'DPS Growth (FY+1)'
                }
            },
            'showMeasures': true,
            'styleMeasureMapping': {
                'dps_growth_fy1_1': {
                    'min': -100,
                    'max': 100,
                    'weight': 0.25,
                    'isNormal': true,
                    'configType': 'StyleMeasureMetaData'
                }
            },
            'configType': 'styleAnalysis'
        }));
        columnSet.columns.push(column1);

        const column2: ColumnConfig = ColumnConfig.createColumn('forecast_growth', 'PORT');
        column2.columnKey = 'forecast_growth_2';
        column2.optionValues.push(new StyleAnalysisColumnOption());
        columnSet.columns.push(column2);

        const requestParams: any = {};
        columnSet.addRequestParams(requestParams, 'column');
        expect(Object.entries(requestParams.column[0].optionValues.styleAnalysis.aliasDependencyMap).length).toBe(1);
        expect(Object.entries(requestParams.column[1].optionValues.styleAnalysis.aliasDependencyMap).length).toBe(4);
    });

    /**
     * Tests the getColumnBasedOnColTagAndUse function
     */
    it('Test getColumnBasedOnColTagAndUse function', () => {
        const columnSet: ColumnSet = new ColumnSet();
        const column1: ColumnConfig = ColumnConfig.createColumn('market_val', 'PORT');
        column1.columnKey = 'market_val_1';
        columnSet.columns.push(column1);

        let matchingCol = columnSet.getColumnBasedOnColTagAndUse('market_val', 'PORT');
        expect(matchingCol).toBeDefined();
        expect(matchingCol.columnKey).toBe('market_val_1');

        matchingCol = columnSet.getColumnBasedOnColTagAndUse('market_val', 'BENCH');
        expect(matchingCol).not.toBeDefined();

        matchingCol = columnSet.getColumnBasedOnColTagAndUse('cusip', 'ALL');
        expect(matchingCol).not.toBeDefined();
    });


    /**
     * Tests createColumnAndAdd
     */
    it('createColumnAndAdd - column key is undefined', () => {
        runCreateColumnAndAddAndValidate(undefined);
    });

    /**
     * Tests createColumnAndAdd
     */
    it('createColumnAndAdd - column key is defined', () => {
        runCreateColumnAndAddAndValidate('aaa');
    });


    /**
     * Test case for getModifiedWidgetTitleDetails
     */
    it('Test getModifiedWidgetTitleDetails', () => {
        /**
         * Test case for condition where columns[] is not empty
         */
        const columnset: ColumnSet = new ColumnSet();
        columnset.columns = [ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'abcd')];
        const details = columnset.getModifiedWidgetTitleDetails();
        expect(details).toBe('abcd');
        /**
         * Test case for condition when columns[] is empty
         */
        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns = [];
        const details1 = columnSet.getModifiedWidgetTitleDetails();
        expect(details1).toBe('');
    });

    /**
     * Runs AbstractWidgetService.createColumnAndAdd and validates the result
     * @param columnKey a column key for the column to create
     */
    function runCreateColumnAndAddAndValidate(columnKey: string) {
        // Mock the column creation
        const columnConfigSpy = ColumnOptionTestUtils.mockColumnCreation();

        // Create the parameters and expected outcome
        const columnSet = new ColumnSet();
        const columnTag = 'xyz';
        const expectedColumnKey = isNil(columnKey) ? columnTag : columnKey;

        // Run the method
        const createdColumn = columnSet.createColumnAndAdd(columnTag, columnKey);

        // Validate
        expect(columnSet.columns.length).toStrictEqual(1);
        expect(createdColumn).toBeDefined();
        expect(columnConfigSpy).toHaveBeenCalledTimes(1);
        expect(columnConfigSpy).toHaveBeenCalledWith(columnTag, undefined, expectedColumnKey, undefined);
    }

    it('should not throw error with bad favorite', () => {
        const columnSet = new ColumnSet({TEST: 'BAD FAVORITE'});
        const columnSet2 = new ColumnSet('BAD FAVORITE');

        expect(columnSet.columns).toEqual([]);
        expect(columnSet2.columns).toEqual([]);
    });

    it('should clear change detection flags from columns', () => {
        const col1 = ColumnConfig.createColumn('pnl_contr', UseType.PORT);
        const aggregationColOption = new AggregationColumnOption();
        aggregationColOption.optionState = ConfigState.MODIFIED;
        col1.optionValues.push(aggregationColOption);

        const col2 = ColumnConfig.createColumn('market_val', UseType.ACTIVE);
        const activeColOption = new ActiveCalculationColumnOption();
        activeColOption.optionState = ConfigState.MODIFIED;
        col2.optionValues.push(activeColOption);

        const customCalcCol = ColumnConfig.createColumn(CustomCalculationConstants.CUSTOM_CALCULATION, UseType.ALL);
        customCalcCol.id = 12345;
        const ccAggColOption = new AggregationColumnOption();
        ccAggColOption.optionState = ConfigState.MODIFIED;
        customCalcCol.optionValues.push(ccAggColOption);

        const columnSet = new ColumnSet();
        columnSet.columns = [col1, col2, customCalcCol];
        columnSet.columnState.changeState = ConfigState.MODIFIED;

        expect(columnSet.columns[0].getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(columnSet.columns[1].getOptionValueByConfigType(ActiveCalculationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(columnSet.columns[2].getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(columnSet.columnState.changeState).toEqual(ConfigState.MODIFIED);

        columnSet.resetChangeDetectionFlags();

        expect(columnSet.columns[0].getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.EXISTING);
        expect(columnSet.columns[1].getOptionValueByConfigType(ActiveCalculationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.EXISTING);
        expect(columnSet.columns[2].getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(columnSet.columnState.changeState).toEqual(ConfigState.EXISTING);
    });
});
