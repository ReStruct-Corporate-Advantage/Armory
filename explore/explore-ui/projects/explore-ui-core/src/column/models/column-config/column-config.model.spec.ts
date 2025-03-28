import {ColumnOptionInitializer} from '../../../../../explore-ui-column-option/src/column-option.initializer';
import {CustomCalculationConstants} from '../../../../../explore-ui-column-option/src/constants';
import {ActiveType} from '../../../../../explore-ui-column-option/src/enums';
import {ActiveCalculationColumnOption} from '../../../../../explore-ui-column-option/src/models/column-option/active-calculation-column-option.model';
import {AggregationColumnOption} from '../../../../../explore-ui-column-option/src/models/column-option/aggregation-column-option.model';
import {CustomCalculationColumnOption} from '../../../../../explore-ui-column-option/src/models/column-option/custom-calculation-column-option.model';
import {OverrideDateColumnOption} from '../../../../../explore-ui-column-option/src/models/column-option/override-date-column-option.model';
import {RbcRegimeSettingsColumnOption} from '../../../../../explore-ui-column-option/src/models/column-option/rbc-regime-settings-column-option.model';
import {CoreUserMetaDataStore} from '../../../user-meta-data/core-user-meta-data.store';
import {UserMetaData} from '../../../user-meta-data/user-meta-data.model';
import {ColumnConfig} from './column-config.model';
import {TabularColumnFilters} from '../tabular-column-filter/tabular-column-filter.model';
import {UseType} from '../../../core/enums';
import {CommonUtils} from '../../../core/utils';
import {ColumnDefinition} from '../../../definition/models/column-definition.model';
import {CoreCommonConstants} from '../../../core/constants';
import {CoreColumnUtils} from '../../core-column.utils';
import {IShareDefinition} from '../../../definition/models/ishare-definition.model';
import {PerformanceSettings} from '../../../performance/models/performance-settings/performance-settings.model';

/**
 * This test file tests on a ColumnConfig
 */
describe('ColumnConfig tests', () => {
    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        ColumnOptionInitializer.registerColumnOptionTypes();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /**
     * Tests getColumnTitleForWidgetTitleDetails
     */
    it('Test getColumnTitleForWidgetTitleDetails', () => {
        const column = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %');
        expect(column.getColumnTitleForWidgetTitleDetails()).toBe('Market Value %');
        column.optionValues.push(new ActiveCalculationColumnOption());
        column.optionValues.push(new RbcRegimeSettingsColumnOption());
        expect(column.getColumnTitleForWidgetTitleDetails()).toBe('Market Value % - ');
    });

    /**
     * Test calling serialize on the ColumnConfig and then using that generated string to deserialize into a new ColumnConfig and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const colConfig: ColumnConfig = new ColumnConfig('col_tag');
        colConfig.positionColumnType = 'PORT';
        colConfig.columnKey = 'colKey';
        colConfig.optionValues = [];
        colConfig.optionValues.push(new AggregationColumnOption({aggregationType: 1}));
        colConfig.title = 'ABC';

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(colConfig.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newColConfig: ColumnConfig = new ColumnConfig(deserializedData);

        // Validate that the before and after are the same.
        expect(colConfig.columnTag).toBe(newColConfig.columnTag);
        expect(colConfig.columnKey).toBe(newColConfig.columnKey);
        expect(colConfig.positionColumnType).toBe(newColConfig.positionColumnType);
        expect(newColConfig.optionValues.length).toBe(1);
        expect(newColConfig.optionValues[0] instanceof AggregationColumnOption).toBeTruthy();
        expect((newColConfig.optionValues[0] as AggregationColumnOption).value).toBe(1);

        // The column title is intentionally not serialized as we updated it when we load the reports as it can be changed from the database.
        expect(newColConfig.columnTitle).toBeUndefined();
    });

    /**
     * Test deserialising the column when it only contains the columnTag property.
     */
    it('Serialize/Deserialize test - Only columnTag', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const colConfig: ColumnConfig = new ColumnConfig('col_tag');

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(colConfig.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newColConfig: ColumnConfig = new ColumnConfig(deserializedData);

        // Validate that the before and after are the same.
        expect(colConfig.columnTag).toBe(newColConfig.columnTag);
        expect(newColConfig.columnKey).toBeUndefined();
        expect(newColConfig.positionColumnType).toBeUndefined();
        expect(newColConfig.optionValues.length).toBe(0);
    });

    /**
     * Test deserializing the column with a column filter
     */
    it('Serialize/Deserialize test - with column filter', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const colConfig: ColumnConfig = new ColumnConfig('col_tag');
        colConfig.positionColumnType = 'PORT';
        colConfig.columnKey = 'colKey';
        colConfig.title = 'ABC';
        colConfig.columnFilters = new TabularColumnFilters();
        colConfig.columnFilters.columnFilters = {colKey: {filter: 'abc', type: 'contains', filterType: 'text'}};

        // Convert the object to string and then back to json again.
        const serializedData: any = colConfig.serialize();
        const serializedDataString: string = JSON.stringify(serializedData);
        const deserializedData: any = JSON.parse(serializedDataString);
        const newColConfig: ColumnConfig = new ColumnConfig(deserializedData);

        // Validate that the before and after are the same.
        expect(colConfig.columnFilters).toEqual(newColConfig.columnFilters);
    });

    it('Deserialize test - with column filter already got deserialized in case of saved custom Calc', () => {
        const data: any = {
            columnTag: 'custom_calc',
            columnFilters: {filterType: 'number', type: 'greaterThan', filter: 12, filterTo: null}
        };

        const deserializedData: ColumnConfig = new ColumnConfig(data);
        // Now in case of saved CustomCalc it come again in deserialize so make sure we're not making any nested structure
        const doubleDeserializedData: ColumnConfig = new ColumnConfig(deserializedData);

        // doubleDeserializedData will have columnFilter with no nested structure, will match with the first deserializedData
        expect(doubleDeserializedData.columnFilters).toEqual(deserializedData.columnFilters);
    });

    it('doCopyFrom test case', () => {
        const colConfig = new ColumnConfig();

        const data: ColumnConfig = new ColumnConfig();
        data.columnTag = 'custom_calc';
        data.columnTitle = 'Custom Calculation';
        data.columnKey = 'cust_calc_123';
        data.positionColumnType = 'PORT';
        data.optionValues = [];
        data.columnFilters = new TabularColumnFilters({
            filterType: 'number',
            type: 'greaterThan',
            filter: 12,
            filterTo: null
        });

        colConfig.doCopyFrom(data);
        expect(colConfig.columnTag).toBe('custom_calc');
        expect(colConfig.columnTitle).toBe('Custom Calculation');
        expect(colConfig.columnKey).toBe('cust_calc_123');
        expect(colConfig.positionColumnType).toBe('PORT');
        expect(colConfig.optionValues).toStrictEqual([]);
        expect(colConfig.columnFilters).toStrictEqual(new TabularColumnFilters({
            filterType: 'number',
            type: 'greaterThan',
            filter: 12,
            filterTo: null
        }));
    });

    /**
     * Test the hasOptionValues function.
     */
    it('hasOptionValues', () => {
        const colConfig: ColumnConfig = ColumnConfig.createColumn('col_tag');

        // With undefined.
        colConfig.optionValues = undefined;
        expect(colConfig.hasOptionValues()).toBeFalsy();

        // With null.
        colConfig.optionValues = null;
        expect(colConfig.hasOptionValues()).toBeFalsy();

        // With empty object.
        colConfig.optionValues = [];
        expect(colConfig.hasOptionValues()).toBeFalsy();

        // With a setting.
        colConfig.optionValues.push(new AggregationColumnOption({aggregationType: 1}));
        expect(colConfig.hasOptionValues()).toBeTruthy();
    });

    describe('Test createRequestColumn', () => {
        // Create a column and put some column options on it, both a new model version and an old one.
        const colConfig: ColumnConfig = ColumnConfig.createColumn('market_val', 'PORT', 'market_val_0', 'Market Value');
        const colOption: AggregationColumnOption = new AggregationColumnOption();
        colOption.value = 1;
        colConfig.optionValues.push(colOption);

        /**
         * Test the createRequestColumn function.
         */
        it('createRequestColumn', () => {
            // Create the request column and validate that the expected values are there.
            const data: any = colConfig.createRequestColumn();
            expect(data).toBeDefined();
            expect(data).not.toBeNull();
            expect(data.columnTag).toBe(colConfig.columnTag);
            expect(data.positionColumnType).toBe(colConfig.positionColumnType);
            expect(data.columnKey).toBe(colConfig.columnKey);
            expect(data.title).toBe(colConfig.columnTitle);
            expect(data.optionValues).toBeDefined();
            expect(data.optionValues.aggregationType).toBe(colOption.value);
        });

        it('Test createRequestColumn with columnFilters', () => {
            // First test with empty columnFilters
            // Pass in true for 'isExportRequest'
            let data: any = colConfig.createRequestColumn(true);
            expect(data.columnFilters).toBeUndefined();

            const tabularColumnFilters = new TabularColumnFilters();
            tabularColumnFilters.columnFilters = {
                market_val_0: {
                    filter: '100',
                    type: 'greaterThan',
                    filterType: 'number'
                }
            };
            colConfig.columnFilters = tabularColumnFilters;

            data = colConfig.createRequestColumn(true);
            expect(data.columnFilters).toEqual({
                market_val_0: {
                    filter: '100',
                    type: 'greaterThan',
                    filterType: 'number'
                }
            });
        });
    });

    /**
     * Tests that a whitespace gets replaced in a column tag when creating
     * ColumnConfig with the columnTag or deserialised data
     */
    it('test white space replacement in a column tag', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const colTag = ' sec   attr1  ';
        const expectedString = '_space_sec_space__space__space_attr1_space__space_';

        // Create a config with the column tag
        let colConfig: ColumnConfig = new ColumnConfig(colTag);
        // Check col tag has no whitespaces
        expect(colConfig.columnTag).toEqual(expectedString);

        // Create a config via deserialised object
        colConfig = new ColumnConfig(colTag);
        colConfig.positionColumnType = 'ALL';
        colConfig.columnKey = 'colKey';
        colConfig.columnTitle = 'ABC';

        const serializedData: string = JSON.stringify(colConfig.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newColConfig: ColumnConfig = new ColumnConfig(deserializedData);

        // Check col tag has no whitespaces
        expect(newColConfig.columnTag).toEqual(expectedString);
    });

    it('Test equals', () => {
        const model1: ColumnConfig = new ColumnConfig();
        const model2: ColumnConfig = new ColumnConfig();
        expect(model1.equals(model2)).toBeTruthy();

        // Different columnTag
        model1.columnTag = 'market_val';
        model2.columnTag = 'cusip';
        expect(model1.equals(model2)).toBeFalsy();

        // Different positionColumnType
        model2.columnTag = 'market_val';
        model1.positionColumnType = 'PORT';
        model2.positionColumnType = 'BENCH';
        expect(model1.equals(model2)).toBeFalsy();

        // Different columnKey
        model2.positionColumnType = 'PORT';
        model1.columnKey = 'market_val_1';
        model2.columnKey = 'market_val_2';
        expect(model1.equals(model2)).toBeFalsy();

        // Different number of column Options
        model2.columnKey = 'market_val_1';

        const colOption1: AggregationColumnOption = new AggregationColumnOption();
        colOption1.value = 1;

        const colOption2: ActiveCalculationColumnOption = new ActiveCalculationColumnOption();
        colOption2.activeType = ActiveType[ActiveType.DIFF_1MINUS2];

        model1.optionValues.push(colOption1);
        model1.optionValues.push(colOption2);
        model2.optionValues.push(colOption1);
        expect(model1.equals(model2)).toBeFalsy();

        // Same number of column options but different column options
        const colOption3: ActiveCalculationColumnOption = new ActiveCalculationColumnOption();
        colOption3.activeType = ActiveType[ActiveType.PCT_DIFF_BY_1];
        model2.optionValues.push(colOption3);
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same now
        colOption3.activeType = ActiveType[ActiveType.DIFF_1MINUS2];
        expect(model1.equals(model2)).toBeTruthy();
    });


    /**
     * Test case for method getOptionValueByConfigType
     */
    it('test getOptionValueByConfigType', () => {
        const colConfig: ColumnConfig = new ColumnConfig('col_tag');
        colConfig.optionValues.push(new AggregationColumnOption({aggregationType: 1}));
        colConfig.optionValues.push(new ActiveCalculationColumnOption({activeType: 'PCT_DIFF_BY_1'}));

        expect(colConfig.getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE) instanceof AggregationColumnOption).toBeTruthy();
        expect(colConfig.getOptionValueByConfigType(ActiveCalculationColumnOption.CONFIG_TYPE) instanceof ActiveCalculationColumnOption).toBeTruthy();
        expect(colConfig.getOptionValueByConfigType(OverrideDateColumnOption.CONFIG_TYPE)).toBeUndefined();
    });

    /**
     * Tests createColumn
     */
    it('test createColumn - with pos type and with title', () => {
        runCreateColumnAndValidate(UseType.ALL, 'title1', false);
    });

    /**
     * Tests createColumn
     */
    it('test createColumn - with pos type and without title', () => {
        runCreateColumnAndValidate(UseType.ALL, undefined, true);
    });

    /**
     * Tests createColumn
     */
    it('test createColumn - without pos type and with title', () => {
        runCreateColumnAndValidate(undefined, 'title1', false);
    });

    /**
     * Tests createColumn
     */
    it('test createColumn - without pos type and without title', () => {
        runCreateColumnAndValidate(undefined, undefined, false);
    });

    describe('createColumnFromColumnDefinition', () => {
        it('should call createColumn', () => {
            // Arrange
            const columnDefinitionMock = {
                columnTag: 'columnTag',
                uses: 'uses',
                title: 'title'
            };
            jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockImplementationOnce(() => '123456');
            const createColumnSpy = jest.spyOn(ColumnConfig, 'createColumn');

            // Act
            ColumnConfig.createColumnFromColumnDefinition(columnDefinitionMock as ColumnDefinition);

            // Assert
            expect(createColumnSpy).toHaveBeenCalledWith('columnTag', 'uses', 'columnTag_123456', 'title');
        });

        it('should update the title for RESEARCH_NOTE with topics', () => {
            // Arrange
            const input: ColumnDefinition = {
                columnType: 'RESEARCH_NOTE',
                columnTag: 'topics_example',
                title: 'Original Title',
                groups: ['Group1', 'Group2']
            };

            // Act
            const columnConfig = ColumnConfig.createColumnFromColumnDefinition(input);

        });

        it('should create a column from IShareDefinition', () => {
            // Arrange
            const input: IShareDefinition = new IShareDefinition('share_tag', 'Share Title', '123456', []);

            // Act
            const columnConfig = ColumnConfig.createColumnFromColumnDefinition(input);

            // Assert
            expect(columnConfig.columnTag).toBe('share_tag');
            expect(columnConfig.columnTitle).toBe('Share Title');
            expect(columnConfig.cusip).toBe('123456');

        });
    });

    /**
     * Runs createColumn and validates the result
     */
    function runCreateColumnAndValidate(positionColumnType: string, title: string, isTitleToBeOriginal: boolean) {
        // Create a mock on the title creation
        const dummyColumnTitle = 'xyz';
        const getOriginalColumnTitleSpy = jest.spyOn(CoreColumnUtils, 'getOriginalColumnTitle');
        getOriginalColumnTitleSpy.mockImplementation(jest.fn(() => {
            return dummyColumnTitle;
        }));

        // Run the method
        const columnTag = 'cusip';
        const columnKey = 'cusip1';
        const column = ColumnConfig.createColumn(columnTag, positionColumnType, columnKey, title);

        // Validate
        expect(column.columnTag).toStrictEqual(columnTag);
        expect(column.columnKey).toStrictEqual(columnKey);
        expect(column.positionColumnType).toStrictEqual(positionColumnType);

        let getOriginalColumnTitleSpyCalled: number;
        let expectedColumnTitle;
        if (isTitleToBeOriginal) {
            getOriginalColumnTitleSpyCalled = 1;
            expectedColumnTitle = dummyColumnTitle;
        } else {
            getOriginalColumnTitleSpyCalled = 0;
            expectedColumnTitle = title;
        }

        expect(column.columnTitle).toStrictEqual(expectedColumnTitle);
        expect(getOriginalColumnTitleSpy).toHaveBeenCalledTimes(getOriginalColumnTitleSpyCalled);
    }

    it('tests validateColumnOptionsToProceed', () => {
        const colConfig: ColumnConfig = new ColumnConfig();
        expect(colConfig.validateColumnOptionsToProceed()).toBe(CoreCommonConstants.EMPTY_STRING);

        colConfig.optionValues.push(new AggregationColumnOption());
        expect(colConfig.validateColumnOptionsToProceed()).toBe(CoreCommonConstants.EMPTY_STRING);

        colConfig.optionValues.push(new CustomCalculationColumnOption({expression: 'alert()'}));
        expect(colConfig.validateColumnOptionsToProceed()).toBe(CustomCalculationConstants.INVALID_JS_EXPRESSION_MESSAGE);
    });

    it('tests isPerformanceColumn', () => {
        const columnConfig: ColumnConfig = new ColumnConfig();

        let colDefSpy = jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType');
        colDefSpy.mockReturnValue(new PerformanceSettings());
        expect(columnConfig.isPerformanceColumn()).toBeTruthy();

        colDefSpy = jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType');
        colDefSpy.mockReturnValue(null);
        expect(columnConfig.isPerformanceColumn()).toBeFalsy();
    });
});
