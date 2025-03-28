import {InvestmentUniverseConstants} from '../../../constants/investment-universe.constants';
import {InvestmentUniversePortfolio} from './investment-universe-portfolio.model';

/**
 * Test cases for InvestmentUniverseItemBase.ts
 */
describe('Investment Universe Item Base tests', function () {

    const mockJson = {
        id: '123',
        enabled: true,
        type: InvestmentUniverseConstants.PORTFOLIO,
        label: 'IP',
        isFrozen: true
    };

    /**
     * Test case for method save
     */
    it('Test serialize', function () {
        const investmentUniverseItemBase = new InvestmentUniversePortfolio(mockJson);
        const investmentUniverseItemBaseToSave = investmentUniverseItemBase.serialize();
        const expectedDataToSave: any = getData();
        expect(JSON.stringify(investmentUniverseItemBaseToSave)).toEqual(JSON.stringify(expectedDataToSave));
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', function () {
        const data: any = getData();
        const investmentUniverseItemBase = new InvestmentUniversePortfolio(mockJson);
        investmentUniverseItemBase.deserialize(data);

        expect(investmentUniverseItemBase.id).toEqual('123');
        expect(investmentUniverseItemBase.enabled).toEqual(true);
        expect(investmentUniverseItemBase.type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
        expect(investmentUniverseItemBase.label).toEqual('IP');
        expect(investmentUniverseItemBase.isFrozen).toEqual(true);
    });


    /**
     * Test case for method equal
     */
    it('Test equal', function () {
        const investmentUniverseItemBase1 = new InvestmentUniversePortfolio(mockJson);

        const investmentUniverseItemBase2 = new InvestmentUniversePortfolio(mockJson);

        expect(investmentUniverseItemBase1.equals(investmentUniverseItemBase2)).toBe(true);

        investmentUniverseItemBase2.label = '453543453';
        expect(investmentUniverseItemBase1.equals(investmentUniverseItemBase2)).toBe(false);

        investmentUniverseItemBase2.enabled = false;
        expect(investmentUniverseItemBase1.equals(investmentUniverseItemBase2)).toBe(false);

        investmentUniverseItemBase2.type = InvestmentUniverseConstants.SECURITY;
        expect(investmentUniverseItemBase1.equals(investmentUniverseItemBase2)).toBe(false);

        investmentUniverseItemBase2.isFrozen = false;
        expect(investmentUniverseItemBase1.equals(investmentUniverseItemBase2)).toBe(false);

        investmentUniverseItemBase2.id = '243234234234';
        expect(investmentUniverseItemBase1.equals(investmentUniverseItemBase2)).toBe(false);
    });

    function getData() {
        return {
            'enabled': true,
            'type': InvestmentUniverseConstants.PORTFOLIO,
            'label': 'IP',
            'isFrozen': true,
            'isBench': false
        };
    }

});
