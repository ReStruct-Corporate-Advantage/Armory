import {BehaviorSubject, Observable} from 'rxjs';
import {DateValue} from '../models/date-value/date-value.model';
import {DateFormatConstants} from '../constants';
import {CalendarDateUtils} from '../utils';

export class DateStore {
    // linked with currentPortfolio's datePicker
    static currentDate$ = new BehaviorSubject<DateValue>(undefined);

    // linked with currentPortfolio's multiFrequencyMaxPeriodsMap
    static currentMultiFrequencyMaxPeriodsMap$ = new BehaviorSubject<Map<string, number>>(undefined);

    // max date that a user can select in a workspace, default is when calCode=null
    static defaultMaxDate$ = new BehaviorSubject<Date>(undefined);

    /**
     * get current Date observable
     */
    static getCurrentDate$(): Observable<DateValue> {
        return DateStore.currentDate$;
    }

    /**
     * get current date
     */
    static getCurrentDate(): DateValue {
        return DateStore.currentDate$.getValue();
    }

    /**
     * update current date
     */
    static updateCurrentDate(dateToUpdate: DateValue): void {
        DateStore.currentDate$.next(dateToUpdate);
    }

    /**
     * get current date
     */
    static getMultiFrequencyMaxPeriodsMap(): Map<string, number> {
        return DateStore.currentMultiFrequencyMaxPeriodsMap$.getValue();
    }

    /**
     * update current date
     */
    static updateMultiFrequencyMaxPeriodsMap(mapToUpdate: Map<string, number>): void {
        DateStore.currentMultiFrequencyMaxPeriodsMap$.next(mapToUpdate);
    }

    /**
     * Returns the max date in standard string format for date picker
     */
    static getDefaultMaxDateString(): string {
        return CalendarDateUtils.getDateInFormat(DateStore.defaultMaxDate$.getValue(), DateFormatConstants.MMDDYYYY_SLASH);
    }
}
