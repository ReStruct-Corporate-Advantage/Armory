import {SectorRuleInfo} from '@blk/explore-ui-breakdown';
import {CompositionConstants} from '../../../constants';
import {SectorRule} from './sector-rule.model';

/**
 * Composition rule class for active sector modelling
 */
export class ActiveSectorRule extends SectorRule {

    /**
     * constructor
     */
    constructor(sectorName: string, newWeight: number, sectorRulesInfo: Array<SectorRuleInfo>, ruleUnit?: string) {
        super(sectorName, newWeight, sectorRulesInfo, ruleUnit);
    }

    /**
     * Returns the rule type for this rule
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.ACTIVE_SECTOR;
    }
}
