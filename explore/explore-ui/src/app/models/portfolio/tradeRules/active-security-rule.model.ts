import {CompositionConstants} from '../../../constants';
import {SecurityRule} from './security-rule.model';

/**
 * Composition rule class for active security modelling
 */
export class ActiveSecurityRule extends SecurityRule {

    /**
     * Get the rule type for this rule
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.ACTIVE_SECURITY;
    }
}
