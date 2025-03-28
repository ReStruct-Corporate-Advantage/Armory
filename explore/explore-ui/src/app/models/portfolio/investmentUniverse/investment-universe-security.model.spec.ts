import {InvestmentUniverseSecurity} from './investment-universe-security.model';
import {InvestmentUniverseConstants} from '../../../constants/investment-universe.constants';

/**
 * Test cases for InvestmentUniverseSecurity.ts
 */
describe('Investment Universe Security tests', () => {

    /**
     * Test case for method save
     */
    it('Test serialize', () => {
        const investmentUniverseSecurity = new InvestmentUniverseSecurity({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.SECURITY,
            label: 'IP',
            isFrozen: true
        });
        investmentUniverseSecurity.securities = ['A', 'B', 'C'];

        const investmentUniverseSecurityToSave = investmentUniverseSecurity.serialize();
        const expectedDataToSave = getData();
        expect(JSON.stringify(investmentUniverseSecurityToSave)).toEqual(JSON.stringify(expectedDataToSave));
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const data = getData();
        const investmentUniverseSecurity = new InvestmentUniverseSecurity({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.SECURITY,
            label: 'IP',
            isFrozen: true
        });
        investmentUniverseSecurity.securities = ['A', 'B', 'C'];

        investmentUniverseSecurity.deserialize(data);

        expect(investmentUniverseSecurity.id).toEqual('123');
        expect(investmentUniverseSecurity.enabled).toEqual(true);
        expect(investmentUniverseSecurity.type).toEqual(InvestmentUniverseConstants.SECURITY);
        expect(investmentUniverseSecurity.label).toEqual('IP');
        expect(investmentUniverseSecurity.isFrozen).toEqual(true);
        expect(investmentUniverseSecurity.securities).toEqual(['A', 'B', 'C']);

    });


    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const investmentUniverseSecurity1 = new InvestmentUniverseSecurity({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.SECURITY,
            label: 'IP',
            isFrozen: true
        });
        investmentUniverseSecurity1.securities = ['A', 'B', 'C'];

        const investmentUniverseSecurity2 = new InvestmentUniverseSecurity({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.SECURITY,
            label: 'IP',
            isFrozen: true
        });
        investmentUniverseSecurity2.securities = ['A', 'B', 'C'];

        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(true);

        investmentUniverseSecurity2.label = '453543453';
        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(false);

        investmentUniverseSecurity2.enabled = false;
        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(false);

        investmentUniverseSecurity2.type = InvestmentUniverseConstants.PORTFOLIO;
        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(false);

        investmentUniverseSecurity2.isFrozen = false;
        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(false);

        investmentUniverseSecurity2.id = '243234234234';
        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(false);

        investmentUniverseSecurity2.securities = ['AC', 'DDDDDDB', 'C'];
        expect(investmentUniverseSecurity1.equals(investmentUniverseSecurity2)).toBe(false);

    });

    function getData() {
        return {
            'enabled': true,
            'type': InvestmentUniverseConstants.SECURITY,
            'label': 'IP',
            'isFrozen': true,
            'securities': ['A', 'B', 'C']
        };
    }
});
