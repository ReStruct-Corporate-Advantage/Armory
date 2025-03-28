import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {CompositionConstants} from '../constants';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {ActiveSecurityRule} from '@models/portfolio/tradeRules/active-security-rule.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {toNumber} from 'lodash';
import {NAVSecurityRule} from '@models/portfolio/tradeRules/nav-security-rule.model';
import {RuleUnit} from '@enums/rule-unit.enum';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {ActiveBreakdownRule} from '@models/portfolio/tradeRules/active-breakdown-rule.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {CoreCommonConstants} from '@blk/explore-ui-core';
import {SectorRuleUtils} from '@blk/explore-ui-breakdown';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';
import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';

/**
 * Utility methods and other helper methods related to rules will be in this service
 */
export class RuleFactory {

    /**
     * private map to hold rule types
     */
    private static ruleTypes: Map<string, any> = new Map<string, any>();

    /**
     * Registers a rule type with the factory.
     */
    static registerRuleType(name: string, configType: any) {
        RuleFactory.ruleTypes.set(name, configType);
    }

    /**
     * Creates and returns the type of rule with the information passed through
     */
    static createRule(cusip: string, newValue: number, ruleType: string, ruleUnit?: string, id?: number, portfolioType?: string, addToPortfolio?: string) {
        if (ruleType === CompositionConstants.ModelCash.KEEP_AS_CASH) {
            return new NAVSecurityRule(cusip, newValue);
        } else if (ruleType === CompositionConstants.RuleType.SECURITY) {
            return new SecurityRule(cusip, newValue, ruleUnit, undefined, addToPortfolio);
        } else if (ruleType === CompositionConstants.RuleType.PORTFOLIO) {
            return new PortfolioRule(cusip, newValue, ruleUnit, id, portfolioType);
        } else if (ruleType === CompositionConstants.RuleType.PORTFOLIO_SECURITIES) {
            return new PortfolioSecuritiesRule({
                lineItem: cusip,
                newWeight: newValue,
                ruleUnit, id, portfolioType
            });
        }
    }

    /**
     * Create a rule object based on the rule data
     */
    static createRuleBasedOnType(ruleData: any): BaseRule {
        const ruleType = RuleFactory.ruleTypes.get(ruleData[CompositionConstants.RULE_TYPE]);
        let rule: BaseRule;

        switch (ruleData[CompositionConstants.RULE_TYPE]) {
            case CompositionConstants.RULE_TYPES.PORTFOLIO:
            case CompositionConstants.RULE_TYPES.NAV_SECURITY:
            case CompositionConstants.RULE_TYPES.ACTIVE_SECURITY:
                rule = ruleData.favId
                    ? new ruleType(ruleData.lineItem, ruleData.newWeight, ruleData.ruleUnit, ruleData.favId)
                    : new ruleType(ruleData.lineItem, ruleData.newWeight);
                break;
            case CompositionConstants.RULE_TYPES.SECTOR:
            case CompositionConstants.RULE_TYPES.ACTIVE_SECTOR:
                rule = new ruleType(ruleData.lineItem, ruleData.newWeight, null);
                break;
            case CompositionConstants.RULE_TYPES.BREAKDOWN_TREE:
            case CompositionConstants.RULE_TYPES.ACTIVE_BREAKDOWN:
                rule =new ruleType(ruleData.lineItem, ruleData.newWeight, ruleData.breakdownTree);
                break;
            case CompositionConstants.RuleType.PORTFOLIO_SECURITIES:
                rule = new ruleType({
                    lineItem: ruleData.lineItem,
                    newWeight: ruleData.newWeight,
                    ruleUnit: ruleData.ruleUnit,
                    id: ruleData.favId,
                    portfolioType: ruleData.portfolioType
                });
                break;
            default:
                rule = new SecurityRule(ruleData.lineItem, ruleData.newWeight);
                break;
        }

        rule.deserialize(ruleData);
        return rule;
    }

    /**
     * Method to create Appropriate Trade rule based on portfolio and params.
     * * 1. if Portfolio is port group or composite - return PortfolioTradeAction
     * 2. else in active mode and no breakdown
     *      2.1 on active column return ActiveColumnSecurityTradeAction
     *      2.2 on non active column return ActiveSecurityTradeAction
     * 3. else In Active mode with Breakdown
     *      3.1 On Intermediate sector node
     *           3.1.1 on active column return ActiveColumnSectorTradeAction
     *           3.1.2 else return ActiveSectorTradeAction
     *      3.2 else
     *           3.2.1 on active column return ActiveColumnSecurityTradeAction
     *           3.2.2 else return ActiveSecurityTradeAction
     * 4. else with breakdown
     *     4.1 On Intermediate - return SectorTradeAction
     *     4.2 else - return SecurityTradeAction
     * 5. Nothing passes return SecurityTradeAction
     */
    static createRuleBasedOnAction(portfolio: WhatIfPortfolio, params: any): BaseRule {
        // if there no change nothing to do.
        if (toNumber(toNumber(params.newValue).toFixed(6)) - toNumber(toNumber(params.oldValue).toFixed(6)) === 0.0) {
            return null;
        }

        // find line item on which action is being done.
        const lineItem: string = params.node.group ? params.node.key : params.node.data.cusip || params.node.data.portfolio_name;

        // we are always calculating change with respect to original value
        portfolio.compositionSetting.tradingColumn = params.column.parent.groupId;
        portfolio.compositionSetting.showActiveInComposition = portfolio.compositionSetting.tradingColumn.includes('_active');
        // Increment or decrement the value if there is arithmetic sign (+ or -) present else set the value. Example - if the old value is 40, entering +2 will make it 42 and entering +-2 will make it 38 and entering 2 or -2 will set it to 2 and -2 respectively.
        const newValue = params.newValue[0] === '+' ? toNumber(toNumber(params.oldValue).toFixed(6)) + toNumber(toNumber(params.newValue.substring(1)).toFixed(6))
            : toNumber(toNumber(params.newValue).toFixed(6));

        // for port group and composites create portfolio Rule.
        if (portfolio.isCompositionAtPortfolioLevel()) {
            const lineItemParts: string[] = lineItem.split(CompositionConstants.FAV_ID_DELIMITER);
            if (lineItemParts.length > 1) {
                const titleToMatch: string = lineItemParts[1]
                    .replace(CompositionConstants.OPENING_SMALL_BRACKET, CoreCommonConstants.EMPTY_STRING)
                    .replace(CompositionConstants.CLOSING_SMALL_BRACKET, CoreCommonConstants.EMPTY_STRING);
                const favId: number = (portfolio.holdingChanges.find((change: PortfolioHoldingChange) => change.title === titleToMatch) as PortfolioHoldingChange).id;
                const portRule: BaseRule = (portfolio as RulesBasedPortfolio).compositionRules.tradeRules.find(rule => rule instanceof PortfolioRule && rule.id === favId);
                return new PortfolioRule(lineItemParts[0], newValue, RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()], favId, (portRule as PortfolioRule)?.portfolioType);
            }

            return new PortfolioRule(lineItem, newValue, RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()]);
        }

        // for other portfolios in active mode with no breakdown create active security rule.
        if (portfolio.compositionSetting.showActiveInComposition && !portfolio.isCompositionBreakdownSpecified()) {
            return new ActiveSecurityRule(lineItem, newValue, RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()]);
        }

        // in active mode with breakdown if action happened on sector node create active sector and if at root
        // create active security rule
        if (portfolio.compositionSetting.showActiveInComposition && portfolio.isCompositionBreakdownSpecified()) {
            // if leaf create security else create sector
            if (params.node.group) {
                // create sector path values
                return new ActiveBreakdownRule(lineItem, newValue, JSON.stringify(portfolio.compositionSetting.breakdownTree.serialize()), SectorRuleUtils.getSectorPath(params.node, []), RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()]);
            } else {
                return new ActiveSecurityRule(lineItem, newValue, RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()]);
            }
        }

        if (portfolio.isCompositionBreakdownSpecified() && params.node.group) {
            // create sector path values
            return new BreakdownTreeRule(lineItem, newValue, JSON.stringify(portfolio.compositionSetting.breakdownTree.serialize()), SectorRuleUtils.getSectorPath(params.node, []), RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()]);
        }


        const matchingChange = portfolio.holdingChanges
            .filter(change => change instanceof PortfolioSecuritiesHoldingChange)
            .find((change: PortfolioSecuritiesHoldingChange) => change.getWithFavTitle(change.lineItem) === params?.data?.rowId);

        if (!!matchingChange) {
            return new PortfolioSecuritiesRule({
                lineItem,
                newWeight: newValue,
                ruleUnit: RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()],
                id: (matchingChange as PortfolioSecuritiesHoldingChange).id,
                portfolioType: CompositionConstants.RuleType.PORTFOLIO_SECURITIES
            });
        }

        return new SecurityRule(lineItem, newValue, RuleUnit[portfolio.compositionSetting.tradingColumn.toUpperCase()]);
    }
}
