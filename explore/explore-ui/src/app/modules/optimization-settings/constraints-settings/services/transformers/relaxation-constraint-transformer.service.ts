import {Injectable} from '@angular/core';
import {ConstraintTransformer} from '../constraint-transformer.interface';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary} from 'lodash';
import {
    getConstraintScope,
    getConstraintTitle,
    getConstraintType,
    getRelaxationDisplayValue
} from '../../utils/constraint.utils';
import {SUB_TYPE_RELAXATION_CONSTRAINTS} from '../../../constants/optimization-types.constants';

/**
 * Transforms Relaxation Constraint objects into flat dictionaries for display purposes
 */
@Injectable({
    providedIn: 'root'
})
export class RelaxationConstraintTransformerService implements ConstraintTransformer {
    type(): string {
        return SUB_TYPE_RELAXATION_CONSTRAINTS;
    }

    transform(constraint: Constraint): Dictionary<any> {
        return {
            constraintType: getConstraintType(constraint),
            constraint: getConstraintTitle(constraint),
            constraintScope: getConstraintScope(constraint),
            lowerBound: constraint.optionValues?.ConstraintLowerBound,
            upperBound: constraint.optionValues?.ConstraintUpperBound,
            relaxation: getRelaxationDisplayValue(constraint.relaxationValue),
            isRelaxable: constraint.isRelaxable
        };
    }
}
