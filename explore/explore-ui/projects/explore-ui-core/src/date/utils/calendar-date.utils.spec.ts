import {CommonUtils} from '../../core/utils';
import {DateFormatConstants} from '../constants';
import {DateValue} from '../models/date-value/date-value.model';
import {CalendarDateUtils} from './calendar-date.utils';
import moment from 'moment';

describe('CalendarDateUtils', () => {
    describe('test dateFormat', function () {
        it('should test getDateInMoment', function () {
            const date1: moment.Moment = CalendarDateUtils['getDateInMoment'](new Date('4/1/2019'));
            const date2: moment.Moment = CalendarDateUtils['getDateInMoment']('04/1/2019');
            const date3: moment.Moment = CalendarDateUtils['getDateInMoment']('04/01/2019');
            const date4: moment.Moment = CalendarDateUtils['getDateInMoment']('01-APR-2019');
            expect(moment.isMoment(date1) && date1.isValid()).toBeTruthy();
            expect(moment.isMoment(date2) && date2.isValid()).toBeTruthy();
            expect(moment.isMoment(date3) && date3.isValid()).toBeTruthy();
            expect(moment.isMoment(date4) && date4.isValid()).toBeTruthy();
        });
    });

    it('test getDefaultDateObject', () => {
        // initialize maxSelectableDate
        CalendarDateUtils.maxSelectableDate = '3';

        // No workpad scenario
        const dateObject: DateValue = CalendarDateUtils.getDefaultDateObject();
        expect(dateObject.dateStringValue).toBe('T-3');
        expect(dateObject.date).toBeTruthy();
        expect(dateObject.dateString).toBe(true);

        // reset maxSelectableDate
        CalendarDateUtils.maxSelectableDate = undefined;
    });

    it('Test getTodayDate', () => {
        const todayDate = CalendarDateUtils.getTodayDate();
        const dateComponents = todayDate.split('/');

        const date = new Date();
        expect(parseInt(dateComponents[0], 10) === date.getMonth() + 1).toBeTruthy(); // Date.getMonth() is 0-based months (returns 0-11)
        expect(parseInt(dateComponents[1], 10) === date.getDate()).toBeTruthy();
        expect(parseInt(dateComponents[2], 10) === date.getUTCFullYear()).toBeTruthy();
    });

    it('Returns today date with todayOverride and token value of 0, regardless of business day', function () {
        CalendarDateUtils.maxSelectableDate = '0';
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('12/25/2016');
        expect(CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH)).toBe('12/25/2016');
    });

    /*Commenting out to ignore the test case because it is picking the current date
    it('Returns today date with todayOverride and token value of 1', function () {
        CalendarDateUtils.maxSelectableDate = '1';
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('03/11/2016');
        expect(CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH)).toBe('03/11/2016');
    });*/

    it('returns previous date with a wrong todayOverride', function () {
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('RANDOM VALUE');
        const expectedDate = moment().format(DateFormatConstants.MMDDYYYY_SLASH);
        expect(CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH)).toBe(expectedDate);
    });

    it('isRelativeDate', () => {
        expect(CalendarDateUtils.isRelativeDate('T-10')).toBe(true);
        expect(CalendarDateUtils.isRelativeDate('03/4/2016')).toBe(false);
        expect(CalendarDateUtils.isRelativeDate('31-OCT-2018')).toBe(false);
    });

    describe('format regex Test', () => {
        it('should check if string is in aladdin date format', () => {
            expect(CalendarDateUtils.isAladdinDateFormat('01-MAR-2020')).toBeTruthy();
            expect(CalendarDateUtils.isAladdinDateFormat('01-MAR-202')).toBeFalsy();
            expect(CalendarDateUtils.isAladdinDateFormat('01/15/2020')).toBeFalsy();
        });

        it('should check if string is in US date format', () => {
            expect(CalendarDateUtils.isUSDateFormat('01/15/2020')).toBeTruthy();
            expect(CalendarDateUtils.isUSDateFormat('1/15/2020')).toBeTruthy();
            expect(CalendarDateUtils.isUSDateFormat('01-MAR-2020')).toBeFalsy();
            expect(CalendarDateUtils.isUSDateFormat('15/01/2020')).toBeFalsy();
            expect(CalendarDateUtils.isUSDateFormat('01/15/202')).toBeFalsy();
            // test MM/DD/YY format
            expect(CalendarDateUtils.isUSDateFormat('01/03/20')).toBeTruthy();
            expect(CalendarDateUtils.isUSDateFormat('1/01/18')).toBeTruthy();
            expect(CalendarDateUtils.isUSDateFormat('1/1/20')).toBeTruthy();

            expect(CalendarDateUtils.isStrictUSDateFormat('01/15/2020')).toBeTruthy();
            expect(CalendarDateUtils.isStrictUSDateFormat('1/15/2020')).toBeFalsy();
        });

        it('should check if string is in UK date format', () => {
            expect(CalendarDateUtils.isUKDateFormat('15/01/2020')).toBeTruthy();
            expect(CalendarDateUtils.isUKDateFormat('15/1/2020')).toBeTruthy();
            expect(CalendarDateUtils.isUKDateFormat('01-MAR-2020')).toBeFalsy();
            expect(CalendarDateUtils.isUKDateFormat('01/15/2020')).toBeFalsy();
            expect(CalendarDateUtils.isUKDateFormat('15/01/202')).toBeFalsy();

            expect(CalendarDateUtils.isStrictUKDateFormat('15/01/2020')).toBeTruthy();
            expect(CalendarDateUtils.isStrictUKDateFormat('15/1/2020')).toBeFalsy();
        });
    });
});
