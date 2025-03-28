import {isEmpty, isNaN, isNil, split} from 'lodash';
import moment from 'moment/moment';
import {TimeSpanColumnFormat} from '../column-formats/time-span-column-format.model';
import {AbstractDataFormatter, TimeToMaturityColumnOption} from '@blk/explore-ui-column-option';
import {AbstractColumnOption, CoreCommonConstants, DateFormatConstants, FormatConstants} from '@blk/explore-ui-core';

/**
 * Data formatter for time span column format
 */
export class TimeSpanDataFormatter extends AbstractDataFormatter<TimeSpanColumnFormat, TimeToMaturityColumnOption> {

    /**
     * Constructor
     */
    constructor(columnFormat: TimeSpanColumnFormat, optionValues: Array<AbstractColumnOption>) {
        super(columnFormat, optionValues);
    }

    /**
     * DataFormatter.format(any)
     */
    format(value: any): string {
        const values = split(value, ',');

        if (!values || isEmpty(values) || isEmpty(values[0])) {
            return null;
        }
        const days = parseFloat(values[0]);
        const startDate = moment(values[1], DateFormatConstants.DDMMMYYYY_DASH);
        const endDate = startDate.clone().add(days, 'day');

        // Get the end date and make sure it is valid.
        // if the date is not valid then we need to format it in a basic years format.
        if (!endDate.isValid()) {
            return this.formatDecimalPlaces(days / 365, 2) + FormatConstants.YEARS_SUFFIX;
        }

        // Get the number of months.
        const months = endDate.diff(startDate, 'months', true);

        if (!this.optionValue || !this.optionValue.isValid()) {
            return this.getDaysAndSuffix(days);
        }

        let timeUnit = this.optionValue.timeUnit;

        // If this is the custom type then figure out how we are to display this value.
        if (timeUnit === FormatConstants.CUSTOM) {
            if (Math.abs(days) < this.optionValue.customScalingBandsDays) {
                timeUnit = FormatConstants.DAYS;
            } else if (Math.abs(months) < this.optionValue.customScalingBandsMonths) {
                timeUnit = FormatConstants.MONTHS;
            } else {
                timeUnit = FormatConstants.YEARS;
            }
        }
        const decimalPlaces = this.optionValue.decimalPlaces ? this.optionValue.decimalPlaces : 0;
        // Format the time span.
        switch (timeUnit) {
            case FormatConstants.DAYS:
                return this.formatDecimalPlaces(days, 0).toString() + FormatConstants.DAYS_SUFFIX;
            case FormatConstants.MONTHS:
                return this.formatDecimalPlaces(months, decimalPlaces).toString() + FormatConstants.MONTHS_SUFFIX;
            case FormatConstants.YEARS:
                return this.formatDecimalPlaces(days / 365, decimalPlaces).toString() + FormatConstants.YEARS_SUFFIX;
            default:
                // Will never get here.
                return '';
        }
    }

    /**
     * Method to apply postfix like D, M, Y depending upon time unit
     * @param value
     */
    applyPostfix(value: any) {
        if (isNil(value) || !this.optionValue) {
            return CoreCommonConstants.EMPTY_STRING;
        }
        switch (this.optionValue.timeUnit) {
            case FormatConstants.DAYS:
                return value.toString() + FormatConstants.DAYS_SUFFIX;
            case FormatConstants.MONTHS:
                return value.toString() + FormatConstants.MONTHS_SUFFIX;
            case FormatConstants.YEARS:
                return value.toString() + FormatConstants.YEARS_SUFFIX;
            default:
                // Will never get here.
                return CoreCommonConstants.EMPTY_STRING;
        }
    }

    /**
     * Convert the value to raw timespan value
     * In case of invalid date input, return null
     * @param value Value that we are trying to parse a timespan from
     * @return timespan in day format
     */
    convertToRaw(value: any): string {
        const values = split(value, ',');

        // TODO: Should account for more input formats.  Currently assumes user will only enter in timespan in days without d suffix.
        return (isNil(values) || isNaN(Number(values[0]))) ? null : this.getDaysAndSuffix(Number(values[0]));
    }

    /**
     * Converts the input value into a comparable format.
     *
     * @param {any} value - The input value to be converted.
     * @returns {any} The converted value.
     *
     * This method can handle inputs in only two flavors:
     * - "9011,14-JUN-2023": Converts the numeric part before the comma to an integer.
     *   This format is the default for Time to Maturity values from the backend.
     * - "12D": Converts the numeric part before the 'D' to an integer.
     *   This format is obtained from highlighting compared values. If the user sets highlight values > 1Y, this method will get "365D" value.
     *
     * @example
     * getComparableValue("9011,14-JUN-2023"); // Returns 9011
     * getComparableValue("12D"); // Returns 12
     * getComparableValue("other_input"); // If the value doesn't match the expected format, returns the original value
    */
    getComparableValue(value: any): any {
        if (typeof value === 'string' && (value.includes(',') || value.endsWith('D'))) {
            const [numberPart] = value.split(/[,D]/);
            return parseInt(numberPart, 10);
        }
        // If the value doesn't match the expected format, return the original value
        return value;
    }

    /**
     * AbstractDataFormatter.getColumnOptionConfigType()
     */
    protected getColumnOptionConfigType(): string {
        return TimeToMaturityColumnOption.CONFIG_TYPE;
    }

    /**
     * Return a string of days and day suffix
     */
    private getDaysAndSuffix(days: number): string {
        return days.toString() + FormatConstants.DAYS_SUFFIX;
    }

}
