import {isEmpty, isObject} from 'lodash';
import {AbstractConfig} from '@blk/explore-ui-core';
import {TierDefinitionType} from '@enums/tier-definition-type.enum';

/**
 * Class for Tier Definition
 */
export class TierDefinition extends AbstractConfig {
    static readonly CONFIG_TYPE = 'tiers';

    tierType: TierDefinitionType;
    tierOne: number;
    tierTwo: number;
    riskBudgetTierRatio: string;
    riskBudgetFixedAssetRatio: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
        if (!this.tierType) {
            this.tierType = TierDefinitionType.NAME;
        }
    }

    /**
     * Gets the config type for Filter
     */
    get configType(): string {
        return TierDefinition.CONFIG_TYPE;
    }

    deserialize(data: any) {
        if (!data) {
            return;
        }
        this.tierOne = data.tierOne;
        this.tierTwo = data.tierTwo;
        this.tierType = data.tierType;
        this.riskBudgetTierRatio = data.riskBudgetTierRatio;
        this.riskBudgetFixedAssetRatio = data.riskBudgetFixedAssetRatio;
    }

    serialize(_isNested?: number | boolean): any {
        return {
            'tierType': this.tierType,
            'tierOne': this.tierOne,
            'tierTwo': this.tierTwo,
            ...(isEmpty(this.riskBudgetTierRatio) ? {} : {riskBudgetTierRatio: Number(this.riskBudgetTierRatio)}),
            ...(isEmpty(this.riskBudgetFixedAssetRatio) ? {} : {riskBudgetFixedAssetRatio: Number(this.riskBudgetFixedAssetRatio)}),
        };
    }

    equals(tierDefinition: AbstractConfig): boolean {
        if (!(tierDefinition instanceof TierDefinition)) {
            return false;
        }
        if (this.tierType !== tierDefinition.tierType) {
            return false;
        }
        if (this.tierOne !== tierDefinition.tierOne) {
            return false;
        }
        if (this.tierTwo !== tierDefinition.tierTwo) {
            return false;
        }
        if (this.riskBudgetTierRatio !== tierDefinition.riskBudgetTierRatio) {
            return false;
        }
        return this.riskBudgetFixedAssetRatio === tierDefinition.riskBudgetFixedAssetRatio;
    }
}
