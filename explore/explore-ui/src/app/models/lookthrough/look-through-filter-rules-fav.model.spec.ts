import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {BreakdownInitializer, ColumnSectorRule} from '@blk/explore-ui-breakdown';
import {ConfigTypeFactory, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../initializers/config.initializer';

/**
 * This test file tests on a Lookthrough rules favorite
 */
describe('Lookthrough rules favorite tests', function () {

    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
        ConfigInitializer.registerLookthroughTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    /**
     * Tests serialize - deserialize for LookthroughFilterRulesFav class
     */
    it('Serialize/Deserialize and copyFrom test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const ltFilterRulesFav: LookthroughfilterRulesFav = new LookthroughfilterRulesFav();
        ltFilterRulesFav.id = 126;
        ltFilterRulesFav.title = 'ltRule_126';
        ltFilterRulesFav.owner = 'suresing';
        ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();

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

        ltFilterRulesFav.ltFilterRules.push(ltFilterRule);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(ltFilterRulesFav.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newLtFilterRulesFav: LookthroughfilterRulesFav = ConfigTypeFactory.createConfig(deserializedData, LookthroughfilterRulesFav.configType, true);

        // Validate that the before and after are the same.
        expect(newLtFilterRulesFav).toBeDefined();
        expect(newLtFilterRulesFav.ltFilterRules).toBeDefined();
        expect(newLtFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(newLtFilterRulesFav.ltFilterRules[0]).toBeDefined();
        expect(newLtFilterRulesFav.ltFilterRules[0].customSector.rule).toBeDefined();

        const newColumnRule: ColumnSectorRule = newLtFilterRulesFav.ltFilterRules[0].customSector.rule as ColumnSectorRule;
        expect(newColumnRule.columnTag).toMatch(columnRule.columnTag);
        expect(newColumnRule.comparisonType).toMatch(columnRule.comparisonType);
        expect(newColumnRule.comparisonValues.length).toEqual(columnRule.comparisonValues.length);

        // test copyFrom
        const copyLtFilterRulesFav: LookthroughfilterRulesFav = new LookthroughfilterRulesFav();
        copyLtFilterRulesFav.copyFrom(newLtFilterRulesFav);
        expect(copyLtFilterRulesFav.ltFilterRules).toEqual(newLtFilterRulesFav.ltFilterRules);
    });

    it('tests isCustomizedLT', () => {
        // ltFilterRules undefined
        const ltFilterRulesFav: LookthroughfilterRulesFav = new LookthroughfilterRulesFav();
        expect(ltFilterRulesFav.isCustomizedLT()).toBe(false);

        // ltFilterRules defined, but empty
        ltFilterRulesFav.ltFilterRules = [];
        expect(ltFilterRulesFav.isCustomizedLT()).toBe(false);

        // ltFilterRules non-empty, enabled by default
        ltFilterRulesFav.ltFilterRules.push(new LookthroughFilterRule({ltType: 'Sector', enabled: true}));
        expect(ltFilterRulesFav.isCustomizedLT()).toBe(true);

        // ltFilterRules non-empty and with customized rule
        ltFilterRulesFav.ltFilterRules.push(new LookthroughFilterRule({ltType: 'Sector', enabled: true}));
        expect(ltFilterRulesFav.isCustomizedLT()).toBe(true);
    });
});
