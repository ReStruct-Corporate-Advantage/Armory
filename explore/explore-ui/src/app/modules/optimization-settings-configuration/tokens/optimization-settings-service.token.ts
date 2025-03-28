import {InjectionToken} from '@angular/core';
import {OptimizationSettingsService} from '../service/optimization-settings.service';

export const OPTIMIZATION_SETTINGS_SERVICE: InjectionToken<OptimizationSettingsService> = new InjectionToken('Optimization Settings Service');
