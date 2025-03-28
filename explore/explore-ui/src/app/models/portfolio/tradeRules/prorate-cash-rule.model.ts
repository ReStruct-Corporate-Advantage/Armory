import {BaseRule} from './base-rule.model';
import {isEmpty} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {RuleUnit} from '@enums/rule-unit.enum';

/**
 * Composition rule at the sector level
 */
export class ProRateCashRule extends BreakdownTreeRule {

    cashCurrency: string;
    /**
     * constructor
     */
    constructor(newWeight: number, cashCurrency: string) {
        super('', newWeight, '', [], RuleUnit.MARKET_VALUE);
        this.cashCurrency = cashCurrency;
    }

    /**
     * Equals method to compare two breakdown rules
     */
    equals(obj: BaseRule): boolean {
        if (!(obj instanceof BaseRule)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        if (!(obj instanceof ProRateCashRule)) {
            return false;
        }

        return (obj.cashCurrency === this.cashCurrency);
    }

    /**
     * Serialization of attributes of the breakdown rule object
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            cashCurrency: this.cashCurrency ? this.cashCurrency : ''
        }
    }

    /**
     * Deserialization of the attributes of the breakdown rule object
     */
    protected doDeserialize(data: any): void {
        if (isEmpty(data[CompositionConstants.CASH_CURRENCY])) {
            return;
        }

        // If not initialized
        if (!this.cashCurrency) {
            this.cashCurrency = '';
        }
        this.cashCurrency = data[CompositionConstants.CASH_CURRENCY];
    }

    protected isSavable(): boolean {
        return false;
    }

    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.PRORATE_CASH;
    }
}
