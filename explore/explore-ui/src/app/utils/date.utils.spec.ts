import {DateUtils} from '@utils/date.utils';
import momentTZ from 'moment-timezone';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';

describe('DateUtils Test', () => {
    it('should check if isFirstDateOfWeek', () => {
        const monday = '05-FEB-2024';
        const monday2 = '12-FEB-2024';
        expect(DateUtils.isFirstDateOfWeek(monday)).toBeTruthy();
        expect(DateUtils.isFirstDateOfWeek(monday2)).toBeTruthy();
        expect(DateUtils.isFirstDateOfWeek('04-FEB-2024')).toBeFalsy();
        expect(DateUtils.isFirstDateOfWeek('')).toBeFalsy();
        expect(DateUtils.isFirstDateOfWeek(undefined)).toBeFalsy();
    });

    it('should check if isFirstDateOfMonth', () => {
        expect(DateUtils.isFirstDateOfMonth('01-FEB-2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfMonth('02/01/2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfMonth('01-JAN-2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfMonth('02-FEB-2024')).toBeFalsy();
        expect(DateUtils.isFirstDateOfMonth('')).toBeFalsy();
        expect(DateUtils.isFirstDateOfMonth(undefined)).toBeFalsy();
    });

    it('should check if isFirstDateOfQuarter', () => {
        expect(DateUtils.isFirstDateOfQuarter('01-JAN-2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfQuarter('01/01/2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfQuarter('01-APR-2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfQuarter('01-JUL-2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfQuarter('01-FEB-2024')).toBeFalsy();
        expect(DateUtils.isFirstDateOfQuarter('')).toBeFalsy();
        expect(DateUtils.isFirstDateOfQuarter(undefined)).toBeFalsy();
    });

    it('should check if isFirstDateOfYear', () => {
        expect(DateUtils.isFirstDateOfYear('01-JAN-2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfYear('01/01/2024')).toBeTruthy();
        expect(DateUtils.isFirstDateOfYear('01-JAN-2023')).toBeTruthy();
        expect(DateUtils.isFirstDateOfYear('01-JUL-2024')).toBeFalsy();
        expect(DateUtils.isFirstDateOfYear('')).toBeFalsy();
        expect(DateUtils.isFirstDateOfYear(undefined)).toBeFalsy();
    });

    it('should calculateDaysApart', () => {
        expect(DateUtils.calculateDaysApart('01-JAN-2024', '03-JAN-2024')).toBe(2);
        expect(DateUtils.calculateDaysApart('01-JAN-2024', undefined)).toBe(-1);
        expect(DateUtils.calculateDaysApart(undefined, '03-JAN-2024')).toBe(-1);
    });

    it('should initialize time zone options and default time zone', () => {
        jest.spyOn(momentTZ.tz, 'guess').mockReturnValue('America/New_York');

        const {timeZone, timeZoneOptions} = DateUtils.initializeTimeZoneOptions();
        expect(timeZoneOptions[0].values[0].value).toBe('Africa/Abidjan');
        expect(timeZoneOptions[0].values[0].displayValue).toBe('Africa - Abidjan');
        expect(timeZone).toBe('America/New_York');

        const defaultTimeZone = timeZoneOptions[0].values.find(zoneOption => zoneOption.value === timeZone);
        expect(defaultTimeZone.value).toBe('America/New_York');
        expect(defaultTimeZone.displayValue).toBe('America - New York');
    });

    it('should append zero to date if less than 10', () => {
        expect(DateUtils.formatDate(5)).toBe('05');
        expect(DateUtils.formatDate(10)).toBe('10');
    });

    describe('convertDateStringToTimestamp', () => {
        it('should convert a valid date string to a timestamp', () => {
            const dateString = '01/01/2024';
            const timestamp = DateUtils.convertDateStringToTimestamp(dateString);
            const expectedDate = new Date(2024, 0, 1);
            const expectedTimestamp = new Timestamp();
            expectedTimestamp.setSeconds(Math.floor(expectedDate.getTime() / 1000));
            expect(timestamp.getSeconds()).toBe(expectedTimestamp.getSeconds());
        });
    });
});
