import {LookThroughSettings, LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {LookthroughfilterRulesFav} from './look-through-filter-rules-fav.model';
import {isObject, isEmpty} from 'lodash';
import {AbstractFavoriteConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';

/**
 * Model class to represent LookThroughSettings with Rules.
 * LookThroughSettings are separate from rules now
 */
export class LookThroughSettingsWithRules extends LookThroughSettings {

    static readonly LOOKTHROUGH_SETTINGS = 'LT_SETTINGS';

    ltFilterRulesFav: LookthroughfilterRulesFav = new LookthroughfilterRulesFav(); // Enhanced look-through rules favorite

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Function to add Look through settings to request params.
     */
    addRequestParams(requestParams: any): void {
        // Add request params only port or bench look through is enabled.
        if (!this.isAnyLookthroughEnabled()) {
            return;
        }

        super.addRequestParams(requestParams);

        if (this.ltFilterRulesFav && this.ltFilterRulesFav.isCustomizedLT()) {
            this.ltFilterRulesFav.addRequestParams(requestParams);
        }
    }

    /**
     * converts into java script object that get serialized as json.
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = super.doSerialize();
        data.ltFilterRulesFav = this.ltFilterRulesFav.serialize();
        return data;
    }

    /**
     * Deserialize information store in favorite into object.
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (data.ltFilterRulesFav) {
            this.ltFilterRulesFav.deserialize(data.ltFilterRulesFav);
        }
    }

    /**
     * This method checks whether lookthrough rules are empty or not
     */
    containsRules(): boolean {
        if (!this.ltFilterRulesFav || isEmpty(this.ltFilterRulesFav.ltFilterRules)) {
            return false;
        }
        const nonEmptyRules: LookthroughFilterRule[] = this.ltFilterRulesFav.ltFilterRules.filter(ltFilterRule => {
            return ltFilterRule.customSector && ltFilterRule.customSector.rule && !ltFilterRule.isEmpty();
        });
        const nonFullLtTypes: LookthroughFilterRule[] = this.ltFilterRulesFav.ltFilterRules.filter(ltFilterRule => {
            return ltFilterRule.ltType !== LookthroughConstants.LT_TYPE_FULL;
        });
        return !(isEmpty(nonEmptyRules) && isEmpty(nonFullLtTypes));
    }

    /**
     * This method checks whether any of the look-through rules is enabled
     */
    hasEnabledRules(): boolean {
        if (!this.ltFilterRulesFav || isEmpty(this.ltFilterRulesFav.ltFilterRules)) {
            return false;
        }

        return !isEmpty(this.ltFilterRulesFav.ltFilterRules.filter(ltFilterRule => ltFilterRule.enabled));
    }

    /**
     * Method to serialize ltFilterRules into data object {}
     */
    serializeLtFilterRules(data: any): any {
        if (this.ltFilterRulesFav && !isEmpty(this.ltFilterRulesFav.ltFilterRules)) {
            data['ltFilterRules'] = [];
            this.ltFilterRulesFav.ltFilterRules.forEach(ltFilterRule => {
                data['ltFilterRules'].push(ltFilterRule.serialize());
            });
        }
    }

    /**
     * Copy the fields from source to this object
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (source instanceof LookThroughSettings) {
            super.doCopyFrom(source);
        }
        if (!(source instanceof LookThroughSettingsWithRules)) {
            return;
        }
        this.ltFilterRulesFav = new LookthroughfilterRulesFav();
        this.ltFilterRulesFav.copyFrom(source.ltFilterRulesFav);
    }

    /**
     * Return the config type
     */
    getConfigType(): string {
        return LookThroughSettingsWithRules.LOOKTHROUGH_SETTINGS;
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return LookThroughSettingsWithRules.LOOKTHROUGH_SETTINGS;
    }
}
