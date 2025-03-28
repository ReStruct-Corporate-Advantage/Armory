import {InjectionToken} from '@angular/core';
import {FactorColumnSetSettingsServiceInterface} from './service-interfaces/factor-column-set-settings-service.interface';

export const FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN = new InjectionToken<FactorColumnSetSettingsServiceInterface>('FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN');

/**
 * Token is used to enable or disable scenario creation functionalities
 * Is provided as false in this library module for Risk Radar and other applications
 * Is provided as true in Explore app module
 */
export const SCENARIO_CREATION_ENABLED_TOKEN = new InjectionToken<boolean>('SCENARIO_CREATION_ENABLED_TOKEN');
