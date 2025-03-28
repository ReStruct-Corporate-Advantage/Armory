import {CompositionConstants} from '../../../constants';
import {NAVSecurityRule} from './nav-security-rule.model';

describe('NAVSecurityRule', () => {
    let navSecurityRule: NAVSecurityRule;

    beforeEach(() => {
        navSecurityRule = new NAVSecurityRule('USD_CCASH', 0.5);
    });

    it('Test creating an instance', () => {
        expect(navSecurityRule instanceof NAVSecurityRule).toBe(true);
        expect(navSecurityRule.ruleType).toBe(CompositionConstants.RULE_TYPES.NAV_SECURITY);
        expect(navSecurityRule.savable).toBe(false);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new NAVSecurityRule('', null);
        expectedRule.deserialize(navSecurityRule.serialize());

        expect(navSecurityRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newNavSecurityRule = new NAVSecurityRule('USD_CCASH', 0.5);
        expect(navSecurityRule.equals(newNavSecurityRule)).toBe(true);

        newNavSecurityRule.lineItem = '546810RM1';
        expect(navSecurityRule.equals(newNavSecurityRule)).toBe(false);
    });
});
