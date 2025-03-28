import {InvestmentUniverseSettings} from './investment-universe-settings.model';
import {InvestmentUniverseConstants} from '../../../constants/investment-universe.constants';
import {InvestmentUniversePortfolio} from './investment-universe-portfolio.model';

/**
 * Test cases for InvestmentUniverseSettings.ts
 */
describe('InvestmentUniverseSettings tests', () => {

    /**
     * Test case for method save
     */
    it('Test save', () => {
        const investmentUniverseSettings = new InvestmentUniverseSettings();

        const investmentUniversePortfolio = new InvestmentUniversePortfolio({
            id: '123',
            enabled: true,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'LEH_MBS',
            isFrozen: true
        });
        investmentUniversePortfolio.portfolio = 'IP';
        investmentUniversePortfolio.isBench = false;

        const investmentUniversePortfolio2 = new InvestmentUniversePortfolio({
            id: '456',
            enabled: true,
            type: InvestmentUniverseConstants.BENCHMARK,
            label: 'LEHMBSFWD',
            isFrozen: true
        });
        investmentUniversePortfolio.portfolio = 'IP';
        investmentUniversePortfolio.isBench = true;

        const investmentUniversePortfolio3 = new InvestmentUniversePortfolio({
            id: '456',
            enabled: true,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: 'TEST',
            isFrozen: false
        });
        investmentUniversePortfolio.portfolio = 'IP';
        investmentUniversePortfolio.isBench = true;

        investmentUniverseSettings.investmentUniverse.push(investmentUniversePortfolio);
        investmentUniverseSettings.investmentUniverse.push(investmentUniversePortfolio2);
        investmentUniverseSettings.investmentUniverse.push(investmentUniversePortfolio3);

        expect(investmentUniverseSettings.serialize()).toEqual({
            'investmentUniverse': [
                {'enabled': true, 'type': 'Portfolio', 'label': 'LEH_MBS', 'portfolio': 'IP', 'isFrozen': true, 'isBench': true},
                {'enabled': true, 'type': 'Benchmark', 'label': 'LEHMBSFWD', 'isFrozen': true, 'isBench': false},
                {'enabled': true, 'type': 'Portfolio', 'label': 'TEST', 'isFrozen': false, 'isBench': false}
            ]
        });
    });

    /**
     * Test case for method deserialize
     */
    it('Test deserialize', () => {
        const data = getData();

        const investmentUniverseSettings = new InvestmentUniverseSettings();
        investmentUniverseSettings.deserialize(data);

        expect(investmentUniverseSettings.investmentUniverse.length).toEqual(2);

        let investmentUniverseItem = investmentUniverseSettings.investmentUniverse[1];
        expect(investmentUniverseItem instanceof InvestmentUniversePortfolio).toBe(true);
        expect(investmentUniverseItem.type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
        expect(investmentUniverseItem.isFrozen).toEqual(false);
        expect((<InvestmentUniversePortfolio>investmentUniverseItem).isBench).toEqual(false);


        investmentUniverseItem = investmentUniverseSettings.investmentUniverse[0];
        expect(investmentUniverseItem instanceof InvestmentUniversePortfolio).toBe(true);
        expect(investmentUniverseItem.type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
        expect(investmentUniverseItem.isFrozen).toEqual(true);
        expect((<InvestmentUniversePortfolio>investmentUniverseItem).isBench).toEqual(true);
    });

    /**
     * Test case for method equal
     */
    it('Test equal', () => {
        const data = getData();
        const investmentUniverseSettings1 = new InvestmentUniverseSettings();
        investmentUniverseSettings1.deserialize(data);

        const investmentUniverseSettings2 = new InvestmentUniverseSettings();
        investmentUniverseSettings2.deserialize(data);

        expect(investmentUniverseSettings1.equals(investmentUniverseSettings2)).toBe(true);

        investmentUniverseSettings2.investmentUniverse.push(new InvestmentUniversePortfolio({
            id: '456',
            enabled: true,
            type: InvestmentUniverseConstants.SECURITY,
            label: 'LEHMBSFWD',
            isFrozen: true
        }));
        expect(investmentUniverseSettings2.equals(investmentUniverseSettings1)).toBe(false);
    });

    function getData() {
        return {
            'investmentUniverse': [{
                'enabled': true,
                'type': InvestmentUniverseConstants.PORTFOLIO,
                'label': 'LEH_MBS',
                'isFrozen': true,
                'portfolio': 'IP',
                'isBench': true
            }, {'enabled': true, 'type': InvestmentUniverseConstants.PORTFOLIO, 'label': 'LEHMBSFWD', 'isFrozen': false, 'isBench': false}]
        };
    }
});
