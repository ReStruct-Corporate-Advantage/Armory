import {Observable, of, Subject, throwError} from 'rxjs';
import {Inject, Injectable} from '@angular/core';
import moment from 'moment';
import {catchError, map} from 'rxjs/operators';
import {HttpServiceInterface} from '../../core/http.service.interface';
import {HTTP_SERVICE_TOKEN} from '../../core/tokens';
import {CalendarDateUtils} from '../utils';

/**
 * Service to handle relative date parsing
 */
@Injectable({
    providedIn: 'root'
})
export class DateService {
    midNightRefresh$: Subject<void> = new Subject();

    /**
     * constructor
     */
    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * Parse the date String ex. "T-2"
     */
    parseDateString$(calCode: string, dateString: string): Observable<Date> {
        const today: moment.Moment = CalendarDateUtils.checkOverrideAndGetToday();

        // If the user types in T and the token value is set to 0, we can just parse and return today's date
        if (dateString === 'T' && CalendarDateUtils.maxSelectableDate === '0') {
            return of(today.toDate());
        }

        const match = CalendarDateUtils.relativeDateRegex.exec(dateString);
        if (!match || match.length === 0) {
            return of(undefined);
        }

        // prepare params for getting date from server
        const params = {
            days: match[2],
            additionalString: match[3],
            holidayCalendar: calCode,
            todayDate: today.format('YYYYMMDD')
        };

        // check if holidayCalendar + todayDate + T + days is already in the map and return to avoid unnecessary Http calls
        const cacheString = params.holidayCalendar + params.todayDate + params.additionalString + params.days;
        if (CalendarDateUtils.relativeDateCache[cacheString]) {
            setTimeout(() => of(new Date(CalendarDateUtils.relativeDateCache[cacheString])));
        }

        return this.http2BmsService.post$('getDate', params).pipe(
            map((response: any) => {
                    const newDate: Date = moment(response.data, 'MM/DD/YYYY').toDate();
                    CalendarDateUtils.relativeDateCache[cacheString] = newDate;
                    return newDate;
                }, catchError( (error: Error) => {
                    // Log that an error happened and then return a failed promise.
                    console.log('Failed to get Date', error);
                    return throwError(error);
                })
            )
        );
    }

    /**
     * Resolves T-1 date to an absolute date based on calendar code (handles situation where clients may have GP running on Sunday)
     * @param calCode  Calendar code selected
     */
    getMaxDateByCalendarCode$(calCode: string): Observable<Date> {
        return this.parseDateString$(calCode, CalendarDateUtils.getDefaultDateString());
    }
}
