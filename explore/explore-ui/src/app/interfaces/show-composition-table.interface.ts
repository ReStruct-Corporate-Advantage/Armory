import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';

/**
 * Represents arguments emitted by security search component
 */
export interface ShowCompositionTableInterface {
    tradeRule?: BaseRule[];
    callbackFunction?: Function;
    sourceOfRules?: string;
    refreshCachedResponse?: boolean;
}
