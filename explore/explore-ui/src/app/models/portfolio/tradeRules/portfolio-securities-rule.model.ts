import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {CompositionConstants} from '@constants/composition.constants';
import {isEmpty, isObject} from 'lodash';
import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';
import {RuleUnit} from '@enums/rule-unit.enum';

/**
 * class for portfolio securities rule in point-in-time modeling
 */
export class PortfolioSecuritiesRule extends PortfolioRule {

    title: string;

    /**
     * Default constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    protected doSerialize(data: any): any {
        return {
            ...super.doSerialize(data),
            ...(!isEmpty(this.title) && !!this.id ? {title: this.title} : {})
        };
    }

    protected doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (!isEmpty(data?.title)) {
            this.title = data.title;
        }
    }

    /**
     * Get the rule type for this rule
     * @protected
     */
    protected getRuleType(): string {
        return CompositionConstants.RuleType.PORTFOLIO_SECURITIES;
    }

    /**
     * append favorite id to the name
     * @param name - lineItem or childPortfolioName
     */
    getWithFavTitle(name: string): string {
        return !isEmpty(name) && !isEmpty(this.title)
            ? name.concat(CompositionConstants.FAV_ID_DELIMITER).concat(CompositionConstants.OPENING_SMALL_BRACKET + this.title + CompositionConstants.CLOSING_SMALL_BRACKET)
            : name;
    }

    /**
     * convert rule into corresponding portfolio securities holding change
     */
    convertToHoldingChange(portMarketVal: number): PortfolioSecuritiesHoldingChange {
        const weight: number = this.ruleUnit === RuleUnit.NOTIONAL_MV ? (this.newWeight / portMarketVal) * 100 : this.newWeight;
        return new PortfolioSecuritiesHoldingChange({
            favId: this.id,
            lineItem: this.lineItem,
            newWeight: weight,
            changeInWeight: weight,
            ...(!!this.id ? {title: this.title} : {}),
            portfolioType: this.portfolioType,
            ruleToUse: this.serialize()
        });
    }
}
