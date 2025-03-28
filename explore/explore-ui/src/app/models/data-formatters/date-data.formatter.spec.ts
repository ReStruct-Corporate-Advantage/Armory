import {TestUtils} from '@utils/test.utils';
import {DateDataFormatter} from './date-data.formatter';
import {DateFormat} from '../column-formats/date-format.model';
import {CoreColumnUtils, DateFormatConstants} from '@blk/explore-ui-core';
import {DateColumnFormatColumnOption} from '@blk/explore-ui-column-option';

/**
 * Test cases for DateDataFormatter class
 */
describe('DateDataFormatter', () => {

    beforeAll((done) => {
        TestUtils.initialize(done);
    });


    it('formatValue - no column options', () => {
        const columnDefinition = CoreColumnUtils.getColumnDefByTag('issue_date');
        const columnFormat = columnDefinition.columnFormat as DateFormat;
        let output = new DateDataFormatter(columnFormat, []).format('01-OCT-2006');
        expect(output).toBe('01-Oct-2006');

        columnFormat.value = 'mm-dd-yyyy';
        output = new DateDataFormatter(columnFormat, []).format('01-OCT-2006');
        expect(output).toBe('10-01-2006');

        columnFormat.value = DateFormatConstants.EEEE_MMMM_d_yyyy;
        output = new DateDataFormatter(columnFormat, []).format('01-OCT-2006');
        expect(output).toBe('Sunday, October 1, 2006');

        // Invalid date
        output = new DateDataFormatter(columnFormat, []).format('invalid date');
        expect(output).toBe('Invalid date');
    });


    it('formatValue - with column options', () => {
        const columnDef  = CoreColumnUtils.getColumnDefByTag('issue_date');
        const columnFormat = columnDef.columnFormat as DateFormat;
        const colOption = new DateColumnFormatColumnOption();
        let output = new DateDataFormatter(columnFormat, [colOption]).format('01-OCT-2006');
        expect(output).toBe('01-Oct-2006');

        colOption.value = 'yyyy-mm-dd';
        output = new DateDataFormatter(columnFormat, [colOption]).format('01-OCT-2006');
        expect(output).toBe('2006-10-01');
    });

    describe('convertToRaw tests', () => {
        it('should convert date to default column date format', () => {
            const columnDefinition = CoreColumnUtils.getColumnDefByTag('issue_date');
            const columnFormat = columnDefinition.columnFormat as DateFormat;
            const output = new DateDataFormatter(columnFormat, []).convertToRaw('12-25-2020');
            expect(output).toBe('25-Dec-2020');
        });

        it('should handle many different user inputted date formats', () => {
            const columnDefinition = CoreColumnUtils.getColumnDefByTag('issue_date');
            const columnFormat = columnDefinition.columnFormat as DateFormat;

            const dateFormatter = new DateDataFormatter(columnFormat, []);

            const expectedDate = '25-Dec-2020';

            let output = dateFormatter.convertToRaw('Dec-25-20');
            expect(output).toBe(expectedDate);

            output = dateFormatter.convertToRaw('25/12/2020');
            expect(output).toBe(expectedDate);

            output = dateFormatter.convertToRaw('12-25-2020');
            expect(output).toBe(expectedDate);

            output = dateFormatter.convertToRaw('25/12/20');
            expect(output).toBe(expectedDate);
        });

        it('should return null if cannot parse date', () => {
            const columnDefinition = CoreColumnUtils.getColumnDefByTag('issue_date');
            const columnFormat = columnDefinition.columnFormat as DateFormat;
            const output = new DateDataFormatter(columnFormat, []).convertToRaw('BAD_DATE_VALUE');
            expect(output).toBeNull();
        });
    });

    it('should get a Date object for comparing to other dates', () => {
        const columnDefinition = CoreColumnUtils.getColumnDefByTag('issue_date');
        const columnFormat = columnDefinition.columnFormat as DateFormat;
        const output = new DateDataFormatter(columnFormat, []).getComparableValue('25-DEC-2020');

        expect(output instanceof Date).toBe(true);
        // month is 11 because in TS its 0-11
        expect(output).toEqual(new Date(2020, 11, 25));
    });

});
