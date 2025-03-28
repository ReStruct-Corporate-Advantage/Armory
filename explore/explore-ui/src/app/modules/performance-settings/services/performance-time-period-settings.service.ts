import {Injectable} from '@angular/core';
import {
    CalendarDateUtils,
    DateFormatConstants,
    DateService,
    DateValue,
    PerformanceTimePeriodSettingsServiceInterface,
    TimePeriod,
    TimePeriodShortName
} from '@blk/explore-ui-core';
import {RequestConstants} from '@constants/request.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Http2BmsService} from '@services/bms';
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {CacheKey} from '@interfaces/cache-key.interface';
import {TimePeriodResponse} from '@interfaces/time-period-response.interface';

/**
 * Helper class for Performance Settings
 */
@Injectable({
    providedIn: 'root'
})
export class PerformanceTimePeriodSettingsService implements PerformanceTimePeriodSettingsServiceInterface {

    // portfolio to hold portfolio context to get date information from it for TimePeriodSettingsComponent
    static portfolio: Portfolio;

    // Cache that stores the time period start and end date . The key of the map is then cacheKey for the TimePeriodDatesRequest
    static timePeriodDatesCache: Map<string , TimePeriodResponse> = new Map<string, TimePeriodResponse>();

    isExploreSpecific = true;

    constructor(private dateService: DateService, private httpService: Http2BmsService) {
    }

    /**
     * Set custom time period
     */
    private setCustomTimePeriod(timePeriod: TimePeriod, datePicker: DateValue): void {
        timePeriod.fromDate = CalendarDateUtils.isRelativeDate(timePeriod.fromDateValue) ? DateValue.newRelativeDate(timePeriod.fromDateValue) : DateValue.newDate(timePeriod.fromDateValue);
        timePeriod.toDate = CalendarDateUtils.isRelativeDate(timePeriod.toDateValue) ? DateValue.newRelativeDate(timePeriod.toDateValue) : DateValue.newDate(timePeriod.toDateValue);
        timePeriod.fromDate.calCode = timePeriod.toDate.calCode = datePicker.calCode;

        timePeriod.shortName = TimePeriodShortName.CUSTOM;
        timePeriod.timePeriodName = 'Custom';
        timePeriod.numberOfPeriods = 1;
        timePeriod.interval = '';
        timePeriod.type = 'Custom';
    }

    /**
     * Populate the interval, type , dates etc based upon the time period short Name
     */
    populateTimePeriodFromValue$(timePeriod: TimePeriod): Observable<TimePeriod> {
        const {datePicker, timePeriods} = PerformanceTimePeriodSettingsService.portfolio;

        return new Observable(subscriber => {
            if (timePeriod.shortName === 'CUSTOM') {
                this.setCustomTimePeriod(timePeriod, datePicker);

                if (timePeriod.fromDate.date && timePeriod.toDate.date) {
                    subscriber.next(timePeriod);
                } else {
                    const observableQueue = [];
                    let fromDateParsed, toDateParsed;
                    if (!timePeriod.fromDate.date) {
                        observableQueue.push(this.dateService.parseDateString$(datePicker.calCode, timePeriod.fromDateValue));
                        fromDateParsed = true;
                    }
                    if (!timePeriod.toDate.date) {
                        observableQueue.push(this.dateService.parseDateString$(datePicker.calCode, timePeriod.toDateValue));
                        toDateParsed = true;
                    }
                    forkJoin(observableQueue).subscribe((response: Date[]) => {
                        if (fromDateParsed) {
                            timePeriod.fromDate.date = CalendarDateUtils.getDateInFormat(response[0], DateFormatConstants.MMDDYYYY_SLASH);
                            if (toDateParsed) {
                                timePeriod.toDate.date = CalendarDateUtils.getDateInFormat(response[1], DateFormatConstants.MMDDYYYY_SLASH);
                            }
                        } else {
                            timePeriod.toDate.date = CalendarDateUtils.getDateInFormat(response[0], DateFormatConstants.MMDDYYYY_SLASH);
                        }
                        subscriber.next(timePeriod);
                    });
                }
                return;
            }

            for (const timePeriodsVal of timePeriods) {
                if (timePeriodsVal.Value === timePeriod.shortName) {
                    timePeriod.type = timePeriodsVal.type;
                    timePeriod.interval = timePeriodsVal.interval;
                    timePeriod.maxPeriods = timePeriodsVal.maxPeriods;
                    timePeriod.timePeriodName = timePeriodsVal.timePeriodName;
                    this.setDatesFromTimePeriod$(timePeriod)
                        .subscribe((value) => {
                            subscriber.next(value);
                        });
                    break;
                }
            }
        });
    }

    /**
     * Get unique values from the given list
     */
    getAvailableTypes(): any[] {
        const availableTypesSet = new Set<any>();
        const availableTypes = [];

        for (const portfolioTimePeriod of PerformanceTimePeriodSettingsService.portfolio.timePeriods) {
            availableTypesSet.add(portfolioTimePeriod.type);
        }

        if (availableTypesSet) {
            availableTypesSet.forEach((item: string) => {
                availableTypes.push(item);
            });
        }

        return availableTypes;
    }

    /**
     * Get list of intervals for the current timePeriod
     */
    getAvailableIntervals(timePeriod: TimePeriod): string[] {
        let intervals = [];

        const timePeriodByShortName = this.getTimePeriodByShortName(timePeriod.shortName);

        if (timePeriodByShortName) {
            intervals = this.getIntervalsByType(timePeriodByShortName.type);
        }

        return intervals;
    }

    private getTimePeriodByShortName(shortName: string): { Value: string, type: string, interval: string, maxPeriods: number } {
        return PerformanceTimePeriodSettingsService.portfolio.timePeriods.find(timePeriod => timePeriod.Value === shortName);
    }

    getIntervalsByType(type: string): string[] {
        return PerformanceTimePeriodSettingsService.portfolio.timePeriods
            .filter(timePeriod => timePeriod.type === type)
            .map(timePeriod => timePeriod.interval);
    }



    /**
     * Set time period based upon type, interval and number of periods selected.
     */
    modifyTimePeriod$(timePeriod: TimePeriod): Observable<any> {
        return new Observable(subscriber => {
            for (const portTimePeriod of PerformanceTimePeriodSettingsService.portfolio.timePeriods) {
                if (portTimePeriod.type === timePeriod.type && portTimePeriod.interval === timePeriod.interval) {
                    timePeriod.shortName = portTimePeriod.Value;
                    timePeriod.maxPeriods = portTimePeriod.maxPeriods;
                    if (timePeriod.numberOfPeriods > timePeriod.maxPeriods) {
                        timePeriod.numberOfPeriods = timePeriod.maxPeriods;
                    }
                    this.setDatesFromTimePeriod$(timePeriod).subscribe((value) => {
                        subscriber.next(value);
                    });
                    break;
                }
            }
        });
    }

    /**
     * Set dates start and end based upon time period and number of periods
     */
    private setDatesFromTimePeriod$(timePeriod: TimePeriod): Observable<TimePeriod> {
        const {datePicker, portName, isIndexResearchPortfolio} = PerformanceTimePeriodSettingsService.portfolio;

        // these are set to blank so that we blank out the date pickers while dates are being fetched from server and then set them to new values once data is back from server
        timePeriod.fromDateValue = null;
        timePeriod.toDateValue = null;
        timePeriod.fromDate = null;
        timePeriod.toDate = null;

        return this.getDatesForTimePeriod$(timePeriod.shortName, timePeriod.numberOfPeriods, datePicker.date, datePicker.calCode, portName, isIndexResearchPortfolio)
            .pipe(
                map(payload => {
                    // timePeriod should hold US format, and can be converted in other formats in the date picker wrapper component.
                    timePeriod.fromDateValue = payload.startDate;
                    timePeriod.toDateValue = payload.endDate;

                    // Following Attributes are required by Date Picker to show relative and absolute date.
                    // DateStringValue stores relative date and DateString represent id date is relative date or not.

                    timePeriod.fromDate = new DateValue({
                        date: CalendarDateUtils.getDateInFormat(timePeriod.fromDateValue, DateFormatConstants.MMDDYYYY_SLASH),
                        calCode: datePicker.calCode,
                        dateString: false
                    });
                    timePeriod.toDate = new DateValue({
                        date: CalendarDateUtils.getDateInFormat(timePeriod.toDateValue, DateFormatConstants.MMDDYYYY_SLASH),
                        calCode: datePicker.calCode,
                        dateString: false
                    });
                    timePeriod.timePeriodName = payload.fullName;
                    timePeriod.isStartDateSetToPerformDate = payload.isStartDateSetToPerformDate === 'true';
                    return timePeriod;
                }));
    }

    /**
     * Get dates start and end based upon time period and number of periods from the server
     */
    getDatesForTimePeriod$(timePeriod: string, numberOfPeriods: number, date: string, calCode: string, portfolioName: string, isIndexResearchPortfolio: boolean): Observable<TimePeriodResponse> {
        const requestParams: any = {
            timePeriodShortName: timePeriod,
            numberOfPeriods,
            asOfDate: date,
            holidayCalendar: calCode,
            portfolioName, // portfolio name is required for fiscal year as it is specific to portfolio.
            isIndexHistoryPort: isIndexResearchPortfolio
        };

        const cacheModel: TimePeriodDatesRequest = new TimePeriodDatesRequest (requestParams);
        const cacheKey = cacheModel.getCacheKey();
      if (PerformanceTimePeriodSettingsService.timePeriodDatesCache.get(cacheKey) != null) {
          return of<TimePeriodResponse>(PerformanceTimePeriodSettingsService.timePeriodDatesCache.get(cacheKey));
      }

        return this.httpService
            .post$(RequestConstants.GET_TIME_PERIOD_DATES_AND_NAME, requestParams)
            .pipe(map(response =>  {
                PerformanceTimePeriodSettingsService.timePeriodDatesCache.set(cacheKey, response.data);
                return response.data;
            }));
    }
}


// Model for storing request params and cache key for time period dates request
class TimePeriodDatesRequest implements CacheKey {
    requestParams: any;

    constructor(queryParams: any) {
        this.requestParams = queryParams;
    }

    getCacheKey(): string {
        return JSON.stringify(this.requestParams);
    }
}



