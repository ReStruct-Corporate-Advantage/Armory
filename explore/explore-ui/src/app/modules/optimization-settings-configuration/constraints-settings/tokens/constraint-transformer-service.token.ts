import {InjectionToken} from '@angular/core';
import {ConstraintTransformerService} from '../interfaces/constraint-transformer-service.interface';

export const CONSTRAINT_TRANSFORMER_SERVICE: InjectionToken<ConstraintTransformerService<any>> = new InjectionToken('Constraint Transformer Service');
