import {FREEZE_INITIAL_SHORT_POSITIONS, NO, YES} from '../constants/constraint.constants';
import {ConstraintOptionTypeKey} from '../enums/constraint-option-type-key.enum';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {has, isArray, isEmpty, isNil, join} from 'lodash';
import {DefinitionsStore} from '../../../../stores';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {
    ConstraintOptionValueKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-value-key.enum';
import {
    ColumnConstants,
    ColumnFormat,
    ColumnOptionAttributeValue,
    ColumnOptionMetaDataInterface, CoreColumnConstants,
    NumericColumnFormat
} from '@blk/explore-ui-core';
import {CompositionUtils} from '@utils/composition.utils';
import {CompositionConstants} from '@constants/composition.constants';
import {ConstraintUnit} from '@optimization-settings/constraints-settings/enums/constraint-unit.enum';
import {
    SUB_TYPE_FACTOR_CONSTRAINTS,
    SUB_TYPE_PORTFOLIO_CONSTRAINTS,
    SUB_TYPE_SECTOR_CONSTRAINTS,
    SUB_TYPE_SECURITY_CONSTRAINTS
} from '@optimization-settings/constants/optimization-types.constants';
import {
    FACTOR_CONSTRAINTS_TITLE,
    PORTFOLIO_CONSTRAINTS_TITLE,
    SECTOR_CONSTRAINTS_TITLE,
    SECURITY_CONSTRAINTS_TITLE
} from '@optimization-settings/constants/optimization-title.constants';
import {CommonConstants} from '@constants/common.constants';

export function getConstraintDisplayValue(constraintValue: any): any {
    switch (constraintValue) {
        case 'true':
        case true:
            return YES;
        case 'false':
        case false:
            return NO;
        case 'FREEZE_INITIAL_SHORT_POSITIONS':
            return FREEZE_INITIAL_SHORT_POSITIONS;
        default:
            return constraintValue;
    }
}

export function getRelaxationDisplayValue(relaxationValue: number): boolean {
    return relaxationValue === 1;
}

/**
 * Fetches title from DefinitionsStore.optimizationConstraint if already not present
 *
 */
export function getConstraintTitle(constraint: Constraint): string {
    if (!isNil(constraint.optionValues?.constraintTitle)) {
        constraint.title = constraint.optionValues.constraintTitle;
    }
    const optimizationConstraint = DefinitionsStore.optimizationConstraint.find((optoConstraint: OptimizationConstraint) => optoConstraint.columnTag === constraint.constraintTag);
    return !isNil(constraint.title) ? constraint.title : !isNil(optimizationConstraint) ? optimizationConstraint.title : undefined;
}

/**
 * This method gets the contraint scope value to be displayed in Relaxation panel.
 */
export function getConstraintScope(constraint: Constraint): string {
    let result = CommonConstants.EMPTY_STRING;
    if (constraint.constraintType === SUB_TYPE_SECURITY_CONSTRAINTS) {
        result = !isEmpty(constraint.optionValues?.securityList) ? constraint.optionValues.securityList : CommonConstants.CUSTOM_LIST;
    }
    return result;
}

/**
 * This method returns constraint type title based on internal value.
 * @param constraint
 */
export function getConstraintType(constraint: Constraint): string {
    if (isNil(constraint.constraintType)) {
        return CommonConstants.EMPTY_STRING;
    }
    if (SUB_TYPE_PORTFOLIO_CONSTRAINTS === constraint.constraintType) {
        return PORTFOLIO_CONSTRAINTS_TITLE;
    }
    if (SUB_TYPE_SECURITY_CONSTRAINTS === constraint.constraintType) {
        return SECURITY_CONSTRAINTS_TITLE;
    }
    if (SUB_TYPE_SECTOR_CONSTRAINTS === constraint.constraintType) {
        return SECTOR_CONSTRAINTS_TITLE;
    }
    if (SUB_TYPE_FACTOR_CONSTRAINTS === constraint.constraintType) {
        return FACTOR_CONSTRAINTS_TITLE;
    }
    return CommonConstants.EMPTY_STRING;
}

export function getConstraintDisplayUnit(constraintUnit: any, constraintOptions: ColumnOptionMetaDataInterface[]) {
    if (!constraintOptions) {
        return ConstraintUnit[constraintUnit];
    }
    const constraintOption: ColumnOptionMetaDataInterface = constraintOptions.find(
        (constraintOptionToCheck: ColumnOptionMetaDataInterface) => constraintOptionToCheck.columnOptionAttributes
            && constraintOptionToCheck.columnOptionAttributes.length > 0
            && constraintOptionToCheck.columnOptionAttributes[0].key === ConstraintOptionTypeKey.UNIT
    );
    if (constraintOption && constraintOption.columnOptionAttributes[0].values) {
        const optionAttributeValue = constraintOption.columnOptionAttributes[0].values.find((optionAttributeValuetoCheck: ColumnOptionAttributeValue) => optionAttributeValuetoCheck.value === constraintUnit);
        return optionAttributeValue ? optionAttributeValue.label : ConstraintUnit[constraintUnit];
    } else {
        return ConstraintUnit[constraintUnit];
    }
}

/**
 * Sets upper and lower bounds for any constraint
 */
export function setUpperLowerBoundsForConstraint(constraint: Constraint, constraintModel: any, lowerBoundKey: string, upperBoundKey: string): void {
    setBoundForConstraint(constraint, constraintModel, lowerBoundKey, ConstraintOptionValueKey.LOWER_BOUND);
    setBoundForConstraint(constraint, constraintModel, upperBoundKey, ConstraintOptionValueKey.UPPER_BOUND);
}

/**
 * Sets upper and lower bounds operator for any constraint
 */
export function setUpperLowerBoundsOperatorForConstraint(constraint: Constraint, constraintModel: any, lowerBoundKey: string, upperBoundKey: string): void {
    setBoundOperatorForConstraint(constraint, constraintModel, lowerBoundKey, ConstraintOptionValueKey.LOWER_BOUND_OPERATOR);
    setBoundOperatorForConstraint(constraint, constraintModel, upperBoundKey, ConstraintOptionValueKey.UPPER_BOUND_OPERATOR);
}

/**
 * Set upper/lower bound operator for any constraint
 */
export function setBoundOperatorForConstraint(constraint: Constraint, constraintModel: any, boundKey: string, optionValueBoundKey: string): void {
    if (has(constraint.optionValues, optionValueBoundKey)) {
        constraintModel[boundKey] = constraint.optionValues[optionValueBoundKey];
    }
}

/**
 * Set upper/lower bound by multiplying scaling factor if constraint is a percentage constraint
 */
export function setBoundForConstraint(constraint: Constraint, constraintModel: any, boundKey: string, optionValueBoundKey: string): void {
    if (has(constraint.optionValues, optionValueBoundKey)) {
       let constraintOptionValue =  constraint.optionValues[optionValueBoundKey];
        // 1. Check if Efficient Frontier Enabled
        if (CompositionUtils.checkIfBoundInEfficientFormat(constraintOptionValue)) {
            // 2. If efficient is in range format i.e. 1:4 | -.6:4.7
            if (CompositionConstants.EFF_FRONT_COLON_REGEX.test(constraintOptionValue)) {
                // 3. Parse the range input and scale the each range values.
                // 4. Convert back to range format.
                constraintOptionValue = join(constraintOptionValue.split(':').map(n => getScaledConstraintValue(Number(n), constraint.columnFormat)), ':');
            } else if (isArray(constraintOptionValue)) { // Check if efficient is defined in specific point format i.e. 1,5,7 | -.5,2,4.5.
                // Scale each point of constraint.
                constraintOptionValue = join(constraintOptionValue.map(value => getScaledConstraintValue(value, constraint.columnFormat)), ',');
            }
            constraintModel[boundKey] = constraintOptionValue;
        } else {
            constraintModel[boundKey] = getScaledConstraintValue(constraintOptionValue, constraint.columnFormat);
        }
    }
}

/**
 * Get scaled value of constraint if scalingFactor is given for constraint columnFormat
 */
export function getScaledConstraintValue(optionValue: any, columnFormat: ColumnFormat) {
    return optionValue *
        (columnFormat instanceof NumericColumnFormat && columnFormat.scalingFactor ? columnFormat.scalingFactor : 1);
}

/**
 * Checks if the active sector constraint is valid or not
 * @param positionType
 * @param columnTag
 */
export function isNotDeprecatedActiveSectorConstraint(positionType: string, columnTag: string): boolean {
    return columnTag === ColumnConstants.COLUMN_TAG.PCT_MARKET_VAL || columnTag === ColumnConstants.COLUMN_TAG.MARKET_VAL || positionType !== CoreColumnConstants.USE_TYPES.ACTIVE;
}

/**
 * Check if a deprecated active sector constraint is valid and can be converted to the new request format
 * @param constraint
 */
export function isValidDeprecatedActiveSectorConstraint(constraint: Constraint): boolean {
    if (!isNil(constraint.optionValues) && !isNil(constraint.optionValues.RelativeAbsolute) && constraint.optionValues.RelativeAbsolute.toUpperCase() === 'ABSOLUTE') {
        const lowerBound = constraint.optionValues['ConstraintLowerBound'];
        const upperBound = constraint.optionValues['ConstraintUpperBound'];
        if (isNil(lowerBound) && !isNil(upperBound)) {
            return upperBound > 0;
        } else if (!isNil(lowerBound) && isNil(upperBound)) {
            return lowerBound < 0;
        } else if (!isNil(lowerBound) && !isNil(upperBound)) {
            return lowerBound < 0 && upperBound > 0;
        } else {
            return false;
        }
    }
    return false;
}
