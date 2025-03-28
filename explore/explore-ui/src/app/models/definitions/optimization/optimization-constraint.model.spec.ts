import {OptimizationConstraint} from './optimization-constraint.model';
import {NumericColumnFormat} from '@blk/explore-ui-core';

/**
 * Test Case for Optimization Constraint
 */
describe('Constraint test cases', () => {
    /**
     * Deserialize test case
     */
    it('Deserialize test case', () => {
        const data: any = {
            columnTag: 'allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions'
        };

        const constraintCtrl = new OptimizationConstraint(data);
        expect(constraintCtrl.columnTag).toBe('allow_short_position');
        expect(constraintCtrl.constraintType).toBe('PORTFOLIO_CONSTRAINT');
        expect(constraintCtrl.groups[0]).toBe('Long/Short');
        expect(constraintCtrl.isRelaxable).toBeFalsy();
        expect(constraintCtrl.title).toBe('Allow Short Positions');
    });

    it('Deserialize test case with aliasTag', () => {
        const  columnFormat = new NumericColumnFormat();
        columnFormat.decimalPlaces = 0;
        columnFormat.isScalable = true;
        columnFormat.scalingFactor = 1;

        const data: any = {
            columnTag: 'allow_short_position',
            aliasConstraintTag: 'alias_allow_short_position',
            constraintType: 'PORTFOLIO_CONSTRAINT',
            group: 'Long/Short',
            isRelaxable: false,
            title: 'Allow Short Positions',
            constraintFormat : {
                decimalPlaces : 0,
                scalingFactor : 1,
                isScalable: true
            }
        };

        const constraintCtrl = new OptimizationConstraint(data);
        expect(constraintCtrl.columnTag).toBe('allow_short_position');
        expect(constraintCtrl.aliasConstraintTag).toBe('alias_allow_short_position');
        expect(constraintCtrl.constraintType).toBe('PORTFOLIO_CONSTRAINT');
        expect(constraintCtrl.groups[0]).toBe('Long/Short');
        expect(constraintCtrl.isRelaxable).toBeFalsy();
        expect(constraintCtrl.title).toBe('Allow Short Positions');
        expect((constraintCtrl.columnFormat as NumericColumnFormat).scalingFactor).toBe(1);
    });
});
