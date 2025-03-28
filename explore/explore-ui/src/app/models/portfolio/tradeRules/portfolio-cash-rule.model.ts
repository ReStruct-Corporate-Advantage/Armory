import {BaseRule} from './base-rule.model';
import {CompositionConstants} from '../../../constants';
import {isEqual} from 'lodash';

/**
 * Composition rule class for portfolio pro rated cash injection
 */
export class PortfolioCashRule extends BaseRule {

    cashCurrency: string;

    /**
     * constructor
     */
    constructor(lineItem: string, newWeight: number, cashCurrency: string, ruleUnit?: string) {
        super(lineItem, newWeight, ruleUnit);
        this.cashCurrency = cashCurrency;
    }

    /**
     * Equals method
     */
    equals(obj: BaseRule): boolean {
        if (!(obj instanceof BaseRule)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        if (!(obj instanceof PortfolioCashRule)) {
            return false;
        }

        return isEqual(this.cashCurrency, obj.cashCurrency);
    }

    /**
     * Serialization of attributes
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            cashCurrency: this.cashCurrency,
        };
    }

    /**
     * Deserialization of the attributes
     */
    protected doDeserialize(data: any): void {
        if (data.cashCurrency) {
            this.cashCurrency = data.cashCurrency;
        }
    }

    protected isSavable(): boolean {
        return false;
    }

    /**
     * Get the rule type for this rule
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.PORTFOLIO_CASH;
    }
}
