import {InjectionToken} from '@angular/core';
import {HttpServiceInterface} from './http.service.interface';

export const HTTP_SERVICE_TOKEN = new InjectionToken<HttpServiceInterface>('HTTP_SERVICE_TOKEN');
