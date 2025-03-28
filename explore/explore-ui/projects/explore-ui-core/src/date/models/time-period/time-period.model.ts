import {isUndefined} from 'lodash';
import {Serializable} from '../../../core/interfaces';
import {DateFormatConstants, TimePeriodConstants} from '../../constants';
import {CalendarDateUtils} from '../../utils';
import {DateValue} from '../date-value/date-value.model';

/**
 * TimePeriod model
 */
export class TimePeriod implements Serializable {
    /**
     * Display Name of the associated time period like 3 Months
     */
    timePeriodName: string;

    /**
     * Number of periods associated with the time period like 3 for 3 Months
     */

    numberOfPeriods: number;

    /**
     * Associated Time Period short name like Months for 3 Months
     */
    shortName: string;

    /**
     * Associated from date of the time period
     * the string should be in US format (MM/DD/YYYY) if absoluteDate or can be relative date format
     */
    fromDateValue: string;

    /**
     * Associated to date of the time period
     * the string should be in US format (MM/DD/YYYY) if absoluteDate or can be relative date format
     */
    toDateValue: string;

    /**
     * Name of the Time Period displayed
     */
    type: string;

    /**
     * Frequency or the duration of the time period displayed
     */
    interval: string;

    /**
     * Max number for periods for which request can be run. Example - macPeriods = 12 for monthly
     */
    maxPeriods: number;

    /**
     * Associated from date of the time period with calcCode, dateStringValue and dateString
     */
    fromDate: DateValue = new DateValue();

    /**
     * Associated to date of the time period with calcCode, dateStringValue and dateString
     */
    toDate: DateValue = new DateValue();

    isStartDateSetToPerformDate = false;

    /**
     * Constructor to create an instance of TimePeriod
     */
    constructor(timePeriodName?: string, numberOfPeriods?: number, shortName?: string, fromDateValue?: string, toDateValue?: string) {
        this.timePeriodName = timePeriodName;
        this.numberOfPeriods = numberOfPeriods;
        this.shortName = shortName;
        this.fromDateValue = this.getDateValue(fromDateValue);
        this.toDateValue = this.getDateValue(toDateValue);
    }

    /**
     * Create copy for the TimePeriod object
     */
    createCopy(): TimePeriod {
        const newTimePeriod = new TimePeriod();
        this.createTimePeriodCopy(newTimePeriod);
        return newTimePeriod;
    }

    createTimePeriodCopy(newTimePeriod: TimePeriod) {
        newTimePeriod.shortName = this.shortName;
        newTimePeriod.numberOfPeriods = this.numberOfPeriods;

        // if fromDateValue or toDateValue is in DD-MMM-YYYY, set the strings in US format
        newTimePeriod.fromDateValue = CalendarDateUtils.getDateInFormat(this.fromDateValue, DateFormatConstants.MMDDYYYY_SLASH);
        newTimePeriod.toDateValue = CalendarDateUtils.getDateInFormat(this.toDateValue, DateFormatConstants.MMDDYYYY_SLASH);

        newTimePeriod.fromDate = this.fromDate;
        newTimePeriod.toDate = this.toDate;
        newTimePeriod.type = this.type;
        newTimePeriod.interval = this.interval;
        newTimePeriod.maxPeriods = this.maxPeriods;
        newTimePeriod.isStartDateSetToPerformDate = this.isStartDateSetToPerformDate;
    }

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    createModelLegacy(optionValues: any): TimePeriod {
        this.shortName = optionValues[TimePeriodConstants.TIME_PERIOD];
        this.numberOfPeriods = optionValues[TimePeriodConstants.NUMBER_OF_PERIODS];

        if (optionValues[TimePeriodConstants.TIME_PERIOD] === TimePeriodConstants.CUSTOM_TIME_PERIOD) {
            // if fromDateValue or toDateValue is in DD-MMM-YYYY, update it with the strings in US format
            this.fromDateValue = CalendarDateUtils.getDateInFormat(optionValues[TimePeriodConstants.START_DATE], DateFormatConstants.MMDDYYYY_SLASH);
            this.toDateValue = CalendarDateUtils.getDateInFormat(optionValues[TimePeriodConstants.END_DATE], DateFormatConstants.MMDDYYYY_SLASH);
        }

        // delete existing option values
        if (!isUndefined(optionValues[TimePeriodConstants.START_DATE])) {
            delete optionValues[TimePeriodConstants.START_DATE];
        }
        if (!isUndefined(optionValues[TimePeriodConstants.END_DATE])) {
            delete optionValues[TimePeriodConstants.END_DATE];
        }
        delete optionValues[TimePeriodConstants.TIME_PERIOD];
        delete optionValues[TimePeriodConstants.NUMBER_OF_PERIODS];

        return this;
    }

    /**
     * Return false if the passed in TimePeriod is not equal to this
     */
    equals(otherTimePeriod: TimePeriod): boolean {
        if (!(otherTimePeriod instanceof TimePeriod)) {
            return false;
        }
        if (this.numberOfPeriods !== otherTimePeriod.numberOfPeriods) {
            return false;
        }
        if (this.interval !== otherTimePeriod.interval) {
            return false;
        }

        if (this.shortName !== otherTimePeriod.shortName) {
            return false;
        }
        if (this.type !== otherTimePeriod.type) {
            return false;
        }

        // Need to check from and to dates as well
        if (this.shortName === TimePeriodConstants.CUSTOM_TIME_PERIOD) {
            return this.isCustomTimePeriodEquals(otherTimePeriod);
        }
        return true;
    }

    /**
     * Check to and from dates for custom time period
     */
    isCustomTimePeriodEquals(otherTimePeriod: TimePeriod): boolean {
        if (CalendarDateUtils.isRelativeDate(this.fromDateValue) && this.fromDateValue !== otherTimePeriod.fromDateValue) {
            return false;
        }
        if (CalendarDateUtils.isRelativeDate(this.toDateValue) && this.toDateValue !== otherTimePeriod.toDateValue) {
            return false;
        }
        if (!CalendarDateUtils.isRelativeDate(this.fromDateValue) && this.fromDateValue !== CalendarDateUtils.getDateInFormat(otherTimePeriod.fromDateValue, DateFormatConstants.MMDDYYYY_SLASH)) {
            return false;
        }
        if (!CalendarDateUtils.isRelativeDate(this.toDateValue) && this.toDateValue !== CalendarDateUtils.getDateInFormat(otherTimePeriod.toDateValue, DateFormatConstants.MMDDYYYY_SLASH)) {
            return false;
        }
        return true;
    }

    /**
     * Serialize the config to json.
     */
    serialize(): any {
        const data: any = {};
        if (this.numberOfPeriods) {
            data.numberOfPeriods = this.numberOfPeriods;
        }
        if (this.shortName) {
            data.shortName = this.shortName;
        }
        if (this.timePeriodName) {
            data.timePeriodName = this.timePeriodName;
        }

        if (this.shortName === TimePeriodConstants.CUSTOM_TIME_PERIOD) {
            if (this.fromDateValue) {
                data.fromDateValue = this.fromDateValue;
            }
            if (this.toDateValue) {
                data.toDateValue = this.toDateValue;
            }
        }
        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.numberOfPeriods = data.numberOfPeriods;
        if (data.timePeriodShortName) {
            this.shortName = data.timePeriodShortName;
        } else {
            this.shortName = data.shortName;
        }
        if (data.timePeriodName) {
            this.timePeriodName = data.timePeriodName;
        }
        if (this.shortName === TimePeriodConstants.CUSTOM_TIME_PERIOD) {
            this.fromDateValue = this.getDateValue(data.fromDateValue);
            this.toDateValue = this.getDateValue(data.toDateValue);
        }
    }

    /**
     * Return true if its a custom time period
     */
    isCustomTimePeriod(): boolean {
        return this.shortName === TimePeriodConstants.CUSTOM_TIME_PERIOD;
    }

    /**
     * Method to extract params for the request
     */
    addRequestData(optionValues: any): void {
        optionValues[TimePeriodConstants.TIME_PERIOD] = this.shortName;
        optionValues[TimePeriodConstants.NUMBER_OF_PERIODS] = this.numberOfPeriods;
        if (optionValues[TimePeriodConstants.TIME_PERIOD] === TimePeriodConstants.CUSTOM_TIME_PERIOD) {
            optionValues[TimePeriodConstants.START_DATE] = this.fromDateValue;
            optionValues[TimePeriodConstants.END_DATE] = this.toDateValue;
        }
    }

    /**
     * Creates a time period data request parameter with its number of period and its short name
     */
    createReqParamWithNumberOfPeriodsAndShortName(): any {
        return {numberOfPeriods: this.numberOfPeriods, shortName: this.shortName};
    }

    /**
     * Get date value (string) for fromDateValue and toDateValue
     *  If dateString is in relative date format, use it as is, or if it is in absolute date format then convert it to US format.
     */
    private getDateValue(dateString: string): string {
        return CalendarDateUtils.isRelativeDate(dateString) ? dateString : CalendarDateUtils.getDateInFormat(dateString, DateFormatConstants.MMDDYYYY_SLASH);
    }
}

export enum TimePeriodShortName {
    // for 'To Date' type
    DTD = 'DTD',
    WTD = 'WTD',
    MTD = 'MTD',
    QTD = 'QTD',
    YTD = 'YTD',

    // for 'Rolling' type
    DAYS = 'Days',
    WEEKS = 'Weeks',
    MONTHS = 'Months',
    QUARTERS = 'Quarters',
    YEARS = 'Years',

    // for 'Custom' type
    BDAY = 'BDay',
    PREV_MTH = 'Prev. Mth',
    PREV_QTR = 'Prev. Qtr',
    FYTD = 'FYTD',

    // Inception to Date
    ITD = 'ITD',
    // CUSTOM
    CUSTOM = 'CUSTOM'
}
