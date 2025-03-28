import {AbstractConfig, ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';
import {every, isObject} from 'lodash';
import {Rule} from '../../interfaces/rule.interface';
import {CustomSector} from './custom-sector/custom-sector.model';
import {CustomSectorRule} from './custom-sector/custom-sector-rule.model';
import {SectorConstants} from '../../constants/sector.constants';

/**
 * Class for the group sector rule, this is for the AND and OR rules.
 */
export class GroupRule extends AbstractConfig implements Rule {

    static readonly RULE_GROUP = 'RuleGroup';
    groupType: string;
    subRules: Array<Rule>;

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
     * Gets the config type for custom sector rule group.
     */
    get configType(): string {
        return SectorConstants.ConfigType.GROUP_RULE;
    }

    /**
     * Gets the name of the rule type for this rule.
     */
    get ruleType(): string {
        return GroupRule.RULE_GROUP;
    }

    /**
     * Adds a sub rule to this group.
     */
    addSubRule(rule: Rule): void {
        if (!this.subRules) {
            this.subRules = [];
        }

        this.subRules.push(rule);
    }

    /**
     * Checks if there are any subrules.
     */
    isEmpty(): boolean {
        return !this.subRules || this.subRules.length === 0;
    }

    /**
     * Toggles the rule type between AND/OR.
     */
    toggleGroupType(): void {
        this.groupType = this.groupType === SectorConstants.GROUP_RULE_CONDITION.AND ? SectorConstants.GROUP_RULE_CONDITION.OR : SectorConstants.GROUP_RULE_CONDITION.AND;
    }

    /**
     * Serialize the config to json.
     * isNested an optional parameter to indicate that the favorite is a nested one.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            ruleType: this.ruleType,
            ruleGroup: this.groupType
        };

        // Add the sub rules in.
        if (this.subRules && this.subRules.length > 0) {
            data.subRules = [];
            this.subRules.forEach((rule: Rule) => {
                data.subRules.push(rule.serialize(isNested));
            });
        }

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.groupType = data.ruleGroup;
        if (data.subRules && data.subRules.length > 0) {
            data.subRules.forEach((ruleData: any) => {
                if (ruleData.ruleType) {
                    const subRule: Rule = ConfigTypeFactory.createConfig(ruleData, 'CustomSector' + ruleData.ruleType, false);
                    this.addSubRule(subRule);
                } else if (ruleData.favId) {
                    const customSector: CustomSector = ConfigTypeFactory.createConfig(ruleData, SectorConstants.ConfigType.CUSTOM_SECTOR, false);
                    if (customSector) {
                        const rule: CustomSectorRule = new CustomSectorRule();
                        rule.customSector = customSector;
                        this.addSubRule(rule);
                    }
                }
            });
        }
    }

    /**
     * Checks if this rule definition is valid.
     */
    isValid(): boolean {
        // For a group rule it needs to have a type and also all children need to be valid.
        if (!this.groupType || this.isEmpty()) {
            return false;
        }

        // Check the sub rules.
        return every(this.subRules, function (subRule: Rule) {
            return subRule.isValid();
        });
    }

    /**
     * return true if both object are equal otherwise false
     * @param ruleInput
     */
    equals(ruleInput: Rule): boolean {
        if (!(ruleInput instanceof GroupRule)) {
            return false;
        }

        if (this.subRules.length !== ruleInput.subRules.length) {
            return false;
        }

        if (this.groupType !== ruleInput.groupType) {
            return false;
        }

        for (let i = 0; i < this.subRules.length; i++) {
            if (!(this.subRules[i].equals(ruleInput.subRules[i]))) {
                return false;
            }
        }

        return true;
    }
}
