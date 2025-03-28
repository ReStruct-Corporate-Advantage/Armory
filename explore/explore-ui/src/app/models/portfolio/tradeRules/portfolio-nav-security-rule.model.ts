import {NAVSecurityRule} from '@models/portfolio/tradeRules/nav-security-rule.model';
import {CompositionConstants} from '@constants/composition.constants';

/**
 * Composition rule class for rules that affect the nav when portfolio modelling
 */
export class PortfolioNavSecurityRule extends NAVSecurityRule {
    order: number;

    constructor(lineItem: string, newWeight: number, order: number, selectedCurrency?: string) {
        super(lineItem, newWeight, selectedCurrency);
        this.order = order;
    }

    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.PORTFOLIO_NAV_SECURITY;
    }

    /**
     * Serialization of analytics ID
     */
    protected doSerialize(data: any): any {
        return {
            ...super.doSerialize(data),
            order: this.order,
        };
    }

    /**
     * Deserialization of analytics ID
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);

        if (data.order) {
            this.order = data.order;
        }
    }

    /**
     * Check if the passed object for attributes same as this one
     */
    equals(obj: PortfolioNavSecurityRule): boolean {
        return super.equals(obj) && this.order === obj.order;
    }
}
