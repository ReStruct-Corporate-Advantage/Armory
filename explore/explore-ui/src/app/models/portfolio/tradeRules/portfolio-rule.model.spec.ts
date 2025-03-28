import {CompositionConstants} from '../../../constants';
import {PortfolioRule} from './portfolio-rule.model';

describe('Portfolio rule model tests', () => {
    let portfolioRule: PortfolioRule;

    beforeEach(() => {
        portfolioRule = new PortfolioRule('IP', 2.0);
    });

    it('Test creating an instance', () => {
        expect(portfolioRule instanceof PortfolioRule).toBe(true);
        expect(portfolioRule.ruleType).toBe(CompositionConstants.RULE_TYPES.PORTFOLIO);
        expect(portfolioRule.savable).toBe(true);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new PortfolioRule('', null);
        expectedRule.deserialize(portfolioRule.serialize());

        expect(portfolioRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newPortfolioRule = new PortfolioRule('IP', 2.0);
        expect(portfolioRule.equals(newPortfolioRule)).toBe(true);

        newPortfolioRule.lineItem = 'PEP';
        expect(portfolioRule.equals(newPortfolioRule)).toBe(false);
    });
});
