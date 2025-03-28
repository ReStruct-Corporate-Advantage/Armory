import {InjectionToken} from '@angular/core';
import {NotificationServiceInterface} from './service-interfaces/notification-service.interface';

export const NOTIFICATION_SERVICE_TOKEN = new InjectionToken<NotificationServiceInterface>('NOTIFICATION_SERVICE_TOKEN');
