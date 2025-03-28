import {TestUtils} from '@utils/test.utils';
import {TimeSpanDataFormatter} from './time-span-data.formatter';
import {TimeSpanColumnFormat} from '../column-formats/time-span-column-format.model';
import {LibColumnUtils, TimeToMaturityColumnOption} from '@blk/explore-ui-column-option';
import {ColumnConfig, FormatConstants} from '@blk/explore-ui-core';

/**
 * Test cases for TimeSpanDataFormatter class
 */
describe('TimeSpanDataFormatter', () => {

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    it('format - empty value', () => {
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const output = new TimeSpanDataFormatter(columnFormat, []).format(undefined);
        expect(output).toBe(null);
    });

    it('format - no column options', () => {
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        // No start date
        let output = new TimeSpanDataFormatter(columnFormat, []).format('800');
        expect(output).toBe('2.19Y');

        output = new TimeSpanDataFormatter(columnFormat, []).format('2, 10-Mar-2016');
        expect(output).toBe('2D');
    });


    it('format - with column options - custom time unit', () => {
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const colOption = new TimeToMaturityColumnOption();

        let output = new TimeSpanDataFormatter(columnFormat, []).format('800');
        expect(output).toBe('2.19Y');

        colOption.timeUnit = FormatConstants.CUSTOM;
        colOption.customScalingBandsDays = 90;
        colOption.customScalingBandsMonths = 24;
        output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('93, 10-Mar-2016');
        expect(output).toBe('3M');

        output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('89, 10-Mar-2016');
        expect(output).toBe('89D');

        colOption.decimalPlaces = 2;
        output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('800, 10-Mar-2016');
        expect(output).toBe('2.19Y');

        colOption.decimalPlaces = 2;
        output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('-800, 10-Mar-2016');
        expect(output).toBe('-2.19Y');
    });


    it('format - with column options - non custom time unit', () => {
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const colOption = new TimeToMaturityColumnOption();
        colOption.timeUnit = FormatConstants.DAYS;
        colOption.customScalingBandsDays = 90;
        colOption.customScalingBandsMonths = 24;
        let output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('93, 10-Mar-2016');
        expect(output).toBe('93D');

        colOption.decimalPlaces = 2;
        colOption.timeUnit = FormatConstants.MONTHS;
        output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('89, 10-Mar-2016');
        expect(output).toBe('2.90M');


        colOption.timeUnit = FormatConstants.YEARS;
        output = new TimeSpanDataFormatter(columnFormat, [colOption]).format('800, 10-Mar-2016');
        expect(output).toBe('2.19Y');
    });

    describe('converToRaw test', () => {
        it('should convert a number into day format', () => {
            const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
            const columnDef = LibColumnUtils.getColumnDefinition(col);
            const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
            const output = new TimeSpanDataFormatter(columnFormat, []).convertToRaw('12, 10-Mar-2016');
            expect(output).toBe('12D');
        });

        it('should return null if a non-number is entered', () => {
            const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
            const columnDef = LibColumnUtils.getColumnDefinition(col);
            const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
            const output = new TimeSpanDataFormatter(columnFormat, []).convertToRaw('non_number');
            expect(output).toBeNull();
        });
    });

    it('should return the different value when comparing', () => {
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const output = new TimeSpanDataFormatter(columnFormat, []).getComparableValue('12, 10-Mar-2016');
        expect(output).toEqual(12);
    });

    it('getComparableValue should return shorten comparable value main case', () =>{
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const output = new TimeSpanDataFormatter(columnFormat, []).getComparableValue('123, 25-Mar-2024');
        expect(output).toEqual(123);
    });

    it('getComparableValue should return shorten value other case', () =>{
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const output = new TimeSpanDataFormatter(columnFormat, []).getComparableValue('123D');
        expect(output).toEqual(123);
    });

    it('getComparableValue should not interfere value', () =>{
        const col = ColumnConfig.createColumn('time_to_mat', 'PORT');
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as TimeSpanColumnFormat;
        const output = new TimeSpanDataFormatter(columnFormat, []).getComparableValue('25-Mar-2024');
        expect(output).toEqual('25-Mar-2024');
    });
});
