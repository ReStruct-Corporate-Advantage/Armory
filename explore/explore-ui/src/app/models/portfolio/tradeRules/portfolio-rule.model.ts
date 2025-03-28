import {BaseRule} from './base-rule.model';
import {CompositionConstants} from '../../../constants';
import {isNumber} from 'lodash';

/**
 * Composition rule class for portfolio level modelling
 */
export class PortfolioRule extends BaseRule {
    id?: number;
    portfolioType?: string;

    constructor(lineItem?: string, newWeight?: number, ruleUnit?: string, id?: number, portfolioType?: string, addedDuringInitOfCustomPort?: boolean) {
        super(lineItem, newWeight, ruleUnit, addedDuringInitOfCustomPort);
        if (isNumber(id)) {
            this.id = id;
        }
        this.portfolioType = portfolioType;
    }

    protected doSerialize(data: any): any {
        return {
            ...(isNumber(this.id) ? {favId: this.id} : {}),
            ...data
        };
    }

    protected doDeserialize(data: any): void {
        const favId = [data?.id, data?.favId].find(Boolean);
        if (isNumber(favId)) {
            this.id = favId;
        }
        if (data.portfolioType) {
            this.portfolioType = data.portfolioType;
        }
    }

    protected isSavable(): boolean {
        return true;
    }

    /**
     * Get the rule type for this rule
     */
    protected getRuleType(): string {
        return CompositionConstants.RULE_TYPES.PORTFOLIO;
    }
}
