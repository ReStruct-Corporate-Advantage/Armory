import {CompositionConstants} from '../../../constants';
import {PortfolioCashRule} from '@models/portfolio/tradeRules/portfolio-cash-rule.model';

describe('PortfolioCashRule', () => {
    let cashRule: PortfolioCashRule;

    beforeEach(() => {
        cashRule = new PortfolioCashRule('PEP', 100, 'USD');
    });

    it('Test creating an instance', () => {
        expect(cashRule instanceof PortfolioCashRule).toBe(true);
        expect(cashRule.ruleType).toBe(CompositionConstants.RULE_TYPES.PORTFOLIO_CASH);
        expect(cashRule.savable).toBe(false);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new PortfolioCashRule('', null, '');
        expectedRule.deserialize(cashRule.serialize());

        expect(cashRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newCashRule = new PortfolioCashRule('PEP', 100, 'USD');
        expect(cashRule.equals(newCashRule)).toBe(true);

        newCashRule.lineItem = 'ABCD';
        expect(cashRule.equals(newCashRule)).toBe(false);
    });
});
