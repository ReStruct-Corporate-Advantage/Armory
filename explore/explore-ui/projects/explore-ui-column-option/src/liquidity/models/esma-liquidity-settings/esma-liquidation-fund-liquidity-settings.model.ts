import {isNil} from 'lodash';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * ESMA Fund liquidation Settings model
 */
export class EsmaLiquidationFundLiquiditySettings extends AbstractLiquiditySettings {

    includeFundSettlementPeriodFlag: boolean;
    includeFundNoticePeriodFlag: boolean;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>) {
        super.initialize(defaultSettings);
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            includeFundSettlementPeriodFlag: this.includeFundSettlementPeriodFlag,
            includeFundNoticePeriodFlag: this.includeFundNoticePeriodFlag
        };
    }

    /**
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.includeFundSettlementPeriodFlag = data.includeFundSettlementPeriodFlag;
        this.includeFundNoticePeriodFlag = data.includeFundNoticePeriodFlag;
    }

    /**
     * return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof EsmaLiquidationFundLiquiditySettings)) {
            return false;
        }

        if (this.includeFundNoticePeriodFlag !== option.includeFundNoticePeriodFlag) {
            return false;
        }

        return (this.includeFundSettlementPeriodFlag === option.includeFundSettlementPeriodFlag);
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        requestParam.includeSettlementPeriodFlag = this.includeFundSettlementPeriodFlag;
        requestParam.includeFundSettlementPeriodFlag = this.includeFundSettlementPeriodFlag;
        requestParam.includeFundNoticePeriodFlag = this.includeFundNoticePeriodFlag;
    }
}
