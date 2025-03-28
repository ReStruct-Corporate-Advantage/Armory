import {CompositionConstants} from '../../../constants';
import {SecurityRule} from './security-rule.model';

/**
 * Composition rule class for rules that affect the nav
 */
export class NAVSecurityRule extends SecurityRule {

    cashCurrency: string;

    /**
     * Constructor
     */
    constructor(lineItem: string, newWeight: number, selectedCurrency?: string, addToPortfolio?: string) {
        super(lineItem, newWeight, undefined, undefined, addToPortfolio);
        this.cashCurrency = selectedCurrency;
    }

    /**
     * This method returns the rule type for this rule class
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.NAV_SECURITY;
    }

    /**
     * Serialization of analytics ID
     */
    protected doSerialize(data: any): any {
        return {
            ...super.doSerialize(data),
            cashCurrency: this.cashCurrency,
        };
    }

    /**
     * Deserialization of analytics ID
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);

        if (data.cashCurrency) {
            this.cashCurrency = data.cashCurrency;
        }
    }

    /**
     * Check if the passed object for attributes same as this one
     */
    equals(obj: NAVSecurityRule): boolean {
        return super.equals(obj) && this.cashCurrency === obj.cashCurrency;
    }

}
