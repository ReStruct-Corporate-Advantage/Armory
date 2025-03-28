import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';

/**
 * Defines processed and skipped rules of a custom portfolio
 */
export interface AllRules {
    skippedRules: BaseRule[];
    processedRules: BaseRule[];
}
