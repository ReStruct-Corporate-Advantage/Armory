import {TimePeriod} from '../../date/models/time-period/time-period.model';
import {Observable} from 'rxjs';

/**
 * PerformanceTimePeriodSettingsServiceInterface
 * Library Consumers need to implement this interface and provide the token: PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN
 */
export interface PerformanceTimePeriodSettingsServiceInterface {
    populateTimePeriodFromValue$(timePeriod: TimePeriod): Observable<TimePeriod>;

    getAvailableTypes(): any[];

    getAvailableIntervals(timePeriod: TimePeriod): string[];

    getIntervalsByType(type: string): string[];

    modifyTimePeriod$(timePeriod: TimePeriod): Observable<any>;
}
