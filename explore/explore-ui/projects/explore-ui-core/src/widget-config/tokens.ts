import {InjectionToken} from '@angular/core';

// Provides the location of the directory where widget configs can be resolved from
export const WIDGET_CONFIG_DIRECTORY_TOKEN = new InjectionToken<string>('WIDGET_CONFIG_DIRECTORY_TOKEN');
