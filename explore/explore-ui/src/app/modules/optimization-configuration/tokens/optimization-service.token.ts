import {InjectionToken} from '@angular/core';
import {OptimizationService} from '../services/optimization-service.interface';

export const OPTIMIZATION_SERVICE: InjectionToken<OptimizationService> = new InjectionToken('Optimization Service');
