import {isNil} from 'lodash';
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {LiquidityConstants} from '../liquidity.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * model class for stress-liquidity setting as a part of liquidity settings
 */
export class StressLiquiditySettings extends AbstractLiquiditySettings {

    public static readonly DEFAULT_FIXED_COST_MULTIPLIER: number = 1;
    public static readonly DEFAULT_MARKET_DEPTH_MULTIPLIER: number = 1;
    public static readonly DEFAULT_MARKET_IMPACT_MULTIPLIER: number = 1;
    private static readonly DEFAULT_STRESS_ANALYSIS_FLAG: boolean = false;
    private static readonly DEFAULT_TCOST_STRESS_FLAG: boolean = false;

    fixedCostMultiplier: number;
    marketDepthMultiplier: number;
    marketImpactMultiplier: number;
    stressAnalysisFlag: boolean;
    tcostStressFlag: boolean;
    assetStressScenario: string;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>) {
        super.initialize(defaultSettings);

        this.stressAnalysisFlag = StressLiquiditySettings.DEFAULT_STRESS_ANALYSIS_FLAG;
        this.tcostStressFlag = StressLiquiditySettings.DEFAULT_TCOST_STRESS_FLAG;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            stressAnalysisFlag: this.stressAnalysisFlag,
            tcostStressFlag: this.tcostStressFlag
        };
        if (this.fixedCostMultiplier) {
            data.fixedCostMultiplier = this.fixedCostMultiplier;
        }
        if (this.marketDepthMultiplier) {
            data.marketDepthMultiplier = this.marketDepthMultiplier;
        }
        if (this.marketImpactMultiplier) {
            data.marketImpactMultiplier = this.marketImpactMultiplier;
        }
        if (this.assetStressScenario && data.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO) {
            data.assetStressScenario = this.assetStressScenario;
        }
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        if (!isNil(data.fixedCostMultiplier)) {
            this.fixedCostMultiplier = data.fixedCostMultiplier;
        }
        if (!isNil(data.marketDepthMultiplier)) {
            this.marketDepthMultiplier = data.marketDepthMultiplier;
        }
        if (!isNil(data.marketImpactMultiplier)) {
            this.marketImpactMultiplier = data.marketImpactMultiplier;
        }
        if (!isNil(data.assetStressScenario)) {
            this.assetStressScenario = data.assetStressScenario;
        }
        this.stressAnalysisFlag = !isNil(data.stressAnalysisFlag) ? data.stressAnalysisFlag : StressLiquiditySettings.DEFAULT_STRESS_ANALYSIS_FLAG;
        this.tcostStressFlag = !isNil(data.tcostStressFlag) ? data.tcostStressFlag : StressLiquiditySettings.DEFAULT_TCOST_STRESS_FLAG;
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof StressLiquiditySettings)) {
            return false;
        }
        if (this.fixedCostMultiplier !== option.fixedCostMultiplier) {
            return false;
        }
        if (this.marketDepthMultiplier !== option.marketDepthMultiplier) {
            return false;
        }
        if (this.marketImpactMultiplier !== option.marketImpactMultiplier) {
            return false;
        }
        if (this.tcostStressFlag !== option.tcostStressFlag) {
            return false;
        }
        if (this.assetStressScenario !== option.assetStressScenario) {
            return false;
        }

        return (this.stressAnalysisFlag === option.stressAnalysisFlag);
    }

    /**
     * Add value to request params
     */
    addRequestParams(requestParam: any): void {
        requestParam.fixedCostMultiplier = this.fixedCostMultiplier;
        requestParam.marketDepthMultiplier = this.marketDepthMultiplier;
        requestParam.marketImpactMultiplier = this.marketImpactMultiplier;
        requestParam.stressAnalysisFlag = this.stressAnalysisFlag;
        requestParam.tcostStressFlag = this.tcostStressFlag;
        if (this.assetStressScenario && this.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO) {
            requestParam.assetStressScenario = this.assetStressScenario;
        }
    }
}
