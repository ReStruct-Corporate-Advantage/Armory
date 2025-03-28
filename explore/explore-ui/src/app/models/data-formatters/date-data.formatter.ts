import {AbstractDataFormatter, DateColumnFormatColumnOption} from '@blk/explore-ui-column-option';
import {AbstractColumnOption, DateFormatConstants} from '@blk/explore-ui-core';
import moment from 'moment/moment';
import {DateFormat} from '../column-formats/date-format.model';

/**
 * Data formatter for date column format
 */
export class DateDataFormatter extends AbstractDataFormatter<DateFormat, DateColumnFormatColumnOption> {

    /**
     * Constructor
     */
    constructor(columnFormat: DateFormat, optionValues: Array<AbstractColumnOption>) {
        super(columnFormat, optionValues);
    }

    /**
     * DataFormatter.format(any)
     */
    format(value: any): string {
        const dateFormatString = this.getDateFormatString();

        return moment(value, [DateFormatConstants.DDMMMYYYY_DASH, dateFormatString]).format(dateFormatString);
    }

    /**
     * Convert the formatted value to raw date value
     * In case of invalid date input, return null
     * @param value Value that we are trying to parse a date from
     * @return string date that is in the format specified by the column
     */
    convertToRaw(value: any): string {
        // use many different date formats to try to try to cover different ways user may enter a date
        const rawDate = moment(value, DateFormatConstants.DATE_FORMATS, true).format(this.columnFormat.value.toUpperCase());
        return (rawDate === 'Invalid date') ? null : rawDate;
    }

    /**
     * Converts a value into an upper case string for comparison
     */
    getComparableValue(value: any): Date {
        const dateFormatString = this.getDateFormatString();

        return moment(value, [DateFormatConstants.DDMMMYYYY_DASH, dateFormatString]).toDate();
    }

    /**
     * Gets the string format of the date to use with moment for formatting
     */
    private getDateFormatString(): string {
        // while creating a new date in javascript from date which we are getting from server we have to perform  -1 in month
        // Because in Java months are from 1-12 but in Javascript its 0-11
        // var date = new Date(value.year, value.month - 1, value.day, 0, 0, 0);
        // changed to pass string in DD-MMM-YYYY format from middleware and use that. it was inefficient to pass each
        // date string as {month: , date: , year: }
        let dateFormatString;
        if (this.optionValue && this.optionValue.isValid()) {
            dateFormatString = this.optionValue.value;
            if (dateFormatString === DateFormatConstants.ALADDIN_DATE_FORMAT_NAME) {
                dateFormatString = this.columnFormat.value;
            }
        } else {
            dateFormatString = this.columnFormat.value;
        }

        // moment.js takes dddd not EEEE for day of week
        if (dateFormatString === DateFormatConstants.EEEE_MMMM_d_yyyy) {
            return DateFormatConstants.dddd_MMMM_D_YYYY;
        }

        return dateFormatString.toUpperCase();
    }

    /**
     * AbstractDataFormatter.getColumnOptionConfigType()
     */
    protected getColumnOptionConfigType(): string {
        return DateColumnFormatColumnOption.CONFIG_TYPE;
    }

}
