import {Injectable} from '@angular/core';
import {ConstraintTransformer} from '../constraint-transformer.interface';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Dictionary, isEmpty, isNil} from 'lodash';
import {getConstraintTitle, getRelaxationDisplayValue} from '../../utils/constraint.utils';
import {ALL_TYPE, ALL_VALUE, ONE_TYPE, ONE_VALUE, RELATIVE, PORTFOLIO} from '../../constants/sector-constraint.constants';
import {CustomSector} from '@blk/explore-ui-breakdown';
import {SUB_TYPE_SECTOR_CONSTRAINTS} from '../../../constants/optimization-types.constants';
import {CoreCommonConstants} from '@blk/explore-ui-core';
import {ConstraintOptionValueKey} from '@optimization-settings/constraints-settings/enums/constraint-option-value-key.enum';
import {ConstraintOptionBoundOperators} from '@optimization-settings/constraints-settings/enums/constraint-option-bound-operators.enum';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {CommonConstants} from '@constants/common.constants';

/**
 * Transforms sector Constraint objects into flat dictionaries for display purposes
 */
@Injectable({
    providedIn: 'root'
})
export class SectorConstraintTransformerService implements ConstraintTransformer {
    type(): string {
        return SUB_TYPE_SECTOR_CONSTRAINTS;
    }

    transform(constraint: Constraint): Dictionary<any> {
        return {
            constraint: getConstraintTitle(constraint),
            value: this.getValue(constraint.optionValues),
            name: this.getName(constraint.optionValues),
            lowerBound: this.getLowerUpperBound(constraint.optionValues, ConstraintOptionValueKey.LOWER_BOUND, ConstraintOptionValueKey.LOWER_BOUND_OPERATOR),
            upperBound: this.getLowerUpperBound(constraint.optionValues, ConstraintOptionValueKey.UPPER_BOUND, ConstraintOptionValueKey.UPPER_BOUND_OPERATOR),
            relaxation: getRelaxationDisplayValue(constraint.relaxationValue),
            missingDataHandling: constraint.optionValues[ConstraintOptionValueKey.CONSTRAINT_MISSING_DATA],
            isRelaxable: constraint.isRelaxable,
            enabled: constraint.enabled,
            [ConstraintOptionTypeKey.STRESS_PNL_SCENARIO]: constraint.optionValues?.[ConstraintOptionTypeKey.STRESS_PNL_SCENARIO],
            columnConfig: constraint.columnConfig
        };
    }

    private getValue(optionValues: any): string {
        switch (optionValues.sectorConstraintType) {
            case ALL_TYPE:
                return ALL_VALUE;
            case ONE_TYPE:
                return ONE_VALUE;
            case PORTFOLIO:
                return CommonConstants.PORTFOLIO;
            default:
                return undefined;
        }
    }

    private getName(optionValues: any): string {
        if (optionValues.sectorConstraintType === ONE_TYPE && optionValues.filter) {
            return optionValues.filter.title;
        } else if (optionValues.sectorConstraintType === ALL_TYPE && optionValues.breakdownTree && !optionValues.breakdownTree.isEmpty()) {
            if (!isEmpty(optionValues.breakdownTree.title)) {
                return optionValues.breakdownTree.title.replace('<', CoreCommonConstants.EMPTY_STRING).replace('>', CoreCommonConstants.EMPTY_STRING);
            } else if (optionValues.breakdownTree.children[0] instanceof CustomSector) {
                return optionValues.breakdownTree.children[0].title;
            } else {
                return optionValues.breakdownTree.children[0].columnName;
            }
        }
        return undefined;
    }

    /**
     * extract the lower/upper bound value considering the bound type is relative or absolute
     */
    private getLowerUpperBound(optionValues: any, optionValueBoundKey: string, optionValueBoundOperatorKey: string): string {
        let boundValue;
        if (optionValues.RelativeAbsolute !== RELATIVE) {
            boundValue = optionValues[optionValueBoundKey];
        } else if (optionValues.RelativeAbsolute === RELATIVE && !isNil(optionValues[optionValueBoundKey])) {
            boundValue = optionValues.PortBench + ' ' +  ConstraintOptionBoundOperators[optionValues[optionValueBoundOperatorKey].toUpperCase()] + ' ' + optionValues[optionValueBoundKey];
        }
        return boundValue;
    }
}
