import {InjectionToken} from '@angular/core';
import {DerivedColumnOptionServiceInterface} from './service-interfaces/derived-column-option-service.interface';

export const DERIVED_COLUMN_OPTION_SERVICE_TOKEN = new InjectionToken<DerivedColumnOptionServiceInterface>('DERIVED_COLUMN_OPTION_SERVICE_TOKEN');
