import {CompositionConstants} from '../../constants';
import {ModellingType} from '../../enums/modelling-type.enum';
import {WhatIfPortfolio} from './what-if-portfolio.model';
import {CompositionRule} from './composition/composition-rule.model';
import {cloneDeep, isEmpty, isEqual} from 'lodash';
import {BaseRule} from './tradeRules/base-rule.model';
import {PortfolioRule} from './tradeRules/portfolio-rule.model';
import {Portfolio} from './portfolio.model';
import {
    AbstractFavoriteConfig,
    CalendarDateUtils,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {HoldingChangeFactory} from '../../factories/holding-change.factory';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';

/**
 * Implementation class for a Rules Based What If portfolio. This class will have the composition rules and the filter for the rules based portfolio
 * What if portfolio type which allows sector and portfolio modelling.. This  results in composition rules that can be applied on a time series
 */
export class RulesBasedPortfolio extends WhatIfPortfolio {

    compositionRules: CompositionRule = new CompositionRule();
    cashOffsetHoldingChanges: HoldingChange[];

    /**
     * Constructor implementation
     */
    constructor(ticker?: string, title?: string, datePicker?: any) {
        super(ticker, datePicker);
        // This needs to be done here, because the title could depend on the attributes of the what if portfolio
        this.title = this.getDefaultTitle(title);
        this.modellingType = ModellingType.SECTOR;
        this.compositionRules.title = ticker;
    }

    /**
     * serialize the content from RulesBasedPortfolio object
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const filteredHoldingChanges = this.holdingChanges.filter(change => change instanceof PortfolioSecurityHoldingChange);
        // Removing datePicker so that isn't saved as a part of rule-based portfolio favorite
        const {datePicker, ...serialized} = super.doSerialize(isNested);
        return {
            ...serialized,
            compositionRules: this.compositionRules.serialize(isNested),
            ...(this.modellingType === ModellingType.PORTFOLIO && !isEmpty(filteredHoldingChanges) ?
                {cashOffsetHoldingChanges: filteredHoldingChanges.map(change => change.serialize())}
                : {})
        };
    }

    /**
     * deserialize the content into RulesBasedPortfolio object
     */
    doDeserialize(data: any): void {
        // Removing datePicker from saved rule-based portfolios as rule-based-portfolio shouldn't have date saved
        const {datePicker, ...remainingData} = data;
        super.doDeserialize(remainingData);
        if (data.compositionRules) {
            this.compositionRules.deserialize(data.compositionRules);
        } else if (data.compRulesAndFilter) {
            if (data.compRulesAndFilter.compositionRules) {
                this.compositionRules.deserialize(data.compRulesAndFilter.compositionRules);
                if (this.compositionRules.tradeRules.length > 0 && this.compositionRules.tradeRules[0].ruleType === CompositionConstants.RULE_TYPES.PORTFOLIO) {
                    this.modellingType = ModellingType.PORTFOLIO;
                }
            }
        }
        if (!this.datePicker) {
            this.datePicker = CalendarDateUtils.getDefaultDateObject();
        }
        if (!isEmpty(data.cashOffsetHoldingChanges)) {
            this.cashOffsetHoldingChanges = data.cashOffsetHoldingChanges.map(change => HoldingChangeFactory.convertObjectToHoldingChange(change));
        }
    }

    /**
     * Adds request params
     */
    addRequestParams(requestParams: any): void {
        super.addRequestParams(requestParams);
        requestParams.rules = JSON.stringify(this.compositionRules.tradeRules.map(tradeRule => tradeRule.serialize()));
    }

    hasHoldingChangesOrRules(): boolean {
        return !isEmpty(this.holdingChanges) || (this.compositionRules && !isEmpty(this.compositionRules.tradeRules));
    }

    /**
     * Add trade rule to the compositionRule trade rules making sure there no trade rules on same line item
     */
    addTradeRule(tradeRule: BaseRule): void {
        this.compositionRules.tradeRules = this.compositionRules.tradeRules.filter(rule =>
            // in case of breakdown tree  rule, lineItem comparison is not applicable and we rely on breakdown tree
            // and sector path comparison to make sure we have the right match
            tradeRule instanceof BreakdownTreeRule
                ? !(rule instanceof BreakdownTreeRule && tradeRule.breakdownTree === rule.breakdownTree && isEqual(tradeRule.sectorPath, rule.sectorPath))
                : rule instanceof PortfolioRule && tradeRule instanceof PortfolioRule
                ? !(rule.lineItem === tradeRule.lineItem && rule.id === tradeRule.id)
                : rule.lineItem !== tradeRule.lineItem
        );
        this.compositionRules.tradeRules.push(tradeRule);
    }

    /**
     * copyFrom implementation
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Portfolio)) {
            return;
        }

        super.doCopyFrom(source);

        if (!(source instanceof RulesBasedPortfolio)) {
            return;
        }

        this.compositionRules = cloneDeep(source.compositionRules);
    }

    /**
     * Matches the attributes with other RulesBasedPortfolio portfolio
     */
    equals(obj: WhatIfPortfolio): boolean {
        if (!(obj instanceof RulesBasedPortfolio)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        return this.compositionRules.equals(obj.compositionRules);
    }

    /**
     * Get the default title for this what if portfolio
     */
    protected getDefaultTitle(title: string): string {
        return title ? title : this.portName + '-' + CompositionConstants.PORT_WITH_RULES.LABEL;
    }

    /**
     * Get the type of What if portfolio to be used for favorite type
     */
    protected getConfigType(): string {
        return RulesBasedPortfolio.configType;
    }

    static get configType(): string {
        return CompositionConstants.PORT_WITH_RULES.TYPE;
    }

    get type(): string {
        return this.getConfigType();
    }

    /**
     * Return all the values of holdingChanges having isNavNeutral as false
     * And Clear Rule List.
     */
    clearHoldingChanges(): void {
        this.clearHoldingChangesWithRulelist(true);
    }

    /**
     * Clears all the existing holding changes and rule list if enabled via clearRuleList flag.
     * @param clearRuleList
     */
    clearHoldingChangesWithRulelist(clearRuleList: boolean): void {
        super.clearHoldingChanges();
        // clear rule list if enabled
        if(clearRuleList) {
            this.compositionRules.tradeRules = [];
        }
    }

    /**
     * This method adds composition rules to request for benchmark RuleBasePortfolio
     */
    addBenchCompositionParams(requestParams: any) {
        super.addBenchCompositionParams(requestParams);
        requestParams.benchmarkRules = !isEmpty(this.compositionRules.tradeRules)
            ? JSON.stringify(this.compositionRules.tradeRules.map(rule => rule.serialize()))
            : undefined;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.RULE_BASED_PORT;
    }
}
