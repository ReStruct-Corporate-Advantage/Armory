import {cloneDeep, findIndex, isEmpty, isEqual} from 'lodash';
import {BaseRule} from '../tradeRules/base-rule.model';
import {RuleFactory} from '../../../factories/rule.factory';
import {AbstractFavoriteConfig, FavoriteDisplayEnum, SerializeFavoriteType} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';

/**
 * Model class for composition rule
 */
export class CompositionRule extends AbstractFavoriteConfig {
    tradeRules: BaseRule[] = [];

    /**
     * Constructor implementation
     */
    constructor(ticker?: string, tradeRules?: BaseRule[]) {
        super();
        this.title = ticker;
        if (tradeRules) {
            this.tradeRules = tradeRules;
        }
    }

    /**
     * This method adds the trade rules from the CompositionRule object passed in to its existing trade rules
     */
    addTradeRules(compRule: CompositionRule): void {
        if (!compRule || !compRule.tradeRules) {
            return;
        }

        if (isEmpty(this.tradeRules)) {
            // If trade rules is not defined in this, then just copy
            this.tradeRules = cloneDeep(compRule.tradeRules);
        } else {
            // find unique list of action excluding any trade action which exist for line item being worked on.
            this.tradeRules = this.tradeRules.filter(rule => findIndex(compRule.tradeRules, ruleItem => rule.equals(ruleItem)) === -1);
            this.tradeRules = this.tradeRules.concat(compRule.tradeRules);
        }
    }

    /**
     * Compares with other composition rules object
     */
    equals(otherCompRules: AbstractFavoriteConfig): boolean {
        if (!(otherCompRules instanceof CompositionRule)) {
            return false;
        }

        // Check for the trade rules length for equality
        if (this.tradeRules.length !== otherCompRules.tradeRules.length) {
            return false;
        }

        // Check if the trade rules are the same
        return isEqual(this.tradeRules, otherCompRules.tradeRules);
    }

    /**
     * copyFrom implementation
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof CompositionRule)) {
            return;
        }

        this.tradeRules = source.tradeRules;
    }

    /**
     * Deserialize data into composition rule object
     */
    protected doDeserialize(data: any): void {
        const tradeRules: any[] = !isEmpty(data.tradeRules)
            ? data.tradeRules
            : data.compositionRules && !isEmpty(data.compositionRules.tradeRules) ? data.compositionRules.tradeRules : [];

        if (!isEmpty(tradeRules)) {
            this.tradeRules = tradeRules.map(ruleData => RuleFactory.createRuleBasedOnType(ruleData));
        }
    }

    /**
     * Serialize data from composition rule object
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const savableRules: Array<BaseRule> = this.getSavableRules();
        return isEmpty(savableRules) ? undefined : {
            tradeRules: savableRules.map(rule => rule.serialize())
        };
    }

    protected getConfigType(): string {
        return CompositionRule.configType;
    }

    static get configType(): string {
        return FavoriteConstants.COMP_RULES;
    }

    private getSavableRules(): BaseRule[] {
        return this.tradeRules.filter(rule => rule.savable);
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.COMP_RULE;
    }
}
