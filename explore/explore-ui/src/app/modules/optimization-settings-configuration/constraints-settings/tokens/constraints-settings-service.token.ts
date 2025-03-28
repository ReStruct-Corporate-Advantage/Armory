import {InjectionToken} from '@angular/core';
import {ConstraintsSettingsService} from '../interfaces/constraints-settings-service.interface';

export const CONSTRAINTS_SETTINGS_SERVICE: InjectionToken<ConstraintsSettingsService<any, any>> = new InjectionToken('Constraints Settings Service');
