import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';

/**
 * Defines callbackFunction and trade rules for cash injection
 */
export interface AddCashTradeRules {
    callbackFunction: () => void;
    tradeRule: BaseRule[];
}
