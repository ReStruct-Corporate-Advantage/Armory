import {ActiveSectorRule} from './active-sector-rule.model';
import {BreakdownInitializer, SectorRuleInfo} from '@blk/explore-ui-breakdown';
import {CompositionConstants} from '../../../constants';

describe('ActiveSectorRule', () => {
    beforeAll(() => {
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    let activeSectorRule: ActiveSectorRule, sectorRulesInfo: SectorRuleInfo;

    beforeEach(() => {
        sectorRulesInfo = new SectorRuleInfo();
        sectorRulesInfo.deserialize({
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
        });
        activeSectorRule = new ActiveSectorRule('ABS', 10.0, [sectorRulesInfo]);
    });

    it('Test creating an instance', () => {
        expect(activeSectorRule instanceof ActiveSectorRule).toBe(true);
        expect(activeSectorRule.ruleType).toBe(CompositionConstants.RULE_TYPES.ACTIVE_SECTOR);
        expect(activeSectorRule.savable).toBe(true);
    });

    it('Test serialization deserialization', () => {
        const expectedRule = new ActiveSectorRule('', null, []);
        expectedRule.deserialize(activeSectorRule.serialize());
        expect(activeSectorRule.equals(expectedRule)).toBe(true);
    });

    it('Test equals method', () => {
        const newSectorRule = new ActiveSectorRule('ABS', 10.0, [sectorRulesInfo]);
        expect(activeSectorRule.equals(newSectorRule)).toBe(true);

        newSectorRule.lineItem = 'BND';
        expect(activeSectorRule.equals(newSectorRule)).toBe(false);
    });
});
