import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {CompositionConstants} from '@constants/composition.constants';
import {RuleFactory} from '../../../factories/rule.factory';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {cloneDeep} from 'lodash';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('CompositionRule', () => {
    const tradeRules: any[] = [
        {
            'addedDuringWhatIfInitialization': undefined,
            'lineItem': 'Treasury',
            'newWeight': 45,
            'savable': true,
            'ruleUnit': undefined,
            'sectorRulesInfo': [{
                'subSector': {
                    'breakdownRuleType': 'String',
                    'useNoneBuckets': true,
                    'groupByColumn': {
                        'columnTag': 'grsector`LEHSECT`1',
                        'columnName': 'Barclays Sectors (LEHSECT) - Level 1',
                        'dataType': 'STRING',
                        'positionColumnType': undefined
                    }
                },
                'sectorValue': 'Treasury',
                'sectorType': 'NormalSector'
            }],
            'ruleType': 'Sector'
        }
    ];

    beforeAll(() => {
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.SECTOR, SectorRule);
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    it('tests serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const compRule: CompositionRule = new CompositionRule('PEP');
        compRule.deserialize({tradeRules});
        const expectTradeRules: any[] = cloneDeep(tradeRules);
        delete expectTradeRules[0].savable;
        expect(compRule.serialize()).toEqual({'title': 'PEP', 'tradeRules': expectTradeRules});
    });

    it('tests serialize/deserialize - empty trade rules', () => {
        const compRule: CompositionRule = new CompositionRule('PEP');
        compRule.deserialize({tradeRules: []});
        expect(compRule.serialize()).toBe(undefined);
    });
});
