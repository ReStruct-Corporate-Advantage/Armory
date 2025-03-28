import {CustomSectorRule} from './custom-sector-rule.model';
import {ColumnSectorRule} from '../column-sector/column-sector-rule.model';
import {CustomSector} from './custom-sector.model';
import {GroupRule} from '../group-rule.model';
import {ConfigTypeFactory, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {SectorConstants} from '../../../constants/sector.constants';

describe('CustomSectorRule', () => {
    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BreakdownInitializer.registerSectorConfigTypes();
    });
    /**
     * Test calling serialize on the CustomSectorRule and then using that generated string to deserialize into a new CustomSectorRule and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const groupRule = new GroupRule();
        groupRule.groupType = 'AND';

        const rule: CustomSectorRule = new CustomSectorRule();
        rule.equal = true;
        rule.customSector = new CustomSector();
        rule.customSector.rule = groupRule;

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(rule.serialize(true));
        const deserializedData: any = JSON.parse(serializedData);
        const newRule: CustomSectorRule = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.CUSTOM_SECTOR_RULE, true);

        // Validate that the before and after are the same.
        expect(newRule.equals).toBe(rule.equals);
        expect(newRule.customSector).toBeDefined();
        expect(newRule.customSector).not.toBeNull();
        expect(newRule.customSector.rule).toBeDefined();
        expect(newRule.customSector.rule).not.toBeNull();
        const newGroupRule: GroupRule = (newRule.customSector.rule as GroupRule);
        expect(newGroupRule.groupType).toBe(groupRule.groupType);
    });

    /**
     * Test that calling toggle switches between the values..
     */
    it('Toggle rule type', () => {
        const rule: CustomSectorRule = new CustomSectorRule();
        expect(rule.equal).toBeTruthy();

        // Toggle and it should be false.
        rule.toggleEquals();
        expect(rule.equal).toBeFalsy();

        // Toggle and it should be true.
        rule.toggleEquals();
        expect(rule.equal).toBeTruthy();
    });

    /**
     * Test that the getDisplayText function works in all scenarios.
     */
    it('getDisplayText', () => {
        const rule: CustomSectorRule = new CustomSectorRule();
        rule.customSector = new CustomSector();
        rule.customSector.title = 'Equity';
        expect(rule.getDisplayText()).toBe('Sector Equals Equity');

        // Toggle and it should be false.
        rule.equal = false;
        expect(rule.getDisplayText()).toBe('Sector Does Not Equal Equity');
    });

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', () => {
        const rule: CustomSectorRule = new CustomSectorRule();

        // Initially this should not be valid.
        expect(rule.isValid()).toBeFalsy();

        // Add the equals flag, but should still be invalid.
        rule.equal = true;
        expect(rule.isValid()).toBeFalsy();

        // Add an invalid custom sector to it.
        const sector: CustomSector = new CustomSector();
        rule.customSector = sector;
        expect(rule.isValid()).toBeFalsy();

        // Update the sector to be valid and then it should be valid.
        const sectorRule: ColumnSectorRule = new ColumnSectorRule();
        sectorRule.columnTag = 'sec_group';
        sectorRule.comparisonType = 'equals';
        sectorRule.comparisonValues = ['ABS'];
        sector.rule = sectorRule;
        expect(rule.isValid()).toBeTruthy();

        // Now try with the equals setting as false and it should still be valid.
        rule.equal = false;
        expect(rule.isValid()).toBeTruthy();
    });

    describe('equal method test case', () => {
        let customSectorRule: CustomSectorRule;
        let ruleInput: CustomSectorRule;
        beforeAll(() => {
            customSectorRule = new CustomSectorRule();
            customSectorRule.customSector = new CustomSector();
            ruleInput = new CustomSectorRule();
            ruleInput.customSector = new CustomSector();
        });

        it('Give different instance for equality and should fail', () => {
            const ruleInput1: GroupRule = new GroupRule();
            expect(customSectorRule.equals(ruleInput1)).toBeFalsy();
        });

        it('Same instance for equality and should return true', () => {
            expect(customSectorRule.equals(ruleInput)).toBeTruthy();
        });

        it('Populating customSectorRule & ruleInput1 and check their equality', () => {
            // Populate both customSectorRule & ruleInput1
            customSectorRule.equal = false;
            customSectorRule.customSector.children.push({includeOtherBucket: true, parent: undefined} as CustomSector);
            customSectorRule.customSector.children.push({includeOtherBucket: true, parent: undefined} as CustomSector);

            // Populating RuleInput1
            ruleInput.equal = false;
            ruleInput.customSector.children.push({includeOtherBucket: true, parent: undefined} as CustomSector);
            ruleInput.customSector.children.push({includeOtherBucket: true, parent: undefined} as CustomSector);

            // Both object right now have same field and same instance
            expect(customSectorRule.equals(ruleInput)).toBeTruthy();
        });
    });
});
