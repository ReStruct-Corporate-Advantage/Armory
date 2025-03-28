import {Injectable} from '@angular/core';
import {ConstraintTransformer} from '../constraint-transformer.interface';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary, isNil} from 'lodash';
import {getConstraintDisplayUnit, getConstraintDisplayValue, getConstraintTitle, getRelaxationDisplayValue} from '../../utils/constraint.utils';
import {SUB_TYPE_SECURITY_CONSTRAINTS} from '../../../constants/optimization-types.constants';
import {CommonConstants} from '@constants/common.constants';

/**
 * Transforms security Constraint objects into flat dictionaries for display purposes
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityConstraintTransformerService implements ConstraintTransformer {
    type(): string {
        return SUB_TYPE_SECURITY_CONSTRAINTS;
    }

    transform(constraint: Constraint): Dictionary<any> {
        return {
            constraint: getConstraintTitle(constraint),
            value: getConstraintDisplayValue(constraint.optionValues.ConstraintValue),
            unit: getConstraintDisplayUnit(constraint.optionValues.ConstraintUnit, constraint.constraintOptions),
            associatedList: !isNil(constraint.optionValues.securityList) ? constraint.optionValues.securityList : CommonConstants.CUSTOM_LIST,
            lowerBound: constraint.optionValues.ConstraintLowerBound,
            upperBound: constraint.optionValues.ConstraintUpperBound,
            relaxation: getRelaxationDisplayValue(constraint.relaxationValue),
            isRelaxable: constraint.isRelaxable,
            enabled: constraint.enabled
        };
    }
}
