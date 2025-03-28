import {CompositionConstants} from '../../../constants';
import {ProRateCashRule} from './prorate-cash-rule.model';

describe('Portfolio rule model tests', () => {
    let prorateCashRule: ProRateCashRule;

    beforeEach(() => {
        prorateCashRule = new ProRateCashRule(2.0, 'USD');
    });

    it('Test creating an instance', () => {
        expect(prorateCashRule instanceof ProRateCashRule).toBe(true);
        expect(prorateCashRule.ruleType).toBe(CompositionConstants.RULE_TYPES.PRORATE_CASH);
        expect(prorateCashRule.savable).toBe(false);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new ProRateCashRule(0.0, 'USD');
        expectedRule.deserialize(prorateCashRule.serialize());

        expect(prorateCashRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const cashRule = new ProRateCashRule(2.0, 'USD');
        expect(prorateCashRule.equals(cashRule)).toBe(true);

        cashRule.cashCurrency = 'EUR';
        expect(prorateCashRule.equals(cashRule)).toBe(false);
    });

});
