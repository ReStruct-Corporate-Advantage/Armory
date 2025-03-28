import {NO, YES} from '../constants/constraint.constants';
import {
    getConstraintDisplayUnit,
    getConstraintDisplayValue,
    getConstraintScope,
    getConstraintType,
    getRelaxationDisplayValue,
    isNotDeprecatedActiveSectorConstraint,
    isValidDeprecatedActiveSectorConstraint,
    setBoundForConstraint
} from './constraint.utils';
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
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {CommonConstants} from '@constants/common.constants';
import {NumericColumnFormat} from '@blk/explore-ui-core';

describe('constraint utils', () => {
    describe('should get constraint display value', () => {
        it('should return yes for true values', () => {
            expect(getConstraintDisplayValue(true)).toEqual(YES);
        });

        it('should return no for false values', () => {
            expect(getConstraintDisplayValue(false)).toEqual(NO);
        });

        it('should return constraint value when not boolean', () => {
            expect(getConstraintDisplayValue('other')).toEqual('other');
        });
    });

    describe('should get constraint type display value', () => {
        it('should return Portfolio Only Constraints for PORTFOLIO_CONSTRAINTS value', () => {
            expect(getConstraintType(new Constraint({constraintType: SUB_TYPE_PORTFOLIO_CONSTRAINTS}))).toEqual(PORTFOLIO_CONSTRAINTS_TITLE);
        });

        it('should return Security Constraints for SECURITY_CONSTRAINT value', () => {
            expect(getConstraintType(new Constraint({constraintType: SUB_TYPE_SECURITY_CONSTRAINTS}))).toEqual(SECURITY_CONSTRAINTS_TITLE);
        });

        it('should return Sector and Portfolio Constraints for SECTOR_CONSTRAINTS value', () => {
            expect(getConstraintType(new Constraint({constraintType: SUB_TYPE_SECTOR_CONSTRAINTS}))).toEqual(SECTOR_CONSTRAINTS_TITLE);
        });

        it('should return Factor Constraints for FACTOR_CONSTRAINTS value', () => {
            expect(getConstraintType(new Constraint({constraintType: SUB_TYPE_FACTOR_CONSTRAINTS}))).toEqual(FACTOR_CONSTRAINTS_TITLE);
        });
    });

    describe('should get constraint scope display value', () => {
        it('should return empty string if constraint type is NOT SECURITY_CONSTRAINTS value', () => {
            expect(getConstraintScope(new Constraint({constraintType: SUB_TYPE_PORTFOLIO_CONSTRAINTS}))).toEqual('');
        });

        it('should return securityList value if constraint type is SECURITY_CONSTRAINTS and value is selected from Universe', () => {
            expect(getConstraintScope(
                new Constraint({constraintType: SUB_TYPE_SECURITY_CONSTRAINTS, optionValues: {securityList : 'Investment Universe'}}))
            ).toEqual('Investment Universe');
        });

        it('should return CUSTOM LIST value if constraint type is SECURITY_CONSTRAINTS and value is selected via filter / upload securities', () => {
            expect(getConstraintScope(
                new Constraint({constraintType: SUB_TYPE_SECURITY_CONSTRAINTS}))
            ).toEqual(CommonConstants.CUSTOM_LIST);
        });
    });

    describe('should get relaxation display value', () => {
        it('should return true when value is 1', () => {
            expect(getRelaxationDisplayValue(1)).toEqual(true);
        });

        it('should return true when value is not 1', () => {
            expect(getRelaxationDisplayValue(0)).toEqual(false);
        });
    });

    describe('should get constraint display unit', () => {
        const unitValue = 'PERCENTAGE';
        const unitLabel = '%';

        it('should return value when no constraint options', () => {
            expect(getConstraintDisplayUnit(unitValue, undefined)).toBe(unitLabel);
        });

        it('should return value when no option attributes', () => {
            expect(getConstraintDisplayUnit(unitValue, [{}])).toBe(unitLabel);
        });

        it('should return value when option attributes empty', () => {
            expect(getConstraintDisplayUnit(unitValue, [{
                columnOptionAttributes: []
            }])).toBe(unitLabel);
        });

        it('should return value when no matching option attributes', () => {
            expect(getConstraintDisplayUnit(unitValue, [{
                columnOptionAttributes: [{
                    key: 'other'
                }]
            }])).toBe(unitLabel);
        });

        it('should return value when no option attribute values', () => {
            expect(getConstraintDisplayUnit(unitValue, [{
                columnOptionAttributes: [{
                    key: 'ConstraintUnit'
                }]
            }])).toBe(unitLabel);
        });

        it('should return value when no matching option attribute values', () => {
            expect(getConstraintDisplayUnit(unitValue, [{
                columnOptionAttributes: [{
                    key: 'ConstraintUnit',
                    values: [{
                        label: 'other',
                        value: 'other'
                    }]
                }]
            }])).toBe(unitLabel);
        });

        it('should return label when matching option attribute value', () => {
            expect(getConstraintDisplayUnit(unitValue, [{
                columnOptionAttributes: [{
                    key: 'ConstraintUnit',
                    values: [{
                        label: 'label',
                        value: unitValue
                    }]
                }]
            }])).toBe('label');
        });
    });

    describe('setBoundForConstraint', () => {
        it('should handle array input for constraintOptionValue', () => {
            const constraint = new Constraint({
                optionValues: {
                    LOWER_BOUND: [0, 2, 3]
                },
                columnFormat: new NumericColumnFormat({
                    scalingFactor: 2
                })
            });
            const constraintModel = {};

            setBoundForConstraint(constraint, constraintModel, 'lowerBound', 'LOWER_BOUND');

            expect(constraintModel['lowerBound']).toEqual('0,4,6');
        });
    });

    describe('isNotDeprecatedActiveSectorConstraint', () => {
        it('should return true if valid active sector constraint', () => {
            expect(isNotDeprecatedActiveSectorConstraint('ACTIVE', 'krd_3m')).toEqual(false);
            expect(isNotDeprecatedActiveSectorConstraint('PORT', 'krd_3m')).toEqual(true);
            expect(isNotDeprecatedActiveSectorConstraint('ACTIVE', 'pct_mv')).toEqual(true);
            expect(isNotDeprecatedActiveSectorConstraint('ACTIVE', 'market_val')).toEqual(true);

        });
    });

    describe('isValidDeprecatedActiveSectorConstraint', () => {
        it('should return false if the constraint is not deprecated', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'pct_mv'
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return false if optionValues is nil', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag'
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return false if RelativeAbsolute is not ABSOLUTE', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'RELATIVE'
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return true if lowerBound is nil and upperBound is greater than 0', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE',
                    ConstraintUpperBound: 5
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(true);
        });

        it('should return false if upperBound is nil and lowerBound is less than 0', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE',
                    ConstraintLowerBound: 5
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return false if lowerBound is greater than 0 and upperBound is greater than 0', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE',
                    ConstraintLowerBound: 4,
                    ConstraintUpperBound: 5,
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return true if lowerBound is less than 0 and upperBound is greater than 0', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE',
                    ConstraintLowerBound: -4,
                    ConstraintUpperBound: 5,
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(true);
        });

        it('should return true if lowerBound is less than 0 and upperBound is less than 0', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE',
                    ConstraintLowerBound: -4,
                    ConstraintUpperBound: -1,
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return false if both lowerBound and upperBound are nil', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE'
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });

        it('should return false if lowerBound is greater than or equal to 0 and upperBound is less than or equal to 0', () => {
            const constraint = new Constraint({
                positionType: 'ACTIVE',
                constraintTag: 'some_tag',
                optionValues: {
                    RelativeAbsolute: 'ABSOLUTE',
                    ConstraintLowerBound: 0,
                    LowerBoundOperators: 'ADDITION',
                    ConstraintUpperBound: 0,
                    UpperBoundOperators: 'SUBTRACTION'
                }
            });
            expect(isValidDeprecatedActiveSectorConstraint(constraint)).toBe(false);
        });
    });
});
