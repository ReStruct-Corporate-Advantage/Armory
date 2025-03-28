import {Injectable} from '@angular/core';
import {Dictionary, isEmpty} from 'lodash';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {getConstraintTitle, getRelaxationDisplayValue} from '@optimization-settings/constraints-settings/utils/constraint.utils';
import {SUB_TYPE_FACTOR_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {ConstraintTransformer} from '@optimization-settings/constraints-settings/services/constraint-transformer.interface';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {QUICK_FACTOR_BLOCK_LIST} from '@optimization-settings/constraints-settings/constants/constraint.constants';

/**
 * Transforms factor Constraint objects into flat dictionaries for display purposes
 */
@Injectable({
    providedIn: 'root'
})
export class FactorConstraintTransformerService implements ConstraintTransformer {
    type(): string {
        return SUB_TYPE_FACTOR_CONSTRAINTS;
    }

    transform(constraint: Constraint): Dictionary<any> {
        return {
            constraint: getConstraintTitle(constraint),
            name: this.getName(constraint.optionValues),
            lowerBound: constraint.optionValues.ConstraintLowerBound,
            upperBound: constraint.optionValues.ConstraintUpperBound,
            relaxation: getRelaxationDisplayValue(constraint.relaxationValue),
            isRelaxable: constraint.isRelaxable,
            enabled: constraint.enabled
        };
    }

    getName(optionValues: any): string {
        if (!isEmpty(optionValues[ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK])) {
            return QUICK_FACTOR_BLOCK_LIST.find(factor => factor.value === optionValues[ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK]).label;
        } else if (!isEmpty(optionValues[ConstraintOptionTypeKey.FACTOR_TAG])) {
            return optionValues.factorTagList;
        }

        return undefined;
    }
}
