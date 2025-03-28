import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';
import {isEmpty, isObject} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';

export class PortfolioSecuritiesHoldingChange extends NewPortfolioHoldingChange {
    ruleToUse: PortfolioSecuritiesRule;
    portfolioType?: string;
    existingPort?: boolean;

    /**
     * Default constructor
     */
    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Get the change type for this holding change
     */
    public getChangeType(): string {
        return CompositionConstants.HOLDING_CHANGE_TYPES.PORT_SECURITIES;
    }

    /**
     * Check if the passed object for attributes are the same as this one
     */
    protected hasSameAttributes(obj: any): boolean {
        return (obj instanceof PortfolioSecuritiesHoldingChange) && this.ruleToUse.equals(obj.ruleToUse) && this.portfolioType === obj.portfolioType;
    }

    /**
     * Serialize child portfolio name
     */
    protected doSerialize(data: any): any {
        return {
            ...super.doSerialize(data),
            ...(!!this.ruleToUse ? {ruleToUse: this.ruleToUse.serialize()} : {}),
            ...(!isEmpty(this.portfolioType) ? {portfolioType: this.portfolioType} : {}),
            ...(this.existingPort && {existingPort: this.existingPort})
        };
    }

    /**
     * Deserialize child portfolio name
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (!!data?.ruleToUse) {
            this.ruleToUse = new PortfolioSecuritiesRule(data.ruleToUse);
        }
        if (!isEmpty(data?.portfolioType)) {
            this.portfolioType = data.portfolioType;
        }
        if (data?.existingPort) {
            this.existingPort = data.existingPort;
        }
    }
}
