import {RiskModel} from './risk-model.model';

describe('RiskModel tests case file', () => {
    it('Deserialize test case', () => {
        const data = {
            Value: '^^STORM,^PRT_FI',
            Label: 'STORM for Equity'
        };

        const modelCtrl = new RiskModel(data);
        expect(modelCtrl.value).toBe('^^STORM,^PRT_FI');
        expect(modelCtrl.label).toBe('STORM for Equity');
    });
});
