import {PortfolioNavSecurityRule} from '@models/portfolio/tradeRules/portfolio-nav-security-rule.model';
import {CompositionConstants} from '@constants/composition.constants';

describe('PortfolioNAVSecurityRule', () => {
    let rule: PortfolioNavSecurityRule;

    beforeEach(() => {
        rule = new PortfolioNavSecurityRule('USD_CCASH', 0.5, 1);
    });

    it('Test creating an instance', () => {
        expect(rule instanceof PortfolioNavSecurityRule).toBe(true);
        expect(rule.ruleType).toBe(CompositionConstants.RULE_TYPES.PORTFOLIO_NAV_SECURITY);
        expect(rule.savable).toBe(false);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new PortfolioNavSecurityRule('USD_CCASH', 0.5, 1);
        expectedRule.deserialize(rule.serialize());

        expect(rule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newRule = new PortfolioNavSecurityRule('USD_CCASH', 0.5, 1);
        expect(rule.equals(newRule)).toBe(true);

        newRule.lineItem = '546810RM1';
        expect(rule.equals(newRule)).toBe(false);
    });
})
