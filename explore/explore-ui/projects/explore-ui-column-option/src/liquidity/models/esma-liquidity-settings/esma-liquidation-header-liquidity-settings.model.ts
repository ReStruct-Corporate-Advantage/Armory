import {isNil} from 'lodash';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {LiquidityConstants} from '../../liquidity.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * ESMA Liquidation Header model class as a part of ESMA liquidation Settings
 */
export class EsmaLiquidationHeaderLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly DEFAULT_NAV_MULTIPLIER: number = 1;
    private static readonly DEFAULT_CAPACITY_APPROACH: string = LiquidityConstants.CAPACITY_APPROACH_CONCURRENT_WEIGHTED;
    private static readonly DEFAULT_INCLUDE_EQUITY_HF_CASH_FlAG: boolean = true;

    includeTransactionCostFlag: boolean;
    includeSettlementPeriodFlag: boolean;
    includeEquityHFCashFlag: boolean;
    navMultiplier: number;
    capacityApproach: string;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>): void {
        super.initialize(defaultSettings);

        if (defaultSettings.get(LiquidityConstants.ENABLE_TRANSACTION_COST_FLAG)) {
            this.includeTransactionCostFlag = true;
        }
        this.includeEquityHFCashFlag = EsmaLiquidationHeaderLiquiditySettings.DEFAULT_INCLUDE_EQUITY_HF_CASH_FlAG;
        this.navMultiplier = EsmaLiquidationHeaderLiquiditySettings.DEFAULT_NAV_MULTIPLIER;
        this.capacityApproach = EsmaLiquidationHeaderLiquiditySettings.DEFAULT_CAPACITY_APPROACH;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            includeTransactionCostFlag: this.includeTransactionCostFlag,
            includeSettlementPeriodFlag: this.includeSettlementPeriodFlag,
            includeEquityHFCashFlag: this.includeEquityHFCashFlag,
            navMultiplier: this.navMultiplier,
            capacityApproach: this.capacityApproach
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.includeTransactionCostFlag = data.includeTransactionCostFlag;
        this.includeSettlementPeriodFlag = data.includeSettlementPeriodFlag;
        this.includeEquityHFCashFlag = !isNil(data.includeEquityHFCashFlag) ? data.includeEquityHFCashFlag : EsmaLiquidationHeaderLiquiditySettings.DEFAULT_INCLUDE_EQUITY_HF_CASH_FlAG;
        this.navMultiplier = !isNil(data.navMultiplier) ? data.navMultiplier : EsmaLiquidationHeaderLiquiditySettings.DEFAULT_NAV_MULTIPLIER;
        this.capacityApproach = !isNil(data.capacityApproach) ? data.capacityApproach : EsmaLiquidationHeaderLiquiditySettings.DEFAULT_CAPACITY_APPROACH;
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof EsmaLiquidationHeaderLiquiditySettings)) {
            return false;
        }

        if (this.includeTransactionCostFlag !== option.includeTransactionCostFlag) {
            return false;
        }
        if (this.includeSettlementPeriodFlag !== option.includeSettlementPeriodFlag) {
            return false;
        }
        if (this.includeEquityHFCashFlag !== option.includeEquityHFCashFlag) {
            return false;
        }
        if (this.navMultiplier !== option.navMultiplier) {
            return false;
        }
        return (this.capacityApproach === option.capacityApproach);
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    public addRequestParams(requestParam: any): void {
        requestParam.includeEquityHFCashFlag = this.includeEquityHFCashFlag;
        requestParam.includeTransactionCostFlag = this.includeTransactionCostFlag;
        requestParam.includeSettlementPeriodFlag = this.includeSettlementPeriodFlag;
        requestParam.navMultiplier = this.navMultiplier;
        requestParam.capacityApproach = this.capacityApproach;
    }
}
