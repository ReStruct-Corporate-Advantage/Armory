import {InjectionToken} from '@angular/core';
import {PerformanceAttributionSettingsServiceInterface} from './service-interfaces/performance-attribution-settings-service.interface';
import {PerformanceTimePeriodSettingsServiceInterface} from './service-interfaces/performance-time-period-settings-service.interface';

export const PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN = new InjectionToken<PerformanceAttributionSettingsServiceInterface>('PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN');
export const PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN = new InjectionToken<PerformanceTimePeriodSettingsServiceInterface>('PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN');

