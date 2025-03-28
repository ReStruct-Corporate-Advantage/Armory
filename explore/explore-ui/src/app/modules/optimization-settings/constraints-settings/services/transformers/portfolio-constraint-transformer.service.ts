import {Injectable} from '@angular/core';
import {ConstraintTransformer} from '../constraint-transformer.interface';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary} from 'lodash';
import {getConstraintDisplayUnit, getConstraintDisplayValue, getConstraintTitle, getRelaxationDisplayValue} from '../../utils/constraint.utils';
import {SUB_TYPE_PORTFOLIO_CONSTRAINTS} from '../../../constants/optimization-types.constants';

/**
 * Transforms portfolio Constraint objects into flat dictionaries for display purposes
 */
@Injectable({
    providedIn: 'root'
})
export class PortfolioConstraintTransformerService implements ConstraintTransformer {
    type(): string {
        return SUB_TYPE_PORTFOLIO_CONSTRAINTS;
    }

    transform(constraint: Constraint): Dictionary<any> {
        return {
            constraint: getConstraintTitle(constraint),
            value: getConstraintDisplayValue(constraint.optionValues.ConstraintValue),
            unit: getConstraintDisplayUnit(constraint.optionValues.ConstraintUnit, constraint.constraintOptions),
            lowerBound: constraint.optionValues.ConstraintLowerBound,
            upperBound: constraint.optionValues.ConstraintUpperBound,
            relaxation: getRelaxationDisplayValue(constraint.relaxationValue),
            isRelaxable: constraint.isRelaxable,
            enabled: constraint.enabled,
            ...(!!constraint.optionValues.isMixedIntegerEnabled ? {minTradeSize: constraint.optionValues.minTradeSize} : {}),
            ...(!!constraint.optionValues.isMixedIntegerEnabled ? {tradeIncrement: constraint.optionValues.tradeIncrement} : {})
        };
    }
}
