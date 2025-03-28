import {GroupRule} from './group-rule.model';
import {ColumnSectorRule} from './column-sector/column-sector-rule.model';
import {CustomSectorRule} from './custom-sector/custom-sector-rule.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SectorConstants} from '../../constants/sector.constants';

describe('GroupRule', () => {
    beforeAll(() => {
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.GROUP_RULE, GroupRule);
    });
    /**
     * Test calling serialize on the GroupRule and then using that generated string to deserialize into a new GroupRule and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const rule: GroupRule = new GroupRule();
        rule.groupType = 'AND';

        const subRule1: GroupRule = new GroupRule();
        subRule1.groupType = 'OR';
        rule.addSubRule(subRule1);

        const subRule2: GroupRule = new GroupRule();
        subRule2.groupType = 'AND';
        rule.addSubRule(subRule2);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(rule.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newRule: GroupRule = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.GROUP_RULE, true);

        // Validate that the before and after are the same.
        validateRuleEqual(rule, newRule);
    });

    /**
     * validates that the rule attributes are the same.
     */
    function validateRuleEqual(origRule: GroupRule, newRule: GroupRule): void {
        expect(newRule).toBeDefined();
        expect(newRule).not.toBeNull();
        expect(newRule.groupType).toBe(origRule.groupType);

        if (origRule.subRules && origRule.subRules.length > 0) {
            expect(newRule.subRules).toBeDefined();
            expect(newRule.subRules).not.toBeNull();
            expect(newRule.subRules.length).toBe(origRule.subRules.length);

            const count: number = origRule.subRules.length;
            for (let i = 0; i < count; i++) {
                validateRuleEqual(origRule.subRules[i] as GroupRule, newRule.subRules[i] as GroupRule);
            }
        }
    }

    /**
     * Test that calling toggle switches between the values..
     */
    it('Toggle rule type', () => {
        const rule: GroupRule = new GroupRule();
        expect(rule.groupType).not.toBeDefined();

        // Toggle and it should be AND.
        rule.toggleGroupType();
        expect(rule.groupType).toBe('AND');

        // Toggle and it should be OR.
        rule.toggleGroupType();
        expect(rule.groupType).toBe('OR');

        // Toggle and it should be AND.
        rule.toggleGroupType();
        expect(rule.groupType).toBe('AND');
    });

    /**
     * Test that the isEmpty function works.
     */
    it('Test isEmpty', () => {
        const rule: GroupRule = new GroupRule();
        expect(rule.isEmpty()).toBeTruthy();

        // Set the list to be not undefined but should still be empty.
        rule.subRules = [];
        expect(rule.isEmpty()).toBeTruthy();

        // Add a sub rule and it should no longer be empty.
        rule.addSubRule(new GroupRule());
        expect(rule.isEmpty()).toBeFalsy();
    });

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', () => {
        const rule: GroupRule = new GroupRule();

        // Initially this should not be valid.
        expect(rule.isValid()).toBeFalsy();

        // Set the group type and it will still be invalid.
        rule.groupType = 'AND';
        expect(rule.isValid()).toBeFalsy();

        // initialise the subRules and it should still not be valid.
        rule.subRules = [];
        expect(rule.isValid()).toBeFalsy();

        // Now add an invalid sub rule and it should still not be valid.
        const subRule: ColumnSectorRule = new ColumnSectorRule();
        rule.addSubRule(subRule);
        expect(rule.isValid()).toBeFalsy();

        // New set the attributes of the sub rule and it should become valid.
        subRule.columnTag = 'sec_group';
        subRule.comparisonType = 'equals';
        subRule.comparisonValues = ['ABS'];
        expect(rule.isValid()).toBeTruthy();
    });

    describe('equals method test case', () => {
        let groupRuleInput: GroupRule;
        let ruleInput: GroupRule;
        beforeAll(() => {
            groupRuleInput = new GroupRule();
            groupRuleInput.subRules = [];
            ruleInput = new GroupRule();
            ruleInput.subRules = [];
        });

        it('Give different instance for equality and should fail', () => {
            const ruleInput1: ColumnSectorRule = new ColumnSectorRule();
            expect(groupRuleInput.equals(ruleInput1)).toBeFalsy();
        });

        it('Same instance for equality and that should return true', () => {
            expect(groupRuleInput.equals(ruleInput)).toBeTruthy();
        });

        it('Giving groupType same and different and check equality', () => {
            groupRuleInput.groupType = 'Dummy Group Type';

            // Give different groupType to rule Input
            ruleInput.groupType = 'Different Group Type';
            expect(groupRuleInput.equals(ruleInput)).toBeFalsy();

            // Now same groupType
            ruleInput.groupType = 'Dummy Group Type';
            expect(groupRuleInput.equals(ruleInput)).toBeTruthy();
        });

        it('Giving different subRules and check their equality', () => {
            groupRuleInput.subRules.push(new CustomSectorRule({
                equal: true,
                customSector: new CustomSectorRule({includeOtherBucket: true})
            }));
            ruleInput.subRules.push(new CustomSectorRule({equal: true, customSector: new CustomSectorRule()}));
            expect(groupRuleInput.equals(ruleInput)).toBeFalsy();
        });
    });
});
