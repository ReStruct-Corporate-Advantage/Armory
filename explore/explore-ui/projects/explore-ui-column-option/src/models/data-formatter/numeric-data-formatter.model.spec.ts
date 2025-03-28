import {
    ColumnConfig,
    CoreColumnUtils,
    CoreCommonConstants,
    CoreTestUtils,
    NumericColumnFormat
} from '@blk/explore-ui-core';
import {ColumnOptionInitializer} from '../../column-option.initializer';
import {LibColumnUtils} from '../../utils';
import {NumericColumnFormatColumnOption} from '../column-option/numeric-column-format-column-option.model';
import {NumericDataFormatter} from './numeric-data-formatter.model';

/**
 * Test cases for NumericDataFormatter class
 */
describe('NumericDataFormatter', () => {
    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreTestUtils.initDefinitions();
    });

    it('format on null and non numeric data', () => {
        let output = new NumericDataFormatter(null, []).format('abc');
        expect(output).toBe('abc');

        output = new NumericDataFormatter(null, []).format(null);
        expect(output).toBe(null);

        output = new NumericDataFormatter(null, []).format(undefined);
        expect(output).toBe(null);

        output = new NumericDataFormatter(null, []).format('');
        expect(output).toBe('');
    });

    describe('format Test', () => {
        let col, columnDef, columnFormat;

        beforeAll(() => {
            col = {columnTag: 'market_val'};
            columnDef = LibColumnUtils.getColumnDefinition(col);
            columnFormat = columnDef.columnFormat as NumericColumnFormat;
        });

        it('format - no column options', () => {
            // Numeric formatter
            let expected = '1,000';
            let output = new NumericDataFormatter(columnFormat, []).format(1000000.12345);
            expect(output).toBe(expected);

            // 2 decimal places, no separator
            columnFormat.decimalPlaces = 2;
            columnFormat.isUseThousandsSeparator = false;
            columnFormat.scalingFactor = 1;
            expected = '1000000.12';
            output = new NumericDataFormatter(columnFormat, []).format(1000000.12345);
            expect(output).toBe(expected);

            // Check for O values
            expected = '0.00';
            output = new NumericDataFormatter(columnFormat, []).format(0);
            expect(output).toBe(expected);
        });

        it('format - with column options', () => {
            // Numeric formatter
            const colOption = new NumericColumnFormatColumnOption();
            columnFormat.decimalPlaces = 2;
            columnFormat.isUseThousandsSeparator = false;
            columnFormat.scalingFactor = 1;
            let output = new NumericDataFormatter(columnFormat, [colOption]).format(1000000.12367);
            expect(output).toBe('1000000.12');

            colOption.useThousandsSeparator = false;
            colOption.decimalPlaces = 2;
            colOption.scaling = 0.1;

            const expected = '10000001.24';
            output = new NumericDataFormatter(columnFormat, [colOption]).format(1000000.12367);
            expect(output).toBe(expected);
        });
    });

    describe('formatInShort Test', () => {
        let col, columnDef, columnFormat;

        beforeAll(() => {
            col = {columnTag: 'market_val'};
            columnDef = LibColumnUtils.getColumnDefinition(col);
            columnFormat = columnDef.columnFormat as NumericColumnFormat;
            columnFormat.decimalPlaces = 2;
            columnFormat.isUseThousandsSeparator = false;
            columnFormat.scalingFactor = 1;
        });

        it('should return undefined if the input is not number', () => {
            const output = new NumericDataFormatter(columnFormat, []).formatInShort('1.1234' as any);
            expect(output).toBeUndefined();
        });

        it('should return formatted string if the decimalPlaces is from input', () => {
            const output1 = new NumericDataFormatter(columnFormat, []).formatInShort(1.1234, 0);
            expect(output1).toBe('1');

            const output2 = new NumericDataFormatter(columnFormat, []).formatInShort(1234.1234, 0);
            expect(output2).toBe('1K');

            const output3 = new NumericDataFormatter(columnFormat, []).formatInShort(1234567.1234, 0);
            expect(output3).toBe('1M');

            const output4 = new NumericDataFormatter(columnFormat, []).formatInShort(1234567890.1234, 0);
            expect(output4).toBe('1B');

            const output5 = new NumericDataFormatter(columnFormat, []).formatInShort(1234567890123.1234, 0);
            expect(output5).toBe('1T');
        });

        it('should return formatted string with decimalPlaces from (optionValue/columnFormat) ', () => {
            const output1 = new NumericDataFormatter(columnFormat, []).formatInShort(1.1234);
            expect(output1).toBe('1.12');

            const output2 = new NumericDataFormatter(columnFormat, []).formatInShort(1234.1234);
            expect(output2).toBe('1.23K');

            const output3 = new NumericDataFormatter(columnFormat, []).formatInShort(1234567.1234);
            expect(output3).toBe('1.23M');

            const output4 = new NumericDataFormatter(columnFormat, []).formatInShort(1234567890.1234);
            expect(output4).toBe('1.23B');

            const output5 = new NumericDataFormatter(columnFormat, []).formatInShort(1234567890123.1234);
            expect(output5).toBe('1.23T');
        });
    });

    describe('format Test', () => {
        let col, columnDef, columnFormat;

        beforeAll(() => {
            col = {columnTag: 'market_val'};
            columnDef = LibColumnUtils.getColumnDefinition(col);
            columnFormat = columnDef.columnFormat as NumericColumnFormat;
        });

        it('should round the value to the specified number of decimal places', () => {
            const roundedValue = new NumericDataFormatter({
                ...columnFormat,
                decimalPlaces: 2
            }, []).roundValue(1234.56789);
            expect(roundedValue).toBe('1234.57');

            const roundedValue2 = new NumericDataFormatter({
                ...columnFormat,
                decimalPlaces: 3
            }, []).roundValue(1234.1234);
            expect(roundedValue2).toBe('1234.123');
        });
    });

    describe('convertToRaw Tests', () => {
        it('should get raw value for a percentage', () => {
            const col = ColumnConfig.createColumn('pct_mv');
            const columnDef = LibColumnUtils.getColumnDefinition(col);
            const columnFormat = columnDef.columnFormat as NumericColumnFormat;
            const output = new NumericDataFormatter(columnFormat, []).convertToRaw(50);
            expect(output).toBe(0.50);
        });

        it('should remove commas', () => {
            const col = ColumnConfig.createColumn('market_val');
            const columnDef = LibColumnUtils.getColumnDefinition(col);
            const columnFormat = columnDef.columnFormat as NumericColumnFormat;
            const output = new NumericDataFormatter(columnFormat, []).convertToRaw('1,000');
            expect(output).toBe(1000000);
        });

        it('should return null if a non-number is entered', () => {
            const col = ColumnConfig.createColumn('market_val');
            const columnDef = LibColumnUtils.getColumnDefinition(col);
            const columnFormat = columnDef.columnFormat as NumericColumnFormat;
            const output = new NumericDataFormatter(columnFormat, []).convertToRaw('non_number');
            expect(output).toBeNull();
        });
    });

    it('should return back a number when comparing', () => {
        const columnDefinition = CoreColumnUtils.getColumnDefByTag('market_val');
        const columnFormat = columnDefinition.columnFormat as NumericColumnFormat;
        const output = new NumericDataFormatter(columnFormat, []).getComparableValue('10000');

        expect(output).toEqual(10000);
    });

    it('should return correct scaling if saved with None, bps or percentage', () => {
        const scalingOptions = new Map<string, number>();
        scalingOptions.set('Basis Point (bp)', 1);
        scalingOptions.set('Percent (%)', 100);
        const columnDefinition = CoreColumnUtils.getColumnDefByTag('port_risk_contr');
        const columnFormat = columnDefinition.columnFormat as NumericColumnFormat;
        columnFormat.scalingFactor = 1;
        columnFormat.scalingOptions = scalingOptions;
        // Numeric formatter
        const colOption = new NumericColumnFormatColumnOption();
        // if saved workspace was in bps with scaling 0.0001
        colOption.scaling = 0.0001;
        expect(new NumericDataFormatter(columnFormat, [colOption]).getScaling()).toEqual(1);

        // Numeric formatter
        const colOption1 = new NumericColumnFormatColumnOption();
        // if saved workspace was in percent with scaling 0.01
        colOption1.scaling = 0.01;
        expect(new NumericDataFormatter(columnFormat, [colOption1]).getScaling()).toEqual(100);

        // Numeric formatter
        const colOption2 = new NumericColumnFormatColumnOption();
        // if saved workspace was in none with scaling 1
        colOption2.scaling = 1;
        expect(new NumericDataFormatter(columnFormat, [colOption2]).getScaling()).toEqual(1);
    });

    it('Test getScalingOptionString', () => {
        const columnDefinition = CoreColumnUtils.getColumnDefByTag('market_val');
        const columnFormat = columnDefinition.columnFormat as NumericColumnFormat;
        const numericDataFormatter = new NumericDataFormatter(columnFormat, []);

        // Defaults to Thousands
        expect(numericDataFormatter.getScalingOptionString()).toEqual(CoreCommonConstants.THOUSANDS);
        columnFormat.scalingFactor = 0.0001;
        expect(numericDataFormatter.getScalingOptionString()).toEqual(CoreCommonConstants.BASIS_POINT);
        columnFormat.scalingFactor = 0.01;
        expect(numericDataFormatter.getScalingOptionString()).toEqual(CoreCommonConstants.PERCENT);
        columnFormat.scalingFactor = 1000;
        expect(numericDataFormatter.getScalingOptionString()).toEqual(CoreCommonConstants.THOUSANDS);
        columnFormat.scalingFactor = 1000000;
        expect(numericDataFormatter.getScalingOptionString()).toEqual(CoreCommonConstants.MILLIONS);
        columnFormat.scalingFactor = 1000000000;
        expect(numericDataFormatter.getScalingOptionString()).toEqual(CoreCommonConstants.BILLIONS);
        columnFormat.scalingFactor = 1;
        expect(numericDataFormatter.getScalingOptionString()).toEqual('');
    });

    it('Test getScaleUnit', () => {
        const columnDefinition = CoreColumnUtils.getColumnDefByTag('market_val');
        const columnFormat = columnDefinition.columnFormat as NumericColumnFormat;
        const numericDataFormatter = new NumericDataFormatter(columnFormat, []);

        columnFormat.scalingFactor = 1000;
        expect(numericDataFormatter.getScaleUnit()).toEqual(CoreCommonConstants.M);
        columnFormat.scalingFactor = 1000000;
        expect(numericDataFormatter.getScaleUnit()).toEqual(CoreCommonConstants.MM);
        columnFormat.scalingFactor = 1000000000;
        expect(numericDataFormatter.getScaleUnit()).toEqual(CoreCommonConstants.MMM);
        columnFormat.scalingFactor = 1;
        expect(numericDataFormatter.getScaleUnit()).toEqual('');
    });
});
