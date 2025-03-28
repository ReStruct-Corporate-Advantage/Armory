import {CompositionConstants} from '../../../constants';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';


/**
 * Composition rule class for active sector modelling (breakdown rule)
 */
export class ActiveBreakdownRule extends BreakdownTreeRule {

    /**
     * constructor
     */
    constructor(sectorName: string, newWeight: number, breakdownTree: string, sectorPath: string[], ruleUnit?: string) {
        super(sectorName, newWeight, breakdownTree, sectorPath, ruleUnit);
    }

    /**
     * Returns the rule type for this rule
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.ACTIVE_BREAKDOWN;
    }
}
