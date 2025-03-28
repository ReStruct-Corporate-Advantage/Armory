import {CompositionConstants} from '../../../constants';
import {ActiveBreakdownRule} from '@models/portfolio/tradeRules/active-breakdown-rule.model';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';

describe('ActiveBreakdownRule', () => {
    beforeAll(() => {
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    let breakdownRule = new ActiveBreakdownRule('ABS', 10.0, 'test', ["Corporates", "Industrial"]);

    it('Test creating an instance', () => {
        expect(breakdownRule instanceof ActiveBreakdownRule).toBe(true);
        expect(breakdownRule.ruleType).toBe(CompositionConstants.RULE_TYPES.ACTIVE_BREAKDOWN);
        expect(breakdownRule.savable).toBe(true);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new ActiveBreakdownRule('', null, 'test', ["Corporates", "Industrial"]);
        expectedRule.deserialize(breakdownRule.serialize());
        expect(breakdownRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newSectorRule = new ActiveBreakdownRule('ABS', 10.0, 'test', ["Corporates", "Industrial"]);
        expect(breakdownRule.equals(newSectorRule)).toBe(true);

        newSectorRule.lineItem = 'BND';
        expect(breakdownRule.equals(newSectorRule)).toBe(false);
    });
});
