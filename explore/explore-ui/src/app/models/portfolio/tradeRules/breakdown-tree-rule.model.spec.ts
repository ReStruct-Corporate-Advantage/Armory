import {CompositionConstants} from '../../../constants';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';

describe('BreakdownRule', () => {
    beforeAll(() => {
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    const breakdownRule = new BreakdownTreeRule('ABS', 10.0, 'test', ["Corporates", "Industrial"]);

    it('Test creating an instance', () => {
        expect(breakdownRule instanceof BreakdownTreeRule).toBe(true);
        expect(breakdownRule.ruleType).toBe(CompositionConstants.RULE_TYPES.BREAKDOWN_TREE);
        expect(breakdownRule.savable).toBe(true);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new BreakdownTreeRule('', null, 'test', ["Corporates", "Industrial"]);
        expectedRule.deserialize(breakdownRule.serialize());
        expect(breakdownRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newSectorRule = new BreakdownTreeRule('ABS', 10.0, 'test', ["Corporates", "Industrial"]);
        expect(breakdownRule.equals(newSectorRule)).toBe(true);

        newSectorRule.lineItem = 'BND';
        expect(breakdownRule.equals(newSectorRule)).toBe(false);
    });
});
