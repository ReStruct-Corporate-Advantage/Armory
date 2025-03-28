import {RiskParameter} from './risk-parameter.model';

/**
 * Test case file for RiskParameter
 */
describe('RiskParameter test case file', () => {

    /**
     * Test deserialize
     */
    it('Deserialize test case', () => {
        const data = {
            text: 'One Day',
            value: 1
        };

        const riskHorizonsCtrl = new RiskParameter(data);
        expect(riskHorizonsCtrl.text).toBe('One Day');
        expect(riskHorizonsCtrl.value).toBe(1 as any);
    });
});
