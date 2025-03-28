import {WeightingSchemes} from './weighting-schemes.model';

/**
 * Weighting Schemes test cases
 */
describe('WeightingSchemes test cases', () => {

    it('Deserialize test - no data provided', () => {
        expect(new WeightingSchemes()).toBeTruthy();
    });

    it('Deserialize test - empty data provided', () => {
        expect(new WeightingSchemes({})).toBeTruthy();
    });

    it('Deserialize test', () => {
        const weightingSchemesCtrl = new WeightingSchemes({
            periodicity: 'W',
            defaultDecay: 0.917,
            defaultOverlap: 1,
            defaultPeriod: 104,
            displayName: 'Weekly Short-Term Half-Life',
            editableFields: ['zero_means', 'history_monthly', 'history_weekly', 'mat_src', 'var_fi_eq'],
            halfLifeLabel: 'weeks',
            isHalfLifeModifiable: false,
            isPeriodModifiable: true,
            name: 'WKS',
            toolTip: 'Weekly Short-Term Half-Life',
            isOrgOrPortDefault: false
        });
        expect(weightingSchemesCtrl.periodicity).toBe('W');
        expect(weightingSchemesCtrl.defaultDecay).toBe(0.917);
        expect(weightingSchemesCtrl.defaultOverlap).toBe(1);
        expect(weightingSchemesCtrl.defaultPeriod).toBe(104);
        expect(weightingSchemesCtrl.label).toBe('Weekly Short-Term Half-Life');
        expect(weightingSchemesCtrl.editableFields).toStrictEqual(['zero_means', 'history_monthly', 'history_weekly', 'mat_src', 'var_fi_eq']);
        expect(weightingSchemesCtrl.halfLifeLabel).toBe('weeks');
        expect(weightingSchemesCtrl.isHalfLifeModifiable).toBe(false);
        expect(weightingSchemesCtrl.isPeriodModifiable).toBe(true);
        expect(weightingSchemesCtrl.name).toBe('WKS');
        expect(weightingSchemesCtrl.toolTip).toBe('Weekly Short-Term Half-Life');
        expect(weightingSchemesCtrl.isOrgOrPortDefault).toBeFalsy();
    });
});
