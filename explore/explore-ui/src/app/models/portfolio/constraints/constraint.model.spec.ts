import {AbstractConfig, ConfigTypeFactory} from '@blk/explore-ui-core';
import {Constraint} from './constraint.model';

class MockConfig extends AbstractConfig {
    deserialize = jest.fn();
    serialize = jest.fn();
}

/**
 * Test Case for Optimization Constraint
 */
describe('Constraint test cases', () => {
    /**
     * Deserialize test case
     */
    it('Deserialize test case', () => {
        const createConfigSpy = jest.spyOn(ConfigTypeFactory, 'createConfig');
        createConfigSpy.mockReturnValueOnce('transformedValue');
        const constraintCtrl = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            enabled: true,
            relaxationValue: 1,
            isFrozen: true,
            optionValues: {
                key: 'value'
            },
            dataType: 'DOUBLE',
            columnFormat: {
                scalingFactor: null,
                useThousandsSeparator: null
            },
            positionType:"PORT"
        });
        expect(constraintCtrl.constraintTag).toBe('allow_short_position');
        expect(constraintCtrl.constraintType).toBe('PORTFOLIO_CONSTRAINT');
        expect(constraintCtrl.group).toBe('Long/Short');
        expect(constraintCtrl.isRelaxable).toBeFalsy();
        expect(constraintCtrl.title).toBe('Allow Short Positions');
        expect(constraintCtrl.enabled).toBe(true);
        expect(constraintCtrl.relaxationValue).toBe(1);
        expect(constraintCtrl.isFrozen).toBe(true);
        expect(constraintCtrl.optionValues).toEqual({
            key: 'transformedValue'
        });
        expect(constraintCtrl.dataType).toBe('DOUBLE');
        expect(constraintCtrl.positionType).toBe('PORT');
        expect(constraintCtrl.columnFormat).toEqual({
            scalingFactor: null,
            useThousandsSeparator: null
        });
        expect(createConfigSpy).toHaveBeenCalledTimes(1);
        expect(createConfigSpy).toHaveBeenCalledWith('value', 'key', false);
        createConfigSpy.mockRestore();
    });

    /**
     * Test case for method save
     */
    it('Test serialize', function () {
        const constraint = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            relaxationValue: 1,
            title: 'Allow Short Positions',
            enabled: true,
            isFrozen: true,
            positionType: "PORT"
        });
        constraint.optionValues = {
            key: new MockConfig()
        };
        jest.spyOn(constraint.optionValues.key, 'serialize').mockReturnValue('serialized');
        const constraintTOSave = constraint.serialize();
        expect(JSON.stringify(constraintTOSave)).toEqual(
            JSON.stringify({
                enabled: true,
                relaxationValue: 1,
                constraintTag: 'allow_short_position',
                constraintType: 'PORTFOLIO_CONSTRAINT',
                isFrozen: true,
                positionType : "PORT",
                group: 'Long/Short',
                optionValues: {
                    key: 'serialized'
                }
            })
        );
    });

    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        // GIVEN
        const constraint1 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1,
            positionType: "PORT"
        });

        let constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1,
            positionType: "PORT"
        });

        expect(constraint1.equals(constraint2)).toEqual(true);
        constraint2.constraintTag = '453543453';
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'sda',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'sdfsdf',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'asd',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: true,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint1.restrictedConstraints = ['constraint'];
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });
        constraint2.restrictedConstraints = ['constraint', 'constraint2'];

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2.restrictedConstraints = ['other'];

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2.restrictedConstraints = undefined;

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint1.restrictedConstraints = undefined;
        constraint2.restrictedConstraints = ['constraint'];

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });
        constraint2.constraintOptions = {
            key: 'value'
        };

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {
                key: 'value'
            },
            enabled: true,
            isFrozen: true,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: false,
            isFrozen: true,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: false,
            relaxationValue: 1
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 0
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);

        // WHEN
        constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1,
            positionType: "ACTIVE"
        });

        // THEN
        expect(constraint1.equals(constraint2)).toBe(false);
    });

    it('Test create optimization constraint mapping', () => {
        const constraintData = {
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions'
        };
        const data = {
            optimizationConstraints: [constraintData]
        };

        expect(Constraint.createOptimizationConstraintMapping(data)).toEqual([new Constraint(constraintData)]);
    });

    it('Test get security constraint associated security list', () => {
        const constraint2 = new Constraint({
            constraintTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            optionValues: {securityList: 'Benchmark'},
            enabled: true,
            isFrozen: true,
            relaxationValue: 1,
            positionType: 'ACTIVE'
        });
        expect(constraint2.getSecurityConstraintAssociatedSecurityList()).toEqual('Benchmark');

        constraint2.optionValues = {securityConstraintFilter: 'random filter'};
        expect(constraint2.getSecurityConstraintAssociatedSecurityList()).toEqual('Custom Filter');

        constraint2.optionValues = {selectedSecurities: ['abc']};
        expect(constraint2.getSecurityConstraintAssociatedSecurityList()).toEqual('Custom security list');
    });
});
