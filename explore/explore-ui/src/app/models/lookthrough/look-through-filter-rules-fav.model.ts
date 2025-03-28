import {isEmpty, isNil, isObject} from 'lodash';
import {
    AbstractFavoriteConfig,
    FavoriteDisplayEnum,
    RequestParamsCreator,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {LookthroughFilterRule} from './look-through-filter-rule.model';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';

/**
 * Favorite class for look-through rules
 */
export class LookthroughfilterRulesFav extends AbstractFavoriteConfig implements RequestParamsCreator {

    /**
     * List of look-through rules
     */
    ltFilterRules: Array<LookthroughFilterRule>;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * To get favorite config type for look-through rules favorite
     */
    static get configType(): string {
        return LookthroughConstants.LT_FILTER_RULES;
    }

    /**
     * Function to add Look through settings to request params.
     */
    addRequestParams(requestParams: any): void {
        requestParams.lookthroughRules =  this.serializeRulesForDataRequest();
    }

    /**
     * This method returns a serialized object list for lookthroughFilterRule array
     */
    serializeRulesForDataRequest(): Array<any> {
        const ltRuleFilterList = [];
        if (!isEmpty(this.ltFilterRules)) {
            this.ltFilterRules
                .filter(ltFilterRule => ltFilterRule.isCustomizedRule())
                .forEach(ltFilterRule => ltRuleFilterList.push(ltFilterRule.serializeForDataRequest()));
        }
        return ltRuleFilterList;
    }

    /**
     * determines whether customized look-through is applied or not
     */
    isCustomizedLT(): boolean {
        return !isEmpty(this.ltFilterRules) && !isNil(this.ltFilterRules.find(ltFilterRule => ltFilterRule.isCustomizedRule()));
    }

    /**
     * doCopyFrom implementation from AbstractFavoriteConfig
     */
    protected doCopyFrom(sourceLtFilterRulesConfig: AbstractFavoriteConfig): void {
        if (!sourceLtFilterRulesConfig || !(sourceLtFilterRulesConfig instanceof LookthroughfilterRulesFav)) {
            return;
        }
        if (isEmpty(sourceLtFilterRulesConfig.ltFilterRules)) {
            return;
        }
        this.ltFilterRules = sourceLtFilterRulesConfig.ltFilterRules.map(ltFilterRuleConfig => {
            const copiedConfig: LookthroughFilterRule = new LookthroughFilterRule();
            copiedConfig.copyFrom(ltFilterRuleConfig);
            return copiedConfig;
        });
    }

    /**
     * doDeserialize implementation from AbstractFavoriteConfig
     */
    protected doDeserialize(data: any, chartService?: any): void {
        let ltFilterRules;
        if (data instanceof Array && !isEmpty(data)) {
            ltFilterRules = data;
        } else if (data && data.ltFilterRules) {
            ltFilterRules = data.ltFilterRules;
        } else {
            return;
        }
        this.ltFilterRules = ltFilterRules.map(ltFilterRule => new LookthroughFilterRule(ltFilterRule));
    }

    /**
     * doSerialize implementation from AbstractFavoriteConfig
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        // changed we need additional information like userPermGrps along with rules.
        const data: any = {};
        if (!isEmpty(this.ltFilterRules)) {
            data.ltFilterRules = this.ltFilterRules.map(ltFilterRule => ltFilterRule.serialize());
        }        
        return data;
    }

    /**
     * getConfigType implementation from AbstractFavoriteConfig
     */
    protected getConfigType(): string {
        return LookthroughfilterRulesFav.configType;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.LOOK_THROUGH_RULE;
    }
}
