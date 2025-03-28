import {SectorRuleBuilderConfig} from './sector-rule-builder-config.model';
import {SectorConstants} from '../../constants/sector.constants';

describe('Sector', () => {
    it('should create an instance', () => {
        let config = new SectorRuleBuilderConfig([], null);
        expect(config).toBeTruthy();
        expect(config.islookThroughRule).toBeFalsy();
        expect(config.showFundSectoringTabs).toBeFalsy();
        expect(config.header).toEqual(SectorConstants.CUSTOM_RULE_BUILDER_HEADERS.SECTOR_RULE);
        // when islookThroughRule true header should be Look-Through Rule Logic
        config = new SectorRuleBuilderConfig([], null, true);
        expect(config.header).toEqual(SectorConstants.CUSTOM_RULE_BUILDER_HEADERS.LOOK_THROUGH_RULE);
        // If header is Overridden
        config = new SectorRuleBuilderConfig([], null, true, false, 'Custom Filter Header');
        expect(config.header).toEqual('Custom Filter Header');
    });
});
