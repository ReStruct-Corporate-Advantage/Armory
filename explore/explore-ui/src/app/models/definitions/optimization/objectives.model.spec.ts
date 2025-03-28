import {Objectives} from './objectives.model';

/**
 * Test case file of OptimizationObjectives
 */
describe('Objective test case file', () =>{

    /**
     * Deserialize test cases
     */
    it('deserialize test case', () => {
        const data: any = {
            objectiveDisplayValue: 'Minimize Risk',
            objectiveKey: 'MINIMIZE_RISK',
            restrictedObjectives: ['MINIMIZE_IDIO_RISK', 'MINIMIZE_SYSTEMATIC_RISK']
        };

        let objectivesCtrl: any = new Objectives(data);
        expect(objectivesCtrl.objectiveDisplayValue).toBe('Minimize Risk');
        expect(objectivesCtrl.objectiveKey).toBe('MINIMIZE_RISK');
        expect(objectivesCtrl.restrictedObjectives).toStrictEqual(['MINIMIZE_IDIO_RISK', 'MINIMIZE_SYSTEMATIC_RISK']);
    });
});
