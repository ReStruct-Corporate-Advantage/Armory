import {BreakdownInitializer, SectorRuleInfo} from '@blk/explore-ui-breakdown';
import {CompositionConstants} from '../../../constants';
import {SectorRule} from './sector-rule.model';

describe('SectorRule', () => {
    beforeAll(() => {
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    let sectorRule: SectorRule, sectorRulesInfo: SectorRuleInfo, sectorRulesInfo2: SectorRuleInfo;

    beforeEach(() => {
        const serializedSectorRulesInfo = {
            'subSector': {
                'breakdownRuleType': 'String',
                'useNoneBuckets': true,
                'groupByColumn': {
                    'columnTag': 'sec_group',
                    'columnName': 'Security Group',
                    'positionColumnType': 'ALL'
                },
                'subSectors': []
            }, 'sectorValue': 'ABS', 'sectorType': 'NormalSector'
        };
        sectorRulesInfo = new SectorRuleInfo();
        sectorRulesInfo.deserialize(serializedSectorRulesInfo);

        sectorRulesInfo2 = new SectorRuleInfo();
        sectorRulesInfo2.deserialize(serializedSectorRulesInfo);

        sectorRule = new SectorRule('ABS', 10.0, [sectorRulesInfo]);
    });

    it('Test creating an instance', () => {
        expect(sectorRule instanceof SectorRule).toBe(true);
        expect(sectorRule.ruleType).toBe(CompositionConstants.RULE_TYPES.SECTOR);
        expect(sectorRule.savable).toBe(true);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new SectorRule('', null, []);
        expectedRule.deserialize(sectorRule.serialize());
        expect(sectorRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newSectorRule = new SectorRule('ABS', 10.0, [sectorRulesInfo2]);
        expect(sectorRule.equals(newSectorRule)).toBe(true);

        newSectorRule.lineItem = 'BND';
        expect(sectorRule.equals(newSectorRule)).toBe(false);
    });

    it('Test equals method with different weight', () => {
        expect(sectorRule.equals(new SectorRule('ABS', 20.0, [sectorRulesInfo2]))).toBe(true);
    });

    it('Test equals method on different SectorRuleInfo', () => {
        const otherSectorRulesInfo: SectorRuleInfo = new SectorRuleInfo();
        otherSectorRulesInfo.deserialize('[{\'_subSector\':{\'breakdownRuleType\':\'String\',\'useNoneBuckets\':true,\'groupByColumn\':{\'columnTag\':\'sec_group\',\'columnName\':\'Security Group\',\'positionColumnType\':\'ALL\',\'dataType\':\'STRING\'},\'subSectors\':[]},\'_sectorValue\':\'ABS\',\'_sectorType\':\'NormalSector\'},{\'_subSector\':{\'breakdownRuleType\':\'String\',\'useNoneBuckets\':true,\'groupByColumn\':{\'columnTag\':\'country\',\'columnName\':\'Country Name\',\'positionColumnType\':\'ALL\',\'dataType\':\'STRING\'},\'subSectors\':[]},\'_sectorValue\':\'United States\',\'_sectorType\':\'NormalSector\'}]');

        // validate
        expect(sectorRule.equals(new SectorRule('ABS', 10.0, [otherSectorRulesInfo]))).toBe(false);
    });
});
