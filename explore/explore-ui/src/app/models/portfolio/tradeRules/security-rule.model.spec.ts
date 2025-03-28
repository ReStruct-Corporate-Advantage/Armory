import {CompositionConstants} from '../../../constants';
import {SecurityRule} from './security-rule.model';
import {RuleUnit} from '@enums/rule-unit.enum';

describe('SecurityRule', () => {
    let securityRule: SecurityRule;

    beforeEach(() => {
        securityRule = new SecurityRule('912810RM2', 0.5, RuleUnit.PCT_NOTIONAL_VAL, false, 'TestPort', true);
    });

    it('Test creating an instance', () => {
        expect(securityRule instanceof SecurityRule).toBe(true);
        expect(securityRule.ruleType).toBe(CompositionConstants.RULE_TYPES.SECURITY);
        expect(securityRule.savable).toBe(false);
    });

    it('Test serialization deserialization', () => {
        const serializedData = securityRule.serialize();
        const expectedRule = new SecurityRule('', null);
        expectedRule.deserialize(serializedData);

        expect(securityRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newSecurityRule = new SecurityRule('912810RM2', 0.5, RuleUnit.PCT_NOTIONAL_VAL, false, 'TestPort');
        expect(securityRule.equals(newSecurityRule)).toBe(true);

        newSecurityRule.lineItem = '546810RM1';
        expect(securityRule.equals(newSecurityRule)).toBe(false);
    });
});
