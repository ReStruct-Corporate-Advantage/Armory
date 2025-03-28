import {isEmpty} from 'lodash';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import {ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';
import {CommonConstants} from '@constants/common.constants';


export class DateUtils {
    /**
     * Check if given date (in string) is first date of week
     *  Monday
     */
    static isFirstDateOfWeek(dateString: string): boolean {
        if (isEmpty(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        // return Monday
        return date.getDay() === 1;
    }

    /**
     * Check if given date (in string) is first date of month
     *  Jan 1, Feb, Mar 1, ... Dec 1
     */
    static isFirstDateOfMonth(dateString: string): boolean {
        if (isEmpty(dateString)) {
            return false;
        }
        return new Date(dateString).getDate() === 1;
    }

    /**
     * Check if given date (in string) is first date of quarter
     *  Jan 1, April 1, July 1, Oct 1.
     */
    static isFirstDateOfQuarter(dateString: string): boolean {
        if (isEmpty(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        return date.getDate() === 1 && date.getMonth() % 3 === 0;
    }

    /**
     * Check if given date (in string) is first date of quarter
     *  Jan 1, April 1, July 1, Oct 1.
     */
    static isFirstDateOfYear(dateString: string): boolean {
        if (isEmpty(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        return date.getDate() === 1 && date.getMonth() === 0;
    }

    /**
     * Calculate days apart for given two date string
     */
    static calculateDaysApart(startDateString: string, endDateString: string): number {
        return startDateString && endDateString ? moment(endDateString).diff(moment(startDateString), 'days') : -1;
    }

    /**
     * Initialize the time zone options for the dropdown
     */
    static initializeTimeZoneOptions(): any {
        const timeZoneList = momentTZ.tz.names();
        const displayTimeZoneList = [];
        for (const timeZone of timeZoneList) {
            displayTimeZoneList.push(DateUtils.updateTimeZoneInDisplayFormat(timeZone));
        }
        const currentTimeZone = momentTZ.tz.guess();

        const timeZoneOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(timeZoneList, displayTimeZoneList, currentTimeZone);
        return {timeZone: currentTimeZone, timeZoneOptions};
    }

    /**
     * Update time zone in display format
     */
    static updateTimeZoneInDisplayFormat(timeZone: string): string {
        return timeZone.replace(/\//g, ' - ').replace(/_/g, ' ');
    }

    /**
     * Convert protobuf timestamp to date and time string (MM/DD/YYYY HH:mm)
     * @param timestamp
     * @param isTimeRequired
     */
    static convertProtobufTimestampToString(timestamp: Timestamp, isTimeRequired: boolean = true): string {
        const date : Date = timestamp.toDate();
        const formattedDate = `${this.formatDate(date.getMonth() + 1)}/${this.formatDate(date.getDate())}/${date.getFullYear()}`;
        if(isTimeRequired) {
            const formattedTime = `${this.formatDate(date.getHours())}:${this.formatDate(date.getMinutes())}:${this.formatDate(date.getSeconds())}`;
            return `${formattedDate} ${formattedTime}`;
        }
        return `${formattedDate}`;
    }

    /**
     * Convert string date in mm/dd/yyyy format to timestamp
     * @param dateString
     */
    static convertDateStringToTimestamp(dateString: string): Timestamp {
        const [month, day, year] = dateString.split(CommonConstants.SLASH).map(Number);
        const date = new Date(year, month - 1, day);
        const timestamp = new Timestamp();
        timestamp.setSeconds(Math.floor(date.getTime() / 1000));
        return timestamp;
    }

    /**
     * Append zero to the date if it is less than 10 to strictly maintain mm-dd-yyyy
     * @param date
     * @private
     */
    static formatDate(date: number): string {
        return date < 10 ? '0' + date : date.toString();
    }
}
