import {isString} from 'lodash';
import moment from 'moment';
import {CommonUtils} from '../../core/utils';
import {Calendar} from '../../definition/models/calendar.model';
import {CoreCommonConstants} from '../../core/constants';
import {DateFormatConstants} from '../constants';
import {DateValue} from '../models/date-value/date-value.model';

/**
 * Util class for Calendar and Date related operations
 */
// @dynamic
export class CalendarDateUtils {
    private static _indexHistoryLookbackDate: string;  // Member variable that holds Index history lookback date
    private static _exposureLookbackDate: string;  // Member variable that holds exposure lookback date
    static minDate: string;  //  Member variable that holds the minimum supported date
    static maxSelectableDate: string;
    static holidays: Map<string, Array<{}>> = new Map<string, {}[]>();
    static relativeDateCache: Map<string, Date> = new Map<string, Date>();
    static readonly relativeDateRegex = /(^[T][\-]([0-9]+)(Q|M|Y|ME|QE|YE)?)$/i;

    // regex matches M/D/YYYY, M/DD/YYYY, MM/D/YYYY, MM/DD/YYYY, MM/DD/YY
    private static readonly dateStringUSFormatRegex = /^([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|1\d|2\d|3[01])\/(\d{2}|(19|20)\d{2})$/;

    // regex matches MM/DD/YYYY only
    private static readonly dateStringUSFormatStrictRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;

    // regex matches D/M/YYYY, D/MM/YYYY, DD/M/YYYY, DD/MM/YYYY
    private static readonly dateStringUKFormatRegex = /^([1-9]|0[1-9]|1\d|2\d|3[01])\/([1-9]|0[1-9]|1[0-2])\/(19|20)\d{2}$/;

    // regex matches DD/MM/YYYY only
    private static readonly dateStringUKFormatStrictRegex = /^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;

    // regex matches DD-MMM-YYYY only
    private static readonly dateStringAladdinDateFormatRegex = /^(0[1-9]|1\d|2\d|3[01])\-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\-(19|20)\d{2}$/;

    /**
     * Validate if US date format
     * returns true if string matches M/D/YYYY, M/DD/YYYY, MM/D/YYYY, MM/DD/YYYY
     */
    static isUSDateFormat(dateString: string): any {
        return CalendarDateUtils.dateStringUSFormatRegex.test(dateString);
    }

    /**
     * Validate if US date format
     * returns true if string matches MM/DD/YYYY
     */
    static isStrictUSDateFormat(dateString: string): any {
        return CalendarDateUtils.dateStringUSFormatStrictRegex.test(dateString);
    }

    /**
     * Validate if US date format
     * returns true if string matches D/M/YYYY, D/MM/YYYY, DD/M/YYYY, DD/MM/YYYY
     */
    static isUKDateFormat(dateString: string): any {
        return CalendarDateUtils.dateStringUKFormatRegex.test(dateString);
    }

    /**
     * Validate if US date format
     * returns true if string matches DD/MM/YYYY
     */
    static isStrictUKDateFormat(dateString: string): any {
        return CalendarDateUtils.dateStringUKFormatStrictRegex.test(dateString);
    }

    /**
     * Validate if US date format
     * returns true if string matches DD/MM/YYYY
     */
    static isAladdinDateFormat(dateString: string): any {
        return CalendarDateUtils.dateStringAladdinDateFormatRegex.test(dateString);
    }

    /**
     * Returns true if string passed in is a relative date
     */
    static isRelativeDate(string: string): boolean {
        return CalendarDateUtils.relativeDateRegex.exec(string) !== null;
    }

    /**
     * Setter for indexHistoryLookbackDate
     */
    static setIndexHistoryLookbackDate(indexHistoryLookbackDate: string) {
        this._indexHistoryLookbackDate = indexHistoryLookbackDate;
    }

    /**
     * Setter for exposureLookbackDate
     */
    static setExposureLookbackDate(exposureLookbackDate: string) {
        this._exposureLookbackDate = exposureLookbackDate;
    }

    /**
     * Function to get default date object
     */
    static getDefaultDateObject(): DateValue {
        // By not passing in a calendar code, we run the risk of the date landing on a holiday
        // This date will eventually be corrected once we have loaded portfolio info with the default holiday calendar
        return new DateValue({
            dateStringValue: CalendarDateUtils.getDefaultDateString(),
            date: CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH),
            dateString: true,
        });
    }

    /**
     * Returns the default date string based on the token value
     */
    static getDefaultDateString(): string {
        let string = 'T';
        if (CalendarDateUtils.maxSelectableDate !== '0') {
            string += '-' + CalendarDateUtils.maxSelectableDate;
        }
        return string;
    }

    /**
     * Return today's date
     */
    static getTodayDate(): string {
        return CalendarDateUtils.getDateInFormat(moment().toDate(), DateFormatConstants.MMDDYYYY_SLASH);
    }

    /**
     * checks if there is an override date. if not, returns today.
     * todayOverride comes from URL param
     */
    static checkOverrideAndGetToday(): moment.Moment {
        const todayOverride = CommonUtils.getURLParam(CoreCommonConstants.TODAY_OVERRIDE);
        let todayOverrideMoment: moment.Moment = todayOverride ? moment(todayOverride, ['M/D/YYYY', 'M/D/YY'], true) : null;
        if (todayOverrideMoment && !todayOverrideMoment.isValid()) {
            todayOverrideMoment = null;
        }
        return todayOverrideMoment ? todayOverrideMoment : moment();
    }

    /**
     * Get date in passed in format
     * MUST add isCurrentDateInUKFormat flag if passing date string in UK format
     */
    static getDateInFormat(date: Date | moment.Moment | string, format: string, isCurrentDateInUKFormat?: boolean): string {
        if (!date) {
            return;
        }
        return CalendarDateUtils.getDateInMoment(date, isCurrentDateInUKFormat).format(format);
    }

    /**
     * Get date in DD-MMM-YYYY format.
     * It can take two additional arguments to subtract period before returning date.
     * MUST add isCurrentDateInUKFormat flag if passing date string in UK format
     */
    static getDateInAladdinFormat(date: Date | moment.Moment | string, period?: number, unit?: moment.unitOfTime.DurationConstructor, isCurrentDateInUKFormat?: boolean): string {
        // TODO: if date passed in is string, we need to know it in which format, otherwise it will return a wrong result
        //  also need to update the name since AladdinFormat in some environment is not DD-MMM-YYYY
        const dateMoment = CalendarDateUtils.getDateInMoment(date, isCurrentDateInUKFormat);
        const newDate = (period && unit) ? CalendarDateUtils.subtractDatePeriod(dateMoment, period, unit) : dateMoment;
        return newDate.format(DateFormatConstants.DDMMMYYYY_DASH);
    }

    /**
     * Setter for minDate
     */
    static setMinDate(isIndexResearchPortfolio: boolean): void {
        this.minDate = isIndexResearchPortfolio ? this._indexHistoryLookbackDate : this._exposureLookbackDate;
    }

    /**
     * Get date in DD-MMM-YYYY format from Date object.
     * It can take two additional arguments to subtract period before returning date.
     * MUST add isCurrentDateInUKFormat flag if passing date string in UK format
     */
    static getDateInMoment(date: Date | moment.Moment | string, isCurrentDateInUKFormat?: boolean): moment.Moment {
        // adding a flag to distinguish between US and UK format and to use different format while creating Moment object to fix the issue below -
        // e.g> when a string '1/2/2020' is passed, it creates the moment with the first listed format, which is US format
        // so if user passes the string in UK format, it creates wrong moment object.
        if (!date) {
            return;
        }

        if (isString(date)) {
            let formats = [DateFormatConstants.DDMMMYYYY_DASH, DateFormatConstants.YYYY_MM_DD_DASH];

            if (isCurrentDateInUKFormat) {
                formats = [
                    ...formats,
                    DateFormatConstants.DMYYYY_SLASH,
                    DateFormatConstants.DMMYYYY_SLASH,
                    DateFormatConstants.DDMYYYY_SLASH,
                    DateFormatConstants.DDMMYYYY_SLASH
                ];
            } else {
                formats = [
                    ...formats,
                    DateFormatConstants.MDYYYY_SLASH,
                    DateFormatConstants.MDDYYYY_SLASH,
                    DateFormatConstants.MMDYYYY_SLASH,
                    DateFormatConstants.MMDDYYYY_SLASH,
                    DateFormatConstants.MMDDYY_SLASH
                ];
            }

            return moment(date, formats, true);
        }

        if (moment.isMoment(date)) {
            return date;
        }

        return moment(date);
    }

    /**
     * Converts dateFormat to format that moment understand
     */
    static getDateFormat(dateFormat: string): string {
        // changing dateFormat to format that moment understand
        if (dateFormat === DateFormatConstants.EEEE_MMMM_d_yyyy) {
            return DateFormatConstants.dddd_MMMM_D_YYYY;
        }

        return dateFormat.toUpperCase();
    }

    /**
     * Get Calendar by code
     */
   static getCalendarByCode(calendars: Calendar[], calCode: string): Calendar {
        for (const calendar of calendars) {
            if (calCode === calendar.calendarCode) {
                return calendar;
            }
        }
        // US calendar by default
        return calendars[0];
    }

    /**
     * returns true if calendar exists
     */
    static calendarExists(calendars: Calendar[], calCode: string): boolean {
        for (const calendar of calendars) {
            if (calCode === calendar.calendarCode) {
                return true;
            }
        }
        return false;
    }

    /**
     * Subtract period and return Moment object.
     */
    private static subtractDatePeriod(dateMoment: moment.Moment, period: number, unit: moment.unitOfTime.DurationConstructor): moment.Moment {
        return dateMoment.subtract(period, unit);
    }
}
