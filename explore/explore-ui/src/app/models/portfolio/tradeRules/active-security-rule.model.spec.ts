import {ActiveSecurityRule} from './active-security-rule.model';
import {CompositionConstants} from '../../../constants';

describe('ActiveSecurityRule', () => {

    let activeSecurityRule: ActiveSecurityRule;

    beforeEach(() => {
        activeSecurityRule = new ActiveSecurityRule('912810RM2', 0.5);
    });

    it('Test creating an instance', () => {
        expect(activeSecurityRule instanceof ActiveSecurityRule).toBe(true);
        expect(activeSecurityRule.ruleType).toBe(CompositionConstants.RULE_TYPES.ACTIVE_SECURITY);
        expect(activeSecurityRule.savable).toBe(false);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new ActiveSecurityRule('', null);
        expectedRule.deserialize(activeSecurityRule.serialize());

        expect(activeSecurityRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newActiveSecurityRule = new ActiveSecurityRule('912810RM2', 0.5);
        expect(activeSecurityRule.equals(newActiveSecurityRule)).toBe(true);

        newActiveSecurityRule.lineItem = '546810RM1';
        expect(activeSecurityRule.equals(newActiveSecurityRule)).toBe(false);
    });
});
