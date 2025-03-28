import {DateFormatConstants} from '../../constants';
import {DateValue} from './date-value.model';

describe('DateValue', () => {
    it('test serialize/deserialize - relative', () => {
        const dateValueJson: any = {
            calCode: 'US_NYSE',
            dateString: true,
            dateStringValue: 'T-1ME'
        };
        const dateValue: DateValue = new DateValue(dateValueJson);
        const serializedBench: any = dateValue.serialize();
        expect(JSON.stringify(serializedBench)).toMatch(JSON.stringify(dateValueJson));
    });

    it('test serialize/deserialize - absolute', () => {
        const dateValueJson: any = {
            calCode: 'US_NYSE',
            dateString: false,
            date: '01/10/2020'
        };
        const dateValue: DateValue = new DateValue(dateValueJson);
        const serializedBench: any = dateValue.serialize();
        expect(JSON.stringify(serializedBench)).toMatch(JSON.stringify(dateValueJson));

        // Also make sure that the date is 10-Jan-2020.
        expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH)).toBe('10-Jan-2020');
    });

    it('test format function - Relative Date', () => {
       const dateValue = DateValue.newRelativeDate('T-5');
       expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH)).toBe('T-5');

       // Also make sure we get the relative date when we force the format to use date.
        expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH, true)).toBe('T-5');

        // Now test with a date specified too.
        dateValue.date = '01/10/2020';
        expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH)).toBe('T-5');
        expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH, false)).toBe('T-5');
        expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH, true)).toBe('10-Jan-2020');
    });

    it('test format function - Actual Date', () => {
        const dateValue = DateValue.newDate('01/10/2020');
        expect(dateValue.format(DateFormatConstants.DDMMMYYYY_DASH)).toBe('10-Jan-2020');

        // Try in the format that it is stored in.
        expect(dateValue.format(DateFormatConstants.MMDDYYYY_SLASH)).toBe('01/10/2020');

        // Test that the error is thrown when the date is not set.
        dateValue.date = undefined;
        expect(dateValue.format(DateFormatConstants.DDMMYYYY_SLASH)).toBeUndefined();
    });
    it('test equals - Actual Date', () => {
        const dateValue = DateValue.newDate('01/10/2020');
        const otherDate = DateValue.newDate('01/10/2020');
        expect(dateValue.equals(otherDate)).toBeTruthy();

        // Try with a different calender set.
        dateValue.calCode = '1';
        otherDate.calCode = '2';
        expect(dateValue.equals(otherDate)).toBeFalsy();

        // try with same cal but different date.
        otherDate.calCode = dateValue.calCode;
        otherDate.date = '02/10/2020';
        expect(dateValue.equals(otherDate)).toBeFalsy();

        // Try with everything the same, but also the relative date specified.
        otherDate.date = dateValue.date;
        dateValue.dateStringValue = '1';
        otherDate.dateStringValue = '2';
        expect(dateValue.equals(otherDate)).toBeTruthy();
    });

    it('test equals - relative Date', () => {
        const dateValue = DateValue.newRelativeDate('T-1');
        const otherDate = DateValue.newRelativeDate('T-1');
        expect(dateValue.equals(otherDate)).toBeTruthy();

        // Try with a different calender set.
        dateValue.calCode = '1';
        otherDate.calCode = '2';
        expect(dateValue.equals(otherDate)).toBeFalsy();

        // try with same cal but different date.
        otherDate.calCode = dateValue.calCode;
        otherDate.dateStringValue = 'T-2';
        expect(dateValue.equals(otherDate)).toBeFalsy();

        // Try with everything the same, but also the date specified.
        otherDate.dateStringValue = dateValue.dateStringValue;
        dateValue.date = '1/1/2020';
        otherDate.date = '2/1/2020';
        expect(dateValue.equals(otherDate)).toBeTruthy();
    });
});
