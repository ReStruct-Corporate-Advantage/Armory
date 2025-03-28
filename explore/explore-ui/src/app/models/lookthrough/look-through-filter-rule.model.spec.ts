import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {BreakdownInitializer, ColumnSectorRule, GroupRule} from '@blk/explore-ui-breakdown';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../initializers/config.initializer';
import {cloneDeep} from 'lodash';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

/**
 * This test file tests on a Lookthrough rule
 */
describe('Lookthrough rule tests', function () {

    const validRule: any = {
        'breakdown': {
            'subSectors': [{
                'breakdownRuleType': 'CustomSector',
                'includeOtherBucket': true,
                'rule': {
                    'colTag': 'portfolio_name',
                    'compType': 'Equals',
                    'colType': 'STRING',
                    'ruleType': 'Rule',
                    'colTitle': 'Portfolio Name',
                    'colPositionColumnType': 'ALL',
                    'compValues': ['ABC'],
                    'customSectorType': 'Attributes'
                }
            }]
        }
    };

    const invalidRule: any = {
        'breakdown': {
            'subSectors': [{
                'breakdownRuleType': 'CustomSector',
                'includeOtherBucket': true
            }]
        }
    };

    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
        ConfigInitializer.registerLookthroughTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    it('should create an instance', () => {
        expect(new LookthroughFilterRule()).toBeTruthy();
    });

    /**
     * Test calling serialize on the CustomSector and then using that generated string to deserialize into a new CustomSector and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const ltFilterRule: LookthroughFilterRule = new LookthroughFilterRule();
        ltFilterRule.enabled = true;
        ltFilterRule.ltType = 'Sector';
        ltFilterRule.displayName = 'new Rule_126';

        const columnRule: ColumnSectorRule = ltFilterRule.customSector.rule as ColumnSectorRule;
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(ltFilterRule.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newLtFilterRule: LookthroughFilterRule = ConfigTypeFactory.createConfig(deserializedData, LookthroughFilterRule.configType, true);

        // Validate that the before and after are the same.
        expect(newLtFilterRule).toBeDefined();
        expect(newLtFilterRule.enabled).toBe(ltFilterRule.enabled);
        expect(newLtFilterRule.ltType).toMatch(ltFilterRule.ltType);
        expect(newLtFilterRule.displayName).toMatch(ltFilterRule.displayName);
        expect(newLtFilterRule.customSector.rule).toBeDefined();

        const newColumnRule: ColumnSectorRule = newLtFilterRule.customSector.rule as ColumnSectorRule;
        expect(newColumnRule.columnTag).toMatch(columnRule.columnTag);
        expect(newColumnRule.comparisonType).toMatch(columnRule.comparisonType);
        expect(newColumnRule.comparisonValues.length).toEqual(columnRule.comparisonValues.length);
    });

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', function () {
        const ltFilterRule: LookthroughFilterRule = new LookthroughFilterRule();

        // Initially this should not be valid.
        expect(ltFilterRule.customSector.isValid()).toBeFalsy();

        // Now set an empty group as a rule and it shouldn't be valid.
        ltFilterRule.customSector.rule = new GroupRule();
        expect(ltFilterRule.customSector.isValid()).toBeFalsy();

        // Now set a valid rule and it should be valid.
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.columnTag = 'sec_group';
        rule.comparisonType = 'equals';
        rule.comparisonValues = ['ABS'];
        ltFilterRule.customSector.rule = rule;
        expect(ltFilterRule.customSector.isValid()).toBeTruthy();
    });

    it('test serializeForDataRequest', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const customSector: any = cloneDeep(validRule);
        const ltFilterRule: LookthroughFilterRule = new LookthroughFilterRule({customSector});
        const serializedLTFilterRule: any = ltFilterRule.serializeForDataRequest();
        customSector['breakdown']['subSectors'][0]['title'] = ' ';
        expect(serializedLTFilterRule.ltType).toEqual(LookthroughConstants.LT_TYPE_FULL);
        expect(JSON.parse(serializedLTFilterRule.ltContainerRule)).toEqual(customSector);
    });

    it('test serializeForDataRequest - invalid custom sector', () => {
        const customSector: any = cloneDeep(invalidRule);
        const ltFilterRule: LookthroughFilterRule = new LookthroughFilterRule({customSector});
        const serializedLTFilterRule: any = ltFilterRule.serializeForDataRequest();
        expect(serializedLTFilterRule.ltType).toEqual(LookthroughConstants.LT_TYPE_FULL);
        expect(serializedLTFilterRule.ltContainerRule).toBeUndefined();
    });

    it('tests isCustomizedRule', () => {
        // valid rule and default enabled
        let customSector: any = cloneDeep(validRule);
        let ltFilterRule: LookthroughFilterRule = new LookthroughFilterRule({customSector});
        expect(ltFilterRule.isCustomizedRule()).toBe(true);

        // invalid rule and not enabled
        customSector = cloneDeep(invalidRule);
        ltFilterRule = new LookthroughFilterRule({customSector});
        ltFilterRule.ltType = 'Sector';
        expect(ltFilterRule.isCustomizedRule()).toBe(true);

        // invalid rule, type is Sector and enabled
        ltFilterRule.enabled = true;
        expect(ltFilterRule.isCustomizedRule()).toBe(true);
    });
});
