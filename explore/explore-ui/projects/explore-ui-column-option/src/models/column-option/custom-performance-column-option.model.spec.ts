import {ColumnConfig, ColumnOptionFactory, ExploreInputValidationInfo, NotificationType,CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';
import {CustomPerformanceColumnOption} from './custom-performance-column-option.model';

describe('CustomPerformanceColumnOption', () => {

    let customPerformanceColumnOption: CustomPerformanceColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(CustomPerformanceColumnOption.CONFIG_TYPE, CustomPerformanceColumnOption);
    });

    beforeEach((() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        customPerformanceColumnOption = new CustomPerformanceColumnOption();
        customPerformanceColumnOption.positionColumnType = 'Portfolio';
        customPerformanceColumnOption.performanceColumnType = 'Contribution';
        const underlyingColumns: ColumnConfig[] = [];
        underlyingColumns.push(ColumnConfig.createColumn('acct_fees_contr', 'PORT', 'acct_fees_contr_0', 'Accounting Fees Contribution'));
        underlyingColumns.push(ColumnConfig.createColumn('conv_contr', 'PORT', 'conv_contr_1', 'Convexity Contribution'));
        customPerformanceColumnOption.underlyingColumns = underlyingColumns;
    }));

    it('Test model initialization', () => {
        validateCustomPerformanceDefaultOptions(customPerformanceColumnOption);
    });

    it('test CreateRequest Params', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const optionValues: any = {};
        customPerformanceColumnOption.addRequestParams(optionValues);
        expect(optionValues.underlyingColumns.length).toBe(2);
        expect(optionValues.underlyingColumns[0].columnTag).toBe('acct_fees_contr');
        expect(optionValues.positionColumnType).toBe('Portfolio');
        expect(optionValues.performanceColumnType).toBe('Contribution');
    });

    it('Test serialize / deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const data = customPerformanceColumnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.positionColumnType).toBe('Portfolio');
        expect(data.performanceColumnType).toBe('Contribution');
        expect(data.underlyingColumns).not.toBeUndefined();
        expect(data.underlyingColumns).not.toBeNull();
        expect(data.underlyingColumns.length).toBe(2);
        expect(data.underlyingColumns[0].columnTag).toBe('acct_fees_contr');

        const deserializedModel: CustomPerformanceColumnOption = new CustomPerformanceColumnOption(data);

        validateCustomPerformanceDefaultOptions(deserializedModel);
    });

    it('Test isValid/isValidColumnOption for valid input', () => {
        expect(customPerformanceColumnOption.isValidColumnOption()).toBeUndefined();
        expect(customPerformanceColumnOption.isValid()).toBe(true);
    });

    it('Test isValidColumnOption for invalid input', () => {
        customPerformanceColumnOption.underlyingColumns = [];
        const validityObj: any = customPerformanceColumnOption.isValidColumnOption();
        expect(validityObj instanceof ExploreInputValidationInfo).toBe(true);
        expect(validityObj.notificationType).toBe(NotificationType.ERROR);
        expect(validityObj.message).toBe('Underlying Columns are not defined for custom performance column.');
        expect(customPerformanceColumnOption.isValid()).toBe(false);
    });

    it('tests equals', () => {
        const underlyingColumns: ColumnConfig[] = [];
        underlyingColumns.push(ColumnConfig.createColumn('acct_fees_contr', 'PORT', 'acct_fees_contr_0', 'Accounting Fees Contribution'));
        let otherCustomPerformanceColumnOption = new CustomPerformanceColumnOption({
            positionColumnType: 'Benchmark',
            performanceColumnType: 'Return',
            underlyingColumns
        });

        // Different positionColumnType, performanceColumnType and underlyingColumns
        expect(customPerformanceColumnOption.equals(otherCustomPerformanceColumnOption)).toBe(false);

        // Different positionColumnType, performanceColumnType and same underlyingColumns
        underlyingColumns.push(ColumnConfig.createColumn('conv_contr', 'PORT', 'conv_contr_1', 'Convexity Contribution'));
        otherCustomPerformanceColumnOption = new CustomPerformanceColumnOption({
            positionColumnType: 'Benchmark',
            performanceColumnType: 'Return',
            underlyingColumns
        });
        expect(customPerformanceColumnOption.equals(otherCustomPerformanceColumnOption)).toBe(false);

        // Different positionColumnType and same performanceColumnType, underlyingColumns
        otherCustomPerformanceColumnOption = new CustomPerformanceColumnOption({
            positionColumnType: 'Benchmark',
            performanceColumnType: 'Contribution',
            underlyingColumns
        });
        expect(customPerformanceColumnOption.equals(otherCustomPerformanceColumnOption)).toBe(false);

        // same positionColumnType, performanceColumnType and underlyingColumns
        otherCustomPerformanceColumnOption = new CustomPerformanceColumnOption({
            positionColumnType: 'Portfolio',
            performanceColumnType: 'Contribution',
            underlyingColumns
        });
        expect(customPerformanceColumnOption.equals(otherCustomPerformanceColumnOption)).toBe(true);
    });

    /**
     * to => validate the default initialized options
     */
    function validateCustomPerformanceDefaultOptions(customPerfColumnOption: CustomPerformanceColumnOption): void {
        expect(customPerfColumnOption).not.toBeUndefined();
        expect(customPerfColumnOption).not.toBeNull();
        expect(customPerfColumnOption.positionColumnType).toBe('Portfolio');
        expect(customPerfColumnOption.performanceColumnType).toBe('Contribution');
        expect(customPerfColumnOption.underlyingColumns.length).toBe(2);
        expect(customPerfColumnOption.underlyingColumns[0] instanceof ColumnConfig).toBeTruthy();
        expect(customPerfColumnOption.underlyingColumns[0].columnTag).toBe('acct_fees_contr');
    }

});
