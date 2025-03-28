import {isNil} from 'lodash';
import {LiquidityConstants} from '../liquidity.constants';
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * partial liquidation Settings model as a part of liquidity Settings
 */
export class PartialLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly DEFAULT_PARTIAL_LIQUIDATION: boolean = false;
    private static readonly DEFAULT_LIQUIDATION_CONSTRAINT: string = LiquidityConstants.LIQUIDATION_CONSTRAINT_PERCENT_NAV;
    private static readonly DEFAULT_PERCENT_NAV_LIQUIDATED: number = 100;
    private static readonly DEFAULT_MAX_TRANSACTION_COST: number = 100;
    private static readonly DEFAULT_MAX_MARKET_IMPACT: number = 100;
    private static readonly DEFAULT_MAX_RATIO: number = 1;
    private static readonly DEFAULT_LIQUIDATION_BUCKET_METH: string = LiquidityConstants.LIQUIDATION_BUCKET_EQUAL_DOLLAR;

    partialLiquidation: boolean;
    liquidationStrategy: string;
    liquidationConstraint: string;
    percentNavLiquidated: number;
    maxTransactionCost: number;
    maxMarketImpact: number;
    maxRatio: number;
    liquidationBucketMeth: string;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>): void {
        super.initialize(defaultSettings);

        this.partialLiquidation = PartialLiquiditySettings.DEFAULT_PARTIAL_LIQUIDATION;

        this.liquidationStrategy = defaultSettings.get(LiquidityConstants.LIQUIDATION_SETTINGS)
                ? (defaultSettings.get(LiquidityConstants.MODIFIED_LIQUIDATION_STRATEGIES_ONLY) ? LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL : LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL)
                : LiquidityConstants.LIQUIDATION_STRATEGY_PRO_RATA;

        this.liquidationConstraint = PartialLiquiditySettings.DEFAULT_LIQUIDATION_CONSTRAINT;

        this.percentNavLiquidated = PartialLiquiditySettings.DEFAULT_PERCENT_NAV_LIQUIDATED;

        this.maxTransactionCost = PartialLiquiditySettings.DEFAULT_MAX_TRANSACTION_COST;

        this.maxMarketImpact = PartialLiquiditySettings.DEFAULT_MAX_MARKET_IMPACT;

        this.maxRatio = PartialLiquiditySettings.DEFAULT_MAX_RATIO;

        this.liquidationBucketMeth = PartialLiquiditySettings.DEFAULT_LIQUIDATION_BUCKET_METH;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            partialLiquidation: this.partialLiquidation,
            liquidationStrategy: this.liquidationStrategy,
            liquidationConstraint: this.liquidationConstraint,
            percentNavLiquidated: this.percentNavLiquidated,
            maxTransactionCost: this.maxTransactionCost,
            maxMarketImpact: this.maxMarketImpact,
            maxRatio: this.maxRatio,
            liquidationBucketMeth: this.liquidationBucketMeth
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.partialLiquidation = !isNil(data.partialLiquidation) ? data.partialLiquidation : PartialLiquiditySettings.DEFAULT_PARTIAL_LIQUIDATION;
        this.liquidationStrategy = data.liquidationStrategy;
        this.liquidationConstraint = !isNil(data.liquidationConstraint) ? data.liquidationConstraint : PartialLiquiditySettings.DEFAULT_LIQUIDATION_CONSTRAINT;
        this.percentNavLiquidated = !isNil(data.percentNavLiquidated) ? data.percentNavLiquidated : PartialLiquiditySettings.DEFAULT_PERCENT_NAV_LIQUIDATED;
        this.maxTransactionCost = !isNil(data.maxTransactionCost) ? data.maxTransactionCost : PartialLiquiditySettings.DEFAULT_MAX_TRANSACTION_COST;
        this.maxMarketImpact = !isNil(data.maxMarketImpact) ? data.maxMarketImpact : PartialLiquiditySettings.DEFAULT_MAX_MARKET_IMPACT;
        this.maxRatio = !isNil(data.maxRatio) ? data.maxRatio : PartialLiquiditySettings.DEFAULT_MAX_RATIO;
        this.liquidationBucketMeth = !isNil(data.liquidationBucketMeth) ? data.liquidationBucketMeth : PartialLiquiditySettings.DEFAULT_LIQUIDATION_BUCKET_METH;
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof PartialLiquiditySettings)) {
            return false;
        }

        if (this.partialLiquidation !== option.partialLiquidation) {
            return false;
        }
        if (this.liquidationStrategy !== option.liquidationStrategy) {
            return false;
        }
        if (this.liquidationConstraint !== option.liquidationConstraint) {
            return false;
        }
        if (this.percentNavLiquidated !== option.percentNavLiquidated) {
            return false;
        }
        if (this.maxTransactionCost !== option.maxTransactionCost) {
            return false;
        }
        if (this.liquidationBucketMeth !== option.liquidationBucketMeth) {
            return false;
        }
        if (this.maxRatio !== option.maxRatio) {
            return false;
        }

        return (this.maxMarketImpact === option.maxMarketImpact);
    }

    /**
     * Add value to request params
     * @param requestParam - Request params object params to be added into
     */
    addRequestParams(requestParam: any): void {
        requestParam.partialLiquidation = this.partialLiquidation;
        requestParam.liquidationStrategy = this.liquidationStrategy;
        requestParam.liquidationConstraint = this.liquidationConstraint;
        requestParam.percentNAVLiquidated = this.percentNavLiquidated / 100;
        requestParam.maxTransactionCost = this.maxTransactionCost / 10000;
        requestParam.maxMarketImpact = this.maxMarketImpact / 10000;
        requestParam.maxRatio = this.maxRatio;
        requestParam.liquidationBucketMeth = this.liquidationBucketMeth;
    }
}
