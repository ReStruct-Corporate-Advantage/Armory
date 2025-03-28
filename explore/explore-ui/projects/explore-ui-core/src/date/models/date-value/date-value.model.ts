import {isNil, isObject, isUndefined} from 'lodash';
import moment from 'moment';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {DateFormatConstants} from '../../constants';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Model class for date related objects..Eg - Date Picker
 */
export class DateValue extends AbstractConfig {
    static readonly INVALID_DATE_ERROR = 'Invalid date for calling getMoment';

    // calendar code
    calCode: string;

    // date string in US format (MM/DD/YYYY)
    date: string;

    // boolean linked with dateStringValue
    dateString: boolean;

    // relative date string
    dateStringValue: string;

    /**
     * Constructs a new DateValue for a relative date.
     */
    static newRelativeDate(dateString: string): DateValue {
        const date = new DateValue();
        date.dateStringValue = dateString;
        date.dateString = true;
        return date;
    }

    /**
     * Constructs a new DateValue for a date.
     */
    static newDate(dateString: string): DateValue {
        const date = new DateValue();
        date.date = dateString;
        date.dateString = false;
        return date;
    }

    /**
     * Get deserialized DateValue model given serialized data
     *  This was used for OverrideDateColumnOption first and now TimeSeriesSettings also extending it the same way.
     *  It's not clear whether this is applicable for all other cases, so explicitly handling it separately.
     */
    static deserializeDateValue(serializedDateValue: any): DateValue {
        if (isObject(serializedDateValue) as any) {
            // Remove absolute date if relativeDate is available.
            if (serializedDateValue?.dateString && serializedDateValue?.dateStringValue) {
                serializedDateValue.date = undefined;
            }
            return new DateValue(serializedDateValue);
        } else {
            return DateValue.newDate(serializedDateValue);
        }
    }

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Implementation of abstract doDeserialize
     */
    deserialize(data: any): void {
        if (data.calCode) {
            this.calCode = data.calCode;
        }
        if (!isUndefined(data.dateString)) {
            this.dateString = data.dateString;
        }
        if (data.dateStringValue) {
            this.dateStringValue = data.dateStringValue;
        }
        if (data.date) {
            this.date = data.date;
        }
        this.dateString = !isNil(data.dateString) ? data.dateString : !!data.dateStringValue;
    }

    /**
     * Implementation of abstract doSerialize
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const dateValue: any = {};
        if (this.calCode) {
            dateValue.calCode = this.calCode;
        }
        if (!isUndefined(this.dateString)) {
            dateValue.dateString = this.dateString;
        }
        if (this.dateStringValue) {
            dateValue.dateStringValue = this.dateStringValue;
        }
        if (this.date) {
            dateValue.date = this.date;
        }

        return dateValue;
    }

    /**
     * Sanitize serialized DateValue.
     *  This was used for OverrideDateColumnOption first and now TimeSeriesSettings also extending it the same way.
     *  It's not clear whether this is applicable for all other cases, so explicitly handling it separately.
     */
    sanitizeAndSerialize(): any {
        const dateValue = this.serialize();
        // Nullify date field if dateStringValue (relative date) is set.
        if (dateValue.dateString && dateValue.dateStringValue) {
            dateValue.date = undefined;
        }
        return dateValue;
    }

    /**
     * Checks if the two dates are equal.
     */
    equals(other: DateValue): boolean {
        if (isNil(other)) {
            return false;
        }

        if (this.dateString !== other.dateString || this.calCode !== other.calCode) {
            return false;
        }

        if (this.dateString) {
            return this.dateStringValue === other.dateStringValue;
        }
        return this.date === other.date;
    }

    /**
     * Formats the date in the required format.  If a relative date then it just returns the string of that.
     * This function can throw an error if the date is not set.
     * @param dateFormat The format of the date we want.
     * @param useActualDate If this is a relative date and there is an actual date here as well then use the actual date for the format.
     */
    format(dateFormat: string, useActualDate?: boolean): string {
        // If it is a relative date, then return that string.
        if (this.dateString && !(useActualDate && this.date)) {
            return this.dateStringValue;
        }

        // Check that the date is set and throw an error.
        if (!this.date) {
            return undefined;
        }

        // If the requested format is the format we already have just return it.
        if (dateFormat === DateFormatConstants.MMDDYYYY_SLASH) {
            return this.date;
        }

        // Create the date moment so we can format it correctly.
        return this.getMoment().format(dateFormat);
    }

    /**
     * Gets the date as a moment.
     * This function can throw an error if the date is not set.
     */
    getMoment(): moment.Moment {
        this.validateDate();
        return moment(this.date, DateFormatConstants.MMDDYYYY_SLASH);
    }

    /**
     * Sets the date from a moment.
     */
    setMoment(dateMoment: moment.Moment): void {
        this.date = dateMoment.format(DateFormatConstants.MMDDYYYY_SLASH);
    }

    /**
     * Throw an error if the date is not set.
     */
    private validateDate(): void {
        if (isNil(this.date)) {
            throw Error(DateValue.INVALID_DATE_ERROR);
        }
    }

    /**
     *
     */
    getDateAsText(): string {
        return this.dateString ? this.dateStringValue : this.date;
    }

    /**
     * Returns the date as a string.
     */
    isSameDate(date: string): boolean {
        return this.dateString ? this.dateStringValue === date : this.date === date;
    }
}
